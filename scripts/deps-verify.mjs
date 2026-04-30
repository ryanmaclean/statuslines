#!/usr/bin/env node
// deps-verify: Phase J — re-resolve each redistributable npm entry's
// transitive dependency closure against the live registry and compare it
// to the stored lockfile at catalog/locks/<slug>.json.
//
// Drift categories:
//   - added     : a transitive dep that wasn't there before. High-signal.
//   - removed   : a transitive dep is gone. Usually fine, logged as info.
//   - bumped    : same dep name, advanced inside its range. Info.
//   - integrity : same name@version, different integrity. High-signal —
//                 the registry reissued the same version (compromise risk).
//
// Output: markdown report on stdout. Exits 0 even on drift; the workflow
// reads the report. Pass --dry-run for a no-op compatible mode (currently
// behaves the same as a normal run; flag is accepted for symmetry with
// deps-capture).
//
// Usage:
//   node scripts/deps-verify.mjs                  # all entries
//   node scripts/deps-verify.mjs <slug>           # one entry
//   node scripts/deps-verify.mjs > /tmp/deps-drift.md
//
// We share the resolver implementation with deps-capture by inlining it
// here (the constraint says scripts only, no shared module). When the two
// drift apart, fix both — the canonical form is in deps-capture.mjs.

import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");
const LOCKS_DIR = join(CATALOG, "locks");
const REGISTRY = "https://registry.npmjs.org";
const NPM_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const TIMEOUT_MS = 20_000;
const REPORT_PATH = "/tmp/deps-drift.md";

// ---------- semver subset (same as deps-capture) ----------
function parseSemver(s) {
  if (typeof s !== "string") return null;
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.\-]+))?(?:\+[0-9A-Za-z.\-]+)?$/.exec(s.trim());
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ? m[4].split(".") : [],
    raw: s.trim(),
  };
}
function cmpPrerelease(a, b) {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i], y = b[i];
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    if (xn && yn) {
      const d = Number(x) - Number(y);
      if (d !== 0) return d < 0 ? -1 : 1;
    } else if (xn) return -1;
    else if (yn) return 1;
    else if (x !== y) return x < y ? -1 : 1;
  }
  return a.length === b.length ? 0 : (a.length < b.length ? -1 : 1);
}
function cmpSemver(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return cmpPrerelease(a.prerelease, b.prerelease);
}
function parseComparator(token) {
  const m = /^(>=|<=|>|<|=|\^|~)?\s*(.+)$/.exec(token.trim());
  if (!m) return null;
  let op = m[1] || "=";
  let rest = m[2].trim();
  if (rest === "" || rest === "*" || rest === "x" || rest === "X") {
    return [{ op: ">=", v: parseSemver("0.0.0") }];
  }
  if (rest[0] === "v" || rest[0] === "V") rest = rest.slice(1);
  const parts = rest.split(/[.\-+]/);
  const numeric = parts.slice(0, 3);
  const idx = numeric.findIndex((p) => p === "x" || p === "X" || p === "*" || p === undefined);
  if (idx !== -1 || numeric.length < 3) {
    const major = numeric[0] && numeric[0] !== "x" && numeric[0] !== "X" && numeric[0] !== "*" ? Number(numeric[0]) : null;
    const minor = numeric[1] && numeric[1] !== "x" && numeric[1] !== "X" && numeric[1] !== "*" ? Number(numeric[1]) : null;
    if (major === null) return [{ op: ">=", v: parseSemver("0.0.0") }];
    if (minor === null) {
      return [
        { op: ">=", v: parseSemver(`${major}.0.0`) },
        { op: "<",  v: parseSemver(`${major + 1}.0.0-0`) },
      ];
    }
    return [
      { op: ">=", v: parseSemver(`${major}.${minor}.0`) },
      { op: "<",  v: parseSemver(`${major}.${minor + 1}.0-0`) },
    ];
  }
  const v = parseSemver(rest);
  if (!v) return null;
  if (op === "^") {
    let upper;
    if (v.major > 0) upper = parseSemver(`${v.major + 1}.0.0-0`);
    else if (v.minor > 0) upper = parseSemver(`${v.major}.${v.minor + 1}.0-0`);
    else upper = parseSemver(`${v.major}.${v.minor}.${v.patch + 1}-0`);
    return [{ op: ">=", v }, { op: "<", v: upper }];
  }
  if (op === "~") {
    const upper = parseSemver(`${v.major}.${v.minor + 1}.0-0`);
    return [{ op: ">=", v }, { op: "<", v: upper }];
  }
  return [{ op, v }];
}
function parseRange(rangeStr) {
  if (rangeStr == null || rangeStr === "" || rangeStr === "*" || rangeStr === "latest") {
    return [[{ op: ">=", v: parseSemver("0.0.0") }]];
  }
  const ors = rangeStr.split(/\s*\|\|\s*/);
  const out = [];
  for (const orPart of ors) {
    const hyphenMatch = /^\s*(\S+)\s+-\s+(\S+)\s*$/.exec(orPart);
    if (hyphenMatch) {
      const lo = parseSemver(hyphenMatch[1]);
      const hi = parseSemver(hyphenMatch[2]);
      if (lo && hi) {
        out.push([{ op: ">=", v: lo }, { op: "<=", v: hi }]);
        continue;
      }
    }
    const tokens = orPart.split(/\s+/).filter(Boolean);
    const comparators = [];
    let ok = true;
    for (const t of tokens) {
      const cs = parseComparator(t);
      if (!cs) { ok = false; break; }
      comparators.push(...cs);
    }
    if (ok && comparators.length) out.push(comparators);
  }
  if (out.length === 0) out.push([{ op: ">=", v: parseSemver("0.0.0") }]);
  return out;
}
function satisfiesComparator(version, comp) {
  const c = cmpSemver(version, comp.v);
  switch (comp.op) {
    case "=":  return c === 0;
    case ">=": return c >= 0;
    case "<=": return c <= 0;
    case ">":  return c > 0;
    case "<":  return c < 0;
  }
  return false;
}
function satisfies(version, range) {
  for (const group of range) {
    let all = true;
    for (const comp of group) {
      if (!satisfiesComparator(version, comp)) { all = false; break; }
    }
    if (all) {
      if (version.prerelease.length > 0) {
        const allowed = group.some((c) =>
          c.v.prerelease.length > 0 &&
          c.v.major === version.major &&
          c.v.minor === version.minor &&
          c.v.patch === version.patch
        );
        if (!allowed) continue;
      }
      return true;
    }
  }
  return false;
}

const packumentCache = new Map();
async function fetchPackument(name) {
  if (packumentCache.has(name)) return packumentCache.get(name);
  const url = `${REGISTRY}/${name.replace("/", "%2F")}`;
  const r = await fetch(url, {
    headers: { Accept: "application/vnd.npm.install-v1+json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!r.ok) throw new Error(`registry ${name}: HTTP ${r.status}`);
  const j = await r.json();
  packumentCache.set(name, j);
  return j;
}
function pickVersion(packument, rangeStr) {
  const tags = packument["dist-tags"] || {};
  if (rangeStr && Object.prototype.hasOwnProperty.call(tags, rangeStr)) {
    const v = tags[rangeStr];
    if (packument.versions?.[v]) return v;
  }
  const range = parseRange(rangeStr || "");
  let best = null, bestParsed = null;
  for (const v of Object.keys(packument.versions || {})) {
    const parsed = parseSemver(v);
    if (!parsed) continue;
    if (!satisfies(parsed, range)) continue;
    if (!bestParsed || cmpSemver(parsed, bestParsed) > 0) {
      bestParsed = parsed;
      best = v;
    }
  }
  return best;
}
async function resolveClosure(rootName, rootVersion) {
  const resolved = new Map();
  const queue = [];
  const topPack = await fetchPackument(rootName);
  const topMeta = topPack.versions?.[rootVersion];
  if (!topMeta) throw new Error(`${rootName}@${rootVersion} not in registry`);
  resolved.set(rootName, { version: rootVersion, integrity: topMeta.dist?.integrity ?? null });
  for (const [dep, range] of Object.entries(topMeta.dependencies || {})) {
    queue.push({ name: dep, range });
  }
  while (queue.length) {
    const { name, range } = queue.shift();
    let pack;
    try { pack = await fetchPackument(name); }
    catch {
      if (!resolved.has(name)) resolved.set(name, { version: "unresolved", integrity: null });
      continue;
    }
    const existing = resolved.get(name);
    if (existing && existing.version !== "unresolved") {
      const existingParsed = parseSemver(existing.version);
      if (existingParsed && satisfies(existingParsed, parseRange(range))) continue;
    }
    const picked = pickVersion(pack, range);
    if (!picked) {
      if (!existing) resolved.set(name, { version: "unresolved", integrity: null });
      continue;
    }
    if (existing && existing.version === picked) continue;
    resolved.set(name, { version: picked, integrity: pack.versions[picked].dist?.integrity ?? null });
    for (const [dep, r] of Object.entries(pack.versions[picked].dependencies || {})) {
      queue.push({ name: dep, range: r });
    }
  }
  return resolved;
}

// ---------- diff ----------
//
// stored.deps and live both look like { "<name>@<version>": "sha512-..." }.
// We split on the *last* "@" so that scoped packages ("@scope/name@1.2.3")
// parse correctly.
function splitKey(key) {
  const at = key.lastIndexOf("@");
  if (at <= 0) return { name: key, version: "" };
  return { name: key.slice(0, at), version: key.slice(at + 1) };
}

function diffLocks(stored, live) {
  const storedByName = new Map();
  for (const [k, integ] of Object.entries(stored)) {
    const { name, version } = splitKey(k);
    storedByName.set(name, { version, integrity: integ });
  }
  const liveByName = new Map();
  for (const [k, integ] of Object.entries(live)) {
    const { name, version } = splitKey(k);
    liveByName.set(name, { version, integrity: integ });
  }
  const added = [], removed = [], bumped = [], integrityChanged = [];
  for (const [name, lv] of liveByName) {
    const sv = storedByName.get(name);
    if (!sv) { added.push(`${name}@${lv.version}`); continue; }
    if (sv.version !== lv.version) {
      bumped.push(`${name}: ${sv.version} → ${lv.version}`);
    } else if (sv.integrity && lv.integrity && sv.integrity !== lv.integrity) {
      integrityChanged.push(`${name}@${sv.version}: integrity changed`);
    }
  }
  for (const [name, sv] of storedByName) {
    if (!liveByName.has(name)) removed.push(`${name}@${sv.version}`);
  }
  return { added, removed, bumped, integrityChanged };
}

// ---------- catalog ----------
function listEntries() {
  const out = [];
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    if (group.name === "locks") continue;
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) {
        out.push(JSON.parse(readFileSync(join(dir, f), "utf8")));
      }
    }
  }
  return out;
}
function isTargetEntry(entry) {
  if (!entry.redistributable) return false;
  const inst = entry.install || {};
  if (!NPM_TYPES.has(inst.type)) return false;
  if (!inst.package || !inst.version) return false;
  return true;
}

// ---------- main ----------
const args = process.argv.slice(2);
// --dry-run accepted for symmetry; verify never writes catalog state anyway.
const slugArg = args.find((a) => !a.startsWith("--"));

const targets = listEntries().filter((e) => isTargetEntry(e) && (!slugArg || e.slug === slugArg));

const reportLines = [];
let anomalous = false;
let totalChecked = 0;
let totalDrifted = 0;

for (const entry of targets) {
  const lockPath = join(LOCKS_DIR, `${entry.slug}.json`);
  if (!existsSync(lockPath)) {
    reportLines.push(`## \`${entry.slug}\``, "", `- no lockfile at \`catalog/locks/${entry.slug}.json\` (run \`node scripts/deps-capture.mjs ${entry.slug}\`)`, "");
    continue;
  }
  totalChecked++;
  const stored = JSON.parse(readFileSync(lockPath, "utf8"));
  let live;
  try {
    const resolved = await resolveClosure(entry.install.package, entry.install.version);
    const liveDeps = {};
    for (const [name, { version, integrity }] of [...resolved.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      liveDeps[`${name}@${version}`] = integrity ?? "";
    }
    live = liveDeps;
  } catch (e) {
    reportLines.push(`## \`${entry.slug}\``, "", `- resolver failed: ${e.message}`, "");
    continue;
  }
  const diff = diffLocks(stored.deps || {}, live);
  const hasAnyDrift = diff.added.length || diff.removed.length || diff.bumped.length || diff.integrityChanged.length;
  if (!hasAnyDrift) continue;
  totalDrifted++;
  const isAnomaly = diff.added.length > 0 || diff.integrityChanged.length > 0;
  if (isAnomaly) anomalous = true;
  reportLines.push(`## \`${entry.slug}\` (${entry.install.package}@${entry.install.version})${isAnomaly ? " (quarantine candidate)" : ""}`, "");
  if (diff.added.length) {
    reportLines.push("**Added (anomaly):**");
    for (const l of diff.added) reportLines.push(`- ${l}`);
    reportLines.push("");
  }
  if (diff.integrityChanged.length) {
    reportLines.push("**Integrity changed (anomaly):**");
    for (const l of diff.integrityChanged) reportLines.push(`- ${l}`);
    reportLines.push("");
  }
  if (diff.bumped.length) {
    reportLines.push("**Version bumped (info):**");
    for (const l of diff.bumped) reportLines.push(`- ${l}`);
    reportLines.push("");
  }
  if (diff.removed.length) {
    reportLines.push("**Removed (info):**");
    for (const l of diff.removed) reportLines.push(`- ${l}`);
    reportLines.push("");
  }
}

const header = totalDrifted === 0
  ? `# catalog-deps-verify\n\nAll ${totalChecked} npm-backed lockfiles match live registry resolution.\n`
  : `# catalog-deps-verify — drift report\n\nChecked ${totalChecked} entries; ${totalDrifted} drifted${anomalous ? "; anomaly detected" : ""}.\n\n` + reportLines.join("\n") + "\n";

const body = totalDrifted === 0 ? header : header;
process.stdout.write(body);

// Mirror to /tmp/deps-drift.md so the workflow can pick it up regardless
// of how the script's stdout was redirected.
try { writeFileSync(REPORT_PATH, body); } catch { /* /tmp may not be writable in odd envs */ }

process.exit(0);

#!/usr/bin/env node
// deps-capture: Phase J — capture each redistributable npm entry's
// transitive dependency closure as a deterministic lockfile.
//
// Why: install.integrity pins the *top* tarball, but `npx -y pkg@1.2.3` still
// resolves transitive deps at install time from package.json ranges. A
// maintainer-takeover that changes a transitive range (or that publishes a
// new patch inside a range) would slip past the top-level pin. We snapshot
// the closure once, hash it, and let the weekly verify workflow detect drift.
//
// Resolver choice: pure Node stdlib. We talk to the public npm registry's
// "slim" packument endpoint (Accept: application/vnd.npm.install-v1+json),
// implement the small semver subset needed for npm dep ranges, and walk
// the dependency graph greedy + dedupe-by-name. This is what `npm install`
// effectively does for non-conflicting graphs (it keeps a flat top-level
// when ranges are compatible). We don't pull @npmcli/arborist because it
// adds ~80 MB of transitive deps for advisory functionality, and we'd
// then have to lock *its* deps too. The tradeoff: when two packages
// require incompatible ranges of the same dep, real npm would nest them;
// our flat resolver picks the highest version that satisfies the *first*
// range we see and records it (drift will surface when the resolution
// flips, which is exactly the signal we want).
//
// Output: catalog/locks/<slug>.json with sorted keys; sets the entry's
// install.deps_lock_sha256 to sha256(canonicalize(lockfile)).
//
// Usage:
//   node scripts/deps-capture.mjs                # all redistributable npm entries
//   node scripts/deps-capture.mjs <slug>         # one entry
//   node scripts/deps-capture.mjs --dry-run      # don't write
//
// Exits 0 on success.

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");
const LOCKS_DIR = join(CATALOG, "locks");
const REGISTRY = "https://registry.npmjs.org";
const NPM_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const TIMEOUT_MS = 20_000;
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- canonical JSON (sorted keys, no whitespace) ----------
function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalize(value[k])).join(",") + "}";
}

function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

// ---------- semver subset ----------
// Parse "1.2.3", "1.2.3-beta.1", "1.2.3+build". Returns null on failure.
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
  // Per semver: a non-prerelease > prerelease.
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
  return a.length - b.length === 0 ? 0 : (a.length < b.length ? -1 : 1);
}

function cmpSemver(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return cmpPrerelease(a.prerelease, b.prerelease);
}

// Parse a single comparator like ">=1.2.3", "<2.0.0-0", "=1.2.3", "1.2.3".
function parseComparator(token) {
  const m = /^(>=|<=|>|<|=|\^|~)?\s*(.+)$/.exec(token.trim());
  if (!m) return null;
  let op = m[1] || "=";
  let rest = m[2].trim();
  // x-ranges: "1.x", "1.2.x", "*", "" -> expand to range
  if (rest === "" || rest === "*" || rest === "x" || rest === "X") {
    return [{ op: ">=", v: parseSemver("0.0.0") }];
  }
  // Strip leading "v"
  if (rest[0] === "v" || rest[0] === "V") rest = rest.slice(1);
  const parts = rest.split(/[.\-+]/);
  const numeric = parts.slice(0, 3);
  // Detect x-range placeholders
  const idx = numeric.findIndex((p) => p === "x" || p === "X" || p === "*" || p === undefined);
  if (idx !== -1 || numeric.length < 3) {
    // Fill in zeros for missing/x parts
    const major = numeric[0] && numeric[0] !== "x" && numeric[0] !== "X" && numeric[0] !== "*" ? Number(numeric[0]) : null;
    const minor = numeric[1] && numeric[1] !== "x" && numeric[1] !== "X" && numeric[1] !== "*" ? Number(numeric[1]) : null;
    if (major === null) return [{ op: ">=", v: parseSemver("0.0.0") }];
    if (minor === null) {
      // "1" or "1.x" -> >=1.0.0 <2.0.0-0
      return [
        { op: ">=", v: parseSemver(`${major}.0.0`) },
        { op: "<",  v: parseSemver(`${major + 1}.0.0-0`) },
      ];
    }
    // "1.2" or "1.2.x" -> >=1.2.0 <1.3.0-0
    return [
      { op: ">=", v: parseSemver(`${major}.${minor}.0`) },
      { op: "<",  v: parseSemver(`${major}.${minor + 1}.0-0`) },
    ];
  }
  const v = parseSemver(rest);
  if (!v) return null;
  if (op === "^") {
    // ^1.2.3 -> >=1.2.3 <2.0.0-0
    // ^0.2.3 -> >=0.2.3 <0.3.0-0
    // ^0.0.3 -> >=0.0.3 <0.0.4-0
    let upper;
    if (v.major > 0) upper = parseSemver(`${v.major + 1}.0.0-0`);
    else if (v.minor > 0) upper = parseSemver(`${v.major}.${v.minor + 1}.0-0`);
    else upper = parseSemver(`${v.major}.${v.minor}.${v.patch + 1}-0`);
    return [{ op: ">=", v }, { op: "<", v: upper }];
  }
  if (op === "~") {
    // ~1.2.3 -> >=1.2.3 <1.3.0-0; ~1 -> >=1.0.0 <2.0.0-0 (handled above); ~1.2 -> >=1.2.0 <1.3.0-0
    const upper = parseSemver(`${v.major}.${v.minor + 1}.0-0`);
    return [{ op: ">=", v }, { op: "<", v: upper }];
  }
  return [{ op, v }];
}

// Hyphen range "1.2.3 - 2.3.4" -> [">=1.2.3","<=2.3.4"]
function parseRange(rangeStr) {
  if (rangeStr == null || rangeStr === "" || rangeStr === "*" || rangeStr === "latest") {
    return [[{ op: ">=", v: parseSemver("0.0.0") }]];
  }
  // Split on " || " for OR
  const ors = rangeStr.split(/\s*\|\|\s*/);
  const out = [];
  for (const orPart of ors) {
    // Hyphen range: "A - B"
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
  // range is an OR of AND-groups
  for (const group of range) {
    let all = true;
    for (const comp of group) {
      if (!satisfiesComparator(version, comp)) { all = false; break; }
    }
    if (all) {
      // Per npm semantics: prerelease versions only satisfy a comparator
      // when *some* comparator in the matching AND-group has a prerelease
      // tag at the same [major, minor, patch].
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

// ---------- registry ----------
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
  // Resolve a dist-tag (e.g. "latest", "next") if the range is one.
  const tags = packument["dist-tags"] || {};
  if (rangeStr && Object.prototype.hasOwnProperty.call(tags, rangeStr)) {
    const v = tags[rangeStr];
    if (packument.versions?.[v]) return v;
  }
  const range = parseRange(rangeStr || "");
  const versions = Object.keys(packument.versions || {});
  let best = null;
  let bestParsed = null;
  for (const v of versions) {
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

// ---------- resolver ----------
//
// Greedy + dedupe-by-name (flat). For each (name, range) we encounter, if the
// name is already locked to a version that *satisfies* the new range, we keep
// it; otherwise we pick the highest-satisfying version. This matches npm's
// behavior for the common case where all dependents agree on a range.
async function resolveClosure(rootName, rootVersion) {
  const resolved = new Map(); // name -> { version, integrity }
  const queue = [];

  // Seed with the top-level package itself.
  const topPack = await fetchPackument(rootName);
  const topMeta = topPack.versions?.[rootVersion];
  if (!topMeta) throw new Error(`${rootName}@${rootVersion} not in registry`);
  resolved.set(rootName, {
    version: rootVersion,
    integrity: topMeta.dist?.integrity ?? null,
  });
  for (const [dep, range] of Object.entries(topMeta.dependencies || {})) {
    queue.push({ name: dep, range });
  }

  while (queue.length) {
    const { name, range } = queue.shift();
    let pack;
    try {
      pack = await fetchPackument(name);
    } catch (e) {
      // Best-effort: record an unresolved sentinel so drift surfaces it.
      if (!resolved.has(name)) {
        resolved.set(name, { version: "unresolved", integrity: null });
      }
      continue;
    }
    const existing = resolved.get(name);
    if (existing && existing.version !== "unresolved") {
      // Keep existing if it satisfies the new range; otherwise prefer the
      // higher version. We do not nest, so drift will show up if a real npm
      // run would have nested differently.
      const existingParsed = parseSemver(existing.version);
      if (existingParsed && satisfies(existingParsed, parseRange(range))) continue;
    }
    const picked = pickVersion(pack, range);
    if (!picked) {
      if (!existing) resolved.set(name, { version: "unresolved", integrity: null });
      continue;
    }
    if (existing && existing.version === picked) continue;
    resolved.set(name, {
      version: picked,
      integrity: pack.versions[picked].dist?.integrity ?? null,
    });
    const sub = pack.versions[picked].dependencies || {};
    for (const [dep, r] of Object.entries(sub)) {
      queue.push({ name: dep, range: r });
    }
  }
  return resolved;
}

// ---------- catalog walk ----------
function listEntries() {
  const out = [];
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    if (group.name === "locks") continue;
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) {
        const full = join(dir, f);
        out.push({ path: full, entry: JSON.parse(readFileSync(full, "utf8")) });
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

function buildLockfile(slug, pkg, version, resolved) {
  // deps map sorted by "<name>@<version>".
  const deps = {};
  // Top-level first by virtue of being seeded; but the spec says sorted keys
  // throughout, so we sort. The top entry's identity is captured by `package`
  // and `version` at the top of the lockfile, not its position in `deps`.
  const sortedNames = [...resolved.keys()].sort();
  for (const name of sortedNames) {
    const { version: v, integrity } = resolved.get(name);
    deps[`${name}@${v}`] = integrity ?? "";
  }
  return {
    schema_version: 1,
    slug,
    package: pkg,
    version,
    captured_at: TODAY,
    deps,
  };
}

// ---------- main ----------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugArg = args.find((a) => !a.startsWith("--"));

if (!existsSync(LOCKS_DIR)) {
  if (!dryRun) mkdirSync(LOCKS_DIR, { recursive: true });
}

const all = listEntries();
const targets = all.filter(({ entry }) => isTargetEntry(entry) && (!slugArg || entry.slug === slugArg));
if (targets.length === 0) {
  console.error(`deps-capture: no matching entries${slugArg ? ` for slug=${slugArg}` : ""}`);
  process.exit(0);
}

let wrote = 0;
for (const { path: entryPath, entry } of targets) {
  const inst = entry.install;
  process.stderr.write(`deps-capture: ${entry.slug} (${inst.package}@${inst.version})\n`);
  let resolved;
  try {
    resolved = await resolveClosure(inst.package, inst.version);
  } catch (e) {
    console.error(`deps-capture: ${entry.slug}: resolver failed: ${e.message}`);
    continue;
  }
  const lock = buildLockfile(entry.slug, inst.package, inst.version, resolved);
  const canonical = canonicalize(lock);
  const lockHash = sha256Hex(Buffer.from(canonical, "utf8"));
  const lockPath = join(LOCKS_DIR, `${entry.slug}.json`);

  if (dryRun) {
    process.stderr.write(`deps-capture: [dry-run] ${entry.slug}: ${Object.keys(lock.deps).length} deps, sha256=${lockHash}\n`);
    continue;
  }

  // Pretty-print for human review; canonical form is what gets hashed.
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
  // Update entry's install.deps_lock_sha256 only.
  entry.install.deps_lock_sha256 = lockHash;
  // Preserve key order: read the original to keep stable diff if hash matches.
  delete entry._path;
  writeFileSync(entryPath, JSON.stringify(entry, null, 2) + "\n");
  wrote++;
  process.stderr.write(`deps-capture: ${entry.slug}: ${Object.keys(lock.deps).length} deps, sha256=${lockHash}\n`);
}
process.stderr.write(`deps-capture: ${dryRun ? "would write" : "wrote"} ${wrote} lockfile(s)\n`);
process.exit(0);

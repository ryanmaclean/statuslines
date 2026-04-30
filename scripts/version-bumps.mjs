#!/usr/bin/env node
// version-bumps: weekly bot that proposes catalog version bumps for npm-
// backed entries. For each redistributable entry with a pinned version, fetch
// dist-tags.latest, download both tarballs, run tarball-diff, and either:
//   - update the entry in place (clean diff), or
//   - leave it pinned and report the finding under quarantined-from-bump
//     (dirty diff: new lifecycle script, new top-level domain, license drift).
//
// Output report lands at /tmp/version-bumps.md; the GitHub workflow uses it
// as the PR body.
//
// Mirrors bin/statuslines.js:cmdAudit for npm-registry handling and the
// `<pkg>@<old>` rewrite in configs.<cli>; we deliberately re-implement
// rather than import to keep this script self-contained for CI.

import { readdir, readFile, writeFile, mkdtemp } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { diffTarballs } from "./tarball-diff.mjs";

const ROOT = new URL("../catalog/", import.meta.url);
const NPM_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const TODAY = new Date().toISOString().slice(0, 10);
const TIMEOUT_MS = 20_000;
const REPORT_PATH = "/tmp/version-bumps.md";

// quarantine triggers: any of these flag substrings cause us to NOT advance
// the pin. (TRIZ "the other way round" — don't auto-merge into the new
// version, advance only when the diff is clean.)
const QUARANTINE_PATTERNS = [
  /^new (preinstall|install|postinstall|prepare) script$/,
  /^changed (preinstall|install|postinstall|prepare) script$/,
  /^new domain /,
  /^license changed$/,
  /^license file removed$/,
];

function shouldQuarantine(flags) {
  return flags.some((f) => QUARANTINE_PATTERNS.some((re) => re.test(f)));
}

async function listEntryFiles() {
  const out = [];
  for (const cli of await readdir(ROOT, { withFileTypes: true })) {
    if (!cli.isDirectory()) continue;
    const dir = new URL(cli.name + "/", ROOT);
    for (const f of await readdir(dir)) {
      if (f.endsWith(".json")) out.push(fileURLToPath(new URL(f, dir)));
    }
  }
  return out.sort();
}

async function fetchJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

async function fetchBuffer(url, dest) {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(dest, buf);
  return dest;
}

function detectInstallScripts(scripts) {
  if (!scripts || typeof scripts !== "object") return false;
  for (const k of ["preinstall", "install", "postinstall", "prepare"]) {
    if (typeof scripts[k] === "string" && scripts[k].length > 0) return true;
  }
  return false;
}

function rewriteConfigs(entry, pkg, oldVer, newVer) {
  if (!entry.configs) return;
  const escPkg = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escOld = oldVer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escPkg}@${escOld}`, "g");
  for (const cli of Object.keys(entry.configs)) {
    let flat = JSON.stringify(entry.configs[cli]);
    flat = flat.replace(re, `${pkg}@${newVer}`);
    entry.configs[cli] = JSON.parse(flat);
  }
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const onlySlug = argv.find((a) => !a.startsWith("--"));
  return { dryRun, onlySlug };
}

async function processEntry(file, opts, scratch) {
  const raw = await readFile(file, "utf8");
  const entry = JSON.parse(raw);
  if (opts.onlySlug && entry.slug !== opts.onlySlug) return null;
  const inst = entry.install || {};
  if (!NPM_TYPES.has(inst.type)) return null;
  if (!inst.package || !inst.version) return null;
  if (entry.redistributable !== true) return null;

  const pkg = inst.package;
  const oldVer = inst.version;

  const meta = await fetchJson(
    `https://registry.npmjs.org/${pkg.replace("/", "%2F")}`,
  );
  const latest = meta?.["dist-tags"]?.latest;
  if (!latest) throw new Error("no dist-tags.latest");
  if (latest === oldVer) return null;

  const oldDist = meta.versions?.[oldVer]?.dist;
  const newDist = meta.versions?.[latest]?.dist;
  if (!newDist?.tarball) throw new Error(`no tarball URL for ${pkg}@${latest}`);

  const oldTgz = join(scratch, `${entry.slug}-old.tgz`);
  const newTgz = join(scratch, `${entry.slug}-new.tgz`);
  // old version may be unpublished; tolerate missing old tarball by falling
  // back to an empty-diff (we still surface the bump, just without delta).
  let diffMd = "_old tarball unavailable; no structural diff_";
  let flags = [];
  try {
    if (!oldDist?.tarball) throw new Error("old tarball URL missing");
    await fetchBuffer(oldDist.tarball, oldTgz);
    await fetchBuffer(newDist.tarball, newTgz);
    const out = await diffTarballs(oldTgz, newTgz);
    diffMd = out.markdown;
    flags = out.flags;
  } catch (err) {
    diffMd = `_diff unavailable: ${err.message}_`;
  }

  const quarantineThis = shouldQuarantine(flags);
  const newMetaVer = meta.versions?.[latest] || {};
  const newScripts = newMetaVer.scripts;
  const newLicense = newMetaVer.license ?? meta.license ?? null;
  const newIntegrity = newDist?.integrity ?? null;

  let action;
  if (quarantineThis) {
    action = "quarantined";
  } else {
    action = "bumped";
    entry.install.version = latest;
    if (newIntegrity) entry.install.integrity = newIntegrity;
    entry.security = entry.security || {};
    entry.security.has_install_scripts = detectInstallScripts(newScripts);
    entry.security.license_observed = newLicense;
    entry.security.last_audit = TODAY;
    rewriteConfigs(entry, pkg, oldVer, latest);
    if (!opts.dryRun) {
      await writeFile(file, JSON.stringify(entry, null, 2) + "\n");
    }
  }

  return {
    slug: entry.slug,
    pkg,
    oldVer,
    newVer: latest,
    diffMd,
    flags,
    action,
  };
}

function renderReport(results) {
  const bumped = results.filter((r) => r.action === "bumped");
  const quarantined = results.filter((r) => r.action === "quarantined");
  const lines = [];
  lines.push("# catalog: weekly version-bump report");
  lines.push("");
  lines.push(`Run date: ${TODAY}`);
  lines.push(`Bumped: ${bumped.length}; quarantined-from-bump: ${quarantined.length}`);
  lines.push("");
  if (bumped.length === 0 && quarantined.length === 0) {
    lines.push("_No upstream movement on any pinned npm-backed entry._");
    return lines.join("\n") + "\n";
  }
  if (bumped.length > 0) {
    lines.push("## bumped");
    lines.push("");
    for (const r of bumped) {
      lines.push(`### \`${r.slug}\`: \`${r.pkg}\` ${r.oldVer} → ${r.newVer}`);
      lines.push("");
      lines.push(r.diffMd);
      if (r.flags.length) lines.push(`\n_advisory flags: ${r.flags.join("; ")}_`);
      lines.push("");
    }
  }
  if (quarantined.length > 0) {
    lines.push("## quarantined-from-bump");
    lines.push("");
    lines.push("These entries had a new upstream release whose tarball-diff tripped a quarantine trigger (new lifecycle script, new top-level domain, or license drift). The pin was **not** advanced; review the diff and either bump manually with `audit` or quarantine the entry outright.");
    lines.push("");
    for (const r of quarantined) {
      lines.push(`### \`${r.slug}\`: \`${r.pkg}\` ${r.oldVer} → ${r.newVer} (!)`);
      lines.push("");
      lines.push(r.diffMd);
      lines.push(`\n_quarantine flags: ${r.flags.join("; ")}_`);
      lines.push("");
    }
  }
  return lines.join("\n") + "\n";
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const scratch = await mkdtemp(join(tmpdir(), "version-bumps-"));
  const files = await listEntryFiles();
  const results = [];
  let scanned = 0, errored = 0;
  for (const f of files) {
    try {
      const r = await processEntry(f, opts, scratch);
      if (r) results.push(r);
      scanned++;
    } catch (err) {
      errored++;
      process.stderr.write(`version-bumps: ${f}: ${err.message}\n`);
    }
  }
  const md = renderReport(results);
  await writeFile(REPORT_PATH, md);
  const tag = opts.dryRun ? " (dry-run)" : "";
  process.stdout.write(
    `version-bumps${tag}: scanned=${scanned} bumped=${results.filter((r) => r.action === "bumped").length} quarantined=${results.filter((r) => r.action === "quarantined").length} errored=${errored}\n`,
  );
  process.stdout.write(`report: ${REPORT_PATH}\n`);
  // exit 1 only on transport/parse errors that prevented the run; per-entry
  // errors (skipped above) don't fail the workflow.
}

await main();

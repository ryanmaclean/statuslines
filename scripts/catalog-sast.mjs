#!/usr/bin/env node
// catalog-sast: per-entry SAST sweep against every redistributable catalog
// entry's upstream code.
//
// For each catalog/<cli>/<slug>.json with redistributable === true:
//   1. Resolve upstream code into a temp dir:
//        - npx / npm-global / opencode-plugin → npm pack <pkg>@<version>, untar
//        - brew / manual / cargo (with repo)  → git clone --depth 1 <repo>
//        - git                                 → git clone --depth 1 <repo>
//        - otherwise: skip
//   2. Run `datadog-static-analyzer` against the dir, with the repo's
//      code-security.datadog.yaml as configuration (it carries the same
//      ruleset list we use for self-scans). SARIF is written to a temp file.
//      The analyzer binary is open-source; running it locally does NOT
//      require DD_API_KEY. The workflow may upload the SARIF afterward
//      when DD_API_KEY is set, but that is independent of this script.
//   3. Parse SARIF: count results by `level`. SARIF severity mapping per
//      Datadog (https://docs.datadoghq.com/security/code_security/static_analysis/):
//        high/critical → SARIF "error"
//        medium        → SARIF "warning"
//        low/notice    → SARIF "note"
//      `sast_findings_he` (high-or-above) = count of `error`-level results.
//   4. Patch entry.security with last_sast_scan, sast_findings_he,
//      sast_findings_total, sast_scanner. If sast_findings_he >= 1 and the
//      entry isn't already quarantined for some other reason, also flip
//      security.quarantined / .quarantine_reason / .quarantined_at.
//   5. Write back only when the JSON content actually changed.
//
// Per-entry timeout: 5 min. On timeout, set security.sast_scan_status =
// "timeout" and continue (no quarantine, no findings recorded).
//
// CLI:
//   node scripts/catalog-sast.mjs              scan all redistributable entries
//   node scripts/catalog-sast.mjs <slug>       scan one entry
//   node scripts/catalog-sast.mjs --dry-run    do everything but write JSON
//
// Exit: 0 normally (findings are not a script-level failure). Exit 1 only
// on errors that block reliable judgement (analyzer not on PATH, npm/git
// missing, fundamental I/O failures).

import { readdir, readFile, writeFile, mkdtemp, rm, stat } from "node:fs/promises";
import { spawnSync, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");
const CONFIG = join(ROOT, "code-security.datadog.yaml");
const TODAY = new Date().toISOString().slice(0, 10);
const NPM_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const REPO_TYPES = new Set(["brew", "manual", "cargo", "git"]);
const PER_ENTRY_TIMEOUT_MS = 5 * 60 * 1000;
const ANALYZER = "datadog-static-analyzer";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlySlug = args.find((a) => !a.startsWith("--")) ?? null;

function which(cmd) {
  const r = spawnSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

function analyzerVersion() {
  try {
    const out = execFileSync(ANALYZER, ["--version"], { encoding: "utf8", timeout: 10_000 });
    // datadog-static-analyzer prints e.g. "datadog-static-analyzer 0.5.5"
    const m = out.match(/(\d+\.\d+\.\d+(?:[-+][\w.]+)?)/);
    return m ? m[1] : out.trim().split(/\s+/).pop() || "unknown";
  } catch {
    return null;
  }
}

async function listEntries() {
  const out = [];
  for (const group of await readdir(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const dir = join(CATALOG, group.name);
    for (const f of await readdir(dir)) {
      if (f.endsWith(".json")) out.push(join(dir, f));
    }
  }
  return out;
}

async function makeTempDir(prefix) {
  return await mkdtemp(join(tmpdir(), `catalog-sast-${prefix}-`));
}

async function fetchNpmTarball(pkg, version, destDir) {
  // Use `npm pack` which downloads + verifies registry integrity.
  const r = spawnSync(
    "npm",
    ["pack", "--silent", "--pack-destination", destDir, `${pkg}@${version}`],
    { encoding: "utf8", timeout: 90_000 }
  );
  if (r.status !== 0) {
    throw new Error(`npm pack failed: ${(r.stderr || "").trim() || `exit ${r.status}`}`);
  }
  const tarball = (r.stdout || "").trim().split("\n").pop();
  if (!tarball) throw new Error("npm pack returned no tarball name");
  const tarballPath = join(destDir, tarball);
  // Extract with tar; npm tarballs have a top-level "package/" prefix.
  const extractDir = join(destDir, "package-src");
  spawnSync("mkdir", ["-p", extractDir]);
  const x = spawnSync(
    "tar",
    ["-xzf", tarballPath, "-C", extractDir, "--strip-components=1"],
    { encoding: "utf8", timeout: 60_000 }
  );
  if (x.status !== 0) {
    throw new Error(`tar extract failed: ${(x.stderr || "").trim() || `exit ${x.status}`}`);
  }
  return extractDir;
}

function gitClone(repo, dest) {
  const r = spawnSync(
    "git",
    ["clone", "--depth", "1", "--quiet", repo, dest],
    { encoding: "utf8", timeout: 120_000 }
  );
  if (r.status !== 0) {
    throw new Error(`git clone failed: ${(r.stderr || "").trim() || `exit ${r.status}`}`);
  }
  return dest;
}

async function resolveSource(entry, workdir) {
  const inst = entry.install || {};
  if (NPM_TYPES.has(inst.type) && inst.package && inst.version) {
    return await fetchNpmTarball(inst.package, inst.version, workdir);
  }
  if (REPO_TYPES.has(inst.type) && entry.repo) {
    const dest = join(workdir, "repo-src");
    return gitClone(entry.repo, dest);
  }
  return null;
}

function runAnalyzer(srcDir, sarifPath) {
  // Open-source mode: no API key required. We pass the repo's
  // code-security.datadog.yaml as the config; the analyzer falls back to
  // its built-in defaults if the file is missing.
  const cliArgs = [
    "--directory", srcDir,
    "--format", "sarif",
    "--output", sarifPath,
  ];
  // Pass --config-file only when the file exists, else let the analyzer
  // pick up defaults.
  try {
    const s = spawnSync("test", ["-f", CONFIG]);
    if (s.status === 0) {
      cliArgs.push("--config-file", CONFIG);
    }
  } catch { /* ignore */ }

  const r = spawnSync(ANALYZER, cliArgs, {
    encoding: "utf8",
    timeout: PER_ENTRY_TIMEOUT_MS,
  });
  // datadog-static-analyzer exits non-zero on internal errors but zero when
  // it merely *finds* issues. Treat ETIMEDOUT (signal SIGTERM) as a timeout.
  if (r.error && /timed out/i.test(r.error.message || "")) {
    return { status: "timeout" };
  }
  if (r.signal === "SIGTERM" || r.signal === "SIGKILL") {
    return { status: "timeout" };
  }
  if (r.status !== 0 && r.status !== null) {
    // Some non-zero codes (e.g. 1) just mean "findings exist"; the SARIF
    // file is still valid in that case. Only escalate when no SARIF
    // appeared.
    // Caller will check sarif file existence below.
  }
  return { status: "ok" };
}

async function parseSarif(sarifPath) {
  let raw;
  try { raw = await readFile(sarifPath, "utf8"); }
  catch { return null; }
  let doc;
  try { doc = JSON.parse(raw); } catch { return null; }
  const runs = Array.isArray(doc.runs) ? doc.runs : [];
  let total = 0, error = 0, warning = 0, note = 0;
  for (const run of runs) {
    const results = Array.isArray(run.results) ? run.results : [];
    for (const r of results) {
      total += 1;
      const lvl = (r.level || "warning").toLowerCase();
      if (lvl === "error") error += 1;
      else if (lvl === "warning") warning += 1;
      else if (lvl === "note") note += 1;
    }
  }
  return { total, error, warning, note };
}

async function scanEntry(entryPath, scannerLabel) {
  const entry = JSON.parse(await readFile(entryPath, "utf8"));
  if (entry.redistributable !== true) return { skipped: "non-redistributable" };
  if (onlySlug && entry.slug !== onlySlug) return { skipped: "slug-filter" };

  const work = await makeTempDir(entry.slug || "entry");
  let result = { changed: false, recorded: false };
  try {
    let src;
    try {
      src = await resolveSource(entry, work);
    } catch (err) {
      console.warn(`catalog-sast: ${entry.slug}: resolve failed: ${err.message}`);
      return { skipped: `resolve: ${err.message}` };
    }
    if (!src) return { skipped: "unresolvable install.type" };

    const sarifPath = join(work, "out.sarif");
    const run = runAnalyzer(src, sarifPath);

    const sec = (entry.security ||= {});
    const before = JSON.stringify(entry);

    if (run.status === "timeout") {
      sec.last_sast_scan = TODAY;
      sec.sast_scan_status = "timeout";
      sec.sast_scanner = scannerLabel;
    } else {
      const counts = await parseSarif(sarifPath);
      if (!counts) {
        console.warn(`catalog-sast: ${entry.slug}: SARIF missing or unparseable`);
        return { skipped: "no SARIF" };
      }
      sec.last_sast_scan = TODAY;
      sec.sast_findings_he = counts.error;
      sec.sast_findings_total = counts.total;
      sec.sast_scanner = scannerLabel;
      // Clear any prior timeout marker on a successful run.
      if (sec.sast_scan_status === "timeout") delete sec.sast_scan_status;

      if (counts.error >= 1) {
        // Don't clobber an existing quarantine for a different reason.
        const reason = `catalog-sast: ${counts.error} high-severity finding(s)`;
        const alreadyQuarantined = sec.quarantined === true;
        const isOurReason = typeof sec.quarantine_reason === "string"
          && sec.quarantine_reason.startsWith("catalog-sast:");
        if (!alreadyQuarantined || isOurReason) {
          sec.quarantined = true;
          sec.quarantine_reason = reason;
          sec.quarantined_at = TODAY;
        }
      }
    }

    const after = JSON.stringify(entry);
    if (after !== before) {
      result.changed = true;
      if (!dryRun) {
        await writeFile(entryPath, JSON.stringify(entry, null, 2) + "\n");
      }
    }
    result.recorded = true;
    result.findings_he = sec.sast_findings_he ?? 0;
    result.findings_total = sec.sast_findings_total ?? 0;
    result.timeout = run.status === "timeout";
    return result;
  } finally {
    await rm(work, { recursive: true, force: true }).catch(() => {});
  }
}

async function main() {
  // Hard prerequisites.
  if (!which("npm")) {
    console.error("catalog-sast: npm not on PATH");
    process.exit(1);
  }
  if (!which("git")) {
    console.error("catalog-sast: git not on PATH");
    process.exit(1);
  }
  const ver = analyzerVersion();
  if (!ver) {
    console.error(`catalog-sast: ${ANALYZER} not on PATH (or --version failed); install datadog-static-analyzer first`);
    process.exit(1);
  }
  const scannerLabel = `datadog-static-analyzer@${ver}`;

  let scanned = 0, updated = 0, quarantined = 0, timeouts = 0, skipped = 0;
  for (const f of await listEntries()) {
    let res;
    try {
      res = await scanEntry(f, scannerLabel);
    } catch (err) {
      console.error(`catalog-sast: ${f}: ${err.message}`);
      continue;
    }
    if (res.skipped) { skipped += 1; continue; }
    scanned += 1;
    if (res.changed) updated += 1;
    if (res.timeout) timeouts += 1;
    if ((res.findings_he ?? 0) >= 1) quarantined += 1;
    console.log(
      `catalog-sast: ${f}: ${res.timeout ? "timeout" : `he=${res.findings_he} total=${res.findings_total}`}`
        + (res.changed ? " (updated)" : "")
    );
  }
  console.log(
    `catalog-sast: scanned=${scanned} updated=${updated} quarantined=${quarantined} timeouts=${timeouts} skipped=${skipped}${dryRun ? " (dry-run)" : ""}`
  );
}

await main();

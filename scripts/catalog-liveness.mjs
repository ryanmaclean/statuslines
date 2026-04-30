#!/usr/bin/env node
// Probes every catalog entry against its upstream registry/repo, prints
// a markdown report of drift to stdout. Exits 0 even on drift — the
// workflow uses the report to decide whether to open an issue.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");

function listEntries() {
  const out = [];
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) {
        out.push(JSON.parse(readFileSync(join(dir, f), "utf8")));
      }
    }
  }
  return out;
}

async function fetchJson(url, timeoutMs = 8000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return await r.json();
}

async function probeNpm(entry) {
  const drift = [];
  const pkg = entry.install?.package;
  const ver = entry.install?.version;
  if (!pkg || !ver) return drift;

  let meta;
  try {
    meta = await fetchJson(`https://registry.npmjs.org/${pkg.replace("/", "%2F")}`);
  } catch (e) {
    drift.push(`registry unreachable: ${e.message}`);
    return drift;
  }

  const v = meta.versions?.[ver];
  if (!v) {
    drift.push(`version ${ver} no longer in registry`);
    return drift;
  }

  const observedIntegrity = v.dist?.integrity;
  if (entry.install?.integrity && observedIntegrity && observedIntegrity !== entry.install.integrity) {
    drift.push(`integrity changed: stored=${entry.install.integrity}, observed=${observedIntegrity}`);
  }

  const observedLicense = v.license ?? meta.license ?? null;
  if (observedLicense && entry.license && observedLicense !== entry.license) {
    drift.push(`license drift: catalog=${entry.license}, registry=${observedLicense}`);
  }

  const latest = meta["dist-tags"]?.latest;
  if (latest && latest !== ver) {
    drift.push(`upstream advanced: pinned=${ver}, latest=${latest}`);
  }
  return drift;
}

async function probeRepo(entry) {
  const drift = [];
  if (!entry.repo) return drift;
  try {
    const r = await fetch(entry.repo, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      redirect: "manual",
    });
    if (r.status >= 300 && r.status < 400) {
      drift.push(`repo redirects (HTTP ${r.status}); investigate`);
    } else if (r.status >= 400) {
      drift.push(`repo unreachable (HTTP ${r.status})`);
    }
  } catch (e) {
    drift.push(`repo probe failed: ${e.message}`);
  }
  return drift;
}

const entries = listEntries();
const reports = [];
for (const e of entries) {
  const driftLines = [];
  if (["npx", "npm-global", "opencode-plugin"].includes(e.install?.type)) {
    driftLines.push(...await probeNpm(e));
  }
  driftLines.push(...await probeRepo(e));
  if (driftLines.length) {
    reports.push({ slug: e.slug, drift: driftLines });
  }
}

if (reports.length === 0) {
  process.stdout.write("# catalog-liveness\n\nAll entries clean.\n");
  process.exit(0);
}

process.stdout.write("# catalog-liveness — drift report\n\n");
process.stdout.write(`Probed ${entries.length} entries; ${reports.length} have drift.\n\n`);
for (const r of reports) {
  process.stdout.write(`## \`${r.slug}\`\n\n`);
  for (const line of r.drift) process.stdout.write(`- ${line}\n`);
  process.stdout.write("\n");
}
process.stdout.write("---\n_Update with `node bin/statuslines.js audit <slug>` to refresh pins, or quarantine via `security.quarantined: true` + reason._\n");

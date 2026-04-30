#!/usr/bin/env node
// provenance-check: for every redistributable npm-backed catalog entry,
// check whether the pinned version was published with a Sigstore-signed
// SLSA build provenance attestation (npm publish --provenance). Records
// the result under entry.security.attestation.
//
// npm registry surface (as of 2026-04):
//   GET https://registry.npmjs.org/<pkg>
//     versions[<version>].dist.attestations          // present iff signed
//       .url                                          // bundle endpoint
//       .provenance.predicateType                     // hint
//   GET <attestations.url>
//     -> { attestations: [ { predicateType, bundle: { dsseEnvelope: {
//          payload: <base64 in-toto Statement> } } } ] }
//
// We pull the SLSA provenance (predicateType https://slsa.dev/provenance/v1)
// and decode its DSSE payload. The interesting fields:
//   predicate.runDetails.builder.id                   -> OIDC issuer
//   predicate.buildDefinition.externalParameters.workflow
//     { repository, path, ref }                        -> workflow path
//
// Distinct empty-attestations cases:
//   1. dist.attestations key absent              -> never signed
//   2. dist.attestations === {}                   -> registry quirk; treat as
//                                                    not signed
//   3. dist.attestations.url present but bundle
//      contains no SLSA-typed attestation        -> only the npm publish
//                                                    attestation, no SLSA
//                                                    builder identity; record
//                                                    available=false (we want
//                                                    the build provenance,
//                                                    not just the registry
//                                                    self-attestation)
//
// Phase I: advisory only. We write data and a /tmp/provenance.md summary.
// `doctor` does not refuse entries lacking attestations.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

const ROOT = new URL("../catalog/", import.meta.url);
const REPORT = "/tmp/provenance.md";
const TIMEOUT_MS = 8_000;
const NPM_TYPES = new Set(["npx", "npm-global", "opencode-plugin"]);
const SLSA_PREDICATE = "https://slsa.dev/provenance/v1";
const NOW = new Date().toISOString();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlySlug = args.find((a) => !a.startsWith("--")) ?? null;

async function listEntryFiles() {
  const out = [];
  for (const cli of await readdir(ROOT, { withFileTypes: true })) {
    if (!cli.isDirectory()) continue;
    const dir = new URL(cli.name + "/", ROOT);
    for (const f of await readdir(dir)) {
      if (f.endsWith(".json")) out.push(new URL(f, dir));
    }
  }
  return out;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

function npmRegistryUrl(pkg) {
  // Scoped packages need their slash percent-encoded; unscoped names are safe.
  // encodeURIComponent on a plain name is a no-op for the legal char set.
  if (pkg.startsWith("@")) {
    const [scope, name] = pkg.split("/");
    return `https://registry.npmjs.org/${encodeURIComponent(scope)}/${encodeURIComponent(name)}`;
  }
  return `https://registry.npmjs.org/${encodeURIComponent(pkg)}`;
}

function decodeDsse(att) {
  const payloadB64 = att?.bundle?.dsseEnvelope?.payload;
  if (!payloadB64) return null;
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function extractSlsa(bundle) {
  // bundle = { attestations: [ {predicateType, bundle:{dsseEnvelope:{payload}}} ] }
  const list = Array.isArray(bundle?.attestations) ? bundle.attestations : [];
  for (const att of list) {
    if (att?.predicateType !== SLSA_PREDICATE) continue;
    const stmt = decodeDsse(att);
    if (!stmt) continue;
    const pred = stmt.predicate ?? {};
    const builderId = pred.runDetails?.builder?.id ?? null;
    const wf = pred.buildDefinition?.externalParameters?.workflow ?? {};
    const repo = wf.repository ?? "";
    const path = wf.path ?? "";
    const ref = wf.ref ?? "";
    let buildWorkflow = null;
    if (repo && path) {
      // canonical form: github.com/<owner>/<repo>/.github/workflows/<file>@<ref>
      const stripped = repo.replace(/^https?:\/\//, "");
      buildWorkflow = ref ? `${stripped}/${path}@${ref}` : `${stripped}/${path}`;
    }
    return {
      predicate_type: SLSA_PREDICATE,
      issuer: builderId,
      build_workflow: buildWorkflow,
    };
  }
  return null;
}

async function checkEntry(entry) {
  const inst = entry.install || {};
  const pkg = inst.package;
  const ver = inst.version;
  if (!pkg || !ver) return { skipped: "no pinned package/version" };

  const meta = await fetchJson(npmRegistryUrl(pkg));
  const v = meta.versions?.[ver];
  if (!v) return { skipped: `version ${ver} missing from registry` };

  const dist = v.dist || {};
  // Cases:
  //   - no `attestations` field   -> never signed
  //   - empty object              -> treat as not signed
  //   - object with .url          -> fetch the bundle
  const hasField = "attestations" in dist;
  const attMeta = dist.attestations;
  const hasUrl = hasField && attMeta && typeof attMeta === "object" && typeof attMeta.url === "string";

  if (!hasUrl) {
    return {
      result: {
        available: false,
        checked_at: NOW,
        predicate_type: null,
        issuer: null,
        build_workflow: null,
        regression: false,
      },
    };
  }

  let bundle;
  try {
    bundle = await fetchJson(attMeta.url);
  } catch (err) {
    // Transport failure on the bundle endpoint: surface up.
    throw new Error(`attestation bundle fetch failed: ${err.message}`);
  }

  const slsa = extractSlsa(bundle);
  if (!slsa) {
    // attestations existed (e.g. only the npm publish self-attestation) but
    // no SLSA build provenance — for our purposes that is `available: false`.
    return {
      result: {
        available: false,
        checked_at: NOW,
        predicate_type: null,
        issuer: null,
        build_workflow: null,
        regression: false,
      },
    };
  }

  return {
    result: {
      available: true,
      checked_at: NOW,
      predicate_type: slsa.predicate_type,
      issuer: slsa.issuer,
      build_workflow: slsa.build_workflow,
      regression: false,
    },
  };
}

const summary = {
  scanned: 0,
  signed: 0,
  unsigned: 0,
  regressions: [],
  errors: [],
  per_entry: [],
};

let transportError = null;

for (const file of await listEntryFiles()) {
  const entry = JSON.parse(await readFile(file, "utf8"));
  if (onlySlug && entry.slug !== onlySlug) continue;
  if (entry.redistributable !== true) continue;
  if (!NPM_TYPES.has(entry.install?.type)) continue;

  summary.scanned++;
  let r;
  try {
    r = await checkEntry(entry);
  } catch (err) {
    summary.errors.push({ slug: entry.slug, message: err.message });
    process.stderr.write(`provenance-check: ${entry.slug}: ${err.message}\n`);
    transportError = err;
    continue;
  }
  if (r.skipped) {
    process.stderr.write(`provenance-check: ${entry.slug}: skipped (${r.skipped})\n`);
    continue;
  }

  const prev = entry.security?.attestation;
  const next = r.result;
  if (prev?.available === true && next.available === false) {
    next.regression = true;
    summary.regressions.push({
      slug: entry.slug,
      package: `${entry.install.package}@${entry.install.version}`,
      previously: {
        issuer: prev.issuer,
        build_workflow: prev.build_workflow,
      },
    });
  }

  if (next.available) summary.signed++;
  else summary.unsigned++;
  summary.per_entry.push({
    slug: entry.slug,
    package: `${entry.install.package}@${entry.install.version}`,
    available: next.available,
    issuer: next.issuer,
    build_workflow: next.build_workflow,
    regression: next.regression,
  });

  const before = JSON.stringify(entry);
  entry.security = entry.security || {};
  entry.security.attestation = next;
  if (JSON.stringify(entry) !== before) {
    if (dryRun) {
      process.stdout.write(`would update ${entry.slug}: available=${next.available}${next.regression ? " REGRESSION" : ""}\n`);
    } else {
      await writeFile(file, JSON.stringify(entry, null, 2) + "\n");
      process.stdout.write(`updated ${entry.slug}: available=${next.available}${next.regression ? " REGRESSION" : ""}\n`);
    }
  } else {
    process.stdout.write(`unchanged ${entry.slug}: available=${next.available}\n`);
  }
}

// Markdown report — consumed by the workflow as PR body.
const lines = [];
lines.push("# catalog-provenance");
lines.push("");
lines.push(`Scanned ${summary.scanned} redistributable npm-backed entries on ${NOW.slice(0, 10)}.`);
lines.push("");
lines.push(`- signed (SLSA provenance present): **${summary.signed}**`);
lines.push(`- unsigned: **${summary.unsigned}**`);
lines.push(`- regressions (was signed, now unsigned): **${summary.regressions.length}**`);
lines.push(`- transport errors: **${summary.errors.length}**`);
lines.push("");

if (summary.regressions.length) {
  lines.push("## Regressions");
  lines.push("");
  lines.push("These entries previously had a SLSA provenance attestation and no longer do. Investigate before this PR is merged.");
  lines.push("");
  for (const r of summary.regressions) {
    lines.push(`- \`${r.slug}\` (${r.package})`);
    if (r.previously?.build_workflow) lines.push(`  - previously built by: \`${r.previously.build_workflow}\``);
    if (r.previously?.issuer) lines.push(`  - previously issued by: \`${r.previously.issuer}\``);
  }
  lines.push("");
}

if (summary.per_entry.length) {
  lines.push("## Per-entry");
  lines.push("");
  lines.push("| slug | package | signed | issuer | workflow |");
  lines.push("|---|---|---|---|---|");
  const sorted = summary.per_entry.slice().sort((a, b) => a.slug.localeCompare(b.slug));
  for (const e of sorted) {
    const sig = e.available ? "yes" : "no";
    const iss = e.issuer ? `\`${e.issuer}\`` : "—";
    const wf = e.build_workflow ? `\`${e.build_workflow}\`` : "—";
    lines.push(`| \`${e.slug}\` | \`${e.package}\` | ${sig} | ${iss} | ${wf} |`);
  }
  lines.push("");
}

if (summary.errors.length) {
  lines.push("## Transport errors");
  lines.push("");
  for (const e of summary.errors) lines.push(`- \`${e.slug}\`: ${e.message}`);
  lines.push("");
}

lines.push("---");
lines.push("_Phase I: advisory. `doctor` does not yet refuse entries lacking attestations. See `catalog/SCHEMA.md` § Attestation._");

if (!dryRun) {
  await writeFile(REPORT, lines.join("\n") + "\n");
  process.stderr.write(`provenance-check: wrote ${REPORT}\n`);
}

process.stderr.write(`provenance-check: scanned=${summary.scanned} signed=${summary.signed} unsigned=${summary.unsigned} regressions=${summary.regressions.length} errors=${summary.errors.length}\n`);

if (transportError) process.exit(1);

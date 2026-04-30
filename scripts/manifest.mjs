#!/usr/bin/env node
// catalog/MANIFEST.json builder + hybrid Ed25519 + ML-DSA-65 (Dilithium-3) signer/verifier.
//
// Library decision (re-investigated for Phase F, 2026):
//   We use `@noble/post-quantum` (paulmillr/noble-post-quantum) for ML-DSA-65 instead of
//   the previously-planned `liboqs-node`. Rationale:
//
//     1. Pure-JS ESM, no native bindings. Native liboqs needs a C toolchain at install
//        time and breaks `npm ci` on minimal CI runners. noble-post-quantum installs
//        cleanly anywhere Node >= 20.19 runs.
//     2. The noble suite is widely audited (multiple paid third-party reviews on the
//        sister `@noble/curves` package; the post-quantum package implements FIPS 203,
//        204, 205 and Falcon to spec).
//     3. Tree-shakable subpath exports keep the install tiny: 4 packages total
//        (post-quantum + ciphers + curves + hashes), all from the same author.
//     4. ML-DSA-65 = NIST FIPS 204 Dilithium category 3, the security level the user
//        asked for.
//
//   Ed25519 comes from `node:crypto` (stdlib — no extra dependency).
//
// All three commands (build, sign, verify) are implemented here; the script is a
// standalone Node ESM module.

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  chmodSync,
  mkdirSync,
} from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createPrivateKey, createPublicKey, sign as nodeSign, verify as nodeVerify } from "node:crypto";
import { homedir } from "node:os";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(ROOT, "catalog");
const MANIFEST_PATH = join(CATALOG, "MANIFEST.json");
const SIG_PATH = join(CATALOG, "MANIFEST.sig.json");
const MAINTAINERS_PATH = join(CATALOG, "MAINTAINERS.md");

const TEMPLATE_MARKERS = [
  "replace-me-ed25519",
  "replace-me-ml-dsa-65",
  "TEMPLATE",
];

// ---------- canonical JSON ----------
// Deterministic JSON: sorted object keys, no whitespace, UTF-8.
// Recursive; arrays preserve order, objects sort by key.
function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  const keys = Object.keys(value).sort();
  const parts = keys.map((k) => JSON.stringify(k) + ":" + canonicalize(value[k]));
  return "{" + parts.join(",") + "}";
}

function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

// ---------- catalog walk ----------
function listCatalogEntries() {
  const out = [];
  if (!existsSync(CATALOG)) return out;
  for (const group of readdirSync(CATALOG, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    if (group.name === "locks") continue; // Phase J: per-entry transitive-dep lockfiles, not entries
    const dir = join(CATALOG, group.name);
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const full = join(dir, f);
      out.push(full);
    }
  }
  return out;
}

function entryHash(filePath) {
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  // Strip any private fields that might have crept in (defensive).
  delete raw._path;
  const canonical = canonicalize(raw);
  return sha256Hex(Buffer.from(canonical, "utf8"));
}

function buildManifestObject() {
  const files = listCatalogEntries();
  const entries = [];
  for (const full of files) {
    const slug = JSON.parse(readFileSync(full, "utf8")).slug;
    if (!slug) throw new Error(`entry ${full} has no slug`);
    entries.push({
      slug,
      path: relative(ROOT, full).replaceAll("\\", "/"),
      sha256: entryHash(full),
    });
  }
  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    entries,
  };
}

// ---------- commands ----------
function cmdBuild() {
  const obj = buildManifestObject();
  // Pretty-print (2-space) for human review; canonical form is what gets signed.
  writeFileSync(MANIFEST_PATH, JSON.stringify(obj, null, 2) + "\n");
  process.stdout.write(`wrote ${MANIFEST_PATH} (${obj.entries.length} entries)\n`);
}

function readManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(`${MANIFEST_PATH} does not exist; run \`node scripts/manifest.mjs build\` first`);
  }
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

function manifestCanonicalBytes(manifest) {
  return Buffer.from(canonicalize(manifest), "utf8");
}

function ed25519PrivKeyFromRaw(rawBytes) {
  // RFC 8032 raw 32-byte seed -> Node KeyObject via PKCS#8 wrapper.
  if (rawBytes.length !== 32) throw new Error(`Ed25519 raw private key must be 32 bytes, got ${rawBytes.length}`);
  // OID 1.3.101.112 = Ed25519. PKCS#8 v1 wrapper for a raw 32-byte seed.
  const prefix = Buffer.from("302e020100300506032b657004220420", "hex");
  const der = Buffer.concat([prefix, rawBytes]);
  return createPrivateKey({ key: der, format: "der", type: "pkcs8" });
}

function ed25519PubKeyFromRaw(rawBytes) {
  if (rawBytes.length !== 32) throw new Error(`Ed25519 raw public key must be 32 bytes, got ${rawBytes.length}`);
  const prefix = Buffer.from("302a300506032b6570032100", "hex");
  const der = Buffer.concat([prefix, rawBytes]);
  return createPublicKey({ key: der, format: "der", type: "spki" });
}

function cmdSign(args) {
  const keyArgIdx = args.indexOf("--key");
  if (keyArgIdx === -1 || !args[keyArgIdx + 1]) {
    throw new Error("usage: manifest.mjs sign --key <path-to-private-key.json>");
  }
  const keyPath = args[keyArgIdx + 1].replace(/^~/, homedir());
  if (!existsSync(keyPath)) throw new Error(`private key not found: ${keyPath}`);
  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  if (!key.maintainer_id || !key.ed25519?.private || !key.ml_dsa_65?.private) {
    throw new Error(`private key file ${keyPath} is missing maintainer_id, ed25519.private, or ml_dsa_65.private`);
  }

  const manifest = readManifest();
  const canonical = manifestCanonicalBytes(manifest);
  const manifestHash = sha256Hex(canonical);

  // Ed25519 sign with node:crypto.
  const ed25519Priv = ed25519PrivKeyFromRaw(Buffer.from(key.ed25519.private, "base64"));
  const edSig = nodeSign(null, canonical, ed25519Priv);

  // ML-DSA-65 sign with @noble/post-quantum.
  const mldsaPriv = Buffer.from(key.ml_dsa_65.private, "base64");
  const mldsaSig = ml_dsa65.sign(canonical, mldsaPriv);

  const sigDoc = {
    manifest_sha256: manifestHash,
    signed_at: new Date().toISOString(),
    maintainer_id: key.maintainer_id,
    ed25519: Buffer.from(edSig).toString("base64"),
    ml_dsa_65: Buffer.from(mldsaSig).toString("base64"),
  };
  writeFileSync(SIG_PATH, JSON.stringify(sigDoc, null, 2) + "\n");
  process.stdout.write(`wrote ${SIG_PATH} (signed by ${key.maintainer_id})\n`);
}

// ---------- maintainers parser ----------
// Accepts a markdown table:
//   | id | ed25519_pubkey | ml_dsa_65_pubkey |
//   |---|---|---|
//   | ryanmaclean | <b64> | <b64> |
function parseMaintainers(md) {
  const rows = [];
  const lines = md.split(/\r?\n/);
  let inTable = false;
  let headerSeen = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith("|")) { inTable = false; headerSeen = false; continue; }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 3) continue;
    if (!headerSeen) {
      const lower = cells.map((c) => c.toLowerCase());
      if (lower[0].includes("id") && lower[1].includes("ed25519") && lower[2].includes("ml_dsa")) {
        headerSeen = true;
        inTable = true;
      }
      continue;
    }
    if (cells.every((c) => /^-+:?$/.test(c) || c === "")) continue; // separator row
    if (!inTable) continue;
    rows.push({ id: cells[0], ed25519: cells[1], ml_dsa_65: cells[2] });
  }
  return rows;
}

function isTemplateValue(s) {
  if (!s) return true;
  return TEMPLATE_MARKERS.some((m) => s.toLowerCase().includes(m.toLowerCase()));
}

// ---------- verify ----------
function cmdVerify({ silent = false } = {}) {
  const errors = [];

  // 1. Manifest consistency: walk catalog, recompute, compare.
  const manifest = readManifest();
  const live = buildManifestObject();
  const liveBySlug = new Map(live.entries.map((e) => [e.slug, e]));
  const manifestBySlug = new Map(manifest.entries.map((e) => [e.slug, e]));

  for (const e of manifest.entries) {
    const liveEntry = liveBySlug.get(e.slug);
    if (!liveEntry) {
      errors.push(`manifest entry ${e.slug} has no matching catalog file`);
      continue;
    }
    if (liveEntry.sha256 !== e.sha256) {
      errors.push(`hash mismatch for ${e.slug}: manifest=${e.sha256.slice(0, 12)}…, computed=${liveEntry.sha256.slice(0, 12)}…`);
    }
    if (liveEntry.path !== e.path) {
      errors.push(`path mismatch for ${e.slug}: manifest=${e.path}, computed=${liveEntry.path}`);
    }
  }
  for (const e of live.entries) {
    if (!manifestBySlug.has(e.slug)) {
      errors.push(`catalog entry ${e.slug} (${e.path}) is missing from MANIFEST.json`);
    }
  }

  // 2. Signature: read MANIFEST.sig.json + MAINTAINERS.md.
  if (!existsSync(SIG_PATH)) {
    errors.push(`${SIG_PATH} not found`);
    return finalize(errors, silent);
  }
  if (!existsSync(MAINTAINERS_PATH)) {
    errors.push(`${MAINTAINERS_PATH} not found`);
    return finalize(errors, silent);
  }
  const sigDoc = JSON.parse(readFileSync(SIG_PATH, "utf8"));

  // Bootstrap state: signature is intentionally a placeholder. Detect and report
  // clearly so the verifier doesn't pretend an unsigned manifest is signed.
  const sigIsTemplate =
    isTemplateValue(sigDoc.maintainer_id) ||
    isTemplateValue(sigDoc.ed25519) ||
    isTemplateValue(sigDoc.ml_dsa_65);
  const maintainersRaw = readFileSync(MAINTAINERS_PATH, "utf8");
  const maintainers = parseMaintainers(maintainersRaw);

  if (sigIsTemplate) {
    errors.push(
      "MANIFEST.sig.json contains TEMPLATE placeholders — bootstrap signature, not a real one. " +
      "Run `node scripts/keygen.mjs --id <your-id>`, paste the printed row into catalog/MAINTAINERS.md, " +
      "then `node scripts/manifest.mjs sign --key ~/.config/statuslines/maintainer-<your-id>.json`.",
    );
    return finalize(errors, silent);
  }

  if (sigDoc.manifest_sha256 !== sha256Hex(manifestCanonicalBytes(manifest))) {
    errors.push("MANIFEST.sig.json.manifest_sha256 does not match the canonical hash of MANIFEST.json");
  }

  const allTemplate = maintainers.length > 0 && maintainers.every((m) => isTemplateValue(m.id) || isTemplateValue(m.ed25519) || isTemplateValue(m.ml_dsa_65));
  if (maintainers.length === 0 || allTemplate) {
    errors.push("catalog/MAINTAINERS.md has no real maintainers (only TEMPLATE rows). Add a real row before signing.");
    return finalize(errors, silent);
  }

  const m = maintainers.find((row) => row.id === sigDoc.maintainer_id);
  if (!m) {
    errors.push(`signature maintainer_id '${sigDoc.maintainer_id}' is not listed in catalog/MAINTAINERS.md`);
    return finalize(errors, silent);
  }
  if (isTemplateValue(m.ed25519) || isTemplateValue(m.ml_dsa_65)) {
    errors.push(`maintainer '${m.id}' in MAINTAINERS.md still has TEMPLATE placeholder pubkey(s); replace before signing`);
    return finalize(errors, silent);
  }

  const canonical = manifestCanonicalBytes(manifest);

  // Ed25519 verify.
  let edOk = false;
  try {
    const edPub = ed25519PubKeyFromRaw(Buffer.from(m.ed25519, "base64"));
    edOk = nodeVerify(null, canonical, edPub, Buffer.from(sigDoc.ed25519, "base64"));
  } catch (e) {
    errors.push(`Ed25519 verify error: ${e.message}`);
  }
  if (!edOk) errors.push("Ed25519 signature did NOT verify against MAINTAINERS.md pubkey");

  // ML-DSA-65 verify.
  let pqOk = false;
  try {
    const mldsaPub = Buffer.from(m.ml_dsa_65, "base64");
    pqOk = ml_dsa65.verify(Buffer.from(sigDoc.ml_dsa_65, "base64"), canonical, mldsaPub);
  } catch (e) {
    errors.push(`ML-DSA-65 verify error: ${e.message}`);
  }
  if (!pqOk) errors.push("ML-DSA-65 signature did NOT verify against MAINTAINERS.md pubkey");

  return finalize(errors, silent);
}

function finalize(errors, silent) {
  if (errors.length === 0) {
    if (!silent) process.stdout.write("manifest verify: ok\n");
    return 0;
  }
  if (!silent) {
    for (const e of errors) process.stderr.write(`ERR  ${e}\n`);
    process.stderr.write(`manifest verify: ${errors.length} problem(s)\n`);
  }
  return 1;
}

// ---------- entrypoint ----------
async function main() {
  const cmd = process.argv[2];
  const rest = process.argv.slice(3);
  switch (cmd) {
    case "build":
      cmdBuild();
      break;
    case "sign":
      cmdSign(rest);
      break;
    case "verify": {
      const code = cmdVerify();
      process.exit(code);
    }
    case "help":
    case "--help":
    case "-h":
    case undefined:
      process.stdout.write(`Usage: node scripts/manifest.mjs <command>

Commands:
  build                 Walk catalog/ and (re)write catalog/MANIFEST.json.
  sign --key <path>     Sign MANIFEST.json with a maintainer private key
                        produced by scripts/keygen.mjs. Writes
                        catalog/MANIFEST.sig.json.
  verify                Recompute hashes, check signature against
                        catalog/MAINTAINERS.md. Exits 0 on success.
                        Used by .github/workflows/catalog-manifest-verify.yml.
`);
      break;
    default:
      process.stderr.write(`unknown command: ${cmd}\n`);
      process.exit(2);
  }
}

main().catch((e) => {
  process.stderr.write(`error: ${e.message}\n`);
  process.exit(1);
});

// Re-exports for unit tests / programmatic use (e.g. `doctor`):
export { canonicalize, sha256Hex, buildManifestObject, parseMaintainers, cmdVerify };

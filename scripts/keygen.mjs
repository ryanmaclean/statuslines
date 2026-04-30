#!/usr/bin/env node
// Generate a maintainer keypair (Ed25519 + ML-DSA-65). The private key is
// written to ~/.config/statuslines/maintainer-<id>.json (chmod 600); the
// public key prints to stdout in a markdown-table-row format ready to paste
// into catalog/MAINTAINERS.md.

import { writeFileSync, mkdirSync, existsSync, chmodSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline";

function parseArgs(argv) {
  const out = { id: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") out.id = argv[++i];
    else if (a.startsWith("--id=")) out.id = a.slice(5);
    else if (a === "--force") out.force = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

function isValidId(s) {
  return typeof s === "string" && /^[a-z0-9][a-z0-9-_]{0,63}$/.test(s);
}

async function promptId() {
  const rl = createInterface({ input, output });
  return new Promise((res) => {
    rl.question("maintainer_id (e.g. ryanmaclean): ", (answer) => {
      rl.close();
      res(answer.trim());
    });
  });
}

function ed25519RawFromKeyObjects(privKey, pubKey) {
  // Extract raw 32-byte seed and 32-byte pub from PKCS#8/SPKI DER.
  const privDer = privKey.export({ format: "der", type: "pkcs8" });
  const pubDer = pubKey.export({ format: "der", type: "spki" });
  // PKCS#8 v1 Ed25519 layout: the 32-byte raw seed is the last 32 bytes
  // of the DER, prefixed by `04 20` inside an OCTET STRING.
  const rawPriv = privDer.subarray(privDer.length - 32);
  // SPKI Ed25519 layout: the 32-byte raw pub is the last 32 bytes of the DER.
  const rawPub = pubDer.subarray(pubDer.length - 32);
  return { rawPriv, rawPub };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`Usage: node scripts/keygen.mjs --id <maintainer-id> [--force]

Generates a fresh Ed25519 + ML-DSA-65 keypair, writes the private key to
~/.config/statuslines/maintainer-<id>.json (chmod 600), and prints the
public key as a markdown-table row ready to paste into catalog/MAINTAINERS.md.

The private key NEVER leaves your machine. Do not commit it.
`);
    return;
  }

  let id = args.id;
  if (!id) id = await promptId();
  if (!isValidId(id)) {
    process.stderr.write(`invalid maintainer_id: '${id}'. Use a-z0-9-_ (start with a-z0-9), <= 64 chars.\n`);
    process.exit(2);
  }

  const cfgDir = join(homedir(), ".config", "statuslines");
  mkdirSync(cfgDir, { recursive: true });
  const keyPath = join(cfgDir, `maintainer-${id}.json`);
  if (existsSync(keyPath) && !args.force) {
    process.stderr.write(`refusing to overwrite ${keyPath} (pass --force to replace)\n`);
    process.exit(2);
  }

  // Ed25519 — node:crypto stdlib.
  const ed = generateKeyPairSync("ed25519");
  const { rawPriv: edPriv, rawPub: edPub } = ed25519RawFromKeyObjects(ed.privateKey, ed.publicKey);

  // ML-DSA-65 — @noble/post-quantum.
  const seed = randomBytes(32);
  const mldsa = ml_dsa65.keygen(seed);

  const privDoc = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    maintainer_id: id,
    ed25519: {
      private: Buffer.from(edPriv).toString("base64"),
      public: Buffer.from(edPub).toString("base64"),
    },
    ml_dsa_65: {
      private: Buffer.from(mldsa.secretKey).toString("base64"),
      public: Buffer.from(mldsa.publicKey).toString("base64"),
    },
  };

  writeFileSync(keyPath, JSON.stringify(privDoc, null, 2) + "\n", { mode: 0o600 });
  try { chmodSync(keyPath, 0o600); } catch {}

  process.stderr.write(`wrote private key: ${keyPath} (chmod 600)\n`);
  process.stderr.write(`KEEP THIS FILE PRIVATE. It is not committed to the repository.\n\n`);
  process.stderr.write(`Paste the following row into catalog/MAINTAINERS.md (replacing the TEMPLATE row or appending below it):\n\n`);

  const row = `| ${id} | ${privDoc.ed25519.public} | ${privDoc.ml_dsa_65.public} |`;
  process.stdout.write(row + "\n");
}

main().catch((e) => {
  process.stderr.write(`error: ${e.message}\n`);
  process.exit(1);
});

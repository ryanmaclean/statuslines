# Maintainers

This file is the authoritative list of public keys trusted to sign
`catalog/MANIFEST.json`. CI (`.github/workflows/catalog-manifest-verify.yml`)
and `node scripts/manifest.mjs verify` parse the table below to look up the
signer named in `catalog/MANIFEST.sig.json`.

## How signing works

We use a hybrid signature scheme: every manifest is signed by **both**
Ed25519 (RFC 8032, classical) and **ML-DSA-65** (FIPS 204, post-quantum
Dilithium-3). Verifiers require **both** signatures to pass — that way a
break in either scheme alone does not let a forgery through. Defense in
depth: classical *and* post-quantum.

Private keys never leave the maintainer's machine. The signing workflow
runs locally; CI only verifies.

## Becoming a maintainer (or rotating your key)

1. Run `node scripts/keygen.mjs --id <your-id>`.
2. The script writes the private key to
   `~/.config/statuslines/maintainer-<your-id>.json` (chmod 600) and
   prints a public-key row to stdout.
3. Paste that row into the table below (replacing the `TEMPLATE` row if
   you are bootstrapping the file).
4. Run `node scripts/manifest.mjs build` then
   `node scripts/manifest.mjs sign --key ~/.config/statuslines/maintainer-<your-id>.json`.
5. Commit `catalog/MANIFEST.json`, `catalog/MANIFEST.sig.json`, and this
   file. CI will refuse the push if any of those three are out of sync.

## Format

Strict markdown table. The verifier expects the header row exactly as
written below (`id | ed25519_pubkey | ml_dsa_65_pubkey`) followed by the
`---` separator and one row per maintainer. Public keys are base64.

`doctor` and `manifest verify` will fail if any value contains the
substrings `replace-me-ed25519`, `replace-me-ml-dsa-65`, or `TEMPLATE` —
this catches a forgotten replacement immediately.

## Maintainers

| id | ed25519_pubkey | ml_dsa_65_pubkey |
|---|---|---|
| TEMPLATE | replace-me-ed25519 | replace-me-ml-dsa-65 |

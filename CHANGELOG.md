# Changelog

**Languages:** English · [Français](./CHANGELOG.fr.md) · [日本語](./CHANGELOG.ja.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
This project uses semver-shaped section headers but is pre-1.0; version numbers
are notional milestones, not tagged releases.

## [Unreleased]

### Added
- `tests/statuslines.test.js` — 114 tests across 19 suites covering `validate()`,
  all three renderers (`renderReadme` / `renderTopReadmeBlocks` / `renderQuarantine`)
  across all three locales, `loadVisible`/`loadAll` quarantine semantics, pipe/quote
  escaping, image fallback, and config-snippet escaping.
- `tests/run.sh` convenience wrapper; CI (`catalog-doctor.yml`) now runs the test
  suite before the doctor step and triggers on changes to `tests/**`.
- `catalog-liveness`: image-URL liveness pass that HEAD-probes every visible
  entry's `image.url`, classifies results as `ok / og-stable / wrong_content_type /
  redirected / dead`, and surfaces drift in the `/tmp/liveness.md` report
  alongside the existing repo + npm-registry probes. Exports `--json <path>`.

### Fixed
- `renderReadme(lang)` now reads `description_fr` / `description_ja` from entries
  when rendering `catalog/README.fr.md` and `catalog/README.ja.md`; previously
  those localized catalog READMEs fell through to English descriptions even when
  translated fields existed in the JSON.
- `cmdConfigure` now has an explicit `install.type="manual"` arm that prints
  upstream-link guidance and exits 1, rather than silently merging a config snippet
  without a binary on PATH.
- `scripts/verify-capabilities.mjs`: simplified an `!noNetFailed === false` boolean
  expression that auditors flagged as a potential bug (behavior unchanged; readability
  improved).
- `scripts/deps-verify.mjs`: removed a `? header : header` dead ternary left from
  an earlier refactor.

---

## [0.7.0] — Tests, image liveness, and catalog table localization

### Added
- Per-CLI thumbnail tables in the top README (EN/FR/JA): `renderTopReadmeBlocks()`
  emits a `Preview | Name | License | Description` 4-column table per CLI with
  200 px image thumbnails linked to the upstream repo.
- Localized catalog table descriptions: `description_fr` and `description_ja` fields
  added to all 23 entries; FR and JA top-README catalog blocks now render in the
  target language.
- `termframe` preview harness (`scripts/preview-via-termframe.mjs`): pipes synthetic
  Claude Code statusline JSON through upstream binaries in a virtual PTY and captures
  SVG output; macOS iTerm2 template also provided.
- Vector SVG previews for three Claude statuslines (`ccstatusline`,
  `lucasilverentand-claudeline`, `owloops-claude-powerline`) — 3–7 KB each, replacing
  multi-MB GIFs.
- `scripts/optimize-images.mjs`: WebP conversion pipeline (`sharp` + `cwebp`) and
  `gifsicle`-only GIF optimizer; drops orphaned GIFs with no catalog reference.
- `tokscale.png` optimized to WebP (1.35 MB → 58 KB).

### Changed
- `render-top-readme` writes all three locale READMEs in a single pass so the count
  badge and catalog block stay in lockstep across EN/FR/JA.
- `validate()` now accepts `"termframe-synthetic"` as a valid `image.source` enum value.

---

## [0.6.0] — Localized catalog + image previews + quarantine b-open-statusline

### Added
- Full FR + JA translations: top `README`, `catalog/README`, `catalog/SCHEMA`,
  `catalog/QUARANTINE`, `catalog/CAPABILITIES` — every top-level doc now has
  language siblings.
- Language nav bars on all canonical English docs (`README.md`, `SECURITY.md`,
  `catalog/SCHEMA.md`, `catalog/CAPABILITIES.md`); `render-readme` and
  `render-quarantine` emit language bars on their generated outputs.
- Local image previews: `catalog/images/` ships a committed copy of every
  entry's screenshot/OG card (24 files); `scripts/grab-images.mjs` is the
  re-runnable downloader (idempotent, 30-day refresh TTL, `--force` flag).
  The renderer prefers `image.local` over `image.url`.
- `image { url, alt, source, local }` schema field added; `scripts/apply-images.mjs`
  bootstrap patcher; `catalog/SCHEMA.md` documents the field and valid `source` values.

### Changed
- `gsd/` context-health flavor removed; `pup/` is now the sole in-repo reference
  statusline. Context-monitor scripts moved into `pup/claude/` and `pup/opencode/`
  (history preserved via git rename).
- `install/install-pup.sh`, `examples/`, `package.json` repointed from `gsd/`
  to `pup/`; six `statusline-gsd-*` bin entries removed.
- Roadmap section of `README.md` rewritten to reflect shipped work.

### Fixed
- `validate()` warns when a redistributable entry has no `image` block; refuses
  non-https `image.url`, `github.com/user-attachments` URLs (which 403 to
  non-browser clients), out-of-range alt strings, and unknown `source` values.

### Security
- **b-open-statusline quarantined.** GitHub compare confirmed 0 divergent commits
  from `sirmalloc/ccstatusline`; both `package.json` files declare the same name;
  the claimed context-window auto-detect feature is absent from source. Quarantined
  per the OpenBSD-style pattern; catalog count dropped 24 → 23.

---

## [0.5.0] — Supply-chain hardening Phases F–J (PQC signing, tarball diff, capabilities, provenance, lockfiles)

### Added
- **Phase F — PQC signing.** `scripts/manifest.mjs` builds, signs, and verifies
  `catalog/MANIFEST.json` with a hybrid Ed25519 + ML-DSA-65 (FIPS 204) signature.
  `scripts/keygen.mjs` generates keypairs; private keys never enter the repo.
  `catalog/MAINTAINERS.md` holds public keys; `.github/workflows/catalog-manifest-verify.yml`
  blocks PRs with invalid or out-of-sync manifests. Library: `@noble/post-quantum 0.6.1`
  (pure-JS, no native bindings).
- **Phase G — Capability declarations + sandboxed verification.** Per-entry
  `capabilities` block (`network`, `child_process`, `filesystem_write`, `env_read`,
  `verified_at`, `verification_method`) documented in `catalog/SCHEMA.md` and
  `catalog/CAPABILITIES.md`. `scripts/verify-capabilities.mjs` runs installs under
  firejail (bubblewrap / strace fallback) and compares observed vs declared behavior.
  `bin/statuslines.js` gains a `verify-capabilities <slug>` subcommand.
  `.github/workflows/catalog-capabilities.yml` runs weekly (Wed 09:11 UTC); quarantines
  entries whose observed permissions exceed their declarations.
- **Phase H — Version-bump bot + tarball diff.** `scripts/tarball-diff.mjs` (pure stdlib
  tar reader, no native deps) diffs old vs new tarballs for five flag categories: new
  lifecycle scripts, new top-level domains, new binary blobs, LICENSE changes, and
  large size growth. `scripts/version-bumps.mjs` proposes upgrades; suspicious diffs are
  held in a `quarantined-from-bump` section rather than applied.
  `.github/workflows/catalog-version-bumps.yml` runs weekly (Mon 03:37 UTC).
- **Phase I — npm provenance attestation enforcement (advisory).** `scripts/provenance-check.mjs`
  fetches SLSA build-provenance attestations from the npm registry, records `available` /
  `regression` per entry. `.github/workflows/catalog-provenance.yml` runs weekly
  (Thu 09:47 UTC). Advisory: `doctor` does not refuse entries lacking attestations.
- **Phase J — Transitive-dep lockfiles (advisory).** `scripts/deps-capture.mjs` resolves
  the full dep closure of each redistributable npm entry using the npm slim-packument
  format; writes `catalog/locks/<slug>.json`. `scripts/deps-verify.mjs` re-resolves and
  flags drift (added dep, integrity change for same version). `.github/workflows/catalog-deps-verify.yml`
  runs weekly (Wed 11:53 UTC). Advisory phase — no hard-failure in `doctor` yet.
- `MANIFEST.json` rebuilt with Phase G capability backfill (20 redistributable entries
  backfilled with conservative defaults).

### Changed
- `bin/statuslines.js validate()` now returns `{ errs, warns }` so capability gaps
  surface as `WARN` lines during the rollout grace period without blocking `doctor`.

---

## [0.4.0] — Supply-chain hardening Phases B–E (SAST / SCA / SAIST / Socket.dev / catalog-SAST)

### Security
- **Phase B/C/D — Datadog SAST, SCA, SAIST, Socket.dev workflows.** All six workflows
  are fail-closed (exit 0 with a warning when secrets are absent; safe to merge before
  keys land):
  - `datadog-sast-self.yml`: daily + per-PR static analysis of in-repo code via
    `DataDog/datadog-static-analyzer-github-action@v3`; per-step secret guard for fork-PR safety.
  - `datadog-sca-self.yml`: weekly SCA with `reachability: true` to filter vuln noise to
    actually-called code paths.
  - `datadog-saist-self.yml`: AI-augmented SAST (detection + validation two-pass) via Ollama
    Cloud; currently triggers only on `.py`/`.go` changes (upstream SAIST supports
    Java/Python/Go). `OPENAI_BASE_URL` must not include `/v1` — the SAIST client appends
    it internally (`internal/clients/openai.go`).
  - `catalog-socket-feed.yml` + `scripts/socket-feed.mjs`: daily Socket.dev malicious-package
    feed sweep; HTTP Basic auth (token as username, empty password — Bearer is rejected by
    Socket's API); auto-quarantines entries on high/critical alerts.
- **Phase E — Catalog-wide SAST workflow.** `scripts/catalog-sast.mjs` + `.github/workflows/catalog-sast.yml`
  run Datadog static analyzer weekly (Mon 08:11 UTC) against each redistributable entry's
  source (npm tarball or `git clone`); opens bot PRs for quarantine/backfill. DD_API_KEY
  gates the Datadog upload only — the analyzer itself runs offline, open-source.
- `catalog-doctor.yml` and `catalog-liveness.yml` scaffolded; liveness probe detects version
  drift, integrity drift, license drift, repo redirects, and upstream-advanced-since-pin
  scenarios; opens or comments on a single tracking issue tagged `catalog-liveness`.

---

## [0.3.0] — Phase A: catalog schema enforcement, audit command, and quarantine

### Added
- `bin/statuslines.js audit [<slug>] [--dry-run]`: probes npm registry, backfills
  `install.version`, `install.integrity`, `security.has_install_scripts`,
  `security.license_observed`, `security.last_audit`; rewrites `@latest` pins;
  injects `--ignore-scripts` into `npx` commands.
- `catalog/QUARANTINE.md` as the forensic record for quarantined entries (always
  written; reveals hidden entries and reasons).
- 9 npm-resolvable entries backfilled with pinned versions and integrity SRI hashes
  (`ccstatusline 2.2.12`, `ccusage 18.0.11`, `lucasilverentand-claudeline 1.11.0`,
  `owloops-claude-powerline 1.26.0`, `thisdot-context-statusline 0.2.2`,
  `tokscale 2.0.27`, `ainsley-opencode-token-monitor 0.5.0`,
  `joaquinvesapa-sub-agent-statusline 0.5.4`, `ramtinj95-opencode-tokenscope 1.6.3`).
- `security { has_install_scripts, license_observed, last_audit, quarantined,
  quarantine_reason, quarantined_at }` block added to the schema.

### Changed
- `list` / `show` / `configure` / `render-readme` / `render-top-readme` all filter
  out quarantined entries by default (OpenBSD-style secure-by-default). Visibility
  requires `STATUSLINES_REVEAL_QUARANTINE=1`; `configure` additionally requires
  `--ignore-quarantine`.
- `list` reports a hidden-count footer when entries are filtered.

### Security
- **Phase A — Schema enforcement.** `doctor` now refuses: non-pinned versions on
  redistributable entries, `@latest` in `configs.<cli>`, dangerous patterns
  (`curl|sh`, `wget|sh`, `eval(`, `base64 -d`, `<repository-url>` placeholders),
  and missing `quarantine_reason` when `quarantined: true`.
- `--ignore-scripts` injected into all `npx` configure recipes as the default.
- 0 of 9 npm-resolvable entries declare lifecycle install scripts
  (`preinstall`/`postinstall`/`install`/`prepare`) — belt-and-suspenders baseline confirmed.

---

## [0.2.0] — Curated catalog with CLI tooling (14 entries)

### Added
- `catalog/<cli>/<slug>.json` structure: one JSON file per entry per target CLI
  (`claude/`, `opencode/`, `gemini/`, `codex/`, `multi/`).
- `bin/statuslines.js` catalog CLI with `list`, `show`, `configure`, `doctor`,
  `render-readme`, and `render-top-readme` subcommands.
- 14 initial catalog entries: initial batch (5 verified-install, 1 OpenCode),
  then a round-2 batch of 9 more (3 verified, 6 listed-for-reference). Covers
  Claude Code, OpenCode, Gemini CLI, and Codex CLI targets.
- `catalog/README.md` as the exhaustive per-entry table (status, install type,
  language); `catalog/SCHEMA.md` with field-by-field rules.
- `catalog/QUARANTINE.md` stub.
- Top-level `README.md` restructured as a curated catalog landing page with quick-start,
  support matrix, layout tree, contributing guide, and roadmap.
- `install.integrity` (SRI hash), `redistributable`, `install.type`, and
  `configs.<cli>` fields defined in the schema.

### Changed
- `configure` skips entries whose license is not redistributable; those remain
  listed for reference.
- Top README converted from a multi-flavor statusline guide to a catalog index.

---

## [0.1.0] — Initial in-repo statuslines (GSD + pup flavors)

### Added
- `lib/`: shared helpers — `bar.js`, `colors.js`, `git.js`, bridge file I/O,
  and a stdin guard.
- `gsd/` flavor (GSD = context health): statuslines and `PostToolUse` /
  `tool.execute.after` / `AfterTool` context monitors for Claude Code, OpenCode,
  Gemini CLI, and Codex CLI. Bridge file at
  `/tmp/statuslines-<tool>-ctx-<session>.json` carries `used_pct` +
  `remaining_percentage`; 60 s freshness guard, 5-call debounce, CRITICAL
  escalation bypasses debounce.
- `pup/` flavor (Datadog observability): reads recent events from
  `pup events list --duration 5m --output json` via a TTL-gated cache
  (`O_EXCL` lockfile, 60 s TTL, ≤250 ms stale-fallback for concurrent renders).
  Auth/rate-limit/ENOENT errors surfaced as visible bar labels rather than
  silent failures. `pup/cli.js` with `fetch` and `show` subcommands.
- `examples/`: paste-in config snippets per CLI.
- `install/install-gsd.sh` and `install/install-pup.sh`: `jq`-based
  `settings.json` / config mergers.

---

[Unreleased]: https://github.com/datadog-labs/statuslines/compare/HEAD...HEAD
[0.7.0]: https://github.com/datadog-labs/statuslines/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/datadog-labs/statuslines/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/datadog-labs/statuslines/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/datadog-labs/statuslines/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/datadog-labs/statuslines/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/datadog-labs/statuslines/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/datadog-labs/statuslines/releases/tag/v0.1.0

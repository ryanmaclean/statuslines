# Security

The catalog auto-resolves third-party code into install commands users run
with full shell privileges. Treating that surface seriously means layered
defenses, not single-tool reliance.

## Threat model (short version)

| # | Threat | Real-world precedent | How we mitigate |
|---|---|---|---|
| T1 | Maintainer takeover republishes malicious version | npm `event-stream`, `ua-parser-js` | pinned versions, integrity hashes, Socket.dev feed, version-bump diff |
| T2 | Postinstall scripts run on `npx` | trivial; ubiquitous | `--ignore-scripts` default, `has_install_scripts` detection |
| T3 | Typosquat / look-alike package | "claudeline" has two distinct upstreams | `<owner>-<slug>` naming, doctor enforcement |
| T4 | Upstream license regression | rare but real | weekly liveness probe re-checks registry license |
| T5 | Repo deleted / transferred / 301 | npm package transfers happen | liveness probe HEADs every repo daily |
| T6 | Git-HEAD malice | `colors.js`, `faker.js` self-sabotage | git entries pin to commit SHA or signed tag |
| T7 | CVE in transitive deps | constant npm churn | Datadog SCA reachability analysis |
| T8 | curl-pipe-bash | refused at the doctor level |
| T9 | Malicious catalog PR | possible | doctor pattern-checks (`curl|sh`, `eval(`, `<repository-url>`, `@latest`) |

## Defense layers (status)

| Layer | What | Status |
|---|---|---|
| Schema enforcement | `doctor` refuses unpinned versions, dangerous patterns, missing quarantine reasons | ✅ shipped (Phase A) |
| Postinstall detection | `audit` flags npm packages declaring lifecycle scripts | ✅ shipped |
| `--ignore-scripts` default | `configure` injects `--ignore-scripts` into `npx` recipes | ✅ shipped |
| Hide-on-quarantine | OpenBSD-style: quarantined entries vanish from `list`/`show`/`configure` | ✅ shipped |
| Liveness probe | daily HEAD on repos + npm registry version match + license drift | ✅ shipped (no secrets) |
| Datadog SAST | rule-based static analysis on our own code | wired (workflow lands secret-gated) |
| Datadog SCA | SBOM + vuln + reachability on our dependencies | wired |
| Datadog SAIST | AI-augmented SAST, two-pass detect+validate | wired (currently Java/Python/Go only upstream) |
| Socket.dev feed | hourly malicious-package alert lookup | wired |
| Version-bump diff bot | tarball diff on every upgrade PR | planned (Phase E) |
| PQC signing | hybrid Ed25519 + SLH-DSA on catalog entries | planned (Phase F) |
| Capability sandbox | per-entry network/filesystem permission declarations | planned (Phase G) |

## Required repository configuration

Workflows fail closed if their secrets are unset — they print a warning and
exit cleanly, so this repo is safe to merge before keys land. To turn each
layer on, set these in **Settings → Secrets and variables → Actions**:

| Secret name | Used by | Required? |
|---|---|---|
| `DD_API_KEY` | datadog-sast-self.yml, datadog-sca-self.yml, datadog-saist-self.yml | for SAST/SCA/SAIST |
| `DD_APP_KEY` | same — needs `code_analysis_read` scope | for SAST/SCA |
| `OLLAMA_API_KEY` | datadog-saist-self.yml — Ollama Cloud bearer | for SAIST |
| `SOCKET_API_TOKEN` | catalog-socket-feed.yml | for the daily npm-package risk feed |

Optional repository **Variables** (not secrets):

| Variable | Default | Used by |
|---|---|---|
| `DD_SITE` | `datadoghq.com` | SAST/SCA/SAIST workflows |
| `OPENAI_BASE_URL` | `https://ollama.com` | SAIST workflow — Ollama Cloud is OpenAI-compatible. **Do not include `/v1`** — SAIST's OpenAI client appends it internally (verified against `internal/clients/openai.go`); double-`/v1` will break the request. |
| `SAIST_DETECTION_MODEL` | per workflow | SAIST detection pass |
| `SAIST_VALIDATION_MODEL` | per workflow | SAIST validation pass |

## Reporting a vulnerability

For issues in this repo's own code or workflow logic, please open a GitHub
security advisory rather than a public issue. For issues in **catalog
entries** (third-party packages we list), file upstream first; we'll
quarantine on confirmation.

## Auditing

Every entry's last security probe is recorded in `security.last_audit` and
the integrity hash + observed license live alongside. Quarantined entries
are listed in [`catalog/QUARANTINE.md`](catalog/QUARANTINE.md) regardless
of CLI visibility settings — that file is the explicit forensic record.

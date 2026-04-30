# Capability declarations

**Languages:** English · [Français](./CAPABILITIES.fr.md) · [日本語](./CAPABILITIES.ja.md)

Phase G of the security plan: every redistributable catalog entry declares the *capabilities* it expects to use, and CI runs the install inside a sandbox to confirm the declaration is honest. Think Android permissions for npm — a contributor declares what their tool needs, and the catalog refuses (or quarantines) anything caught reaching for more at install or first run.

## The four declared dimensions

Each redistributable entry's JSON carries a `capabilities` block:

```json
"capabilities": {
  "network": true,
  "child_process": true,
  "filesystem_write": false,
  "env_read": ["HOME", "PATH"],
  "verified_at": null,
  "verification_method": "declared"
}
```

| Field | Type | Meaning |
|---|---|---|
| `network` | `boolean` | The install **or** first run-time invocation makes outbound network calls (npm registry, telemetry, license checks, etc.). Most entries are `true` — they fetch their own tarball. |
| `child_process` | `boolean` | The entry spawns child processes other than the binary itself (e.g. `git`, `gh`, `tput`, a sub-tool). `npx` resolution alone counts as `true`. |
| `filesystem_write` | `boolean` | The entry writes files **outside** the safe roots: `$HOME/.cache`, `$TMPDIR`, the install dir. Writes inside those are allowed by default and are not flagged. Set to `true` if the entry persists state to `$HOME/<dotfile>` or similar. |
| `env_read` | `string[]` | Names of environment variables the entry expects to read. Conservative default: `["HOME", "PATH"]`. Use `["*"]` to mean "any" — and add a `notes` field justifying it. |
| `verified_at` | `string \| null` | ISO date of the last sandbox observation that matched the declarations. `null` = declared but not yet verified. |
| `verification_method` | `"declared" \| "sandbox-strace" \| "sandbox-bpf" \| "skipped"` | How the verification was performed. `declared` = self-attestation only; `sandbox-strace` = observed under strace inside firejail/bubblewrap; `skipped` = the install type (`manual`, `brew`, `cargo`) is not yet sandboxed. |

## What each enforces

The capability declaration is enforced in two places:

1. **`bin/statuslines.js doctor`** — the schema validator emits a *warning* when `capabilities` is missing on a redistributable entry. The warning will become a hard error once every entry has been backfilled (rollout: see SECURITY.md).
2. **`catalog-capabilities` workflow** — runs `node scripts/verify-capabilities.mjs <slug>` for each redistributable entry that has an automatable install (`npx`, `npm-global`, `opencode-plugin`, `git`). If observed behavior exceeds the declaration, the entry is quarantined (`security.quarantined: true`) with a reason recorded under `security.quarantine_reason`. Entries that match get their `verified_at` and `verification_method` refreshed.

The "safe roots" for `filesystem_write` are intentionally narrow:

- `$HOME/.cache/` — npm/npx caches their tarballs here; that's expected.
- `$TMPDIR` (typically `/tmp` on Linux) — short-lived scratch is allowed.
- The install dir for `git` entries (`~/.local/share/statuslines/<clone_dir>`).

A write to `$HOME/.config/<tool>` or `$HOME/.<tool>rc` is **not** allowed by default — declare `filesystem_write: true` and explain in `notes`.

## How the sandbox works

`scripts/verify-capabilities.mjs` runs the install or first-run invocation under (in order of preference):

1. **`firejail --noprofile --net={none|eth0}`** — preferred on `ubuntu-latest`. Two passes: `--net=none` first to detect whether network is *actually required*, then `--net=eth0` with `strace -f -e trace=network,process,%file` to capture the syscall trail.
2. **`bubblewrap` (`bwrap`)** — fallback if firejail isn't on `PATH`. Equivalent isolation, slightly more verbose invocation.
3. **`strace` only** — last-resort fallback when neither sandbox is available. Loud warning to stderr; CI never relies on this path.

The strace filter we settled on is:

```
strace -f -e trace=network,process,%file -o <log>
```

`network` covers `connect()`, `sendto()`, `bind()` (host-resolution, outbound TLS); `process` covers `execve()`, `clone()`, `fork()`; `%file` covers `openat()`/`open()` with write flags. Following forks (`-f`) is mandatory — npm and npx fan out aggressively.

## Default values for the bootstrap

When backfilling a new entry, start with the *most-permissive* defaults and let the sandbox tighten them:

```json
"capabilities": {
  "network": true,
  "child_process": true,
  "filesystem_write": false,
  "env_read": ["HOME", "PATH"],
  "verified_at": null,
  "verification_method": "declared"
}
```

`network: true` is correct for almost every entry — they call the npm registry, fetch tokens, check for updates. `child_process: true` is true for git installs and most npm packages. `filesystem_write: false` is the cautious default; the sandbox will tell us whether it's actually needed. `env_read` is conservative on purpose; bump it explicitly when you find out the tool reads `ANTHROPIC_API_KEY`, `CLAUDE_CONFIG_DIR`, etc.

## Contributor workflow

When you add or update an entry:

1. **Declare** the capabilities block at the most-permissive default (above) if you're unsure — the sandbox will narrow it.
2. **Run locally** if you have firejail installed: `node scripts/verify-capabilities.mjs <slug>`. Inspect the JSON report; if `exceeds_declared: true`, either tighten the actual code or widen the declaration.
3. **Smoke test** without sandbox: `node bin/statuslines.js verify-capabilities <slug> --dry-run` prints the canned report shape.
4. **Open the PR.** The weekly `catalog-capabilities` workflow will independently re-verify on `ubuntu-latest`. If your declaration is honest, the bot's PR will simply refresh `verified_at`. If it isn't, your entry is quarantined and a reviewer will reach out.

## Why these four dimensions

- **`network`** — the most common supply-chain attack surface. Fetching an extra payload at first run, beaconing to telemetry, exfiltrating env vars.
- **`child_process`** — a tool that spawns `sh -c` or `bash` is wildly more dangerous than one that only computes. Declaring `child_process: false` is a strong, machine-checkable claim.
- **`filesystem_write`** — credential harvesters frequently drop a marker file or rewrite shell rc files. Bounding writes to known-safe roots makes these stand out immediately under strace.
- **`env_read`** — environment variables are how secrets travel; a status-line tool that reads `OPENAI_API_KEY` should explain *why*.

We deliberately do *not* declare `cpu`, `memory`, or `time` — the catalog doesn't host runtime-quota policy, and statuslines are short-lived. Phase G is about consent, not resource control.

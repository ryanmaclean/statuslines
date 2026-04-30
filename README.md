# statuslines

Statusline scripts for Claude Code, OpenCode, Gemini CLI, and Codex CLI.

Two flavors live side-by-side:

- **`gsd/`** — context-health style, modeled after [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done): renders model · dir · git · context-bar, and injects WARNING/CRITICAL messages into the agent loop as the context window fills.
- **`pup/`** — Datadog observability, surfaces recent **events** from [datadog-labs/pup](https://github.com/datadog-labs/pup) (last 5 min by default), grouped by `alert_type`.

The two are complementary, not competing: GSD watches *agent* health, pup watches *production* health. Both can run at once.

## Support matrix

| CLI | Custom statusline | After-tool hook | Approach |
|---|---|---|---|
| Claude Code | yes (`statusLine.command`) | yes (`PostToolUse`) | `gsd/claude/statusline.js` + `context-monitor.js` |
| OpenCode | yes (`statusLine.command`) | yes (plugin `tool.execute.after`) | `gsd/opencode/statusline.js` + `context-monitor.js` |
| Gemini CLI | **no** ([#8191](https://github.com/google-gemini/gemini-cli/issues/8191)) | yes (`AfterTool`) | hook only — `gsd/gemini/context-monitor.js` |
| Codex CLI | only built-in items ([#14043](https://github.com/openai/codex/issues/14043), [#17827](https://github.com/openai/codex/issues/17827)) | yes (`~/.codex/hooks/`) | external HUD daemon — `gsd/codex/hud.js` |

## Layout

```
lib/                shared helpers (bar, colors, git, bridge file, stdin guard)
gsd/                context-health implementation
  claude/           statusline + PostToolUse monitor
  opencode/         statusline + plugin monitor
  gemini/           AfterTool monitor (no statusline upstream)
  codex/            HUD daemon (tmux-aware, polls ~/.codex/sessions)
pup/                Datadog observability flavor (Phase 3)
examples/           paste-in config snippets per CLI
install/            installer scripts
```

## Quick start

Requires Node ≥ 20 and `jq`.

```sh
# install all three that have a settings file (Claude, OpenCode, Gemini)
./install/install-gsd.sh --all

# or pick one
./install/install-gsd.sh --claude
./install/install-gsd.sh --opencode
./install/install-gsd.sh --gemini
```

Codex needs the HUD as a side process (no native command-statusline yet):

```sh
tmux new-session -d -s codex \
  'node ./gsd/codex/hud.js watch'
# or one-shot:
node ./gsd/codex/hud.js once
```

## How the GSD pattern works

1. The statusline script reads JSON on stdin (per the host CLI's contract), renders one line of output, and writes a freshness-stamped JSON file at `${TMPDIR}/statuslines-<tool>-ctx-<session>.json`.
2. The after-tool hook reads that bridge file, fires `WARNING` at ≤35% remaining and `CRITICAL` at ≤25% remaining, and emits an `additionalContext` payload back into the agent loop.
3. The hook debounces to one warning per 5 tool calls — except CRITICAL escalation, which bypasses the debounce.
4. Bridge entries older than 60 seconds are ignored (stale-data guard).

For Gemini there's no statusline to write a bridge file, so the hook estimates token usage from `transcript_path` directly (preferring `usageMetadata.totalTokenCount` lines, falling back to `chars/4`).

For Codex there's no PostToolUse hook *and* no custom-command statusline, so the HUD daemon polls `~/.codex/sessions/**/rollout-*.jsonl` for `token_count` events and renders to either tmux's `status-right` or stdout.

## pup flavor — how API calls stay bounded

The pup statuslines never call `pup` from the render path. They read a TTL-gated cache:

1. Render reads `${TMPDIR}/statuslines-pup-events.json`.
2. If the cache is **fresher than `ttl_seconds`** (default 60s), it's used as-is.
3. If stale, the render acquires a lockfile (`O_EXCL`); if another render holds the lock, it waits ≤250ms, then falls back to the stale cache rather than queueing more API calls.
4. The lock holder shells out to `pup events list --duration 5m --output json` once, atomically writes the result, releases the lock.
5. Errors (auth, rate-limit, ENOENT) are written into the cache and surfaced in the bar (`pup:auth?`, `pup:rate-limited`, `pup:not installed`) — no retry storms.
6. Every fetch is logged to `${TMPDIR}/statuslines-pup.log`.

Cache age is shown in the bar (e.g. `pup:✓3 ⚠1 ✗0 (45s)`); past 5min it's marked `(stale)` and dimmed.

### Config

`~/.config/statuslines/pup.json` (or `STATUSLINES_PUP_*` env vars):

| key | default | meaning |
|---|---|---|
| `ttl_seconds` | `60` | min seconds between `pup` calls |
| `duration` | `"5m"` | window passed to `pup events list --duration` |
| `tags` | `null` | passed as `--tags` |
| `priority` | `null` | `normal` / `low` |
| `alert_type` | `null` | `error` / `warning` / `info` / `success` / `user_update` |
| `sources` | `null` | passed as `--sources` |
| `max_events` | `50` | passed as `--limit` |
| `pup_bin` | `"pup"` | override binary path |

A starter file lives at `examples/pup.config.json`. Seed it with `./install/install-pup.sh --seed-config`.

### Quick start (pup)

```sh
brew tap datadog-labs/pack && brew install datadog-labs/pack/pup
pup auth login
./install/install-pup.sh --all --seed-config
node ./pup/cli.js fetch    # warm cache
node ./pup/cli.js show     # preview segment
```

For Codex (no native command-statusline yet):
```sh
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## Catalog of third-party statuslines

In addition to our two flavors, this repo maintains a curated catalog of other statuslines and related tools across all four CLIs. Each entry is a JSON file under `catalog/<cli>/<slug>.json` with a verified license, a one-sentence description, and an install recipe. Entries with OSI-permissive licenses ship a runnable install/configure command; non-redistributable entries are listed for reference but skipped by `configure`.

```sh
node bin/statuslines.js list                          # all entries
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline             # full metadata
node bin/statuslines.js configure ccstatusline --cli=claude --dry-run
node bin/statuslines.js configure ccstatusline --cli=claude
node bin/statuslines.js doctor                        # validate every entry
node bin/statuslines.js render-readme                 # refresh catalog/README.md
```

See [catalog/README.md](catalog/README.md) for the rendered table and per-entry detail; [catalog/SCHEMA.md](catalog/SCHEMA.md) for the entry format and the rules for adding one.

## Roadmap

- Phase 1: GSD-style across all four CLIs. ✅
- Phase 2: example configs + installer. ✅
- Phase 3: `pup/` flavor — events with TTL-gated cache. ✅
- Phase 4: catalog of third-party statuslines with install/configure CLI. ✅
- Phase 5: side-by-side comparison doc once both flavors have real-use feedback; richer pup segments (monitors, incidents) behind opt-in flags.

## License

MIT

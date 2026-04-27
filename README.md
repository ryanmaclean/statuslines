# statuslines

Statusline scripts for Claude Code, OpenCode, Gemini CLI, and Codex CLI.

Two flavors live side-by-side:

- **`gsd/`** — context-health style, modeled after [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done): renders model · dir · git · context-bar, and injects WARNING/CRITICAL messages into the agent loop as the context window fills.
- **`pup/`** — Datadog observability, surfaces signals from [datadog-labs/pup](https://github.com/datadog-labs/pup) (monitor states, incidents, deploy markers). *Not built yet — Phase 3.*

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

## Roadmap

- Phase 1 (this PR): GSD-style implementation across all four CLIs. ✅
- Phase 2: example configs + installer. ✅
- Phase 3: `pup/` mirror — Datadog observability metrics in each statusline.
- Phase 4: side-by-side comparison doc once both flavors exist.

## License

MIT

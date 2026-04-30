# Catalog

Third-party statuslines and related tools for Claude Code, OpenCode, Gemini CLI, and Codex CLI. Generated from `catalog/<cli>/<slug>.json` — do not edit by hand.

Legend: **ok** = OSI-permissive license, install/configure recipes shipped. **ref** = listed for reference; install per upstream.

| Slug | Name | Targets | License | Lang | Status | Install |
|---|---|---|---|---|---|---|
| `ainsley-opencode-token-monitor` | [opencode-token-monitor](https://github.com/Ainsley0917/opencode-token-monitor) | opencode | MIT | typescript | ok | opencode-plugin |
| `b-open-statusline` | [b-open-io/statusline](https://github.com/b-open-io/statusline) | claude | MIT | typescript | ok | git |
| `capedbitmap-codex-hud` | [codex-hud (Capedbitmap)](https://github.com/Capedbitmap/codex-hud) | codex | PolyForm-Noncommercial-1.0.0 | swift | ref | manual |
| `ccometixline` | [CCometixLine](https://github.com/Haleclipse/CCometixLine) | claude | MIT | rust | ok | manual |
| `ccstatusline` | [ccstatusline](https://github.com/sirmalloc/ccstatusline) | claude | MIT | typescript | ok | npx |
| `ccusage` | [ccusage](https://github.com/ryoppippi/ccusage) | claude, codex | MIT | typescript | ok | npx |
| `claude-hud` | [claude-hud](https://github.com/jarrodwatts/claude-hud) | claude | MIT | typescript | ok | manual |
| `felipeelias-claude-statusline` | [claude-statusline (Felipe Elias)](https://github.com/felipeelias/claude-statusline) | claude | MIT | go | ok | brew |
| `fredrikaverpil-claudeline` | [claudeline (Fredrik Averpil)](https://github.com/fredrikaverpil/claudeline) | claude | MIT | go | ok | manual |
| `fwyc-codex-hud` | [codex-hud (fwyc0573)](https://github.com/fwyc0573/codex-hud) | codex | MIT | typescript | ok | manual |
| `lucasilverentand-claudeline` | [claudeline (Luca Silverentand)](https://github.com/lucasilverentand/claudeline) | claude | MIT | typescript | ok | npx |
| `markwilkening-opencode-status-line` | [opencode-status-line](https://github.com/markwilkening21/opencode-status-line) | opencode | MIT | shell | ok | git |
| `opencode-quota` | [opencode-quota](https://github.com/slkiser/opencode-quota) | opencode | MIT | typescript | ok | manual |
| `thisdot-context-statusline` | [@this-dot/claude-code-context-status-line](https://github.com/thisdot/claude-code-context-status-line) | claude | MIT | typescript | ok | npx |
| `tokscale` | [tokscale](https://github.com/junhoyeo/tokscale) | claude, opencode, gemini, codex | MIT | typescript | ok | npx |

## Per-entry detail

### `ainsley-opencode-token-monitor` — [opencode-token-monitor](https://github.com/Ainsley0917/opencode-token-monitor)

- **License:** MIT
- **Targets:** opencode
- **Description:** OpenCode plugin (not a statusline) that registers `token_stats` / `token_history` / `token_export` tools and emits toast notifications with input, output, reasoning, and cache token breakdowns.
- **Notes:** Listed in the catalog because it complements an OpenCode statusline rather than replacing one — its output is tool results and toasts, not a `statusLine.command` line. OpenCode loads it from npm at session start once the `plugin` array is configured.
- **Install:** OpenCode loads `opencode-token-monitor` from npm at session start (added via `opencode.json` `plugin` array)
- **Configure:** `node bin/statuslines.js configure ainsley-opencode-token-monitor --cli=<opencode>`

### `b-open-statusline` — [b-open-io/statusline](https://github.com/b-open-io/statusline)

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code statusline that auto-detects the active model's context window (1M for [1m] suffixed models, 200k otherwise) with widgets for tokens, git, and a 5-hour block timer.
- **Notes:** Run `npm install` in the cloned directory before first use; check the upstream README for the current entry point if `index.js` has moved.
- **Install:** `git clone` (handled by `bin/statuslines.js configure`)
- **Configure:** `node bin/statuslines.js configure b-open-statusline --cli=<claude>`

### `capedbitmap-codex-hud` — [codex-hud (Capedbitmap)](https://github.com/Capedbitmap/codex-hud)

- **License:** PolyForm-Noncommercial-1.0.0 (not redistributable; reference only)
- **Targets:** codex
- **Description:** macOS menu-bar app that ingests local Codex session data and recommends the next account to use based on weekly reset timing and remaining capacity.
- **Notes:** Source-available, not OSI-open-source. Listed for reference; we don't ship install recipes for non-redistributable entries.
- **Install:** see upstream

### `ccometixline` — [CCometixLine](https://github.com/Haleclipse/CCometixLine)

- **License:** MIT
- **Targets:** claude
- **Description:** Fast Rust-based Claude Code statusline with an interactive TUI configurator, git integration, and usage tracking.
- **Notes:** No verified package-manager install; follow upstream build/release instructions.
- **Install:** see upstream

### `ccstatusline` — [ccstatusline](https://github.com/sirmalloc/ccstatusline)

- **License:** MIT
- **Targets:** claude
- **Description:** Customizable Claude Code statusline with an interactive TUI configurator, powerline rendering, themes, and widgets for tokens, git, session timers, and clickable links.
- **Install:** `npx -y ccstatusline@latest`
- **Configure:** `node bin/statuslines.js configure ccstatusline --cli=<claude>`

### `ccusage` — [ccusage](https://github.com/ryoppippi/ccusage)

- **License:** MIT
- **Targets:** claude, codex
- **Description:** Token-usage and cost analyzer that parses local Claude Code and Codex session JSONL files; not a statusline itself, but a useful data source to compose into one.
- **Notes:** Run `npx -y ccusage@latest` for daily/monthly/session reports; pipe into a custom statusline for richer cost segments.
- **Install:** `npx -y ccusage@latest`

### `claude-hud` — [claude-hud](https://github.com/jarrodwatts/claude-hud)

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code plugin/statusline that surfaces context usage, active tools, running subagents, todo progress, and rate-limit windows using the native statusline API.
- **Notes:** Distributed as a Claude Code plugin; see upstream README for the current install command.
- **Install:** see upstream

### `felipeelias-claude-statusline` — [claude-statusline (Felipe Elias)](https://github.com/felipeelias/claude-statusline)

- **License:** MIT
- **Targets:** claude
- **Description:** Go binary statusline for Claude Code with module-based config, OSC 8 hyperlinks, and theme presets (catppuccin, tokyo-night, gruvbox-rainbow, and others).
- **Notes:** Brew install drops a `claude-statusline` binary on PATH. Alternative install: `go install github.com/felipeelias/claude-statusline@latest`. Customize via `~/.config/claude-statusline/config.toml` (see upstream).
- **Install:** `brew install claude-statusline` (tap: `felipeelias/tap`)
- **Configure:** `node bin/statuslines.js configure felipeelias-claude-statusline --cli=<claude>`

### `fredrikaverpil-claudeline` — [claudeline (Fredrik Averpil)](https://github.com/fredrikaverpil/claudeline)

- **License:** MIT
- **Targets:** claude
- **Description:** Minimalistic Go statusline for Claude Code distributed as a Claude Code plugin; the plugin's `/claudeline:setup` slash command downloads the binary and patches settings.json.
- **Notes:** Install flow runs entirely inside Claude Code: `/plugin marketplace add fredrikaverpil/claudeline` → `/plugin install claudeline@claudeline` → `/claudeline:setup`. The setup command writes `{"statusLine":{"type":"command","command":"claudeline"}}` itself, so we don't ship a `configs.claude` patch. Manual fallback: `go install github.com/fredrikaverpil/claudeline@latest`, then add the same snippet by hand.
- **Install:** see upstream

### `fwyc-codex-hud` — [codex-hud (fwyc0573)](https://github.com/fwyc0573/codex-hud)

- **License:** MIT
- **Targets:** codex
- **Description:** Real-time tmux statusline HUD for OpenAI Codex CLI with session/context usage, git status, and tool-activity monitoring; includes --kill / --list / --attach / --self-check subcommands.
- **Notes:** Codex CLI has no native command-statusline yet, so this runs as an external HUD — start it under tmux per upstream docs.
- **Install:** see upstream

### `lucasilverentand-claudeline` — [claudeline (Luca Silverentand)](https://github.com/lucasilverentand/claudeline)

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code statusline shipped as the npm package `claudeline` with built-in themes; can self-install into settings.json via its `--install` flag.
- **Notes:** Distinct from fredrikaverpil/claudeline (Go binary) despite the shared name. The package's `--install` flag patches settings.json automatically; the configs.claude here is the same snippet that flag would write.
- **Install:** `npx -y claudeline@latest`
- **Configure:** `node bin/statuslines.js configure lucasilverentand-claudeline --cli=<claude>`

### `markwilkening-opencode-status-line` — [opencode-status-line](https://github.com/markwilkening21/opencode-status-line)

- **License:** MIT
- **Targets:** opencode
- **Description:** Lightweight, fast status line for OpenCode CLI.
- **Notes:** Verify the entry script name in the upstream repo before relying on the configured command.
- **Install:** `git clone` (handled by `bin/statuslines.js configure`)
- **Configure:** `node bin/statuslines.js configure markwilkening-opencode-status-line --cli=<opencode>`

### `opencode-quota` — [opencode-quota](https://github.com/slkiser/opencode-quota)

- **License:** MIT
- **Targets:** opencode
- **Description:** OpenCode quota and token-usage display with zero context-window pollution; supports providers including OpenCode Go, Cursor, GitHub Copilot, and others.
- **Notes:** Follow upstream README for the current install path; project surface evolves quickly.
- **Install:** see upstream

### `thisdot-context-statusline` — [@this-dot/claude-code-context-status-line](https://github.com/thisdot/claude-code-context-status-line)

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code statusline that parses session JSONL transcripts to compute input + cache-creation + cache-read tokens for an accurate context-window display.
- **Notes:** Last published 2025-09-27 (v0.2.2); originally tuned for AWS Bedrock-hosted models but works for any Claude Code session.
- **Install:** `npx -y @this-dot/claude-code-context-status-line@latest`
- **Configure:** `node bin/statuslines.js configure thisdot-context-statusline --cli=<claude>`

### `tokscale` — [tokscale](https://github.com/junhoyeo/tokscale)

- **License:** MIT
- **Targets:** claude, opencode, gemini, codex
- **Description:** Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.
- **Notes:** Use as a data source for a custom statusline (e.g. `npx -y tokscale@latest --json`) rather than as the statusline itself.
- **Install:** `npx -y tokscale@latest`

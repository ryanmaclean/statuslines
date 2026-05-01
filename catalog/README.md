# Catalog

**Languages:** English · [Français](./README.fr.md) · [日本語](./README.ja.md)

Third-party statuslines and related tools for Claude Code, OpenCode, Gemini CLI, and Codex CLI. Generated from `catalog/<cli>/<slug>.json` — do not edit by hand.

Legend: **ok** = OSI-permissive license, install/configure recipes shipped. **ref** = listed for reference; install per upstream.

| Slug | Name | Targets | License | Lang | Status | Install |
|---|---|---|---|---|---|---|
| `ainsley-opencode-token-monitor` | [opencode-token-monitor](https://github.com/Ainsley0917/opencode-token-monitor) | opencode | MIT | typescript | ok | opencode-plugin |
| `capedbitmap-codex-hud` | [codex-hud (Capedbitmap)](https://github.com/Capedbitmap/codex-hud) | codex | PolyForm-Noncommercial-1.0.0 | swift | ref | manual |
| `ccometixline` | [CCometixLine](https://github.com/Haleclipse/CCometixLine) | claude | MIT | rust | ok | manual |
| `ccstatusline` | [ccstatusline](https://github.com/sirmalloc/ccstatusline) | claude | MIT | typescript | ok | npx |
| `ccusage` | [ccusage](https://github.com/ryoppippi/ccusage) | claude, codex | MIT | typescript | ok | npx |
| `claude-hud` | [claude-hud](https://github.com/jarrodwatts/claude-hud) | claude | MIT | typescript | ok | manual |
| `daniel3303-claude-statusline` | [ClaudeCodeStatusLine (Daniel Graczer)](https://github.com/daniel3303/ClaudeCodeStatusLine) | claude | MIT | shell | ref | manual |
| `dwillitzer-claude-statusline` | [claude-statusline (dwillitzer)](https://github.com/dwillitzer/claude-statusline) | claude | MIT | shell | ref | manual |
| `felipeelias-claude-statusline` | [claude-statusline (Felipe Elias)](https://github.com/felipeelias/claude-statusline) | claude | MIT | go | ok | brew |
| `fredrikaverpil-claudeline` | [claudeline (Fredrik Averpil)](https://github.com/fredrikaverpil/claudeline) | claude | MIT | go | ok | manual |
| `fwyc-codex-hud` | [codex-hud (fwyc0573)](https://github.com/fwyc0573/codex-hud) | codex | MIT | typescript | ok | manual |
| `hagan-claudia-statusline` | [claudia-statusline](https://github.com/hagan/claudia-statusline) | claude | MIT | rust | ok | manual |
| `joaquinvesapa-sub-agent-statusline` | [opencode-subagent-statusline](https://github.com/Joaquinvesapa/sub-agent-statusline) | opencode | MIT | typescript | ok | opencode-plugin |
| `kiriketsuki-gemini-statusline` | [gemini-statusline](https://github.com/Kiriketsuki/gemini-statusline) | gemini | Unspecified | shell | ref | manual |
| `lucasilverentand-claudeline` | [claudeline (Luca Silverentand)](https://github.com/lucasilverentand/claudeline) | claude | MIT | typescript | ok | npx |
| `markwilkening-opencode-status-line` | [opencode-status-line](https://github.com/markwilkening21/opencode-status-line) | opencode | MIT | shell | ok | git |
| `ndave92-claude-code-status-line` | [claude-code-status-line (ndave92)](https://github.com/ndave92/claude-code-status-line) | claude | MIT | rust | ok | manual |
| `opencode-quota` | [opencode-quota](https://github.com/slkiser/opencode-quota) | opencode | MIT | typescript | ok | manual |
| `owloops-claude-powerline` | [claude-powerline](https://github.com/Owloops/claude-powerline) | claude | MIT | typescript | ok | npx |
| `ramtinj95-opencode-tokenscope` | [opencode-tokenscope](https://github.com/ramtinJ95/opencode-tokenscope) | opencode | MIT | typescript | ok | opencode-plugin |
| `sotayamashita-claude-code-statusline` | [claude-code-statusline (Sam Yamashita)](https://github.com/sotayamashita/claude-code-statusline) | claude | MIT | rust | ok | manual |
| `thisdot-context-statusline` | [@this-dot/claude-code-context-status-line](https://github.com/thisdot/claude-code-context-status-line) | claude | MIT | typescript | ok | npx |
| `tokscale` | [tokscale](https://github.com/junhoyeo/tokscale) | claude, opencode, gemini, codex | MIT | typescript | ok | npx |

## Per-entry detail

### `ainsley-opencode-token-monitor` — [opencode-token-monitor](https://github.com/Ainsley0917/opencode-token-monitor)

<a href="https://github.com/Ainsley0917/opencode-token-monitor"><img alt="opencode-token-monitor repo preview" src="images/ainsley-opencode-token-monitor.png" width="480"></a>

- **License:** MIT
- **Targets:** opencode
- **Description:** OpenCode plugin (not a statusline) that registers `token_stats` / `token_history` / `token_export` tools and emits toast notifications with input, output, reasoning, and cache token breakdowns.
- **Notes:** Listed in the catalog because it complements an OpenCode statusline rather than replacing one — its output is tool results and toasts, not a `statusLine.command` line. OpenCode loads it from npm at session start once the `plugin` array is configured.
- **Install:** OpenCode loads `opencode-token-monitor@0.5.0` from npm at session start (added via `opencode.json` `plugin` array)
- **Configure:** `node bin/statuslines.js configure ainsley-opencode-token-monitor --cli=<opencode>`

### `capedbitmap-codex-hud` — [codex-hud (Capedbitmap)](https://github.com/Capedbitmap/codex-hud)

<a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="images/capedbitmap-codex-hud.png" width="480"></a>

- **License:** PolyForm-Noncommercial-1.0.0 (not redistributable; reference only)
- **Targets:** codex
- **Description:** macOS menu-bar app that ingests local Codex session data and recommends the next account to use based on weekly reset timing and remaining capacity.
- **Notes:** Source-available, not OSI-open-source. Listed for reference; we don't ship install recipes for non-redistributable entries.
- **Install:** see upstream

### `ccometixline` — [CCometixLine](https://github.com/Haleclipse/CCometixLine)

<a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="images/ccometixline.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Fast Rust-based Claude Code statusline with an interactive TUI configurator, git integration, and usage tracking.
- **Notes:** No verified package-manager install; follow upstream build/release instructions.
- **Install:** see upstream

### `ccstatusline` — [ccstatusline](https://github.com/sirmalloc/ccstatusline)

<a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="images/ccstatusline.svg" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Customizable Claude Code statusline with an interactive TUI configurator, powerline rendering, themes, and widgets for tokens, git, session timers, and clickable links.
- **Install:** `npx --ignore-scripts -y ccstatusline@2.2.12`
- **Configure:** `node bin/statuslines.js configure ccstatusline --cli=<claude>`

### `ccusage` — [ccusage](https://github.com/ryoppippi/ccusage)

<a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="images/ccusage.png" width="480"></a>

- **License:** MIT
- **Targets:** claude, codex
- **Description:** Token-usage and cost analyzer that parses local Claude Code and Codex session JSONL files; not a statusline itself, but a useful data source to compose into one.
- **Notes:** Run `npx -y ccusage@latest` for daily/monthly/session reports; pipe into a custom statusline for richer cost segments.
- **Install:** `npx --ignore-scripts -y ccusage@18.0.11`

### `claude-hud` — [claude-hud](https://github.com/jarrodwatts/claude-hud)

<a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="images/claude-hud.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code plugin/statusline that surfaces context usage, active tools, running subagents, todo progress, and rate-limit windows using the native statusline API.
- **Notes:** Distributed as a Claude Code plugin; see upstream README for the current install command.
- **Install:** see upstream

### `daniel3303-claude-statusline` — [ClaudeCodeStatusLine (Daniel Graczer)](https://github.com/daniel3303/ClaudeCodeStatusLine)

<a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="images/daniel3303-claude-statusline.png" width="480"></a>

- **License:** MIT (not redistributable; reference only)
- **Targets:** claude
- **Description:** Bash + PowerShell statusline for Claude Code showing model, tokens, rate limits, and git status.
- **Notes:** README declares MIT but the repo has no LICENSE file at the canonical paths as of catalog verification on 2026-04-30, so we treat it as license-unverified and don't ship an automated install. Upstream install: clone into ~/.claude/statusline/ and point statusLine.command at statusline.sh — see upstream INSTALL.md.
- **Install:** see upstream

### `dwillitzer-claude-statusline` — [claude-statusline (dwillitzer)](https://github.com/dwillitzer/claude-statusline)

<a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="images/dwillitzer-claude-statusline.png" width="480"></a>

- **License:** MIT (not redistributable; reference only)
- **Targets:** claude
- **Description:** Bash statusline for Claude Code with optional Node.js + tiktoken token counting and multi-provider model coloring (Claude, OpenAI, Gemini, Grok).
- **Notes:** README claims MIT but no LICENSE file is present at catalog verification on 2026-04-30. README's clone command also uses a literal `<repository-url>` placeholder rather than this repo's URL — substitute manually.
- **Install:** see upstream

### `felipeelias-claude-statusline` — [claude-statusline (Felipe Elias)](https://github.com/felipeelias/claude-statusline)

<a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="images/felipeelias-claude-statusline.webp" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Go binary statusline for Claude Code with module-based config, OSC 8 hyperlinks, and theme presets (catppuccin, tokyo-night, gruvbox-rainbow, and others).
- **Notes:** Brew install drops a `claude-statusline` binary on PATH. Alternative install: `go install github.com/felipeelias/claude-statusline@latest`. Customize via `~/.config/claude-statusline/config.toml` (see upstream).
- **Install:** `brew install claude-statusline` (tap: `felipeelias/tap`)
- **Configure:** `node bin/statuslines.js configure felipeelias-claude-statusline --cli=<claude>`

### `fredrikaverpil-claudeline` — [claudeline (Fredrik Averpil)](https://github.com/fredrikaverpil/claudeline)

<a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="images/fredrikaverpil-claudeline.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Minimalistic Go statusline for Claude Code distributed as a Claude Code plugin; the plugin's `/claudeline:setup` slash command downloads the binary and patches settings.json.
- **Notes:** Install flow runs entirely inside Claude Code: `/plugin marketplace add fredrikaverpil/claudeline` → `/plugin install claudeline@claudeline` → `/claudeline:setup`. The setup command writes `{"statusLine":{"type":"command","command":"claudeline"}}` itself, so we don't ship a `configs.claude` patch. Manual fallback: `go install github.com/fredrikaverpil/claudeline@latest`, then add the same snippet by hand.
- **Install:** see upstream

### `fwyc-codex-hud` — [codex-hud (fwyc0573)](https://github.com/fwyc0573/codex-hud)

<a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="images/fwyc-codex-hud.png" width="480"></a>

- **License:** MIT
- **Targets:** codex
- **Description:** Real-time tmux statusline HUD for OpenAI Codex CLI with session/context usage, git status, and tool-activity monitoring; includes --kill / --list / --attach / --self-check subcommands.
- **Notes:** Codex CLI has no native command-statusline yet, so this runs as an external HUD — start it under tmux per upstream docs.
- **Install:** see upstream

### `hagan-claudia-statusline` — [claudia-statusline](https://github.com/hagan/claudia-statusline)

<a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="images/hagan-claudia-statusline.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Rust statusline for Claude Code with persistent stats tracking, prebuilt binaries for Linux/macOS/Windows, and 11 themes; referenced by the official Claude Code docs.
- **Notes:** Upstream install is a `curl | bash` quick-install script that auto-configures settings.json. We don't auto-run remote scripts from `bin/statuslines.js configure` — invoke it directly per upstream README. Distinct from the inactive `taskx6004/claudia-statusline` fork.
- **Install:** see upstream

### `joaquinvesapa-sub-agent-statusline` — [opencode-subagent-statusline](https://github.com/Joaquinvesapa/sub-agent-statusline)

<a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="images/joaquinvesapa-sub-agent-statusline.webp" width="480"></a>

- **License:** MIT
- **Targets:** opencode
- **Description:** OpenCode TUI sidebar plugin (not a statusLine.command line) that shows subagent activity, elapsed time, and token/context usage.
- **Notes:** Configures via OpenCode's TUI config (~/.config/opencode/tui.json), not opencode.json. Add manually: {"$schema":"https://opencode.ai/tui.json","plugin":["opencode-subagent-statusline"]}. We don't auto-merge because that target file isn't supported by `bin/statuslines.js configure` yet.
- **Install:** OpenCode loads `opencode-subagent-statusline@0.5.4` from npm at session start (added via `opencode.json` `plugin` array)

### `kiriketsuki-gemini-statusline` — [gemini-statusline](https://github.com/Kiriketsuki/gemini-statusline)

<a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="images/kiriketsuki-gemini-statusline.png" width="480"></a>

- **License:** Unspecified (not redistributable; reference only)
- **Targets:** gemini
- **Description:** Two-line shell-prompt helper for Gemini CLI showing model, workspace context, git branch, GitHub issue counts, and inbox depth — Gemini CLI has no native statusLine hook so this runs from the user's shell prompt.
- **Notes:** No LICENSE file at the canonical paths as of catalog verification on 2026-04-30; default copyright is all-rights-reserved, so we don't ship install recipes. Worth tracking as the first Gemini-targeted statusline-style helper. Upstream README acknowledges Gemini CLI lacks a native statusLine hook.
- **Install:** see upstream

### `lucasilverentand-claudeline` — [claudeline (Luca Silverentand)](https://github.com/lucasilverentand/claudeline)

<a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="images/lucasilverentand-claudeline.svg" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code statusline shipped as the npm package `claudeline` with built-in themes; can self-install into settings.json via its `--install` flag.
- **Notes:** Distinct from fredrikaverpil/claudeline (Go binary) despite the shared name. The package's `--install` flag patches settings.json automatically; the configs.claude here is the same snippet that flag would write.
- **Install:** `npx --ignore-scripts -y claudeline@1.11.0`
- **Configure:** `node bin/statuslines.js configure lucasilverentand-claudeline --cli=<claude>`

### `markwilkening-opencode-status-line` — [opencode-status-line](https://github.com/markwilkening21/opencode-status-line)

<a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="images/markwilkening-opencode-status-line.png" width="480"></a>

- **License:** MIT
- **Targets:** opencode
- **Description:** Lightweight, fast status line for OpenCode CLI.
- **Notes:** Verify the entry script name in the upstream repo before relying on the configured command.
- **Install:** `git clone` (handled by `bin/statuslines.js configure`)
- **Configure:** `node bin/statuslines.js configure markwilkening-opencode-status-line --cli=<opencode>`

### `ndave92-claude-code-status-line` — [claude-code-status-line (ndave92)](https://github.com/ndave92/claude-code-status-line)

<a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="images/ndave92-claude-code-status-line.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Rust statusline for Claude Code with workspace info, git status, model name, context usage, worktree hints, quota timers, and optional API costs.
- **Notes:** Recommended install is a self-installing slash command: download `.claude/commands/install-statusline.md` from the upstream repo, restart Claude Code, and run `/install-statusline`. The crate `claude-code-status-line` is not published on crates.io as of catalog verification on 2026-04-30.
- **Install:** see upstream

### `opencode-quota` — [opencode-quota](https://github.com/slkiser/opencode-quota)

<a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="images/opencode-quota.webp" width="480"></a>

- **License:** MIT
- **Targets:** opencode
- **Description:** OpenCode quota and token-usage display with zero context-window pollution; supports providers including OpenCode Go, Cursor, GitHub Copilot, and others.
- **Notes:** Follow upstream README for the current install path; project surface evolves quickly.
- **Install:** see upstream

### `owloops-claude-powerline` — [claude-powerline](https://github.com/Owloops/claude-powerline)

<a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="images/owloops-claude-powerline.svg" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Vim-style powerline statusline for Claude Code with real-time usage tracking, git integration, and theme presets.
- **Install:** `npx --ignore-scripts -y @owloops/claude-powerline@1.26.0`
- **Configure:** `node bin/statuslines.js configure owloops-claude-powerline --cli=<claude>`

### `ramtinj95-opencode-tokenscope` — [opencode-tokenscope](https://github.com/ramtinJ95/opencode-tokenscope)

<a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="images/ramtinj95-opencode-tokenscope.png" width="480"></a>

- **License:** MIT
- **Targets:** opencode
- **Description:** OpenCode plugin (not a statusline) providing token usage and cost analysis for sessions with detailed breakdowns.
- **Notes:** Upstream is ramtinJ95/opencode-tokenscope; pantheon-org/opencode-tokenscope-plugin is a downstream fork that uses the same npm package.
- **Install:** OpenCode loads `@ramtinj95/opencode-tokenscope@1.6.3` from npm at session start (added via `opencode.json` `plugin` array)
- **Configure:** `node bin/statuslines.js configure ramtinj95-opencode-tokenscope --cli=<opencode>`

### `sotayamashita-claude-code-statusline` — [claude-code-statusline (Sam Yamashita)](https://github.com/sotayamashita/claude-code-statusline)

<a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="images/sotayamashita-claude-code-statusline.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Rust statusline for Claude Code with starship-like configuration and module-based composition.
- **Notes:** Upstream README references `cargo install claude-code-statusline-cli`, but that crate is not published on crates.io as of catalog verification on 2026-04-30. Build from source meanwhile: clone the repo, run `cargo build --release`, point statusLine.command at the resulting binary.
- **Install:** see upstream

### `thisdot-context-statusline` — [@this-dot/claude-code-context-status-line](https://github.com/thisdot/claude-code-context-status-line)

<a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="claude-code-context-status-line repo preview" src="images/thisdot-context-statusline.png" width="480"></a>

- **License:** MIT
- **Targets:** claude
- **Description:** Claude Code statusline that parses session JSONL transcripts to compute input + cache-creation + cache-read tokens for an accurate context-window display.
- **Notes:** Last published 2025-09-27 (v0.2.2); originally tuned for AWS Bedrock-hosted models but works for any Claude Code session.
- **Install:** `npx --ignore-scripts -y @this-dot/claude-code-context-status-line@0.2.2`
- **Configure:** `node bin/statuslines.js configure thisdot-context-statusline --cli=<claude>`

### `tokscale` — [tokscale](https://github.com/junhoyeo/tokscale)

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="images/tokscale.webp" width="480"></a>

- **License:** MIT
- **Targets:** claude, opencode, gemini, codex
- **Description:** Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.
- **Notes:** Use as a data source for a custom statusline (e.g. `npx -y tokscale@latest --json`) rather than as the statusline itself.
- **Install:** `npx --ignore-scripts -y tokscale@2.0.27`

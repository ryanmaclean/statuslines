# statuslines

**Languages:** English · [Français](./README.fr.md) · [日本語](./README.ja.md)

> A curated catalog of statuslines for Claude Code, OpenCode, Gemini CLI,
> and Codex CLI — plus an in-repo reference flavor (`pup/`) wired to
> Datadog.

*One pattern, four agent CLIs, dozens of statuslines.*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-67-orange)
<!-- count:end -->
![CLIs covered](https://img.shields.io/badge/CLIs-Claude%20%7C%20OpenCode%20%7C%20Gemini%20%7C%20Codex-informational)

## Table of contents

- [Quick start](#quick-start)
- [Catalog](#catalog)
  - [Claude Code](#claude-code)
  - [OpenCode](#opencode)
  - [Gemini CLI](#gemini-cli)
  - [Codex CLI](#codex-cli)
- [Catalog CLI](#catalog-cli)
- [In-repo flavors](#in-repo-flavors)
  - [pup — Datadog observability](#pup--datadog-observability)
- [Support matrix](#support-matrix)
- [Layout](#layout)
- [Contributing](#contributing)
- [Related](#related)
- [Roadmap](#roadmap)
- [Changelog](./CHANGELOG.md)
- [License](#license)

## Quick start

Requires Node ≥ 20 and `jq`.

```sh
# browse the catalog
node bin/statuslines.js list
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline

# install the in-repo pup flavor
./install/install-pup.sh --all --seed-config
```

Codex CLI has no native command-statusline yet — start the HUD under tmux:

```sh
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## Catalog

Indexed by host CLI. Entries with OSI-permissive licenses ship a
runnable install/configure recipe via `bin/statuslines.js configure`;
entries marked `(ref)` are listed for reference only — install per
upstream.

The exhaustive table (status, install type, language) lives in
[`catalog/README.md`](catalog/README.md), generated from the JSON
entries — that file is the source of truth. The block below is
auto-rendered by `node bin/statuslines.js render-top-readme`.

<!-- catalog:start -->
### Claude Code

#### [**claude-fitness-break**](https://github.com/adam-ismael/claude-fitness-break) · MIT

<a href="https://github.com/adam-ismael/claude-fitness-break"><img alt="adam-ismael/claude-fitness-break repository preview" src="./catalog/images/adam-ismael-claude-fitness-break.png" width="800"></a>

Hook plugin that fires when Claude spawns an agent, picking a random exercise and shouting it at you via claude-haiku in one of four unhinged fitness personalities — drill sergeant, 80s coach, 90s wrestler, or anxious doctor. Displays the nudge in the statusline with a 5-minute cooldown.

#### [**claude-code-statusline**](https://github.com/AnirudhMKumar/claude-code-statusline) · MIT

<a href="https://github.com/AnirudhMKumar/claude-code-statusline"><img alt="anirudhmkumar-claude-code-statusline preview" src="./catalog/images/anirudhmkumar-claude-code-statusline.png" width="800"></a>

Windows-native PowerShell statusline for Claude Code showing directory, git branch, active model, and context usage — installs in one command via irm/iex with zero external dependencies.

#### [**claude-code-statusline**](https://github.com/AsafSaar/claude-code-statusline) · MIT

<a href="https://github.com/AsafSaar/claude-code-statusline"><img alt="claude-code-statusline segment preview" src="./catalog/images/asafsaar-claude-code-statusline.png" width="800"></a>

Segment-based, fully configurable Claude Code statusline composed from toggleable parts (cwd, git branch, dirty, ahead/behind, model, node, context, cost, duration, lines, last commit, stash, effort, rate limits, ts errors) with per-segment icons and color thresholds.

#### [**Awesome Statusline (CC-statusline)**](https://github.com/AwesomeJun/CC-statusline) · MIT `(ref)`

<a href="https://github.com/AwesomeJun/CC-statusline"><img alt="Awesome Statusline five size presets with reasoning-effort and thinking indicators" src="./catalog/images/awesomejun-cc-statusline.webp" width="800"></a>

Cross-platform Claude Code statusline (Bash on macOS/Linux, native PowerShell on Windows) showing context, 5h/7d usage limits, cost, reasoning-effort and extended-thinking indicators, with five size presets and Catppuccin theming — no Node or Nerd Font required.

#### [**cc-statusline**](https://github.com/brandonchartier/cc-statusline) · MIT

<a href="https://github.com/brandonchartier/cc-statusline"><img alt="cc-statusline showing model, git, tokens, effort, and rate limits" src="./catalog/images/brandonchartier-cc-statusline.png" width="800"></a>

Minimal Python statusline for Claude Code showing model, git branch, token usage percentage, reasoning effort level, 5h/7d rate-limit windows, and current local time — no API calls, no OAuth.

#### [**claude-code-status-bar**](https://github.com/briansmith80/claude-code-status-bar) · MIT

<a href="https://github.com/briansmith80/claude-code-status-bar"><img alt="claude-code-status-bar OpenGraph card" src="./catalog/images/briansmith80-claude-code-status-bar.png" width="800"></a>

Pure-bash statusline with 18 segments and 7 colour themes — context bar, 5-hour and weekly rate-limit pacing, git state, session cost, and live tool activity, all with zero dependencies.

#### [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) · MIT

<a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="./catalog/images/ccometixline.png" width="800"></a>

Fast Rust-based Claude Code statusline with an interactive TUI configurator, git integration, and usage tracking.

#### [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) · MIT

<a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="./catalog/images/ccstatusline.svg" width="800"></a>

Customizable Claude Code statusline with an interactive TUI configurator, powerline rendering, themes, and widgets for tokens, git, session timers, and clickable links.

#### [**claude-buddy**](https://github.com/chae-dahee/claude-buddy) · MIT

<a href="https://github.com/chae-dahee/claude-buddy"><img alt="chae-dahee/claude-buddy repo preview" src="./catalog/images/chae-dahee-claude-buddy.png" width="800"></a>

Animated ASCII companion that lives in the Claude Code statusline, rolled from a gacha table with 18 species, 5 rarity tiers, and stats like DEBUGGING and SNARK — levels up every 7 days.

#### [**claude-hud**](https://github.com/jarrodwatts/claude-hud) · MIT

<a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="./catalog/images/claude-hud.png" width="800"></a>

Claude Code plugin/statusline that surfaces context usage, active tools, running subagents, todo progress, and rate-limit windows using the native statusline API.

#### [**claude-code-statusline (ctfbio)**](https://github.com/ctfbio/claude-code-statusline) · MIT

<a href="https://github.com/ctfbio/claude-code-statusline"><img alt="claude-code-statusline (ctfbio) OpenGraph card" src="./catalog/images/ctfbio-claude-code-statusline.png" width="800"></a>

Shell statusline with session duration, ECB FX-backed multi-currency cost display, per-MTok rates, spending caps, and effort level — zero runtime network calls via 24-hour cache.

#### [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) · MIT

<a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="./catalog/images/daniel3303-claude-statusline.png" width="800"></a>

Bash + PowerShell statusline for Claude Code showing model, tokens, rate limits, and git status.

#### [**Claude Code Statusline**](https://github.com/danielmackay/claude-code-statusline) · Unspecified `(ref)`

<a href="https://github.com/danielmackay/claude-code-statusline"><img alt="danielmackay-claude-code-statusline GitHub preview" src="./catalog/images/danielmackay-claude-code-statusline.png" width="800"></a>

Shell script statusline for Claude Code displaying active model, context usage, session cost, 5-hour rate-limit bar with reset time, git branch, and diff stats.

#### [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) · MIT

<a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="./catalog/images/dwillitzer-claude-statusline.png" width="800"></a>

Bash statusline for Claude Code with optional Node.js + tiktoken token counting and multi-provider model coloring (Claude, OpenAI, Gemini, Grok).

#### [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) · MIT

<a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="./catalog/images/felipeelias-claude-statusline.webp" width="800"></a>

Go binary statusline for Claude Code with module-based config, OSC 8 hyperlinks, and theme presets (catppuccin, tokyo-night, gruvbox-rainbow, and others).

#### [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) · MIT

<a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="./catalog/images/fredrikaverpil-claudeline.png" width="800"></a>

Minimalistic Go statusline for Claude Code distributed as a Claude Code plugin; the plugin's `/claudeline:setup` slash command downloads the binary and patches settings.json.

#### [**claudehud**](https://github.com/Fyko/claudehud) · MIT

<a href="https://github.com/Fyko/claudehud"><img alt="claudehud comfortable layout with model, tokens, rate limits" src="./catalog/images/fyko-claudehud.png" width="800"></a>

Rust statusline for Claude Code with mmap+seqlock git daemon, ~168× faster than bash; shows model, token usage, rate limits, cost, active incidents, and dual layouts.

#### [**claude-subagent-statusline**](https://github.com/GerardoFC8/claude-subagent-statusline) · MIT

<a href="https://github.com/GerardoFC8/claude-subagent-statusline"><img alt="claude-subagent-statusline repository preview" src="./catalog/images/gerardofc8-claude-subagent-statusline.png" width="800"></a>

Claude Code statusline focused on real-time sub-agent delegation tracking — surfaces running, completed, and failed Task counters alongside model, cost, context window, elapsed time, and 5h/7d rate limits.

#### [**cc-pulseline**](https://github.com/GregoryHo/cc-pulseline) · MIT

<a href="https://github.com/GregoryHo/cc-pulseline"><img alt="cc-pulseline hero" src="./catalog/images/gregoryho-cc-pulseline.png" width="800"></a>

High-performance multi-line Claude Code statusline written in Rust with deep observability — incremental seek-based JSONL parsing, live context, cost burn rate, active tools with targets, running agents, todo progress, and per-session tracking.

#### [**claudia-statusline**](https://github.com/hagan/claudia-statusline) · MIT

<a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="./catalog/images/hagan-claudia-statusline.png" width="800"></a>

Rust statusline for Claude Code with persistent stats tracking, prebuilt binaries for Linux/macOS/Windows, and 11 themes; referenced by the official Claude Code docs.

#### [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) · MIT

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="800"></a>

Fast local token-usage tracker for Claude Code and Codex; `tu statusline` emits a one-line cost/token summary. Also ships CLI, TUI, and GUI modes. 214x faster than ccusage.

#### [**claude-code-statusline**](https://github.com/haunchen/claude-code-statusline) · MIT

<a href="https://github.com/haunchen/claude-code-statusline"><img alt="claude-code-statusline showing OFF-PEAK indicator with context, cost, and rate limits" src="./catalog/images/haunchen-claude-code-statusline.png" width="800"></a>

Cross-platform Claude Code statusline that surfaces Anthropic peak/off-peak rate-limit windows alongside context usage, session cost, and 5-hour and 7-day rate limits, so you can plan sessions around faster-burning peak hours.

#### [**claude-vibeline**](https://github.com/hstojanovic/claude-vibeline) · MIT

<a href="https://github.com/hstojanovic/claude-vibeline"><img alt="claude-vibeline repo preview" src="./catalog/images/hstojanovic-claude-vibeline.png" width="800"></a>

Python statusline for Claude Code that reads real subscription usage data from Anthropic's OAuth API — per-model Opus/Sonnet limits, extra-usage spend, prompt cache TTL, and session/weekly rate limits.

#### [**claude-code-statusline**](https://github.com/ilia-pluzhnikov/claude-code-statusline) · MIT

<a href="https://github.com/ilia-pluzhnikov/claude-code-statusline"><img alt="ilia-pluzhnikov claude-code-statusline GitHub preview" src="./catalog/images/ilia-pluzhnikov-claude-code-statusline.png" width="800"></a>

Feature-rich single-file Node.js statusline showing model, active task, git branch status, context window usage, prompt-cache hit rate, 5-hour and 7-day rate limits, and peak-hours indicator with color-coded urgency.

#### [**claude-statusline (Kamran Ahmed)**](https://github.com/kamranahmedse/claude-statusline) · MIT

<a href="https://github.com/kamranahmedse/claude-statusline"><img alt="claude-statusline showing model, context bar, git branch, rate limits" src="./catalog/images/kamranahmedse-claude-statusline.png" width="800"></a>

Minimal Claude Code statusline showing model, context usage percentage, current directory, git branch, session timer, effort level, and live rate-limit bars fetched from the Anthropic API.

#### [**claude-codex-statusline**](https://github.com/kiheon0709/claude-codex-statusline) · MIT `(ref)`

<a href="https://github.com/kiheon0709/claude-codex-statusline"><img alt="claude-codex-statusline showing dual usage bars for Claude and Codex" src="./catalog/images/kiheon0709-claude-codex-statusline.png" width="800"></a>

Dual-bar statusline showing Claude Code and Codex CLI quota side-by-side with 5H/weekly rate-limit bars, context window, and live active-subagent count tracked via PreToolUse/PostToolUse hooks.

#### [**ccsl**](https://github.com/laveez/ccsl) · MIT

<a href="https://github.com/laveez/ccsl"><img alt="ccsl animated statusline demo" src="./catalog/images/laveez-ccsl.gif" width="800"></a>

Dense, color-coded ANSI statusline for Claude Code showing model, cost, context usage, git state, PR links, active tools, subagents, task progress, and optional API rate-limit bars.

#### [**claude-code-usage-bar**](https://github.com/leeguooooo/claude-code-usage-bar) · MIT

<a href="https://github.com/leeguooooo/claude-code-usage-bar"><img alt="claude-statusbar live demo" src="./catalog/images/leeguooooo-claude-code-usage-bar.gif" width="800"></a>

Python statusline (cs) for Claude Code that renders token usage, cost, and rate-limit windows across three styles and nine themes, backed by a background daemon and configurable via slash commands.

#### [**cc-statusline**](https://github.com/Lightning7329/cc-statusline) · MIT

<a href="https://github.com/Lightning7329/cc-statusline"><img alt="cc-statusline example output" src="./catalog/images/lightning7329-cc-statusline.png" width="800"></a>

F# statusline for Claude Code — the only F# entry in the catalog — showing context window, model, session cost, and rate-limit windows via a color-coded braille progress bar.

#### [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) · MIT

<a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="./catalog/images/lucasilverentand-claudeline.svg" width="800"></a>

Claude Code statusline shipped as the npm package `claudeline` with built-in themes; can self-install into settings.json via its `--install` flag.

#### [**claude-usage-statusline**](https://github.com/meros/claude-usage-statusline) · MIT

<a href="https://github.com/meros/claude-usage-statusline"><img alt="claude-usage-statusline dashboard with sparklines and ETA" src="./catalog/images/meros-claude-usage-statusline.png" width="800"></a>

Polls the Claude API for 5-hour and 7-day window usage, persists dual-tier history locally, renders sparklines and color-coded progress bars, and projects an ETA to rate-limit with smart date/duration formatting.

#### [**schoen-claude-status**](https://github.com/mtschoen/schoen-claude-status) · MIT

<a href="https://github.com/mtschoen/schoen-claude-status"><img alt="schoen-claude-status showing cache hit rate and rate-limit pace projection" src="./catalog/images/mtschoen-schoen-claude-status.svg" width="800"></a>

Two-line statusline tracking session-wide cache hit rate, context usage, and 5-hour/weekly rate-limit pace projections with cost — all in a single-file bash + python setup.

#### [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) · MIT

<a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="./catalog/images/ndave92-claude-code-status-line.png" width="800"></a>

Rust statusline for Claude Code with workspace info, git status, model name, context usage, worktree hints, quota timers, and optional API costs.

#### [**noahs-claude-statusline**](https://github.com/noahbclarkson/noahs-claude-statusline) · Unspecified `(ref)`

<a href="https://github.com/noahbclarkson/noahs-claude-statusline"><img alt="noahs-claude-statusline GitHub preview" src="./catalog/images/noahbclarkson-noahs-claude-statusline.png" width="800"></a>

Windows MSYS2 bash statusline that solves terminal-width detection via PowerShell AttachConsole process-tree walking, with a sub-cell-precision fractional progress bar rendered in eighths.

#### [**cc-tempo**](https://github.com/O0000-code/cc-tempo) · MIT

<a href="https://github.com/O0000-code/cc-tempo"><img alt="cc-tempo statusline screenshot" src="./catalog/images/o0000-cc-tempo.png" width="800"></a>

Claude Code statusline that measures real wall-clock work time parsed from transcripts, surfaces SubAgent parallel-speedup ratios, and tracks code-churn velocity via a sparkline rather than tokens or cost.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS notch/menu-bar companion (SwiftUI + AppKit) that monitors active AI coding agents in real time, shows session status and pending permission requests, and lets you jump back to the correct terminal or IDE. Supports Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory, and CodeBuddy. macOS 14+ only.

#### [**claude-powerline**](https://github.com/Owloops/claude-powerline) · MIT

<a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="./catalog/images/owloops-claude-powerline.svg" width="800"></a>

Vim-style powerline statusline for Claude Code with real-time usage tracking, git integration, and theme presets.

#### [**ccstatusline-usage**](https://github.com/pcvelz/ccstatusline-usage) · MIT

<a href="https://github.com/pcvelz/ccstatusline-usage"><img alt="ccstatusline-usage showing session and weekly API usage bars alongside model and git widgets" src="./catalog/images/pcvelz-ccstatusline-usage.png" width="800"></a>

Fork of ccstatusline adding real-time Anthropic API usage widgets: session and weekly utilization bars, weekly pace indicator, reset countdown, and multi-provider routing for local models.

#### [**simple-claude-code-statusline**](https://github.com/Postmodum37/simple-claude-code-statusline) · MIT

<a href="https://github.com/Postmodum37/simple-claude-code-statusline"><img alt="simple-claude-code-statusline two-line preview" src="./catalog/images/postmodum37-simple-claude-code-statusline.png" width="800"></a>

Minimal, hackable two-line Claude Code statusline written in Go: row one shows model, directory, git branch with file counts and worktree, plus session lines changed; row two shows context bar, 5h and 7d rate limits, cost, and duration.

#### [**prism-hud**](https://github.com/puddinging/prism-hud) · MIT

<a href="https://github.com/puddinging/prism-hud"><img alt="prism-hud gradient statusline preview" src="./catalog/images/puddinging-prism-hud.png" width="800"></a>

Fork of jarrodwatts/claude-hud that swaps the progress bars for a per-position gradient palette — each dot has a fixed color from green (safe) through yellow to red (critical), so fill level reads at a glance across context and rate-limit windows.

#### [**claude-code-statusline (RaiconY)**](https://github.com/RaiconY/claude-code-statusline) · MIT

<a href="https://github.com/RaiconY/claude-code-statusline"><img alt="claude-code-statusline repo preview" src="./catalog/images/raicony-claude-code-statusline.png" width="800"></a>

Feature-rich, dependency-free single-file Node.js statusline for Claude Code showing model, active task, git state, context usage, prompt-cache state with TTL, and 5-hour plus 7-day Anthropic rate-limit countdowns.

#### [**claude-code-statusline (RiverOfLogic)**](https://github.com/RiverOfLogic/claude-code-statusline) · Unspecified `(ref)`

<a href="https://github.com/RiverOfLogic/claude-code-statusline"><img alt="RiverOfLogic Powerline statusline showing model, git, context bar with warm retro colors" src="./catalog/images/riveroflogic-claude-code-statusline.png" width="800"></a>

Powerline-style retro-terminal statusline for Claude Code, displaying model, git branch, output style, thinking mode, and a 10-cell context progress bar with warm earth-tone color thresholds and a live clock.

#### [**aifuel**](https://github.com/robertogogoni/aifuel) · MIT

<a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a>

Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline.

#### [**claude-code-statusline (rz1989s)**](https://github.com/rz1989s/claude-code-statusline) · MIT

<a href="https://github.com/rz1989s/claude-code-statusline"><img alt="claude-code-statusline Catppuccin Mocha theme screenshot" src="./catalog/images/rz1989s-claude-code-statusline.png" width="800"></a>

Bash statusline for Claude Code with 28 atomic components across up to 9 lines: git info, cost tracking, MCP health, block reset timer, Islamic prayer times, and Catppuccin themes.

#### [**horologium**](https://github.com/Shallow-dusty/horologium) · MIT

<a href="https://github.com/Shallow-dusty/horologium"><img alt="horologium repo card" src="./catalog/images/shallow-dusty-horologium.png" width="800"></a>

Unified Rust binary that combines a sub-millisecond Claude Code statusline with ccusage-style JSONL log analytics; one tool renders tokens, cost, git, and 5h/7d rate limits while also producing daily, session, and block usage reports.

#### [**ClaudeCodeStatusBar**](https://github.com/SleighMaster99/ClaudeCodeStatusBar) · MIT

<a href="https://github.com/SleighMaster99/ClaudeCodeStatusBar"><img alt="ClaudeCodeStatusBar synthetic preview — model, context bar, cost, git branch" src="./catalog/images/sleighmaster99-claudecodestatusbar.svg" width="800"></a>

Windows-only WinForms GUI editor for Claude Code multi-line statuslines — drag-and-drop layout builder with PowerShell runtime, usage tracking, and git/context/cost widgets.

#### [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) · MIT

<a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="./catalog/images/sotayamashita-claude-code-statusline.png" width="800"></a>

Rust statusline for Claude Code with starship-like configuration and module-based composition.

#### [**claude-statusline-powerline**](https://github.com/spences10/claude-statusline-powerline) · MIT

<a href="https://github.com/spences10/claude-statusline-powerline"><img alt="claude-statusline-powerline demo showing themed powerline segments" src="./catalog/images/spences10-claude-statusline-powerline.png" width="800"></a>

Powerline-style Claude Code statusline built as an expansion of Owloops' claude-powerline, adding a local SQLite-backed usage-analytics database and a JSON config schema with settings.json IntelliSense (autocomplete, hover docs, color validation).

#### [**claude-statusline (TheoBrigitte)**](https://github.com/TheoBrigitte/claude-statusline) · MIT

<a href="https://github.com/TheoBrigitte/claude-statusline"><img alt="claude-statusline (TheoBrigitte) showing model, context bar, cost, duration, and API status segments" src="./catalog/images/theobrigitte-claude-statusline.png" width="800"></a>

Statically-compiled Go statusline for Claude Code sessions, configured via a TOML file with per-module colors/symbols/thresholds and responsive terminal-width layout, rendering in roughly 19 microseconds.

#### [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) · MIT

<a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="context-statusline showing token + cache breakdown" src="./catalog/images/thisdot-context-statusline.svg" width="800"></a>

Claude Code statusline that parses session JSONL transcripts to compute input + cache-creation + cache-read tokens for an accurate context-window display.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

#### [**xuedi/claude-statusline**](https://github.com/xuedi/claude-statusline) · EUPL-1.2 `(ref)`

<a href="https://github.com/xuedi/claude-statusline"><img alt="xuedi/claude-statusline repo preview" src="./catalog/images/xuedi-claude-statusline.png" width="800"></a>

Rust-native Claude Code statusline rendering model, git, tokens, effort, and 5h/7d rate limits via a 20-cell braille progress bar in ~500 lines of safe, unsafe-forbidden code.

#### [**claude-code-statusline**](https://github.com/xyzcardiff/claude-code-statusline) · MIT

<a href="https://github.com/xyzcardiff/claude-code-statusline"><img alt="xyzcardiff claude-code-statusline repository preview" src="./catalog/images/xyzcardiff-claude-code-statusline.png" width="800"></a>

Two-line Claude Code statusline (shell) with live subagent count and background-task progress bar read from ~/.claude/jobs — second line only appears when agents or tasks are active.

### OpenCode

#### [**ocstatusline**](https://github.com/amirlehmam/ocstatusline) · MIT

<a href="https://github.com/amirlehmam/ocstatusline"><img alt="ocstatusline synthetic preview — model, git branch, context, cost, session timer" src="./catalog/images/amirlehmam-ocstatusline.svg" width="800"></a>

Standalone OpenCode statusline daemon that subscribes to the OpenCode server's event stream and renders a live, continuously-updating status line in its own terminal pane, with an Ink-based interactive TUI for configuring segments.

#### [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) · MIT

<a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="./catalog/images/joaquinvesapa-sub-agent-statusline.webp" width="800"></a>

OpenCode TUI sidebar plugin (not a statusLine.command line) that shows subagent activity, elapsed time, and token/context usage.

#### [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) · MIT

<a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="./catalog/images/markwilkening-opencode-status-line.png" width="800"></a>

Lightweight, fast status line for OpenCode CLI.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS notch/menu-bar companion (SwiftUI + AppKit) that monitors active AI coding agents in real time, shows session status and pending permission requests, and lets you jump back to the correct terminal or IDE. Supports Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory, and CodeBuddy. macOS 14+ only.

#### [**opencode-quota**](https://github.com/slkiser/opencode-quota) · MIT

<a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="./catalog/images/opencode-quota.webp" width="800"></a>

OpenCode quota and token-usage display with zero context-window pollution; supports providers including OpenCode Go, Cursor, GitHub Copilot, and others.

#### [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) · MIT

<a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="./catalog/images/ramtinj95-opencode-tokenscope.png" width="800"></a>

OpenCode plugin (not a statusline) providing token usage and cost analysis for sessions with detailed breakdowns.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

### Gemini CLI

#### [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) · Unspecified `(ref)`

<a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="./catalog/images/kiriketsuki-gemini-statusline.png" width="800"></a>

Two-line shell-prompt helper for Gemini CLI showing model, workspace context, git branch, GitHub issue counts, and inbox depth — Gemini CLI has no native statusLine hook so this runs from the user's shell prompt.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS notch/menu-bar companion (SwiftUI + AppKit) that monitors active AI coding agents in real time, shows session status and pending permission requests, and lets you jump back to the correct terminal or IDE. Supports Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory, and CodeBuddy. macOS 14+ only.

#### [**aifuel**](https://github.com/robertogogoni/aifuel) · MIT

<a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a>

Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

### Codex CLI

#### [**cat-codex-statusline (ai-ken-git)**](https://github.com/ai-ken-git/cat-codex-statusline) · MIT

<a href="https://github.com/ai-ken-git/cat-codex-statusline"><img alt="cat-codex-statusline terminal preview showing model, git branch, and context segments" src="./catalog/images/ai-ken-git-cat-codex-statusline.png" width="800"></a>

Cat-themed Codex CLI statusline installer; wires built-in segments (model, git branch, context, limits) into a clean preset today, with a cat-face renderer ready to activate once Codex ships a command-backed status line hook.

#### [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) · PolyForm-Noncommercial-1.0.0 `(ref)`

<a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="./catalog/images/capedbitmap-codex-hud.webp" width="800"></a>

macOS menu-bar app that ingests local Codex session data and recommends the next account to use based on weekly reset timing and remaining capacity.

#### [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) · MIT

<a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="./catalog/images/fwyc-codex-hud.png" width="800"></a>

Real-time tmux statusline HUD for OpenAI Codex CLI with session/context usage, git status, and tool-activity monitoring; includes --kill / --list / --attach / --self-check subcommands.

#### [**codex-statusline (GordonBeeming)**](https://github.com/GordonBeeming/codex-statusline) · Unspecified `(ref)`

<a href="https://github.com/GordonBeeming/codex-statusline"><img alt="codex-statusline (GordonBeeming) OpenGraph card" src="./catalog/images/gordonbeeming-codex-statusline.png" width="800"></a>

Four-line Codex statusline showing repo name, git branch, model, session cost in AUD, 5-hour rate-limit bar, and context window usage — mirroring the author's claude-statusline layout.

#### [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) · MIT

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="800"></a>

Fast local token-usage tracker for Claude Code and Codex; `tu statusline` emits a one-line cost/token summary. Also ships CLI, TUI, and GUI modes. 214x faster than ccusage.

#### [**claude-codex-statusline**](https://github.com/kiheon0709/claude-codex-statusline) · MIT `(ref)`

<a href="https://github.com/kiheon0709/claude-codex-statusline"><img alt="claude-codex-statusline showing dual usage bars for Claude and Codex" src="./catalog/images/kiheon0709-claude-codex-statusline.png" width="800"></a>

Dual-bar statusline showing Claude Code and Codex CLI quota side-by-side with 5H/weekly rate-limit bars, context window, and live active-subagent count tracked via PreToolUse/PostToolUse hooks.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS notch/menu-bar companion (SwiftUI + AppKit) that monitors active AI coding agents in real time, shows session status and pending permission requests, and lets you jump back to the correct terminal or IDE. Supports Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory, and CodeBuddy. macOS 14+ only.

#### [**codex-statusline (rgomes87)**](https://github.com/rgomes87/codex-statusline) · Unspecified `(ref)`

<a href="https://github.com/rgomes87/codex-statusline"><img alt="codex-statusline 4-line tmux preview" src="./catalog/images/rgomes87-codex-statusline.svg" width="800"></a>

Colourful 4-line tmux status area for Codex CLI showing context window, model, git branch, and 5-hour/7-day rate-limit pacing bars with per-second reset countdowns.

#### [**aifuel**](https://github.com/robertogogoni/aifuel) · MIT

<a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a>

Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

<!-- catalog:end -->

## Catalog CLI

```sh
node bin/statuslines.js list                          # all entries
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline             # full metadata
node bin/statuslines.js configure ccstatusline --cli=claude --dry-run
node bin/statuslines.js configure ccstatusline --cli=claude
node bin/statuslines.js doctor                        # validate every entry
node bin/statuslines.js render-readme                 # refresh catalog/README.md
node bin/statuslines.js render-top-readme             # refresh this file
```

`configure` skips entries whose license isn't redistributable; those
remain listed for reference only.

## In-repo flavors

One reference statusline lives alongside the catalog: `pup/`, which
surfaces Datadog event health into the bar.

### pup — Datadog observability

Surfaces recent **events** from
[datadog-labs/pup](https://github.com/datadog-labs/pup) (last 5 min by
default), grouped by `alert_type`.

The pup statuslines never call `pup` from the render path. They read a
TTL-gated cache:

1. Render reads `${TMPDIR}/statuslines-pup-events.json`.
2. If the cache is **fresher than `ttl_seconds`** (default 60s), it's
   used as-is.
3. If stale, the render acquires a lockfile (`O_EXCL`); if another
   render holds the lock, it waits ≤250ms, then falls back to the
   stale cache rather than queueing more API calls.
4. The lock holder shells out to
   `pup events list --duration 5m --output json` once, atomically
   writes the result, releases the lock.
5. Errors (auth, rate-limit, ENOENT) are written into the cache and
   surfaced in the bar (`pup:auth?`, `pup:rate-limited`,
   `pup:not installed`) — no retry storms.
6. Every fetch is logged to `${TMPDIR}/statuslines-pup.log`.

Cache age is shown in the bar (e.g. `pup:✓3 ⚠1 ✗0 (45s)`); past 5min
it's marked `(stale)` and dimmed.

#### Config

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

A starter file lives at `examples/pup.config.json`. Seed it with
`./install/install-pup.sh --seed-config`.

#### Quick start (pup)

```sh
brew tap datadog-labs/pack && brew install datadog-labs/pack/pup
pup auth login
./install/install-pup.sh --all --seed-config
node ./pup/cli.js fetch    # warm cache
node ./pup/cli.js show     # preview segment
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## Support matrix

| CLI | Custom statusline | After-tool hook | Approach |
|---|---|---|---|
| Claude Code | yes (`statusLine.command`) | yes (`PostToolUse`) | `pup/claude/statusline.js` + `context-monitor.js` |
| OpenCode | yes (`statusLine.command`) | yes (plugin `tool.execute.after`) | `pup/opencode/statusline.js` + `context-monitor.js` |
| Gemini CLI | **no** ([#8191](https://github.com/google-gemini/gemini-cli/issues/8191)) | yes (`AfterTool`) | not shipped in-repo (see catalog for third-party options) |
| Codex CLI | only built-in items ([#14043](https://github.com/openai/codex/issues/14043), [#17827](https://github.com/openai/codex/issues/17827)) | yes (`~/.codex/hooks/`) | external HUD daemon — `pup/codex/hud.js` |

## Layout

```
lib/                shared helpers (bar, colors, git, bridge file, stdin guard)
catalog/            third-party entries — one JSON per slug, per CLI
  claude/           Claude Code targets
  opencode/         OpenCode targets
  gemini/           Gemini CLI targets
  codex/            Codex CLI targets
  multi/            entries that target more than one CLI
pup/                Datadog observability flavor
examples/           paste-in config snippets per CLI
install/            installer scripts
bin/                catalog CLI (list/show/configure/doctor/render-{readme,top-readme})
```

## Contributing

To add an entry to the catalog:

1. Verify the upstream license at the repo (look at `LICENSE`, not the
   README badge). If the repo has no LICENSE file, set
   `redistributable: false` and treat as listed-for-reference.
2. Confirm the install path actually works (npm package exists, brew
   formula resolves, etc.). Independent verification beats trusting a
   README's claim.
3. Write a one-sentence description in your own words — don't paste
   from upstream.
4. Drop the JSON at `catalog/<cli>/<slug>.json` (or `catalog/multi/`
   for multi-CLI entries).
5. Run `node bin/statuslines.js doctor` to validate, then
   `node bin/statuslines.js render-readme` and
   `node bin/statuslines.js render-top-readme` to refresh the
   generated tables.
6. Run the test suite — `node --test tests/statuslines.test.js` (or `sh tests/run.sh`) — and confirm it passes. The CI job runs these automatically and blocks merging on failure.
7. Open a PR.

The full schema and field-by-field rules are in
[`catalog/SCHEMA.md`](catalog/SCHEMA.md). Copyleft (AGPL, GPL) and
source-available (PolyForm-NC, BSL) entries are welcome — they're
listed with the `(ref)` tag and skipped by `configure`.

## Related

Curated lists worth knowing about — link only, no copying:

- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
  — skills, hooks, slash-commands, agents, and statuslines for Claude Code.
- [awesome-opencode/awesome-opencode](https://github.com/awesome-opencode/awesome-opencode)
  — plugins, themes, agents, and projects for OpenCode.

## Roadmap

Shipped:

- Context-health pattern across all four supported CLIs.
- Example configs and installer scripts.
- `pup/` Datadog flavor with TTL-gated cache and lockfile-coordinated fetches.
- Catalog of third-party statuslines with `list` / `show` / `configure` /
  `doctor` / `audit` commands.
- Schema-level supply-chain hardening: pinned versions and integrity hashes,
  refusal of `curl|sh` / `eval(` / `@latest` patterns, `--ignore-scripts`
  by default on `npx` / `npm-global` recipes.
- OpenBSD-style quarantine: flagged entries vanish from `list` / `show` /
  `configure` and the rendered READMEs; the forensic record lives in
  `catalog/QUARANTINE.md`.
- Daily liveness probe (repo + npm registry version match + license drift)
  and weekly Socket.dev malicious-package feed.
- Datadog SAST / SCA / SAIST workflows, secret-gated so the repo is safe
  to fork before keys land.
- Per-entry capability declarations (`network`, `child_process`,
  `filesystem_write`, `env_read`) with sandbox verification under
  firejail + strace.
- SLSA build-provenance probe and weekly transitive-dependency lockfile
  re-verification on every redistributable npm-backed entry.

Next:

- Tarball diff bot on every version-bump PR.
- Hybrid Ed25519 + SLH-DSA signing on catalog entries.
- Richer `pup/` segments (monitors, incidents) behind opt-in flags.

## License

| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline. |
| <a href="https://github.com/DarkRonny23/statusmon"><img alt="statusmon Pokemon companion banner" src="./catalog/images/darkronny23-statusmon.png" width="800"></a> | [**statusmon**](https://github.com/DarkRonny23/statusmon) | MIT `(quarantined)` | Pokemon companion statusline for Claude Code that displays a sprite which gains experience and levels up as you complete coding sessions; **bundled Pokémon sprite/font assets are likely Nintendo IP — listed for reference, not redistributed**. |
| <a href="https://github.com/Shallow-dusty/horologium"><img alt="horologium repo card" src="./catalog/images/shallow-dusty-horologium.png" width="800"></a> | [**horologium**](https://github.com/Shallow-dusty/horologium) | MIT | Unified Rust binary that combines a sub-millisecond Claude Code statusline with ccusage-style JSONL log analytics; one tool renders tokens, cost, git, and 5h/7d rate limits while also producing daily/session/block usage reports. |
| <a href="https://github.com/GerardoFC8/claude-subagent-statusline"><img alt="claude-subagent-statusline repository preview" src="./catalog/images/gerardofc8-claude-subagent-statusline.png" width="800"></a> | [**claude-subagent-statusline**](https://github.com/GerardoFC8/claude-subagent-statusline) | MIT | Claude Code statusline focused on real-time sub-agent delegation tracking — surfaces running, completed, and failed Task counters alongside model, cost, context window, elapsed time, and 5h/7d rate limits. |
| <a href="https://github.com/leeguooooo/claude-code-usage-bar"><img alt="claude-statusbar live demo" src="./catalog/images/leeguooooo-claude-code-usage-bar.gif" width="800"></a> | [**claude-code-usage-bar**](https://github.com/leeguooooo/claude-code-usage-bar) | MIT | Python statusline (cs) for Claude Code that renders token usage, cost, and rate-limit windows across three styles and nine themes, backed by a background daemon and configurable via slash commands. |
| <a href="https://github.com/haunchen/claude-code-statusline"><img alt="claude-code-statusline showing OFF-PEAK indicator" src="./catalog/images/haunchen-claude-code-statusline.png" width="800"></a> | [**claude-code-statusline (haunchen)**](https://github.com/haunchen/claude-code-statusline) | MIT | Cross-platform Claude Code statusline that surfaces Anthropic peak/off-peak rate-limit windows alongside context usage, session cost, and 5h/7d rate limits, so you can plan sessions around faster-burning peak hours. |
| <a href="https://github.com/O0000-code/cc-tempo"><img alt="cc-tempo statusline screenshot" src="./catalog/images/o0000-cc-tempo.png" width="800"></a> | [**cc-tempo**](https://github.com/O0000-code/cc-tempo) | MIT | Claude Code statusline that measures real wall-clock work time parsed from transcripts, surfaces SubAgent parallel-speedup ratios, and tracks code-churn velocity via a sparkline rather than tokens or cost. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline. |
MIT

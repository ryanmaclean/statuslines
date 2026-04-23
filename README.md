# statusline-scripts

> A collection of statusline scripts for Claude Code, Codex, and OpenCode.

[![CI](https://github.com/ryanmaclean/statuslines/actions/workflows/ci.yml/badge.svg)](https://github.com/ryanmaclean/statuslines/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

`statusline-scripts` is a clean, practical, MIT-licensed collection of shell scripts you can drop into your local setup to enhance the statuslines of [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex](https://github.com/openai/codex), and [OpenCode](https://opencode.ai). Scripts are designed to be fast, composable, and easy to customize.

## Features

- **Git integration** — current branch name and dirty-state indicator
- **Exit code display** — surface the exit status of the last command or task
- **Current time** — lightweight timestamp segment
- **Tool indicator** — optional runtime/tool label (Claude Code, Codex, OpenCode)
- **macOS + Linux** — tested on both platforms
- **Graceful degradation** — optional tools (e.g. `git`) are handled safely when absent
- **ASCII-safe output** — terminal-friendly by default; Unicode decorators are opt-in

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ryanmaclean/statuslines.git ~/.statusline-scripts

# 2. Source the script for your tool in your shell config
# For Claude Code (add to ~/.bashrc or ~/.zshrc):
source ~/.statusline-scripts/scripts/claude-code/statusline.sh

# 3. Reload your shell
exec "$SHELL"
```

After sourcing the script, the `statusline_prompt` function is available. Wire it into your prompt:

```bash
# bash
PS1='$(statusline_prompt) \$ '

# zsh
PROMPT='$(statusline_prompt) %% '
```

---

## Per-Tool Setup

### Claude Code

```bash
source ~/.statusline-scripts/scripts/claude-code/statusline.sh
PS1='$(statusline_prompt) \$ '
```

See [`examples/claude-code/`](examples/claude-code/) for a ready-to-use example.

### Codex

```bash
source ~/.statusline-scripts/scripts/codex/statusline.sh
PS1='$(statusline_prompt) \$ '
```

See [`examples/codex/`](examples/codex/) for a ready-to-use example.

### OpenCode

```bash
source ~/.statusline-scripts/scripts/opencode/statusline.sh
PS1='$(statusline_prompt) \$ '
```

See [`examples/opencode/`](examples/opencode/) for a ready-to-use example.

---

## Screenshot / Demo

> _Screenshot placeholder — add your own screenshot or GIF here._
>
> ![statusline demo](docs/assets/demo.png)

---

## Repository Structure

```
statusline-scripts/
├── LICENSE
├── README.md
├── CHANGELOG.md
├── .gitignore
├── docs/
│   ├── installation.md
│   ├── customization.md
│   └── troubleshooting.md
├── examples/
│   ├── claude-code/
│   ├── codex/
│   └── opencode/
├── scripts/
│   ├── shared/          # Reusable helper functions
│   ├── claude-code/
│   ├── codex/
│   └── opencode/
└── tests/
```

---

## Documentation

| Document | Description |
|---|---|
| [Installation](docs/installation.md) | Step-by-step setup for each tool |
| [Customization](docs/customization.md) | Reorder segments, change colors, enable/disable modules |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and fixes |

---

## Dependency Policy

This project accepts only dependencies with **MIT**, **BSD**, or **Apache-2.0** licenses. Before submitting a pull request that adds a new dependency, verify its license. Dependencies with GPL, LGPL, AGPL, or proprietary licenses will not be accepted.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository and create a feature branch.
2. Add or update scripts following the existing style (header comments, graceful degradation, ASCII-safe output).
3. Add a test for any new script in `tests/`.
4. Run `shellcheck` on all changed scripts: `shellcheck scripts/**/*.sh`
5. Open a pull request using the provided [PR template](.github/pull_request_template.md).

For bugs or feature ideas, please open an issue using one of the [issue templates](.github/ISSUE_TEMPLATE/).

---

## License

[MIT](LICENSE) © Ryan MacLean


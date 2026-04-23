# Installation

This guide covers how to install the statusline scripts for each supported tool.

## Requirements

- Bash 3.2+ or Zsh 5.0+ (macOS and Linux)
- `git` (optional — the git segment is silently skipped if absent)

## Quick Install

```bash
git clone https://github.com/ryanmaclean/statuslines.git ~/.statusline-scripts
```

---

## Claude Code

### Bash

Add the following lines to your `~/.bashrc`:

```bash
source ~/.statusline-scripts/scripts/claude-code/statusline.sh
PS1='$(statusline_prompt) \$ '
```

### Zsh

Add the following lines to your `~/.zshrc`:

```zsh
source ~/.statusline-scripts/scripts/claude-code/statusline.sh
setopt PROMPT_SUBST
PROMPT='$(statusline_prompt) %% '
```

Reload your shell after editing:

```bash
exec "$SHELL"
```

---

## Codex

### Bash

```bash
source ~/.statusline-scripts/scripts/codex/statusline.sh
PS1='$(statusline_prompt) \$ '
```

### Zsh

```zsh
source ~/.statusline-scripts/scripts/codex/statusline.sh
setopt PROMPT_SUBST
PROMPT='$(statusline_prompt) %% '
```

---

## OpenCode

### Bash

```bash
source ~/.statusline-scripts/scripts/opencode/statusline.sh
PS1='$(statusline_prompt) \$ '
```

### Zsh

```zsh
source ~/.statusline-scripts/scripts/opencode/statusline.sh
setopt PROMPT_SUBST
PROMPT='$(statusline_prompt) %% '
```

---

## Verifying Your Setup

After reloading your shell you should see a prompt similar to:

```
[claude-code | main | 14:23:01] $
```

If no git repository is detected, the git segment is omitted automatically:

```
[claude-code | 14:23:01] $
```

---

## Updating

```bash
cd ~/.statusline-scripts
git pull
exec "$SHELL"
```

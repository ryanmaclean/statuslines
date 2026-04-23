#!/usr/bin/env bash
# examples/claude-code/statusline_example.sh
#
# Drop-in example showing how to wire the Claude Code statusline into bash or zsh.
#
# Usage:
#   1. Copy or source this file from your ~/.bashrc or ~/.zshrc:
#        source /path/to/statusline-scripts/examples/claude-code/statusline_example.sh
#   2. Reload your shell:
#        exec "$SHELL"
#
# Customization:
#   Edit the variables below before sourcing, or export them in your shell config.

# ── Optional customization ──────────────────────────────────────────────────
# Segment separator
export STATUSLINE_SEP=" | "

# Dirty-state indicator
export STATUSLINE_GIT_DIRTY_SYMBOL="*"

# Time format (strftime)
export STATUSLINE_TIME_FORMAT="%H:%M"

# Show exit code even when it's 0
export STATUSLINE_SHOW_ZERO_EXIT="0"

# ── Source the statusline script ─────────────────────────────────────────────
_EXAMPLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
source "$_EXAMPLE_DIR/../../scripts/claude-code/statusline.sh"

# ── Wire into the prompt ─────────────────────────────────────────────────────
if [ -n "${ZSH_VERSION:-}" ]; then
  # zsh — single quotes are intentional: deferred evaluation at prompt time
  setopt PROMPT_SUBST
  # shellcheck disable=SC2016,SC2034
  PROMPT='$(statusline_prompt) %% '
else
  # bash
  PS1='$(statusline_prompt) \$ '
fi

#!/usr/bin/env bash
# scripts/shared/git_info.sh
#
# Usage: source this file, then call git_info
#
# Outputs: "<branch>[*]" where [*] indicates uncommitted changes.
# Outputs nothing if not inside a git repository or if git is unavailable.
#
# Environment variables:
#   STATUSLINE_GIT_DIRTY_SYMBOL  - Symbol shown when repo is dirty (default: *)
#   STATUSLINE_GIT_CLEAN_SYMBOL  - Symbol shown when repo is clean (default: empty)

git_info() {
  # Bail out silently if git is not installed
  if ! command -v git > /dev/null 2>&1; then
    return 0
  fi

  local branch
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || return 0

  local dirty_symbol="${STATUSLINE_GIT_DIRTY_SYMBOL:-*}"
  local clean_symbol="${STATUSLINE_GIT_CLEAN_SYMBOL:-}"
  local state="$clean_symbol"

  if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    state="$dirty_symbol"
  fi

  printf '%s%s' "$branch" "$state"
}

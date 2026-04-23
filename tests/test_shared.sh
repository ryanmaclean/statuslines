#!/usr/bin/env bash
# tests/test_shared.sh
#
# Tests for scripts/shared/*.sh helper functions.
#
# Usage: bash tests/test_shared.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0
FAIL=0

# ── Test helpers ─────────────────────────────────────────────────────────────

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

assert_equals() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    pass "$desc"
  else
    fail "$desc (expected='$expected' actual='$actual')"
  fi
}

assert_not_empty() {
  local desc="$1" value="$2"
  if [ -n "$value" ]; then
    pass "$desc"
  else
    fail "$desc (value was empty)"
  fi
}

assert_empty() {
  local desc="$1" value="$2"
  if [ -z "$value" ]; then
    pass "$desc"
  else
    fail "$desc (expected empty, got='$value')"
  fi
}

# ── git_info tests ────────────────────────────────────────────────────────────
echo "--- git_info ---"

# shellcheck source=../scripts/shared/git_info.sh
source "$REPO_ROOT/scripts/shared/git_info.sh"

# Inside a git repo (CI always runs inside one)
result=$(git_info)
assert_not_empty "git_info returns non-empty inside a git repo" "$result"

# Custom dirty symbol
export STATUSLINE_GIT_DIRTY_SYMBOL="!"
result2=$(git_info)
assert_not_empty "git_info works with custom dirty symbol" "$result2"
unset STATUSLINE_GIT_DIRTY_SYMBOL

# ── exit_code_info tests ──────────────────────────────────────────────────────
echo "--- exit_code_info ---"

# shellcheck source=../scripts/shared/exit_code.sh
source "$REPO_ROOT/scripts/shared/exit_code.sh"

# Exit code 0 — hidden by default
assert_empty "exit_code_info 0 is empty by default" "$(exit_code_info 0)"

# Exit code 0 — shown when STATUSLINE_SHOW_ZERO_EXIT=1
export STATUSLINE_SHOW_ZERO_EXIT=1
assert_not_empty "exit_code_info 0 shown when STATUSLINE_SHOW_ZERO_EXIT=1" "$(exit_code_info 0)"
unset STATUSLINE_SHOW_ZERO_EXIT

# Non-zero exit code
assert_equals "exit_code_info 1 returns '1'" "1" "$(exit_code_info 1)"
assert_equals "exit_code_info 127 returns '127'" "127" "$(exit_code_info 127)"

# Custom failure symbol
export STATUSLINE_EXIT_FAILURE_SYMBOL="ERR"
assert_equals "exit_code_info with custom failure symbol" "ERR" "$(exit_code_info 1)"
unset STATUSLINE_EXIT_FAILURE_SYMBOL

# ── current_time tests ────────────────────────────────────────────────────────
echo "--- current_time ---"

# shellcheck source=../scripts/shared/current_time.sh
source "$REPO_ROOT/scripts/shared/current_time.sh"

time_output=$(current_time)
assert_not_empty "current_time returns non-empty output" "$time_output"

# Custom format
export STATUSLINE_TIME_FORMAT="%Y"
year_output=$(current_time)
current_year=$(date +"%Y")
assert_equals "current_time respects STATUSLINE_TIME_FORMAT" "$current_year" "$year_output"
unset STATUSLINE_TIME_FORMAT

# ── tool_indicator tests ──────────────────────────────────────────────────────
echo "--- tool_indicator ---"

# shellcheck source=../scripts/shared/tool_indicator.sh
source "$REPO_ROOT/scripts/shared/tool_indicator.sh"

# No env vars set — should be empty
unset STATUSLINE_TOOL_LABEL CLAUDE_CODE OPENCODE CODEX 2>/dev/null || true
assert_empty "tool_indicator is empty when no env vars set" "$(tool_indicator)"

# CLAUDE_CODE set
export CLAUDE_CODE=1
assert_equals "tool_indicator detects CLAUDE_CODE" "claude-code" "$(tool_indicator)"
unset CLAUDE_CODE

# OPENCODE set
export OPENCODE=1
assert_equals "tool_indicator detects OPENCODE" "opencode" "$(tool_indicator)"
unset OPENCODE

# CODEX set
export CODEX=1
assert_equals "tool_indicator detects CODEX" "codex" "$(tool_indicator)"
unset CODEX

# Override via STATUSLINE_TOOL_LABEL
export STATUSLINE_TOOL_LABEL="my-tool"
assert_equals "tool_indicator respects STATUSLINE_TOOL_LABEL" "my-tool" "$(tool_indicator)"
unset STATUSLINE_TOOL_LABEL

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1

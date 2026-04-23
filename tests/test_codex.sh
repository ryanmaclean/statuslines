#!/usr/bin/env bash
# tests/test_codex.sh
#
# Tests for scripts/codex/statusline.sh
#
# Usage: bash tests/test_codex.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0
FAIL=0

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

assert_contains() {
  local desc="$1" needle="$2" haystack="$3"
  if printf '%s' "$haystack" | grep -qF -- "$needle"; then
    pass "$desc"
  else
    fail "$desc (needle='$needle' not found in '$haystack')"
  fi
}

assert_not_contains() {
  local desc="$1" needle="$2" haystack="$3"
  if printf '%s' "$haystack" | grep -qF -- "$needle"; then
    fail "$desc (needle='$needle' unexpectedly found in '$haystack')"
  else
    pass "$desc"
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

echo "--- codex statusline ---"

# shellcheck source=../scripts/codex/statusline.sh
source "$REPO_ROOT/scripts/codex/statusline.sh"

output=$(statusline_prompt)
assert_not_empty "statusline_prompt returns non-empty output" "$output"
assert_contains "output contains tool label 'codex'" "codex" "$output"

export STATUSLINE_SHOW_TOOL=0
output_no_tool=$(statusline_prompt)
assert_not_contains "output hides tool when STATUSLINE_SHOW_TOOL=0" "codex" "$output_no_tool"
unset STATUSLINE_SHOW_TOOL

export STATUSLINE_SEP=" :: "
output_sep=$(statusline_prompt)
assert_contains "output uses custom separator" "::" "$output_sep"
unset STATUSLINE_SEP

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1

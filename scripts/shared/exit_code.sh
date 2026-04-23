#!/usr/bin/env bash
# scripts/shared/exit_code.sh
#
# Usage: source this file, then call exit_code_info <code>
#
# Outputs a styled representation of the previous exit code.
# Exit code 0 is shown with the success symbol; anything else with the failure symbol.
#
# Environment variables:
#   STATUSLINE_EXIT_SUCCESS_SYMBOL  - Symbol for success (default: 0)
#   STATUSLINE_EXIT_FAILURE_SYMBOL  - Symbol for failure (default: the exit code itself)
#   STATUSLINE_SHOW_ZERO_EXIT       - Set to "1" to always show exit code, even on success

exit_code_info() {
  local code="${1:-0}"
  local success_symbol="${STATUSLINE_EXIT_SUCCESS_SYMBOL:-0}"
  local show_zero="${STATUSLINE_SHOW_ZERO_EXIT:-0}"

  if [ "$code" -eq 0 ]; then
    if [ "$show_zero" = "1" ]; then
      printf '%s' "$success_symbol"
    fi
  else
    local failure_symbol="${STATUSLINE_EXIT_FAILURE_SYMBOL:-$code}"
    printf '%s' "$failure_symbol"
  fi
}

#!/usr/bin/env bash
# scripts/shared/current_time.sh
#
# Usage: source this file, then call current_time
#
# Outputs the current time as a string.
#
# Environment variables:
#   STATUSLINE_TIME_FORMAT  - strftime format string (default: %H:%M:%S)

current_time() {
  local fmt="${STATUSLINE_TIME_FORMAT:-%H:%M:%S}"
  printf '%s' "$(date "+$fmt")"
}

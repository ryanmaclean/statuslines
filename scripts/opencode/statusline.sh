#!/usr/bin/env bash
# scripts/opencode/statusline.sh
#
# OpenCode statusline script.
#
# Usage:
#   source this file in your shell config, then set your prompt:
#     PS1='$(statusline_prompt) \$ '       # bash
#     PROMPT='$(statusline_prompt) %% '    # zsh
#
# Segments (left to right):
#   [tool] [git branch+dirty] [exit code] [time]
#
# Environment variables (all optional):
#   STATUSLINE_SEP            - Segment separator (default: " | ")
#   STATUSLINE_SHOW_TOOL      - Set to "0" to hide the tool indicator (default: 1)
#   STATUSLINE_SHOW_GIT       - Set to "0" to hide git info (default: 1)
#   STATUSLINE_SHOW_EXIT      - Set to "0" to hide exit code (default: 1)
#   STATUSLINE_SHOW_TIME      - Set to "0" to hide the time segment (default: 1)
#   STATUSLINE_TOOL_LABEL     - Override tool label (default: auto-detected)
#   STATUSLINE_GIT_DIRTY_SYMBOL  - Dirty state symbol (default: *)
#   STATUSLINE_TIME_FORMAT    - strftime format (default: %H:%M:%S)
#   STATUSLINE_EXIT_SUCCESS_SYMBOL - Symbol for exit code 0 (default: 0)
#   STATUSLINE_SHOW_ZERO_EXIT - Show exit code even when 0 (default: 0)

_STATUSLINE_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
# shellcheck source=../shared/git_info.sh
source "$_STATUSLINE_SCRIPT_DIR/../shared/git_info.sh"
# shellcheck source=../shared/exit_code.sh
source "$_STATUSLINE_SCRIPT_DIR/../shared/exit_code.sh"
# shellcheck source=../shared/current_time.sh
source "$_STATUSLINE_SCRIPT_DIR/../shared/current_time.sh"
# shellcheck source=../shared/tool_indicator.sh
source "$_STATUSLINE_SCRIPT_DIR/../shared/tool_indicator.sh"

# Override tool label for OpenCode if not already set
: "${STATUSLINE_TOOL_LABEL:=opencode}"

statusline_prompt() {
  local _last_exit="${?}"
  local sep="${STATUSLINE_SEP:- | }"
  local parts=()

  if [ "${STATUSLINE_SHOW_TOOL:-1}" != "0" ]; then
    local tool
    tool=$(tool_indicator)
    [ -n "$tool" ] && parts+=("$tool")
  fi

  if [ "${STATUSLINE_SHOW_GIT:-1}" != "0" ]; then
    local git
    git=$(git_info)
    [ -n "$git" ] && parts+=("$git")
  fi

  if [ "${STATUSLINE_SHOW_EXIT:-1}" != "0" ]; then
    local exit_str
    exit_str=$(exit_code_info "$_last_exit")
    [ -n "$exit_str" ] && parts+=("$exit_str")
  fi

  if [ "${STATUSLINE_SHOW_TIME:-1}" != "0" ]; then
    local time_str
    time_str=$(current_time)
    [ -n "$time_str" ] && parts+=("$time_str")
  fi

  local output=""
  local first=1
  for part in "${parts[@]}"; do
    if [ "$first" -eq 1 ]; then
      output="$part"
      first=0
    else
      output="${output}${sep}${part}"
    fi
  done

  printf '[%s]' "$output"
}

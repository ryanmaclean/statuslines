#!/usr/bin/env bash
# scripts/shared/tool_indicator.sh
#
# Usage: source this file, then call tool_indicator
#
# Outputs a short label identifying the active AI coding tool based on
# well-known environment variables set by each tool.
#
# Detection order: Claude Code -> Codex -> OpenCode -> (empty)
#
# Environment variables:
#   STATUSLINE_TOOL_LABEL  - Override auto-detection with a fixed label
#   CLAUDE_CODE            - Set by Claude Code (any non-empty value triggers detection)
#   OPENAI_API_KEY         - Used as a heuristic for Codex environments
#   OPENCODE               - Set by OpenCode (any non-empty value triggers detection)

tool_indicator() {
  if [ -n "${STATUSLINE_TOOL_LABEL:-}" ]; then
    printf '%s' "$STATUSLINE_TOOL_LABEL"
    return 0
  fi

  if [ -n "${CLAUDE_CODE:-}" ]; then
    printf 'claude-code'
  elif [ -n "${OPENCODE:-}" ]; then
    printf 'opencode'
  elif [ -n "${CODEX:-}" ]; then
    printf 'codex'
  fi
}

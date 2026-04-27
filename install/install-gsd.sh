#!/usr/bin/env bash
# Install GSD-style statuslines for Claude Code, OpenCode, and Gemini CLI.
# Codex is wired up separately (see examples/codex.config.toml).
#
# Usage: ./install/install-gsd.sh [--claude] [--opencode] [--gemini] [--all]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DO_CLAUDE=0; DO_OPENCODE=0; DO_GEMINI=0

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 [--claude] [--opencode] [--gemini] [--all]"
  exit 2
fi
for arg in "$@"; do
  case "$arg" in
    --claude)   DO_CLAUDE=1 ;;
    --opencode) DO_OPENCODE=1 ;;
    --gemini)   DO_GEMINI=1 ;;
    --all)      DO_CLAUDE=1; DO_OPENCODE=1; DO_GEMINI=1 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing: $1" >&2; exit 1; }
}
need node
need jq

merge_json() {
  local target="$1" patch="$2"
  mkdir -p "$(dirname "$target")"
  if [[ -f "$target" ]]; then
    local tmp; tmp="$(mktemp)"
    jq -s '.[0] * .[1]' "$target" <(echo "$patch") > "$tmp"
    mv "$tmp" "$target"
  else
    echo "$patch" | jq '.' > "$target"
  fi
  echo "wrote $target"
}

if [[ $DO_CLAUDE -eq 1 ]]; then
  patch=$(jq -n --arg sl "node $ROOT/gsd/claude/statusline.js" --arg cm "node $ROOT/gsd/claude/context-monitor.js" '{
    statusLine: { type: "command", command: $sl, padding: 0 },
    hooks: { PostToolUse: [ { matcher: "*", hooks: [ { type: "command", command: $cm } ] } ] }
  }')
  merge_json "$HOME/.claude/settings.json" "$patch"
fi

if [[ $DO_OPENCODE -eq 1 ]]; then
  patch=$(jq -n --arg sl "node $ROOT/gsd/opencode/statusline.js" --arg pl "$ROOT/gsd/opencode/context-monitor.js" '{
    statusLine: { type: "command", command: $sl },
    plugin: [ $pl ]
  }')
  merge_json "$HOME/.config/opencode/opencode.json" "$patch"
fi

if [[ $DO_GEMINI -eq 1 ]]; then
  patch=$(jq -n --arg cm "node $ROOT/gsd/gemini/context-monitor.js" '{
    hooks: { AfterTool: [ { matcher: ".*", hooks: [ { type: "command", command: $cm } ] } ] }
  }')
  merge_json "$HOME/.gemini/settings.json" "$patch"
fi

echo "done."

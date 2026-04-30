#!/usr/bin/env bash
# Install pup-flavored statuslines for Claude Code and OpenCode.
# Codex is wired up separately by running pup/codex/hud.js (see README).
# Gemini has no statusline surface to attach to.
#
# Usage: ./install/install-pup.sh [--claude] [--opencode] [--all] [--seed-config]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DO_CLAUDE=0; DO_OPENCODE=0; SEED=0

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 [--claude] [--opencode] [--all] [--seed-config]"
  exit 2
fi
for arg in "$@"; do
  case "$arg" in
    --claude)       DO_CLAUDE=1 ;;
    --opencode)     DO_OPENCODE=1 ;;
    --all)          DO_CLAUDE=1; DO_OPENCODE=1 ;;
    --seed-config)  SEED=1 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing: $1" >&2; exit 1; }; }
need node
need jq
command -v pup >/dev/null 2>&1 || echo "warning: 'pup' not on PATH; statusline will show 'pup:not installed' until installed (brew tap datadog-labs/pack && brew install datadog-labs/pack/pup)" >&2

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

if [[ $SEED -eq 1 ]]; then
  CFG="$HOME/.config/statuslines/pup.json"
  if [[ -f "$CFG" ]]; then
    echo "config exists at $CFG (skipping seed)"
  else
    mkdir -p "$(dirname "$CFG")"
    cp "$ROOT/examples/pup.config.json" "$CFG"
    echo "seeded $CFG (edit tags/priority to taste)"
  fi
fi

if [[ $DO_CLAUDE -eq 1 ]]; then
  patch=$(jq -n --arg sl "node $ROOT/pup/claude/statusline.js" --arg cm "node $ROOT/pup/claude/context-monitor.js" '{
    statusLine: { type: "command", command: $sl, padding: 0 },
    hooks: { PostToolUse: [ { matcher: "*", hooks: [ { type: "command", command: $cm } ] } ] }
  }')
  merge_json "$HOME/.claude/settings.json" "$patch"
fi

if [[ $DO_OPENCODE -eq 1 ]]; then
  patch=$(jq -n --arg sl "node $ROOT/pup/opencode/statusline.js" --arg pl "$ROOT/pup/opencode/context-monitor.js" '{
    statusLine: { type: "command", command: $sl },
    plugin: [ $pl ]
  }')
  merge_json "$HOME/.config/opencode/opencode.json" "$patch"
fi

echo "done."
echo
echo "Tip: run \`node $ROOT/pup/cli.js fetch\` once to warm the cache, then"
echo "     \`node $ROOT/pup/cli.js show\` to preview the segment."

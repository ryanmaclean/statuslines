#!/usr/bin/env bash
# Smoke test: exercises cmd* handlers end-to-end against the real catalog.
# Does NOT re-run the unit tests (those live in tests/statuslines.test.js).
# Run from the repo root: bash tests/smoke.sh

# ── setup ────────────────────────────────────────────────────────────────────

# We want per-step failures captured, not abort-on-first-error, so no set -e.
# Individual helper functions use "|| return 1" for their own internal guards.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

NODE="node"
BIN="bin/statuslines.js"

passed=0
failed=0
_fail_msgs=""

ok()   { echo "OK   $1"; passed=$(( passed + 1 )); }
fail() {
  local name="$1"; shift
  echo "FAIL $name"
  # indent the extra context
  printf '     %s\n' "$@" >&2
  failed=$(( failed + 1 ))
}

# ── guard: jq must exist (configure --dry-run uses it for validation path) ──

if ! command -v jq >/dev/null 2>&1; then
  echo "FAIL prerequisite: jq is not on PATH (required for configure step)" >&2
  exit 1
fi

# ── step 1: list — exits 0, output line count >= visible entry count ─────────

{
  list_out=$("$NODE" "$BIN" list 2>/tmp/smoke_list_err)
  list_exit=$?
  if [ "$list_exit" -ne 0 ]; then
    fail "list:exit" "expected exit 0, got $list_exit" "$(cat /tmp/smoke_list_err)"
  else
    line_count=$(printf '%s\n' "$list_out" | grep -c '^\[' || true)
    # loadVisible() drives list; we count JSON files outside locks/ to get floor
    entry_count=$(find catalog -mindepth 2 -name '*.json' ! -path 'catalog/locks/*' | wc -l | tr -d ' ')
    # subtract quarantined entries (can't be negative)
    quarantined=$(grep -rc '"quarantined": true' catalog 2>/dev/null | awk -F: '{s+=$2} END{print s+0}')
    visible_floor=$(( entry_count - quarantined ))
    if [ "$line_count" -ge "$visible_floor" ]; then
      ok "list:exit+linecount ($line_count lines, floor $visible_floor)"
    else
      fail "list:linecount" "got $line_count lines, expected >= $visible_floor"
    fi
  fi
}

# ── step 2: list --cli=claude --redistributable — all lines have claude + [ok] ─

{
  list2_out=$("$NODE" "$BIN" list --cli=claude --redistributable 2>/tmp/smoke_list2_err)
  list2_exit=$?
  if [ "$list2_exit" -ne 0 ]; then
    fail "list:filtered:exit" "expected exit 0, got $list2_exit" "$(cat /tmp/smoke_list2_err)"
  else
    bad_lines=$(printf '%s\n' "$list2_out" | grep -v '^\[ok\]' | grep -v '^$' | grep -v '^(' || true)
    if [ -n "$bad_lines" ]; then
      fail "list:filtered:tags" "non-[ok] lines in output:" "$bad_lines"
    else
      ok "list:filtered (all [ok], all claude)"
    fi
  fi
}

# ── step 3: show <slug> for every visible entry — exits 0, valid JSON ────────

{
  show_pass=0
  show_fail=0
  while IFS= read -r entry_file; do
    slug=$(jq -r '.slug' "$entry_file" 2>/dev/null)
    quarantined_flag=$(jq -r '.security.quarantined // false' "$entry_file" 2>/dev/null)
    [ "$quarantined_flag" = "true" ] && continue
    [ -z "$slug" ] && continue

    show_out=$("$NODE" "$BIN" show "$slug" 2>/tmp/smoke_show_err)
    show_exit=$?
    if [ "$show_exit" -ne 0 ]; then
      fail "show:$slug" "exit $show_exit" "$(cat /tmp/smoke_show_err)"
      show_fail=$(( show_fail + 1 ))
      continue
    fi
    if ! printf '%s\n' "$show_out" | jq . >/dev/null 2>&1; then
      fail "show:$slug:json" "output is not valid JSON"
      show_fail=$(( show_fail + 1 ))
      continue
    fi
    show_pass=$(( show_pass + 1 ))
  done < <(find catalog -mindepth 2 -name '*.json' ! -path 'catalog/locks/*' | sort)
  ok "show: $show_pass slugs returned valid JSON ($show_fail failed)"
  if [ "$show_fail" -gt 0 ]; then
    # already reported per-slug; adjust counters
    passed=$(( passed - 1 ))
    failed=$(( failed + 1 ))
  fi
}

# ── step 4: configure <slug> --cli=<cli> --dry-run for redistributable entries
#    with non-empty configs.<cli> blocks. NEVER actually merges. ─────────────

{
  cfg_pass=0
  cfg_fail=0
  while IFS= read -r entry_file; do
    slug=$(jq -r '.slug' "$entry_file" 2>/dev/null)
    quarantined_flag=$(jq -r '.security.quarantined // false' "$entry_file" 2>/dev/null)
    redistributable=$(jq -r '.redistributable // false' "$entry_file" 2>/dev/null)
    [ "$quarantined_flag" = "true" ] && continue
    [ "$redistributable" != "true" ] && continue
    [ -z "$slug" ] && continue

    # iterate over configs keys that have at least one property
    while IFS= read -r cli; do
      [ -z "$cli" ] && continue
      cfg_out=$("$NODE" "$BIN" configure "$slug" --cli="$cli" --dry-run 2>/tmp/smoke_cfg_err)
      cfg_exit=$?
      if [ "$cfg_exit" -ne 0 ]; then
        fail "configure:$slug:$cli" "exit $cfg_exit" "$(cat /tmp/smoke_cfg_err)"
        cfg_fail=$(( cfg_fail + 1 ))
      else
        cfg_pass=$(( cfg_pass + 1 ))
      fi
    done < <(jq -r '
      .configs // {} |
      to_entries[] |
      select(.value | (type == "object") and (length > 0)) |
      .key
    ' "$entry_file" 2>/dev/null)
  done < <(find catalog -mindepth 2 -name '*.json' ! -path 'catalog/locks/*' | sort)

  if [ "$cfg_fail" -eq 0 ]; then
    ok "configure:dry-run: $cfg_pass combinations passed"
  else
    fail "configure:dry-run:summary" "$cfg_fail combination(s) failed out of $(( cfg_pass + cfg_fail ))"
  fi
}

# ── step 5: doctor — exits 0, warnings <= 10 ─────────────────────────────────

{
  doctor_out=$("$NODE" "$BIN" doctor 2>&1)
  doctor_exit=$?
  warn_count=$(printf '%s\n' "$doctor_out" | grep -c '^WARN' || true)
  if [ "$doctor_exit" -ne 0 ]; then
    fail "doctor:exit" "exit $doctor_exit (schema errors present)" \
      "$(printf '%s\n' "$doctor_out" | grep '^ERR')"
  elif [ "$warn_count" -gt 10 ]; then
    fail "doctor:warnings" "too many warnings: $warn_count (limit 10)"
  else
    ok "doctor (exit 0, $warn_count warning(s))"
  fi
}

# ── step 6: render-readme — idempotent on catalog/README*.md ─────────────────

{
  rr_out=$("$NODE" "$BIN" render-readme 2>&1)
  rr_exit=$?
  if [ "$rr_exit" -ne 0 ]; then
    fail "render-readme:exit" "exit $rr_exit" "$rr_out"
  else
    rr_fail=0
    for f in catalog/README.md catalog/README.fr.md catalog/README.ja.md; do
      if [ ! -f "$f" ]; then
        fail "render-readme:missing:$f" "file was not written"
        rr_fail=$(( rr_fail + 1 ))
      elif ! git diff --quiet "$f" 2>/dev/null; then
        fail "render-readme:not-idempotent:$f" "file changed vs committed; commit the render first"
        rr_fail=$(( rr_fail + 1 ))
      fi
    done
    [ "$rr_fail" -eq 0 ] && ok "render-readme (idempotent, 3 files)"
  fi
}

# ── step 7: render-top-readme — idempotent on README*.md at repo root ────────

{
  rtr_out=$("$NODE" "$BIN" render-top-readme 2>&1)
  rtr_exit=$?
  if [ "$rtr_exit" -ne 0 ]; then
    fail "render-top-readme:exit" "exit $rtr_exit" "$rtr_out"
  else
    rtr_fail=0
    for f in README.md README.fr.md README.ja.md; do
      if [ ! -f "$f" ]; then
        fail "render-top-readme:missing:$f" "file was not written"
        rtr_fail=$(( rtr_fail + 1 ))
      elif ! git diff --quiet "$f" 2>/dev/null; then
        fail "render-top-readme:not-idempotent:$f" "file changed vs committed; commit the render first"
        rtr_fail=$(( rtr_fail + 1 ))
      fi
    done
    [ "$rtr_fail" -eq 0 ] && ok "render-top-readme (idempotent, 3 files)"
  fi
}

# ── step 8: render-quarantine — idempotent on catalog/QUARANTINE*.md ─────────

{
  rq_out=$("$NODE" "$BIN" render-quarantine 2>&1)
  rq_exit=$?
  if [ "$rq_exit" -ne 0 ]; then
    fail "render-quarantine:exit" "exit $rq_exit" "$rq_out"
  else
    rq_fail=0
    for f in catalog/QUARANTINE.md catalog/QUARANTINE.fr.md catalog/QUARANTINE.ja.md; do
      if [ ! -f "$f" ]; then
        fail "render-quarantine:missing:$f" "file was not written"
        rq_fail=$(( rq_fail + 1 ))
      elif ! git diff --quiet "$f" 2>/dev/null; then
        fail "render-quarantine:not-idempotent:$f" "file changed vs committed; commit the render first"
        rq_fail=$(( rq_fail + 1 ))
      fi
    done
    [ "$rq_fail" -eq 0 ] && ok "render-quarantine (idempotent, 3 files)"
  fi
}

# ── step 9: verify-capabilities ccstatusline --dry-run — exits 0, valid JSON ─

{
  vc_out=$("$NODE" "$BIN" verify-capabilities ccstatusline --dry-run 2>/tmp/smoke_vc_err)
  vc_exit=$?
  if [ "$vc_exit" -ne 0 ]; then
    fail "verify-capabilities:exit" "exit $vc_exit" "$(cat /tmp/smoke_vc_err)"
  elif ! printf '%s\n' "$vc_out" | jq . >/dev/null 2>&1; then
    fail "verify-capabilities:json" "output is not valid JSON" "$vc_out"
  else
    ok "verify-capabilities:ccstatusline:dry-run (valid JSON)"
  fi
}

# ── summary ───────────────────────────────────────────────────────────────────

echo ""
echo "passed: $passed, failed: $failed"

[ "$failed" -eq 0 ] && exit 0 || exit 1

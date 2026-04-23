# Customization

All configuration is done through environment variables. Export them before sourcing the statusline script, or set them in your shell config file before the `source` line.

---

## Segment Separator

Change the string that is placed between segments:

```bash
# Default: " | "
export STATUSLINE_SEP=" > "
```

Example output with `STATUSLINE_SEP=" > "`:
```
[claude-code > main* > 14:23:01]
```

---

## Enabling and Disabling Modules

Each segment can be individually hidden by setting its variable to `"0"`:

| Variable | Default | Description |
|---|---|---|
| `STATUSLINE_SHOW_TOOL` | `1` | Tool indicator (e.g. `claude-code`) |
| `STATUSLINE_SHOW_GIT` | `1` | Git branch and dirty state |
| `STATUSLINE_SHOW_EXIT` | `1` | Exit code of the previous command |
| `STATUSLINE_SHOW_TIME` | `1` | Current time |

**Example — hide the time segment:**

```bash
export STATUSLINE_SHOW_TIME="0"
```

**Example — show only git and exit code:**

```bash
export STATUSLINE_SHOW_TOOL="0"
export STATUSLINE_SHOW_TIME="0"
```

---

## Reordering Segments

The segment order is defined inside each `statusline.sh` script. To change it, open the relevant file and reorder the `if` blocks in the `statusline_prompt()` function.

**Default order:**
1. Tool indicator
2. Git info
3. Exit code
4. Time

**Example — time first:**

```bash
statusline_prompt() {
  local _last_exit="${?}"
  local sep="${STATUSLINE_SEP:- | }"
  local parts=()

  # Time first
  [ "${STATUSLINE_SHOW_TIME:-1}" != "0" ] && parts+=("$(current_time)")

  # Then tool
  local tool; tool=$(tool_indicator)
  [ "${STATUSLINE_SHOW_TOOL:-1}" != "0" ] && [ -n "$tool" ] && parts+=("$tool")

  # Then git
  local git_str; git_str=$(git_info)
  [ "${STATUSLINE_SHOW_GIT:-1}" != "0" ] && [ -n "$git_str" ] && parts+=("$git_str")

  # Then exit code
  local exit_str; exit_str=$(exit_code_info "$_last_exit")
  [ "${STATUSLINE_SHOW_EXIT:-1}" != "0" ] && [ -n "$exit_str" ] && parts+=("$exit_str")

  local output="" first=1
  for part in "${parts[@]}"; do
    [ "$first" -eq 1 ] && output="$part" || output="${output}${sep}${part}"
    first=0
  done
  printf '[%s]' "$output"
}
```

---

## Git Dirty State Symbol

```bash
# Default: *
export STATUSLINE_GIT_DIRTY_SYMBOL="!"

# Remove the symbol entirely (show nothing when dirty)
export STATUSLINE_GIT_DIRTY_SYMBOL=""
```

---

## Time Format

Uses `date` strftime format strings:

```bash
# Default: HH:MM:SS
export STATUSLINE_TIME_FORMAT="%H:%M:%S"

# HH:MM only
export STATUSLINE_TIME_FORMAT="%H:%M"

# 12-hour clock with AM/PM
export STATUSLINE_TIME_FORMAT="%I:%M %p"
```

---

## Exit Code Display

```bash
# Always show exit code, even when it's 0
export STATUSLINE_SHOW_ZERO_EXIT="1"

# Custom success symbol
export STATUSLINE_EXIT_SUCCESS_SYMBOL="ok"
```

---

## Tool Label

Override the auto-detected tool label:

```bash
export STATUSLINE_TOOL_LABEL="my-tool"
```

Set to an empty string to suppress the tool segment output even when `STATUSLINE_SHOW_TOOL=1`:

```bash
export STATUSLINE_TOOL_LABEL=""
```

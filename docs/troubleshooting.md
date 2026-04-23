# Troubleshooting

Common issues and how to fix them.

---

## Prompt shows literal `$(statusline_prompt)`

**Symptom:** Your prompt displays the string `$(statusline_prompt) $` instead of the rendered output.

**Cause:** Command substitution is not being evaluated in your prompt string.

**Fix (bash):** Use single quotes, not double quotes, when setting `PS1`:

```bash
# Correct — single quotes defer evaluation
PS1='$(statusline_prompt) \$ '

# Wrong — double quotes evaluate immediately (once at source time)
PS1="$(statusline_prompt) \$ "
```

**Fix (zsh):** Enable `PROMPT_SUBST`:

```zsh
setopt PROMPT_SUBST
PROMPT='$(statusline_prompt) %% '
```

---

## Git segment is missing

**Symptom:** The git branch is not shown even inside a git repository.

**Causes and fixes:**

1. **`git` is not installed or not on `PATH`** — The segment silently skips when `git` is unavailable. Install git or check `echo $PATH`.

2. **`STATUSLINE_SHOW_GIT` is set to `"0"`** — Unset it or set it to `"1"`:
   ```bash
   export STATUSLINE_SHOW_GIT="1"
   ```

3. **You are not inside a git repository** — `git rev-parse` will fail. Change to a directory tracked by git.

---

## Prompt is slow

**Symptom:** There is a noticeable delay before each prompt appears.

**Causes and fixes:**

1. **Large git repository** — `git diff` can be slow on very large repos. Disable the git segment:
   ```bash
   export STATUSLINE_SHOW_GIT="0"
   ```

2. **Slow `date` command** — Unlikely, but disabling the time segment also helps:
   ```bash
   export STATUSLINE_SHOW_TIME="0"
   ```

---

## Exit code is always empty

**Symptom:** The exit code segment never shows anything.

**Cause:** By default, exit code `0` is hidden. The segment only appears when the last command failed.

**Fix:** To always show the exit code (including `0`):

```bash
export STATUSLINE_SHOW_ZERO_EXIT="1"
```

---

## ShellCheck warnings in CI

**Symptom:** CI fails with ShellCheck warnings on your custom scripts.

**Fix:** Run ShellCheck locally before pushing:

```bash
shellcheck scripts/**/*.sh
```

Common fixes:
- Quote all variable expansions: `"$var"` not `$var`
- Use `|| true` after commands that may exit non-zero when that is expected
- Add `# shellcheck disable=SCXXXX` for intentional suppressions (with a comment explaining why)

---

## `source` fails with "No such file or directory"

**Symptom:** Sourcing the statusline script produces an error.

**Cause:** The script uses `${BASH_SOURCE[0]}` to find its location. This may fail in some edge cases (e.g. symlinks or unusual shells).

**Fix:** Use the absolute path when sourcing:

```bash
source /absolute/path/to/statusline-scripts/scripts/claude-code/statusline.sh
```

---

## Changes to environment variables have no effect

**Symptom:** You exported a variable but the statusline output does not change.

**Fix:** Make sure you export the variable **before** sourcing the statusline script, or re-source the script after changing the variable:

```bash
export STATUSLINE_SEP=" > "
source ~/.statusline-scripts/scripts/claude-code/statusline.sh
```

Or simply open a new terminal session.

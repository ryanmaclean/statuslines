## Description

<!-- Briefly describe the changes in this pull request. -->

## Related issue

<!-- Closes #<issue number> -->

## Type of change

- [ ] Bug fix
- [ ] New segment / script
- [ ] Documentation update
- [ ] CI / tooling improvement
- [ ] Other (describe below)

## Checklist

- [ ] My scripts have header comments describing usage and expected env vars
- [ ] New or changed scripts fail gracefully when optional tools (e.g. `git`) are unavailable
- [ ] Output is ASCII-safe by default
- [ ] I have added or updated a test in `tests/` for my changes
- [ ] All tests pass locally: `bash tests/test_shared.sh && bash tests/test_claude_code.sh && bash tests/test_codex.sh && bash tests/test_opencode.sh`
- [ ] ShellCheck passes on all changed scripts: `shellcheck <file>`
- [ ] Any new dependency uses an MIT, BSD, or Apache-2.0 license
- [ ] I have updated `CHANGELOG.md` under `[Unreleased]`
- [ ] Documentation is updated if my changes affect user-facing behaviour

## Screenshots / terminal output (if applicable)

<!-- Paste relevant terminal output or screenshots showing the new/changed behaviour. -->

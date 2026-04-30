# Catalog entry schema

Each `catalog/<cli>/<slug>.json` is a single entry.

```json
{
  "slug": "ccstatusline",
  "name": "ccstatusline",
  "repo": "https://github.com/sirmalloc/ccstatusline",
  "license": "MIT",
  "redistributable": true,
  "host_clis": ["claude"],
  "language": "typescript",
  "description": "One sentence (we write this).",
  "install": {
    "type": "npx",
    "package": "ccstatusline",
    "version": "2.2.12",
    "integrity": "sha512-..."
  },
  "configs": {
    "claude": {
      "statusLine": {
        "type": "command",
        "command": "npx --ignore-scripts -y ccstatusline@2.2.12",
        "padding": 0
      }
    }
  },
  "tags": ["tokens", "powerline"],
  "notes": "optional free-form caveats",
  "security": {
    "has_install_scripts": false,
    "license_observed": "MIT",
    "last_audit": "2026-04-30",
    "quarantined": false,
    "quarantine_reason": null,
    "quarantined_at": null
  }
}
```

## Field reference

### Identity & licensing

- **slug**: lowercase, kebab-case, unique. Use an `<owner>-<name>` form when two upstreams share a name (e.g. `lucasilverentand-claudeline` vs `fredrikaverpil-claudeline`).
- **license**: SPDX identifier read from the upstream `LICENSE` file directly. README badges are not authoritative.
- **redistributable**: `true` only if the license is in the OSI-permissive allowlist (MIT, Apache-2.0, BSD-2/3-Clause, ISC, MPL-2.0, 0BSD). Copyleft (AGPL, GPL) and source-available (PolyForm-NC, BSL) and licenses we couldn't verify (no LICENSE file) → `false`. Non-redistributable entries are still listed for reference but skipped by `configure`.
- **host_clis**: any of `claude`, `opencode`, `gemini`, `codex`. An entry may target multiple.

### Install

- **install.type**: one of `npx`, `npm-global`, `cargo`, `brew`, `git`, `manual`, `opencode-plugin`.
  - `npx`: invoke at run time via `npx --ignore-scripts -y <package>@<version>`. No preinstall step.
  - `npm-global`: `npm i -g --ignore-scripts <package>@<version>`.
  - `cargo`: `cargo install <package> --version <version>`.
  - `brew`: `brew install <tap>/<formula>` (single-step, no separate `brew tap`).
  - `git`: clone to `~/.local/share/statuslines/<clone_dir>` and run from there.
  - `opencode-plugin`: OpenCode loads the package from npm at session start when added to `opencode.json`'s `plugin` array. No explicit install command.
  - `manual`: link only — user follows upstream install docs.
- **install.package** (npx / npm-global / opencode-plugin): the npm package name, including scope (e.g. `@owloops/claude-powerline`).
- **install.version**: **required** for `redistributable=true` non-`manual` entries. Pinned semver. `"latest"` is rejected by `doctor`. Backfilled and refreshed by `node bin/statuslines.js audit`.
- **install.integrity** (npm): the registry's `dist.integrity` SRI string (e.g. `sha512-...`). Captured by `audit`.
- **install.tap** + **install.formula** (brew): tap (e.g. `felipeelias/tap`) and formula name; `formula` defaults to `package` if omitted.
- **install.clone_dir** (git): destination subdirectory under `~/.local/share/statuslines/`.

### Configs

- **configs**: map of `<cli>` → JSON patch merged into that tool's settings file by `configure`. Keys must be one of the four `host_clis`.
- For redistributable entries, `configs.<cli>` may not contain `@latest`, `curl|sh`, `wget|sh`, `eval(`, `base64 -d`, or the literal string `<repository-url>`. `doctor` refuses entries that violate these rules.
- For `git` install type, the magic token `${INSTALL_DIR}` in any string value is substituted with the clone destination at configure time.

### Security block

- **security.has_install_scripts**: `true` if the upstream npm package declares `preinstall`, `install`, `postinstall`, or `prepare` lifecycle scripts. Detected automatically by `audit`. The default `--ignore-scripts` flag we add to `configure` mitigates the risk; `render-readme` warns when this is `true`.
- **security.license_observed**: the license string the most recent `audit` saw on the upstream package; should match `license` at the top level. A drift here is a license-regression signal.
- **security.last_audit**: ISO date of the last `audit` run for this entry.
- **security.quarantined**: `true` to hide the entry from `list`, `show`, `configure`, and the rendered READMEs. Defaults to `false`.
- **security.quarantine_reason**: required when `quarantined=true`. Free-form one-line reason.
- **security.quarantined_at**: ISO date of when the entry was quarantined.

Quarantined entries:
- Are absent from `bin/statuslines.js list` output unless the env var `STATUSLINES_REVEAL_QUARANTINE=1` is set.
- Cause `show <slug>` to print `no entry: <slug>` (same as a typo) unless reveal env is set.
- Cause `configure <slug>` to refuse with `no entry`. With reveal env set, it surfaces the quarantine reason and refuses anyway. To override, set the reveal env *and* pass `--ignore-quarantine`.
- Are excluded from both `catalog/README.md` and the catalog block in the top README.
- Are listed in `catalog/QUARANTINE.md` (regenerated by `render-quarantine`).

This is the OpenBSD-style "secure by default" stance: hidden, not warned-about. The forensic record lives in `QUARANTINE.md`.

## Adding an entry

1. Verify the license at the upstream repo — read the `LICENSE` file directly, not the README badge. If no `LICENSE` file exists at the canonical paths, set `redistributable: false` and `license: "Unspecified"`.
2. Confirm the install path actually works against the registry (npm package exists at the claimed name and version, brew formula resolves under the tap). For npm: `curl -s https://registry.npmjs.org/<pkg>` and read `dist-tags.latest`.
3. Write a one-sentence description in your own words. Don't paste from upstream.
4. Drop the JSON at `catalog/<cli>/<slug>.json`.
5. For `redistributable: true` entries, run `node bin/statuslines.js audit <slug>` to populate `install.version`, `install.integrity`, and `security.has_install_scripts`.
6. Run `node bin/statuslines.js doctor` to validate, then `render-readme` and `render-top-readme` to refresh the generated tables.
7. Open a PR.

# Catalog entry schema

Each `catalog/<cli>/<slug>.json` is a single entry. All fields below are required unless marked optional.

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
    "package": "ccstatusline"
  },
  "configs": {
    "claude": { "statusLine": { "type": "command", "command": "npx -y ccstatusline@latest", "padding": 0 } }
  },
  "tags": ["tokens", "powerline"],
  "notes": "optional free-form caveats"
}
```

## Field reference

- **slug**: lowercase, kebab-case, unique within the catalog.
- **license**: SPDX identifier verified against the upstream repo (must re-check before adding).
- **redistributable**: `true` only if the license is OSI-permissive enough to recommend (MIT, Apache-2.0, BSD-*, ISC, MPL-2.0). Copyleft (AGPL, GPL) and source-available (PolyForm-NC, BSL) are `false` — we still list them but don't generate install recipes.
- **host_clis**: any of `claude`, `opencode`, `gemini`, `codex`. An entry may target multiple.
- **install.type**: one of:
  - `npx`: invoke at run time via `npx -y <package>@latest` — no install step.
  - `npm-global`: needs `npm i -g <package>`.
  - `cargo`: needs `cargo install <package>`.
  - `brew`: needs `brew install <formula>` (with optional `tap`).
  - `git`: clone to `~/.local/share/statuslines/<slug>` and run from there.
  - `manual`: link only — user follows upstream install docs.
- **configs**: map of `<cli>` → JSON patch merged into that tool's settings file by `bin/statuslines.js configure`.
- **tags**: free-form labels for filtering.
- **notes**: optional caveats (rate-limit risks, manual auth required, performance characteristics).

## Adding an entry

1. Verify the license at the upstream repo (look at `LICENSE`, not the README).
2. Confirm install path actually works (npm package exists, brew formula resolves, etc.).
3. Write a one-sentence description in your own words. Don't paste from upstream.
4. Drop the JSON in `catalog/<cli>/<slug>.json`.
5. Run `node bin/statuslines.js doctor` to validate, then `node bin/statuslines.js render-readme` to refresh `catalog/README.md`.

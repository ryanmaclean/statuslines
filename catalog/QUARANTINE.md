# Quarantine

**Languages:** English · [Français](./QUARANTINE.fr.md) · [日本語](./QUARANTINE.ja.md)

Entries the catalog has hidden from `list`, `show`, `configure`, and the rendered READMEs because an automated security check fired or a maintainer flagged them.

Set `STATUSLINES_REVEAL_QUARANTINE=1` in the environment to reveal these in the CLI; pass `--ignore-quarantine` to `configure` to override and install anyway.

| Slug | Reason | Quarantined since |
|---|---|---|
| `0xhanniba1-cc-codex-statusline` | Repo unreachable: github.com/0xhanniba1/cc-codex-statusline returns 404 (verified via raw.githubusercontent HEAD/main/master and flagged by catalog-liveness, issue #9). Quarantined pending re-verification or removal. | 2026-07-18 |
| `ainsley-opencode-token-monitor` | Precautionary supply-chain hold (reversible). Bot PR #28 flags anomalous new transitive dependencies (@ai-sdk/provider, json-schema) in the opencode-token-monitor lockfile refresh. Quarantined pending manual dependency review. | 2026-07-18 |
| `b-open-statusline` | verbatim mirror of sirmalloc/ccstatusline with 0 divergent commits (GitHub compare confirms); described 1M-context [1m] auto-detect feature is absent from the source code | 2026-05-01 |
| `ccusage` | Precautionary supply-chain hold (reversible). Entry ships the safe pinned ccusage@18.0.11; bot PR #27 proposes bumping to 20.0.17, which introduces 8 new outbound domains (incl. blacksmith.sh, bun.com, nixos.org). Quarantined to block auto-bump and force manual domain review before the version advances. | 2026-07-18 |
| `darkronny23-statusmon` | Bundles Pokémon sprite assets and Pokemon-style font likely derived from Nintendo/Game Freak IP without license. | 2026-05-08 |

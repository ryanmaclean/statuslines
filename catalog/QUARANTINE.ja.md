# 隔離

**言語：** [English](./QUARANTINE.md) · [Français](./QUARANTINE.fr.md) · 日本語

自動セキュリティチェックが発火した、またはメンテナーが手動でフラグを立てたために、カタログが `list`、`show`、`configure`、生成された README から非表示にしているエントリです。

環境変数で `STATUSLINES_REVEAL_QUARANTINE=1` を設定すると CLI で表示されます。それでもインストールしたい場合は、`configure` に `--ignore-quarantine` を渡して上書きしてください。

| Slug | 理由 | 隔離日 |
|---|---|---|
| `b-open-statusline` | verbatim mirror of sirmalloc/ccstatusline with 0 divergent commits (GitHub compare confirms); described 1M-context [1m] auto-detect feature is absent from the source code | 2026-05-01 |

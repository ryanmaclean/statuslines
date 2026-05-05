# 変更履歴

**言語：** [English](./CHANGELOG.md) · [Français](./CHANGELOG.fr.md) · 日本語

このプロジェクトの注目すべき変更点はすべてこのファイルに記録されます。

フォーマットは [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) に基づいています。
本プロジェクトは semver 形式のセクションヘッダーを使用していますが、pre-1.0 のため、
バージョン番号は実際のタグではなく概念的なマイルストーンです。

## [未リリース]

### 追加
- `tests/statuslines.test.js` — 19 スイートにわたる 114 件のテスト。`validate()`、
  3 つのレンダラー（`renderReadme` / `renderTopReadmeBlocks` / `renderQuarantine`）
  の全ロケール対応、`loadVisible`/`loadAll` の検疫セマンティクス、パイプ／引用符
  エスケープ、画像フォールバック、設定スニペットエスケープを網羅。
- `tests/run.sh` 便利ラッパー。CI（`catalog-doctor.yml`）が doctor ステップの前に
  テストスイートを実行するようになり、`tests/**` の変更でもトリガーされます。
- `catalog-liveness`：すべての可視エントリの `image.url` に HEAD を送信し、結果を
  `ok / og-stable / wrong_content_type / redirected / dead` に分類して既存の
  リポジトリ＋npm レジストリプローブと並んで `/tmp/liveness.md` レポートに
  ドリフトを出力する画像 URL 生存確認パス。`--json <path>` でエクスポートも可能。

### 修正
- `renderReadme(lang)` が `catalog/README.fr.md` および `catalog/README.ja.md` を
  レンダリングする際、JSON に翻訳済みフィールドが存在する場合でも英語の説明を
  表示していた問題を修正。`description_fr` / `description_ja` を正しく参照するよう
  変更。
- `cmdConfigure` に `install.type="manual"` の明示的な分岐を追加。以前は PATH 上に
  バイナリがない状態でも設定スニペットをサイレントにマージしていたが、上流リンクへの
  誘導を表示して終了コード 1 で終了するよう修正。
- `scripts/verify-capabilities.mjs`：監査担当者がバグの可能性があると指摘した
  `!noNetFailed === false` ブール式を簡略化（動作は変わらず、可読性を向上）。
- `scripts/deps-verify.mjs`：以前のリファクタリングで残った `? header : header` の
  デッドコードとなっていた三項演算子を削除。

---

## [0.7.0] — テスト、画像生存確認、カタログテーブルのローカライズ

### 追加
- トップ README（EN/FR/JA）に CLI 別サムネイルテーブルを追加：
  `renderTopReadmeBlocks()` が CLI ごとに `プレビュー | 名称 | ライセンス | 説明`
  の 4 列テーブルを生成し、上流リポジトリへリンクされた 200 px の画像サムネイルを
  表示。
- カタログテーブルの説明をローカライズ：23 エントリすべてに `description_fr` と
  `description_ja` フィールドを追加。FR・JA トップ README のカタログブロックが
  対象言語でレンダリングされるように。
- `termframe` プレビューハーネス（`scripts/preview-via-termframe.mjs`）：
  合成 Claude Code statusline JSON を仮想 PTY で上流バイナリに通し、SVG 出力を
  キャプチャ。macOS iTerm2 用テンプレートも提供。
- 3 つの Claude statusline に SVG ベクタープレビューを追加（`ccstatusline`、
  `lucasilverentand-claudeline`、`owloops-claude-powerline`）— 各 3〜7 KB で、
  数 MB の GIF を置き換え。
- `scripts/optimize-images.mjs`：WebP 変換パイプライン（`sharp` + `cwebp`）と
  `gifsicle` のみによる GIF 最適化。カタログに参照されていない孤立 GIF を削除。
- `tokscale.png` を WebP に最適化（1.35 MB → 58 KB）。

### 変更
- `render-top-readme` が 1 回のパスで 3 つのロケール README を書き出すようになり、
  カウントバッジとカタログブロックが EN/FR/JA 間で常に同期されます。
- `validate()` が `image.source` の有効な列挙値として `"termframe-synthetic"` を
  受け入れるようになりました。

---

## [0.6.0] — ローカライズされたカタログ、画像プレビュー、b-open-statusline の検疫

### 追加
- FR + JA の完全翻訳：トップ `README`、`catalog/README`、`catalog/SCHEMA`、
  `catalog/QUARANTINE`、`catalog/CAPABILITIES` — すべてのトップレベルドキュメントに
  言語シブリングが追加されました。
- すべての英語正典ドキュメント（`README.md`、`SECURITY.md`、`catalog/SCHEMA.md`、
  `catalog/CAPABILITIES.md`）に言語ナビゲーションバーを追加。`render-readme` と
  `render-quarantine` も生成物に言語バーを出力するように更新。
- ローカル画像プレビュー：`catalog/images/` に各エントリのスクリーンショット/OG
  カードのコミット済みコピーを収録（24 ファイル）。`scripts/grab-images.mjs` は
  再実行可能なダウンローダー（冪等、30 日間の更新 TTL、`--force` オプション）。
  レンダラーは `image.url` より `image.local` を優先。
- スキーマに `image { url, alt, source, local }` フィールドを追加。
  `scripts/apply-images.mjs` はブートストラップパッチャー。
  `catalog/SCHEMA.md` にフィールドと有効な `source` 値を文書化。

### 変更
- `gsd/` コンテキストヘルスフレーバーを削除。`pup/` がリポジトリ内唯一の
  リファレンス statusline となりました。context-monitor スクリプトは `pup/claude/`
  および `pup/opencode/` に移動（`git rename` によりヒストリーを保持）。
- `install/install-pup.sh`、`examples/`、`package.json` が `gsd/` から `pup/` へ
  再パス設定。`bin` 内の `statusline-gsd-*` エントリ 6 件を削除。
- `README.md` のロードマップセクションを出荷済み作業に合わせて書き直し。

### 修正
- `validate()` が再配布可能エントリに `image` ブロックがない場合に警告を出力。
  非 https の `image.url`、`github.com/user-attachments` URL（非ブラウザクライアント
  から 403 が返る）、範囲外の alt 文字列、不明な `source` 値を拒否するように。

### セキュリティ
- **b-open-statusline を検疫。** GitHub の比較により `sirmalloc/ccstatusline` との
  差分コミットが 0 件であること、両方の `package.json` が同じ name を宣言していること、
  主張されているコンテキストウィンドウ自動検出機能がソースに存在しないことを確認。
  OpenBSD スタイルのパターンに従って検疫し、カタログ件数を 24 → 23 に減少。

---

## [0.5.0] — サプライチェーン強化 Phase F–J（PQC 署名、tarball 差分、ケイパビリティ、プロベナンス、ロックファイル）

### 追加
- **Phase F — PQC 署名。** `scripts/manifest.mjs` が `catalog/MANIFEST.json` を
  Ed25519 + ML-DSA-65（FIPS 204）ハイブリッド署名でビルド・署名・検証します。
  `scripts/keygen.mjs` が鍵ペアを生成。秘密鍵はリポジトリに入りません。
  `catalog/MAINTAINERS.md` が公開鍵を保持。
  `.github/workflows/catalog-manifest-verify.yml` がマニフェスト無効または
  非同期の PR をブロック。ライブラリ：`@noble/post-quantum 0.6.1`
  （純粋 JS、ネイティブバインディングなし）。
- **Phase G — ケイパビリティ宣言＋サンドボックス検証。** エントリごとの
  `capabilities` ブロック（`network`、`child_process`、`filesystem_write`、
  `env_read`、`verified_at`、`verification_method`）を `catalog/SCHEMA.md` と
  `catalog/CAPABILITIES.md` に文書化。`scripts/verify-capabilities.mjs` が
  firejail 下（bubblewrap / strace フォールバック）でインストールを実行し、
  観察された動作と宣言を比較。`bin/statuslines.js` に
  `verify-capabilities <slug>` サブコマンドを追加。
  `.github/workflows/catalog-capabilities.yml` が週次実行（水曜 09:11 UTC）。
  観察された権限が宣言を超えたエントリを検疫。
- **Phase H — バージョン更新ボット＋tarball 差分。** `scripts/tarball-diff.mjs`
  （純粋 stdlib tar リーダー、ネイティブ依存なし）が古い/新しい tarball を 5 種類の
  フラグカテゴリー（新しいライフサイクルスクリプト、新しいトップレベルドメイン、
  新しいバイナリ blob、LICENSE 変更、大幅なサイズ増加）で比較。
  `scripts/version-bumps.mjs` がアップグレードを提案。不審な差分は適用せずに
  `quarantined-from-bump` セクションに保留。
  `.github/workflows/catalog-version-bumps.yml` が週次実行（月曜 03:37 UTC）。
- **Phase I — npm プロベナンス証明の適用（アドバイザリ）。**
  `scripts/provenance-check.mjs` が npm レジストリから SLSA ビルドプロベナンス
  証明を取得し、エントリごとに `available` / `regression` を記録。
  `.github/workflows/catalog-provenance.yml` が週次実行（木曜 09:47 UTC）。
  アドバイザリ：`doctor` は証明なしのエントリを拒否しません。
- **Phase J — 推移的依存ロックファイル（アドバイザリ）。**
  `scripts/deps-capture.mjs` が npm slim-packument フォーマットを使用して各
  再配布可能 npm エントリの完全な依存クロージャを解決し、
  `catalog/locks/<slug>.json` に書き出します。`scripts/deps-verify.mjs` が
  再解決してドリフト（依存の追加、同一バージョンでの整合性変化）を通知。
  `.github/workflows/catalog-deps-verify.yml` が週次実行（水曜 11:53 UTC）。
  アドバイザリフェーズ — `doctor` でのハード失敗はまだありません。
- Phase G ケイパビリティバックフィルで `MANIFEST.json` を再構築（再配布可能
  20 エントリに保守的なデフォルト値を設定）。

### 変更
- `bin/statuslines.js validate()` が `{ errs, warns }` を返すようになり、
  ケイパビリティのギャップがロールアウト猶予期間中に `WARN` 行として表示されますが、
  `doctor` はブロックしません。

---

## [0.4.0] — サプライチェーン強化 Phase B–E（SAST / SCA / SAIST / Socket.dev / カタログ SAST）

### セキュリティ
- **Phase B/C/D — Datadog SAST、SCA、SAIST、Socket.dev ワークフロー。**
  6 つのワークフローすべてが fail-closed（シークレット未設定時はゼロ終了で警告を出力。
  鍵が設定される前でもマージ安全）：
  - `datadog-sast-self.yml`：`DataDog/datadog-static-analyzer-github-action@v3` による
    日次＋PR ごとの自コード静的解析。フォーク PR のセキュリティのためのステップ単位の
    シークレットガード。
  - `datadog-sca-self.yml`：`reachability: true` による週次 SCA で、実際に呼び出される
    コードパスへの脆弱性ノイズを絞り込み。
  - `datadog-saist-self.yml`：Ollama Cloud 経由の AI 補強型 SAST（検出＋検証の二段階）。
    `.py`/`.go` 変更時のみトリガー（上流 SAIST は Java/Python/Go をサポート）。
    `OPENAI_BASE_URL` に `/v1` を含めてはなりません — SAIST クライアントが内部で
    付加します（`internal/clients/openai.go`）。
  - `catalog-socket-feed.yml` + `scripts/socket-feed.mjs`：Socket.dev 悪意あるパッケージ
    フィードの日次スイープ。HTTP Basic 認証（トークンをユーザー名に、パスワードは空 —
    Bearer は Socket の API で拒否される）。高/重大アラートで自動検疫。
- **Phase E — カタログ全体の SAST ワークフロー。**
  `scripts/catalog-sast.mjs` + `.github/workflows/catalog-sast.yml` が
  各再配布可能エントリのソース（npm tarball または `git clone`）に対して
  Datadog 静的アナライザーを週次実行（月曜 08:11 UTC）。検疫/バックフィル用の
  ボット PR を作成。`DD_API_KEY` は Datadog へのアップロードのみに必要で、
  アナライザー自体はオフラインでオープンソースとして実行。
- `catalog-doctor.yml` と `catalog-liveness.yml` を構築。liveness probe はバージョン
  ドリフト、整合性ドリフト、ライセンスドリフト、リポジトリのリダイレクト、および
  ピン以降の上流進捗シナリオを検出。`catalog-liveness` タグ付きの単一トラッキング
  issue を作成またはコメント。

---

## [0.3.0] — Phase A：カタログスキーマ強制、audit コマンド、検疫

### 追加
- `bin/statuslines.js audit [<slug>] [--dry-run]`：npm レジストリを調査し、
  `install.version`、`install.integrity`、`security.has_install_scripts`、
  `security.license_observed`、`security.last_audit` をバックフィル。
  `@latest` ピンを書き換え、`npx` コマンドに `--ignore-scripts` を注入。
- `catalog/QUARANTINE.md` を検疫エントリのフォレンジック記録として追加
  （常に生成される。非表示エントリとその理由を公開）。
- 9 つの npm 解決可能エントリにピン付きバージョンと整合性 SRI ハッシュをバックフィル
  （`ccstatusline 2.2.12`、`ccusage 18.0.11`、`lucasilverentand-claudeline 1.11.0`、
  `owloops-claude-powerline 1.26.0`、`thisdot-context-statusline 0.2.2`、
  `tokscale 2.0.27`、`ainsley-opencode-token-monitor 0.5.0`、
  `joaquinvesapa-sub-agent-statusline 0.5.4`、
  `ramtinj95-opencode-tokenscope 1.6.3`）。
- スキーマに `security { has_install_scripts, license_observed, last_audit,
  quarantined, quarantine_reason, quarantined_at }` ブロックを追加。

### 変更
- `list` / `show` / `configure` / `render-readme` / `render-top-readme` が
  デフォルトで検疫エントリをフィルタリング（OpenBSD スタイルのセキュアデフォルト）。
  表示には `STATUSLINES_REVEAL_QUARANTINE=1` が必要。`configure` はさらに
  `--ignore-quarantine` が必要。
- `list` がエントリをフィルタリングした場合、非表示件数のフッターを表示。

### セキュリティ
- **Phase A — スキーマ強制。** `doctor` が以下を拒否するようになりました：
  再配布可能エントリの非ピンバージョン、`configs.<cli>` 内の `@latest`、
  危険なパターン（`curl|sh`、`wget|sh`、`eval(`、`base64 -d`、
  `<repository-url>` プレースホルダー）、`quarantined: true` 時の
  `quarantine_reason` の欠如。
- すべての `npx` configure レシピにデフォルトで `--ignore-scripts` を注入。
- 9 つの npm 解決可能エントリのうち 0 件がライフサイクルインストールスクリプト
  （`preinstall`/`postinstall`/`install`/`prepare`）を宣言 — ベースラインを確認。

---

## [0.2.0] — CLI ツール付き整理済みカタログ（14 エントリ）

### 追加
- `catalog/<cli>/<slug>.json` 構造：対象 CLI ごと（`claude/`、`opencode/`、
  `gemini/`、`codex/`、`multi/`）のエントリ JSON ファイル。
- カタログ CLI `bin/statuslines.js`：`list`、`show`、`configure`、`doctor`、
  `render-readme`、`render-top-readme` サブコマンドを実装。
- 14 の初期エントリ：最初のバッチ（5 件のインストール確認済み、1 件の
  OpenCode）、続いて第 2 バッチ 9 件（3 件確認済み、6 件は参照のみ）。
  Claude Code、OpenCode、Gemini CLI、Codex CLI をカバー。
- `catalog/README.md`：エントリごとの詳細テーブル（ステータス、インストール種別、
  言語）。`catalog/SCHEMA.md`：フィールドごとの規則。
- `catalog/QUARANTINE.md` スタブ。
- トップレベル `README.md` をクイックスタート、対応マトリクス、構成ツリー、
  コントリビューションガイド、ロードマップを含む整理済みカタログのランディング
  ページとして再構成。
- スキーマに `install.integrity`（SRI ハッシュ）、`redistributable`、
  `install.type`、`configs.<cli>` フィールドを定義。

### 変更
- `configure` が再配布不可ライセンスのエントリをスキップ。それらは参照のみで
  一覧に残ります。
- トップ README をマルチフレーバーの statusline ガイドからカタログインデックスへ
  転換。

---

## [0.1.0] — 初期リポジトリ内 statusline（GSD + pup フレーバー）

### 追加
- `lib/`：共有ヘルパー — `bar.js`、`colors.js`、`git.js`、ブリッジファイル I/O、
  stdin ガード。
- `gsd/` フレーバー（GSD = コンテキストヘルス）：Claude Code、OpenCode、
  Gemini CLI、Codex CLI 向けの statusline と `PostToolUse` / `tool.execute.after` /
  `AfterTool` コンテキストモニター。ブリッジファイル
  `/tmp/statuslines-<tool>-ctx-<session>.json` が `used_pct` と
  `remaining_percentage` を伝達。60 秒鮮度ガード、5 呼び出しデバウンス、
  CRITICAL エスカレーションはデバウンスをバイパス。
- `pup/` フレーバー（Datadog 可観測性）：TTL 制御キャッシュ（`O_EXCL` ロックファイル、
  TTL 60 秒、並行レンダリング時は ≤250 ms で古いキャッシュへフォールバック）を通じて
  `pup events list --duration 5m --output json` から最近のイベントを読み取り。
  auth/rate-limit/ENOENT エラーはサイレント失敗ではなく、バーに可視ラベルとして
  表示。`pup/cli.js` に `fetch` と `show` サブコマンドを実装。
- `examples/`：CLI ごとの貼り付け用設定スニペット。
- `install/install-gsd.sh` と `install/install-pup.sh`：`jq` ベースの
  `settings.json` / config マージャー。

---

[未リリース]: https://github.com/datadog-labs/statuslines/compare/HEAD...HEAD
[0.7.0]: https://github.com/datadog-labs/statuslines/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/datadog-labs/statuslines/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/datadog-labs/statuslines/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/datadog-labs/statuslines/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/datadog-labs/statuslines/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/datadog-labs/statuslines/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/datadog-labs/statuslines/releases/tag/v0.1.0

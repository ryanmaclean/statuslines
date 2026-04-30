# セキュリティ

**言語：** [English](./SECURITY.md) · [Français](./SECURITY.fr.md) · 日本語

カタログはサードパーティのコードを、ユーザーがフルシェル権限で実行するインストールコマンドへ自動的に解決します。この攻撃面を真剣に扱うとは、単一ツールへの依存ではなく、層状の防御を意味します。

## 脅威モデル（要約）

| # | 脅威 | 実例 | 緩和策 |
|---|---|---|---|
| T1 | メンテナーアカウント乗っ取りによる悪意あるバージョンの再公開 | npm `event-stream`、`ua-parser-js` | バージョン固定、整合性ハッシュ、Socket.dev フィード、バージョン更新差分 |
| T2 | `npx` 実行時のポストインストールスクリプト | 容易かつ広範に存在 | `--ignore-scripts` をデフォルト化、`has_install_scripts` による検出 |
| T3 | タイポスクワッティング／類似名パッケージ | 「claudeline」には別個の二つの上流が存在 | `<owner>-<slug>` 命名、doctor による強制 |
| T4 | 上流のライセンス退行 | 稀ではあるが現実に起きる | 週次の liveness probe がレジストリのライセンスを再確認 |
| T5 | リポジトリの削除／移管／301 | npm パッケージの移管は実際に起きる | liveness probe が毎日全リポジトリへ HEAD を送信 |
| T6 | Git-HEAD への悪意ある変更 | `colors.js`、`faker.js` の自爆事例 | git エントリはコミット SHA または署名付きタグに固定 |
| T7 | 推移的依存内の CVE | npm の絶え間ない更新 | Datadog SCA による到達可能性解析 |
| T8 | curl-pipe-bash | doctor レベルで拒否 |
| T9 | 悪意あるカタログ PR | 起こり得る | doctor によるパターンチェック（`curl|sh`、`eval(`、`<repository-url>`、`@latest`） |

## 防御レイヤー（状況）

| レイヤー | 内容 | 状況 |
|---|---|---|
| スキーマ強制 | `doctor` が未固定バージョン、危険なパターン、検疫理由の欠落を拒否 | ✅ 出荷済み（Phase A） |
| ポストインストール検出 | `audit` がライフサイクルスクリプトを宣言する npm パッケージを警告 | ✅ 出荷済み |
| `--ignore-scripts` デフォルト | `configure` が `npx` レシピへ `--ignore-scripts` を注入 | ✅ 出荷済み |
| 検疫時の非表示 | OpenBSD-style：検疫されたエントリは `list`／`show`／`configure` から消失 | ✅ 出荷済み |
| Liveness probe | リポジトリへの日次 HEAD ＋ npm レジストリのバージョン一致確認 ＋ ライセンス変動検出 | ✅ 出荷済み（シークレット不要） |
| Datadog SAST | 自コードに対するルールベース静的解析 | 配線済み（ワークフローはシークレットゲート付きで導入） |
| Datadog SCA | 依存関係に対する SBOM ＋ 脆弱性 ＋ 到達可能性 | 配線済み |
| Datadog SAIST | AI 補強型 SAST、検出と検証の二段階処理 | 配線済み（現在は上流側で Java／Python／Go のみ対応） |
| Socket.dev フィード | 悪意あるパッケージ警告の毎時参照 | 配線済み |
| バージョン更新差分ボット | 全アップグレード PR に対する tarball 差分 | 計画中（Phase E） |
| PQC 署名 | カタログエントリへの Ed25519 ＋ SLH-DSA ハイブリッド | 計画中（Phase F） |
| ケイパビリティサンドボックス | エントリごとのネットワーク／ファイルシステム権限宣言 | 計画中（Phase G） |

## リポジトリ設定

ワークフローはシークレット未設定時に *fail closed*（安全側に倒れて停止）します。警告を出力したうえで正常終了するため、鍵が用意される前でも本リポジトリを安全にマージできます。各レイヤーを有効化するには、**Settings → Secrets and variables → Actions** で以下を設定してください。

| シークレット名 | 利用元 | 必須？ |
|---|---|---|
| `DD_API_KEY` | datadog-sast-self.yml、datadog-sca-self.yml、datadog-saist-self.yml | SAST／SCA／SAIST に必要 |
| `DD_APP_KEY` | 同上 — `code_analysis_read` スコープが必要 | SAST／SCA に必要 |
| `OLLAMA_API_KEY` | datadog-saist-self.yml — Ollama Cloud のベアラートークン | SAIST に必要 |
| `SOCKET_API_TOKEN` | catalog-socket-feed.yml | npm パッケージリスクの日次フィードに必要 |

任意のリポジトリ **Variables**（シークレットではありません）。

| 変数 | 既定値 | 利用元 |
|---|---|---|
| `DD_SITE` | `datadoghq.com` | SAST／SCA／SAIST ワークフロー |
| `OPENAI_BASE_URL` | `https://ollama.com` | SAIST ワークフロー — Ollama Cloud は OpenAI 互換です。**`/v1` を含めないでください** — SAIST の OpenAI クライアントが内部的に付加します（`internal/clients/openai.go` で確認済み）。`/v1` が二重になるとリクエストが破綻します。 |
| `SAIST_DETECTION_MODEL` | ワークフローごと | SAIST 検出パス |
| `SAIST_VALIDATION_MODEL` | ワークフローごと | SAIST 検証パス |

## 脆弱性の報告

本リポジトリ自体のコードまたはワークフローロジックの問題は、公開 issue ではなく GitHub セキュリティアドバイザリを通じて報告してください。**カタログエントリ**（一覧化しているサードパーティパッケージ）の問題については、まず上流に提起してください。確認次第、当方で検疫します。

## 監査

各エントリの最新のセキュリティプローブ結果は `security.last_audit` に記録され、整合性ハッシュおよび観測されたライセンスもあわせて保持されます。検疫されたエントリは、CLI の表示設定に関わらず [`catalog/QUARANTINE.md`](catalog/QUARANTINE.md) に列挙されます。同ファイルは明示的なフォレンジック記録です。

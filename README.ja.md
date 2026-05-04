# statuslines

**言語：** [English](./README.md) · [Français](./README.fr.md) · 日本語

> Claude Code、OpenCode、Gemini CLI、Codex CLI 向けに整理した statusline
> カタログと、Datadog に接続したリポジトリ内リファレンス・フレーバー
> （`pup/`）。

*ひとつのパターン、四つのエージェント CLI、数十の statusline。*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-23-orange)
<!-- count:end -->
![CLIs covered](https://img.shields.io/badge/CLIs-Claude%20%7C%20OpenCode%20%7C%20Gemini%20%7C%20Codex-informational)

## 目次

- [クイックスタート](#クイックスタート)
- [カタログ](#カタログ)
  - [Claude Code](#claude-code)
  - [OpenCode](#opencode)
  - [Gemini CLI](#gemini-cli)
  - [Codex CLI](#codex-cli)
- [カタログ CLI](#カタログ-cli)
- [リポジトリ内フレーバー](#リポジトリ内フレーバー)
  - [pup — Datadog 可観測性](#pup--datadog-可観測性)
- [対応マトリクス](#対応マトリクス)
- [構成](#構成)
- [コントリビューション](#コントリビューション)
- [関連プロジェクト](#関連プロジェクト)
- [ロードマップ](#ロードマップ)
- [ライセンス](#ライセンス)

## クイックスタート

Node ≥ 20 と `jq` が必要です。

```sh
# カタログを閲覧する
node bin/statuslines.js list
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline

# リポジトリ内 pup フレーバーをインストールする
./install/install-pup.sh --all --seed-config
```

Codex CLI にはまだコマンドベースのネイティブ statusline がありません。
tmux 上で HUD を起動してください。

```sh
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## カタログ

ホスト CLI ごとに索引化しています。OSI 互換の寛容ライセンスを持つ
エントリには `bin/statuslines.js configure` で実行できるインストール／
構成レシピが同梱されます。`(ref)` と記されたエントリは参照のみで、
インストールは上流の手順に従ってください。

詳細な表（ステータス、インストール種別、言語）は
[`catalog/README.md`](catalog/README.md) にあり、JSON エントリから生成
されます。同ファイルが正典です。下の英語ブロックは
`node bin/statuslines.js render-top-readme` により自動生成されるため、
データとの乖離を避ける目的で英語のまま残しています。

<!-- catalog:start -->
### Claude Code

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| <a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="./catalog/images/ccometixline.png" width="200"></a> | [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) | MIT | インタラクティブな TUI 設定ツール、git 連携、使用量追跡を備えた Rust 製の高速 Claude Code statusline。 |
| <a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="./catalog/images/ccstatusline.svg" width="200"></a> | [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) | MIT | インタラクティブな TUI 設定ツール、powerline レンダリング、テーマ、トークン・git・セッションタイマー・クリッカブルリンクのウィジェットを備えたカスタマイズ可能な Claude Code statusline。 |
| <a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="200"></a> | [**ccusage**](https://github.com/ryoppippi/ccusage) | MIT | ローカルの Claude Code および Codex セッション JSONL ファイルを解析するトークン使用量・コスト分析ツール。statusline 自体ではないが、statusline 構築に有用なデータソースとして活用できます。 |
| <a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="./catalog/images/claude-hud.png" width="200"></a> | [**claude-hud**](https://github.com/jarrodwatts/claude-hud) | MIT | コンテキスト使用量・アクティブツール・実行中サブエージェント・Todo 進捗・レート制限ウィンドウをネイティブ statusline API で表示する Claude Code プラグイン／statusline。 |
| <a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="./catalog/images/daniel3303-claude-statusline.png" width="200"></a> | [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) | MIT `(ref)` | モデル・トークン・レート制限・git ステータスを表示する Bash + PowerShell 製の Claude Code statusline。 |
| <a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="./catalog/images/dwillitzer-claude-statusline.png" width="200"></a> | [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) | MIT `(ref)` | オプションの Node.js + tiktoken トークンカウントと、Claude・OpenAI・Gemini・Grok のマルチプロバイダーモデルカラーリングに対応した Bash 製 Claude Code statusline。 |
| <a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="./catalog/images/felipeelias-claude-statusline.webp" width="200"></a> | [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) | MIT | モジュールベースの設定、OSC 8 ハイパーリンク、テーマプリセット（`catppuccin`、`tokyo-night`、`gruvbox-rainbow` など）を備えた Go バイナリ製 Claude Code statusline。 |
| <a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="./catalog/images/fredrikaverpil-claudeline.png" width="200"></a> | [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) | MIT | Claude Code プラグインとして配布されるミニマリスト Go 製 Claude Code statusline。プラグインの `/claudeline:setup` スラッシュコマンドがバイナリをダウンロードして settings.json にパッチを当てます。 |
| <a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="./catalog/images/hagan-claudia-statusline.png" width="200"></a> | [**claudia-statusline**](https://github.com/hagan/claudia-statusline) | MIT | 永続的な統計追跡、Linux・macOS・Windows 向けビルド済みバイナリ、11 テーマを備えた Rust 製 Claude Code statusline。公式 Claude Code ドキュメントでも参照されています。 |
| <a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="./catalog/images/lucasilverentand-claudeline.svg" width="200"></a> | [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) | MIT | npm パッケージ `claudeline` として配布され、組み込みテーマと `--install` フラグによる settings.json への自動インストールに対応した Claude Code statusline。 |
| <a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="./catalog/images/ndave92-claude-code-status-line.png" width="200"></a> | [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) | MIT | ワークスペース情報・git ステータス・モデル名・コンテキスト使用量・worktree ヒント・クォータタイマー・オプションの API コストを表示する Rust 製 Claude Code statusline。 |
| <a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="./catalog/images/owloops-claude-powerline.svg" width="200"></a> | [**claude-powerline**](https://github.com/Owloops/claude-powerline) | MIT | リアルタイム使用量追跡・git 連携・テーマプリセットを備えた Vim スタイルの powerline Claude Code statusline。 |
| <a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="./catalog/images/sotayamashita-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) | MIT | starship ライクな設定とモジュールベースの構成に対応した Rust 製 Claude Code statusline。 |
| <a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="claude-code-context-status-line repo preview" src="./catalog/images/thisdot-context-statusline.png" width="200"></a> | [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) | MIT | セッション JSONL トランスクリプトを解析して入力・キャッシュ作成・キャッシュ読み取りトークンを集計し、正確なコンテキストウィンドウを表示する Claude Code statusline。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM の価格情報に基づいてトークン使用量を追跡するクロス CLI 対応ツール。 |

### OpenCode

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| <a href="https://github.com/Ainsley0917/opencode-token-monitor"><img alt="opencode-token-monitor repo preview" src="./catalog/images/ainsley-opencode-token-monitor.png" width="200"></a> | [**opencode-token-monitor**](https://github.com/Ainsley0917/opencode-token-monitor) | MIT | OpenCode プラグイン（statusline ではない）で、`token_stats` / `token_history` / `token_export` ツールを登録し、入力・出力・推論・キャッシュのトークン内訳をトースト通知で表示します。 |
| <a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="./catalog/images/joaquinvesapa-sub-agent-statusline.webp" width="200"></a> | [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) | MIT | サブエージェントのアクティビティ・経過時間・トークン／コンテキスト使用量を表示する OpenCode TUI サイドバープラグイン（statusLine.command ではない）。 |
| <a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="./catalog/images/markwilkening-opencode-status-line.png" width="200"></a> | [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) | MIT | OpenCode CLI 向けの軽量・高速な statusline。 |
| <a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="./catalog/images/opencode-quota.webp" width="200"></a> | [**opencode-quota**](https://github.com/slkiser/opencode-quota) | MIT | コンテキストウィンドウを汚染しない OpenCode のクォータおよびトークン使用量表示ツール。OpenCode Go・Cursor・GitHub Copilot などのプロバイダーをサポートします。 |
| <a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="./catalog/images/ramtinj95-opencode-tokenscope.png" width="200"></a> | [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) | MIT | セッションのトークン使用量とコストを詳細な内訳とともに分析する OpenCode プラグイン（statusline ではない）。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM の価格情報に基づいてトークン使用量を追跡するクロス CLI 対応ツール。 |

### Gemini CLI

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| <a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="./catalog/images/kiriketsuki-gemini-statusline.png" width="200"></a> | [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) | Unspecified `(ref)` | モデル・ワークスペースコンテキスト・git ブランチ・GitHub Issue 件数・受信トレイ件数を表示する Gemini CLI 向け 2 行シェルプロンプトヘルパー。Gemini CLI にはネイティブ statusLine フックがないため、ユーザーのシェルプロンプトから実行します。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM の価格情報に基づいてトークン使用量を追跡するクロス CLI 対応ツール。 |

### Codex CLI

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| <a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="./catalog/images/capedbitmap-codex-hud.png" width="200"></a> | [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) | PolyForm-Noncommercial-1.0.0 `(ref)` | ローカルの Codex セッションデータを取り込み、週次リセットのタイミングと残余容量に基づいて次に使用するアカウントを推薦する macOS メニューバーアプリ。 |
| <a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="200"></a> | [**ccusage**](https://github.com/ryoppippi/ccusage) | MIT | ローカルの Claude Code および Codex セッション JSONL ファイルを解析するトークン使用量・コスト分析ツール。statusline 自体ではないが、statusline 構築に有用なデータソースとして活用できます。 |
| <a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="./catalog/images/fwyc-codex-hud.png" width="200"></a> | [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) | MIT | セッション／コンテキスト使用量・git ステータス・ツールアクティビティ監視を備えた OpenAI Codex CLI 向けリアルタイム tmux statusline HUD。`--kill` / `--list` / `--attach` / `--self-check` サブコマンドも含みます。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM の価格情報に基づいてトークン使用量を追跡するクロス CLI 対応ツール。 |

<!-- catalog:end -->

## カタログ CLI

```sh
node bin/statuslines.js list                          # 全エントリ
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline             # メタデータ全部
node bin/statuslines.js configure ccstatusline --cli=claude --dry-run
node bin/statuslines.js configure ccstatusline --cli=claude
node bin/statuslines.js doctor                        # 全エントリ検証
node bin/statuslines.js render-readme                 # catalog/README.md を再生成
node bin/statuslines.js render-top-readme             # 本ファイルを再生成
```

`configure` は再配布不可ライセンスのエントリをスキップします。それらは
参照のみで一覧に残ります。

## リポジトリ内フレーバー

カタログと並んで、リファレンスとなる statusline がひとつ同梱されています。
Datadog のイベントの健全性をバーに浮上させる `pup/` です。

### pup — Datadog 可観測性

[datadog-labs/pup](https://github.com/datadog-labs/pup) からの最近の
**イベント**（既定で過去 5 分）を、`alert_type` でグループ化して
表示します。

pup の statusline は、レンダリング経路から `pup` を呼び出すことは
ありません。TTL によって制御されたキャッシュを読み取ります。

1. レンダラは `${TMPDIR}/statuslines-pup-events.json` を読み込みます。
2. キャッシュが **`ttl_seconds` より新しい**（既定 60 秒）場合は、
   そのまま使われます。
3. 古い場合、レンダラはロックファイル（`O_EXCL`）を取得します。別の
   レンダラがロックを保持しているときは ≤ 250 ms 待機し、それ以上の
   API 呼び出しをキューに積まずに古いキャッシュへフォールバックします。
4. ロック保持者は `pup events list --duration 5m --output json` を一度
   実行し、結果をアトミックに書き込み、ロックを解放します。
5. エラー（auth、rate-limit、ENOENT）はキャッシュに書き出され、バーに
   `pup:auth?`、`pup:rate-limited`、`pup:not installed` として表示
   されます。リトライストームは発生しません。
6. すべてのフェッチは `${TMPDIR}/statuslines-pup.log` に記録されます。

キャッシュの経過時間はバーに表示されます（例：
`pup:✓3 ⚠1 ✗0 (45s)`）。5 分を超えると `(stale)` と表示され、薄く
描画されます。

#### 設定

`~/.config/statuslines/pup.json`（または `STATUSLINES_PUP_*` 環境変数）：

| キー | 既定値 | 意味 |
|---|---|---|
| `ttl_seconds` | `60` | `pup` 呼び出し間隔の最小秒数 |
| `duration` | `"5m"` | `pup events list --duration` に渡すウィンドウ |
| `tags` | `null` | `--tags` として渡される |
| `priority` | `null` | `normal` / `low` |
| `alert_type` | `null` | `error` / `warning` / `info` / `success` / `user_update` |
| `sources` | `null` | `--sources` として渡される |
| `max_events` | `50` | `--limit` として渡される |
| `pup_bin` | `"pup"` | バイナリパスの上書き |

`examples/pup.config.json` に雛形があります。
`./install/install-pup.sh --seed-config` で初期化できます。

#### クイックスタート（pup）

```sh
brew tap datadog-labs/pack && brew install datadog-labs/pack/pup
pup auth login
./install/install-pup.sh --all --seed-config
node ./pup/cli.js fetch    # キャッシュをウォームアップ
node ./pup/cli.js show     # セグメントをプレビュー
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## 対応マトリクス

| CLI | カスタム statusline | ツール後フック | アプローチ |
|---|---|---|---|
| Claude Code | 対応（`statusLine.command`） | 対応（`PostToolUse`） | `pup/claude/statusline.js` + `context-monitor.js` |
| OpenCode | 対応（`statusLine.command`） | 対応（プラグイン `tool.execute.after`） | `pup/opencode/statusline.js` + `context-monitor.js` |
| Gemini CLI | **非対応**（[#8191](https://github.com/google-gemini/gemini-cli/issues/8191)） | 対応（`AfterTool`） | リポジトリには非同梱（サードパーティの選択肢はカタログ参照） |
| Codex CLI | 組み込み項目のみ（[#14043](https://github.com/openai/codex/issues/14043)、[#17827](https://github.com/openai/codex/issues/17827)） | 対応（`~/.codex/hooks/`） | 外部 HUD デーモン — `pup/codex/hud.js` |

## 構成

```
lib/                共有ヘルパー（bar、colors、git、bridge ファイル、stdin ガード）
catalog/            サードパーティエントリ — CLI ごとに slug ごとの JSON
  claude/           Claude Code 向け
  opencode/         OpenCode 向け
  gemini/           Gemini CLI 向け
  codex/            Codex CLI 向け
  multi/            複数 CLI を対象とするエントリ
pup/                Datadog 可観測性フレーバー
examples/           CLI ごとの貼り付け用設定スニペット
install/            インストールスクリプト
bin/                カタログ CLI（list/show/configure/doctor/render-{readme,top-readme}）
```

## コントリビューション

カタログにエントリを追加するには：

1. 上流リポジトリのライセンスを `LICENSE` ファイルで直接確認してください
   （README のバッジは正典ではありません）。`LICENSE` がない場合は
   `redistributable: false` とし、参照専用として扱ってください。
2. インストール経路が実際に機能することを確認してください（npm
   パッケージが存在する、brew formula が解決する など）。README の主張を
   信じるよりも、独立検証のほうが確実です。
3. 一文の説明を自分の言葉で書いてください。上流からの貼り付けは避けて
   ください。
4. JSON を `catalog/<cli>/<slug>.json`（複数 CLI のエントリは
   `catalog/multi/`）に配置してください。
5. `node bin/statuslines.js doctor` で検証し、続いて
   `node bin/statuslines.js render-readme` と
   `node bin/statuslines.js render-top-readme` を実行して生成テーブルを
   更新してください。
6. PR を開いてください。

完全なスキーマとフィールドごとの規則は
[`catalog/SCHEMA.md`](catalog/SCHEMA.md) にあります。コピーレフト系
（AGPL、GPL）やソース利用可能系（PolyForm-NC、BSL）のエントリも歓迎します。
それらは `(ref)` タグ付きで掲載され、`configure` の対象外となります。

## 関連プロジェクト

知っておく価値のある整理済みリスト群（リンクのみ、内容のコピーは
しません）：

- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
  — Claude Code 向けの skills、hooks、slash-commands、agents、statusline。
- [awesome-opencode/awesome-opencode](https://github.com/awesome-opencode/awesome-opencode)
  — OpenCode 向けのプラグイン、テーマ、エージェント、プロジェクト。

## ロードマップ

出荷済み：

- 対応する 4 つの CLI 全てにわたるコンテキスト健全性パターン。
- 設定例とインストールスクリプト。
- TTL 制御キャッシュとロックファイル協調フェッチを備える `pup/`
  Datadog フレーバー。
- `list` / `show` / `configure` / `doctor` / `audit` コマンドを備える
  サードパーティ statusline カタログ。
- スキーマレベルのサプライチェーン強化：バージョン固定と整合性ハッシュ、
  `curl|sh` / `eval(` / `@latest` パターンの拒否、`npx` /
  `npm-global` レシピでの `--ignore-scripts` 既定化。
- OpenBSD 流の隔離：フラグの立ったエントリは `list` / `show` /
  `configure` および生成 README から消失します。フォレンジック記録は
  `catalog/QUARANTINE.md` に残ります。
- 日次の liveness probe（リポジトリ ＋ npm レジストリのバージョン
  一致 ＋ ライセンスドリフト）と週次の Socket.dev 悪意あるパッケージ
  フィード。
- Datadog SAST / SCA / SAIST ワークフロー、シークレットゲート付きで、
  鍵の到着前にフォークしても安全。
- エントリごとのケイパビリティ宣言（`network`、`child_process`、
  `filesystem_write`、`env_read`）と firejail + strace によるサンドボックス
  検証。
- 全 npm 系再配布可能エントリに対する SLSA ビルドプロベナンスプローブと、
  推移的依存ロックファイルの週次再検証。

次の予定：

- バージョン更新 PR ごとの tarball 差分ボット。
- カタログエントリへの Ed25519 + SLH-DSA ハイブリッド署名。
- オプトインフラグの裏に隠した、より豊かな `pup/` セグメント
  （monitors、incidents）。

## ライセンス

MIT

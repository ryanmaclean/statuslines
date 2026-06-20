# statuslines

**言語：** [English](./README.md) · [Français](./README.fr.md) · 日本語

> Claude Code、OpenCode、Gemini CLI、Codex CLI 向けに整理した statusline
> カタログと、Datadog に接続したリポジトリ内リファレンス・フレーバー
> （`pup/`）。

*ひとつのパターン、四つのエージェント CLI、数十の statusline。*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-102-orange)
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
- [変更履歴](./CHANGELOG.ja.md)
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
| <a href="https://github.com/0xHanniba1/cc-codex-statusline"><img alt="cc-codex-statusline preview" src="./catalog/images/0xhanniba1-cc-codex-statusline.png" width="200"></a> | [**cc-codex-statusline**](https://github.com/0xHanniba1/cc-codex-statusline) | MIT | Claude CodeとCodexのステータスラインを1つのリポジトリにまとめ、それぞれワンライナーcurlインストーラを提供。両CLIにパス表示、モデル表示、カラーコード付きレート制限カウントダウンを追加する。 |
| <a href="https://github.com/adam-ismael/claude-fitness-break"><img alt="adam-ismael/claude-fitness-break repository preview" src="./catalog/images/adam-ismael-claude-fitness-break.png" width="200"></a> | [**claude-fitness-break**](https://github.com/adam-ismael/claude-fitness-break) | MIT | Claudeがエージェントを生成するたびに発火するフックプラグイン。ランダムなエクササイズを選び、鬼教官・80年代コーチ・90年代レスラー・神経質な医師の4つの個性のいずれかでclaude-haikuを通じて叫びかける。5分のクールダウン付きでステータスラインに表示する。 |
| — | [**ccstatusline-gradient**](https://github.com/akkaz/ccstatusline-gradient) | MIT | ccstatuslineのフォークで、Claude Codeのステータスラインテキストに文字ごとにグラデーションカラーをスイープ表示する機能と、ウィジェット値に基づく動的な色変化を追加します。7つの組み込みプリセットと、単一のnpxコマンドによるインタラクティブなオンボーディングUIを提供します。 |
| — | [**ccstatusline Tokyo Night Theme**](https://github.com/Alequip/ccstatusline-tokyonight) | MIT | ccstatusline向けのTokyo Nightカラーテーマプリセット。Claude Code用に4行のパワーライン形式ステータスラインを提供し、セッション・週次・コンテキストのトークン使用量をプログレスバーで表示する。ベースツールはnpxでインストールが必要。 |
| — | [**ministats**](https://github.com/aneeshtigga/ministats) | MIT | モデル名、推論努力レベル、トークン数付きのコンテキスト使用バー、セッションの累積コストを表示するClaude Code用のコンパクトなステータスラインで、オプションのcavemanバッジにも対応しています。 |
| <a href="https://github.com/AnirudhMKumar/claude-code-statusline"><img alt="anirudhmkumar-claude-code-statusline preview" src="./catalog/images/anirudhmkumar-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/AnirudhMKumar/claude-code-statusline) | MIT | ディレクトリ、Gitブランチ、アクティブモデル、コンテキスト使用量を表示するWindows向けPowerShellステータスライン — 外部依存なしでirm/iexコマンド1行でインストール可能。 |
| — | [**claude-statusline**](https://github.com/anthonybaldwin/claude-statusline) | MIT | Claude Code 向けのゼロ依存 Bun 製ステータスラインで、コンテキスト使用量・API コスト（消費率付き）・レートリミットウィンドウ・git/PR 状態・アクティブなサブエージェントを多行ターミナルダッシュボードとして表示します。リポジトリをクローンして bun install.js を実行するだけで ~/.claude/settings.json が自動設定されます。 |
| — | [**CCStatusline4DeepSeek**](https://github.com/asaberui1/CCStatusline4DeepSeek) | MIT | 16ブロックのコンテキストウィンドウ進捗バー、セッション累積コスト（CNY/¥）、トークン使用量メトリクス、APIで取得したDeepSeekリアルタイム残高を表示する、Claude Code用2行ステータスラインスクリプト。 |
| <a href="https://github.com/AsafSaar/claude-code-statusline"><img alt="claude-code-statusline segment preview" src="./catalog/images/asafsaar-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/AsafSaar/claude-code-statusline) | MIT | トグル可能なセグメント（cwd、Gitブランチ、dirty、ahead/behind、モデル、node、コンテキスト、コスト、時間、行数、最終コミット、スタッシュ、エフォート、レート制限、tsエラー）をセグメントごとのアイコンとカラー閾値で組み合わせた完全設定可能なステータスライン。 |
| — | [**cc-petline**](https://github.com/Assenav-Gnuj/cc-petline) | MIT | Rustで書かれたClaude Code用のアニメーションスプライトマスコット（キツネ）で、フックイベント（思考中、作業中、休眠中など）に反応し、モデル・git状態・トークン使用量・コスト/予算追跡を表示するCharmbracelet風ステータスラインと組み合わせて動作します。~3fpsのステータスラインカラムモードと25fpsのスムーズなratatuiTUIペインモードの両方をサポートします。 |
| — | [**ccstatusline-charm**](https://github.com/Assenav-Gnuj/ccstatusline-charm) | MIT | Charm/lipglossカラーパレットでスタイリングされたClaude Code向けccstatusline設定で、モデル情報・コンテキスト使用量・セッションコスト・トークン制限をコンパクトなステータスラインに表示します。 |
| — | [**fun-fact-bawstos**](https://github.com/BawstosAI/fun-fact-bawstos) | MIT | Claude Codeのステータスラインに400以上のトピック別ランダムなトリビアを自動でローテーション表示します。npxでインストールし、~/.claude/settings.jsonにstatusLineエントリを追加して統合されます。 |
| — | [**claude-code-plan-statusline**](https://github.com/blazemalan/claude-code-plan-statusline) | MIT | Claude Codeのステータスラインフックで、プランのレート制限使用率（5時間および週次のローリングウィンドウ）とセッション指標（コンテキスト充填率、キャッシュの鮮度、コスト）をテーマ付きANSI出力で表示し、ネットワーク呼び出しや認証を必要としません。 |
| <a href="https://github.com/brandonchartier/cc-statusline"><img alt="cc-statusline showing model, git, tokens, effort, and rate limits" src="./catalog/images/brandonchartier-cc-statusline.png" width="200"></a> | [**cc-statusline**](https://github.com/brandonchartier/cc-statusline) | MIT | モデル、Gitブランチ、トークン使用率、推論エフォートレベル、5時間/7日レート制限ウィンドウ、ローカル時刻を表示するミニマルなPythonステータスライン — APIコールもOAuthも不要。 |
| <a href="https://github.com/briansmith80/claude-code-status-bar"><img alt="claude-code-status-bar OpenGraph card" src="./catalog/images/briansmith80-claude-code-status-bar.png" width="200"></a> | [**claude-code-status-bar**](https://github.com/briansmith80/claude-code-status-bar) | MIT | 18セグメント・7カラーテーマ対応のピュアbashステータスライン。コンテキストバー、5時間・週次レート制限のペーシング、Git状態、セッションコスト、ライブツールアクティビティを依存関係ゼロで提供する。 |
| — | [**claude-statusline**](https://github.com/callmemorgan/claude-statusline) | MIT | Claude Code、Antigravity CLI、Pi向けの高速でテーマ対応のターミナルステータスラインレンダラーで、コスト追跡、コンテキストウィンドウ使用量、レート制限の予測、git情報などのセッションメトリクスをコンパクトな色分け形式で表示します。 |
| <a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="./catalog/images/ccometixline.png" width="200"></a> | [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) | MIT | インタラクティブな TUI 設定ツール、git 連携、使用量追跡を備えた Rust 製の高速 Claude Code statusline。 |
| <a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="./catalog/images/ccstatusline.svg" width="200"></a> | [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) | MIT | インタラクティブな TUI 設定ツール、powerline レンダリング、テーマ、トークン・git・セッションタイマー・クリッカブルリンクのウィジェットを備えたカスタマイズ可能な Claude Code statusline。 |
| <a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="200"></a> | [**ccusage**](https://github.com/ryoppippi/ccusage) | MIT | ローカルの Claude Code および Codex セッション JSONL ファイルを解析するトークン使用量・コスト分析ツール。statusline 自体ではないが、statusline 構築に有用なデータソースとして活用できます。 |
| <a href="https://github.com/chae-dahee/claude-buddy"><img alt="chae-dahee/claude-buddy repo preview" src="./catalog/images/chae-dahee-claude-buddy.png" width="200"></a> | [**claude-buddy**](https://github.com/chae-dahee/claude-buddy) | MIT | Claude Codeステータスラインに住むアニメーションASCIIコンパニオン。18種・5レアリティのガチャテーブルからロールされ、DEBUGGINGやSNARKなどのステータスを持ち、7日ごとにレベルアップする。 |
| <a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="./catalog/images/claude-hud.png" width="200"></a> | [**claude-hud**](https://github.com/jarrodwatts/claude-hud) | MIT | コンテキスト使用量・アクティブツール・実行中サブエージェント・Todo 進捗・レート制限ウィンドウをネイティブ statusline API で表示する Claude Code プラグイン／statusline。 |
| — | [**ccstatusline retro-hud**](https://github.com/codyslater/ccstatusline_retro-hud) | MIT | Claude Code向けのレトロSF風HUDステータスラインテーマで、モデル名、作業ディレクトリ、gitブランチ、コンテキスト使用率、トークンI/O比率、レート制限、セッション時間、コストをネオンワイヤーフレーム風の美観と分数ブロック進捗バーで2行表示します。 |
| <a href="https://github.com/ctfbio/claude-code-statusline"><img alt="claude-code-statusline (ctfbio) OpenGraph card" src="./catalog/images/ctfbio-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (ctfbio)**](https://github.com/ctfbio/claude-code-statusline) | MIT | セッション時間、ECBレートによる多通貨コスト表示、MTok単価、支出上限、エフォートレベルを表示するシェルステータスライン — 24時間キャッシュにより実行時のネットワーク呼び出しはゼロ。 |
| <a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="./catalog/images/daniel3303-claude-statusline.png" width="200"></a> | [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) | MIT | モデル・トークン・レート制限・git ステータスを表示する Bash + PowerShell 製の Claude Code statusline。 |
| <a href="https://github.com/danielmackay/claude-code-statusline"><img alt="danielmackay-claude-code-statusline GitHub preview" src="./catalog/images/danielmackay-claude-code-statusline.png" width="200"></a> | [**Claude Code Statusline**](https://github.com/danielmackay/claude-code-statusline) | Unspecified `(ref)` | Claude Code 向けシェルスクリプト製ステータスライン。アクティブモデル、コンテキスト使用量、セッションコスト、リセット時刻付き5時間レート制限バー、Gitブランチ、差分統計を表示する。 |
| — | [**glm-quota-line**](https://github.com/deluo/glm-quota-line) | MIT | Zhipu GLM Coding PlanのAPIクォータ使用状況（残高、週次消費量、コンテキストウィンドウ使用率、リセットまでの時間）をClaude Codeのステータスラインに直接表示します。 |
| — | [**ccstatusline-editor**](https://github.com/dpc00/ccstatusline-editor) | MIT | ccstatuslineの設定ファイルをブラウザのビジュアルなドラッグ＆ドロップUIで編集できるWebベースのエディタ。JSONを手動編集せずにClaude Codeのステータスラインを構築・カスタマイズでき、83種類以上のウィジェット、30のプリセット、56のカラーテーマをサポートし、Ctrl+Sでccstatuslineの設定ファイルに直接保存できる。 |
| <a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="./catalog/images/dwillitzer-claude-statusline.png" width="200"></a> | [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) | MIT | オプションの Node.js + tiktoken トークンカウントと、Claude・OpenAI・Gemini・Grok のマルチプロバイダーモデルカラーリングに対応した Bash 製 Claude Code statusline。 |
| — | [**quotaline**](https://github.com/Entrolution/quotaline) | MIT | Claude Codeのステータスラインプラグインで、APIコールや認証情報不要でClaude Codeのstdinから直接データを読み取り、アカウント全体の5時間・週次使用制限をリアルタイムの消費レートと上限警告とともに表示します。 |
| — | [**vastline**](https://github.com/Entrolution/vastline) | MIT | Claude CodeのステータスラインプラグインでVast.aiのGPUインスタンス数、計算燃焼率、停止インスタンスのストレージコスト、アカウント残高、資金枯渇までの推定滑走路を表示します。APIスナップショットのキャッシュを使用してレンダーパス外で動作し、プロンプトの操作を高速に保ちます。 |
| <a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="./catalog/images/felipeelias-claude-statusline.webp" width="200"></a> | [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) | MIT | モジュールベースの設定、OSC 8 ハイパーリンク、テーマプリセット（`catppuccin`、`tokyo-night`、`gruvbox-rainbow` など）を備えた Go バイナリ製 Claude Code statusline。 |
| — | [**claude-usage-statusline**](https://github.com/ffontenit/claude-usage-statusline) | MIT | APIトークンやネットワーク呼び出し不要で、Claude Codeの実際の/usage制限（5時間・7日間ウィンドウ）の使用率をステータスラインに直接表示し、コンテキストウィンドウ使用量と現在のモデル情報も確認できます。 |
| — | [**co2-claude**](https://github.com/fmondora/co2-claude) | unknown `(ref)` | 各AIツール呼び出しの環境フットプリントを追跡するClaude Codeフックで、CO2排出量・水消費量・エネルギー使用量をステータスバーにリアルタイム表示します。curlスクリプトでインストールし、Claude CodeのPostToolUseフックとステータスラインフックを自動設定します。 |
| <a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="./catalog/images/fredrikaverpil-claudeline.png" width="200"></a> | [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) | MIT | Claude Code プラグインとして配布されるミニマリスト Go 製 Claude Code statusline。プラグインの `/claudeline:setup` スラッシュコマンドがバイナリをダウンロードして settings.json にパッチを当てます。 |
| <a href="https://github.com/Fyko/claudehud"><img alt="claudehud comfortable layout with model, tokens, rate limits" src="./catalog/images/fyko-claudehud.png" width="200"></a> | [**claudehud**](https://github.com/Fyko/claudehud) | MIT | mmap+seqlockを使ったGitデーモン（bashより約168倍高速）を備えたRust製ステータスライン — モデル、トークン使用量、レート制限、コスト、アクティブインシデントを2レイアウトで表示。 |
| <a href="https://github.com/GerardoFC8/claude-subagent-statusline"><img alt="claude-subagent-statusline repository preview" src="./catalog/images/gerardofc8-claude-subagent-statusline.png" width="200"></a> | [**claude-subagent-statusline**](https://github.com/GerardoFC8/claude-subagent-statusline) | MIT | サブエージェントのデリゲーション追跡に特化したClaude Codeステータスライン。実行中・完了・失敗のタスクカウンターをモデル、コスト、コンテキストウィンドウ、経過時間、5時間/7日レート制限とともに表示する。 |
| <a href="https://github.com/GregoryHo/cc-pulseline"><img alt="cc-pulseline hero" src="./catalog/images/gregoryho-cc-pulseline.png" width="200"></a> | [**cc-pulseline**](https://github.com/GregoryHo/cc-pulseline) | MIT | 高性能なRust製Claude Code多行ステータスライン。インクリメンタルシーク型JSONLパース、ライブコンテキスト、コスト消費レート、ターゲット付きアクティブツール、実行中エージェント、Todoの進捗、セッション別トラッキングを備えた高い可観測性を提供する。 |
| <a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="./catalog/images/hagan-claudia-statusline.png" width="200"></a> | [**claudia-statusline**](https://github.com/hagan/claudia-statusline) | MIT | 永続的な統計追跡、Linux・macOS・Windows 向けビルド済みバイナリ、11 テーマを備えた Rust 製 Claude Code statusline。公式 Claude Code ドキュメントでも参照されています。 |
| <a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="200"></a> | [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) | MIT | Claude Code と Codex 向けの高速ローカルトークン使用量トラッカー。`tu statusline` でコスト/トークンの1行サマリを出力。CLI・TUI・GUI モードも搭載。ccusage より 214 倍高速。 |
| <a href="https://github.com/haunchen/claude-code-statusline"><img alt="claude-code-statusline showing OFF-PEAK indicator with context, cost, and rate limits" src="./catalog/images/haunchen-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/haunchen/claude-code-statusline) | MIT | クロスプラットフォーム対応のClaude Codeステータスライン。Anthropicのピーク・オフピークレート制限ウィンドウ、コンテキスト使用量、セッションコスト、5時間・7日間レート制限を表示し、セッション計画を支援する。 |
| <a href="https://github.com/hstojanovic/claude-vibeline"><img alt="claude-vibeline repo preview" src="./catalog/images/hstojanovic-claude-vibeline.png" width="200"></a> | [**claude-vibeline**](https://github.com/hstojanovic/claude-vibeline) | MIT | AnthropicのOAuth APIから実際のサブスクリプション使用データを取得するPythonステータスライン — モデル別Opus/Sonnet制限、追加使用量、プロンプトキャッシュTTL、セッション/週次レート制限を表示。 |
| <a href="https://github.com/ilia-pluzhnikov/claude-code-statusline"><img alt="ilia-pluzhnikov claude-code-statusline GitHub preview" src="./catalog/images/ilia-pluzhnikov-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/ilia-pluzhnikov/claude-code-statusline) | MIT | モデル、アクティブタスク、Gitブランチ状態、コンテキストウィンドウ使用量、プロンプトキャッシュヒット率、5時間/7日レート制限、ピーク時間インジケーターをカラーコードで表示する高機能な単一ファイルNode.jsステータスライン。 |
| — | [**claude-code-context-meter**](https://github.com/IntertechInc/claude-code-context-meter) | unknown `(ref)` | Claude Code用のBashステータスラインスクリプトで、コンテキストウィンドウの充填率、ターンごとのトークンデルタ、直近の成長スパークライン、およびアシスタントメッセージごとの5時間・7日間レートリミット使用状況を表示します。 |
| <a href="https://github.com/kamranahmedse/claude-statusline"><img alt="claude-statusline showing model, context bar, git branch, rate limits" src="./catalog/images/kamranahmedse-claude-statusline.png" width="200"></a> | [**claude-statusline (Kamran Ahmed)**](https://github.com/kamranahmedse/claude-statusline) | MIT | モデル・コンテキスト使用率・カレントディレクトリ・git ブランチ・セッションタイマー・エフォートレベル、および Anthropic API から取得したリアルタイムのレート制限バーを表示するミニマルな Claude Code statusline。 |
| — | [**Islamic Statuses for Claude Code**](https://github.com/kenanbalija/claude-islamic-statuses) | MIT | Claude Codeの動作中にスピナーを表示し、サヒーフ・アル=ブハーリーとサヒーフ・ムスリムからの本物のハディースをローテーション表示するアニメーション付きステータスラインです。初期セットアップ後は完全オフラインで動作し、表示モードをカスタマイズできます。 |
| <a href="https://github.com/kiheon0709/claude-codex-statusline"><img alt="claude-codex-statusline showing dual usage bars for Claude and Codex" src="./catalog/images/kiheon0709-claude-codex-statusline.png" width="200"></a> | [**claude-codex-statusline**](https://github.com/kiheon0709/claude-codex-statusline) | MIT | Claude CodeとCodex CLIのクォータを並べて表示するデュアルバーステータスライン。5時間・週次レート制限バー、コンテキストウィンドウ、PreToolUse/PostToolUseフックで追跡するアクティブサブエージェント数をリアルタイムに表示する。 |
| <a href="https://github.com/laveez/ccsl"><img alt="ccsl animated statusline demo" src="./catalog/images/laveez-ccsl.gif" width="200"></a> | [**ccsl**](https://github.com/laveez/ccsl) | MIT | モデル、コスト、コンテキスト使用量、Git状態、PRリンク、アクティブツール、サブエージェント、タスク進捗、オプションのAPIレート制限バーを表示する高密度カラーコードANSIステータスライン。 |
| <a href="https://github.com/leeguooooo/claude-code-usage-bar"><img alt="claude-statusbar live demo" src="./catalog/images/leeguooooo-claude-code-usage-bar.gif" width="200"></a> | [**claude-code-usage-bar**](https://github.com/leeguooooo/claude-code-usage-bar) | MIT | トークン使用量、コスト、レート制限ウィンドウを3スタイル・9テーマで描画するPythonステータスライン(cs) — バックグラウンドデーモンが動作し、スラッシュコマンドで設定可能。 |
| <a href="https://github.com/Lightning7329/cc-statusline"><img alt="cc-statusline example output" src="./catalog/images/lightning7329-cc-statusline.png" width="200"></a> | [**cc-statusline**](https://github.com/Lightning7329/cc-statusline) | MIT | カタログ唯一のF#ステータスライン — コンテキストウィンドウ、モデル、セッションコスト、レート制限ウィンドウをカラーコード付きブライユ点字プログレスバーで表示。 |
| <a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="./catalog/images/lucasilverentand-claudeline.svg" width="200"></a> | [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) | MIT | npm パッケージ `claudeline` として配布され、組み込みテーマと `--install` フラグによる settings.json への自動インストールに対応した Claude Code statusline。 |
| — | [**Dumbometer**](https://github.com/MaximoCorrea1/dumbometer) | MIT | Claude Codeのステータスラインゲージで、コンテキストウィンドウの充填レベルを追跡し、セッションの品質が劣化し始めると色分けされた「賢い→バカ」スケールで警告を表示します。依存関係ゼロで、トークンコストなしにNode.jsで動作します。 |
| — | [**OpenDoor StatusLine**](https://github.com/MengFanLu1/opendoor-statusline) | MIT | OpenDoor向けのClaude Codeステータスバーツールで、残高やAPI使用量をリアルタイムで表示するほか、モデル名・Gitブランチ・コンテキストウィンドウの使用状況も確認できます。Rustで書かれ、npm経由でクロスプラットフォームバイナリとして配布されます。 |
| <a href="https://github.com/meros/claude-usage-statusline"><img alt="claude-usage-statusline dashboard with sparklines and ETA" src="./catalog/images/meros-claude-usage-statusline.png" width="200"></a> | [**claude-usage-statusline**](https://github.com/meros/claude-usage-statusline) | MIT | Claude APIに5時間・7日間ウィンドウの使用量をポーリングし、2階層の履歴をローカルに保存。スパークラインとカラーコード付きプログレスバーをレンダリングし、スマートな日付/期間フォーマットでレート制限までのETAを予測する。 |
| <a href="https://github.com/mtschoen/schoen-claude-status"><img alt="schoen-claude-status showing cache hit rate and rate-limit pace projection" src="./catalog/images/mtschoen-schoen-claude-status.svg" width="200"></a> | [**schoen-claude-status**](https://github.com/mtschoen/schoen-claude-status) | MIT | セッション全体のキャッシュヒット率、コンテキスト使用量、5時間/週次レート制限ペース予測とコストを追跡する2行ステータスライン — bash + Python単一ファイル構成。 |
| — | [**sysmon**](https://github.com/Navifra-Sally/sysmon-plugin) | MIT | CPU負荷・メモリ・ディスク・ネットワークの状態をステータスバーにリアルタイム表示し、/sysmonコマンドで読み取り専用の完全なシステム診断（ルーティング、DNS、ディスク使用量、プロセス、リスナー）を実行してClaudeが問題と対処法を要約するClaude Codeプラグイン。 |
| <a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="./catalog/images/ndave92-claude-code-status-line.png" width="200"></a> | [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) | MIT | ワークスペース情報・git ステータス・モデル名・コンテキスト使用量・worktree ヒント・クォータタイマー・オプションの API コストを表示する Rust 製 Claude Code statusline。 |
| <a href="https://github.com/noahbclarkson/noahs-claude-statusline"><img alt="noahs-claude-statusline GitHub preview" src="./catalog/images/noahbclarkson-noahs-claude-statusline.png" width="200"></a> | [**noahs-claude-statusline**](https://github.com/noahbclarkson/noahs-claude-statusline) | null `(ref)` | Windows MSYS2向けbashステータスライン。PowerShell AttachConsoleのプロセスツリー探索でターミナル幅を検出し、1/8セル精度の分数プログレスバーをレンダリングする。 |
| <a href="https://github.com/O0000-code/cc-tempo"><img alt="cc-tempo statusline screenshot" src="./catalog/images/o0000-cc-tempo.png" width="200"></a> | [**cc-tempo**](https://github.com/O0000-code/cc-tempo) | MIT | トランスクリプトから実際の作業時間を計測し、サブエージェントの並列高速化比率を表示、トークンやコストではなくスパークラインでコードチャーン速度を追跡するClaude Codeステータスライン。 |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。 |
| <a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="./catalog/images/owloops-claude-powerline.svg" width="200"></a> | [**claude-powerline**](https://github.com/Owloops/claude-powerline) | MIT | リアルタイム使用量追跡・git 連携・テーマプリセットを備えた Vim スタイルの powerline Claude Code statusline。 |
| — | [**foxtail**](https://github.com/padenot/foxtail) | Apache-2.0 | Mozilla/Firefoxの開発者向けのClaude Codeステータスラインツールで、モデル、作業ディレクトリ、時刻、コンテキスト使用量、gitステータス、セッション統計、コスト、キャッシュ情報を整形出力します。RustとTOML設定で実装され、Claude CodeのstatusLineコマンドフックと統合されます。 |
| <a href="https://github.com/pcvelz/ccstatusline-usage"><img alt="ccstatusline-usage showing session and weekly API usage bars alongside model and git widgets" src="./catalog/images/pcvelz-ccstatusline-usage.png" width="200"></a> | [**ccstatusline-usage**](https://github.com/pcvelz/ccstatusline-usage) | MIT | ccstatusline のフォーク。Anthropic API からセッション・週次利用率バー、週次ペースインジケーター、リセットカウントダウン、ローカルモデル向けマルチプロバイダールーティングをリアルタイムで表示する使用量ウィジェットを追加。 |
| <a href="https://github.com/Postmodum37/simple-claude-code-statusline"><img alt="simple-claude-code-statusline two-line preview" src="./catalog/images/postmodum37-simple-claude-code-statusline.png" width="200"></a> | [**simple-claude-code-statusline**](https://github.com/Postmodum37/simple-claude-code-statusline) | MIT | Go製のシンプルで改造しやすい2行Claude Codeステータスライン。1行目はモデル・ディレクトリ・ファイル数付きGitブランチ・ワークツリー・変更行数、2行目はコンテキストバー・5時間/7日レート制限・コスト・経過時間を表示する。 |
| <a href="https://github.com/puddinging/prism-hud"><img alt="prism-hud gradient statusline preview" src="./catalog/images/puddinging-prism-hud.png" width="200"></a> | [**prism-hud**](https://github.com/puddinging/prism-hud) | MIT | jarrodwatts/claude-hudのフォークで、プログレスバーを位置ごとのグラデーションパレットに置き換え — 各ドットは緑（安全）から黄、赤（危険）まで固定色で、コンテキストとレート制限ウィンドウの充填レベルを一目で確認できる。 |
| <a href="https://github.com/RaiconY/claude-code-statusline"><img alt="claude-code-statusline repo preview" src="./catalog/images/raicony-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (RaiconY)**](https://github.com/RaiconY/claude-code-statusline) | MIT | 依存関係なしの単一ファイルNode.jsステータスライン — モデル、アクティブタスク、Git状態、コンテキスト使用量、TTL付きプロンプトキャッシュ状態、Anthropicの5時間/7日レート制限カウントダウンを表示。 |
| — | [**Token Horse**](https://github.com/ratelworks/token-horse) | MIT | Claude CodeまたはCodex CLIセッションのトークン消費速度に応じて速く駆けるターミナル用ピクセル馬ペットで、セッションのJSONLトランスクリプトを読み取ってリアルタイムのトークンスループットを計測し、ステータスラインコマンドとして組み込めます。 |
| <a href="https://github.com/RiverOfLogic/claude-code-statusline"><img alt="RiverOfLogic Powerline statusline showing model, git, context bar with warm retro colors" src="./catalog/images/riveroflogic-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (RiverOfLogic)**](https://github.com/RiverOfLogic/claude-code-statusline) | Unspecified `(ref)` | Powerline-style retro-terminal statusline for Claude Code, displaying model, git branch, output style, thinking mode, and a 10-cell context progress bar with warm earth-tone color thresholds and a live clock. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="200"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go 製マルチプロバイダー AI 使用量モニター（Claude、Codex、Gemini、Copilot、Antigravity）。waybar モジュール、Chrome 拡張機能、Bubble Tea TUI、Admin API ダッシュボード、コンパクトな Claude Code ステータスラインにわたってレート制限・コスト・ピーク時間帯の分析を提供します。 |
| — | [**Claude Prompt Meter**](https://github.com/ryukenshin546-a11y/claude-prompt-meter) | MIT | ローカルログを読み取ってClaude Codeセッションのプロンプトごとのトークン使用量とUSDコストを追跡するVS Code拡張機能で、タイ語または英語で支出ヒートマップと設定可能な日次予算アラートを含むライブステータスバーメーターを表示します。 |
| <a href="https://github.com/rz1989s/claude-code-statusline"><img alt="claude-code-statusline Catppuccin Mocha theme screenshot" src="./catalog/images/rz1989s-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (rz1989s)**](https://github.com/rz1989s/claude-code-statusline) | MIT | Claude Code 向け Bash 製 statusline。最大 9 行に渡る 28 のアトミックコンポーネントで git 情報・コスト追跡・MCP ヘルス・ブロックリセットタイマー・イスラム礼拝時間・Catppuccin テーマを表示。 |
| <a href="https://github.com/Shallow-dusty/horologium"><img alt="horologium repo card" src="./catalog/images/shallow-dusty-horologium.png" width="200"></a> | [**horologium**](https://github.com/Shallow-dusty/horologium) | MIT | サブミリ秒のClaude Codeステータスラインとccusage形式のJSONLログ解析を統合したRustバイナリ。トークン、コスト、Git、5時間/7日レート制限の表示と、日次・セッション・ブロック使用レポート生成を一つのツールで実現する。 |
| — | [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) | MIT | Powerlineサポート、複数テーマ、リアルタイムのトークン/セッションメトリクス表示、インタラクティブなTUI設定インターフェースを備えた、Claude Code CLI向けの高度にカスタマイズ可能なステータスライン フォーマッター。 |
| — | [**ClaudeCodeStatusBar**](https://github.com/SleighMaster99/ClaudeCodeStatusBar) | MIT | Windows専用のWinForms GUIエディタ。Claude Codeの複数行ステータスラインをドラッグ＆ドロップで構築でき、PowerShellランタイム、使用量トラッキング、Git・コンテキスト・コストウィジェットを備える。 |
| — | [**claude-statusline**](https://github.com/snackdriven/claude-statusline) | unknown `(ref)` | Claude Code向けのマルチリージョン・ステータスライン・コンポーザーで、プロデューサースクリプトを並列実行し、TTLベースのリージョンキャッシュを管理し、優先度でソートしてターミナル幅内に色付きの行をレンダリングします。コンシエンス・ルールヒントシステムと、コンテキストウィンドウ使用状況やアクティブチケット、外部サービスとのオプション統合も備えています。 |
| <a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="./catalog/images/sotayamashita-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) | MIT | starship ライクな設定とモジュールベースの構成に対応した Rust 製 Claude Code statusline。 |
| — | [**claude-duck**](https://github.com/soulagent/claude-duck) | MIT | Claude Codeのステータスラインで3行の池をアニメーション表示する水泳ASCIIアヒるを提供し、モデル名・セッション/週次使用量・コンテキスト・コスト・Gitブランチを虹色のバーで表示します。依存関係のないNode.jsスクリプトで、Claude Codeプラグインとしてインストールできます。 |
| — | [**ClaudeCodeStatusBar**](https://github.com/squanchymnonm/ClaudeCodeStatusBar) | MIT | コンテキストウィンドウの使用状況、トークン数、セッション/週間レート制限をカラーコードアラート付きでリアルタイム表示するステータスラインを追加するClaude Codeプラグイン。実行中のサブエージェントとそのトークン消費速度を表示するライブサブエージェントパネルも含む。 |
| — | [**XClaudeUsage**](https://github.com/SrDarf/XClaudeUsage) | MIT | Claude Codeのステータスライン用フックで、セッションごとのトークン使用量と5時間クォータをリアルタイムで追跡し、SQLiteを通じて並行ローカルセッションを集計、オプションでTursoクラウドを使ったデバイス間同期にも対応する。 |
| <a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="context-statusline showing token + cache breakdown" src="./catalog/images/thisdot-context-statusline.svg" width="200"></a> | [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) | MIT | セッション JSONL トランスクリプトを解析して入力・キャッシュ作成・キャッシュ読み取りトークンを集計し、正確なコンテキストウィンドウを表示する Claude Code statusline。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。 |
| — | [**FitPet**](https://github.com/victory-c/fitpet) | MIT | Garminのフィットネスデータによってバイタリティが決まり、テスト成功やエラーなどのコーディングフックイベントに反応するバーチャルペットをステータスラインに表示するClaude Codeコンパニオン。ペットはGarmin MCPスキル経由で同期されたバイタリティ段階を通じて進化し、すべての反応はモデル呼び出しなしにローカルで処理される。 |
| — | [**codexbar-hub**](https://github.com/xicv/codexbar-hub) | MIT | claude-hudセグメント、caffeinateインジケーター、CodexBarから取得したCodex/Claude使用量ペースバーをレンダリングするClaude Code用ステータスラインツール。ターミナルのステータスラインでAI使用量メトリクスとシステム状態をリアルタイムに表示するために設計されています。 |
| <a href="https://github.com/xuedi/claude-statusline"><img alt="xuedi/claude-statusline repo preview" src="./catalog/images/xuedi-claude-statusline.png" width="200"></a> | [**xuedi/claude-statusline**](https://github.com/xuedi/claude-statusline) | EUPL-1.2 `(ref)` | Rust-native Claude Code statusline rendering model, git, tokens, effort, and 5h/7d rate limits via a 20-cell braille progress bar in ~500 lines of safe, unsafe-forbidden code. |
| <a href="https://github.com/xyzcardiff/claude-code-statusline"><img alt="xyzcardiff claude-code-statusline repository preview" src="./catalog/images/xyzcardiff-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/xyzcardiff/claude-code-statusline) | MIT | ~/.claude/jobsからサブエージェント数とバックグラウンドタスクのプログレスバーをリアルタイム表示する2行のシェルステータスライン — エージェントやタスクがアクティブな時のみ2行目を表示。 |
| — | [**claude-token-monitor**](https://github.com/young1lin/claude-token-monitor) | MIT | Goで書かれたClaude Codeのステータスラインプラグインで、コンテキストトークンの使用状況、Anthropic Pro/Teamの5時間・7日間クォータカウントダウン、Z.ai/GLMコーディングプランのクォータをリアルタイム表示し、gitブランチや思考モード表示にも対応したシングルバイナリ。 |
| — | [**bmad-statusline**](https://github.com/zRawday/bmad-statusline) | MIT | Claude Codeのライフサイクルフックを通じてアクティブなスキル、ストーリーの進捗、ステップの状態を自動検出し、BMADワークフローのアクティビティをClaude Codeでパッシブに追跡するccstatuslineウィジェットパックです。11個のカスタマイズ可能なウィジェットと134種類のワークフローをサポートするインタラクティブなTUIコンフィギュレーターを含みます。 |
| — | [**claude-statusline**](https://github.com/zyx1121/claude-statusline) | MIT | Claude Code 向けのモジュール式ステータスラインプラグインで、モデル・コンテキスト・コスト・レート制限・git・再生中の曲・株価などの自己完結型ウィジェットをフェデレーテッドマーケットプレイス経由で設定可能なプロファイルに組み合わせられる。 |

### OpenCode

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| <a href="https://github.com/Ainsley0917/opencode-token-monitor"><img alt="opencode-token-monitor repo preview" src="./catalog/images/ainsley-opencode-token-monitor.png" width="200"></a> | [**opencode-token-monitor**](https://github.com/Ainsley0917/opencode-token-monitor) | MIT | OpenCode プラグイン（statusline ではない）で、`token_stats` / `token_history` / `token_export` ツールを登録し、入力・出力・推論・キャッシュのトークン内訳をトースト通知で表示します。 |
| — | [**ocstatusline**](https://github.com/amirlehmam/ocstatusline) | MIT | OpenCodeのイベントストリームを購読してモデル、プロバイダー、トークン使用量、コスト、コンテキストウィンドウの割合、セッションタイマー、git状態をターミナルに表示する、スタンドアロンプロセスとして動作するOpenCode向けの高度にカスタマイズ可能なライブステータスラインです。ccstatuslineのOpenCode版であり、Inkで構築されたインタラクティブな設定TUIとPowerlineセパレータのサポートを備えています。 |
| <a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="./catalog/images/joaquinvesapa-sub-agent-statusline.webp" width="200"></a> | [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) | MIT | サブエージェントのアクティビティ・経過時間・トークン／コンテキスト使用量を表示する OpenCode TUI サイドバープラグイン（statusLine.command ではない）。 |
| <a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="./catalog/images/markwilkening-opencode-status-line.png" width="200"></a> | [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) | MIT | OpenCode CLI 向けの軽量・高速な statusline。 |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。 |
| <a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="./catalog/images/opencode-quota.webp" width="200"></a> | [**opencode-quota**](https://github.com/slkiser/opencode-quota) | MIT | コンテキストウィンドウを汚染しない OpenCode のクォータおよびトークン使用量表示ツール。OpenCode Go・Cursor・GitHub Copilot などのプロバイダーをサポートします。 |
| <a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="./catalog/images/ramtinj95-opencode-tokenscope.png" width="200"></a> | [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) | MIT | セッションのトークン使用量とコストを詳細な内訳とともに分析する OpenCode プラグイン（statusline ではない）。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。 |

### Gemini CLI

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| — | [**claude-statusline**](https://github.com/callmemorgan/claude-statusline) | MIT | Claude Code、Antigravity CLI、Pi向けの高速でテーマ対応のターミナルステータスラインレンダラーで、コスト追跡、コンテキストウィンドウ使用量、レート制限の予測、git情報などのセッションメトリクスをコンパクトな色分け形式で表示します。 |
| <a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="./catalog/images/kiriketsuki-gemini-statusline.png" width="200"></a> | [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) | Unspecified `(ref)` | モデル・ワークスペースコンテキスト・git ブランチ・GitHub Issue 件数・受信トレイ件数を表示する Gemini CLI 向け 2 行シェルプロンプトヘルパー。Gemini CLI にはネイティブ statusLine フックがないため、ユーザーのシェルプロンプトから実行します。 |
| — | [**OpenDoor StatusLine**](https://github.com/MengFanLu1/opendoor-statusline) | MIT | OpenDoor向けのClaude Codeステータスバーツールで、残高やAPI使用量をリアルタイムで表示するほか、モデル名・Gitブランチ・コンテキストウィンドウの使用状況も確認できます。Rustで書かれ、npm経由でクロスプラットフォームバイナリとして配布されます。 |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。 |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="200"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go 製マルチプロバイダー AI 使用量モニター（Claude、Codex、Gemini、Copilot、Antigravity）。waybar モジュール、Chrome 拡張機能、Bubble Tea TUI、Admin API ダッシュボード、コンパクトな Claude Code ステータスラインにわたってレート制限・コスト・ピーク時間帯の分析を提供します。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。 |
| — | [**codexbar-hub**](https://github.com/xicv/codexbar-hub) | MIT | claude-hudセグメント、caffeinateインジケーター、CodexBarから取得したCodex/Claude使用量ペースバーをレンダリングするClaude Code用ステータスラインツール。ターミナルのステータスラインでAI使用量メトリクスとシステム状態をリアルタイムに表示するために設計されています。 |

### Codex CLI

| プレビュー | 名称 | ライセンス | 説明 |
|---|---|---|---|
| <a href="https://github.com/0xHanniba1/cc-codex-statusline"><img alt="cc-codex-statusline preview" src="./catalog/images/0xhanniba1-cc-codex-statusline.png" width="200"></a> | [**cc-codex-statusline**](https://github.com/0xHanniba1/cc-codex-statusline) | MIT | Claude CodeとCodexのステータスラインを1つのリポジトリにまとめ、それぞれワンライナーcurlインストーラを提供。両CLIにパス表示、モデル表示、カラーコード付きレート制限カウントダウンを追加する。 |
| <a href="https://github.com/ai-ken-git/cat-codex-statusline"><img alt="cat-codex-statusline terminal preview showing model, git branch, and context segments" src="./catalog/images/ai-ken-git-cat-codex-statusline.png" width="200"></a> | [**cat-codex-statusline (ai-ken-git)**](https://github.com/ai-ken-git/cat-codex-statusline) | MIT | 猫テーマの Codex CLI ステータスライン インストーラー。ビルトインセグメント（モデル、gitブランチ、コンテキスト、制限）をクリーンなプリセットに配線し、Codex がコマンドベースのステータスラインフックを提供した時点で猫顔レンダラーが自動的に有効になります。 |
| — | [**claude-statusline**](https://github.com/callmemorgan/claude-statusline) | MIT | Claude Code、Antigravity CLI、Pi向けの高速でテーマ対応のターミナルステータスラインレンダラーで、コスト追跡、コンテキストウィンドウ使用量、レート制限の予測、git情報などのセッションメトリクスをコンパクトな色分け形式で表示します。 |
| <a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="./catalog/images/capedbitmap-codex-hud.png" width="200"></a> | [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) | PolyForm-Noncommercial-1.0.0 `(ref)` | ローカルの Codex セッションデータを取り込み、週次リセットのタイミングと残余容量に基づいて次に使用するアカウントを推薦する macOS メニューバーアプリ。 |
| <a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="200"></a> | [**ccusage**](https://github.com/ryoppippi/ccusage) | MIT | ローカルの Claude Code および Codex セッション JSONL ファイルを解析するトークン使用量・コスト分析ツール。statusline 自体ではないが、statusline 構築に有用なデータソースとして活用できます。 |
| <a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="./catalog/images/fwyc-codex-hud.png" width="200"></a> | [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) | MIT | セッション／コンテキスト使用量・git ステータス・ツールアクティビティ監視を備えた OpenAI Codex CLI 向けリアルタイム tmux statusline HUD。`--kill` / `--list` / `--attach` / `--self-check` サブコマンドも含みます。 |
| <a href="https://github.com/GordonBeeming/codex-statusline"><img alt="codex-statusline (GordonBeeming) OpenGraph card" src="./catalog/images/gordonbeeming-codex-statusline.png" width="200"></a> | [**codex-statusline (GordonBeeming)**](https://github.com/GordonBeeming/codex-statusline) | Unspecified `(ref)` | Four-line Codex statusline showing repo name, git branch, model, session cost in AUD, 5-hour rate-limit bar, and context window usage — mirroring the author's claude-statusline layout. |
| <a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="200"></a> | [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) | MIT | Claude Code と Codex 向けの高速ローカルトークン使用量トラッカー。`tu statusline` でコスト/トークンの1行サマリを出力。CLI・TUI・GUI モードも搭載。ccusage より 214 倍高速。 |
| <a href="https://github.com/kiheon0709/claude-codex-statusline"><img alt="claude-codex-statusline showing dual usage bars for Claude and Codex" src="./catalog/images/kiheon0709-claude-codex-statusline.png" width="200"></a> | [**claude-codex-statusline**](https://github.com/kiheon0709/claude-codex-statusline) | MIT | Claude CodeとCodex CLIのクォータを並べて表示するデュアルバーステータスライン。5時間・週次レート制限バー、コンテキストウィンドウ、PreToolUse/PostToolUseフックで追跡するアクティブサブエージェント数をリアルタイムに表示する。 |
| — | [**OpenDoor StatusLine**](https://github.com/MengFanLu1/opendoor-statusline) | MIT | OpenDoor向けのClaude Codeステータスバーツールで、残高やAPI使用量をリアルタイムで表示するほか、モデル名・Gitブランチ・コンテキストウィンドウの使用状況も確認できます。Rustで書かれ、npm経由でクロスプラットフォームバイナリとして配布されます。 |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。 |
| <a href="https://github.com/rgomes87/codex-statusline"><img alt="codex-statusline 4-line tmux preview" src="./catalog/images/rgomes87-codex-statusline.svg" width="200"></a> | [**codex-statusline (rgomes87)**](https://github.com/rgomes87/codex-statusline) | Unspecified `(ref)` | Colourful 4-line tmux status area for Codex CLI showing context window, model, git branch, and 5-hour/7-day rate-limit pacing bars with per-second reset countdowns. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="200"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go 製マルチプロバイダー AI 使用量モニター（Claude、Codex、Gemini、Copilot、Antigravity）。waybar モジュール、Chrome 拡張機能、Bubble Tea TUI、Admin API ダッシュボード、コンパクトな Claude Code ステータスラインにわたってレート制限・コスト・ピーク時間帯の分析を提供します。 |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。 |
| — | [**codexbar-hub**](https://github.com/xicv/codexbar-hub) | MIT | claude-hudセグメント、caffeinateインジケーター、CodexBarから取得したCodex/Claude使用量ペースバーをレンダリングするClaude Code用ステータスラインツール。ターミナルのステータスラインでAI使用量メトリクスとシステム状態をリアルタイムに表示するために設計されています。 |

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

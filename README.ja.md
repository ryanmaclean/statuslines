# statuslines

**言語：** [English](./README.md) · [Français](./README.fr.md) · 日本語

> Claude Code、OpenCode、Gemini CLI、Codex CLI 向けに整理した statusline
> カタログと、Datadog に接続したリポジトリ内リファレンス・フレーバー
> （`pup/`）。

*ひとつのパターン、四つのエージェント CLI、数十の statusline。*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-67-orange)
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

#### [**claude-fitness-break**](https://github.com/adam-ismael/claude-fitness-break) · MIT

<a href="https://github.com/adam-ismael/claude-fitness-break"><img alt="adam-ismael/claude-fitness-break repository preview" src="./catalog/images/adam-ismael-claude-fitness-break.png" width="800"></a>

Claudeがエージェントを生成するたびに発火するフックプラグイン。ランダムなエクササイズを選び、鬼教官・80年代コーチ・90年代レスラー・神経質な医師の4つの個性のいずれかでclaude-haikuを通じて叫びかける。5分のクールダウン付きでステータスラインに表示する。

#### [**claude-code-statusline**](https://github.com/AnirudhMKumar/claude-code-statusline) · MIT

<a href="https://github.com/AnirudhMKumar/claude-code-statusline"><img alt="anirudhmkumar-claude-code-statusline preview" src="./catalog/images/anirudhmkumar-claude-code-statusline.png" width="800"></a>

ディレクトリ、Gitブランチ、アクティブモデル、コンテキスト使用量を表示するWindows向けPowerShellステータスライン — 外部依存なしでirm/iexコマンド1行でインストール可能。

#### [**claude-code-statusline**](https://github.com/AsafSaar/claude-code-statusline) · MIT

<a href="https://github.com/AsafSaar/claude-code-statusline"><img alt="claude-code-statusline segment preview" src="./catalog/images/asafsaar-claude-code-statusline.png" width="800"></a>

トグル可能なセグメント（cwd、Gitブランチ、dirty、ahead/behind、モデル、node、コンテキスト、コスト、時間、行数、最終コミット、スタッシュ、エフォート、レート制限、tsエラー）をセグメントごとのアイコンとカラー閾値で組み合わせた完全設定可能なステータスライン。

#### [**Awesome Statusline (CC-statusline)**](https://github.com/AwesomeJun/CC-statusline) · MIT `(ref)`

<a href="https://github.com/AwesomeJun/CC-statusline"><img alt="Awesome Statusline five size presets with reasoning-effort and thinking indicators" src="./catalog/images/awesomejun-cc-statusline.webp" width="800"></a>

macOS/Linux では Bash、Windows ではネイティブ PowerShell で動作するクロスプラットフォームな Claude Code statusline。コンテキスト、5時間/7日の利用制限、コスト、reasoning effort・拡張思考インジケーターを表示し、5段階のサイズプリセットと Catppuccin テーマを備える。Node も Nerd Font も不要。

#### [**cc-statusline**](https://github.com/brandonchartier/cc-statusline) · MIT

<a href="https://github.com/brandonchartier/cc-statusline"><img alt="cc-statusline showing model, git, tokens, effort, and rate limits" src="./catalog/images/brandonchartier-cc-statusline.png" width="800"></a>

モデル、Gitブランチ、トークン使用率、推論エフォートレベル、5時間/7日レート制限ウィンドウ、ローカル時刻を表示するミニマルなPythonステータスライン — APIコールもOAuthも不要。

#### [**claude-code-status-bar**](https://github.com/briansmith80/claude-code-status-bar) · MIT

<a href="https://github.com/briansmith80/claude-code-status-bar"><img alt="claude-code-status-bar OpenGraph card" src="./catalog/images/briansmith80-claude-code-status-bar.png" width="800"></a>

18セグメント・7カラーテーマ対応のピュアbashステータスライン。コンテキストバー、5時間・週次レート制限のペーシング、Git状態、セッションコスト、ライブツールアクティビティを依存関係ゼロで提供する。

#### [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) · MIT

<a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="./catalog/images/ccometixline.png" width="800"></a>

インタラクティブな TUI 設定ツール、git 連携、使用量追跡を備えた Rust 製の高速 Claude Code statusline。

#### [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) · MIT

<a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="./catalog/images/ccstatusline.svg" width="800"></a>

インタラクティブな TUI 設定ツール、powerline レンダリング、テーマ、トークン・git・セッションタイマー・クリッカブルリンクのウィジェットを備えたカスタマイズ可能な Claude Code statusline。

#### [**claude-buddy**](https://github.com/chae-dahee/claude-buddy) · MIT

<a href="https://github.com/chae-dahee/claude-buddy"><img alt="chae-dahee/claude-buddy repo preview" src="./catalog/images/chae-dahee-claude-buddy.png" width="800"></a>

Claude Codeステータスラインに住むアニメーションASCIIコンパニオン。18種・5レアリティのガチャテーブルからロールされ、DEBUGGINGやSNARKなどのステータスを持ち、7日ごとにレベルアップする。

#### [**claude-hud**](https://github.com/jarrodwatts/claude-hud) · MIT

<a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="./catalog/images/claude-hud.png" width="800"></a>

コンテキスト使用量・アクティブツール・実行中サブエージェント・Todo 進捗・レート制限ウィンドウをネイティブ statusline API で表示する Claude Code プラグイン／statusline。

#### [**claude-code-statusline (ctfbio)**](https://github.com/ctfbio/claude-code-statusline) · MIT

<a href="https://github.com/ctfbio/claude-code-statusline"><img alt="claude-code-statusline (ctfbio) OpenGraph card" src="./catalog/images/ctfbio-claude-code-statusline.png" width="800"></a>

セッション時間、ECBレートによる多通貨コスト表示、MTok単価、支出上限、エフォートレベルを表示するシェルステータスライン — 24時間キャッシュにより実行時のネットワーク呼び出しはゼロ。

#### [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) · MIT

<a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="./catalog/images/daniel3303-claude-statusline.png" width="800"></a>

モデル・トークン・レート制限・git ステータスを表示する Bash + PowerShell 製の Claude Code statusline。

#### [**Claude Code Statusline**](https://github.com/danielmackay/claude-code-statusline) · Unspecified `(ref)`

<a href="https://github.com/danielmackay/claude-code-statusline"><img alt="danielmackay-claude-code-statusline GitHub preview" src="./catalog/images/danielmackay-claude-code-statusline.png" width="800"></a>

Claude Code 向けシェルスクリプト製ステータスライン。アクティブモデル、コンテキスト使用量、セッションコスト、リセット時刻付き5時間レート制限バー、Gitブランチ、差分統計を表示する。

#### [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) · MIT

<a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="./catalog/images/dwillitzer-claude-statusline.png" width="800"></a>

オプションの Node.js + tiktoken トークンカウントと、Claude・OpenAI・Gemini・Grok のマルチプロバイダーモデルカラーリングに対応した Bash 製 Claude Code statusline。

#### [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) · MIT

<a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="./catalog/images/felipeelias-claude-statusline.webp" width="800"></a>

モジュールベースの設定、OSC 8 ハイパーリンク、テーマプリセット（`catppuccin`、`tokyo-night`、`gruvbox-rainbow` など）を備えた Go バイナリ製 Claude Code statusline。

#### [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) · MIT

<a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="./catalog/images/fredrikaverpil-claudeline.png" width="800"></a>

Claude Code プラグインとして配布されるミニマリスト Go 製 Claude Code statusline。プラグインの `/claudeline:setup` スラッシュコマンドがバイナリをダウンロードして settings.json にパッチを当てます。

#### [**claudehud**](https://github.com/Fyko/claudehud) · MIT

<a href="https://github.com/Fyko/claudehud"><img alt="claudehud comfortable layout with model, tokens, rate limits" src="./catalog/images/fyko-claudehud.png" width="800"></a>

mmap+seqlockを使ったGitデーモン（bashより約168倍高速）を備えたRust製ステータスライン — モデル、トークン使用量、レート制限、コスト、アクティブインシデントを2レイアウトで表示。

#### [**claude-subagent-statusline**](https://github.com/GerardoFC8/claude-subagent-statusline) · MIT

<a href="https://github.com/GerardoFC8/claude-subagent-statusline"><img alt="claude-subagent-statusline repository preview" src="./catalog/images/gerardofc8-claude-subagent-statusline.png" width="800"></a>

サブエージェントのデリゲーション追跡に特化したClaude Codeステータスライン。実行中・完了・失敗のタスクカウンターをモデル、コスト、コンテキストウィンドウ、経過時間、5時間/7日レート制限とともに表示する。

#### [**cc-pulseline**](https://github.com/GregoryHo/cc-pulseline) · MIT

<a href="https://github.com/GregoryHo/cc-pulseline"><img alt="cc-pulseline hero" src="./catalog/images/gregoryho-cc-pulseline.png" width="800"></a>

高性能なRust製Claude Code多行ステータスライン。インクリメンタルシーク型JSONLパース、ライブコンテキスト、コスト消費レート、ターゲット付きアクティブツール、実行中エージェント、Todoの進捗、セッション別トラッキングを備えた高い可観測性を提供する。

#### [**claudia-statusline**](https://github.com/hagan/claudia-statusline) · MIT

<a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="./catalog/images/hagan-claudia-statusline.png" width="800"></a>

永続的な統計追跡、Linux・macOS・Windows 向けビルド済みバイナリ、11 テーマを備えた Rust 製 Claude Code statusline。公式 Claude Code ドキュメントでも参照されています。

#### [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) · MIT

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="800"></a>

Claude Code と Codex 向けの高速ローカルトークン使用量トラッカー。`tu statusline` でコスト/トークンの1行サマリを出力。CLI・TUI・GUI モードも搭載。ccusage より 214 倍高速。

#### [**claude-code-statusline**](https://github.com/haunchen/claude-code-statusline) · MIT

<a href="https://github.com/haunchen/claude-code-statusline"><img alt="claude-code-statusline showing OFF-PEAK indicator with context, cost, and rate limits" src="./catalog/images/haunchen-claude-code-statusline.png" width="800"></a>

クロスプラットフォーム対応のClaude Codeステータスライン。Anthropicのピーク・オフピークレート制限ウィンドウ、コンテキスト使用量、セッションコスト、5時間・7日間レート制限を表示し、セッション計画を支援する。

#### [**claude-vibeline**](https://github.com/hstojanovic/claude-vibeline) · MIT

<a href="https://github.com/hstojanovic/claude-vibeline"><img alt="claude-vibeline repo preview" src="./catalog/images/hstojanovic-claude-vibeline.png" width="800"></a>

AnthropicのOAuth APIから実際のサブスクリプション使用データを取得するPythonステータスライン — モデル別Opus/Sonnet制限、追加使用量、プロンプトキャッシュTTL、セッション/週次レート制限を表示。

#### [**claude-code-statusline**](https://github.com/ilia-pluzhnikov/claude-code-statusline) · MIT

<a href="https://github.com/ilia-pluzhnikov/claude-code-statusline"><img alt="ilia-pluzhnikov claude-code-statusline GitHub preview" src="./catalog/images/ilia-pluzhnikov-claude-code-statusline.png" width="800"></a>

モデル、アクティブタスク、Gitブランチ状態、コンテキストウィンドウ使用量、プロンプトキャッシュヒット率、5時間/7日レート制限、ピーク時間インジケーターをカラーコードで表示する高機能な単一ファイルNode.jsステータスライン。

#### [**claude-statusline (Kamran Ahmed)**](https://github.com/kamranahmedse/claude-statusline) · MIT

<a href="https://github.com/kamranahmedse/claude-statusline"><img alt="claude-statusline showing model, context bar, git branch, rate limits" src="./catalog/images/kamranahmedse-claude-statusline.png" width="800"></a>

モデル・コンテキスト使用率・カレントディレクトリ・git ブランチ・セッションタイマー・エフォートレベル、および Anthropic API から取得したリアルタイムのレート制限バーを表示するミニマルな Claude Code statusline。

#### [**claude-codex-statusline**](https://github.com/kiheon0709/claude-codex-statusline) · MIT `(ref)`

<a href="https://github.com/kiheon0709/claude-codex-statusline"><img alt="claude-codex-statusline showing dual usage bars for Claude and Codex" src="./catalog/images/kiheon0709-claude-codex-statusline.png" width="800"></a>

Claude CodeとCodex CLIのクォータを並べて表示するデュアルバーステータスライン。5時間・週次レート制限バー、コンテキストウィンドウ、PreToolUse/PostToolUseフックで追跡するアクティブサブエージェント数をリアルタイムに表示する。

#### [**ccsl**](https://github.com/laveez/ccsl) · MIT

<a href="https://github.com/laveez/ccsl"><img alt="ccsl animated statusline demo" src="./catalog/images/laveez-ccsl.gif" width="800"></a>

モデル、コスト、コンテキスト使用量、Git状態、PRリンク、アクティブツール、サブエージェント、タスク進捗、オプションのAPIレート制限バーを表示する高密度カラーコードANSIステータスライン。

#### [**claude-code-usage-bar**](https://github.com/leeguooooo/claude-code-usage-bar) · MIT

<a href="https://github.com/leeguooooo/claude-code-usage-bar"><img alt="claude-statusbar live demo" src="./catalog/images/leeguooooo-claude-code-usage-bar.gif" width="800"></a>

トークン使用量、コスト、レート制限ウィンドウを3スタイル・9テーマで描画するPythonステータスライン(cs) — バックグラウンドデーモンが動作し、スラッシュコマンドで設定可能。

#### [**cc-statusline**](https://github.com/Lightning7329/cc-statusline) · MIT

<a href="https://github.com/Lightning7329/cc-statusline"><img alt="cc-statusline example output" src="./catalog/images/lightning7329-cc-statusline.png" width="800"></a>

カタログ唯一のF#ステータスライン — コンテキストウィンドウ、モデル、セッションコスト、レート制限ウィンドウをカラーコード付きブライユ点字プログレスバーで表示。

#### [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) · MIT

<a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="./catalog/images/lucasilverentand-claudeline.svg" width="800"></a>

npm パッケージ `claudeline` として配布され、組み込みテーマと `--install` フラグによる settings.json への自動インストールに対応した Claude Code statusline。

#### [**claude-usage-statusline**](https://github.com/meros/claude-usage-statusline) · MIT

<a href="https://github.com/meros/claude-usage-statusline"><img alt="claude-usage-statusline dashboard with sparklines and ETA" src="./catalog/images/meros-claude-usage-statusline.png" width="800"></a>

Claude APIに5時間・7日間ウィンドウの使用量をポーリングし、2階層の履歴をローカルに保存。スパークラインとカラーコード付きプログレスバーをレンダリングし、スマートな日付/期間フォーマットでレート制限までのETAを予測する。

#### [**schoen-claude-status**](https://github.com/mtschoen/schoen-claude-status) · MIT

<a href="https://github.com/mtschoen/schoen-claude-status"><img alt="schoen-claude-status showing cache hit rate and rate-limit pace projection" src="./catalog/images/mtschoen-schoen-claude-status.svg" width="800"></a>

セッション全体のキャッシュヒット率、コンテキスト使用量、5時間/週次レート制限ペース予測とコストを追跡する2行ステータスライン — bash + Python単一ファイル構成。

#### [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) · MIT

<a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="./catalog/images/ndave92-claude-code-status-line.png" width="800"></a>

ワークスペース情報・git ステータス・モデル名・コンテキスト使用量・worktree ヒント・クォータタイマー・オプションの API コストを表示する Rust 製 Claude Code statusline。

#### [**noahs-claude-statusline**](https://github.com/noahbclarkson/noahs-claude-statusline) · Unspecified `(ref)`

<a href="https://github.com/noahbclarkson/noahs-claude-statusline"><img alt="noahs-claude-statusline GitHub preview" src="./catalog/images/noahbclarkson-noahs-claude-statusline.png" width="800"></a>

Windows MSYS2向けbashステータスライン。PowerShell AttachConsoleのプロセスツリー探索でターミナル幅を検出し、1/8セル精度の分数プログレスバーをレンダリングする。

#### [**cc-tempo**](https://github.com/O0000-code/cc-tempo) · MIT

<a href="https://github.com/O0000-code/cc-tempo"><img alt="cc-tempo statusline screenshot" src="./catalog/images/o0000-cc-tempo.png" width="800"></a>

トランスクリプトから実際の作業時間を計測し、サブエージェントの並列高速化比率を表示、トークンやコストではなくスパークラインでコードチャーン速度を追跡するClaude Codeステータスライン。

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。

#### [**claude-powerline**](https://github.com/Owloops/claude-powerline) · MIT

<a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="./catalog/images/owloops-claude-powerline.svg" width="800"></a>

リアルタイム使用量追跡・git 連携・テーマプリセットを備えた Vim スタイルの powerline Claude Code statusline。

#### [**ccstatusline-usage**](https://github.com/pcvelz/ccstatusline-usage) · MIT

<a href="https://github.com/pcvelz/ccstatusline-usage"><img alt="ccstatusline-usage showing session and weekly API usage bars alongside model and git widgets" src="./catalog/images/pcvelz-ccstatusline-usage.png" width="800"></a>

ccstatusline のフォーク。Anthropic API からセッション・週次利用率バー、週次ペースインジケーター、リセットカウントダウン、ローカルモデル向けマルチプロバイダールーティングをリアルタイムで表示する使用量ウィジェットを追加。

#### [**simple-claude-code-statusline**](https://github.com/Postmodum37/simple-claude-code-statusline) · MIT

<a href="https://github.com/Postmodum37/simple-claude-code-statusline"><img alt="simple-claude-code-statusline two-line preview" src="./catalog/images/postmodum37-simple-claude-code-statusline.png" width="800"></a>

Go製のシンプルで改造しやすい2行Claude Codeステータスライン。1行目はモデル・ディレクトリ・ファイル数付きGitブランチ・ワークツリー・変更行数、2行目はコンテキストバー・5時間/7日レート制限・コスト・経過時間を表示する。

#### [**prism-hud**](https://github.com/puddinging/prism-hud) · MIT

<a href="https://github.com/puddinging/prism-hud"><img alt="prism-hud gradient statusline preview" src="./catalog/images/puddinging-prism-hud.png" width="800"></a>

jarrodwatts/claude-hudのフォークで、プログレスバーを位置ごとのグラデーションパレットに置き換え — 各ドットは緑（安全）から黄、赤（危険）まで固定色で、コンテキストとレート制限ウィンドウの充填レベルを一目で確認できる。

#### [**claude-code-statusline (RaiconY)**](https://github.com/RaiconY/claude-code-statusline) · MIT

<a href="https://github.com/RaiconY/claude-code-statusline"><img alt="claude-code-statusline repo preview" src="./catalog/images/raicony-claude-code-statusline.png" width="800"></a>

依存関係なしの単一ファイルNode.jsステータスライン — モデル、アクティブタスク、Git状態、コンテキスト使用量、TTL付きプロンプトキャッシュ状態、Anthropicの5時間/7日レート制限カウントダウンを表示。

#### [**claude-code-statusline (RiverOfLogic)**](https://github.com/RiverOfLogic/claude-code-statusline) · Unspecified `(ref)`

<a href="https://github.com/RiverOfLogic/claude-code-statusline"><img alt="RiverOfLogic Powerline statusline showing model, git, context bar with warm retro colors" src="./catalog/images/riveroflogic-claude-code-statusline.png" width="800"></a>

Claude Code 向けの powerline スタイルのレトロターミナル statusline。モデル、git ブランチ、出力スタイル、思考モード、暖色系アーストーンのしきい値で色分けされた 10 セルのコンテキストプログレスバー、そしてライブ時計を表示する。

#### [**aifuel**](https://github.com/robertogogoni/aifuel) · MIT

<a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a>

Go 製マルチプロバイダー AI 使用量モニター（Claude、Codex、Gemini、Copilot、Antigravity）。waybar モジュール、Chrome 拡張機能、Bubble Tea TUI、Admin API ダッシュボード、コンパクトな Claude Code ステータスラインにわたってレート制限・コスト・ピーク時間帯の分析を提供します。

#### [**claude-code-statusline (rz1989s)**](https://github.com/rz1989s/claude-code-statusline) · MIT

<a href="https://github.com/rz1989s/claude-code-statusline"><img alt="claude-code-statusline Catppuccin Mocha theme screenshot" src="./catalog/images/rz1989s-claude-code-statusline.png" width="800"></a>

Claude Code 向け Bash 製 statusline。最大 9 行に渡る 28 のアトミックコンポーネントで git 情報・コスト追跡・MCP ヘルス・ブロックリセットタイマー・イスラム礼拝時間・Catppuccin テーマを表示。

#### [**horologium**](https://github.com/Shallow-dusty/horologium) · MIT

<a href="https://github.com/Shallow-dusty/horologium"><img alt="horologium repo card" src="./catalog/images/shallow-dusty-horologium.png" width="800"></a>

サブミリ秒のClaude Codeステータスラインとccusage形式のJSONLログ解析を統合したRustバイナリ。トークン、コスト、Git、5時間/7日レート制限の表示と、日次・セッション・ブロック使用レポート生成を一つのツールで実現する。

#### [**ClaudeCodeStatusBar**](https://github.com/SleighMaster99/ClaudeCodeStatusBar) · MIT

<a href="https://github.com/SleighMaster99/ClaudeCodeStatusBar"><img alt="ClaudeCodeStatusBar synthetic preview — model, context bar, cost, git branch" src="./catalog/images/sleighmaster99-claudecodestatusbar.svg" width="800"></a>

Windows専用のWinForms GUIエディタ。Claude Codeの複数行ステータスラインをドラッグ＆ドロップで構築でき、PowerShellランタイム、使用量トラッキング、Git・コンテキスト・コストウィジェットを備える。

#### [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) · MIT

<a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="./catalog/images/sotayamashita-claude-code-statusline.png" width="800"></a>

starship ライクな設定とモジュールベースの構成に対応した Rust 製 Claude Code statusline。

#### [**claude-statusline-powerline**](https://github.com/spences10/claude-statusline-powerline) · MIT

<a href="https://github.com/spences10/claude-statusline-powerline"><img alt="claude-statusline-powerline demo showing themed powerline segments" src="./catalog/images/spences10-claude-statusline-powerline.png" width="800"></a>

Owloops の claude-powerline を拡張して構築された powerline スタイルの Claude Code statusline。ローカル SQLite バックエンドの使用状況分析データベースと、settings.json 向け IntelliSense（自動補完・ホバードキュメント・色検証）を備えた JSON 設定スキーマを追加している。

#### [**claude-statusline (TheoBrigitte)**](https://github.com/TheoBrigitte/claude-statusline) · MIT

<a href="https://github.com/TheoBrigitte/claude-statusline"><img alt="claude-statusline (TheoBrigitte) showing model, context bar, cost, duration, and API status segments" src="./catalog/images/theobrigitte-claude-statusline.png" width="800"></a>

Go 言語で静的コンパイルされた Claude Code 用 statusline。モジュールごとの色・記号・しきい値を TOML ファイルで設定でき、ターミナル幅に応じたレスポンシブレイアウトを持ち、約 19 マイクロ秒でレンダリングする。

#### [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) · MIT

<a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="context-statusline showing token + cache breakdown" src="./catalog/images/thisdot-context-statusline.svg" width="800"></a>

セッション JSONL トランスクリプトを解析して入力・キャッシュ作成・キャッシュ読み取りトークンを集計し、正確なコンテキストウィンドウを表示する Claude Code statusline。

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。

#### [**xuedi/claude-statusline**](https://github.com/xuedi/claude-statusline) · EUPL-1.2 `(ref)`

<a href="https://github.com/xuedi/claude-statusline"><img alt="xuedi/claude-statusline repo preview" src="./catalog/images/xuedi-claude-statusline.png" width="800"></a>

Rust ネイティブの Claude Code statusline。モデル、git、トークン、effort、5時間/7日のレート制限を、20 セルの点字プログレスバーで表示する。約 500 行の安全な（unsafe 禁止の）コードで実装されている。

#### [**claude-code-statusline**](https://github.com/xyzcardiff/claude-code-statusline) · MIT

<a href="https://github.com/xyzcardiff/claude-code-statusline"><img alt="xyzcardiff claude-code-statusline repository preview" src="./catalog/images/xyzcardiff-claude-code-statusline.png" width="800"></a>

~/.claude/jobsからサブエージェント数とバックグラウンドタスクのプログレスバーをリアルタイム表示する2行のシェルステータスライン — エージェントやタスクがアクティブな時のみ2行目を表示。

### OpenCode

#### [**ocstatusline**](https://github.com/amirlehmam/ocstatusline) · MIT

<a href="https://github.com/amirlehmam/ocstatusline"><img alt="ocstatusline synthetic preview — model, git branch, context, cost, session timer" src="./catalog/images/amirlehmam-ocstatusline.svg" width="800"></a>

OpenCode サーバーのイベントストリームを購読し、専用のターミナルペインでライブ更新され続けるステータスラインを描画するスタンドアロンの OpenCode statusline デーモン。セグメントを設定できる Ink ベースのインタラクティブ TUI を備える。

#### [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) · MIT

<a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="./catalog/images/joaquinvesapa-sub-agent-statusline.webp" width="800"></a>

サブエージェントのアクティビティ・経過時間・トークン／コンテキスト使用量を表示する OpenCode TUI サイドバープラグイン（statusLine.command ではない）。

#### [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) · MIT

<a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="./catalog/images/markwilkening-opencode-status-line.png" width="800"></a>

OpenCode CLI 向けの軽量・高速な statusline。

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。

#### [**opencode-quota**](https://github.com/slkiser/opencode-quota) · MIT

<a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="./catalog/images/opencode-quota.webp" width="800"></a>

コンテキストウィンドウを汚染しない OpenCode のクォータおよびトークン使用量表示ツール。OpenCode Go・Cursor・GitHub Copilot などのプロバイダーをサポートします。

#### [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) · MIT

<a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="./catalog/images/ramtinj95-opencode-tokenscope.png" width="800"></a>

セッションのトークン使用量とコストを詳細な内訳とともに分析する OpenCode プラグイン（statusline ではない）。

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。

### Gemini CLI

#### [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) · Unspecified `(ref)`

<a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="./catalog/images/kiriketsuki-gemini-statusline.png" width="800"></a>

モデル・ワークスペースコンテキスト・git ブランチ・GitHub Issue 件数・受信トレイ件数を表示する Gemini CLI 向け 2 行シェルプロンプトヘルパー。Gemini CLI にはネイティブ statusLine フックがないため、ユーザーのシェルプロンプトから実行します。

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。

#### [**aifuel**](https://github.com/robertogogoni/aifuel) · MIT

<a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a>

Go 製マルチプロバイダー AI 使用量モニター（Claude、Codex、Gemini、Copilot、Antigravity）。waybar モジュール、Chrome 拡張機能、Bubble Tea TUI、Admin API ダッシュボード、コンパクトな Claude Code ステータスラインにわたってレート制限・コスト・ピーク時間帯の分析を提供します。

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。

### Codex CLI

#### [**cat-codex-statusline (ai-ken-git)**](https://github.com/ai-ken-git/cat-codex-statusline) · MIT

<a href="https://github.com/ai-ken-git/cat-codex-statusline"><img alt="cat-codex-statusline terminal preview showing model, git branch, and context segments" src="./catalog/images/ai-ken-git-cat-codex-statusline.png" width="800"></a>

猫テーマの Codex CLI ステータスライン インストーラー。ビルトインセグメント（モデル、gitブランチ、コンテキスト、制限）をクリーンなプリセットに配線し、Codex がコマンドベースのステータスラインフックを提供した時点で猫顔レンダラーが自動的に有効になります。

#### [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) · PolyForm-Noncommercial-1.0.0 `(ref)`

<a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="./catalog/images/capedbitmap-codex-hud.webp" width="800"></a>

ローカルの Codex セッションデータを取り込み、週次リセットのタイミングと残余容量に基づいて次に使用するアカウントを推薦する macOS メニューバーアプリ。

#### [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) · MIT

<a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="./catalog/images/fwyc-codex-hud.png" width="800"></a>

セッション／コンテキスト使用量・git ステータス・ツールアクティビティ監視を備えた OpenAI Codex CLI 向けリアルタイム tmux statusline HUD。`--kill` / `--list` / `--attach` / `--self-check` サブコマンドも含みます。

#### [**codex-statusline (GordonBeeming)**](https://github.com/GordonBeeming/codex-statusline) · Unspecified `(ref)`

<a href="https://github.com/GordonBeeming/codex-statusline"><img alt="codex-statusline (GordonBeeming) OpenGraph card" src="./catalog/images/gordonbeeming-codex-statusline.png" width="800"></a>

リポジトリ名、git ブランチ、モデル、AUD 建てのセッションコスト、5時間レート制限バー、コンテキストウィンドウ使用率を表示する 4 行構成の Codex statusline。作者の claude-statusline のレイアウトを踏襲している。

#### [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) · MIT

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="800"></a>

Claude Code と Codex 向けの高速ローカルトークン使用量トラッカー。`tu statusline` でコスト/トークンの1行サマリを出力。CLI・TUI・GUI モードも搭載。ccusage より 214 倍高速。

#### [**claude-codex-statusline**](https://github.com/kiheon0709/claude-codex-statusline) · MIT `(ref)`

<a href="https://github.com/kiheon0709/claude-codex-statusline"><img alt="claude-codex-statusline showing dual usage bars for Claude and Codex" src="./catalog/images/kiheon0709-claude-codex-statusline.png" width="800"></a>

Claude CodeとCodex CLIのクォータを並べて表示するデュアルバーステータスライン。5時間・週次レート制限バー、コンテキストウィンドウ、PreToolUse/PostToolUseフックで追跡するアクティブサブエージェント数をリアルタイムに表示する。

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

macOS のノッチ/メニューバーに常駐する SwiftUI + AppKit 製コンパニオンアプリ。AI コーディングエージェントのセッション状態や保留中の権限リクエストをリアルタイムで表示し、正しいターミナルや IDE にワンクリックで戻れる。Claude Code・Codex・Gemini CLI・OpenCode・Cursor・Kimi CLI・Qoder・Qwen Code・Factory・CodeBuddy に対応。macOS 14 以降専用。

#### [**codex-statusline (rgomes87)**](https://github.com/rgomes87/codex-statusline) · Unspecified `(ref)`

<a href="https://github.com/rgomes87/codex-statusline"><img alt="codex-statusline 4-line tmux preview" src="./catalog/images/rgomes87-codex-statusline.svg" width="800"></a>

Codex CLI 向けのカラフルな 4 行構成の tmux ステータス領域。コンテキストウィンドウ、モデル、git ブランチ、そして秒単位のリセットカウントダウン付きの 5時間/7日レート制限ペーシングバーを表示する。

#### [**aifuel**](https://github.com/robertogogoni/aifuel) · MIT

<a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="800"></a>

Go 製マルチプロバイダー AI 使用量モニター（Claude、Codex、Gemini、Copilot、Antigravity）。waybar モジュール、Chrome 拡張機能、Bubble Tea TUI、Admin API ダッシュボード、コンパクトな Claude Code ステータスラインにわたってレート制限・コスト・ピーク時間帯の分析を提供します。

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM から取得した価格情報でトークン使用量を追跡するクロス CLI 対応ツール。

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

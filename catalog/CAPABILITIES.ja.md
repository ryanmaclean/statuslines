# ケーパビリティ宣言

**言語：** [English](./CAPABILITIES.md) · [Français](./CAPABILITIES.fr.md) · 日本語

セキュリティ計画のフェーズGです。再配布可能なカタログエントリは、それぞれが利用を想定する*ケーパビリティ*を宣言し、CIはサンドボックス内でインストールを実行して宣言が正直であることを確認します。npmにおけるAndroidのパーミッションのようなものとお考えください。コントリビュータが自分のツールに必要な権限を宣言し、インストール時または初回実行時にそれを超えて何かを取得しようとするものをカタログが拒否（または隔離）します。

## 宣言される4つの次元

各再配布可能エントリのJSONには`capabilities`ブロックが含まれます：

```json
"capabilities": {
  "network": true,
  "child_process": true,
  "filesystem_write": false,
  "env_read": ["HOME", "PATH"],
  "verified_at": null,
  "verification_method": "declared"
}
```

| フィールド | 型 | 意味 |
|---|---|---|
| `network` | `boolean` | インストール**または**初回実行時の呼び出しが外向きネットワーク通信（npmレジストリ、テレメトリ、ライセンスチェックなど）を行います。ほとんどのエントリは`true`です。自分のtarballを取得するためです。 |
| `child_process` | `boolean` | エントリがバイナリ自体以外の子プロセスを生成します（例：`git`、`gh`、`tput`、サブツールなど）。`npx`の解決処理だけでも`true`としてカウントされます。 |
| `filesystem_write` | `boolean` | エントリがセーフルート（`$HOME/.cache`、`$TMPDIR`、インストールディレクトリ）の**外**にファイルを書き込みます。これらの内側への書き込みはデフォルトで許可され、フラグも立ちません。エントリが`$HOME/<dotfile>`などに状態を永続化する場合は`true`に設定してください。 |
| `env_read` | `string[]` | エントリが読み取りを想定する環境変数の名前です。保守的なデフォルトは`["HOME", "PATH"]`です。「任意」を意味する場合は`["*"]`を使用し、それを正当化する`notes`フィールドを追加してください。 |
| `verified_at` | `string \| null` | 宣言と一致した最後のサンドボックス観測のISO日付です。`null`は宣言済みだが未検証であることを示します。 |
| `verification_method` | `"declared" \| "sandbox-strace" \| "sandbox-bpf" \| "skipped"` | 検証がどのように行われたかを示します。`declared`は自己申告のみ、`sandbox-strace`はfirejail/bubblewrap内でstraceの下で観測されたこと、`skipped`はインストールタイプ（`manual`、`brew`、`cargo`）がまだサンドボックス化されていないことを意味します。 |

## それぞれが何を強制するか

ケーパビリティ宣言は2か所で強制されます：

1. **`bin/statuslines.js doctor`** — スキーマバリデータは、再配布可能エントリに`capabilities`が欠けている場合に*警告*を発します。すべてのエントリがバックフィルされた時点で、警告はハードエラーに昇格します（ロールアウトについてはSECURITY.mdを参照）。
2. **`catalog-capabilities`ワークフロー** — 自動化可能なインストール（`npx`、`npm-global`、`opencode-plugin`、`git`）を持つ再配布可能エントリごとに`node scripts/verify-capabilities.mjs <slug>`を実行します。観測された挙動が宣言を超える場合、エントリは隔離され（`security.quarantined: true`）、理由が`security.quarantine_reason`に記録されます。一致するエントリは`verified_at`と`verification_method`が更新されます。

`filesystem_write`の「セーフルート」は意図的に狭く設定されています：

- `$HOME/.cache/` — npm/npxはここにtarballをキャッシュします。これは想定済みです。
- `$TMPDIR`（Linuxでは通常`/tmp`） — 短命なスクラッチ領域は許可されます。
- `git`エントリのインストールディレクトリ（`~/.local/share/statuslines/<clone_dir>`）。

`$HOME/.config/<tool>`や`$HOME/.<tool>rc`への書き込みはデフォルトでは**許可されません**。`filesystem_write: true`を宣言し、`notes`で説明してください。

## サンドボックスの仕組み

`scripts/verify-capabilities.mjs`は、優先順位の高い順に、次のいずれかの下でインストールまたは初回実行の呼び出しを行います：

1. **`firejail --noprofile --net={none|eth0}`** — `ubuntu-latest`で推奨されます。2回のパスを実行します。最初に`--net=none`でネットワークが*実際に必要*かどうかを検出し、続いて`--net=eth0`で`strace -f -e trace=network,process,%file`を実行してsyscallの軌跡をキャプチャします。
2. **`bubblewrap`（`bwrap`）** — firejailが`PATH`にない場合のフォールバックです。同等の隔離を提供し、呼び出しがやや冗長です。
3. **`strace`のみ** — どちらのサンドボックスも利用できない場合の最終手段のフォールバックです。stderrに大きな警告が出ます。CIはこのパスに依存しません。

採用しているstraceフィルタは次の通りです：

```
strace -f -e trace=network,process,%file -o <log>
```

`network`は`connect()`、`sendto()`、`bind()`（ホスト解決、外向きTLS）をカバーします。`process`は`execve()`、`clone()`、`fork()`をカバーします。`%file`は書き込みフラグ付きの`openat()`/`open()`をカバーします。フォークの追跡（`-f`）は必須です。npmとnpxは積極的にプロセスを分岐させるためです。

## ブートストラップ用のデフォルト値

新しいエントリをバックフィルする際は、*最も寛容な*デフォルトから始め、サンドボックスにそれを絞らせてください：

```json
"capabilities": {
  "network": true,
  "child_process": true,
  "filesystem_write": false,
  "env_read": ["HOME", "PATH"],
  "verified_at": null,
  "verification_method": "declared"
}
```

`network: true`はほぼすべてのエントリで正しい設定です。npmレジストリを呼び出したり、トークンを取得したり、更新を確認したりするためです。`child_process: true`はgitインストールとほとんどのnpmパッケージで真となります。`filesystem_write: false`は慎重なデフォルトで、実際に必要かどうかはサンドボックスが教えてくれます。`env_read`は意図的に保守的です。ツールが`ANTHROPIC_API_KEY`、`CLAUDE_CONFIG_DIR`などを読み取ることが判明した時点で明示的に拡張してください。

## コントリビュータ向けワークフロー

エントリを追加または更新するとき：

1. **宣言**：自信がない場合は、最も寛容なデフォルト（上記）でケーパビリティブロックを宣言してください。サンドボックスがそれを絞り込みます。
2. **ローカル実行**：firejailがインストールされていれば、`node scripts/verify-capabilities.mjs <slug>`を実行してください。JSONレポートを確認し、`exceeds_declared: true`の場合は、実際のコードを絞り込むか、宣言を広げてください。
3. **スモークテスト**：サンドボックスなしで`node bin/statuslines.js verify-capabilities <slug> --dry-run`を実行すると、定型のレポート形状が出力されます。
4. **PRをオープン**：週次の`catalog-capabilities`ワークフローが`ubuntu-latest`で独立して再検証します。宣言が正直であれば、ボットのPRは単に`verified_at`を更新します。そうでなければ、エントリは隔離され、レビュアから連絡があります。

## なぜこの4つの次元なのか

- **`network`** — 最も一般的なサプライチェーン攻撃の表面です。初回実行時に追加のペイロードを取得すること、テレメトリにビーコンを送ること、環境変数を流出させることなどです。
- **`child_process`** — `sh -c`や`bash`を生成するツールは、計算のみを行うものよりはるかに危険です。`child_process: false`の宣言は、強力で機械検証可能な主張です。
- **`filesystem_write`** — 認証情報の収集者は、マーカーファイルを置いたり、シェルのrcファイルを書き換えたりすることがよくあります。書き込みを既知のセーフルートに制限することで、straceの下でこれらの行為が即座に目立つようになります。
- **`env_read`** — 環境変数は秘密が伝わる経路です。ステータスラインツールが`OPENAI_API_KEY`を読み取る場合、その*理由*を説明すべきです。

意図的に`cpu`、`memory`、`time`は宣言*しません*。カタログは実行時のクォータポリシーをホストせず、ステータスラインは短命だからです。フェーズGは同意に関するものであり、リソース制御に関するものではありません。

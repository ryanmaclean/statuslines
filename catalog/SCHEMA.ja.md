# カタログエントリ・スキーマ

**言語：** [English](./SCHEMA.md) · [Français](./SCHEMA.fr.md) · 日本語

各 `catalog/<cli>/<slug>.json` がひとつのエントリに対応します。

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
  "image": {
    "url": "https://raw.githubusercontent.com/sirmalloc/ccstatusline/main/screenshots/demo.gif",
    "alt": "ccstatusline demo animation",
    "source": "readme"
  },
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

## フィールドリファレンス

### 識別子とライセンス

- **slug** ：小文字、kebab-case、一意。同名の上流が二つあるときは `<owner>-<name>` 形式を使ってください（例：`lucasilverentand-claudeline` と `fredrikaverpil-claudeline`）。
- **license** ：上流の `LICENSE` ファイルから直接読み取った SPDX 識別子。README のバッジは正典ではありません。
- **redistributable** ：ライセンスが OSI 互換の許可リスト（MIT、Apache-2.0、BSD-2/3-Clause、ISC、MPL-2.0、0BSD）に含まれる場合のみ `true`。コピーレフト系（AGPL、GPL）、ソース利用可能系（PolyForm-NC、BSL）、検証できなかったライセンス（LICENSE ファイルなし）は `false`。再配布不可のエントリも参照のため一覧には残りますが、`configure` の対象外となります。
- **host_clis** ：`claude`、`opencode`、`gemini`、`codex` のいずれか。エントリは複数を対象にできます。

### 画像

- **image.url** ：代表的なスクリーンショットの絶対 https URL。`raw.githubusercontent.com` か上流の README が利用している CDN に置かれたヒーロー／デモ画像を優先してください。上流の README に使える画像がない場合は、GitHub が自動生成する OpenGraph カード `https://opengraph.githubassets.com/1/<owner>/<repo>` をフォールバックとして使ってください。`github.com/user-attachments/...` の URL は避けてください — ブラウザ以外のクライアントには 403 を返します。
- **image.alt** ：レンダリングされた画像の `alt` テキストおよびリンクタイトルとして使われる短いキャプション（≤ 60 文字）。
- **image.source** ：上流の README から取得した場合は `"readme"`、GitHub OpenGraph カードを使った場合は `"og-fallback"`。レンダラはどちらも同じに扱います。本フィールドは出所のためのものです。

### インストール

- **install.type** ：`npx`、`npm-global`、`cargo`、`brew`、`git`、`manual`、`opencode-plugin` のいずれか。
  - `npx` ：実行時に `npx --ignore-scripts -y <package>@<version>` で起動。事前インストール不要。
  - `npm-global` ：`npm i -g --ignore-scripts <package>@<version>`。
  - `cargo` ：`cargo install <package> --version <version>`。
  - `brew` ：`brew install <tap>/<formula>`（`brew tap` の単独実行は不要）。
  - `git` ：`~/.local/share/statuslines/<clone_dir>` にクローンしてそこから実行。
  - `opencode-plugin` ：`opencode.json` の `plugin` 配列に追加すると、OpenCode がセッション開始時に npm からパッケージをロードします。明示的なインストールコマンドはありません。
  - `manual` ：リンクのみ — ユーザーは上流のインストール手順に従います。
- **install.package**（npx／npm-global／opencode-plugin）：スコープを含む npm パッケージ名（例：`@owloops/claude-powerline`）。
- **install.version** ：`redistributable=true` かつ `manual` 以外のエントリでは**必須**。固定された semver。`"latest"` は `doctor` に拒否されます。`node bin/statuslines.js audit` がバックフィルおよび更新します。
- **install.integrity**（npm）：レジストリの `dist.integrity` SRI 文字列（例：`sha512-...`）。`audit` が取得します。
- **install.tap** ＋ **install.formula**（brew）：tap（例：`felipeelias/tap`）と formula 名。`formula` を省略すると `package` が既定値となります。
- **install.clone_dir**（git）：`~/.local/share/statuslines/` 配下のクローン先サブディレクトリ。

### Configs

- **configs** ：`<cli>` → JSON パッチのマップ。`configure` が当該ツールの設定ファイルへマージします。キーは 4 つの `host_clis` のいずれかでなければなりません。
- 再配布可能なエントリでは、`configs.<cli>` に `@latest`、`curl|sh`、`wget|sh`、`eval(`、`base64 -d`、リテラル文字列 `<repository-url>` を含めてはいけません。これらの規則に違反するエントリは `doctor` に拒否されます。
- `git` インストールタイプでは、文字列値中のマジックトークン `${INSTALL_DIR}` が configure 実行時にクローン先で置換されます。

### Security ブロック

- **security.has_install_scripts** ：上流の npm パッケージが `preinstall`、`install`、`postinstall`、`prepare` のライフサイクルスクリプトを宣言している場合 `true`。`audit` が自動検出します。`configure` で既定として付加する `--ignore-scripts` フラグがリスクを軽減します。`render-readme` はこの値が `true` の場合に警告を出します。
- **security.license_observed** ：直近の `audit` が上流パッケージで観測したライセンス文字列。トップレベルの `license` と一致するはずです。ここに乖離があればライセンス退行のシグナルです。
- **security.last_audit** ：当該エントリに対して最後に `audit` が走った ISO 日付。
- **security.quarantined** ：`true` にすると `list`、`show`、`configure`、生成された README からエントリを非表示にします。既定は `false`。
- **security.quarantine_reason** ：`quarantined=true` のとき必須。一行の自由記述による理由。
- **security.quarantined_at** ：エントリを隔離した ISO 日付。

隔離されたエントリ：
- 環境変数 `STATUSLINES_REVEAL_QUARANTINE=1` が設定されていない限り、`bin/statuslines.js list` の出力に含まれません。
- 環境変数で reveal を有効にしない限り、`show <slug>` は `no entry: <slug>`（タイポと同じ）を出力します。
- `configure <slug>` は `no entry` で拒否されます。reveal を有効にすると隔離理由を表示しつつそれでも拒否します。実際にインストールするには reveal 環境変数の設定**かつ** `--ignore-quarantine` の指定が必要です。
- `catalog/README.md` およびトップ README のカタログブロックの両方から除外されます。
- `catalog/QUARANTINE.md` に列挙されます（`render-quarantine` で再生成）。

これは OpenBSD 流の「デフォルトで安全」の姿勢です。警告ではなく非表示にします。フォレンジック記録は `QUARANTINE.md` に残ります。

## エントリの追加

1. 上流リポジトリでライセンスを検証してください — README のバッジではなく `LICENSE` ファイルを直接読みます。標準的なパスに `LICENSE` ファイルが存在しない場合は、`redistributable: false` および `license: "Unspecified"` を設定してください。
2. インストール経路がレジストリに対して実際に機能することを確認してください（npm パッケージが宣言した名前とバージョンで存在する、brew formula が tap 配下で解決する など）。npm の場合：`curl -s https://registry.npmjs.org/<pkg>` で `dist-tags.latest` を読みます。
3. 一文の説明を自分の言葉で書いてください。上流からの貼り付けは避けてください。
4. JSON を `catalog/<cli>/<slug>.json` に配置してください。
5. `redistributable: true` のエントリでは、`node bin/statuslines.js audit <slug>` を実行して `install.version`、`install.integrity`、`security.has_install_scripts` を埋めてください。
6. `node bin/statuslines.js doctor` で検証し、続いて `render-readme` と `render-top-readme` を実行して生成テーブルを更新してください。
7. PR を開いてください。

## ケイパビリティ

すべての再配布可能なエントリは、インストールまたは初回ランタイム呼び出しで利用すると見込まれるケイパビリティを宣言します。完全な根拠、サンドボックスモデル、コントリビューターワークフローは [`catalog/CAPABILITIES.md`](./CAPABILITIES.md) を参照してください。本セクションではスキーマフィールドのみ解説します。

形（エントリのトップレベルに、`install`、`configs` などと同列でインラインに追加）：

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

- **capabilities.network** ：`boolean` — インストールまたは初回ランタイム呼び出しが外向きのネットワーク呼び出しを行うか。npm 系のエントリではほぼ常に `true`（レジストリ取得、テレメトリ、ライセンスチェック）。
- **capabilities.child_process** ：`boolean` — エントリがバイナリ自身以外の子プロセスを生成するか。git インストールおよびほとんどの npm パッケージで `true`。
- **capabilities.filesystem_write** ：`boolean` — 安全なルート（`$HOME/.cache`、`$TMPDIR`、インストールディレクトリ）の外に書き込むか。これらのルート内への書き込みは許可されており、本フラグは不要です。既定：`false`。
- **capabilities.env_read** ：`string[]` — エントリが読み取ると見込まれる環境変数名。「任意」を意味する場合は `["*"]` を使い、エントリにはワイルドカードを正当化する `notes` フィールドを必ず添えてください。
- **capabilities.verified_at** ：ISO 日付文字列または `null`。サンドボックスが宣言と一致する挙動を最後に観測した時刻。`null` は宣言済みだが `catalog-capabilities` でまだ検証されていないことを意味します。
- **capabilities.verification_method** ：`"declared"`、`"sandbox-strace"`、`"sandbox-bpf"`、`"skipped"` のいずれか。`"declared"` がブートストラップの既定値で、ワークフローは観測が一致したときに `"sandbox-strace"` へ書き換えます。

ロールアウト中の検証器の挙動：`bin/statuslines.js doctor` は `redistributable: true` のエントリで `capabilities` が欠けているとき *警告* を出します（エラーではありません）。すべてのエントリがバックフィルされた段階で、警告はハードエラーへ昇格します。

対応する CLI サブコマンドは `node bin/statuslines.js verify-capabilities <slug> [--dry-run]` です。これは `scripts/verify-capabilities.mjs` に委譲し、観測と宣言を比較した JSON レポートを出力します。

## アテステーション

Phase I のサプライチェーン強化：再配布可能な npm 系エントリそれぞれについて、`scripts/provenance-check.mjs` が npm レジストリに対して、固定バージョンに Sigstore 署名された [SLSA build provenance](https://slsa.dev/spec/v1.0/provenance) アテステーション（GitHub Actions 実行から `npm publish --provenance` が生成する成果物）が付随しているかを問い合わせます。結果は `security.attestation` に記録されます。

```json
"security": {
  "attestation": {
    "available": true,
    "checked_at": "2026-04-30T00:00:00.000Z",
    "predicate_type": "https://slsa.dev/provenance/v1",
    "issuer": "https://github.com/actions/runner/github-hosted",
    "build_workflow": "github.com/<owner>/<repo>/.github/workflows/release.yml@refs/heads/main",
    "regression": false
  }
}
```

- **available** ：レジストリが固定バージョンに対して SLSA 型のアテステーションバンドルを公開しているときのみ `true`。npm publish の自己アテステーションだけではカウントしません。
- **checked_at** ：直近のプローブの ISO タイムスタンプ。
- **predicate_type / issuer / build_workflow** ：DSSE エンベロープに包まれた in-toto Statement から解析された値 — それぞれ predicate URI、OIDC ビルダー識別子（`runDetails.builder.id`）、正規形 `<host>/<owner>/<repo>/<workflow-path>@<ref>`（`buildDefinition.externalParameters.workflow` から）。
- **regression** ：直前の実行が `available: true` を記録しており、現在の実行で `available: false` になった場合に `true`。**これがシグナルの強い異常です** — ビルドの署名を *していた* パッケージが署名をやめるというのは、調査に値するサプライチェーンの形です。

Phase I は **アドバイザリ** です。`doctor` は `available: false` のエントリを拒否しません。プロベナンス公開を採用していない正当な上流が多く存在するためです。週次の `catalog-provenance` ワークフローは結果が変化したとき PR を開きます。将来の段階で、`available: true` の安定したベースラインを `doctor` の要件へ昇格させる可能性があります。

メンテナーが「なぜ自分のパッケージが `available: false` なのか」を知りたい場合：GitHub Actions ワークフローから `npm publish --provenance` を使って公開（ジョブに `id-token: write` を付与）してください。[`docs.npmjs.com/generating-provenance-statements`](https://docs.npmjs.com/generating-provenance-statements) を参照してください。

## 依存関係ロックファイル

Phase J ：`install.integrity` は *トップレベル* の tarball を固定しますが、`npx -y pkg@1.2.3` はインストール時に `package.json` のレンジから推移的依存を依然として解決します。トップレベルの固定が問題なくても、`lodash@^4.0.0` のメンテナー乗っ取りが新たな悪意あるバージョンを出荷する可能性があります。これを検出するため、再配布可能な npm エントリの推移的閉包をスナップショット化し、週次で再検証します。

```json
"install": {
  ...,
  "deps_lock_sha256": "<hex>"
}
```

- ロックファイルの内容は `catalog/locks/<slug>.json` に置かれます（インラインだとロックファイルが大きく、エントリ JSON を視覚的に圧迫するためです）。形：`{ schema_version, slug, package, version, captured_at, deps: { "<name>@<version>": "<sri>" } }`。全体でキーをソートし、パッケージ名ごとに解決された 1 バージョンへ重複排除します。
- **install.deps_lock_sha256** はキーソート・空白なしの JSON にした上での `sha256(canonicalize(lockfile))` です。これによりマニフェスト署名がロックファイルの同一性を推移的にカバーできます。
- `scripts/deps-capture.mjs` がロックファイルとハッシュの両方を生成します。`scripts/deps-verify.mjs` がライブレジストリに対して再解決し、4 つのバケットでドリフトを報告します — *added* と *integrity-changed-for-same-version* は異常、*bumped* と *removed* は情報です。
- 週次の `catalog-deps-verify` ワークフローはドリフトがあると更新 PR を開き、レポート本文で異常に `(quarantine candidate)` のタグを付けます。

これは **アドバイザリ** です：`doctor` はロックファイルや `deps_lock_sha256` を欠くエントリを拒否しません。ブートストラップ用の `node scripts/deps-capture.mjs` 実行が、既存のすべての再配布可能 npm 系エントリに対してそれらを埋めます。新規エントリは次の週次実行で、または手動キャプチャによって取り込まれます。

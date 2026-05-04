#!/usr/bin/env node
// Apply per-locale description translations gathered by the FR + JA
// translation agents. Re-runnable; idempotent.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CATALOG = join(ROOT, "catalog");

const FR = {
  "ainsley-opencode-token-monitor": "Plugin OpenCode (pas une statusline) qui enregistre les outils `token_stats` / `token_history` / `token_export` et émet des notifications toast avec les ventilations de jetons en entrée, sortie, raisonnement et cache.",
  "capedbitmap-codex-hud": "Application macOS de barre de menus qui ingère les données de session Codex locales et recommande le prochain compte à utiliser selon le calendrier de réinitialisation hebdomadaire et la capacité restante.",
  "ccometixline": "Statusline Claude Code rapide en Rust avec un configurateur TUI interactif, une intégration git et un suivi de l'usage.",
  "ccstatusline": "Statusline Claude Code personnalisable avec un configurateur TUI interactif, un rendu powerline, des thèmes et des widgets pour les jetons, git, les minuteries de session et les liens cliquables.",
  "ccusage": "Analyseur d'usage de jetons et de coûts qui parse les fichiers JSONL de sessions locales Claude Code et Codex ; pas une statusline en soi, mais une source de données utile à composer dans une statusline.",
  "claude-hud": "Plugin/statusline Claude Code qui affiche l'usage du contexte, les outils actifs, les sous-agents en cours, la progression des tâches et les fenêtres de limites de débit via l'API native de statusline.",
  "daniel3303-claude-statusline": "Statusline Bash + PowerShell pour Claude Code affichant le modèle, les jetons, les limites de débit et l'état git.",
  "dwillitzer-claude-statusline": "Statusline Bash pour Claude Code avec comptage de jetons optionnel via Node.js + tiktoken et colorisation de modèles multi-fournisseurs (Claude, OpenAI, Gemini, Grok).",
  "felipeelias-claude-statusline": "Statusline binaire Go pour Claude Code avec une configuration par modules, des hyperliens OSC 8 et des thèmes prédéfinis (`catppuccin`, `tokyo-night`, `gruvbox-rainbow` et d'autres).",
  "fredrikaverpil-claudeline": "Statusline Go minimaliste pour Claude Code distribuée comme plugin Claude Code ; la commande slash `/claudeline:setup` du plugin télécharge le binaire et met à jour settings.json.",
  "fwyc-codex-hud": "HUD de statusline tmux en temps réel pour OpenAI Codex CLI avec l'usage de session/contexte, l'état git et la surveillance de l'activité des outils ; inclut les sous-commandes --kill / --list / --attach / --self-check.",
  "hagan-claudia-statusline": "Statusline Rust pour Claude Code avec suivi de statistiques persistantes, des binaires pré-compilés pour Linux/macOS/Windows et 11 thèmes ; référencée dans la documentation officielle de Claude Code.",
  "joaquinvesapa-sub-agent-statusline": "Plugin de barre latérale TUI OpenCode (pas un statusLine.command) qui affiche l'activité des sous-agents, le temps écoulé et l'usage des jetons/du contexte.",
  "kiriketsuki-gemini-statusline": "Aide d'invite shell sur deux lignes pour Gemini CLI affichant le modèle, le contexte de l'espace de travail, la branche git, le nombre de tickets GitHub et la profondeur de la boîte de réception — Gemini CLI n'ayant pas de hook statusLine natif, ceci s'exécute depuis l'invite shell de l'utilisateur.",
  "lucasilverentand-claudeline": "Statusline Claude Code fournie sous le paquet npm `claudeline` avec des thèmes intégrés ; peut s'auto-installer dans settings.json via son option `--install`.",
  "markwilkening-opencode-status-line": "Statusline légère et rapide pour OpenCode CLI.",
  "ndave92-claude-code-status-line": "Statusline Rust pour Claude Code avec les informations de l'espace de travail, l'état git, le nom du modèle, l'usage du contexte, des indications de worktree, des minuteries de quota et les coûts API optionnels.",
  "opencode-quota": "Affichage du quota et de l'usage de jetons pour OpenCode sans pollution de la fenêtre de contexte ; prend en charge les fournisseurs OpenCode Go, Cursor, GitHub Copilot et d'autres.",
  "owloops-claude-powerline": "Statusline powerline de style Vim pour Claude Code avec suivi de l'usage en temps réel, intégration git et thèmes prédéfinis.",
  "ramtinj95-opencode-tokenscope": "Plugin OpenCode (pas une statusline) fournissant l'analyse de l'usage des jetons et des coûts pour les sessions avec des ventilations détaillées.",
  "sotayamashita-claude-code-statusline": "Statusline Rust pour Claude Code avec une configuration de style starship et une composition par modules.",
  "thisdot-context-statusline": "Statusline Claude Code qui parse les transcriptions JSONL de session pour calculer les jetons en entrée + création de cache + lecture de cache afin d'afficher fidèlement la fenêtre de contexte.",
  "tokscale": "Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM.",
};

const JA = {
  "ainsley-opencode-token-monitor": "OpenCode プラグイン（statusline ではない）で、`token_stats` / `token_history` / `token_export` ツールを登録し、入力・出力・推論・キャッシュのトークン内訳をトースト通知で表示します。",
  "capedbitmap-codex-hud": "ローカルの Codex セッションデータを取り込み、週次リセットのタイミングと残余容量に基づいて次に使用するアカウントを推薦する macOS メニューバーアプリ。",
  "ccometixline": "インタラクティブな TUI 設定ツール、git 連携、使用量追跡を備えた Rust 製の高速 Claude Code statusline。",
  "ccstatusline": "インタラクティブな TUI 設定ツール、powerline レンダリング、テーマ、トークン・git・セッションタイマー・クリッカブルリンクのウィジェットを備えたカスタマイズ可能な Claude Code statusline。",
  "ccusage": "ローカルの Claude Code および Codex セッション JSONL ファイルを解析するトークン使用量・コスト分析ツール。statusline 自体ではないが、statusline 構築に有用なデータソースとして活用できます。",
  "claude-hud": "コンテキスト使用量・アクティブツール・実行中サブエージェント・Todo 進捗・レート制限ウィンドウをネイティブ statusline API で表示する Claude Code プラグイン／statusline。",
  "daniel3303-claude-statusline": "モデル・トークン・レート制限・git ステータスを表示する Bash + PowerShell 製の Claude Code statusline。",
  "dwillitzer-claude-statusline": "オプションの Node.js + tiktoken トークンカウントと、Claude・OpenAI・Gemini・Grok のマルチプロバイダーモデルカラーリングに対応した Bash 製 Claude Code statusline。",
  "felipeelias-claude-statusline": "モジュールベースの設定、OSC 8 ハイパーリンク、テーマプリセット（`catppuccin`、`tokyo-night`、`gruvbox-rainbow` など）を備えた Go バイナリ製 Claude Code statusline。",
  "fredrikaverpil-claudeline": "Claude Code プラグインとして配布されるミニマリスト Go 製 Claude Code statusline。プラグインの `/claudeline:setup` スラッシュコマンドがバイナリをダウンロードして settings.json にパッチを当てます。",
  "fwyc-codex-hud": "セッション／コンテキスト使用量・git ステータス・ツールアクティビティ監視を備えた OpenAI Codex CLI 向けリアルタイム tmux statusline HUD。`--kill` / `--list` / `--attach` / `--self-check` サブコマンドも含みます。",
  "hagan-claudia-statusline": "永続的な統計追跡、Linux・macOS・Windows 向けビルド済みバイナリ、11 テーマを備えた Rust 製 Claude Code statusline。公式 Claude Code ドキュメントでも参照されています。",
  "joaquinvesapa-sub-agent-statusline": "サブエージェントのアクティビティ・経過時間・トークン／コンテキスト使用量を表示する OpenCode TUI サイドバープラグイン（statusLine.command ではない）。",
  "kiriketsuki-gemini-statusline": "モデル・ワークスペースコンテキスト・git ブランチ・GitHub Issue 件数・受信トレイ件数を表示する Gemini CLI 向け 2 行シェルプロンプトヘルパー。Gemini CLI にはネイティブ statusLine フックがないため、ユーザーのシェルプロンプトから実行します。",
  "lucasilverentand-claudeline": "npm パッケージ `claudeline` として配布され、組み込みテーマと `--install` フラグによる settings.json への自動インストールに対応した Claude Code statusline。",
  "markwilkening-opencode-status-line": "OpenCode CLI 向けの軽量・高速な statusline。",
  "ndave92-claude-code-status-line": "ワークスペース情報・git ステータス・モデル名・コンテキスト使用量・worktree ヒント・クォータタイマー・オプションの API コストを表示する Rust 製 Claude Code statusline。",
  "opencode-quota": "コンテキストウィンドウを汚染しない OpenCode のクォータおよびトークン使用量表示ツール。OpenCode Go・Cursor・GitHub Copilot などのプロバイダーをサポートします。",
  "owloops-claude-powerline": "リアルタイム使用量追跡・git 連携・テーマプリセットを備えた Vim スタイルの powerline Claude Code statusline。",
  "ramtinj95-opencode-tokenscope": "セッションのトークン使用量とコストを詳細な内訳とともに分析する OpenCode プラグイン（statusline ではない）。",
  "sotayamashita-claude-code-statusline": "starship ライクな設定とモジュールベースの構成に対応した Rust 製 Claude Code statusline。",
  "thisdot-context-statusline": "セッション JSONL トランスクリプトを解析して入力・キャッシュ作成・キャッシュ読み取りトークンを集計し、正確なコンテキストウィンドウを表示する Claude Code statusline。",
  "tokscale": "Claude Code・OpenCode・Codex・Gemini・Cursor・Amp・Kimi など多数の AI コーディングツールのローカルセッションデータを読み取り、LiteLLM の価格情報に基づいてトークン使用量を追跡するクロス CLI 対応ツール。",
};

const KEY_ORDER = [
  "slug", "name", "repo", "license", "redistributable", "host_clis",
  "language", "description", "description_fr", "description_ja",
  "image", "install", "configs", "tags", "notes", "security", "capabilities",
];

function reorderKeys(obj) {
  const out = {};
  for (const k of KEY_ORDER) if (k in obj) out[k] = obj[k];
  for (const k of Object.keys(obj)) if (!(k in out)) out[k] = obj[k];
  return out;
}

let touched = 0;
const seenFr = new Set();
const seenJa = new Set();
const groups = readdirSync(CATALOG, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "locks" && d.name !== "images")
  .map((d) => d.name);

for (const g of groups) {
  for (const f of readdirSync(join(CATALOG, g))) {
    if (!f.endsWith(".json")) continue;
    const path = join(CATALOG, g, f);
    const entry = JSON.parse(readFileSync(path, "utf8"));
    let changed = false;
    if (FR[entry.slug] && entry.description_fr !== FR[entry.slug]) {
      entry.description_fr = FR[entry.slug];
      seenFr.add(entry.slug);
      changed = true;
    }
    if (JA[entry.slug] && entry.description_ja !== JA[entry.slug]) {
      entry.description_ja = JA[entry.slug];
      seenJa.add(entry.slug);
      changed = true;
    }
    if (changed) {
      writeFileSync(path, JSON.stringify(reorderKeys(entry), null, 2) + "\n");
      touched += 1;
      process.stdout.write(`patched ${entry.slug}\n`);
    }
  }
}

const missingFr = Object.keys(FR).filter((s) => !seenFr.has(s));
const missingJa = Object.keys(JA).filter((s) => !seenJa.has(s));
if (missingFr.length) process.stderr.write(`fr: unmatched slugs (or already current): ${missingFr.join(", ")}\n`);
if (missingJa.length) process.stderr.write(`ja: unmatched slugs (or already current): ${missingJa.join(", ")}\n`);
process.stdout.write(`apply-descriptions: ${touched} entries patched\n`);

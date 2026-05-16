# statuslines

**Langues :** [English](./README.md) · Français · [日本語](./README.ja.md)

> Un catalogue organisé de statuslines pour Claude Code, OpenCode, Gemini CLI
> et Codex CLI — plus une déclinaison de référence embarquée dans le dépôt
> (`pup/`) reliée à Datadog.

*Un seul motif, quatre CLIs d'agents, des dizaines de statuslines.*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-67-orange)
<!-- count:end -->
![CLIs covered](https://img.shields.io/badge/CLIs-Claude%20%7C%20OpenCode%20%7C%20Gemini%20%7C%20Codex-informational)

## Table des matières

- [Démarrage rapide](#démarrage-rapide)
- [Catalogue](#catalogue)
  - [Claude Code](#claude-code)
  - [OpenCode](#opencode)
  - [Gemini CLI](#gemini-cli)
  - [Codex CLI](#codex-cli)
- [CLI du catalogue](#cli-du-catalogue)
- [Déclinaisons embarquées](#déclinaisons-embarquées)
  - [pup — observabilité Datadog](#pup--observabilité-datadog)
- [Matrice de prise en charge](#matrice-de-prise-en-charge)
- [Arborescence](#arborescence)
- [Contribuer](#contribuer)
- [Liens connexes](#liens-connexes)
- [Feuille de route](#feuille-de-route)
- [Journal des modifications](./CHANGELOG.fr.md)
- [Licence](#licence)

## Démarrage rapide

Requiert Node ≥ 20 et `jq`.

```sh
# parcourir le catalogue
node bin/statuslines.js list
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline

# installer la déclinaison pup embarquée
./install/install-pup.sh --all --seed-config
```

Codex CLI ne dispose pas encore d'une statusline native par commande — démarrez le HUD sous tmux :

```sh
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## Catalogue

Indexé par CLI hôte. Les entrées dont la licence est OSI-permissive
embarquent une recette d'installation et de configuration exécutable via
`bin/statuslines.js configure` ; les entrées marquées `(ref)` sont listées
pour référence uniquement — installer selon les instructions amont.

Le tableau exhaustif (statut, type d'installation, langage) vit dans
[`catalog/README.md`](catalog/README.md), généré à partir des entrées JSON
— ce fichier fait foi. Le bloc ci-dessous est rendu automatiquement par
`node bin/statuslines.js render-top-readme` et conservé en anglais pour
éviter toute dérive avec les données.

<!-- catalog:start -->
### Claude Code

| Aperçu | Nom | Licence | Description |
|---|---|---|---|
| <a href="https://github.com/AnirudhMKumar/claude-code-statusline"><img alt="anirudhmkumar-claude-code-statusline preview" src="./catalog/images/anirudhmkumar-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/AnirudhMKumar/claude-code-statusline) | MIT | Windows-native PowerShell statusline for Claude Code showing directory, git branch, active model, and context usage — installs in one command via irm/iex with zero external dependencies. |
| <a href="https://github.com/AsafSaar/claude-code-statusline"><img alt="claude-code-statusline segment preview" src="./catalog/images/asafsaar-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/AsafSaar/claude-code-statusline) | MIT | Segment-based, fully configurable Claude Code statusline composed from toggleable parts (cwd, git branch, dirty, ahead/behind, model, node, context, cost, duration, lines, last commit, stash, effort, rate limits, ts errors) with per-segment icons and color thresholds. |
| <a href="https://github.com/brandonchartier/cc-statusline"><img alt="cc-statusline showing model, git, tokens, effort, and rate limits" src="./catalog/images/brandonchartier-cc-statusline.png" width="200"></a> | [**cc-statusline**](https://github.com/brandonchartier/cc-statusline) | MIT | Minimal Python statusline for Claude Code showing model, git branch, token usage percentage, reasoning effort level, 5h/7d rate-limit windows, and current local time — no API calls, no OAuth. |
| <a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="./catalog/images/ccometixline.png" width="200"></a> | [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) | MIT | Statusline Claude Code rapide en Rust avec un configurateur TUI interactif, une intégration git et un suivi de l'usage. |
| <a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="./catalog/images/ccstatusline.svg" width="200"></a> | [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) | MIT | Statusline Claude Code personnalisable avec un configurateur TUI interactif, un rendu powerline, des thèmes et des widgets pour les jetons, git, les minuteries de session et les liens cliquables. |
| <a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="200"></a> | [**ccusage**](https://github.com/ryoppippi/ccusage) | MIT | Analyseur d'usage de jetons et de coûts qui parse les fichiers JSONL de sessions locales Claude Code et Codex ; pas une statusline en soi, mais une source de données utile à intégrer dans une statusline. |
| <a href="https://github.com/chae-dahee/claude-buddy"><img alt="chae-dahee/claude-buddy repo preview" src="./catalog/images/chae-dahee-claude-buddy.png" width="200"></a> | [**claude-buddy**](https://github.com/chae-dahee/claude-buddy) | MIT | Animated ASCII companion that lives in the Claude Code statusline, rolled from a gacha table with 18 species, 5 rarity tiers, and stats like DEBUGGING and SNARK — levels up every 7 days. |
| <a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="./catalog/images/claude-hud.png" width="200"></a> | [**claude-hud**](https://github.com/jarrodwatts/claude-hud) | MIT | Plugin/statusline Claude Code qui affiche l'usage du contexte, les outils actifs, les sous-agents en cours, la progression des tâches et les fenêtres de limites de débit via l'API native de statusline. |
| <a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="./catalog/images/daniel3303-claude-statusline.png" width="200"></a> | [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) | MIT `(ref)` | Statusline Bash + PowerShell pour Claude Code affichant le modèle, les jetons, les limites de débit et l'état git. |
| <a href="https://github.com/danielmackay/claude-code-statusline"><img alt="danielmackay-claude-code-statusline GitHub preview" src="./catalog/images/danielmackay-claude-code-statusline.png" width="200"></a> | [**Claude Code Statusline**](https://github.com/danielmackay/claude-code-statusline) | Unspecified `(ref)` | Shell script statusline for Claude Code displaying active model, context usage, session cost, 5-hour rate-limit bar with reset time, git branch, and diff stats. |
| <a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="./catalog/images/dwillitzer-claude-statusline.png" width="200"></a> | [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) | MIT `(ref)` | Statusline Bash pour Claude Code avec comptage de jetons optionnel via Node.js + tiktoken et colorisation de modèles multi-fournisseurs (Claude, OpenAI, Gemini, Grok). |
| <a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="./catalog/images/felipeelias-claude-statusline.webp" width="200"></a> | [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) | MIT | Statusline binaire Go pour Claude Code avec une configuration par modules, des hyperliens OSC 8 et des thèmes prédéfinis (`catppuccin`, `tokyo-night`, `gruvbox-rainbow` et d'autres). |
| <a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="./catalog/images/fredrikaverpil-claudeline.png" width="200"></a> | [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) | MIT | Statusline Go minimaliste pour Claude Code distribuée comme plugin Claude Code ; la commande slash `/claudeline:setup` du plugin télécharge le binaire et patche settings.json. |
| <a href="https://github.com/Fyko/claudehud"><img alt="claudehud comfortable layout with model, tokens, rate limits" src="./catalog/images/fyko-claudehud.png" width="200"></a> | [**claudehud**](https://github.com/Fyko/claudehud) | MIT | Rust statusline for Claude Code with mmap+seqlock git daemon, ~168× faster than bash; shows model, token usage, rate limits, cost, active incidents, and dual layouts. |
| <a href="https://github.com/GerardoFC8/claude-subagent-statusline"><img alt="claude-subagent-statusline repository preview" src="./catalog/images/gerardofc8-claude-subagent-statusline.png" width="200"></a> | [**claude-subagent-statusline**](https://github.com/GerardoFC8/claude-subagent-statusline) | MIT | Claude Code statusline focused on real-time sub-agent delegation tracking — surfaces running, completed, and failed Task counters alongside model, cost, context window, elapsed time, and 5h/7d rate limits. |
| <a href="https://github.com/GregoryHo/cc-pulseline"><img alt="cc-pulseline hero" src="./catalog/images/gregoryho-cc-pulseline.png" width="200"></a> | [**cc-pulseline**](https://github.com/GregoryHo/cc-pulseline) | MIT | High-performance multi-line Claude Code statusline written in Rust with deep observability — incremental seek-based JSONL parsing, live context, cost burn rate, active tools with targets, running agents, todo progress, and per-session tracking. |
| <a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="./catalog/images/hagan-claudia-statusline.png" width="200"></a> | [**claudia-statusline**](https://github.com/hagan/claudia-statusline) | MIT | Statusline Rust pour Claude Code avec suivi de statistiques persistantes, des binaires pré-compilés pour Linux/macOS/Windows et 11 thèmes ; référencée dans la documentation officielle de Claude Code. |
| <a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="200"></a> | [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) | MIT | Traqueur d'usage de jetons rapide et local pour Claude Code et Codex ; `tu statusline` émet un résumé coût/jetons en une ligne. Disponible aussi en mode CLI, TUI et GUI. 214x plus rapide que ccusage. |
| <a href="https://github.com/haunchen/claude-code-statusline"><img alt="claude-code-statusline showing OFF-PEAK indicator with context, cost, and rate limits" src="./catalog/images/haunchen-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/haunchen/claude-code-statusline) | MIT | Cross-platform Claude Code statusline that surfaces Anthropic peak/off-peak rate-limit windows alongside context usage, session cost, and 5-hour and 7-day rate limits, so you can plan sessions around faster-burning peak hours. |
| <a href="https://github.com/ilia-pluzhnikov/claude-code-statusline"><img alt="ilia-pluzhnikov claude-code-statusline GitHub preview" src="./catalog/images/ilia-pluzhnikov-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/ilia-pluzhnikov/claude-code-statusline) | MIT | Feature-rich single-file Node.js statusline showing model, active task, git branch status, context window usage, prompt-cache hit rate, 5-hour and 7-day rate limits, and peak-hours indicator with color-coded urgency. |
| <a href="https://github.com/kamranahmedse/claude-statusline"><img alt="claude-statusline showing model, context bar, git branch, rate limits" src="./catalog/images/kamranahmedse-claude-statusline.png" width="200"></a> | [**claude-statusline (Kamran Ahmed)**](https://github.com/kamranahmedse/claude-statusline) | MIT | Statusline Claude Code minimaliste affichant le modèle, le pourcentage d'utilisation du contexte, le répertoire courant, la branche git, le minuteur de session, le niveau d'effort et les barres de limites de débit en temps réel depuis l'API Anthropic. |
| <a href="https://github.com/laveez/ccsl"><img alt="ccsl animated statusline demo" src="./catalog/images/laveez-ccsl.gif" width="200"></a> | [**ccsl**](https://github.com/laveez/ccsl) | MIT | Dense, color-coded ANSI statusline for Claude Code showing model, cost, context usage, git state, PR links, active tools, subagents, task progress, and optional API rate-limit bars. |
| <a href="https://github.com/leeguooooo/claude-code-usage-bar"><img alt="claude-statusbar live demo" src="./catalog/images/leeguooooo-claude-code-usage-bar.gif" width="200"></a> | [**claude-code-usage-bar**](https://github.com/leeguooooo/claude-code-usage-bar) | MIT | Python statusline (cs) for Claude Code that renders token usage, cost, and rate-limit windows across three styles and nine themes, backed by a background daemon and configurable via slash commands. |
| <a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="./catalog/images/lucasilverentand-claudeline.svg" width="200"></a> | [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) | MIT | Statusline Claude Code fournie sous le paquet npm `claudeline` avec des thèmes intégrés ; peut s'auto-installer dans settings.json via son option `--install`. |
| <a href="https://github.com/meros/claude-usage-statusline"><img alt="claude-usage-statusline dashboard with sparklines and ETA" src="./catalog/images/meros-claude-usage-statusline.png" width="200"></a> | [**claude-usage-statusline**](https://github.com/meros/claude-usage-statusline) | MIT | Polls the Claude API for 5-hour and 7-day window usage, persists dual-tier history locally, renders sparklines and color-coded progress bars, and projects an ETA to rate-limit with smart date/duration formatting. |
| <a href="https://github.com/mtschoen/schoen-claude-status"><img alt="schoen-claude-status showing cache hit rate and rate-limit pace projection" src="./catalog/images/mtschoen-schoen-claude-status.svg" width="200"></a> | [**schoen-claude-status**](https://github.com/mtschoen/schoen-claude-status) | MIT | Two-line statusline tracking session-wide cache hit rate, context usage, and 5-hour/weekly rate-limit pace projections with cost — all in a single-file bash + python setup. |
| <a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="./catalog/images/ndave92-claude-code-status-line.png" width="200"></a> | [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) | MIT | Statusline Rust pour Claude Code avec les informations de l'espace de travail, l'état git, le nom du modèle, l'usage du contexte, des indications de worktree, des minuteries de quota et les coûts API optionnels. |
| <a href="https://github.com/noahbclarkson/noahs-claude-statusline"><img alt="noahs-claude-statusline GitHub preview" src="./catalog/images/noahbclarkson-noahs-claude-statusline.png" width="200"></a> | [**noahs-claude-statusline**](https://github.com/noahbclarkson/noahs-claude-statusline) | null `(ref)` | Windows MSYS2 bash statusline that solves terminal-width detection via PowerShell AttachConsole process-tree walking, with a sub-cell-precision fractional progress bar rendered in eighths. |
| <a href="https://github.com/O0000-code/cc-tempo"><img alt="cc-tempo statusline screenshot" src="./catalog/images/o0000-cc-tempo.png" width="200"></a> | [**cc-tempo**](https://github.com/O0000-code/cc-tempo) | MIT | Claude Code statusline that measures real wall-clock work time parsed from transcripts, surfaces SubAgent parallel-speedup ratios, and tracks code-churn velocity via a sparkline rather than tokens or cost. |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement. |
| <a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="./catalog/images/owloops-claude-powerline.svg" width="200"></a> | [**claude-powerline**](https://github.com/Owloops/claude-powerline) | MIT | Statusline powerline de style Vim pour Claude Code avec suivi de l'usage en temps réel, intégration git et thèmes prédéfinis. |
| <a href="https://github.com/pcvelz/ccstatusline-usage"><img alt="ccstatusline-usage showing session and weekly API usage bars alongside model and git widgets" src="./catalog/images/pcvelz-ccstatusline-usage.png" width="200"></a> | [**ccstatusline-usage**](https://github.com/pcvelz/ccstatusline-usage) | MIT | Fork de ccstatusline ajoutant des widgets d'utilisation en temps réel via l'API Anthropic : barres d'utilisation session et hebdomadaire, indicateur de rythme hebdomadaire, compte à rebours de réinitialisation et routage multi-fournisseur pour les modèles locaux. |
| <a href="https://github.com/Postmodum37/simple-claude-code-statusline"><img alt="simple-claude-code-statusline two-line preview" src="./catalog/images/postmodum37-simple-claude-code-statusline.png" width="200"></a> | [**simple-claude-code-statusline**](https://github.com/Postmodum37/simple-claude-code-statusline) | MIT | Minimal, hackable two-line Claude Code statusline written in Go: row one shows model, directory, git branch with file counts and worktree, plus session lines changed; row two shows context bar, 5h and 7d rate limits, cost, and duration. |
| <a href="https://github.com/puddinging/prism-hud"><img alt="prism-hud gradient statusline preview" src="./catalog/images/puddinging-prism-hud.png" width="200"></a> | [**prism-hud**](https://github.com/puddinging/prism-hud) | MIT | Fork of jarrodwatts/claude-hud that swaps the progress bars for a per-position gradient palette — each dot has a fixed color from green (safe) through yellow to red (critical), so fill level reads at a glance across context and rate-limit windows. |
| <a href="https://github.com/RaiconY/claude-code-statusline"><img alt="claude-code-statusline repo preview" src="./catalog/images/raicony-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (RaiconY)**](https://github.com/RaiconY/claude-code-statusline) | MIT | Feature-rich, dependency-free single-file Node.js statusline for Claude Code showing model, active task, git state, context usage, prompt-cache state with TTL, and 5-hour plus 7-day Anthropic rate-limit countdowns. |
| <a href="https://github.com/RiverOfLogic/claude-code-statusline"><img alt="RiverOfLogic Powerline statusline showing model, git, context bar with warm retro colors" src="./catalog/images/riveroflogic-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (RiverOfLogic)**](https://github.com/RiverOfLogic/claude-code-statusline) | Unspecified `(ref)` | Powerline-style retro-terminal statusline for Claude Code, displaying model, git branch, output style, thinking mode, and a 10-cell context progress bar with warm earth-tone color thresholds and a live clock. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="200"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline. |
| <a href="https://github.com/rz1989s/claude-code-statusline"><img alt="claude-code-statusline Catppuccin Mocha theme screenshot" src="./catalog/images/rz1989s-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (rz1989s)**](https://github.com/rz1989s/claude-code-statusline) | MIT | Statusline Bash pour Claude Code avec 28 composants atomiques sur jusqu'à 9 lignes : infos git, suivi des coûts, état MCP, minuteur de réinitialisation de bloc, heures de prière islamiques et thèmes Catppuccin. |
| <a href="https://github.com/Shallow-dusty/horologium"><img alt="horologium repo card" src="./catalog/images/shallow-dusty-horologium.png" width="200"></a> | [**horologium**](https://github.com/Shallow-dusty/horologium) | MIT | Unified Rust binary that combines a sub-millisecond Claude Code statusline with ccusage-style JSONL log analytics; one tool renders tokens, cost, git, and 5h/7d rate limits while also producing daily, session, and block usage reports. |
| — | [**ClaudeCodeStatusBar**](https://github.com/SleighMaster99/ClaudeCodeStatusBar) | MIT | Windows-only WinForms GUI editor for Claude Code multi-line statuslines — drag-and-drop layout builder with PowerShell runtime, usage tracking, and git/context/cost widgets. |
| <a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="./catalog/images/sotayamashita-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) | MIT | Statusline Rust pour Claude Code avec une configuration de style starship et une composition par modules. |
| <a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="context-statusline showing token + cache breakdown" src="./catalog/images/thisdot-context-statusline.svg" width="200"></a> | [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) | MIT | Statusline Claude Code qui parse les transcriptions JSONL de session pour calculer les jetons d'entrée, de création de cache et de lecture de cache afin d'afficher fidèlement la fenêtre de contexte. |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM. |
| <a href="https://github.com/xuedi/claude-statusline"><img alt="xuedi/claude-statusline repo preview" src="./catalog/images/xuedi-claude-statusline.png" width="200"></a> | [**xuedi/claude-statusline**](https://github.com/xuedi/claude-statusline) | EUPL-1.2 `(ref)` | Rust-native Claude Code statusline rendering model, git, tokens, effort, and 5h/7d rate limits via a 20-cell braille progress bar in ~500 lines of safe, unsafe-forbidden code. |
| <a href="https://github.com/xyzcardiff/claude-code-statusline"><img alt="xyzcardiff claude-code-statusline repository preview" src="./catalog/images/xyzcardiff-claude-code-statusline.png" width="200"></a> | [**claude-code-statusline**](https://github.com/xyzcardiff/claude-code-statusline) | MIT | Two-line Claude Code statusline (shell) with live subagent count and background-task progress bar read from ~/.claude/jobs — second line only appears when agents or tasks are active. |

### OpenCode

| Aperçu | Nom | Licence | Description |
|---|---|---|---|
| <a href="https://github.com/Ainsley0917/opencode-token-monitor"><img alt="opencode-token-monitor repo preview" src="./catalog/images/ainsley-opencode-token-monitor.png" width="200"></a> | [**opencode-token-monitor**](https://github.com/Ainsley0917/opencode-token-monitor) | MIT | Plugin OpenCode (pas une statusline) qui enregistre les outils `token_stats` / `token_history` / `token_export` et émet des notifications toast avec la ventilation des jetons d'entrée, de sortie, de raisonnement et de cache. |
| <a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="./catalog/images/joaquinvesapa-sub-agent-statusline.webp" width="200"></a> | [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) | MIT | Plugin de barre latérale TUI OpenCode (pas un statusLine.command) qui affiche l'activité des sous-agents, le temps écoulé et l'usage des jetons/du contexte. |
| <a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="./catalog/images/markwilkening-opencode-status-line.png" width="200"></a> | [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) | MIT | Statusline légère et rapide pour OpenCode CLI. |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement. |
| <a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="./catalog/images/opencode-quota.webp" width="200"></a> | [**opencode-quota**](https://github.com/slkiser/opencode-quota) | MIT | Affichage du quota et de l'usage de jetons pour OpenCode sans pollution de la fenêtre de contexte ; prend en charge les fournisseurs OpenCode Go, Cursor, GitHub Copilot et d'autres. |
| <a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="./catalog/images/ramtinj95-opencode-tokenscope.png" width="200"></a> | [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) | MIT | Plugin OpenCode (pas une statusline) fournissant l'analyse de l'usage des jetons et des coûts pour les sessions avec des ventilations détaillées. |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM. |

### Gemini CLI

| Aperçu | Nom | Licence | Description |
|---|---|---|---|
| <a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="./catalog/images/kiriketsuki-gemini-statusline.png" width="200"></a> | [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) | Unspecified `(ref)` | Aide d'invite shell sur deux lignes pour Gemini CLI affichant le modèle, le contexte de l'espace de travail, la branche git, le nombre de tickets GitHub et la profondeur de la boîte de réception — Gemini CLI n'ayant pas de hook statusLine natif, ceci s'exécute depuis l'invite shell de l'utilisateur. |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="200"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline. |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM. |

### Codex CLI

| Aperçu | Nom | Licence | Description |
|---|---|---|---|
| <a href="https://github.com/ai-ken-git/cat-codex-statusline"><img alt="cat-codex-statusline terminal preview showing model, git branch, and context segments" src="./catalog/images/ai-ken-git-cat-codex-statusline.png" width="200"></a> | [**cat-codex-statusline (ai-ken-git)**](https://github.com/ai-ken-git/cat-codex-statusline) | MIT | Cat-themed Codex CLI statusline installer; wires built-in segments (model, git branch, context, limits) into a clean preset today, with a cat-face renderer ready to activate once Codex ships a command-backed status line hook. |
| <a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="./catalog/images/capedbitmap-codex-hud.png" width="200"></a> | [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) | PolyForm-Noncommercial-1.0.0 `(ref)` | Application macOS de barre de menus qui ingère les données de session Codex locales et recommande le prochain compte à utiliser selon le moment de réinitialisation hebdomadaire et la capacité restante. |
| <a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="200"></a> | [**ccusage**](https://github.com/ryoppippi/ccusage) | MIT | Analyseur d'usage de jetons et de coûts qui parse les fichiers JSONL de sessions locales Claude Code et Codex ; pas une statusline en soi, mais une source de données utile à intégrer dans une statusline. |
| <a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="./catalog/images/fwyc-codex-hud.png" width="200"></a> | [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) | MIT | HUD de statusline tmux en temps réel pour OpenAI Codex CLI avec l'usage de session/contexte, l'état git et la surveillance de l'activité des outils ; inclut les sous-commandes --kill / --list / --attach / --self-check. |
| <a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="200"></a> | [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) | MIT | Traqueur d'usage de jetons rapide et local pour Claude Code et Codex ; `tu statusline` émet un résumé coût/jetons en une ligne. Disponible aussi en mode CLI, TUI et GUI. 214x plus rapide que ccusage. |
| <a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="200"></a> | [**Open Island**](https://github.com/octane0411/open-vibe-island) | GPL-3.0 `(ref)` | Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement. |
| <a href="https://github.com/robertogogoni/aifuel"><img alt="aifuel fuel pump logo" src="./catalog/images/robertogogoni-aifuel.png" width="200"></a> | [**aifuel**](https://github.com/robertogogoni/aifuel) | MIT | Go-based multi-provider AI usage monitor (Claude, Codex, Gemini, Copilot, Antigravity) that surfaces rate limits, cost, and peak-hour analytics across a waybar module, Chrome extension, Bubble Tea TUI, Admin API dashboard, and a compact Claude Code statusline. |
| <a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="200"></a> | [**tokscale**](https://github.com/junhoyeo/tokscale) | MIT | Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM. |

<!-- catalog:end -->

## CLI du catalogue

```sh
node bin/statuslines.js list                          # toutes les entrées
node bin/statuslines.js list --cli=claude --redistributable
node bin/statuslines.js show ccstatusline             # métadonnées complètes
node bin/statuslines.js configure ccstatusline --cli=claude --dry-run
node bin/statuslines.js configure ccstatusline --cli=claude
node bin/statuslines.js doctor                        # valide chaque entrée
node bin/statuslines.js render-readme                 # régénère catalog/README.md
node bin/statuslines.js render-top-readme             # régénère ce fichier
```

`configure` ignore les entrées dont la licence n'est pas redistribuable ;
celles-ci restent listées pour référence uniquement.

## Déclinaisons embarquées

Une statusline de référence vit aux côtés du catalogue : `pup/`, qui fait
remonter la santé des événements Datadog dans la barre.

### pup — observabilité Datadog

Fait remonter les **événements** récents issus de
[datadog-labs/pup](https://github.com/datadog-labs/pup) (5 dernières
minutes par défaut), groupés par `alert_type`.

Les statuslines pup n'appellent jamais `pup` depuis le chemin de rendu.
Elles lisent un cache contrôlé par TTL :

1. Le rendu lit `${TMPDIR}/statuslines-pup-events.json`.
2. Si le cache est **plus frais que `ttl_seconds`** (par défaut 60 s), il
   est utilisé tel quel.
3. S'il est obsolète, le rendu acquiert un fichier de verrouillage
   (`O_EXCL`) ; si un autre rendu détient le verrou, il attend ≤ 250 ms
   puis se rabat sur le cache obsolète plutôt que de mettre en file
   d'attente plus d'appels API.
4. Le détenteur du verrou exécute
   `pup events list --duration 5m --output json` une fois, écrit le
   résultat de manière atomique, libère le verrou.
5. Les erreurs (auth, rate-limit, ENOENT) sont écrites dans le cache et
   remontées dans la barre (`pup:auth?`, `pup:rate-limited`,
   `pup:not installed`) — pas de tempête de retries.
6. Chaque récupération est journalisée dans `${TMPDIR}/statuslines-pup.log`.

L'âge du cache est affiché dans la barre (par exemple
`pup:✓3 ⚠1 ✗0 (45s)`) ; au-delà de 5 min il est marqué `(stale)` et grisé.

#### Configuration

`~/.config/statuslines/pup.json` (ou variables d'environnement
`STATUSLINES_PUP_*`) :

| clé | défaut | sens |
|---|---|---|
| `ttl_seconds` | `60` | secondes minimum entre deux appels `pup` |
| `duration` | `"5m"` | fenêtre transmise à `pup events list --duration` |
| `tags` | `null` | transmis comme `--tags` |
| `priority` | `null` | `normal` / `low` |
| `alert_type` | `null` | `error` / `warning` / `info` / `success` / `user_update` |
| `sources` | `null` | transmis comme `--sources` |
| `max_events` | `50` | transmis comme `--limit` |
| `pup_bin` | `"pup"` | écrase le chemin du binaire |

Un fichier de démarrage vit à `examples/pup.config.json`. Initialisez-le
avec `./install/install-pup.sh --seed-config`.

#### Démarrage rapide (pup)

```sh
brew tap datadog-labs/pack && brew install datadog-labs/pack/pup
pup auth login
./install/install-pup.sh --all --seed-config
node ./pup/cli.js fetch    # préchauffe le cache
node ./pup/cli.js show     # aperçoit le segment
tmux new-session -d -s codex 'node ./pup/codex/hud.js watch'
```

## Matrice de prise en charge

| CLI | Statusline personnalisée | Hook après-outil | Approche |
|---|---|---|---|
| Claude Code | oui (`statusLine.command`) | oui (`PostToolUse`) | `pup/claude/statusline.js` + `context-monitor.js` |
| OpenCode | oui (`statusLine.command`) | oui (plugin `tool.execute.after`) | `pup/opencode/statusline.js` + `context-monitor.js` |
| Gemini CLI | **non** ([#8191](https://github.com/google-gemini/gemini-cli/issues/8191)) | oui (`AfterTool`) | non livré dans le dépôt (voir le catalogue pour des options tierces) |
| Codex CLI | seulement les éléments intégrés ([#14043](https://github.com/openai/codex/issues/14043), [#17827](https://github.com/openai/codex/issues/17827)) | oui (`~/.codex/hooks/`) | démon HUD externe — `pup/codex/hud.js` |

## Arborescence

```
lib/                aides partagées (bar, couleurs, git, fichier-pont, garde stdin)
catalog/            entrées tierces — un JSON par slug, par CLI
  claude/           cibles Claude Code
  opencode/         cibles OpenCode
  gemini/           cibles Gemini CLI
  codex/            cibles Codex CLI
  multi/            entrées qui ciblent plusieurs CLIs
pup/                déclinaison observabilité Datadog
examples/           extraits de configuration à coller, par CLI
install/            scripts d'installation
bin/                CLI du catalogue (list/show/configure/doctor/render-{readme,top-readme})
```

## Contribuer

Pour ajouter une entrée au catalogue :

1. Vérifiez la licence amont sur le dépôt (consultez le fichier
   `LICENSE`, pas le badge du README). Si le dépôt n'a pas de fichier
   LICENSE, mettez `redistributable: false` et traitez comme listé pour
   référence.
2. Confirmez que le chemin d'installation fonctionne réellement (le
   paquet npm existe, la formule brew se résout, etc.). Une vérification
   indépendante vaut mieux que la confiance dans une affirmation du
   README.
3. Rédigez une description d'une phrase avec vos propres mots — ne
   collez pas depuis l'amont.
4. Déposez le JSON à `catalog/<cli>/<slug>.json` (ou `catalog/multi/`
   pour les entrées multi-CLI).
5. Exécutez `node bin/statuslines.js doctor` pour valider, puis
   `node bin/statuslines.js render-readme` et
   `node bin/statuslines.js render-top-readme` pour rafraîchir les
   tables générées.
6. Ouvrez une PR.

Le schéma complet et les règles champ par champ vivent dans
[`catalog/SCHEMA.md`](catalog/SCHEMA.md). Les entrées copyleft (AGPL,
GPL) et source-disponible (PolyForm-NC, BSL) sont les bienvenues — elles
sont listées avec le tag `(ref)` et ignorées par `configure`.

## Liens connexes

Listes organisées qui méritent d'être connues — lien uniquement, sans
copie :

- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
  — skills, hooks, slash-commands, agents et statuslines pour Claude Code.
- [awesome-opencode/awesome-opencode](https://github.com/awesome-opencode/awesome-opencode)
  — plugins, thèmes, agents et projets pour OpenCode.

## Feuille de route

Livré :

- Motif context-health sur les quatre CLIs pris en charge.
- Configurations d'exemple et scripts d'installation.
- Déclinaison Datadog `pup/` avec cache contrôlé par TTL et
  récupérations coordonnées par fichier de verrouillage.
- Catalogue de statuslines tierces avec les commandes `list` / `show` /
  `configure` / `doctor` / `audit`.
- Durcissement de la chaîne d'approvisionnement au niveau du schéma :
  versions épinglées et empreintes d'intégrité, refus des motifs
  `curl|sh` / `eval(` / `@latest`, `--ignore-scripts` par défaut sur les
  recettes `npx` / `npm-global`.
- Quarantaine OpenBSD-style : les entrées signalées disparaissent de
  `list` / `show` / `configure` et des READMEs rendus ; la trace
  forensique vit dans `catalog/QUARANTINE.md`.
- Sonde de vivacité quotidienne (correspondance dépôt + version registre
  npm + dérive de licence) et flux hebdomadaire Socket.dev des paquets
  malveillants.
- Workflows Datadog SAST / SCA / SAIST, gardés par secret pour que le
  dépôt soit sûr à forker avant l'arrivée des clés.
- Déclarations de capacités par entrée (`network`, `child_process`,
  `filesystem_write`, `env_read`) avec vérification en bac à sable sous
  firejail + strace.
- Sonde de provenance de build SLSA et re-vérification hebdomadaire des
  fichiers de verrouillage des dépendances transitives sur chaque entrée
  redistribuable adossée à npm.

Prochain :

- Bot de diff de tarball sur chaque PR de montée de version.
- Signature hybride Ed25519 + SLH-DSA sur les entrées du catalogue.
- Segments `pup/` plus riches (monitors, incidents) derrière des drapeaux
  d'opt-in.

## Licence

MIT

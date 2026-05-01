# statuslines

**Langues :** [English](./README.md) · Français · [日本語](./README.ja.md)

> Un catalogue organisé de statuslines pour Claude Code, OpenCode, Gemini CLI
> et Codex CLI — plus une déclinaison de référence embarquée dans le dépôt
> (`pup/`) reliée à Datadog.

*Un seul motif, quatre CLIs d'agents, des dizaines de statuslines.*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-24-orange)
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

- [**b-open-io/statusline**](https://github.com/b-open-io/statusline) — MIT — Claude Code statusline that auto-detects the active model's context window (1M for [1m] suffixed models, 200k otherwise) with widgets for tokens, git, and a 5-hour block timer.
- [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) — MIT — Fast Rust-based Claude Code statusline with an interactive TUI configurator, git integration, and usage tracking.
- [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) — MIT — Customizable Claude Code statusline with an interactive TUI configurator, powerline rendering, themes, and widgets for tokens, git, session timers, and clickable links.
- [**ccusage**](https://github.com/ryoppippi/ccusage) — MIT — Token-usage and cost analyzer that parses local Claude Code and Codex session JSONL files; not a statusline itself, but a useful data source to compose into one.
- [**claude-hud**](https://github.com/jarrodwatts/claude-hud) — MIT — Claude Code plugin/statusline that surfaces context usage, active tools, running subagents, todo progress, and rate-limit windows using the native statusline API.
- [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) — MIT `(ref)` — Bash + PowerShell statusline for Claude Code showing model, tokens, rate limits, and git status.
- [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) — MIT `(ref)` — Bash statusline for Claude Code with optional Node.js + tiktoken token counting and multi-provider model coloring (Claude, OpenAI, Gemini, Grok).
- [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) — MIT — Go binary statusline for Claude Code with module-based config, OSC 8 hyperlinks, and theme presets (catppuccin, tokyo-night, gruvbox-rainbow, and others).
- [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) — MIT — Minimalistic Go statusline for Claude Code distributed as a Claude Code plugin; the plugin's `/claudeline:setup` slash command downloads the binary and patches settings.json.
- [**claudia-statusline**](https://github.com/hagan/claudia-statusline) — MIT — Rust statusline for Claude Code with persistent stats tracking, prebuilt binaries for Linux/macOS/Windows, and 11 themes; referenced by the official Claude Code docs.
- [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) — MIT — Claude Code statusline shipped as the npm package `claudeline` with built-in themes; can self-install into settings.json via its `--install` flag.
- [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) — MIT — Rust statusline for Claude Code with workspace info, git status, model name, context usage, worktree hints, quota timers, and optional API costs.
- [**claude-powerline**](https://github.com/Owloops/claude-powerline) — MIT — Vim-style powerline statusline for Claude Code with real-time usage tracking, git integration, and theme presets.
- [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) — MIT — Rust statusline for Claude Code with starship-like configuration and module-based composition.
- [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) — MIT — Claude Code statusline that parses session JSONL transcripts to compute input + cache-creation + cache-read tokens for an accurate context-window display.
- [**tokscale**](https://github.com/junhoyeo/tokscale) — MIT — Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

### OpenCode

- [**opencode-token-monitor**](https://github.com/Ainsley0917/opencode-token-monitor) — MIT — OpenCode plugin (not a statusline) that registers `token_stats` / `token_history` / `token_export` tools and emits toast notifications with input, output, reasoning, and cache token breakdowns.
- [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) — MIT — OpenCode TUI sidebar plugin (not a statusLine.command line) that shows subagent activity, elapsed time, and token/context usage.
- [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) — MIT — Lightweight, fast status line for OpenCode CLI.
- [**opencode-quota**](https://github.com/slkiser/opencode-quota) — MIT — OpenCode quota and token-usage display with zero context-window pollution; supports providers including OpenCode Go, Cursor, GitHub Copilot, and others.
- [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) — MIT — OpenCode plugin (not a statusline) providing token usage and cost analysis for sessions with detailed breakdowns.
- [**tokscale**](https://github.com/junhoyeo/tokscale) — MIT — Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

### Gemini CLI

- [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) — Unspecified `(ref)` — Two-line shell-prompt helper for Gemini CLI showing model, workspace context, git branch, GitHub issue counts, and inbox depth — Gemini CLI has no native statusLine hook so this runs from the user's shell prompt.
- [**tokscale**](https://github.com/junhoyeo/tokscale) — MIT — Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

### Codex CLI

- [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) — PolyForm-Noncommercial-1.0.0 `(ref)` — macOS menu-bar app that ingests local Codex session data and recommends the next account to use based on weekly reset timing and remaining capacity.
- [**ccusage**](https://github.com/ryoppippi/ccusage) — MIT — Token-usage and cost analyzer that parses local Claude Code and Codex session JSONL files; not a statusline itself, but a useful data source to compose into one.
- [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) — MIT — Real-time tmux statusline HUD for OpenAI Codex CLI with session/context usage, git status, and tool-activity monitoring; includes --kill / --list / --attach / --self-check subcommands.
- [**tokscale**](https://github.com/junhoyeo/tokscale) — MIT — Cross-CLI token-usage tracker that reads local session data from many AI coding tools (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, and more) with LiteLLM-fed pricing.

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

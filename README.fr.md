# statuslines

**Langues :** [English](./README.md) · Français · [日本語](./README.ja.md)

> Un catalogue organisé de statuslines pour Claude Code, OpenCode, Gemini CLI
> et Codex CLI — plus une déclinaison de référence embarquée dans le dépôt
> (`pup/`) reliée à Datadog.

*Un seul motif, quatre CLIs d'agents, des dizaines de statuslines.*

![license: MIT](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
<!-- count:start -->
![entries](https://img.shields.io/badge/catalog%20entries-28-orange)
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

#### [**CCometixLine**](https://github.com/Haleclipse/CCometixLine) · MIT

<a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="./catalog/images/ccometixline.png" width="800"></a>

Statusline Claude Code rapide en Rust avec un configurateur TUI interactif, une intégration git et un suivi de l'usage.

#### [**ccstatusline**](https://github.com/sirmalloc/ccstatusline) · MIT

<a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="./catalog/images/ccstatusline.svg" width="800"></a>

Statusline Claude Code personnalisable avec un configurateur TUI interactif, un rendu powerline, des thèmes et des widgets pour les jetons, git, les minuteries de session et les liens cliquables.

#### [**ccusage**](https://github.com/ryoppippi/ccusage) · MIT

<a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="800"></a>

Analyseur d'usage de jetons et de coûts qui parse les fichiers JSONL de sessions locales Claude Code et Codex ; pas une statusline en soi, mais une source de données utile à intégrer dans une statusline.

#### [**claude-hud**](https://github.com/jarrodwatts/claude-hud) · MIT

<a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="./catalog/images/claude-hud.png" width="800"></a>

Plugin/statusline Claude Code qui affiche l'usage du contexte, les outils actifs, les sous-agents en cours, la progression des tâches et les fenêtres de limites de débit via l'API native de statusline.

#### [**ClaudeCodeStatusLine (Daniel Graczer)**](https://github.com/daniel3303/ClaudeCodeStatusLine) · MIT `(ref)`

<a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="./catalog/images/daniel3303-claude-statusline.png" width="800"></a>

Statusline Bash + PowerShell pour Claude Code affichant le modèle, les jetons, les limites de débit et l'état git.

#### [**claude-statusline (dwillitzer)**](https://github.com/dwillitzer/claude-statusline) · MIT `(ref)`

<a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="./catalog/images/dwillitzer-claude-statusline.png" width="800"></a>

Statusline Bash pour Claude Code avec comptage de jetons optionnel via Node.js + tiktoken et colorisation de modèles multi-fournisseurs (Claude, OpenAI, Gemini, Grok).

#### [**claude-statusline (Felipe Elias)**](https://github.com/felipeelias/claude-statusline) · MIT

<a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="./catalog/images/felipeelias-claude-statusline.webp" width="800"></a>

Statusline binaire Go pour Claude Code avec une configuration par modules, des hyperliens OSC 8 et des thèmes prédéfinis (`catppuccin`, `tokyo-night`, `gruvbox-rainbow` et d'autres).

#### [**claudeline (Fredrik Averpil)**](https://github.com/fredrikaverpil/claudeline) · MIT

<a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="./catalog/images/fredrikaverpil-claudeline.png" width="800"></a>

Statusline Go minimaliste pour Claude Code distribuée comme plugin Claude Code ; la commande slash `/claudeline:setup` du plugin télécharge le binaire et patche settings.json.

#### [**claudia-statusline**](https://github.com/hagan/claudia-statusline) · MIT

<a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="./catalog/images/hagan-claudia-statusline.png" width="800"></a>

Statusline Rust pour Claude Code avec suivi de statistiques persistantes, des binaires pré-compilés pour Linux/macOS/Windows et 11 thèmes ; référencée dans la documentation officielle de Claude Code.

#### [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) · MIT

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="800"></a>

Traqueur d'usage de jetons rapide et local pour Claude Code et Codex ; `tu statusline` émet un résumé coût/jetons en une ligne. Disponible aussi en mode CLI, TUI et GUI. 214x plus rapide que ccusage.

#### [**claude-statusline (Kamran Ahmed)**](https://github.com/kamranahmedse/claude-statusline) · MIT

<a href="https://github.com/kamranahmedse/claude-statusline"><img alt="claude-statusline showing model, context bar, git branch, rate limits" src="./catalog/images/kamranahmedse-claude-statusline.png" width="800"></a>

Statusline Claude Code minimaliste affichant le modèle, le pourcentage d'utilisation du contexte, le répertoire courant, la branche git, le minuteur de session, le niveau d'effort et les barres de limites de débit en temps réel depuis l'API Anthropic.

#### [**claudeline (Luca Silverentand)**](https://github.com/lucasilverentand/claudeline) · MIT

<a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="./catalog/images/lucasilverentand-claudeline.svg" width="800"></a>

Statusline Claude Code fournie sous le paquet npm `claudeline` avec des thèmes intégrés ; peut s'auto-installer dans settings.json via son option `--install`.

#### [**claude-code-status-line (ndave92)**](https://github.com/ndave92/claude-code-status-line) · MIT

<a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="./catalog/images/ndave92-claude-code-status-line.png" width="800"></a>

Statusline Rust pour Claude Code avec les informations de l'espace de travail, l'état git, le nom du modèle, l'usage du contexte, des indications de worktree, des minuteries de quota et les coûts API optionnels.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement.

#### [**claude-powerline**](https://github.com/Owloops/claude-powerline) · MIT

<a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="./catalog/images/owloops-claude-powerline.svg" width="800"></a>

Statusline powerline de style Vim pour Claude Code avec suivi de l'usage en temps réel, intégration git et thèmes prédéfinis.

#### [**ccstatusline-usage**](https://github.com/pcvelz/ccstatusline-usage) · MIT

<a href="https://github.com/pcvelz/ccstatusline-usage"><img alt="ccstatusline-usage showing session and weekly API usage bars alongside model and git widgets" src="./catalog/images/pcvelz-ccstatusline-usage.png" width="800"></a>

Fork de ccstatusline ajoutant des widgets d'utilisation en temps réel via l'API Anthropic : barres d'utilisation session et hebdomadaire, indicateur de rythme hebdomadaire, compte à rebours de réinitialisation et routage multi-fournisseur pour les modèles locaux.

#### [**claude-code-statusline (rz1989s)**](https://github.com/rz1989s/claude-code-statusline) · MIT

<a href="https://github.com/rz1989s/claude-code-statusline"><img alt="claude-code-statusline Catppuccin Mocha theme screenshot" src="./catalog/images/rz1989s-claude-code-statusline.png" width="800"></a>

Statusline Bash pour Claude Code avec 28 composants atomiques sur jusqu'à 9 lignes : infos git, suivi des coûts, état MCP, minuteur de réinitialisation de bloc, heures de prière islamiques et thèmes Catppuccin.

#### [**claude-code-statusline (Sam Yamashita)**](https://github.com/sotayamashita/claude-code-statusline) · MIT

<a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="./catalog/images/sotayamashita-claude-code-statusline.png" width="800"></a>

Statusline Rust pour Claude Code avec une configuration de style starship et une composition par modules.

#### [**@this-dot/claude-code-context-status-line**](https://github.com/thisdot/claude-code-context-status-line) · MIT

<a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="context-statusline showing token + cache breakdown" src="./catalog/images/thisdot-context-statusline.svg" width="800"></a>

Statusline Claude Code qui parse les transcriptions JSONL de session pour calculer les jetons d'entrée, de création de cache et de lecture de cache afin d'afficher fidèlement la fenêtre de contexte.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM.

### OpenCode

#### [**opencode-token-monitor**](https://github.com/Ainsley0917/opencode-token-monitor) · MIT

<a href="https://github.com/Ainsley0917/opencode-token-monitor"><img alt="opencode-token-monitor repo preview" src="./catalog/images/ainsley-opencode-token-monitor.png" width="800"></a>

Plugin OpenCode (pas une statusline) qui enregistre les outils `token_stats` / `token_history` / `token_export` et émet des notifications toast avec la ventilation des jetons d'entrée, de sortie, de raisonnement et de cache.

#### [**opencode-subagent-statusline**](https://github.com/Joaquinvesapa/sub-agent-statusline) · MIT

<a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="./catalog/images/joaquinvesapa-sub-agent-statusline.webp" width="800"></a>

Plugin de barre latérale TUI OpenCode (pas un statusLine.command) qui affiche l'activité des sous-agents, le temps écoulé et l'usage des jetons/du contexte.

#### [**opencode-status-line**](https://github.com/markwilkening21/opencode-status-line) · MIT

<a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="./catalog/images/markwilkening-opencode-status-line.png" width="800"></a>

Statusline légère et rapide pour OpenCode CLI.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement.

#### [**opencode-quota**](https://github.com/slkiser/opencode-quota) · MIT

<a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="./catalog/images/opencode-quota.webp" width="800"></a>

Affichage du quota et de l'usage de jetons pour OpenCode sans pollution de la fenêtre de contexte ; prend en charge les fournisseurs OpenCode Go, Cursor, GitHub Copilot et d'autres.

#### [**opencode-tokenscope**](https://github.com/ramtinJ95/opencode-tokenscope) · MIT

<a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="./catalog/images/ramtinj95-opencode-tokenscope.png" width="800"></a>

Plugin OpenCode (pas une statusline) fournissant l'analyse de l'usage des jetons et des coûts pour les sessions avec des ventilations détaillées.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM.

### Gemini CLI

#### [**gemini-statusline**](https://github.com/Kiriketsuki/gemini-statusline) · Unspecified `(ref)`

<a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="./catalog/images/kiriketsuki-gemini-statusline.png" width="800"></a>

Aide d'invite shell sur deux lignes pour Gemini CLI affichant le modèle, le contexte de l'espace de travail, la branche git, le nombre de tickets GitHub et la profondeur de la boîte de réception — Gemini CLI n'ayant pas de hook statusLine natif, ceci s'exécute depuis l'invite shell de l'utilisateur.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM.

### Codex CLI

#### [**codex-hud (Capedbitmap)**](https://github.com/Capedbitmap/codex-hud) · PolyForm-Noncommercial-1.0.0 `(ref)`

<a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="./catalog/images/capedbitmap-codex-hud.png" width="800"></a>

Application macOS de barre de menus qui ingère les données de session Codex locales et recommande le prochain compte à utiliser selon le moment de réinitialisation hebdomadaire et la capacité restante.

#### [**ccusage**](https://github.com/ryoppippi/ccusage) · MIT

<a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="./catalog/images/ccusage.png" width="800"></a>

Analyseur d'usage de jetons et de coûts qui parse les fichiers JSONL de sessions locales Claude Code et Codex ; pas une statusline en soi, mais une source de données utile à intégrer dans une statusline.

#### [**codex-hud (fwyc0573)**](https://github.com/fwyc0573/codex-hud) · MIT

<a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="./catalog/images/fwyc-codex-hud.png" width="800"></a>

HUD de statusline tmux en temps réel pour OpenAI Codex CLI avec l'usage de session/contexte, l'état git et la surveillance de l'activité des outils ; inclut les sous-commandes --kill / --list / --attach / --self-check.

#### [**tokenusage (hanbu97)**](https://github.com/hanbu97/tokenusage) · MIT

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="./catalog/images/hanbu97-tokenusage.png" width="800"></a>

Traqueur d'usage de jetons rapide et local pour Claude Code et Codex ; `tu statusline` émet un résumé coût/jetons en une ligne. Disponible aussi en mode CLI, TUI et GUI. 214x plus rapide que ccusage.

#### [**Open Island**](https://github.com/octane0411/open-vibe-island) · GPL-3.0 `(ref)`

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="./catalog/images/octane0411-open-vibe-island.gif" width="800"></a>

Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement.

#### [**tokscale**](https://github.com/junhoyeo/tokscale) · MIT

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="./catalog/images/tokscale.webp" width="800"></a>

Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM.

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

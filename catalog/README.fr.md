# Catalogue

**Langues :** [English](./README.md) · Français · [日本語](./README.ja.md)

Statuslines tierces et outils apparentés pour Claude Code, OpenCode, Gemini CLI et Codex CLI. Généré depuis `catalog/<cli>/<slug>.json` — ne pas éditer à la main.

Légende : **ok** = licence OSI-permissive, recettes d'installation/configuration livrées. **ref** = listé pour référence ; installer selon les instructions amont.

| Slug | Nom | Cibles | Licence | Langage | Statut | Installation |
|---|---|---|---|---|---|---|
| `ainsley-opencode-token-monitor` | [opencode-token-monitor](https://github.com/Ainsley0917/opencode-token-monitor) | opencode | MIT | typescript | ok | opencode-plugin |
| `capedbitmap-codex-hud` | [codex-hud (Capedbitmap)](https://github.com/Capedbitmap/codex-hud) | codex | PolyForm-Noncommercial-1.0.0 | swift | ref | manual |
| `ccometixline` | [CCometixLine](https://github.com/Haleclipse/CCometixLine) | claude | MIT | rust | ok | manual |
| `ccstatusline` | [ccstatusline](https://github.com/sirmalloc/ccstatusline) | claude | MIT | typescript | ok | npx |
| `ccusage` | [ccusage](https://github.com/ryoppippi/ccusage) | claude, codex | MIT | typescript | ok | npx |
| `claude-hud` | [claude-hud](https://github.com/jarrodwatts/claude-hud) | claude | MIT | typescript | ok | manual |
| `daniel3303-claude-statusline` | [ClaudeCodeStatusLine (Daniel Graczer)](https://github.com/daniel3303/ClaudeCodeStatusLine) | claude | MIT | shell | ref | manual |
| `dwillitzer-claude-statusline` | [claude-statusline (dwillitzer)](https://github.com/dwillitzer/claude-statusline) | claude | MIT | shell | ref | manual |
| `felipeelias-claude-statusline` | [claude-statusline (Felipe Elias)](https://github.com/felipeelias/claude-statusline) | claude | MIT | go | ok | brew |
| `fredrikaverpil-claudeline` | [claudeline (Fredrik Averpil)](https://github.com/fredrikaverpil/claudeline) | claude | MIT | go | ok | manual |
| `fwyc-codex-hud` | [codex-hud (fwyc0573)](https://github.com/fwyc0573/codex-hud) | codex | MIT | typescript | ok | manual |
| `hagan-claudia-statusline` | [claudia-statusline](https://github.com/hagan/claudia-statusline) | claude | MIT | rust | ok | manual |
| `hanbu97-tokenusage` | [tokenusage (hanbu97)](https://github.com/hanbu97/tokenusage) | claude, codex | MIT | rust | ok | npx |
| `joaquinvesapa-sub-agent-statusline` | [opencode-subagent-statusline](https://github.com/Joaquinvesapa/sub-agent-statusline) | opencode | MIT | typescript | ok | opencode-plugin |
| `kamranahmedse-claude-statusline` | [claude-statusline (Kamran Ahmed)](https://github.com/kamranahmedse/claude-statusline) | claude | MIT | shell | ok | npx |
| `kiriketsuki-gemini-statusline` | [gemini-statusline](https://github.com/Kiriketsuki/gemini-statusline) | gemini | Unspecified | shell | ref | manual |
| `lucasilverentand-claudeline` | [claudeline (Luca Silverentand)](https://github.com/lucasilverentand/claudeline) | claude | MIT | typescript | ok | npx |
| `markwilkening-opencode-status-line` | [opencode-status-line](https://github.com/markwilkening21/opencode-status-line) | opencode | MIT | shell | ok | git |
| `ndave92-claude-code-status-line` | [claude-code-status-line (ndave92)](https://github.com/ndave92/claude-code-status-line) | claude | MIT | rust | ok | manual |
| `octane0411-open-vibe-island` | [Open Island](https://github.com/octane0411/open-vibe-island) | claude, codex, gemini, opencode | GPL-3.0 | swift | ref | manual |
| `opencode-quota` | [opencode-quota](https://github.com/slkiser/opencode-quota) | opencode | MIT | typescript | ok | manual |
| `owloops-claude-powerline` | [claude-powerline](https://github.com/Owloops/claude-powerline) | claude | MIT | typescript | ok | npx |
| `pcvelz-ccstatusline-usage` | [ccstatusline-usage](https://github.com/pcvelz/ccstatusline-usage) | claude | MIT | typescript | ok | npx |
| `ramtinj95-opencode-tokenscope` | [opencode-tokenscope](https://github.com/ramtinJ95/opencode-tokenscope) | opencode | MIT | typescript | ok | opencode-plugin |
| `rz1989s-claude-code-statusline` | [claude-code-statusline (rz1989s)](https://github.com/rz1989s/claude-code-statusline) | claude | MIT | bash | ok | manual |
| `sotayamashita-claude-code-statusline` | [claude-code-statusline (Sam Yamashita)](https://github.com/sotayamashita/claude-code-statusline) | claude | MIT | rust | ok | manual |
| `thisdot-context-statusline` | [@this-dot/claude-code-context-status-line](https://github.com/thisdot/claude-code-context-status-line) | claude | MIT | typescript | ok | npx |
| `tokscale` | [tokscale](https://github.com/junhoyeo/tokscale) | claude, opencode, gemini, codex | MIT | typescript | ok | npx |

## Détail par entrée

### `ainsley-opencode-token-monitor` — [opencode-token-monitor](https://github.com/Ainsley0917/opencode-token-monitor)

<a href="https://github.com/Ainsley0917/opencode-token-monitor"><img alt="opencode-token-monitor repo preview" src="images/ainsley-opencode-token-monitor.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** opencode
- **Description:** Plugin OpenCode (pas une statusline) qui enregistre les outils `token_stats` / `token_history` / `token_export` et émet des notifications toast avec la ventilation des jetons d'entrée, de sortie, de raisonnement et de cache.
- **Notes:** Listed in the catalog because it complements an OpenCode statusline rather than replacing one — its output is tool results and toasts, not a `statusLine.command` line. OpenCode loads it from npm at session start once the `plugin` array is configured.
- **Installation:** OpenCode charge `opencode-token-monitor@0.5.0` depuis npm au démarrage de la session (ajouté via le tableau `plugin` de `opencode.json`)
- **Configurer:** `node bin/statuslines.js configure ainsley-opencode-token-monitor --cli=<opencode>`

### `capedbitmap-codex-hud` — [codex-hud (Capedbitmap)](https://github.com/Capedbitmap/codex-hud)

<a href="https://github.com/Capedbitmap/codex-hud"><img alt="codex-hud menu bar with account status" src="images/capedbitmap-codex-hud.png" width="480"></a>

- **Licence:** PolyForm-Noncommercial-1.0.0 (non redistribuable ; pour référence uniquement)
- **Cibles:** codex
- **Description:** Application macOS de barre de menus qui ingère les données de session Codex locales et recommande le prochain compte à utiliser selon le moment de réinitialisation hebdomadaire et la capacité restante.
- **Notes:** Source-available, not OSI-open-source. Listed for reference; we don't ship install recipes for non-redistributable entries.
- **Installation:** voir en amont

### `ccometixline` — [CCometixLine](https://github.com/Haleclipse/CCometixLine)

<a href="https://github.com/Haleclipse/CCometixLine"><img alt="CCometixLine statusline screenshot" src="images/ccometixline.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Claude Code rapide en Rust avec un configurateur TUI interactif, une intégration git et un suivi de l'usage.
- **Notes:** No verified package-manager install; follow upstream build/release instructions.
- **Installation:** voir en amont

### `ccstatusline` — [ccstatusline](https://github.com/sirmalloc/ccstatusline)

<a href="https://github.com/sirmalloc/ccstatusline"><img alt="ccstatusline — model, context tokens, git branch segments" src="images/ccstatusline.svg" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Claude Code personnalisable avec un configurateur TUI interactif, un rendu powerline, des thèmes et des widgets pour les jetons, git, les minuteries de session et les liens cliquables.
- **Installation:** `npx --ignore-scripts -y ccstatusline@2.2.12`
- **Configurer:** `node bin/statuslines.js configure ccstatusline --cli=<claude>`

### `ccusage` — [ccusage](https://github.com/ryoppippi/ccusage)

<a href="https://github.com/ryoppippi/ccusage"><img alt="ccusage terminal screenshot" src="images/ccusage.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude, codex
- **Description:** Analyseur d'usage de jetons et de coûts qui parse les fichiers JSONL de sessions locales Claude Code et Codex ; pas une statusline en soi, mais une source de données utile à intégrer dans une statusline.
- **Notes:** Run `npx -y ccusage@latest` for daily/monthly/session reports; pipe into a custom statusline for richer cost segments.
- **Installation:** `npx --ignore-scripts -y ccusage@18.0.11`

### `claude-hud` — [claude-hud](https://github.com/jarrodwatts/claude-hud)

<a href="https://github.com/jarrodwatts/claude-hud"><img alt="claude-hud in action" src="images/claude-hud.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Plugin/statusline Claude Code qui affiche l'usage du contexte, les outils actifs, les sous-agents en cours, la progression des tâches et les fenêtres de limites de débit via l'API native de statusline.
- **Notes:** Distributed as a Claude Code plugin; see upstream README for the current install command.
- **Installation:** voir en amont

### `daniel3303-claude-statusline` — [ClaudeCodeStatusLine (Daniel Graczer)](https://github.com/daniel3303/ClaudeCodeStatusLine)

<a href="https://github.com/daniel3303/ClaudeCodeStatusLine"><img alt="Status line showing model, tokens, rate limits" src="images/daniel3303-claude-statusline.png" width="480"></a>

- **Licence:** MIT (non redistribuable ; pour référence uniquement)
- **Cibles:** claude
- **Description:** Statusline Bash + PowerShell pour Claude Code affichant le modèle, les jetons, les limites de débit et l'état git.
- **Notes:** README declares MIT but the repo has no LICENSE file at the canonical paths as of catalog verification on 2026-04-30, so we treat it as license-unverified and don't ship an automated install. Upstream install: clone into ~/.claude/statusline/ and point statusLine.command at statusline.sh — see upstream INSTALL.md.
- **Installation:** voir en amont

### `dwillitzer-claude-statusline` — [claude-statusline (dwillitzer)](https://github.com/dwillitzer/claude-statusline)

<a href="https://github.com/dwillitzer/claude-statusline"><img alt="claude-statusline repo preview" src="images/dwillitzer-claude-statusline.png" width="480"></a>

- **Licence:** MIT (non redistribuable ; pour référence uniquement)
- **Cibles:** claude
- **Description:** Statusline Bash pour Claude Code avec comptage de jetons optionnel via Node.js + tiktoken et colorisation de modèles multi-fournisseurs (Claude, OpenAI, Gemini, Grok).
- **Notes:** README claims MIT but no LICENSE file is present at catalog verification on 2026-04-30. README's clone command also uses a literal `<repository-url>` placeholder rather than this repo's URL — substitute manually.
- **Installation:** voir en amont

### `felipeelias-claude-statusline` — [claude-statusline (Felipe Elias)](https://github.com/felipeelias/claude-statusline)

<a href="https://github.com/felipeelias/claude-statusline"><img alt="claude-statusline demo screenshot" src="images/felipeelias-claude-statusline.webp" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline binaire Go pour Claude Code avec une configuration par modules, des hyperliens OSC 8 et des thèmes prédéfinis (`catppuccin`, `tokyo-night`, `gruvbox-rainbow` et d'autres).
- **Notes:** Brew install drops a `claude-statusline` binary on PATH. Alternative install: `go install github.com/felipeelias/claude-statusline@latest`. Customize via `~/.config/claude-statusline/config.toml` (see upstream).
- **Installation:** `brew install claude-statusline` (tap: `felipeelias/tap`)
- **Configurer:** `node bin/statuslines.js configure felipeelias-claude-statusline --cli=<claude>`

### `fredrikaverpil-claudeline` — [claudeline (Fredrik Averpil)](https://github.com/fredrikaverpil/claudeline)

<a href="https://github.com/fredrikaverpil/claudeline"><img alt="claudeline repo preview" src="images/fredrikaverpil-claudeline.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Go minimaliste pour Claude Code distribuée comme plugin Claude Code ; la commande slash `/claudeline:setup` du plugin télécharge le binaire et patche settings.json.
- **Notes:** Install flow runs entirely inside Claude Code: `/plugin marketplace add fredrikaverpil/claudeline` → `/plugin install claudeline@claudeline` → `/claudeline:setup`. The setup command writes `{"statusLine":{"type":"command","command":"claudeline"}}` itself, so we don't ship a `configs.claude` patch. Manual fallback: `go install github.com/fredrikaverpil/claudeline@latest`, then add the same snippet by hand.
- **Installation:** voir en amont

### `fwyc-codex-hud` — [codex-hud (fwyc0573)](https://github.com/fwyc0573/codex-hud)

<a href="https://github.com/fwyc0573/codex-hud"><img alt="codex-hud single-session statusline demo" src="images/fwyc-codex-hud.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** codex
- **Description:** HUD de statusline tmux en temps réel pour OpenAI Codex CLI avec l'usage de session/contexte, l'état git et la surveillance de l'activité des outils ; inclut les sous-commandes --kill / --list / --attach / --self-check.
- **Notes:** Codex CLI has no native command-statusline yet, so this runs as an external HUD — start it under tmux per upstream docs.
- **Installation:** voir en amont

### `hagan-claudia-statusline` — [claudia-statusline](https://github.com/hagan/claudia-statusline)

<a href="https://github.com/hagan/claudia-statusline"><img alt="claudia-statusline with cost, git, context" src="images/hagan-claudia-statusline.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Rust pour Claude Code avec suivi de statistiques persistantes, des binaires pré-compilés pour Linux/macOS/Windows et 11 thèmes ; référencée dans la documentation officielle de Claude Code.
- **Notes:** Upstream install is a `curl | bash` quick-install script that auto-configures settings.json. We don't auto-run remote scripts from `bin/statuslines.js configure` — invoke it directly per upstream README. Distinct from the inactive `taskx6004/claudia-statusline` fork.
- **Installation:** voir en amont

### `hanbu97-tokenusage` — [tokenusage (hanbu97)](https://github.com/hanbu97/tokenusage)

<a href="https://github.com/hanbu97/tokenusage"><img alt="tokenusage CLI demo screenshot" src="images/hanbu97-tokenusage.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude, codex
- **Description:** Traqueur d'usage de jetons rapide et local pour Claude Code et Codex ; `tu statusline` émet un résumé coût/jetons en une ligne. Disponible aussi en mode CLI, TUI et GUI. 214x plus rapide que ccusage.
- **Notes:** Primary install via npm (`npm install -g tokenusage`), also available on crates.io (`cargo install tokenusage --bin tu`) and PyPI (`pip install tokenusage`). Run `tu statusline` to emit a one-line token/cost summary suitable for use as a Claude Code statusLine command.
- **Installation:** `npx --ignore-scripts -y tokenusage@1.5.2`
- **À noter:** le paquet déclare des scripts de cycle de vie (preinstall/postinstall/prepare) ; `configure` s'exécute avec `--ignore-scripts`.

### `joaquinvesapa-sub-agent-statusline` — [opencode-subagent-statusline](https://github.com/Joaquinvesapa/sub-agent-statusline)

<a href="https://github.com/Joaquinvesapa/sub-agent-statusline"><img alt="Subagents Monitor banner" src="images/joaquinvesapa-sub-agent-statusline.webp" width="480"></a>

- **Licence:** MIT
- **Cibles:** opencode
- **Description:** Plugin de barre latérale TUI OpenCode (pas un statusLine.command) qui affiche l'activité des sous-agents, le temps écoulé et l'usage des jetons/du contexte.
- **Notes:** Configures via OpenCode's TUI config (~/.config/opencode/tui.json), not opencode.json. Add manually: {"$schema":"https://opencode.ai/tui.json","plugin":["opencode-subagent-statusline"]}. We don't auto-merge because that target file isn't supported by `bin/statuslines.js configure` yet.
- **Installation:** OpenCode charge `opencode-subagent-statusline@0.6.1` depuis npm au démarrage de la session (ajouté via le tableau `plugin` de `opencode.json`)

### `kamranahmedse-claude-statusline` — [claude-statusline (Kamran Ahmed)](https://github.com/kamranahmedse/claude-statusline)

<a href="https://github.com/kamranahmedse/claude-statusline"><img alt="claude-statusline showing model, context bar, git branch, rate limits" src="images/kamranahmedse-claude-statusline.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Claude Code minimaliste affichant le modèle, le pourcentage d'utilisation du contexte, le répertoire courant, la branche git, le minuteur de session, le niveau d'effort et les barres de limites de débit en temps réel depuis l'API Anthropic.
- **Notes:** Run `npx @kamranahmedse/claude-statusline@1.0.6` once to install. The installer copies statusline.sh to ~/.claude/statusline.sh and patches ~/.claude/settings.json automatically. Requires jq, curl, and git on PATH. Uninstall with `npx @kamranahmedse/claude-statusline --uninstall`.
- **Installation:** `npx --ignore-scripts -y @kamranahmedse/claude-statusline@1.0.6`
- **Configurer:** `node bin/statuslines.js configure kamranahmedse-claude-statusline --cli=<claude>`

### `kiriketsuki-gemini-statusline` — [gemini-statusline](https://github.com/Kiriketsuki/gemini-statusline)

<a href="https://github.com/Kiriketsuki/gemini-statusline"><img alt="gemini-statusline repo preview" src="images/kiriketsuki-gemini-statusline.png" width="480"></a>

- **Licence:** Unspecified (non redistribuable ; pour référence uniquement)
- **Cibles:** gemini
- **Description:** Aide d'invite shell sur deux lignes pour Gemini CLI affichant le modèle, le contexte de l'espace de travail, la branche git, le nombre de tickets GitHub et la profondeur de la boîte de réception — Gemini CLI n'ayant pas de hook statusLine natif, ceci s'exécute depuis l'invite shell de l'utilisateur.
- **Notes:** No LICENSE file at the canonical paths as of catalog verification on 2026-04-30; default copyright is all-rights-reserved, so we don't ship install recipes. Worth tracking as the first Gemini-targeted statusline-style helper. Upstream README acknowledges Gemini CLI lacks a native statusLine hook.
- **Installation:** voir en amont

### `lucasilverentand-claudeline` — [claudeline (Luca Silverentand)](https://github.com/lucasilverentand/claudeline)

<a href="https://github.com/lucasilverentand/claudeline"><img alt="claudeline statusline — model, token count, rate-limit bars" src="images/lucasilverentand-claudeline.svg" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Claude Code fournie sous le paquet npm `claudeline` avec des thèmes intégrés ; peut s'auto-installer dans settings.json via son option `--install`.
- **Notes:** Distinct from fredrikaverpil/claudeline (Go binary) despite the shared name. The package's `--install` flag patches settings.json automatically; the configs.claude here is the same snippet that flag would write.
- **Installation:** `npx --ignore-scripts -y claudeline@1.11.0`
- **Configurer:** `node bin/statuslines.js configure lucasilverentand-claudeline --cli=<claude>`

### `markwilkening-opencode-status-line` — [opencode-status-line](https://github.com/markwilkening21/opencode-status-line)

<a href="https://github.com/markwilkening21/opencode-status-line"><img alt="opencode-status-line repo preview" src="images/markwilkening-opencode-status-line.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** opencode
- **Description:** Statusline légère et rapide pour OpenCode CLI.
- **Notes:** Verify the entry script name in the upstream repo before relying on the configured command.
- **Installation:** `git clone` (géré par `bin/statuslines.js configure`)
- **Configurer:** `node bin/statuslines.js configure markwilkening-opencode-status-line --cli=<opencode>`

### `ndave92-claude-code-status-line` — [claude-code-status-line (ndave92)](https://github.com/ndave92/claude-code-status-line)

<a href="https://github.com/ndave92/claude-code-status-line"><img alt="claude-code-status-line repo preview" src="images/ndave92-claude-code-status-line.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Rust pour Claude Code avec les informations de l'espace de travail, l'état git, le nom du modèle, l'usage du contexte, des indications de worktree, des minuteries de quota et les coûts API optionnels.
- **Notes:** Recommended install is a self-installing slash command: download `.claude/commands/install-statusline.md` from the upstream repo, restart Claude Code, and run `/install-statusline`. The crate `claude-code-status-line` is not published on crates.io as of catalog verification on 2026-04-30.
- **Installation:** voir en amont

### `octane0411-open-vibe-island` — [Open Island](https://github.com/octane0411/open-vibe-island)

<a href="https://github.com/octane0411/open-vibe-island"><img alt="Open Island demo showing AI agent status in the macOS notch" src="images/octane0411-open-vibe-island.gif" width="480"></a>

- **Licence:** GPL-3.0 (non redistribuable ; pour référence uniquement)
- **Cibles:** claude, codex, gemini, opencode
- **Description:** Compagnon macOS pour le notch et la barre de menus (SwiftUI + AppKit) qui surveille les agents de codage IA en temps réel, affiche l'état des sessions et les demandes de permission en attente, et permet de retourner rapidement au bon terminal ou IDE. Prend en charge Claude Code, Codex, Gemini CLI, OpenCode, Cursor, Kimi CLI, Qoder, Qwen Code, Factory et CodeBuddy. macOS 14+ uniquement.
- **Notes:** GPL-3.0: not redistributable. macOS only. Install via signed DMG from GitHub Releases or `brew install --cask octane0411/tap/openisland`. Requires macOS 14+.
- **Installation:** voir en amont

### `opencode-quota` — [opencode-quota](https://github.com/slkiser/opencode-quota)

<a href="https://github.com/slkiser/opencode-quota"><img alt="opencode-quota sidebar" src="images/opencode-quota.webp" width="480"></a>

- **Licence:** MIT
- **Cibles:** opencode
- **Description:** Affichage du quota et de l'usage de jetons pour OpenCode sans pollution de la fenêtre de contexte ; prend en charge les fournisseurs OpenCode Go, Cursor, GitHub Copilot et d'autres.
- **Notes:** Follow upstream README for the current install path; project surface evolves quickly.
- **Installation:** voir en amont

### `owloops-claude-powerline` — [claude-powerline](https://github.com/Owloops/claude-powerline)

<a href="https://github.com/Owloops/claude-powerline"><img alt="claude-powerline — powerline segments for dir, model, tokens, cost" src="images/owloops-claude-powerline.svg" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline powerline de style Vim pour Claude Code avec suivi de l'usage en temps réel, intégration git et thèmes prédéfinis.
- **Installation:** `npx --ignore-scripts -y @owloops/claude-powerline@1.26.0`
- **Configurer:** `node bin/statuslines.js configure owloops-claude-powerline --cli=<claude>`

### `pcvelz-ccstatusline-usage` — [ccstatusline-usage](https://github.com/pcvelz/ccstatusline-usage)

<a href="https://github.com/pcvelz/ccstatusline-usage"><img alt="ccstatusline-usage showing session and weekly API usage bars alongside model and git widgets" src="images/pcvelz-ccstatusline-usage.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Fork de ccstatusline ajoutant des widgets d'utilisation en temps réel via l'API Anthropic : barres d'utilisation session et hebdomadaire, indicateur de rythme hebdomadaire, compte à rebours de réinitialisation et routage multi-fournisseur pour les modèles locaux.
- **Installation:** `npx --ignore-scripts -y ccstatusline-usage@2.4.1`
- **Configurer:** `node bin/statuslines.js configure pcvelz-ccstatusline-usage --cli=<claude>`

### `ramtinj95-opencode-tokenscope` — [opencode-tokenscope](https://github.com/ramtinJ95/opencode-tokenscope)

<a href="https://github.com/ramtinJ95/opencode-tokenscope"><img alt="opencode-tokenscope repo preview" src="images/ramtinj95-opencode-tokenscope.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** opencode
- **Description:** Plugin OpenCode (pas une statusline) fournissant l'analyse de l'usage des jetons et des coûts pour les sessions avec des ventilations détaillées.
- **Notes:** Upstream is ramtinJ95/opencode-tokenscope; pantheon-org/opencode-tokenscope-plugin is a downstream fork that uses the same npm package.
- **Installation:** OpenCode charge `@ramtinj95/opencode-tokenscope@1.6.3` depuis npm au démarrage de la session (ajouté via le tableau `plugin` de `opencode.json`)
- **Configurer:** `node bin/statuslines.js configure ramtinj95-opencode-tokenscope --cli=<opencode>`

### `rz1989s-claude-code-statusline` — [claude-code-statusline (rz1989s)](https://github.com/rz1989s/claude-code-statusline)

<a href="https://github.com/rz1989s/claude-code-statusline"><img alt="claude-code-statusline Catppuccin Mocha theme screenshot" src="images/rz1989s-claude-code-statusline.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Bash pour Claude Code avec 28 composants atomiques sur jusqu'à 9 lignes : infos git, suivi des coûts, état MCP, minuteur de réinitialisation de bloc, heures de prière islamiques et thèmes Catppuccin.
- **Notes:** Install via curl|sh: `curl -sSfL https://raw.githubusercontent.com/rz1989s/claude-code-statusline/main/install.sh | bash`. The script downloads statusline.sh and 11 modular lib components into ~/.claude/statusline/ and patches ~/.claude/settings.json automatically. No admin privileges required. Also available via Homebrew: `brew tap rz1989s/tap && brew install claude-code-statusline`. Configure via ~/.claude/statusline/Config.toml (227 settings).
- **Installation:** voir en amont
- **À noter:** le paquet déclare des scripts de cycle de vie (preinstall/postinstall/prepare) ; `configure` s'exécute avec `--ignore-scripts`.

### `sotayamashita-claude-code-statusline` — [claude-code-statusline (Sam Yamashita)](https://github.com/sotayamashita/claude-code-statusline)

<a href="https://github.com/sotayamashita/claude-code-statusline"><img alt="claude-code-statusline (Rust) repo preview" src="images/sotayamashita-claude-code-statusline.png" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Rust pour Claude Code avec une configuration de style starship et une composition par modules.
- **Notes:** Upstream README references `cargo install claude-code-statusline-cli`, but that crate is not published on crates.io as of catalog verification on 2026-04-30. Build from source meanwhile: clone the repo, run `cargo build --release`, point statusLine.command at the resulting binary.
- **Installation:** voir en amont

### `thisdot-context-statusline` — [@this-dot/claude-code-context-status-line](https://github.com/thisdot/claude-code-context-status-line)

<a href="https://github.com/thisdot/claude-code-context-status-line"><img alt="context-statusline showing token + cache breakdown" src="images/thisdot-context-statusline.svg" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude
- **Description:** Statusline Claude Code qui parse les transcriptions JSONL de session pour calculer les jetons d'entrée, de création de cache et de lecture de cache afin d'afficher fidèlement la fenêtre de contexte.
- **Notes:** Last published 2025-09-27 (v0.2.2); originally tuned for AWS Bedrock-hosted models but works for any Claude Code session.
- **Installation:** `npx --ignore-scripts -y @this-dot/claude-code-context-status-line@0.2.2`
- **Configurer:** `node bin/statuslines.js configure thisdot-context-statusline --cli=<claude>`

### `tokscale` — [tokscale](https://github.com/junhoyeo/tokscale)

<a href="https://github.com/junhoyeo/tokscale"><img alt="tokscale hero banner" src="images/tokscale.webp" width="480"></a>

- **Licence:** MIT
- **Cibles:** claude, opencode, gemini, codex
- **Description:** Traqueur d'usage de jetons multi-CLI qui lit les données de session locales de nombreux outils de codage IA (Claude Code, OpenCode, Codex, Gemini, Cursor, Amp, Kimi, et d'autres) avec une tarification alimentée par LiteLLM.
- **Notes:** Use as a data source for a custom statusline (e.g. `npx -y tokscale@latest --json`) rather than as the statusline itself.
- **Installation:** `npx --ignore-scripts -y tokscale@2.1.0`

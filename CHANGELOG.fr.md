# Journal des modifications

**Langues :** [English](./CHANGELOG.md) · Français · [日本語](./CHANGELOG.ja.md)

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
Ce projet utilise des en-têtes de section à la forme semver, mais est en pré-1.0 ;
les numéros de version sont des jalons notionnels, non des versions taguées.

## [Non publié]

### Ajouté
- `tests/statuslines.test.js` — 114 tests répartis en 19 suites, couvrant `validate()`,
  les trois rendus (`renderReadme` / `renderTopReadmeBlocks` / `renderQuarantine`)
  dans les trois locales, la sémantique de quarantaine `loadVisible`/`loadAll`,
  l'échappement des pipes/guillemets, le repli d'image et l'échappement des
  extraits de configuration.
- `tests/run.sh`, script utilitaire ; le workflow CI (`catalog-doctor.yml`) exécute
  désormais la suite de tests avant l'étape `doctor` et se déclenche sur les
  modifications de `tests/**`.
- `catalog-liveness` : passe de vivacité des URL d'images qui envoie un HEAD sur
  chaque `image.url` visible (non mise en quarantaine), classe le résultat en
  `ok / og-stable / wrong_content_type / redirected / dead`, et expose la dérive
  dans le rapport `/tmp/liveness.md` aux côtés des sondes dépôt + registre npm
  existantes. Expose `--json <chemin>`.

### Corrigé
- `renderReadme(lang)` lit désormais `description_fr` / `description_ja` des entrées
  lors du rendu de `catalog/README.fr.md` et `catalog/README.ja.md` ; auparavant,
  ces README localisés affichaient les descriptions en anglais même lorsque des
  champs traduits existaient dans le JSON.
- `cmdConfigure` possède désormais un bras explicite pour `install.type="manual"` qui
  affiche des instructions vers le lien amont et sort avec le code 1, au lieu
  de fusionner silencieusement un extrait de configuration sans binaire dans PATH.
- `scripts/verify-capabilities.mjs` : simplification d'une expression booléenne
  `!noNetFailed === false` signalée comme bogue potentiel par les auditeurs
  (comportement inchangé ; lisibilité améliorée).
- `scripts/deps-verify.mjs` : suppression d'un ternaire mort `? header : header`
  issu d'une refactorisation antérieure.

---

## [0.7.0] — Tests, vivacité des images et localisation des tables du catalogue

### Ajouté
- Tables à vignettes par CLI dans le README principal (EN/FR/JA) :
  `renderTopReadmeBlocks()` émet une table à 4 colonnes
  `Aperçu | Nom | Licence | Description` par CLI avec des vignettes de 200 px
  pointant vers le dépôt amont.
- Descriptions localisées dans les tables du catalogue : les champs `description_fr`
  et `description_ja` ont été ajoutés aux 23 entrées ; les blocs catalogue FR et JA
  du README principal s'affichent désormais dans la langue cible.
- Harnais de prévisualisation `termframe` (`scripts/preview-via-termframe.mjs`) :
  redirige le JSON synthétique d'une statusline Claude Code vers les binaires amont
  dans un PTY virtuel et capture la sortie SVG ; un modèle macOS iTerm2 est
  également fourni.
- Prévisualisations SVG vectorielles pour trois statuslines Claude
  (`ccstatusline`, `lucasilverentand-claudeline`, `owloops-claude-powerline`) —
  3–7 Ko chacune, remplaçant des GIF de plusieurs Mo.
- `scripts/optimize-images.mjs` : pipeline de conversion WebP (`sharp` + `cwebp`)
  et optimiseur GIF uniquement via `gifsicle` ; supprime les GIF orphelins sans
  référence dans le catalogue.
- `tokscale.png` optimisé en WebP (1,35 Mo → 58 Ko).

### Modifié
- `render-top-readme` écrit les trois README locaux en un seul passage pour que le
  badge de comptage et le bloc catalogue restent en phase entre EN/FR/JA.
- `validate()` accepte désormais `"termframe-synthetic"` comme valeur d'énumération
  valide pour `image.source`.

---

## [0.6.0] — Catalogue localisé + prévisualisations d'images + quarantaine b-open-statusline

### Ajouté
- Traductions complètes FR + JA : `README` principal, `catalog/README`,
  `catalog/SCHEMA`, `catalog/QUARANTINE`, `catalog/CAPABILITIES` — chaque document
  de premier niveau possède désormais ses variantes linguistiques.
- Barres de navigation linguistique sur tous les documents anglais canoniques
  (`README.md`, `SECURITY.md`, `catalog/SCHEMA.md`, `catalog/CAPABILITIES.md`) ;
  `render-readme` et `render-quarantine` émettent des barres de navigation dans
  leurs sorties générées.
- Prévisualisations d'images locales : `catalog/images/` embarque une copie
  validée de la capture d'écran/carte OG de chaque entrée (24 fichiers) ;
  `scripts/grab-images.mjs` est le téléchargeur ré-exécutable (idempotent,
  TTL de 30 jours, option `--force`). Le moteur de rendu préfère
  `image.local` à `image.url`.
- Champ de schéma `image { url, alt, source, local }` ajouté ;
  `scripts/apply-images.mjs` patcher d'amorçage ;
  `catalog/SCHEMA.md` documente le champ et les valeurs valides de `source`.

### Modifié
- La déclinaison `gsd/` de context-health est supprimée ; `pup/` est désormais
  la seule statusline de référence embarquée dans le dépôt. Les scripts de
  context-monitor ont été déplacés dans `pup/claude/` et `pup/opencode/`
  (historique préservé par `git rename`).
- `install/install-pup.sh`, `examples/` et `package.json` repointed de `gsd/`
  vers `pup/` ; six entrées `statusline-gsd-*` dans `bin` supprimées.
- La section Feuille de route de `README.md` réécrite pour refléter le travail livré.

### Corrigé
- `validate()` avertit lorsqu'une entrée redistribuable n'a pas de bloc `image` ;
  refuse les `image.url` non-https, les URL `github.com/user-attachments` (qui
  renvoient 403 aux clients non-navigateurs), les chaînes alt hors limites et les
  valeurs `source` inconnues.

### Sécurité
- **b-open-statusline mis en quarantaine.** La comparaison GitHub a confirmé 0
  commit divergent depuis `sirmalloc/ccstatusline` ; les deux `package.json`
  déclarent le même nom ; la fonction de détection automatique de la fenêtre de
  contexte revendiquée est absente du code source. Mis en quarantaine selon le
  motif OpenBSD-style ; le comptage du catalogue passe de 24 à 23.

---

## [0.5.0] — Durcissement Phases F–J (signature PQC, diff de tarball, capacités, provenance, fichiers de verrouillage)

### Ajouté
- **Phase F — Signature PQC.** `scripts/manifest.mjs` construit, signe et
  vérifie `catalog/MANIFEST.json` avec une signature hybride Ed25519 + ML-DSA-65
  (FIPS 204). `scripts/keygen.mjs` génère les paires de clés ; les clés privées
  n'entrent jamais dans le dépôt. `catalog/MAINTAINERS.md` contient les clés
  publiques ; `.github/workflows/catalog-manifest-verify.yml` bloque les PR
  dont le manifeste est invalide ou désynchronisé. Bibliothèque :
  `@noble/post-quantum 0.6.1` (JS pur, sans bindings natifs).
- **Phase G — Déclarations de capacités + vérification en bac à sable.** Bloc
  `capabilities` par entrée (`network`, `child_process`, `filesystem_write`,
  `env_read`, `verified_at`, `verification_method`) documenté dans
  `catalog/SCHEMA.md` et `catalog/CAPABILITIES.md`. `scripts/verify-capabilities.mjs`
  exécute les installations sous firejail (repli bubblewrap / strace) et compare
  le comportement observé aux déclarations. `bin/statuslines.js` acquiert la
  sous-commande `verify-capabilities <slug>`. `.github/workflows/catalog-capabilities.yml`
  s'exécute hebdomadairement (mer. 09:11 UTC) ; met en quarantaine les entrées dont
  les permissions observées dépassent leurs déclarations.
- **Phase H — Bot de montée de version + diff de tarball.**
  `scripts/tarball-diff.mjs` (lecteur tar stdlib pur, sans dépendances natives)
  compare les anciens et nouveaux tarballs selon cinq catégories d'alerte :
  nouveaux scripts de cycle de vie, nouveaux domaines de premier niveau, nouveaux
  blobs binaires, modifications de LICENSE et forte croissance de taille.
  `scripts/version-bumps.mjs` propose des mises à jour ; les diff suspects sont
  retenus dans une section `quarantined-from-bump` plutôt qu'appliqués.
  `.github/workflows/catalog-version-bumps.yml` s'exécute hebdomadairement
  (lun. 03:37 UTC).
- **Phase I — Application de l'attestation de provenance npm (consultatif).**
  `scripts/provenance-check.mjs` récupère les attestations de provenance de
  build SLSA depuis le registre npm, enregistre `available` / `regression` par
  entrée. `.github/workflows/catalog-provenance.yml` s'exécute hebdomadairement
  (jeu. 09:47 UTC). Consultatif : `doctor` ne refuse pas les entrées sans
  attestations.
- **Phase J — Fichiers de verrouillage de dépendances transitives (consultatif).**
  `scripts/deps-capture.mjs` résout la fermeture complète des dépendances de
  chaque entrée npm redistribuable via le format slim-packument npm ;
  écrit `catalog/locks/<slug>.json`. `scripts/deps-verify.mjs` re-résout et
  signale les dérives (dépendance ajoutée, changement d'intégrité pour la même
  version). `.github/workflows/catalog-deps-verify.yml` s'exécute hebdomadairement
  (mer. 11:53 UTC). Phase consultative — pas d'échec strict dans `doctor` pour
  l'instant.
- `MANIFEST.json` reconstruit avec le backfill des capacités Phase G (20 entrées
  redistribuables alimentées avec des valeurs par défaut conservatives).

### Modifié
- `bin/statuslines.js validate()` retourne désormais `{ errs, warns }` afin que
  les lacunes de capacités apparaissent comme lignes `WARN` pendant la période de
  grâce de déploiement sans bloquer `doctor`.

---

## [0.4.0] — Durcissement Phases B–E (SAST / SCA / SAIST / Socket.dev / SAST catalogue)

### Sécurité
- **Phases B/C/D — Workflows Datadog SAST, SCA, SAIST et Socket.dev.** Les six
  workflows sont en fail-closed (sortie 0 avec avertissement en l'absence de
  secrets ; sûrs à fusionner avant la configuration des clés) :
  - `datadog-sast-self.yml` : analyse statique quotidienne + par PR du code
    en dépôt via `DataDog/datadog-static-analyzer-github-action@v3` ; garde
    per-step pour la sécurité des PR de forks.
  - `datadog-sca-self.yml` : SCA hebdomadaire avec `reachability: true`
    pour filtrer le bruit des vulnérabilités aux chemins réellement appelés.
  - `datadog-saist-self.yml` : SAST augmenté par IA (deux passes détection +
    validation) via Ollama Cloud ; se déclenche uniquement sur les modifications
    `.py`/`.go` (SAIST amont supporte Java/Python/Go). `OPENAI_BASE_URL` ne doit
    pas inclure `/v1` — le client SAIST l'ajoute en interne
    (`internal/clients/openai.go`).
  - `catalog-socket-feed.yml` + `scripts/socket-feed.mjs` : flux quotidien de
    paquets malveillants Socket.dev ; authentification HTTP Basic (token en nom
    d'utilisateur, mot de passe vide — Bearer est refusé par l'API Socket) ;
    mise en quarantaine automatique des entrées sur alertes haute/critique.
- **Phase E — Workflow SAST à l'échelle du catalogue.**
  `scripts/catalog-sast.mjs` + `.github/workflows/catalog-sast.yml` exécutent
  l'analyseur statique Datadog hebdomadairement (lun. 08:11 UTC) sur le code
  source de chaque entrée redistribuable (tarball npm ou `git clone`) ; ouvre
  des PR bot pour la quarantaine/le backfill. `DD_API_KEY` ne conditionne que
  le téléchargement vers Datadog — l'analyseur lui-même s'exécute hors ligne,
  en open source.
- `catalog-doctor.yml` et `catalog-liveness.yml` mis en place ; la sonde de
  vivacité détecte les dérives de version, d'intégrité, de licence, les
  redirections de dépôts et les scénarios d'avancement amont depuis la
  dernière épinglage ; ouvre ou commente un ticket de suivi unique tagué
  `catalog-liveness`.

---

## [0.3.0] — Phase A : application du schéma, commande audit et quarantaine

### Ajouté
- `bin/statuslines.js audit [<slug>] [--dry-run]` : sonde le registre npm,
  backfille `install.version`, `install.integrity`, `security.has_install_scripts`,
  `security.license_observed`, `security.last_audit` ; réécrit les épingles
  `@latest` ; injecte `--ignore-scripts` dans les commandes `npx`.
- `catalog/QUARANTINE.md` comme trace forensique des entrées mises en
  quarantaine (toujours générée ; révèle les entrées cachées et les raisons).
- 9 entrées résolvables via npm alimentées avec des versions épinglées et des
  empreintes d'intégrité SRI (`ccstatusline 2.2.12`, `ccusage 18.0.11`,
  `lucasilverentand-claudeline 1.11.0`, `owloops-claude-powerline 1.26.0`,
  `thisdot-context-statusline 0.2.2`, `tokscale 2.0.27`,
  `ainsley-opencode-token-monitor 0.5.0`,
  `joaquinvesapa-sub-agent-statusline 0.5.4`,
  `ramtinj95-opencode-tokenscope 1.6.3`).
- Bloc `security { has_install_scripts, license_observed, last_audit,
  quarantined, quarantine_reason, quarantined_at }` ajouté au schéma.

### Modifié
- `list` / `show` / `configure` / `render-readme` / `render-top-readme` filtrent
  tous les entrées en quarantaine par défaut (sécurité par défaut à la OpenBSD).
  La visibilité nécessite `STATUSLINES_REVEAL_QUARANTINE=1` ; `configure`
  nécessite en outre `--ignore-quarantine`.
- `list` affiche un pied de page avec le nombre d'entrées cachées lorsque des
  entrées sont filtrées.

### Sécurité
- **Phase A — Application du schéma.** `doctor` refuse désormais :
  versions non épinglées sur les entrées redistribuables, `@latest` dans
  `configs.<cli>`, motifs dangereux (`curl|sh`, `wget|sh`, `eval(`,
  `base64 -d`, espaces réservés `<repository-url>`), et `quarantine_reason`
  manquant lorsque `quarantined: true`.
- `--ignore-scripts` injecté dans toutes les recettes `npx` de configuration
  par défaut.
- 0 des 9 entrées résolvables via npm ne déclarent de scripts de cycle de vie
  (`preinstall`/`postinstall`/`install`/`prepare`) — base de référence
  ceinture-bretelles confirmée.

---

## [0.2.0] — Catalogue organisé avec outillage CLI (14 entrées)

### Ajouté
- Structure `catalog/<cli>/<slug>.json` : un fichier JSON par entrée par CLI
  cible (`claude/`, `opencode/`, `gemini/`, `codex/`, `multi/`).
- CLI catalogue `bin/statuslines.js` avec les sous-commandes `list`, `show`,
  `configure`, `doctor`, `render-readme` et `render-top-readme`.
- 14 entrées initiales : premier lot (5 installations vérifiées, 1 OpenCode),
  puis un deuxième lot de 9 (3 vérifiées, 6 listées pour référence). Couvre
  Claude Code, OpenCode, Gemini CLI et Codex CLI.
- `catalog/README.md` comme table exhaustive par entrée (statut, type
  d'installation, langage) ; `catalog/SCHEMA.md` avec les règles champ par
  champ.
- Stub `catalog/QUARANTINE.md`.
- `README.md` principal restructuré en page d'accueil de catalogue organisé
  avec démarrage rapide, matrice de prise en charge, arborescence,
  guide de contribution et feuille de route.
- Champs `install.integrity` (hash SRI), `redistributable`, `install.type`
  et `configs.<cli>` définis dans le schéma.

### Modifié
- `configure` ignore les entrées dont la licence n'est pas redistribuable ;
  celles-ci restent listées pour référence.
- Le README principal converti d'un guide multi-déclinaisons en index de
  catalogue.

---

## [0.1.0] — Statuslines embarquées initiales (déclinaisons GSD + pup)

### Ajouté
- `lib/` : aides partagées — `bar.js`, `colors.js`, `git.js`, E/S du fichier
  de pont et garde stdin.
- Déclinaison `gsd/` (GSD = santé du contexte) : statuslines et moniteurs
  de contexte `PostToolUse` / `tool.execute.after` / `AfterTool` pour
  Claude Code, OpenCode, Gemini CLI et Codex CLI. Fichier de pont à
  `/tmp/statuslines-<tool>-ctx-<session>.json` transportant `used_pct` +
  `remaining_percentage` ; garde de fraîcheur 60 s, debounce 5 appels,
  l'escalade CRITICAL contourne le debounce.
- Déclinaison `pup/` (observabilité Datadog) : lit les événements récents
  issus de `pup events list --duration 5m --output json` via un cache contrôlé
  par TTL (verrou `O_EXCL`, TTL 60 s, repli sur le cache obsolète en ≤ 250 ms
  pour les rendus concurrents). Les erreurs auth/rate-limit/ENOENT sont
  remontées comme étiquettes visibles dans la barre plutôt que des échecs
  silencieux. `pup/cli.js` avec les sous-commandes `fetch` et `show`.
- `examples/` : extraits de configuration à coller, par CLI.
- `install/install-gsd.sh` et `install/install-pup.sh` : fusionneurs
  `settings.json` / config basés sur `jq`.

---

[Non publié]: https://github.com/datadog-labs/statuslines/compare/HEAD...HEAD
[0.7.0]: https://github.com/datadog-labs/statuslines/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/datadog-labs/statuslines/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/datadog-labs/statuslines/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/datadog-labs/statuslines/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/datadog-labs/statuslines/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/datadog-labs/statuslines/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/datadog-labs/statuslines/releases/tag/v0.1.0

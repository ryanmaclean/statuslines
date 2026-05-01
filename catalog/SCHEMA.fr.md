# Schéma d'entrée du catalogue

**Langues :** [English](./SCHEMA.md) · Français · [日本語](./SCHEMA.ja.md)

Chaque `catalog/<cli>/<slug>.json` correspond à une entrée unique.

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

## Référence des champs

### Identité et licence

- **slug** : en minuscules, en kebab-case, unique. Utilisez la forme `<owner>-<name>` lorsque deux dépôts amont partagent un même nom (par exemple `lucasilverentand-claudeline` vs `fredrikaverpil-claudeline`).
- **license** : identifiant SPDX lu directement depuis le fichier `LICENSE` amont. Les badges de README ne font pas autorité.
- **redistributable** : `true` uniquement si la licence figure dans la liste blanche permissive OSI (MIT, Apache-2.0, BSD-2/3-Clause, ISC, MPL-2.0, 0BSD). Les licences copyleft (AGPL, GPL), à code source disponible (PolyForm-NC, BSL) et celles que nous n'avons pas pu vérifier (absence de fichier LICENSE) → `false`. Les entrées non redistribuables restent listées à titre indicatif mais sont ignorées par `configure`.
- **host_clis** : l'un quelconque parmi `claude`, `opencode`, `gemini`, `codex`. Une entrée peut en cibler plusieurs.

### Image

- **image.url** : URL https absolue d'une capture d'écran représentative. Privilégiez une image hero/démo hébergée sur `raw.githubusercontent.com` ou un CDN déjà utilisé par le README amont ; basculez sur la carte OpenGraph générée automatiquement par GitHub à `https://opengraph.githubassets.com/1/<owner>/<repo>` si le README amont ne propose aucune image utilisable. Évitez les URLs `github.com/user-attachments/...` — elles renvoient un 403 hors navigateur.
- **image.alt** : courte légende (≤ 60 caractères) utilisée comme texte `alt` et titre du lien.
- **image.source** : `"readme"` lorsque l'image vient du README amont, `"og-fallback"` lorsqu'on retombe sur la carte OpenGraph GitHub. Le rendu traite les deux cas de la même façon ; le champ sert à tracer la provenance.

### Installation

- **install.type** : l'une des valeurs `npx`, `npm-global`, `cargo`, `brew`, `git`, `manual`, `opencode-plugin`.
  - `npx` : invocation à l'exécution via `npx --ignore-scripts -y <package>@<version>`. Aucune étape de pré-installation.
  - `npm-global` : `npm i -g --ignore-scripts <package>@<version>`.
  - `cargo` : `cargo install <package> --version <version>`.
  - `brew` : `brew install <tap>/<formula>` (en une seule étape, sans `brew tap` séparé).
  - `git` : clonage dans `~/.local/share/statuslines/<clone_dir>` et exécution depuis cet emplacement.
  - `opencode-plugin` : OpenCode charge le paquet depuis npm au démarrage de la session lorsqu'il est ajouté au tableau `plugin` d'`opencode.json`. Aucune commande d'installation explicite.
  - `manual` : lien uniquement — l'utilisateur suit la documentation d'installation amont.
- **install.package** (npx / npm-global / opencode-plugin) : le nom du paquet npm, scope inclus (par exemple `@owloops/claude-powerline`).
- **install.version** : **obligatoire** pour les entrées `redistributable=true` non-`manual`. Semver figé. La valeur `"latest"` est rejetée par `doctor`. Renseignée puis rafraîchie par `node bin/statuslines.js audit`.
- **install.integrity** (npm) : la chaîne SRI `dist.integrity` du registre (par exemple `sha512-...`). Capturée par `audit`.
- **install.tap** + **install.formula** (brew) : tap (par exemple `felipeelias/tap`) et nom de la formule ; `formula` prend par défaut la valeur de `package` si elle est omise.
- **install.clone_dir** (git) : sous-répertoire de destination sous `~/.local/share/statuslines/`.

### Configurations

- **configs** : table associant `<cli>` → patch JSON fusionné dans le fichier de configuration de l'outil correspondant par `configure`. Les clés doivent appartenir à l'un des quatre `host_clis`.
- Pour les entrées redistribuables, `configs.<cli>` ne peut pas contenir `@latest`, `curl|sh`, `wget|sh`, `eval(`, `base64 -d`, ni la chaîne littérale `<repository-url>`. `doctor` refuse les entrées qui enfreignent ces règles.
- Pour le type d'installation `git`, le jeton magique `${INSTALL_DIR}` présent dans toute valeur de chaîne est remplacé par la destination du clone au moment de la configuration.

### Bloc sécurité

- **security.has_install_scripts** : `true` si le paquet npm amont déclare des scripts de cycle de vie `preinstall`, `install`, `postinstall` ou `prepare`. Détecté automatiquement par `audit`. L'option `--ignore-scripts` que nous ajoutons par défaut à `configure` atténue le risque ; `render-readme` émet un avertissement lorsque cette valeur est `true`.
- **security.license_observed** : la chaîne de licence observée par le dernier `audit` sur le paquet amont ; elle doit correspondre à `license` au niveau supérieur. Une dérive ici constitue un signal de régression de licence.
- **security.last_audit** : date ISO de la dernière exécution d'`audit` pour cette entrée.
- **security.quarantined** : `true` pour masquer l'entrée de `list`, `show`, `configure` et des READMEs générés. Vaut `false` par défaut.
- **security.quarantine_reason** : obligatoire lorsque `quarantined=true`. Motif libre sur une seule ligne.
- **security.quarantined_at** : date ISO de la mise en quarantaine de l'entrée.

Entrées en quarantaine :
- Sont absentes de la sortie de `bin/statuslines.js list`, sauf si la variable d'environnement `STATUSLINES_REVEAL_QUARANTINE=1` est définie.
- Font afficher à `show <slug>` `no entry: <slug>` (comme pour une faute de frappe), sauf si la variable d'environnement de révélation est définie.
- Font refuser `configure <slug>` avec `no entry`. Lorsque la variable de révélation est définie, la commande affiche le motif de quarantaine et refuse tout de même. Pour passer outre, définissez la variable de révélation *et* passez `--ignore-quarantine`.
- Sont exclues à la fois de `catalog/README.md` et du bloc catalogue du README racine.
- Sont listées dans `catalog/QUARANTINE.md` (régénéré par `render-quarantine`).

C'est la posture « sécurisé par défaut » à la OpenBSD : masquée, sans avertissement. La trace forensique réside dans `QUARANTINE.md`.

## Ajouter une entrée

1. Vérifiez la licence dans le dépôt amont — lisez directement le fichier `LICENSE`, et non le badge du README. Si aucun fichier `LICENSE` n'existe aux emplacements canoniques, mettez `redistributable: false` et `license: "Unspecified"`.
2. Confirmez que le chemin d'installation fonctionne réellement contre le registre (le paquet npm existe sous le nom et la version annoncés, la formule brew se résout sous le tap). Pour npm : `curl -s https://registry.npmjs.org/<pkg>` et lisez `dist-tags.latest`.
3. Rédigez une description d'une seule phrase, dans vos propres termes. Ne collez rien depuis l'amont.
4. Déposez le JSON dans `catalog/<cli>/<slug>.json`.
5. Pour les entrées `redistributable: true`, exécutez `node bin/statuslines.js audit <slug>` afin de renseigner `install.version`, `install.integrity` et `security.has_install_scripts`.
6. Exécutez `node bin/statuslines.js doctor` pour valider, puis `render-readme` et `render-top-readme` pour rafraîchir les tables générées.
7. Ouvrez une PR.

## Capacités

Toute entrée redistribuable déclare les capacités que son installation ou sa première invocation à l'exécution est susceptible d'utiliser. La justification complète, le modèle de bac à sable et le flux de travail des contributeurs résident dans [`catalog/CAPABILITIES.md`](./CAPABILITIES.md) ; cette section documente uniquement le champ du schéma.

Forme (ajoutée au niveau supérieur de l'entrée, aux côtés de `install`, `configs`, etc.) :

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

- **capabilities.network** : `boolean` — l'installation ou la première invocation à l'exécution effectue-t-elle des appels réseau sortants ? Presque toujours `true` pour les entrées adossées à npm (récupération depuis le registre, télémétrie, vérification de licence).
- **capabilities.child_process** : `boolean` — l'entrée engendre-t-elle des processus enfants autres que le binaire lui-même ? `true` pour les installations git et la plupart des paquets npm.
- **capabilities.filesystem_write** : `boolean` — écrit-elle en dehors des racines sûres `$HOME/.cache`, `$TMPDIR` et du répertoire d'installation ? Les écritures à l'intérieur de ces racines sont autorisées et ne nécessitent pas ce drapeau. Valeur par défaut : `false`.
- **capabilities.env_read** : `string[]` — noms des variables d'environnement que l'entrée s'attend à lire. Utilisez `["*"]` pour signifier « n'importe laquelle » ; l'entrée doit alors comporter un champ `notes` justifiant le caractère générique.
- **capabilities.verified_at** : chaîne de date ISO ou `null`. Dernière fois où le bac à sable a observé un comportement conforme à la déclaration. `null` signifie déclaré mais pas encore vérifié par `catalog-capabilities`.
- **capabilities.verification_method** : l'une des valeurs `"declared"`, `"sandbox-strace"`, `"sandbox-bpf"`, `"skipped"`. `"declared"` est la valeur d'amorçage par défaut ; le flux de travail la réécrit en `"sandbox-strace"` lorsqu'une observation correspond.

Comportement du validateur pendant le déploiement : `bin/statuslines.js doctor` émet un *avertissement* (et non une erreur) lorsque `capabilities` est absent d'une entrée `redistributable: true`. Une fois toutes les entrées renseignées, l'avertissement deviendra une erreur bloquante.

La sous-commande CLI correspondante est `node bin/statuslines.js verify-capabilities <slug> [--dry-run]`, qui délègue à `scripts/verify-capabilities.mjs` et émet un rapport JSON comparant l'observé au déclaré.

## Attestation

Durcissement de la chaîne d'approvisionnement, phase I : pour chaque entrée redistribuable adossée à npm, `scripts/provenance-check.mjs` interroge le registre npm pour savoir si la version figée porte une attestation [SLSA build provenance](https://slsa.dev/spec/v1.0/provenance) signée par Sigstore (l'artefact que `npm publish --provenance` produit depuis une exécution GitHub Actions). Les résultats atterrissent sous `security.attestation` :

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

- **available** : `true` si et seulement si le registre expose un bundle d'attestation typé SLSA pour la version figée. L'auto-attestation de `npm publish` à elle seule ne compte pas.
- **checked_at** : horodatage ISO de la sonde la plus récente.
- **predicate_type / issuer / build_workflow** : extraits du Statement in-toto encapsulé en DSSE — respectivement l'URI du prédicat, l'identité OIDC du constructeur (`runDetails.builder.id`) et la forme canonique `<host>/<owner>/<repo>/<workflow-path>@<ref>` (depuis `buildDefinition.externalParameters.workflow`).
- **regression** : `true` lorsqu'une exécution précédente avait enregistré `available: true` et que l'exécution courante constate `available: false`. **C'est l'anomalie à fort signal** — un paquet qui *signait* ses builds et a cessé de le faire représente exactement la forme de chaîne d'approvisionnement à investiguer.

La phase I est **consultative**. `doctor` ne refuse PAS les entrées affichant `available: false`, car de nombreux dépôts amont légitimes n'ont pas encore adopté la publication de provenance. Le flux de travail hebdomadaire `catalog-provenance` ouvre une PR lorsque les résultats changent ; une phase ultérieure pourra promouvoir un socle `available: true` durable au rang d'exigence de `doctor`.

Mainteneurs qui se demandent pourquoi leur paquet affiche `available: false` : activez la provenance en publiant depuis un workflow GitHub Actions avec `npm publish --provenance` (et `id-token: write` sur le job). Voir [`docs.npmjs.com/generating-provenance-statements`](https://docs.npmjs.com/generating-provenance-statements).

## Lockfile de dépendances

Phase J : `install.integrity` épingle l'archive *de niveau supérieur*, mais `npx -y pkg@1.2.3` continue de résoudre les dépendances transitives au moment de l'installation à partir des plages de `package.json`. Une prise de contrôle de mainteneur sur `lodash@^4.0.0` pourrait livrer une nouvelle version malveillante même si notre épinglage de niveau supérieur reste correct. Pour le détecter, nous prenons une photo de la fermeture transitive complète de chaque entrée npm redistribuable une fois, puis nous la revérifions chaque semaine.

```json
"install": {
  ...,
  "deps_lock_sha256": "<hex>"
}
```

- Le contenu du lockfile réside dans `catalog/locks/<slug>.json` (et non en ligne dans l'entrée, car les lockfiles sont volumineux et domineraient visuellement le JSON de l'entrée). Forme : `{ schema_version, slug, package, version, captured_at, deps: { "<name>@<version>": "<sri>" } }`. Clés triées partout ; déduplication à une seule version résolue par nom de paquet.
- **install.deps_lock_sha256** vaut `sha256(canonicalize(lockfile))` sur du JSON à clés triées et sans espaces. Cela permet à la signature du manifeste de couvrir transitivement l'identité du lockfile.
- `scripts/deps-capture.mjs` renseigne à la fois le lockfile et le hash ; `scripts/deps-verify.mjs` rerésout contre le registre en direct et signale les dérives dans quatre catégories — *added* et *integrity-changed-for-same-version* sont des anomalies, *bumped* et *removed* sont informatifs.
- Le flux de travail hebdomadaire `catalog-deps-verify` ouvre une PR de rafraîchissement en cas de dérive et étiquette les anomalies avec `(quarantine candidate)` dans le corps du rapport.

C'est **consultatif** : `doctor` ne refuse pas les entrées dépourvues de lockfile ou de `deps_lock_sha256`. L'exécution d'amorçage `node scripts/deps-capture.mjs` les renseigne pour chaque entrée npm redistribuable existante ; les nouvelles entrées les récupèrent à la prochaine exécution hebdomadaire ou via une capture manuelle.

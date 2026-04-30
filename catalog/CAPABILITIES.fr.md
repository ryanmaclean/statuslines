# Déclarations de capacités

**Langues :** [English](./CAPABILITIES.md) · Français · [日本語](./CAPABILITIES.ja.md)

Phase G du plan de sécurité : chaque entrée redistribuable du catalogue déclare les *capacités* qu'elle prévoit d'utiliser, et l'intégration continue exécute l'installation dans un bac à sable afin de confirmer que la déclaration est honnête. Pensez aux permissions Android pour `npm` — un contributeur déclare ce dont son outil a besoin, et le catalogue refuse (ou met en quarantaine) tout ce qui chercherait à en faire plus à l'installation ou au premier lancement.

## Les quatre dimensions déclarées

Le JSON de chaque entrée redistribuable comporte un bloc `capabilities` :

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

| Champ | Type | Signification |
|---|---|---|
| `network` | `boolean` | L'installation **ou** la première invocation à l'exécution effectue des appels réseau sortants (registre npm, télémétrie, vérifications de licence, etc.). La plupart des entrées sont à `true` — elles téléchargent leur propre tarball. |
| `child_process` | `boolean` | L'entrée procède au lancement de processus enfants autres que le binaire lui-même (par ex. `git`, `gh`, `tput`, un sous-outil). La seule résolution `npx` compte comme `true`. |
| `filesystem_write` | `boolean` | L'entrée écrit des fichiers **en dehors** des racines sûres : `$HOME/.cache`, `$TMPDIR`, le répertoire d'installation. Les écritures à l'intérieur de ces emplacements sont autorisées par défaut et ne sont pas signalées. À mettre à `true` si l'entrée persiste un état dans `$HOME/<dotfile>` ou similaire. |
| `env_read` | `string[]` | Noms des variables d'environnement que l'entrée prévoit de lire. Valeur par défaut conservatrice : `["HOME", "PATH"]`. Utilisez `["*"]` pour signifier « toutes » — et ajoutez un champ `notes` pour le justifier. |
| `verified_at` | `string \| null` | Date ISO de la dernière observation en bac à sable correspondant aux déclarations. `null` = déclaré mais pas encore vérifié. |
| `verification_method` | `"declared" \| "sandbox-strace" \| "sandbox-bpf" \| "skipped"` | Méthode utilisée pour la vérification. `declared` = simple auto-déclaration ; `sandbox-strace` = observé sous `strace` à l'intérieur de `firejail`/`bubblewrap` ; `skipped` = le type d'installation (`manual`, `brew`, `cargo`) n'est pas encore mis en bac à sable. |

## Ce que chacun impose

La déclaration de capacité est appliquée à deux endroits :

1. **`bin/statuslines.js doctor`** — le validateur de schéma émet un *avertissement* lorsque `capabilities` est absent d'une entrée redistribuable. Cet avertissement deviendra une erreur bloquante une fois que toutes les entrées auront été complétées rétroactivement (déploiement : voir `SECURITY.md`).
2. **Workflow `catalog-capabilities`** — exécute `node scripts/verify-capabilities.mjs <slug>` pour chaque entrée redistribuable disposant d'une installation automatisable (`npx`, `npm-global`, `opencode-plugin`, `git`). Si le comportement observé dépasse la déclaration, l'entrée est mise en quarantaine (`security.quarantined: true`) avec un motif consigné sous `security.quarantine_reason`. Les entrées conformes voient leur `verified_at` et leur `verification_method` rafraîchis.

Les « racines sûres » pour `filesystem_write` sont volontairement étroites :

- `$HOME/.cache/` — `npm`/`npx` y mettent en cache leurs tarballs ; c'est attendu.
- `$TMPDIR` (typiquement `/tmp` sous Linux) — les fichiers temporaires de courte durée sont autorisés.
- Le répertoire d'installation pour les entrées `git` (`~/.local/share/statuslines/<clone_dir>`).

Une écriture dans `$HOME/.config/<tool>` ou `$HOME/.<tool>rc` n'est **pas** autorisée par défaut — déclarez `filesystem_write: true` et expliquez dans `notes`.

## Fonctionnement du bac à sable

`scripts/verify-capabilities.mjs` exécute l'installation ou la première invocation sous (par ordre de préférence) :

1. **`firejail --noprofile --net={none|eth0}`** — préféré sur `ubuntu-latest`. Deux passes : `--net=none` d'abord pour détecter si le réseau est *réellement requis*, puis `--net=eth0` avec `strace -f -e trace=network,process,%file` afin de capturer la trace des appels système.
2. **`bubblewrap` (`bwrap`)** — solution de repli si `firejail` n'est pas dans le `PATH`. Isolation équivalente, invocation un peu plus verbeuse.
3. **`strace` seul** — solution de dernier recours lorsque ni l'un ni l'autre des bacs à sable n'est disponible. Avertissement bruyant sur stderr ; l'intégration continue ne s'appuie jamais sur ce chemin.

Le filtre `strace` que nous avons retenu est :

```
strace -f -e trace=network,process,%file -o <log>
```

`network` couvre `connect()`, `sendto()`, `bind()` (résolution d'hôte, TLS sortant) ; `process` couvre `execve()`, `clone()`, `fork()` ; `%file` couvre `openat()`/`open()` avec des indicateurs d'écriture. Suivre les forks (`-f`) est obligatoire — `npm` et `npx` se ramifient agressivement.

## Valeurs par défaut pour l'amorçage

Lors du remplissage rétroactif d'une nouvelle entrée, partez des valeurs par défaut *les plus permissives* et laissez le bac à sable les resserrer :

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

`network: true` est correct pour presque toutes les entrées — elles appellent le registre npm, récupèrent des jetons, vérifient les mises à jour. `child_process: true` est vrai pour les installations `git` et la plupart des paquets `npm`. `filesystem_write: false` est la valeur prudente par défaut ; le bac à sable nous indiquera si c'est réellement nécessaire. `env_read` est conservateur à dessein ; augmentez-le explicitement lorsque vous découvrez que l'outil lit `ANTHROPIC_API_KEY`, `CLAUDE_CONFIG_DIR`, etc.

## Flux de contribution

Lorsque vous ajoutez ou mettez à jour une entrée :

1. **Déclarez** le bloc de capacités avec les valeurs par défaut les plus permissives (ci-dessus) si vous n'êtes pas sûr — le bac à sable les restreindra.
2. **Exécutez localement** si vous avez `firejail` installé : `node scripts/verify-capabilities.mjs <slug>`. Inspectez le rapport JSON ; si `exceeds_declared: true`, soit resserrez le code réel, soit élargissez la déclaration.
3. **Test de fumée** sans bac à sable : `node bin/statuslines.js verify-capabilities <slug> --dry-run` affiche la forme préenregistrée du rapport.
4. **Ouvrez la PR.** Le workflow hebdomadaire `catalog-capabilities` re-vérifiera indépendamment sur `ubuntu-latest`. Si votre déclaration est honnête, la PR du bot rafraîchira simplement `verified_at`. Sinon, votre entrée est mise en quarantaine et un relecteur prendra contact avec vous.

## Pourquoi ces quatre dimensions

- **`network`** — la surface d'attaque la plus courante de la chaîne d'approvisionnement. Récupérer une charge utile supplémentaire au premier lancement, émettre vers de la télémétrie, exfiltrer des variables d'environnement.
- **`child_process`** — un outil qui lance `sh -c` ou `bash` est extrêmement plus dangereux qu'un outil qui se contente de calculer. Déclarer `child_process: false` est une affirmation forte et vérifiable par machine.
- **`filesystem_write`** — les collecteurs d'identifiants déposent fréquemment un fichier marqueur ou réécrivent les fichiers `rc` du shell. Restreindre les écritures à des racines connues comme sûres rend ces comportements immédiatement détectables sous `strace`.
- **`env_read`** — les variables d'environnement sont le moyen par lequel les secrets circulent ; un outil de statusline qui lit `OPENAI_API_KEY` doit en expliquer la *raison*.

Nous ne déclarons délibérément *pas* `cpu`, `memory` ni `time` — le catalogue n'héberge pas de politique de quotas à l'exécution, et les statuslines sont de courte durée. La phase G concerne le consentement, pas le contrôle des ressources.

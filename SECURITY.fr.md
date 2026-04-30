# Sécurité

**Langues :** [English](./SECURITY.md) · Français · [日本語](./SECURITY.ja.md)

Le catalogue résout automatiquement le code tiers en commandes d'installation
que les utilisateurs exécutent avec les pleins privilèges du shell. Prendre
cette surface au sérieux implique des défenses en couches, et non la
confiance accordée à un seul outil.

## Modèle de menace (version courte)

| # | Menace | Précédent réel | Mesures d'atténuation |
|---|---|---|---|
| T1 | Compromission de compte mainteneur republiant une version malveillante | npm `event-stream`, `ua-parser-js` | versions épinglées, empreintes d'intégrité, flux Socket.dev, diff de montée de version |
| T2 | Scripts postinstall exécutés via `npx` | trivial ; omniprésent | `--ignore-scripts` par défaut, détection `has_install_scripts` |
| T3 | Typosquatting / paquet sosie | « claudeline » possède deux upstreams distincts | nommage `<owner>-<slug>`, application par le doctor |
| T4 | Régression de licence en amont | rare mais réelle | sonde de vivacité hebdomadaire revérifiant la licence du registre |
| T5 | Dépôt supprimé / transféré / 301 | les transferts de paquets npm arrivent | la sonde de vivacité émet un HEAD sur chaque dépôt quotidiennement |
| T6 | Malveillance via git-HEAD | auto-sabotage de `colors.js`, `faker.js` | les entrées git sont épinglées sur un SHA de commit ou un tag signé |
| T7 | CVE dans les dépendances transitives | rotation constante de npm | analyse de joignabilité Datadog SCA |
| T8 | curl-pipe-bash | refusé au niveau du doctor |
| T9 | PR de catalogue malveillante | possible | vérifications de motifs par le doctor (`curl|sh`, `eval(`, `<repository-url>`, `@latest`) |

## Couches de défense (statut)

| Couche | Description | Statut |
|---|---|---|
| Application du schéma | `doctor` refuse les versions non épinglées, les motifs dangereux, les motifs de quarantaine manquants | ✅ livré (Phase A) |
| Détection postinstall | `audit` signale les paquets npm déclarant des scripts de cycle de vie | ✅ livré |
| `--ignore-scripts` par défaut | `configure` injecte `--ignore-scripts` dans les recettes `npx` | ✅ livré |
| Masquage en quarantaine | OpenBSD-style : les entrées en quarantaine disparaissent de `list`/`show`/`configure` | ✅ livré |
| Sonde de vivacité | HEAD quotidien sur les dépôts + correspondance de version du registre npm + dérive de licence | ✅ livré (sans secrets) |
| Datadog SAST | analyse statique à base de règles sur notre propre code | branché (le workflow atterrit gardé par secret) |
| Datadog SCA | SBOM + vulnérabilités + joignabilité sur nos dépendances | branché |
| Datadog SAIST | SAST augmenté par IA, double passe détection+validation | branché (actuellement Java/Python/Go uniquement en amont) |
| Flux Socket.dev | recherche horaire d'alertes de paquets malveillants | branché |
| Bot de diff de montée de version | diff de tarball sur chaque PR de mise à jour | prévu (Phase E) |
| Signature PQC | hybride Ed25519 + SLH-DSA sur les entrées du catalogue | prévu (Phase F) |
| Bac à sable de capacités | déclarations de permissions réseau/système de fichiers par entrée | prévu (Phase G) |

## Configuration requise du dépôt

Les workflows sont en *fail closed* (échec en sécurité) si leurs secrets ne
sont pas définis — ils affichent un avertissement et se terminent
proprement, de sorte que ce dépôt peut être fusionné en toute sécurité
avant l'arrivée des clés. Pour activer chaque couche, configurez ces
valeurs dans **Settings → Secrets and variables → Actions** :

| Nom du secret | Utilisé par | Requis ? |
|---|---|---|
| `DD_API_KEY` | datadog-sast-self.yml, datadog-sca-self.yml, datadog-saist-self.yml | pour SAST/SCA/SAIST |
| `DD_APP_KEY` | idem — nécessite la portée `code_analysis_read` | pour SAST/SCA |
| `OLLAMA_API_KEY` | datadog-saist-self.yml — bearer Ollama Cloud | pour SAIST |
| `SOCKET_API_TOKEN` | catalog-socket-feed.yml | pour le flux quotidien de risque des paquets npm |

**Variables** de dépôt optionnelles (pas des secrets) :

| Variable | Valeur par défaut | Utilisée par |
|---|---|---|
| `DD_SITE` | `datadoghq.com` | workflows SAST/SCA/SAIST |
| `OPENAI_BASE_URL` | `https://ollama.com` | workflow SAIST — Ollama Cloud est compatible OpenAI. **Ne pas inclure `/v1`** — le client OpenAI de SAIST l'ajoute en interne (vérifié dans `internal/clients/openai.go`) ; un double `/v1` casserait la requête. |
| `SAIST_DETECTION_MODEL` | selon le workflow | passe de détection SAIST |
| `SAIST_VALIDATION_MODEL` | selon le workflow | passe de validation SAIST |

## Signaler une vulnérabilité

Pour les problèmes dans le code ou la logique de workflow propres à ce
dépôt, veuillez ouvrir un GitHub security advisory plutôt qu'un ticket
public. Pour les problèmes dans les **entrées du catalogue** (paquets
tiers que nous référençons), signalez d'abord en amont ; nous mettrons en
quarantaine après confirmation.

## Audit

La dernière sonde de sécurité de chaque entrée est enregistrée dans
`security.last_audit` et l'empreinte d'intégrité ainsi que la licence
observée vivent à ses côtés. Les entrées en quarantaine sont listées dans
[`catalog/QUARANTINE.md`](catalog/QUARANTINE.md) indépendamment des
réglages de visibilité de la CLI — ce fichier constitue la trace
forensique explicite.

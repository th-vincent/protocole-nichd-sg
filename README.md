# Simulation d'audition NICHD

Prototype de jeu pédagogique pour s'entraîner au protocole NICHD (audition d'enfants) en gendarmerie.
L'enquêteur choisit ses interventions, et l'enfant réagit selon le type de question et selon son état (confiance, stress, contamination).

## Lancer le jeu

Ouvrez `index.html` dans un navigateur. Il n'y a rien à installer.
Pour le mettre en ligne, poussez le repo sur GitHub puis activez **Settings → Pages → branche `main`, dossier racine**.

## Structure

```
index.html                 interface (salle, enfant en SVG, panneau de choix)
style.css                  styles
js/moteur.js               moteur générique : état de l'enfant, conditions, débrief
scenarios/lea.js           scénario d'exemple (données uniquement)
outils/verifier-scenarios.js  vérifie les liens entre nœuds, les faits et les types
```

**Règle d'or : le moteur ne contient aucun contenu.** On écrit les scénarios dans `scenarios/` sans toucher au JS.

## Écrire un scénario

1. Copiez `scenarios/lea.js` dans un nouveau fichier, par exemple `scenarios/tom.js`, et changez la clé `window.SCENARIOS.tom`.
2. Ajoutez `<script src="scenarios/tom.js"></script>` dans `index.html`, avant `moteur.js`.
3. Lancez `node outils/verifier-scenarios.js` (Node.js requis) pour repérer les liens cassés et les nœuds inatteignables.

Le format est documenté en tête de `scenarios/lea.js`. Les éléments principaux :

| Élément | Rôle |
|---|---|
| `faits` | La « vérité terrain ». `fiable: false` désigne un détail introduit par l'enquêteur (contamination). |
| `enfant` | Une réplique fixe, ou des variantes conditionnelles (`si: { stress_min: 7 }` …). |
| `choix[].type` | `invitation`, `invitation_indicee`, `directive`, `choix`, `suggestive`, `consigne`, `inadaptee`. |
| `choix[].effets` | Variation de la confiance et du stress (échelle de 0 à 10). |
| `choix[].suivant` | Le nœud suivant, éventuellement conditionnel (`[{ si: {...}, vers: "x" }, { vers: "y" }]`). |
| `faitsAuto` | Les faits que l'enfant révèle dès qu'on arrive sur ce nœud. |

## Travailler à 4

- Une branche par tâche, puis une pull request relue par une autre personne avant de fusionner.
- Utilisez les issues GitHub pour se répartir le travail : moteur/UI, scénarios, comportement de l'enfant, débrief/évaluation.
- Lancez le vérificateur avant chaque PR qui touche un scénario.

## Pistes

- Réponses de l'enfant plus courtes à mesure que le stress monte, et apparition de la fatigue.
- Plusieurs profils d'enfant (âge, timidité, enfant qui acquiesce facilement).
- Saisie libre de la question, classée automatiquement par type.
- Export du débrief pour le formateur.

> Scénario fictif. Le contenu doit être validé par un formateur NICHD.

# Salle Mélanie : simulation d'audition NICHD

Prototype de jeu pédagogique pour s'entraîner au protocole NICHD (audition d'enfants) en gendarmerie.
On attend dans le couloir de la brigade et on lit le dossier épinglé au tableau, puis on ouvre la porte de la salle Mélanie et on mène l'audition.
L'enfant réagit selon le type d'intervention et selon son état (confiance, stress, contamination). On le voit à son attitude, à ses gestes et à ses réponses.

## Lancer le jeu

Ouvrez `index.html` dans un navigateur. Il n'y a rien à installer.
Pour le mettre en ligne, poussez le repo sur GitHub puis activez **Settings → Pages → branche `main`, dossier racine**.

Une connexion est demandée à l'ouverture (démonstration de produit sous licence) ; les identifiants sont fournis avec la licence. « Rester connecté sur ce poste » garde la session après fermeture du navigateur ; « Se déconnecter » est dans la barre du haut.

> La vérification se fait dans le navigateur (seule l'empreinte SHA-256 des identifiants est dans le code) : c'est une vitrine, pas une protection réelle. Pour changer les identifiants, voir l'en-tête de `js/licence.js`.

## Structure

```
index.html                    couloir (liège + porte), salle (décor, enfant SVG animé, console, transcription),
                              débrief, fiches « Protocole NICHD » et « Comment jouer »
style.css                     styles et animations de l'enfant (expressions, agitation, réactions)
js/licence.js                 écran de connexion (licence) : identifiants, session, déconnexion
js/moteur.js                  moteur générique : état, conditions, silence, soutien, frappe du texte, débrief
scenarios/lea.js              Léa, 8 ans, victime (le format complet est documenté en tête du fichier)
scenarios/noah.js             Noah, 6 ans, témoin (conflit de loyauté, récit déjà influencé par les adultes)
outils/verifier-scenarios.js  vérifie liens, faits, types, conditions et nœuds inatteignables
```

**Règle d'or : le moteur ne contient aucun contenu.** On écrit les scénarios dans `scenarios/` sans toucher au JS.

## Où modifier quoi

| Je veux… | Où |
|---|---|
| Changer un dialogue, ajouter une question ou une branche | `scenarios/*.js` |
| Changer les post-it du couloir | `dossier.postits` dans le scénario |
| Changer l'apparence d'un enfant (couleurs, coiffure, doudou) | `apparence` dans le scénario |
| Ajuster la notation ou les recommandations du débrief | `afficherDebrief()` et `recommandations()` dans `js/moteur.js` |
| Changer l'effet du stress sur les questions | `ajusterSelonEtat()`, `choixSilence()` et `soutienGenerique()` dans `js/moteur.js` |
| Changer les phrases d'observation (« Léa agite les jambes… ») | `OBSERVATIONS` dans `js/moteur.js`, ou `observations` dans un scénario |
| Modifier le résumé du protocole | `<dialog id="dlg-protocole">` dans `index.html` |
| Retoucher le couloir, la porte, la salle | `index.html` (SVG et HTML) et `style.css` |
| Régler les animations de l'enfant | section « l'enfant » de `style.css` |

## Écrire un scénario

1. Copiez `scenarios/lea.js` dans un nouveau fichier, par exemple `scenarios/tom.js`, et changez la clé `window.SCENARIOS.tom`.
2. Ajoutez `<script src="scenarios/tom.js"></script>` dans `index.html`, avant `moteur.js`.
3. Lancez `node outils/verifier-scenarios.js` (Node.js requis).

Les éléments principaux :

| Élément | Rôle |
|---|---|
| `faits` | La vérité terrain. `fiable: false` désigne un élément introduit par l'enquêteur (contamination). |
| `enfant` | Une réplique fixe, ou des variantes conditionnelles (`si: { stress_min: 7 }`…). |
| `choix[].type` | `invitation`, `invitation_indicee`, `soutien`, `directive`, `choix`, `suggestive`, `consigne`, `inadaptee`. |
| `choix[].qualite` | De -2 (contaminant) à 2 (conforme). Les mauvaises réponses doivent **ressembler** aux bonnes. |
| `choix[].reponse` | La réplique de l'enfant à cette question. Sans `suivant`, on reste sur le nœud : c'est pratique pour les questions de précision. |
| `choix[].selon` | Variantes selon l'état : même question, mais un feedback ou une note différente si l'enfant est stressé. |
| `choix[].mieux` | Formulation recommandée, affichée dans le débrief phrase par phrase. |
| `choix[].marque` | Drapeau réutilisable dans les conditions (`marques`, `sans_marques`). |
| `silence` | Réaction de l'enfant si l'enquêteur ne dit rien (sinon le moteur applique une réaction par défaut). |
| `faitsAuto` | Les faits que l'enfant révèle quand il prononce la réplique du nœud. |

Le moteur ajoute automatiquement :
- **le silence** (touche 0). Il est utile en récit libre, pesant en introduction, s'il est répété ou si l'enfant est stressé ;
- **une phrase de soutien** dès que le stress atteint 7 ;
- **une pénalité** pour les questions directives ou fermées posées à un enfant très stressé, qui fait encore monter son stress. Il faut ralentir.

## Travailler à 4

- Une branche par tâche, puis une pull request relue par une autre personne avant de fusionner.
- Utilisez les issues GitHub pour vous répartir le travail : moteur/UI, scénarios, comportement de l'enfant, débrief/évaluation.
- Lancez le vérificateur avant chaque PR qui touche un scénario.

## Pistes

- Saisie libre de la question, classée automatiquement par type.
- Fatigue de l'enfant au fil de l'audition.
- Profils d'enfant (timide, qui acquiesce facilement, adolescent).
- Pause « derrière la vitre » pour relire ses notes et consulter un collègue.
- Export du débrief (PDF) pour le formateur.

> Scénarios fictifs. Le contenu doit être validé par un formateur NICHD.

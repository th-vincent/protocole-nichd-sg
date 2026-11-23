# Salle Mélanie : simulation d'audition NICHD

Prototype de jeu pédagogique pour s'entraîner au protocole NICHD (audition d'enfants) en gendarmerie.
On attend dans le couloir de la brigade et on lit le dossier épinglé au tableau, puis on ouvre la porte de la salle Mélanie et on mène l'audition.
L'enfant réagit selon le type d'intervention et selon son état (confiance, stress, contamination). On le voit à son attitude, à ses gestes et à ses réponses.

## Lancer le jeu

```
python3 outils/lancer.py
```

Le lanceur installe l'IA de la saisie libre sur le PC au premier lancement (~140 Mo, une seule fois), démarre un petit serveur local et ouvre le navigateur. L'IA se charge alors depuis le disque dès l'ouverture de la page, en quelques secondes et sans connexion.

Il faut un serveur local, car un navigateur interdit à une page ouverte en double-clic de lire d'autres fichiers du disque. Pour installer l'IA sans lancer le jeu : `python3 outils/telecharger-ia.py`.

Il reste possible d'ouvrir `index.html` en double-clic : tout fonctionne, mais l'IA est alors téléchargée depuis internet à la première utilisation.

Pour mettre le jeu en ligne, poussez le repo sur GitHub puis activez **Settings → Pages → branche `main`, dossier racine**. Les dossiers `modeles/` et `vendor/` ne sont pas versionnés (le modèle dépasse la limite de 100 Mo de GitHub) : en ligne, l'IA vient d'internet.

## Structure

```
index.html                    couloir (liège + porte), salle (décor, enfant SVG animé, console, transcription),
                              débrief, fiches « Protocole NICHD » et « Comment jouer »
style.css                     styles et animations de l'enfant (expressions, agitation, réactions)
js/classifieur.js             règles de classement des questions tapées (saisie libre)
js/ia.js                      petite IA locale (sens des phrases), chargée depuis un CDN
js/ia-exemples.js             exemples annotés pour l'IA + questions courantes (« Comment ça va ? »)
js/moteur.js                  moteur générique : état, conditions, silence, soutien, frappe du texte, débrief
scenarios/lea.js              Léa, 8 ans, victime (le format complet est documenté en tête du fichier)
scenarios/noah.js             Noah, 6 ans, témoin (conflit de loyauté, récit déjà influencé par les adultes)
outils/verifier-scenarios.js  vérifie liens, faits, types, conditions et nœuds inatteignables
outils/lancer.py              lance le jeu (serveur local) et installe l'IA si besoin
outils/telecharger-ia.py      installe l'IA sur le PC (modeles/ et vendor/, ignorés par git)
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

## Saisie libre (Léa pour l'instant)

Cochez « Saisie libre » sur la fiche du couloir : le gendarme tape ses questions au lieu de les choisir.

**Une petite IA locale** ([js/ia.js](js/ia.js)) comprend le sens des phrases. C'est un modèle d'embeddings multilingue (`paraphrase-multilingual-MiniLM-L12-v2` via transformers.js).
- Il tourne dans le navigateur : pas de clé ni de serveur, et rien de ce qui est tapé ne quitte la machine.
- Il pèse environ 120 Mo, téléchargés une seule fois (dès que la case est cochée) puis gardés en cache.
- Hors ligne, le jeu bascule automatiquement sur les règles seules.

Pour chaque phrase tapée, l'analyse se fait en trois temps :
1. [js/classifieur.js](js/classifieur.js) applique ses règles. Il repère le type de question, les éléments contaminants (des mots du dossier que l'enfant n'a pas encore dits), le ton, et les questions incompréhensibles : double question, jargon, phrase trop longue. L'enfant est alors perdu : « Je comprends pas… ».
2. L'IA compare la phrase aux exemples de [js/ia-exemples.js](js/ia-exemples.js). Elle reconnaît les questions courantes (« Comment ça va ? », « Tu veux de l'eau ? », « Tu veux une pause ? », « d'accord », « je vois ») et tranche les cas où les règles hésitent.
3. Le moteur **classe la phrase parmi les réponses possibles de l'étape en cours** (`classerDansNoeud` dans `js/classifieur.js`). Les candidates sont :
   - les propositions du nœud ;
   - ses branches `libre` ;
   - les branches `saisieLibre.globaux` autorisées dans cette phase.

   Chacune reçoit un score qui combine le sens (IA), l'accord du type de question, les `motsCles` et les prénoms. L'étape en cours passe avant les branches globales, et un mot-clé explicite de l'étape l'emporte toujours. Une invitation ou un soutien sans correspondance prend la sortie de l'étape la plus proche en sens. La réaction générique selon le type n'intervient qu'en dernier recours.

Garde-fous :
- une proposition qui introduit un élément contaminant n'est jamais choisie si l'enquêteur ne l'a pas tapé ;
- les prénoms (`saisieLibre.noms`) empêchent de confondre « Inès, c'est qui ? » et « Kévin, c'est qui ? » ;
- une question précise reposée, même reformulée, donne « Je te l'ai déjà dit… ».

**Pour améliorer la compréhension**, le plus efficace est d'ajouter des formulations réelles :
- dans [js/ia-exemples.js](js/ia-exemples.js), pour le type de question ou une nouvelle question courante ;
- ou dans le champ `exemples` d'une proposition ou d'une branche du scénario.

Le débrief indique, pour chaque phrase, comment elle a été interprétée.

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

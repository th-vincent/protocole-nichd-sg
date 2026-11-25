# Salle Mélanie : simulation d'audition NICHD

Prototype de jeu pédagogique pour s'entraîner au protocole NICHD (audition d'enfants) en gendarmerie.
On attend dans le couloir de la brigade et on lit le dossier épinglé au tableau, puis on ouvre la porte de la salle Mélanie et on mène l'audition.
L'enfant réagit selon le type d'intervention et selon son état (confiance, stress, contamination). On le voit à son attitude, à ses gestes et à ses réponses.

## Lancer le jeu

```
python3 outils/lancer.py
```

Au premier lancement, le lanceur installe les IA de la saisie libre sur le PC, une seule fois : l'IA de compréhension (~140 Mo) et le petit LLM (llama.cpp + Qwen2.5 1,5B, ~1,1 Go). Il démarre ensuite le LLM et un petit serveur local, puis ouvre le navigateur.

Le LLM a besoin d'environ 1,2 Go de mémoire libre : fermez les applications gourmandes, ou lancez `python3 outils/lancer.py --sans-llm` (les réponses de l'enfant sont alors celles écrites dans le scénario). L'IA se charge alors depuis le disque dès l'ouverture de la page, en quelques secondes et sans connexion.

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
js/llm.js                     petit LLM local : formule les réponses de l'enfant avec ses mots (garde-fou inclus)
js/moteur.js                  moteur générique : état, conditions, silence, soutien, frappe du texte, débrief
scenarios/lea.js              Léa, 8 ans, victime (le format complet est documenté en tête du fichier)
scenarios/lea.libre.js        Léa : ~240 options supplémentaires par phase et indices par étape, pour la saisie libre
scenarios/lea.naturel.js      Léa : ~170 questions naturelles hors protocole strict (vie quotidienne, précisions, curiosité…) + banque « partout »
scenarios/lea.reformulations.js  Léa : ~660 autres façons de poser les questions du scénario
                              → au total, 73 à 103 questions possibles et 180 à 250 formulations par étape
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
3. Le moteur **classe la phrase parmi les réponses possibles de l'étape en cours** (une quarantaine par étape pour Léa) (`classerDansNoeud` dans `js/classifieur.js`). Les candidates sont :
   - les propositions du nœud ;
   - ses branches `libre` ;
   - la banque d'options de sa phase (`saisieLibre.parPhase`, dans [scenarios/lea.libre.js](scenarios/lea.libre.js)), éventuellement limitée à certaines étapes avec `si: { noeuds: [...] }` ;
   - les options de la phase suivante, quand l'enquêteur anticipe : elles mènent à l'étape d'entrée de cette phase (`saisieLibre.entrees`) ;
   - les branches `saisieLibre.globaux` autorisées dans cette phase.

   Chacune reçoit un score qui combine le sens (IA), l'accord du type de question, les `motsCles` et les prénoms. L'étape en cours passe avant les branches globales, et un mot-clé explicite de l'étape l'emporte toujours. Une invitation ou un soutien sans correspondance prend la sortie de l'étape la plus proche en sens. La réaction générique selon le type n'intervient qu'en dernier recours.

**Si l'enquêteur va trop vite** et que rien ne correspond dans l'étape en cours, la phrase est cherchée dans les étapes **plus loin** du protocole. Si une correspondance claire est trouvée, l'audition saute à cette étape et reprend à partir de là. Le retour précise les étapes sautées, rappelle pourquoi le protocole les prévoit et plafonne la note. Le débrief le signale aussi (« ⚠ Étapes sautées »).

Le saut a ses limites :
- il ne va que vers l'avant ;
- jamais vers le récit des faits, qui ne commence que lorsque l'enfant révèle ;
- dans la transition, seulement vers l'étape d'entrée ;
- une relance sans contenu (« Et après ? ») ne fait jamais sauter : il faut un vrai mot en commun, comme « anniversaire ».

Garde-fous :
- une proposition qui introduit un élément contaminant n'est jamais choisie si l'enquêteur ne l'a pas tapé ;
- les prénoms (`saisieLibre.noms`) empêchent de confondre « Inès, c'est qui ? » et « Kévin, c'est qui ? » ;
- une question précise reposée, même reformulée, donne « Je te l'ai déjà dit… ».

**Rapidité** : les phrases du scénario sont analysées dès le couloir, dans l'ordre du protocole, puis gardées dans le navigateur (IndexedDB). La première partie peut demander quelques secondes à chaque nouvelle phase ; les suivantes sont immédiates.

**Pour améliorer la compréhension**, le plus efficace est d'ajouter des formulations réelles :
- dans [js/ia-exemples.js](js/ia-exemples.js), pour le type de question ou une nouvelle question courante ;
- ou dans le champ `exemples` d'une proposition ou d'une branche du scénario.

Le débrief indique, pour chaque phrase, comment elle a été interprétée.

### Le petit LLM : l'enfant répond librement

En saisie libre, quand le LLM est lancé par `outils/lancer.py`, **l'enfant n'a plus de réponses préenregistrées** : le LLM ([js/llm.js](js/llm.js), Qwen2.5 1,5B en local) joue l'enfant. Il reçoit :

- sa fiche (`saisieLibre.personnage`) et ce qu'il a vécu (`saisieLibre.histoire`, la vérité terrain) ;
- l'historique de la conversation ;
- une **consigne du tour** donnée par le moteur :
  - son état (« tu es timide », « tu es très mal à l'aise ») ;
  - sa réaction (« tu ne comprends pas », « tu es intimidée : tu dis oui » face à une suggestion) ;
  - « ne parle pas encore de ce qui s'est passé » avant la transition ;
  - et, si la question se rattache à l'arbre, une **piste d'inspiration**, jamais recopiée telle quelle.

Pour une question de détail sans équivalent dans l'arbre, le moteur lui rappelle les phrases de son histoire les plus proches de la question, et l'enfant répond à partir de là.

**L'arbre reste le cadre pédagogique** : phases, saut d'étapes, note, retour NICHD, contaminations détectées dans la question. **Les faits recueillis sont ceux que l'enfant dit vraiment**, repérés dans sa réponse (`saisieLibre.detection`).

**Garde-fous** : une réponse est régénérée une fois, puis remplacée par la piste, si elle :
- sort du personnage (vouvoiement, consigne recopiée…) ;
- invente un élément de l'enquête absent de la question (« il m'a frappée ») ;
- aborde les faits trop tôt ;
- ou, pendant le récit, s'écarte de la piste au point d'en perdre l'essentiel (un petit modèle peut inverser un fait).

Comptez 3 à 10 s par réponse sur un PC modeste. Le débrief marque les réponses générées (✎ LLM).

## Indices pour l'enquêteur

Le bouton **💡 Besoin d'un indice ?** donne une consigne générale quand on ne sait pas quoi dire. Chaque clic en donne une plus précise, sans jamais fournir la phrase toute faite :

- **ordre des indices** : l'état de l'enfant d'abord, s'il est très tendu ou sur la réserve, puis les indices propres à l'étape (`saisieLibre.indices` dans `lea.libre.js`), puis les consignes générales de la phase (`INDICES` dans `js/moteur.js`, valables pour tous les scénarios) ;
- **exemple** : « Essayez de mettre Léa à l'aise », puis « Présentez-vous : qui vous êtes et en quoi consiste votre travail », puis un conseil de méthode.

Le débrief compte les indices demandés.

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

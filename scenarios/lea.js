/*
 * Scénario « Léa, 8 ans » : exemple FICTIF pour le prototype.
 * Chaque nœud = une réplique de l'enfant + les interventions proposées à l'enquêteur.
 *
 * ─── Scénario ───
 *   titre, prenom, age, genre ("f" | "m"), contexte, depart, etatInitial { confiance, stress } (0–10)
 *   dossier.postits : notes affichées sur le tableau en liège (ce que l'enquêteur sait avant d'entrer)
 *   apparence       : { peau, cheveux, pull, pullFonce, pantalon, chaussure, coiffure: "couettes"|"court", accessoire: ""|"lapin" }
 *   soutiens        : (optionnel) phrases de soutien proposées automatiquement quand le stress atteint 7
 *   faits           : vérité terrain. fiable:false = élément introduit par l'enquêteur (contamination)
 *
 * ─── Nœud ───
 *   phase      : introduction | regles | rapport | memoire | transition | recit | cloture
 *   enfant     : texte, OU liste de variantes [{ si: {...}, texte, expression?, didascalie? }] (la 1re qui correspond gagne)
 *   didascalie : (optionnel) attitude de l'enfant, affichée en haut de l'écran
 *   expression : (optionnel) neutre | detendu | inquiet | triste | ferme (sinon déduite du stress et de la confiance)
 *   faitsAuto / faitsAutoSi : faits livrés quand l'enfant prononce la réplique du nœud
 *   silence    : (optionnel) réaction si l'enquêteur ne dit rien (même format qu'un choix, sans question)
 *   choix      : interventions possibles
 *   fin        : true pour terminer l'audition
 *
 * ─── Choix ───
 *   question : ce que dit l'enquêteur
 *   type     : invitation | invitation_indicee | soutien | directive | choix | suggestive | consigne | inadaptee
 *   qualite  : (optionnel) -2 à 2 ; sinon note par défaut du type
 *   effets   : { confiance: +n, stress: +n }
 *   faits    : faits recueillis (ou contaminés) par cette intervention
 *   marque   : drapeau(x) posé(s) pour plus tard (voir conditions marques / sans_marques)
 *   feedback : explication pédagogique (retour immédiat et débrief)
 *   mieux    : (optionnel) formulation recommandée, montrée dans le débrief
 *   reponse  : (optionnel) réplique de l'enfant à CETTE question (texte, objet ou variantes)
 *   suivant  : nœud suivant, ou [{ si, vers }, { vers }]. Absent = on reste sur le nœud
 *              (le choix disparaît alors de la liste une fois utilisé)
 *   si       : condition pour que le choix soit proposé
 *   selon    : variantes selon l'état [{ si, ...champs remplacés }], ex. feedback différent si l'enfant est stressé
 *
 * ─── Conditions `si` ───
 *   confiance_min/max, stress_min/max, contamination_min/max,
 *   faits: [...] (déjà recueillis), sans_faits: [...], marques: [...], sans_marques: [...]
 *
 * Le moteur ajoute de lui-même : le bouton « silence », une phrase de soutien quand le stress
 * atteint 7, et une pénalité aux questions directives/fermées posées à un enfant très stressé.
 */
window.SCENARIOS = window.SCENARIOS || {};
window.SCENARIOS.lea = {
  titre: "Léa, 8 ans",
  prenom: "Léa",
  age: "8 ans · victime",
  genre: "f",
  contexte: "Signalement de l'enseignante : Léa aurait été blessée au bras par un adulte du centre de loisirs. Audition filmée en salle Mélanie.",
  depart: "intro",
  etatInitial: { confiance: 3, stress: 4, contamination: 0 },
  dossier: {
    postits: [
      "Léa M., 8 ans, en CE2",
      "Signalement de la maîtresse, lundi",
      "Propos rapportés : « un adulte du centre m'a fait mal au bras »",
      "Centre de loisirs : le mercredi",
      "Maman est en salle d'attente"
    ]
  },
  apparence: { peau: "#f2c6a0", peauOmbre: "#dfae88", cheveux: "#5a3825", pull: "#e8b13a", pullFonce: "#d69e28", coiffure: "couettes" },

  faits: {
    lieu_date:   { texte: "Les faits ont eu lieu mercredi, au centre de loisirs", fiable: true },
    auteur:      { texte: "Kévin lui a attrapé le bras et l'a serré fort", fiable: true },
    identite:    { texte: "Kévin est animateur au centre, il porte des lunettes", fiable: true },
    contexte:    { texte: "C'était au moment de ranger les jeux ; Léa voulait finir son dessin", fiable: true },
    insistance:  { texte: "Léa lui a dit qu'il lui faisait mal, il n'a pas lâché", fiable: true },
    temoin:      { texte: "Inès, une camarade, a vu la scène et l'a consolée", fiable: true },
    marque:      { texte: "Une marque violette sur l'avant-bras gauche", fiable: true },
    photo:       { texte: "Sa mère a pris la marque en photo", fiable: true },
    frequence:   { texte: "C'est arrivé une seule fois", fiable: true },
    cognee:      { texte: "Léa a d'abord dit à sa mère qu'elle s'était cognée", fiable: true },
    peur_gronder:{ texte: "Elle n'a rien dit tout de suite par peur que Kévin, et elle, se fassent gronder", fiable: true },
    phrase:      { texte: "Kévin lui a dit : « La prochaine fois, tu ranges quand on te dit »", fiable: true },
    revelation:  { texte: "Elle en a parlé d'abord à Inès, puis à la maîtresse lundi (qui a vu la marque en sport)", fiable: true },
    c_adulte:    { texte: "« L'adulte / le monsieur du centre » : formulation introduite par l'enquêteur", fiable: false },
    c_bras:      { texte: "« Le bras » évoqué par l'enquêteur avant Léa", fiable: false },
    c_centre:    { texte: "Le centre de loisirs évoqué par l'enquêteur avant Léa", fiable: false },
    c_mal:       { texte: "L'idée qu'on lui a « fait du mal », introduite par l'enquêteur", fiable: false },
    c_frappe:    { texte: "Kévin l'aurait frappée (suggéré par l'enquêteur, non vécu)", fiable: false },
    c_pousse:    { texte: "Kévin l'aurait poussée (option proposée par l'enquêteur, reprise avec « je crois »)", fiable: false },
    c_peur:      { texte: "La peur, émotion attribuée à Léa par l'enquêteur", fiable: false },
    c_desobeir:  { texte: "L'idée que Léa a « désobéi », suggérée par l'enquêteur", fiable: false },
    c_souvent:   { texte: "L'idée de faits répétés, suggérée par l'enquêteur", fiable: false }
  },

  /* ───────────── SAISIE LIBRE ─────────────
   * contaminations : mots (regex sur le texte sans accents, en minuscules) qui introduisent un élément
   *                  que l'enfant n'a pas encore donné. `sauf` : faits qui, une fois dits par l'enfant, rendent le mot légitime.
   * globaux        : branches proposées dans tout nœud des `phases` listées, quand rien de plus proche n'existe dans le nœud.
   *                  motsCles : regex qui déclenche la branche ; typesLibres : types de question acceptés.
   */
  saisieLibre: {
    noms: ["Léa", "Kévin", "Inès", "Hugo", "Lucas", "Mathis"],
    contaminations: [
      { motif: "\\bbras\\b", fait: "c_bras", sauf: ["auteur"] },
      { motif: "\\b(monsieur|adulte|homme)\\b", fait: "c_adulte" },
      { motif: "\\b(animateur|kevin)\\b", fait: "c_adulte", sauf: ["auteur"] },
      { motif: "\\bcentre\\b", fait: "c_centre", sauf: ["lieu_date"] },
      { motif: "frapp|\\btap(e|er|ait|ee)\\b|gifl|\\bcoups?\\b|\\bbattu", fait: "c_frappe" },
      { motif: "pouss", fait: "c_pousse" },
      { motif: "(eu|avoir|fait|faisait)( tres| si| super| trop)? peur|effray|terrifi|\\bpeur\\b.*\\?", fait: "c_peur" },
      { motif: "desob|obei", fait: "c_desobeir" },
      { motif: "(fait|faire|fais|faisait) (du )?mal|blesse", fait: "c_mal", sauf: ["auteur"] },
      { motif: "souvent|tout le temps|chaque (fois|mercredi)|il fait toujours|il recommence", fait: "c_souvent" }
    ],
    globaux: [
      { phases: ["rapport"], typesLibres: ["invitation", "invitation_indicee"], type: "invitation", effets: { confiance: 2, stress: -1 },
exemples: ["Parle-moi de toi.", "Raconte-moi ce que tu fais quand tu n'es pas à l'école.", "Qu'est-ce que tu fais pendant ton temps libre ?", "Parle-moi de ce que tu aimes.", "Raconte-moi tes passions."],
        motsCles: "(aimes?|adores?)( bien)? (faire|jouer)|ce que tu aimes|te connaitre|parle-moi (un peu )?de toi|tes loisirs|passions?|tu fais quoi (le|quand|apres|pendant)|pas a l'ecole",
        question: "Raconte-moi les choses que tu aimes faire.",
        feedback: "Invitation ouverte en phase de rapport : l'enfant parle de ce qu'elle aime et s'habitue aux réponses longues.",
        suivant: "rapport_2" },
      { phases: ["introduction", "regles"], typesLibres: ["invitation", "invitation_indicee"], type: "invitation", qualite: 0, effets: { confiance: 1 },
exemples: ["Parle-moi de toi.", "Raconte-moi ce que tu fais quand tu n'es pas à l'école.", "Qu'est-ce que tu fais pendant ton temps libre ?", "Parle-moi de ce que tu aimes.", "Raconte-moi tes passions."],
        motsCles: "(aimes?|adores?)( bien)? (faire|jouer)|ce que tu aimes|te connaitre|parle-moi (un peu )?de toi|tes loisirs|passions?|pas a l'ecole",
        question: "Raconte-moi les choses que tu aimes faire.",
        feedback: "Bonne invitation de rapport, mais vous sautez le cadre : présentation (rôle, caméra) et règles de base n'ont pas été posées.",
        selon: [
          { si: { marques: ["corrige", "comprend", "promesse"] }, qualite: 2, effets: { confiance: 2, stress: -1 }, feedback: "Règles posées et testées, puis invitation ouverte de rapport : parfait." },
          { si: { marques: ["corrige"] }, qualite: 1, effets: { confiance: 2, stress: -1 }, feedback: "Bonne invitation de rapport, mais toutes les règles n'ont pas été posées (« je ne comprends pas », promesse)." }
        ],
        suivant: "rapport_2" },
      { phases: ["introduction", "regles", "rapport"], typesLibres: ["directive", "choix"], type: "directive", qualite: 1, effets: { confiance: 1 },
        motsCles: "(aimes?|adores?)( bien)? (faire|jouer)|ce que tu aimes|tes loisirs|passions?",
        question: "Qu'est-ce que tu aimes faire ?",
        feedback: "Question correcte, mais elle appelle une liste. « Raconte-moi… » invite un vrai récit.",
        mieux: "Raconte-moi les choses que tu aimes faire.",
        suivant: "rapport_court" },
      { phases: ["rapport", "memoire"], typesLibres: ["invitation", "invitation_indicee"], type: "invitation",
        motsCles: "anniversaire",
        question: "Raconte-moi tout ce qui s'est passé à ton dernier anniversaire, du début à la fin.",
        feedback: "Entraînement à la mémoire épisodique sur un événement neutre et récent.",
        suivant: "memoire_2" },
      { phases: ["rapport", "memoire"], typesLibres: ["directive", "choix"], type: "directive", qualite: 1,
        motsCles: "anniversaire",
        question: "C'était quand, ton anniversaire ?",
        feedback: "Sujet bien choisi pour l'entraînement, mais posez-le en invitation : « Raconte-moi tout ce qui s'est passé à ton anniversaire, du début à la fin. »",
        reponse: "En mai. On a mangé un gâteau au chocolat." },
      { phases: ["rapport", "memoire"], typesLibres: ["invitation", "invitation_indicee"], type: "invitation",
        exemples: ["Raconte-moi ta matinée.", "Raconte-moi ce que tu as fait depuis que tu t'es levée.", "Qu'est-ce que tu as fait ce matin ?"],
        motsCles: "ce matin|aujourd'hui|depuis que tu t'es (reveill|leve)|ta matinee|ton week-end|hier",
        question: "Raconte-moi tout ce que tu as fait ce matin, depuis ton réveil.",
        feedback: "Entraînement à la mémoire épisodique sur un événement neutre et tout récent : très bon choix.",
        suivant: "memoire_matin" },
      { phases: ["transition"], type: "invitation",
        motsCles: "pourquoi tu es (la|venue?|ici)|pourquoi tu viens|pourquoi on se voit|ce qui t'amene|la raison",
        question: "Dis-moi pourquoi tu es venue me parler aujourd'hui.",
        feedback: "Transition par l'invitation la plus ouverte : c'est l'enfant qui introduit le sujet.",
        suivant: [{ si: { confiance_min: 5 }, vers: "recit" }, { vers: "transition_bloque" }] },
      { phases: ["introduction", "regles", "rapport", "memoire"], typesLibres: ["invitation", "invitation_indicee", "directive"], type: "invitation", qualite: 0, effets: { stress: 1 },
        motsCles: "pourquoi tu es (la|venue?|ici)|pourquoi tu viens|pourquoi on se voit|ce qui t'amene",
        question: "Dis-moi pourquoi tu es venue me parler aujourd'hui.",
        feedback: "Bonne formule de transition, mais beaucoup trop tôt : le cadre, le rapport et l'entraînement au récit ne sont pas faits.",
        suivant: [{ si: { confiance_min: 5 }, vers: "recit" }, { vers: "transition_bloque" }] },
      { phases: ["recit"], si: { faits: ["auteur"], sans_faits: ["revelation"] }, type: "directive", qualite: 2, faits: ["revelation"],
        motsCles: "premiere personne|a qui (tu |l'|en )?(as|avais) (dit|raconte|parle)|qui (d'autre )?(le )?(sait|savait)|tu en as parle a|tu l'as dit a",
        question: "Qui a été la première personne à savoir ce qui s'était passé ?",
        feedback: "Question sur la révélation, prévue par le protocole : elle éclaire à qui l'enfant a parlé, et donc les influences possibles.",
        reponse: "Inès. Et après la maîtresse, lundi, parce qu'elle a vu mon bras en sport." },
      { phases: ["recit"], si: { faits: ["auteur"], sans_faits: ["frequence"] }, type: "choix", qualite: 2, faits: ["frequence"],
        motsCles: "une fois ou|plus d'une fois|plusieurs fois|combien de fois|deja (arrive|passe)|d'autres fois|la premiere fois",
        question: "Est-ce que c'est arrivé une fois, ou plus d'une fois ?",
        feedback: "Question recommandée par le protocole pour distinguer un fait unique de faits répétés.",
        reponse: "Une fois. Juste mercredi." },
      { phases: ["recit"], si: { faits: ["auteur"], sans_faits: ["identite"] }, type: "directive", qualite: 1, faits: ["identite"],
        motsCles: "kevin.*(qui|c'est qui)|qui (est|c'est) kevin|c'est qui (kevin|le)",
        question: "Kévin, c'est qui ?",
        feedback: "Question directive utile sur une personne citée par l'enfant. Faites-la suivre d'une invitation (appariement).",
        reponse: "C'est l'animateur. Il a des lunettes." },
      { phases: ["recit"], si: { faits: ["temoin"] }, typesLibres: ["directive", "choix", "invitation", "invitation_indicee"], type: "directive", qualite: 1,
        motsCles: "\\bines\\b",
        question: "Inès, c'est qui ?",
        feedback: "Question directive sur une personne citée par l'enfant. Pensez à la faire suivre d'une invitation (appariement).",
        reponse: "C'est ma copine. Elle est dans ma classe. Elle m'a fait un câlin." },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 1, faits: ["insistance"],
        motsCles: "t'a fait quoi|qu'est-ce qu'il (t')?a fait|il a fait quoi|ce qu'il t'a fait",
        question: "Qu'est-ce qu'il t'a fait ?",
        feedback: "Question directive sur l'acte, déjà évoqué par Léa : la réponse reste dans ses mots. Une invitation (« Raconte-moi tout sur ce moment ») en aurait obtenu davantage.",
        mieux: "Tu as dit qu'il t'a attrapé le bras. Raconte-moi tout sur ce moment.",
        reponse: "Il m'a attrapé le bras et il a serré très fort. Je lui ai dit qu'il me faisait mal, mais il a pas lâché." },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 2,
        motsCles: "comment tu t'es sentie?|tu as ressenti|qu'est-ce que tu as ressenti|comment ca t'a fait|comment tu te sentais|tu te sentais comment",
        question: "Comment tu t'es sentie à ce moment-là ?",
        feedback: "Vous demandez l'émotion au lieu de la supposer : c'est la bonne façon de faire.",
        reponse: { texte: "J'avais mal. Et j'étais triste, parce que mon dessin il était pas fini.", expression: "triste" } },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 2, faits: ["phrase"],
        motsCles: "qu'est-ce qu'il (t')?a dit|il (t')?a dit (quoi|quelque chose)|ce qu'il (t')?a dit|il t'a parle|il a parle",
        question: "Qu'est-ce qu'il t'a dit ?",
        feedback: "Question directive sur un élément du récit (Kévin parlait) : elle fait émerger ses paroles exactes.",
        reponse: "Il a dit : « La prochaine fois, tu ranges quand on te dit. »" },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 0,
        motsCles: "habill|portait|vetement|couleur|t-shirt|\\bpull\\b|pantalon",
        question: "Il était habillé comment ?",
        feedback: "Détail périphérique : la réponse est incertaine (« je crois ») et n'apporte rien à l'enquête. Concentrez-vous sur ce que l'enfant a vécu.",
        reponse: "Je sais pas… un pull bleu, je crois." },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 1, faits: ["temoin"],
        motsCles: "d'autres (adultes|enfants|personnes|gens)|qui (d'autre )?etait (la|present)|quelqu'un (d'autre )?(a vu|etait la|regardait)|il y avait qui|y avait du monde|personne (n'a|a) vu",
        question: "Qui d'autre était là ?",
        feedback: "Question directive pertinente après le récit libre : elle fait apparaître un témoin.",
        reponse: "Inès, elle a vu. Les autres ils étaient dans la cour." },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 1,
        motsCles: "quelle heure|a quel moment|c'etait quand|quel jour|quand (est-ce que )?(c'est|ca s'est|ca c'est) (arrive|passe)",
        question: "C'était quand ?",
        feedback: "Léa donne un repère à sa portée (« après le goûter ») : à 8 ans, ne cherchez pas une heure précise.",
        reponse: "Mercredi. Après le goûter." },
      { phases: ["recit"], si: { faits: ["auteur"] }, type: "directive", qualite: 1,
        motsCles: "quel endroit|quelle salle|ou exactement|ou ca s'est passe|ou c'etait|ou etais-tu|tu etais ou|dans quelle piece",
        question: "Où est-ce que ça s'est passé ?",
        feedback: "Précision de lieu sur un élément déjà évoqué : correct.",
        reponse: "Dans la salle des jeux. Après il m'a emmenée dans le couloir." },
      { phases: ["recit"], si: { faits: ["marque"] }, type: "directive", qualite: 1, faits: ["photo"],
        motsCles: "montre|ou (est|etait) (la|ta) marque|la marque",
        question: "Tu peux me montrer où était la marque ?",
        feedback: "Demande de précision sur un détail donné par l'enfant.",
        reponse: { texte: "Là. C'était tout violet. Maman elle a fait une photo.", didascalie: "Léa montre son avant-bras gauche." } },
      { phases: ["recit"], si: { faits: ["auteur"], sans_faits: ["cognee"] }, typesLibres: ["invitation", "invitation_indicee"], type: "invitation_indicee", qualite: 2, faits: ["cognee"],
        motsCles: "\\bmaman\\b|ta mere",
        question: "Raconte-moi ce qui s'est passé quand tu as revu maman.",
        feedback: "Invitation ouverte qui fait émerger un détail important : Léa a d'abord caché la vérité à sa mère, typique d'une révélation différée.",
        reponse: { texte: "Elle a vu mon bras le soir. Elle m'a demandé ce qui s'était passé, et moi j'ai dit que je m'étais cognée.", expression: "triste" } },
      { phases: ["recit"], si: { faits: ["contexte"] }, typesLibres: ["invitation", "invitation_indicee"], type: "invitation_indicee", qualite: 2,
        motsCles: "dessin",
        question: "Tu as parlé de ton dessin. Raconte-moi tout sur ton dessin.",
        feedback: "Invitation indicée sur un mot de l'enfant : elle situe le contexte de la scène.",
        reponse: "C'était un cheval. Il était presque fini. Après, je l'ai plus retrouvé." },
      { phases: ["transition", "recit"], typesLibres: ["invitation", "invitation_indicee", "consigne", "directive"], type: "consigne", qualite: 0, effets: { stress: -2, confiance: 1 },
        motsCles: "une pause|d'autre chose|chevaux?|\\bvelo\\b|\\bhugo\\b",
        question: "On fait une pause : parle-moi plutôt de tes chevaux.",
        feedback: "Léa n'était pas en difficulté : revenir au rapport ici casse l'élan du récit.",
        selon: [{ si: { stress_min: 6 }, qualite: 2, feedback: "Retour bref au rapport face à une enfant tendue : la pression retombe, vous pourrez reprendre ensuite." }],
        reponse: { texte: "…J'ai dessiné un cheval. Il s'appelle Tonnerre.", expression: "neutre" } },
      { phases: ["recit"], si: { faits: ["auteur"] }, typesLibres: ["consigne", "choix", "directive"], type: "consigne", qualite: 0,
        motsCles: "(as|aurais) (des|une) questions?|tu veux me demander|on a (fini|termine)|c'est (fini|termine)",
        question: "Merci Léa. Est-ce que tu as des questions ?",
        feedback: "Clôture prématurée : vous n'avez pas demandé s'il y avait autre chose à ajouter, et plusieurs éléments du récit restent inexplorés.",
        selon: [{ si: { faits: ["marque", "revelation"] }, qualite: 1, feedback: "Clôture un peu rapide : demandez d'abord « Y a-t-il autre chose que tu penses que je devrais savoir ? »." }],
        suivant: "cloture_question" },
      { phases: ["recit"], type: "invitation", qualite: 2,
        motsCles: "autre chose|rien d'autre|quelque chose d'autre|tu veux (ajouter|me dire)",
        question: "Y a-t-il autre chose que tu penses que je devrais savoir ?",
        feedback: "Question ouverte de fin d'investigation, recommandée par le protocole.",
        selon: [{ si: { sans_faits: ["marque"] }, qualite: 1, feedback: "Bonne question, mais trop tôt : plusieurs éléments du récit (la marque, les suites) n'ont pas été explorés." }],
        suivant: "cloture" }
    ]
  },

  noeuds: {
    /* ───────────── INTRODUCTION ───────────── */
    intro: {
      phase: "introduction",
      didascalie: "Léa s'assoit au bord du canapé, son sac serré contre elle. Ses yeux passent de la caméra à vous.",
      enfant: "…",
      parType: {
        presentation: {
          qualite: 2, effets: { confiance: 2, stress: -1 }, suivant: "regles",
          feedback: "Présentation conforme : qui vous êtes, votre rôle, et l'enregistrement expliqué, sans rien dire des faits.",
          exige: { motif: "camera|filme|enregistr", sinon: { qualite: 1, effets: { confiance: 1 }, feedback: "Vous vous présentez, mais sans expliquer la caméra : l'enfant la voit et se demande à quoi elle sert." } }
        },
        salutation: { qualite: 1, reponse: { texte: "…Bonjour.", expression: "neutre" },
          feedback: "Salutation sans présentation : dites qui vous êtes, ce que vous faites, et expliquez la caméra." }
      },
      silence: {
        qualite: 0, effets: { stress: 1 },
        reponse: { texte: "…", expression: "inquiet", didascalie: "Léa vous regarde, puis baisse les yeux. Elle attend que vous parliez." },
        feedback: "En introduction, c'est à l'adulte de poser le cadre : le silence laisse l'enfant dans l'incertitude."
      },
      choix: [
        {
          question: "Bonjour Léa. Je m'appelle Camille, je suis gendarme. Mon travail, c'est de parler avec des enfants de choses qui leur sont arrivées. Tu vois la caméra, là-haut ? Elle filme ce qu'on dit, comme ça je n'ai pas besoin de tout écrire.",
          type: "consigne", qualite: 2, effets: { confiance: 2, stress: -1 }, motsCles: "camera|filme|enregistr|mon travail",
          feedback: "Introduction conforme : vous vous présentez, expliquez votre rôle et l'enregistrement, sans rien dire des faits.",
          suivant: "regles"
        },
        {
          question: "Bonjour Léa. Je m'appelle Camille, je suis gendarme. Ta maîtresse m'a expliqué pourquoi tu es là, alors on va en parler tranquillement. La caméra, là-haut, ne t'en occupe pas.",
          type: "consigne", qualite: 0, effets: { stress: 1 }, motsCles: "maitresse|explique pourquoi|ne t'en occupe",
          feedback: "Deux écarts discrets. Vous laissez entendre que vous savez déjà ce qui s'est passé : l'enfant peut alors se contenter de confirmer. Et vous éludez la caméra au lieu de l'expliquer.",
          mieux: "Mon travail, c'est de parler avec des enfants de choses qui leur sont arrivées. La caméra filme pour que je n'aie pas à tout écrire.",
          suivant: "regles"
        },
        {
          question: "Bonjour Léa, moi c'est Camille. N'aie pas peur, tu n'as rien fait de mal. Tu es très courageuse d'être venue jusqu'ici.",
          type: "inadaptee", qualite: 0, effets: { confiance: 1 }, motsCles: "n'aie pas peur|rien fait de mal|courageu",
          feedback: "Bienveillant en apparence, mais « courageuse » et « rien fait de mal » laissent entendre qu'il s'est passé quelque chose de grave. Et vous n'avez expliqué ni votre rôle ni l'enregistrement.",
          mieux: "Je m'appelle Camille, je suis gendarme. Mon travail, c'est de parler avec des enfants de choses qui leur sont arrivées.",
          suivant: "regles"
        },
        {
          question: "Bonjour Léa, je m'appelle Camille, je travaille à la gendarmerie. Avant qu'on commence, est-ce que tu sais pourquoi tu es là aujourd'hui ?",
          type: "directive", qualite: 0, effets: { stress: 2 }, motsCles: "sais pourquoi|pourquoi tu es",
          feedback: "Aborder le motif dès la première phrase court-circuite l'introduction, les règles et la mise en confiance. Et la question appelle un simple « oui » qui n'apprend rien.",
          mieux: "Tu vois la caméra, là-haut ? Elle filme ce qu'on dit, comme ça je n'ai pas besoin de tout écrire.",
          reponse: { texte: "…Oui.", expression: "inquiet", didascalie: "Léa baisse les yeux vers ses chaussures." },
          suivant: "regles"
        }
      ]
    },

    /* ───────────── RÈGLES DE BASE ───────────── */
    regles: {
      phase: "regles",
      didascalie: "Léa pose son sac à côté d'elle.",
      parType: {
        regles: {
          qualite: 2, effets: { confiance: 1 }, suivant: "regles_test",
          feedback: "Règle posée et testée avec une question impossible : exactement ce que recommande le protocole.",
          exige: { motif: "comment (s'appelle|il s'appelle|elle s'appelle)|quel est le nom|c'est quoi le (pre)?nom|(pre)?nom de mon|si je te demande",
            sinon: { qualite: 1, suivant: null, reponse: "D'accord.", feedback: "Règle posée, mais pas testée : vérifiez-la avec une question impossible (« Comment s'appelle mon chien ? »)." } }
        }
      },
      enfant: [
        { si: { stress_min: 6 }, texte: "…D'accord.", expression: "inquiet" },
        { texte: "D'accord." }
      ],
      choix: [
        {
          question: "Avant qu'on commence, quelques règles. Si je te pose une question et que tu ne connais pas la réponse, tu me dis « je ne sais pas ». Par exemple : comment s'appelle mon chien ?",
          type: "consigne", qualite: 2, effets: { confiance: 1 },
          feedback: "Règle « je ne sais pas » posée, et immédiatement testée avec une question impossible : exactement ce que recommande le protocole.",
          suivant: "regles_test"
        },
        {
          question: "Avant qu'on commence : ici, c'est très important de dire la vérité. Tu sais faire la différence entre la vérité et un mensonge ?",
          type: "consigne", qualite: 1, effets: { stress: 1 }, motsCles: "difference|mensonge",
          feedback: "L'engagement à dire la vérité est utile, mais demander à l'enfant de définir vérité et mensonge est abstrait et peu prédictif. Le protocole préfère un exemple concret, puis une promesse simple.",
          mieux: "Si je te dis que mes chaussures sont rouges, c'est vrai ou pas vrai ? … Tu promets de me dire seulement ce qui s'est vraiment passé ?",
          reponse: { texte: "…Oui. Un mensonge c'est quand on dit pas vrai.", expression: "inquiet" }
        },
        {
          question: "Je vais te poser beaucoup de questions. Essaie de bien te souvenir de tout et de toujours me donner une réponse, d'accord ?",
          type: "inadaptee", qualite: -1, effets: { stress: 2 },
          feedback: "« Toujours une réponse » pousse l'enfant à deviner plutôt qu'à dire « je ne sais pas » : c'est l'inverse des règles de base.",
          mieux: "Si je te pose une question et que tu ne connais pas la réponse, tu me dis « je ne sais pas ».",
          reponse: { texte: "…D'accord.", expression: "inquiet" },
          suivant: "rapport"
        },
        {
          question: "Ici, tu peux tout me dire : personne ne sera fâché contre toi, et tu n'auras pas de problème.",
          type: "soutien", qualite: 0, effets: { confiance: 1 },
          feedback: "Rassurant, mais c'est une promesse que vous ne maîtrisez pas, et ce n'est pas une règle de base. « Je ne sais pas », « je ne comprends pas », « corrige-moi » n'ont toujours pas été posées.",
          reponse: "D'accord."
        }
      ]
    },

    regles_test: {
      phase: "regles",
      didascalie: "Léa a un petit sourire.",
      enfant: "Je sais pas… Tu me l'as pas dit !",
      choix: [
        {
          question: "C'est ça, tu ne pouvais pas savoir. Et si je dis quelque chose de faux, tu me corriges. Si je dis que tu as deux ans, qu'est-ce que tu me dis ?",
          type: "consigne", qualite: 2, effets: { confiance: 1 }, marque: "corrige", motsCles: "corrige|deux ans|faux|si je dis que tu as",
          feedback: "Règle de correction posée et testée : l'enfant fait l'expérience qu'elle peut contredire l'adulte.",
          reponse: { texte: "Non ! J'ai huit ans !", expression: "detendu", didascalie: "Léa rit." }
        },
        {
          question: "Exactement. Et si je pose une question que tu ne comprends pas, tu me dis « je ne comprends pas », et je la dirai autrement.",
          type: "consigne", qualite: 2, marque: "comprend", motsCles: "comprends? pas|pas compris|autrement",
          feedback: "Règle « je ne comprends pas » posée : indispensable, un enfant de 8 ans répond souvent à une question qu'il n'a pas comprise.",
          reponse: "D'accord."
        },
        {
          question: "Est-ce que tu promets de me dire seulement des choses qui se sont vraiment passées ?",
          type: "consigne", qualite: 2, marque: "promesse", motsCles: "promets|vraiment passe|verite",
          feedback: "Promesse simple de dire ce qui s'est vraiment passé : le protocole révisé montre qu'elle améliore l'exactitude des récits.",
          reponse: "Oui. Promis."
        },
        {
          question: "Très bien, tu as tout compris. On peut commencer !",
          type: "consigne", qualite: 0, motsCles: "commenc|on y va|c'est parti",
          feedback: "Vous passez au rapport sans avoir posé les autres règles (correction, « je ne comprends pas », promesse). Chacune protège le témoignage.",
          selon: [
            { si: { marques: ["corrige", "comprend", "promesse"] }, qualite: 2, feedback: "Règles posées et testées : vous pouvez passer au rapport." },
            { si: { marques: ["corrige"] }, qualite: 1, feedback: "Correction testée, mais il manque « je ne comprends pas » ou la promesse de dire ce qui s'est vraiment passé." }
          ],
          suivant: "rapport"
        }
      ]
    },

    /* ───────────── RAPPORT ───────────── */
    rapport: {
      phase: "rapport",
      didascalie: "Léa glisse les mains sous ses cuisses et attend.",
      enfant: [
        { si: { stress_min: 6 }, texte: "…D'accord.", expression: "inquiet" },
        { texte: "D'accord." }
      ],
      choix: [
        {
          question: "J'aimerais mieux te connaître, Léa. Raconte-moi les choses que tu aimes faire.",
          type: "invitation", effets: { confiance: 2, stress: -1 },
          feedback: "Invitation ouverte en phase de rapport : l'enfant parle de ce qu'elle aime et s'habitue à faire des réponses longues.",
          suivant: "rapport_2"
        },
        {
          question: "Qu'est-ce que tu aimes faire, toi, quand tu n'es pas à l'école ?",
          type: "directive", qualite: 1, effets: { confiance: 1 },
          feedback: "Question en « qu'est-ce que » : correcte, mais elle appelle une liste. « Raconte-moi… » invite un vrai récit et entraîne l'enfant aux réponses longues.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          suivant: "rapport_court"
        },
        {
          question: "Tu as quel âge, et tu es dans quelle classe ?",
          type: "directive", qualite: 0,
          feedback: "Deux questions en une, sur des informations déjà connues : réponses minimales, et l'enfant apprend que l'audition fonctionne en questions-réponses courtes.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          reponse: "Huit ans. En CE2."
        },
        {
          question: "J'aimerais mieux te connaître. Qu'est-ce que tu fais le mercredi, d'habitude ?",
          type: "directive", qualite: -1, effets: { stress: 2 },
          feedback: "Le mercredi est le jour des faits (dossier) : en phase de rapport, vous orientez déjà l'enfant vers le sujet. Elle se crispe avant même d'avoir pris confiance.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          reponse: { texte: "…Je vais au centre.", expression: "inquiet", didascalie: "Le sourire de Léa disparaît. Elle se tortille." }
        }
      ]
    },

    rapport_court: {
      phase: "rapport",
      didascalie: "Léa répond sans vraiment vous regarder.",
      enfant: "Dessiner. Et le vélo.",
      silence: {
        qualite: 2, effets: { confiance: 1 },
        reponse: { texte: "…Des chevaux, surtout. Et avec mon frère Hugo, on fait la course à vélo jusqu'au parc." },
        feedback: "Pause attentive après une réponse courte : Léa complète d'elle-même. Le silence est un outil à part entière.",
        suivant: "rapport_2"
      },
      choix: [
        {
          question: "Tu as parlé de dessiner. Raconte-moi tout sur tes dessins.",
          type: "invitation_indicee", effets: { confiance: 1 },
          feedback: "Invitation indicée : vous reprenez le mot de l'enfant pour l'inviter à développer.",
          reponse: { texte: "Je dessine des chevaux, surtout. J'ai un cahier exprès. Et je fais du vélo avec mon frère Hugo, on fait la course jusqu'au parc.", expression: "detendu" },
          suivant: "rapport_2"
        },
        {
          question: "Tu dessines quoi ?",
          type: "directive", qualite: 1,
          feedback: "Question directive : réponse d'un mot. Une invitation indicée (« Raconte-moi tout sur tes dessins ») aurait ouvert davantage.",
          reponse: "Des chevaux."
        },
        {
          question: "Tu fais du vélo toute seule, ou avec quelqu'un ?",
          type: "choix", qualite: 0,
          feedback: "Question à choix : elle fournit les options et ne fait pas raconter.",
          mieux: "Tu as parlé du vélo. Raconte-moi tout sur le vélo.",
          reponse: "Avec Hugo. Mon frère."
        },
        {
          question: "D'accord. Maintenant, raconte-moi tout ce qui s'est passé à ton dernier anniversaire, du début à la fin.",
          type: "invitation", qualite: 1,
          feedback: "Bonne consigne d'entraînement, mais le rapport a été très court : Léa n'a pas encore pris l'habitude de parler longuement.",
          suivant: "memoire_2"
        }
      ]
    },

    rapport_2: {
      phase: "rapport",
      enfant: "J'aime bien dessiner, surtout des chevaux. Et faire du vélo avec mon frère Hugo. Des fois on fait la course jusqu'au parc.",
      expression: "detendu",
      choix: [
        {
          question: "Tu as parlé de la course jusqu'au parc. Raconte-moi tout sur ça.",
          type: "invitation_indicee", effets: { confiance: 1 },
          feedback: "Invitation indicée : vous reprenez les mots exacts de l'enfant.",
          suivant: "rapport_3"
        },
        {
          question: "Et je parie que c'est toi qui gagnes, hein ?",
          type: "suggestive", qualite: 0, effets: { confiance: 1 },
          feedback: "Anodin en apparence, mais vous proposez la réponse et l'enfant la valide. Le rapport sert aussi à habituer l'enfant à ne PAS suivre vos suggestions.",
          mieux: "Raconte-moi comment ça se passe, la course.",
          reponse: { texte: "Oui !", expression: "detendu" }
        },
        {
          question: "Hugo, il a quel âge ?", exemples: ["Il a quel âge, ton frère ?"],
          type: "directive", qualite: 1,
          feedback: "Question correcte mais peu productive : elle n'entraîne pas au récit.",
          reponse: "Dix ans. Il est en CM2."
        },
        {
          question: "Merci. Maintenant, j'aimerais que tu me racontes une journée en entier : ton dernier anniversaire, du début à la fin.",
          type: "invitation",
          feedback: "Passage à l'entraînement de la mémoire épisodique, sur un événement neutre et récent.",
          suivant: "memoire_2"
        }
      ]
    },

    rapport_3: {
      phase: "rapport",
      enfant: [
        { si: { confiance_min: 6 }, texte: "Samedi c'est moi qui ai gagné ! Hugo il a dit que j'avais triché, mais c'est pas vrai !", expression: "detendu" },
        { texte: "Mm. On roule jusqu'au parc. Des fois je gagne." }
      ],
      choix: [
        {
          question: "Merci de m'avoir raconté. Maintenant, j'aimerais que tu me racontes une journée en entier. Raconte-moi tout ce qui s'est passé à ton dernier anniversaire, du début à la fin.",
          type: "invitation",
          feedback: "Entraînement à la mémoire épisodique : l'enfant s'exerce à raconter un événement précis, avant d'aborder les faits.",
          suivant: "memoire_2"
        },
        {
          question: "C'était bien ?",
          type: "choix", qualite: 0,
          feedback: "Question fermée : réponse en un mot, l'élan du récit retombe.",
          mieux: "Et ensuite, qu'est-ce qui s'est passé ?",
          reponse: "Oui."
        },
        {
          question: "Bon. Maintenant, on va parler de ce qui s'est passé au centre de loisirs.",
          type: "suggestive", qualite: -1, effets: { stress: 2 }, faits: ["c_centre"],
          feedback: "Double écart : vous sautez l'entraînement à la mémoire épisodique, et vous introduisez vous-même le lieu des faits, que Léa n'a jamais mentionné.",
          mieux: "Raconte-moi tout ce qui s'est passé à ton dernier anniversaire, du début à la fin.",
          reponse: { texte: "…", expression: "inquiet", didascalie: "Léa se fige." },
          suivant: "transition_bloque"
        }
      ]
    },

    /* ───────────── ENTRAÎNEMENT MÉMOIRE ÉPISODIQUE ───────────── */
    memoire_2: {
      phase: "memoire",
      enfant: [
        { si: { stress_min: 6 }, texte: "Un gâteau. Et mamie." },
        { texte: "On a mangé un gâteau au chocolat, et mamie est venue. Après on a joué dans le jardin avec mes cousins.", expression: "detendu" }
      ],
      choix: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", effets: { confiance: 1 },
          feedback: "« Et ensuite ? » fait avancer le récit dans le temps sans rien suggérer.",
          suivant: "memoire_3"
        },
        {
          question: "Tu as parlé du jardin. Raconte-moi tout ce qui s'est passé dans le jardin.",
          type: "invitation_indicee", effets: { confiance: 1 }, si: { stress_max: 5 },
          feedback: "Invitation indicée sur un détail donné par l'enfant : c'est l'outil que vous utiliserez ensuite sur les faits.",
          suivant: "memoire_3"
        },
        {
          question: "Il y avait combien de cousins ?",
          type: "directive", qualite: 0,
          feedback: "Détail chiffré sans intérêt pour l'entraînement. La correction spontanée de Léa montre que ce type de question produit des réponses incertaines.",
          mieux: "Tu as parlé du jardin. Raconte-moi tout ce qui s'est passé dans le jardin.",
          reponse: "Trois. Non, quatre."
        },
        {
          question: "Le gâteau, c'est ta maman qui l'avait fait, ou vous l'aviez acheté ?",
          type: "choix", qualite: 0,
          feedback: "Question à choix : Léa choisit une option en ajoutant « je crois ». Elle apprend à piocher dans vos propositions.",
          mieux: "Et ensuite, qu'est-ce qui s'est passé ?",
          reponse: "…Acheté, je crois."
        }
      ]
    },

    memoire_matin: {
      phase: "memoire",
      enfant: "Je me suis réveillée, j'ai mangé des céréales. Après, maman m'a amenée ici en voiture, et on a attendu dans une salle avec des jouets.",
      expression: "detendu",
      choix: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", effets: { confiance: 1 },
          feedback: "« Et ensuite ? » fait avancer le récit dans le temps sans rien suggérer.",
          reponse: { texte: "Après, une dame est venue me chercher. Et maintenant je suis là, avec toi !", expression: "detendu" }
        },
        {
          question: "Tu as parlé de la salle avec des jouets. Raconte-moi tout sur cette salle.",
          type: "invitation_indicee", effets: { confiance: 1 },
          feedback: "Invitation indicée sur un détail donné par l'enfant : l'outil qui servira ensuite sur les faits.",
          reponse: { texte: "Y avait des Lego et un gros ours. J'ai fait une tour toute haute.", expression: "detendu" }
        },
        {
          question: "Merci, tu m'as raconté ça avec plein de détails. C'est exactement comme ça que j'ai besoin que tu me racontes les choses.",
          type: "soutien", qualite: 2, effets: { confiance: 1 },
          feedback: "Vous valorisez la manière (les détails), pas le contenu : le lien idéal vers la transition.",
          suivant: "transition"
        }
      ]
    },

    memoire_3: {
      phase: "memoire",
      enfant: "On a fait cache-cache, et mon cousin Lucas il s'est caché dans la cabane. Personne le trouvait ! Après il est sorti tout seul parce qu'il avait faim.",
      expression: "detendu",
      choix: [
        {
          question: "Merci, tu m'as raconté ça avec plein de détails. C'est exactement comme ça que j'ai besoin que tu me racontes les choses.",
          type: "soutien", qualite: 2, effets: { confiance: 1 },
          feedback: "Vous valorisez la manière (les détails), pas le contenu : c'est le message clé avant d'aborder les faits.",
          suivant: "transition"
        },
        {
          question: "Et ensuite ?",
          type: "invitation", qualite: 1,
          feedback: "Correct, mais l'entraînement a atteint son but. Il manque surtout le message qui fait le lien : « c'est comme ça que j'ai besoin que tu me racontes les choses ».",
          reponse: "Ensuite c'était fini. Mamie elle est partie.",
          suivant: "transition"
        },
        {
          question: "Tu es sûre que personne ne le trouvait ? Ça me paraît long.",
          type: "inadaptee", qualite: -1, effets: { confiance: -1, stress: 1 },
          feedback: "Mettre en doute la parole de l'enfant, même sur un détail anodin, lui apprend que ses réponses peuvent être « fausses ». Elle risque ensuite de modifier son récit pour vous satisfaire.",
          mieux: "Merci, tu m'as raconté ça avec plein de détails.",
          reponse: { texte: "…Ben si. Je crois.", expression: "inquiet" }
        },
        {
          question: "Lucas, il a quel âge ?",
          type: "directive", qualite: 1,
          feedback: "Sans conséquence, mais sans intérêt : l'entraînement porte sur le récit, pas sur les détails.",
          reponse: "Cinq ans."
        }
      ]
    },

    /* ───────────── TRANSITION ───────────── */
    transition: {
      phase: "transition",
      parType: { suggestive: { effets: { stress: 2 }, reponse: { texte: "…Oui.", expression: "ferme" }, suivant: "recit_suggestif" } },
      enfant: [
        { si: { confiance_min: 5 }, texte: "D'accord.", didascalie: "Léa tire sur la manche de son pull." },
        { texte: "…", expression: "inquiet", didascalie: "Léa regarde ses pieds." }
      ],
      choix: [
        {
          question: "Maintenant que je te connais un peu mieux, je voudrais parler de la raison pour laquelle tu es venue. Dis-moi pourquoi tu es venue me parler aujourd'hui.",
          type: "invitation",
          feedback: "Transition par l'invitation la plus ouverte possible : c'est l'enfant qui introduit le sujet, avec ses mots.",
          suivant: [{ si: { confiance_min: 5 }, vers: "recit" }, { vers: "transition_bloque" }]
        },
        {
          question: "Maintenant, je voudrais qu'on parle de ce que tu as raconté à ta maîtresse lundi. Raconte-moi.",
          type: "invitation_indicee", qualite: 1, motsCles: "maitresse",
          feedback: "Indice légitime (une source, sans le contenu), mais trop tôt : le protocole commence toujours par l'invitation la plus ouverte et ne recourt à ce type d'indice que si l'enfant ne parle pas.",
          mieux: "Dis-moi pourquoi tu es venue me parler aujourd'hui.",
          suivant: "recit"
        },
        {
          question: "Maintenant, je voudrais qu'on parle de ton bras. Raconte-moi tout ce qui s'est passé.",
          type: "suggestive", qualite: -1, faits: ["c_bras"],
          feedback: "Forme ouverte, mais « ton bras » vient du signalement, pas de Léa. Vous introduisez un élément central de l'allégation : la suite du récit ne pourra plus être attribuée à sa seule mémoire.",
          mieux: "Dis-moi pourquoi tu es venue me parler aujourd'hui.",
          suivant: "recit"
        },
        {
          question: "Tu sais, beaucoup d'enfants viennent ici pour parler de choses qui leur sont arrivées. Est-ce qu'il t'est arrivé quelque chose ?",
          exemples: ["Est-ce qu'il t'est arrivé quelque chose ?", "Il s'est passé quelque chose ?"],
          type: "choix", qualite: 0,
          feedback: "Formule générale, mais en oui/non : l'enfant peut répondre « non », ou « oui » sans rien raconter. Gardez cette forme pour plus tard, si les invitations échouent.",
          mieux: "Dis-moi pourquoi tu es venue me parler aujourd'hui.",
          suivant: [{ si: { confiance_min: 5 }, vers: "transition_oui" }, { vers: "transition_bloque" }]
        }
      ]
    },

    transition_oui: {
      phase: "transition",
      parType: { suggestive: { effets: { stress: 2 }, reponse: { texte: "…Oui.", expression: "ferme" }, suivant: "recit_suggestif" } },
      enfant: "…Oui.",
      expression: "inquiet",
      choix: [
        {
          question: "Raconte-moi tout ce qui s'est passé.",
          type: "invitation",
          feedback: "Invitation ouverte immédiatement après le « oui » : bien.",
          suivant: "recit"
        },
        {
          question: "C'est quelqu'un qui t'a fait du mal ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_mal"],
          feedback: "Vous introduisez l'idée d'une personne et d'un mal subi. Léa n'a encore rien dit.",
          mieux: "Raconte-moi tout ce qui s'est passé.",
          reponse: { texte: "…Oui.", expression: "ferme" },
          suivant: "recit_suggestif"
        },
        {
          question: "Où est-ce que ça s'est passé ?",
          type: "directive", qualite: 1,
          feedback: "Question directive avant toute invitation : l'enfant donne un lieu, puis attend la question suivante. Commencez par « Raconte-moi tout ».",
          mieux: "Raconte-moi tout ce qui s'est passé.",
          suivant: "recit"
        }
      ]
    },

    transition_bloque: {
      phase: "transition",
      parType: { suggestive: { effets: { stress: 2 }, reponse: { texte: "…Oui.", expression: "ferme" }, suivant: "recit_suggestif" } },
      enfant: "Je sais pas…",
      expression: "inquiet",
      didascalie: "Léa hausse les épaules et jette un œil vers la porte.",
      choix: [
        {
          question: "J'ai entendu dire que tu avais parlé à ta maîtresse lundi. Dis-moi ce que tu lui as dit.",
          type: "invitation_indicee", qualite: 2, effets: { confiance: 1 }, motsCles: "maitresse",
          feedback: "Deuxième palier du protocole : vous évoquez la source (la maîtresse) sans rien dire du contenu. C'est l'enfant qui raconte.",
          suivant: "recit"
        },
        {
          question: "Ce n'est pas grave. Prends ton temps, tu m'aides déjà beaucoup en étant là.",
          type: "soutien", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Propos de soutien non suggestif face à une enfant réticente : vous baissez la pression avant de relancer.",
          reponse: { texte: "…", didascalie: "Léa souffle. Ses épaules se relâchent un peu." }
        },
        {
          question: "Ta maîtresse m'a dit qu'un adulte du centre t'avait fait mal au bras. C'est vrai ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_adulte", "c_bras", "c_centre"],
          feedback: "Vous livrez l'allégation entière (qui, où, quoi) puis demandez de confirmer. Un « oui » obtenu ainsi n'a presque aucune valeur probante.",
          mieux: "J'ai entendu dire que tu avais parlé à ta maîtresse lundi. Dis-moi ce que tu lui as dit.",
          suivant: "recit_suggestif"
        },
        {
          question: "Est-ce que quelqu'un t'a fait du mal ?",
          type: "choix", qualite: 0, effets: { stress: 1 }, faits: ["c_mal"],
          feedback: "Dernier recours du protocole, acceptable seulement après l'échec des invitations indicées. Ici, vous introduisez trop tôt l'idée qu'on lui a « fait du mal ».",
          mieux: "J'ai entendu dire que tu avais parlé à ta maîtresse lundi. Dis-moi ce que tu lui as dit.",
          suivant: "transition_oui"
        }
      ]
    },

    recit_suggestif: {
      phase: "transition",
      enfant: "…Oui. Le monsieur.",
      expression: "ferme",
      didascalie: "Léa répond très bas, sans vous regarder.",
      choix: [
        {
          question: "D'accord. Raconte-moi tout ce qui s'est passé, depuis le début.",
          type: "invitation", qualite: 1, effets: { confiance: 1 },
          feedback: "Bon rattrapage par une invitation ouverte. Mais ce qui a été suggéré restera au dossier.",
          suivant: "recit"
        },
        {
          question: "Il t'a frappée ?",
          type: "suggestive", effets: { stress: 2 }, faits: ["c_frappe"],
          feedback: "Deuxième question suggestive. Léa, stressée, acquiesce à un geste qu'elle n'a pas vécu.",
          mieux: "Raconte-moi tout ce qui s'est passé, depuis le début.",
          suivant: "recit_contamine"
        },
        {
          question: "Tu as dit « le monsieur ». Raconte-moi tout sur ce monsieur.",
          type: "invitation_indicee", qualite: -1, faits: ["c_adulte"],
          feedback: "Piège : « le monsieur » n'est pas un mot de Léa, c'est l'écho de votre question. Le reprendre renforce la contamination au lieu de la corriger.",
          mieux: "Raconte-moi tout ce qui s'est passé, depuis le début.",
          suivant: "recit"
        }
      ]
    },

    recit_contamine: {
      phase: "recit",
      enfant: "…Oui. Je sais plus. Je veux voir maman.",
      expression: "ferme",
      choix: [
        {
          question: "Tu peux prendre ton temps. Ta maman est juste à côté, dans la salle d'attente. Tu m'aides beaucoup.",
          type: "soutien", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Soutien non suggestif et information honnête (la mère est à côté) : la meilleure réponse face à une enfant au bord des larmes.",
          reponse: { texte: "…D'accord.", didascalie: "Léa renifle et se redresse un peu." }
        },
        {
          question: "Raconte-moi avec tes mots tout ce qui s'est passé.",
          type: "invitation",
          feedback: "Invitation ouverte, ton calme : le bon outil. Mais le « oui » précédent reste au dossier.",
          selon: [{ si: { stress_min: 8 }, qualite: 1, feedback: "Bonne question, mais Léa est à bout : un mot de soutien d'abord lui aurait permis de répondre." }],
          suivant: [{ si: { stress_max: 7 }, vers: "recit" }, { vers: "recit_ferme" }]
        },
        {
          question: "Bon, on va s'arrêter là pour aujourd'hui.",
          type: "consigne", qualite: 0,
          feedback: "Entretien interrompu sans récit libre : les seules informations recueillies viennent de vos questions.",
          suivant: "cloture"
        }
      ]
    },

    recit_ferme: {
      phase: "recit",
      enfant: "Je veux pas en parler.",
      expression: "ferme",
      didascalie: "Léa serre son sac contre elle.",
      choix: [
        {
          question: "D'accord. Tu n'es pas obligée de tout dire maintenant. On peut faire une pause, si tu veux.",
          type: "soutien", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Vous respectez la réticence sans abandonner : c'est l'approche du protocole révisé.",
          reponse: { texte: "…", didascalie: "Léa vous regarde à nouveau." }
        },
        {
          question: "On fait une pause : raconte-moi plutôt le dernier cheval que tu as dessiné.",
          type: "consigne", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Revenir brièvement au rapport aide une enfant réticente. Vous pourrez ensuite reprendre la transition en douceur.",
          reponse: { texte: "…Il s'appelle Tonnerre. Il est noir avec une tache blanche.", expression: "neutre" },
          suivant: "transition"
        },
        {
          question: "Je comprends. Dis-moi juste ce dont tu te souviens.",
          type: "invitation", qualite: 1, effets: { stress: 1 },
          feedback: "Invitation correcte, mais insister sans avoir fait baisser la pression risque de fermer l'enfant pour de bon.",
          suivant: [{ si: { stress_max: 7 }, vers: "recit" }, { vers: "cloture" }]
        }
      ]
    },

    /* ───────────── RÉCIT LIBRE ───────────── */
    recit: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 8 }, texte: "Mercredi… au centre. Kévin… il m'a tiré le bras.", expression: "ferme" },
        { texte: "C'était mercredi, au centre. Kévin il m'a attrapé le bras très fort. Ça m'a fait mal." }
      ],
      faitsAuto: ["lieu_date", "auteur"],
      silence: {
        qualite: 2,
        reponse: { texte: "…Il a crié. Il était tout rouge." },
        feedback: "Pause attentive : Léa ajoute un détail spontanément. Relancez maintenant par une invitation."
      },
      choix: [
        {
          question: "Raconte-moi tout ce qui s'est passé mercredi, depuis le début jusqu'à la fin.",
          type: "invitation", effets: { confiance: 1 },
          feedback: "Invitation ouverte de récit libre : la meilleure façon d'obtenir un récit riche et fiable.",
          suivant: "recit_2"
        },
        {
          question: "Kévin, c'est qui ?",
          type: "directive", qualite: 1,
          feedback: "Question utile, mais un peu tôt : épuisez d'abord le récit libre, puis revenez aux précisions.",
          faits: ["identite"],
          reponse: "C'est l'animateur. Il a des lunettes."
        },
        {
          question: "Il t'a attrapée comment ? Il t'a tirée, il t'a poussée ?",
          type: "choix", qualite: -1, effets: { stress: 1 }, faits: ["c_pousse"],
          feedback: "Question à choix : Léa reprend une option que vous avez proposée (« poussée ») en ajoutant « je crois ». Ce détail est désormais contaminé.",
          mieux: "Tu as dit qu'il t'a attrapé le bras. Raconte-moi tout sur ce moment.",
          reponse: { texte: "…Il m'a tirée. Et poussée un peu, je crois.", expression: "inquiet" }
        },
        {
          question: "Pourquoi est-ce qu'il t'a attrapé le bras ?",
          type: "directive", qualite: 0, effets: { stress: 1, confiance: -1 },
          feedback: "« Pourquoi » demande à l'enfant d'expliquer l'intention d'un adulte, et sonne comme un reproche : Léa se sent responsable.",
          mieux: "Raconte-moi ce qui s'est passé juste avant.",
          reponse: { texte: "Parce que… je rangeais pas. C'est de ma faute ?", expression: "triste" }
        }
      ]
    },

    recit_2: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 8 }, texte: "Il fallait ranger. Il m'a attrapée.", expression: "ferme" },
        { texte: "On jouait dans la salle. Après il fallait ranger les jeux, mais moi je voulais finir mon dessin. Kévin il a crié, et il m'a attrapée par le bras pour m'emmener. Il serrait trop fort. Le soir, j'avais une marque violette." }
      ],
      faitsAutoSi: { si: { stress_max: 7 }, faits: ["contexte", "marque"] },
      silence: {
        qualite: 2,
        reponse: { texte: "…Il m'a emmenée jusqu'au couloir. Après il m'a lâchée." },
        feedback: "Silence attentif en plein récit : l'enfant poursuit d'elle-même."
      },
      choix: [
        {
          question: "Tu as dit qu'il serrait trop fort. Raconte-moi tout sur ce moment-là.",
          type: "invitation_indicee", effets: { confiance: 1 }, si: { faits: ["contexte"] },
          feedback: "Invitation indicée : vous reprenez les mots exacts de l'enfant pour approfondir le moment central.",
          faits: ["insistance"],
          suivant: "recit_3"
        },
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation",
          feedback: "« Et ensuite ? » : simple et efficace pour poursuivre le récit.",
          suivant: "recit_3"
        },
        {
          question: "Il était en colère, ou il rigolait ?",
          type: "choix", qualite: 0,
          feedback: "Question à choix : l'enfant prend une des deux options, même si aucune ne correspond vraiment.",
          mieux: "Parle-moi de comment était Kévin à ce moment-là.",
          reponse: "…En colère."
        },
        {
          question: "Donc tu n'as pas obéi tout de suite quand il a dit de ranger ?",
          type: "suggestive", qualite: -1, effets: { stress: 2, confiance: -1 }, faits: ["c_desobeir"],
          feedback: "Reformulation qui culpabilise : vous résumez à la place de l'enfant, avec un mot (« obéi ») qu'elle n'a pas employé.",
          mieux: "Tu as dit que tu voulais finir ton dessin. Raconte-moi ce qui s'est passé à ce moment-là.",
          reponse: { texte: "…Non. Mais je voulais juste finir…", expression: "triste" }
        }
      ]
    },

    recit_3: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 8 }, texte: "Je sais plus.", expression: "ferme" },
        { texte: "Je lui ai dit qu'il me faisait mal, mais il a pas lâché. Après, Inès elle a vu, elle m'a fait un câlin." }
      ],
      faitsAutoSi: { si: { stress_max: 7 }, faits: ["insistance", "temoin"] },
      libre: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", motsCles: "^et (ensuite|apres|puis)|qu'est-ce qui s'est passe (ensuite|apres)|la suite",
          feedback: "« Et ensuite ? » : le récit avance sans rien suggérer, jusqu'à un nouvel élément (la marque).",
          faits: ["marque", "photo"],
          reponse: { texte: "Après, on est rentrées avec maman. Le soir, elle a vu mon bras tout violet, là. Elle a fait une photo.", didascalie: "Léa montre son avant-bras gauche." },
          suivant: "recit_4"
        }
      ],
      choix: [
        {
          question: "Tu as parlé d'une marque violette. Raconte-moi tout sur cette marque.",
          type: "invitation_indicee", si: { faits: ["marque"] },
          feedback: "Invitation indicée sur un détail apporté par l'enfant, au bon moment.",
          suivant: "recit_4"
        },
        {
          question: "Raconte-moi tout ce qui s'est passé depuis le câlin d'Inès jusqu'au moment où tu es rentrée chez toi.",
          type: "invitation_indicee", si: { faits: ["temoin"] }, faits: ["marque", "photo"],
          feedback: "Segmentation temporelle (« depuis… jusqu'à… ») : une technique du protocole pour faire raconter une période précise sans rien suggérer.",
          reponse: { texte: "On est rentrées avec maman. Le soir, elle a vu mon bras tout violet, là. Elle a fait une photo.", didascalie: "Léa montre son avant-bras gauche." },
          suivant: "recit_4"
        },
        {
          question: "Est-ce que c'est arrivé une fois, ou plus d'une fois ?",
          type: "choix", qualite: 2, si: { sans_faits: ["frequence"] }, faits: ["frequence"],
          feedback: "Question fermée, mais recommandée par le protocole pour distinguer un fait unique de faits répétés.",
          reponse: "Une fois. Juste mercredi."
        },
        {
          question: "Ça a dû te faire très peur, ce que Kévin t'a fait…",
          type: "suggestive", qualite: -1, effets: { stress: 1 }, faits: ["c_peur"],
          feedback: "Vous attribuez une émotion à l'enfant. Elle acquiesce, mais rien ne dit que c'est ce qu'elle a ressenti.",
          mieux: "Tu as dit que tu lui as dit qu'il te faisait mal. Comment tu t'es sentie à ce moment-là ?",
          reponse: { texte: "…Oui.", expression: "triste" }
        },
        {
          question: "Inès, c'est qui ?",
          type: "directive", si: { faits: ["temoin"] },
          feedback: "Question directive sur une personne mentionnée par l'enfant. Pensez à la faire suivre d'une invitation (appariement).",
          reponse: "C'est ma copine. Elle est dans ma classe."
        },
        {
          question: "Bon, je crois que j'ai compris l'essentiel.",
          type: "consigne", qualite: 0,
          feedback: "Clôture prématurée : des détails importants (marque, fréquence, révélation) n'ont pas été explorés.",
          suivant: "cloture"
        }
      ]
    },

    recit_4: {
      phase: "recit",
      didascalie: "Léa montre son avant-bras gauche.",
      enfant: "Là. C'était tout violet. Maman elle a fait une photo.",
      faitsAuto: ["marque", "photo"],
      silence: {
        qualite: 2,
        reponse: { texte: "…Ça fait plus mal maintenant." },
        feedback: "Pause bien placée : l'enfant complète, sans pression."
      },
      choix: [
        {
          question: "Tu as dit que maman a fait une photo. Raconte-moi ce qui s'est passé quand maman a vu ton bras.",
          type: "invitation_indicee", faits: ["cognee"],
          feedback: "Invitation indicée qui révèle un élément important : Léa a d'abord caché la vérité à sa mère. Ce genre de détail, typique des révélations différées, n'apparaît qu'avec des questions ouvertes.",
          reponse: { texte: "Elle m'a demandé ce qui s'était passé. J'ai dit que je m'étais cognée.", expression: "triste", didascalie: "Léa baisse la voix." }
        },
        {
          question: "Tu as dit que tu avais dit à maman que tu t'étais cognée. Parle-moi de ça.",
          type: "invitation_indicee", si: { faits: ["cognee"] }, faits: ["peur_gronder"],
          feedback: "Vous creusez avec ses mots, sans jugement : Léa explique elle-même pourquoi elle s'est tue.",
          reponse: { texte: "J'avais peur que Kévin il se fasse gronder. Et que moi aussi.", expression: "triste" }
        },
        {
          question: "Ta maman devait être très fâchée contre Kévin, non ?",
          type: "suggestive", qualite: -1,
          feedback: "Question sur l'état d'esprit d'un autre adulte, formulée de façon suggestive : l'enfant ne peut que spéculer.",
          mieux: "Raconte-moi ce qui s'est passé quand maman a vu ton bras.",
          reponse: "…Je sais pas."
        },
        {
          question: "Est-ce que c'est arrivé une fois, ou plus d'une fois ?",
          type: "choix", qualite: 2, si: { sans_faits: ["frequence"] }, faits: ["frequence"],
          feedback: "Question recommandée par le protocole pour distinguer un fait unique de faits répétés.",
          reponse: "Une fois. Juste mercredi."
        },
        {
          question: "Y a-t-il autre chose dont tu te souviens sur mercredi ?",
          type: "invitation",
          feedback: "Invitation ouverte de fin de récit : elle permet à l'enfant d'ajouter ce qu'on ne lui a pas demandé.",
          suivant: "recit_5"
        }
      ]
    },

    recit_5: {
      phase: "recit",
      enfant: "Euh… Kévin il m'a dit : « La prochaine fois, tu ranges quand on te dit. » C'est tout.",
      faitsAuto: ["phrase"],
      choix: [
        {
          question: "Qui a été la première personne à savoir ce qui s'était passé ?",
          type: "directive", qualite: 2, si: { sans_faits: ["revelation"] }, faits: ["revelation"],
          feedback: "Question sur la révélation, prévue par le protocole : elle éclaire à qui l'enfant a parlé, et donc les influences possibles.",
          reponse: "Inès. Et après la maîtresse, lundi, parce qu'elle a vu mon bras en sport."
        },
        {
          question: "Y a-t-il autre chose que tu penses que je devrais savoir ?",
          type: "invitation",
          feedback: "Question ouverte de fin d'investigation, recommandée par le protocole.",
          suivant: "cloture"
        },
        {
          question: "Et Kévin, il fait ça à d'autres enfants aussi ?",
          type: "directive", qualite: 0,
          feedback: "Vous invitez Léa à généraliser sur d'autres enfants : réponse spéculative (« je crois »), difficile à exploiter. Si c'est utile, demandez ce qu'elle a vu elle-même.",
          mieux: "Est-ce que tu as vu quelque chose comme ça arriver à quelqu'un d'autre ?",
          reponse: "…Je crois. Des fois il crie sur Mathis."
        },
        {
          question: "Tu es sûre que c'était mercredi, et pas un autre jour ?",
          type: "inadaptee", qualite: -1, effets: { stress: 2, confiance: -1 },
          feedback: "Remettre en cause une réponse claire fragilise l'enfant : Léa passe de « mercredi » à « je crois ». Devant un tribunal, c'est cette hésitation qui sera retenue.",
          reponse: { texte: "…Je sais pas. Mercredi, je crois.", expression: "inquiet" }
        }
      ]
    },

    /* ───────────── CLÔTURE ───────────── */
    cloture: {
      phase: "cloture",
      parType: {
        defaut: { qualite: 1, reponse: "D'accord.", suivant: "cloture_neutre",
          feedback: "Clôture correcte, mais demandez aussi à l'enfant s'il a des questions, et remerciez-le pour ses efforts." }
      },
      enfant: [
        { si: { stress_min: 7 }, texte: "…Non. Je peux partir ?", expression: "inquiet" },
        { texte: "Non… c'est tout." }
      ],
      choix: [
        {
          question: "Merci Léa. Tu as fait beaucoup d'efforts pour bien m'expliquer. Est-ce que tu as des questions, toi ?",
          type: "consigne", qualite: 2,
          feedback: "Remerciement pour l'effort, et place laissée aux questions de l'enfant : clôture conforme.",
          suivant: "cloture_question"
        },
        {
          question: "Merci Léa, tu m'as dit des choses très importantes sur Kévin.",
          type: "soutien", qualite: 0,
          feedback: "Remercier pour le contenu (« des choses importantes sur Kévin ») valide une version des faits. Remerciez pour l'effort, pas pour ce qui a été dit.",
          mieux: "Merci Léa. Tu as fait beaucoup d'efforts pour bien m'expliquer.",
          reponse: "…D'accord.",
          suivant: "cloture_neutre"
        },
        {
          question: "C'est bon, on a fini. Tu peux aller retrouver ta maman.",
          type: "consigne", qualite: 0,
          feedback: "Clôture abrupte : ni questions de l'enfant, ni sujet neutre pour terminer.",
          mieux: "Est-ce que tu as des questions, toi ? … Qu'est-ce que tu vas faire cet après-midi ?",
          suivant: "fin"
        }
      ]
    },

    cloture_question: {
      phase: "cloture",
      parType: { defaut: { reponse: "D'accord.", suivant: "cloture_neutre" } },
      enfant: "Je vais revoir Kévin, mercredi ?",
      expression: "inquiet",
      choix: [
        {
          question: "C'est une question importante. Je ne peux pas te répondre maintenant ; je vais en parler avec ta maman, et ce sont des adultes qui vont s'en occuper.",
          type: "consigne", qualite: 2, motsCles: "adultes|s'en occuper|ta maman|pas te repondre|je (ne )?sais pas encore",
          feedback: "Réponse honnête, sans promesse, qui décharge l'enfant de la suite.",
          reponse: "D'accord.",
          suivant: "cloture_neutre"
        },
        {
          question: "Non, ne t'inquiète pas : tu ne le reverras plus jamais.",
          type: "inadaptee", qualite: -1, effets: { stress: -1 }, motsCles: "plus jamais|ne t'inquiete pas|je te (le )?promets|\\bpromis\\b|(re)?verras (plus|jamais)",
          feedback: "Promesse que vous ne pouvez pas garantir. Si elle n'est pas tenue, l'enfant perdra confiance dans les adultes qui l'ont entendue.",
          mieux: "Je ne peux pas te répondre maintenant ; je vais en parler avec ta maman.",
          reponse: "D'accord.",
          suivant: "cloture_neutre"
        },
        {
          question: "Ça, je ne sais pas du tout.",
          type: "consigne", qualite: 0, effets: { stress: 1 },
          feedback: "Honnête, mais sec : l'enfant repart avec son inquiétude. Expliquez qui va s'en occuper.",
          reponse: { texte: "…", expression: "inquiet" },
          suivant: "cloture_neutre"
        }
      ]
    },

    cloture_neutre: {
      phase: "cloture",
      parType: { defaut: { suivant: "fin" } },
      enfant: "D'accord.",
      choix: [
        {
          question: "Et cet après-midi, qu'est-ce que tu vas faire ?",
          type: "consigne", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Sujet neutre pour terminer : l'enfant quitte la salle sur une note apaisée.",
          suivant: "fin"
        },
        {
          question: "Bon. Ta maman t'attend à côté.",
          type: "consigne", qualite: 1,
          feedback: "Correct, mais un sujet neutre aurait permis de terminer sur une note plus légère.",
          suivant: "fin"
        }
      ]
    },

    fin: {
      phase: "cloture",
      enfant: [
        { si: { stress_max: 5 }, texte: "Je vais au parc avec Hugo ! Il va encore dire que j'ai triché.", expression: "detendu" },
        { texte: "…D'accord." }
      ],
      fin: true
    }
  }
};

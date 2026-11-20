/*
 * Scénario « Noah, 6 ans » : exemple FICTIF pour le prototype.
 * Enfant témoin de violences au domicile. Difficultés propres au cas :
 *   - jeune âge : repères de temps fragiles, vocabulaire simple, règles à tester très concrètement ;
 *   - conflit de loyauté : Noah aime son père, le stress monte dès qu'on parle de lui ;
 *   - pré-contamination : sa mère et sa tante ont déjà parlé des faits avec lui (« papa est méchant »).
 * Format : voir l'en-tête de scenarios/lea.js.
 */
window.SCENARIOS = window.SCENARIOS || {};
window.SCENARIOS.noah = {
  titre: "Noah, 6 ans",
  prenom: "Noah",
  age: "6 ans · témoin",
  genre: "m",
  contexte: "Plainte de la mère pour violences conjugales. Noah était présent au domicile au moment des faits. Audition filmée en salle Mélanie.",
  depart: "intro",
  etatInitial: { confiance: 2, stress: 5, contamination: 0 },
  dossier: {
    postits: [
      "Noah B., 6 ans, en CP",
      "Plainte de la mère : dispute au domicile, samedi soir",
      "Mère : « Noah a tout vu »",
      "La mère et la tante ont DÉJÀ parlé des faits avec Noah",
      "Tante Sonia venue chercher les enfants samedi soir",
      "Père : a quitté le domicile, sera entendu"
    ]
  },
  apparence: { peau: "#c98e62", peauOmbre: "#b47a50", cheveux: "#2b1d14", pull: "#4f9d6e", pullFonce: "#3f8a5d", pantalon: "#3b4a7a", chaussure: "#f2f2f2", coiffure: "court", accessoire: "lapin" },
  soutiens: [
    "Tu fais beaucoup d'efforts. Prends ton temps, Pompon et toi, vous m'aidez beaucoup.",
    "Je vois que c'est difficile. On n'est pas pressés, tu peux souffler un peu.",
    "Tu as le droit de prendre ton temps. Tu m'aides beaucoup en étant là."
  ],

  faits: {
    moment:     { texte: "C'était le soir du match à la télé (samedi)", fiable: true },
    lieu:       { texte: "Ça s'est passé dans la cuisine", fiable: true },
    cris:       { texte: "Papa et maman criaient fort", fiable: true },
    geste:      { texte: "Papa a poussé maman", fiable: true },
    chute:      { texte: "Maman est tombée par terre", fiable: true },
    blessure:   { texte: "Maman s'est cogné la tête contre le placard, elle saignait un peu au front", fiable: true },
    position:   { texte: "Noah a vu la scène depuis le couloir, avec son lapin Pompon", fiable: true },
    soeur:      { texte: "Sa petite sœur Lila dormait", fiable: true },
    depart:     { texte: "Papa est parti en voiture ; maman a appelé tatie Sonia", fiable: true },
    calin:      { texte: "Noah a fait un câlin à sa maman, qui pleurait", fiable: true },
    frequence:  { texte: "Il y a parfois des cris, mais Noah n'a vu papa pousser maman qu'une seule fois", fiable: true },
    source:     { texte: "« Papa est méchant » : Noah répète ce que les adultes ont dit, il dit aimer son père", fiable: true },
    revelation: { texte: "Noah a raconté à tatie Sonia le soir même", fiable: true },
    c_samedi:   { texte: "« Samedi, à la maison » : cadre des faits introduit par l'enquêteur", fiable: false },
    c_vu:       { texte: "« Tu as tout vu » : affirmation de la mère reprise par l'enquêteur", fiable: false },
    c_parents:  { texte: "Le sujet « papa et maman » introduit par l'enquêteur", fiable: false },
    c_frappe:   { texte: "Papa aurait tapé maman (suggéré par l'enquêteur)", fiable: false },
    c_alcool:   { texte: "Papa aurait bu (suggéré par l'enquêteur)", fiable: false },
    c_souvent:  { texte: "Les violences seraient fréquentes (suggéré par l'enquêteur)", fiable: false },
    c_mechant:  { texte: "Le jugement « papa est méchant » validé par l'enquêteur", fiable: false }
  },

  noeuds: {
    /* ───────────── INTRODUCTION ───────────── */
    intro: {
      phase: "introduction",
      didascalie: "Noah s'est assis tout au bord du canapé, un lapin en peluche serré contre lui.",
      enfant: "…",
      silence: {
        qualite: 0, effets: { stress: 1 },
        reponse: { texte: "…", didascalie: "Noah ne bouge pas. Il vous observe par-dessus les oreilles de son lapin." },
        feedback: "Un enfant de 6 ans attend que l'adulte prenne l'initiative : présentez-vous."
      },
      choix: [
        {
          question: "Bonjour Noah. Moi, c'est Camille. Je suis gendarme, et mon travail, c'est d'écouter les enfants. Tu peux t'asseoir sur le canapé. Tu vois la caméra, là-haut ? Elle filme, comme ça je n'oublie rien de ce qu'on dit.",
          type: "consigne", qualite: 2, effets: { confiance: 2, stress: -1 },
          feedback: "Introduction conforme et adaptée à l'âge : phrases courtes, rôle, caméra, invitation à s'installer.",
          suivant: "regles"
        },
        {
          question: "Bonjour Noah ! Il est beau, ton lapin. Comment il s'appelle ?",
          type: "directive", qualite: 1, effets: { confiance: 2 }, marque: "pompon",
          feedback: "Bonne accroche pour un enfant de 6 ans, et il répond ! Mais elle ne remplace pas l'introduction : votre rôle et la caméra restent à expliquer.",
          reponse: { texte: "…Pompon.", didascalie: "Noah montre timidement son lapin." }
        },
        {
          question: "Bonjour Noah. Je suis gendarme. On va parler un peu de ce qui s'est passé samedi à la maison, d'accord ?",
          type: "consigne", qualite: -1, effets: { stress: 2 }, faits: ["c_samedi"],
          feedback: "Vous annoncez le jour et le lieu des faits dès la première phrase. Noah n'a rien dit, et sait déjà ce que vous attendez de lui.",
          mieux: "Je suis gendarme, et mon travail, c'est d'écouter les enfants. Tu vois la caméra, là-haut ?",
          reponse: { texte: "…", expression: "ferme", didascalie: "Noah se cache à moitié derrière son lapin." },
          suivant: "regles"
        },
        {
          question: "Coucou mon grand. N'aie pas peur, ici tout le monde est gentil.",
          type: "inadaptee", qualite: 0, effets: { confiance: 1 },
          feedback: "« Ici tout le monde est gentil » oppose implicitement cette pièce à un ailleurs où quelqu'un ne l'est pas : c'est déjà une suggestion. Et l'introduction (rôle, caméra) manque.",
          mieux: "Bonjour Noah. Moi, c'est Camille. Je suis gendarme, et mon travail, c'est d'écouter les enfants.",
          suivant: "regles"
        }
      ]
    },

    /* ───────────── RÈGLES DE BASE ───────────── */
    regles: {
      phase: "regles",
      enfant: [
        { si: { confiance_max: 3 }, texte: "…", didascalie: "Noah ne répond pas, mais il vous regarde." },
        { texte: "D'accord.", didascalie: "Noah se recule dans le canapé, Pompon sur les genoux." }
      ],
      choix: [
        {
          question: "Je vais te poser des questions. Si tu ne sais pas la réponse, tu dis « je sais pas ». On essaie ? Comment il s'appelle, mon chat ?",
          type: "consigne", qualite: 2, effets: { confiance: 1 },
          feedback: "Règle posée en mots simples et testée immédiatement : parfait pour un enfant de 6 ans.",
          suivant: "regles_test"
        },
        {
          question: "Ici, il faut dire la vérité. Tu sais ce que c'est, un mensonge ?",
          type: "consigne", qualite: 0, effets: { stress: 1 },
          feedback: "Trop abstrait à 6 ans : Noah récite une règle morale (« c'est pas bien ») sans montrer qu'il distingue le vrai du faux. Utilisez un exemple concret.",
          mieux: "Si je dis que ton lapin est un éléphant, c'est vrai ou c'est pas vrai ?",
          reponse: { texte: "…C'est pas bien.", expression: "inquiet" }
        },
        {
          question: "Si je dis que ton lapin est un éléphant, c'est vrai ou c'est pas vrai ?",
          type: "choix", qualite: 2, effets: { confiance: 1, stress: -1 }, marque: "verite",
          feedback: "Test concret du vrai et du faux, avec un objet de l'enfant : idéal à cet âge, et ça le détend.",
          reponse: { texte: "Pas vrai ! C'est un lapin !", expression: "detendu", didascalie: "Noah sourit pour la première fois." }
        },
        {
          question: "Tu dois bien répondre à toutes mes questions, même si c'est difficile, d'accord ?",
          type: "inadaptee", qualite: -1, effets: { stress: 2 },
          feedback: "Mettre la pression pousse l'enfant à répondre même s'il ne sait pas, donc à deviner. C'est l'inverse des règles de base.",
          mieux: "Si tu ne sais pas la réponse, tu dis « je sais pas ».",
          reponse: { texte: "…D'accord.", expression: "inquiet" },
          suivant: "rapport_debut"
        }
      ]
    },

    regles_test: {
      phase: "regles",
      didascalie: "Noah a un petit rire.",
      enfant: "Je sais pas !",
      expression: "detendu",
      choix: [
        {
          question: "C'est ça ! Et si je dis quelque chose de pas vrai, tu me dis « c'est pas vrai ». Si je dis que tu as quinze ans ?",
          type: "consigne", qualite: 2, effets: { confiance: 1 }, marque: "corrige",
          feedback: "Règle de correction testée : Noah fait l'expérience qu'il peut contredire un adulte.",
          reponse: { texte: "Non ! J'ai six ans !", expression: "detendu" }
        },
        {
          question: "Si tu ne comprends pas une question, tu me dis « je comprends pas », et je la dirai autrement.",
          type: "consigne", qualite: 2, marque: "comprend",
          feedback: "Règle « je ne comprends pas » posée : essentielle à 6 ans.",
          reponse: "D'accord."
        },
        {
          question: "Est-ce que tu promets de me dire seulement des choses qui sont vraiment arrivées ?",
          type: "consigne", qualite: 2, marque: "promesse",
          feedback: "Promesse simple, adaptée à l'âge.",
          reponse: "Oui. Promis."
        },
        {
          question: "On a fini les règles. Maintenant, on va faire connaissance.",
          type: "consigne", qualite: 1,
          feedback: "Il manque au moins une règle (correction, « je comprends pas » ou promesse).",
          selon: [{ si: { marques: ["corrige", "promesse"] }, qualite: 2, feedback: "Règles posées et testées : vous pouvez passer au rapport." }],
          reponse: "D'accord.",
          suivant: "rapport_debut"
        }
      ]
    },

    /* ───────────── RAPPORT ───────────── */
    rapport_debut: {
      phase: "rapport",
      enfant: "D'accord.",
      choix: [
        {
          question: "J'aimerais bien te connaître. Raconte-moi les choses que tu aimes faire.",
          type: "invitation", effets: { confiance: 2, stress: -1 },
          feedback: "Invitation ouverte en rapport : simple et efficace.",
          suivant: "rapport"
        },
        {
          question: "Tu aimes quoi, toi : les dinosaures, les voitures ?",
          type: "choix", qualite: 0, effets: { confiance: 1 },
          feedback: "Choix imposé : Noah prend la première option. Vous ne saurez pas ce qu'il aime vraiment, et il apprend à choisir parmi vos propositions.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          reponse: "Les dinosaures.",
          suivant: "rapport"
        },
        {
          question: "Et à la maison, avec papa et maman, ça se passe comment ?",
          type: "suggestive", qualite: -2, effets: { stress: 2, confiance: -1 }, faits: ["c_parents"],
          feedback: "En phase de rapport, vous ciblez directement le contexte des faits. La loyauté envers ses deux parents met Noah en difficulté immédiatement.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          reponse: { texte: "…", expression: "triste", didascalie: "Noah serre Pompon et regarde le sol." }
        }
      ]
    },

    rapport: {
      phase: "rapport",
      enfant: [
        { si: { confiance_min: 4 }, texte: "J'aime bien les dinosaures. J'en ai plein ! Le plus fort, c'est le T-rex. Grrr !", expression: "detendu" },
        { texte: "Les dinosaures." }
      ],
      silence: {
        qualite: 2, effets: { confiance: 1 },
        reponse: { texte: "…Et j'ai un diplodocus aussi. Il est grand comme ça !", expression: "detendu", didascalie: "Noah écarte les bras." },
        feedback: "Petit silence attentif : Noah complète tout seul."
      },
      choix: [
        {
          question: "Tu as parlé des dinosaures. Raconte-moi tout sur tes dinosaures.",
          type: "invitation_indicee", effets: { confiance: 1 }, marque: "rapport_ok",
          feedback: "Invitation indicée sur le sujet choisi par l'enfant : il se détend et parle davantage.",
          reponse: { texte: "J'ai un T-rex qui fait du bruit, et un diplodocus géant. On les a achetés au musée avec papa.", expression: "detendu" }
        },
        {
          question: "Le T-rex, c'est ton préféré ?",
          type: "choix", qualite: 1,
          feedback: "Question fermée sans conséquence, mais qui produit un simple « oui ».",
          reponse: "Oui."
        },
        {
          question: "Ah, avec papa ! Tu aimes bien faire des choses avec ton papa ?",
          type: "choix", qualite: -1, effets: { stress: 2 }, si: { marques: ["rapport_ok"] },
          feedback: "Noah a mentionné son père en passant. Rebondir dessus pendant le rapport fait entrer le conflit de loyauté dans l'échange. Restez sur les dinosaures.",
          mieux: "Tu as parlé du musée. Raconte-moi tout sur le musée.",
          reponse: { texte: "…Avant, oui.", expression: "triste", didascalie: "Noah baisse les yeux." }
        },
        {
          question: "Maintenant, raconte-moi une journée en entier : ton dernier anniversaire, du début à la fin.",
          type: "invitation",
          feedback: "Passage à l'entraînement de la mémoire épisodique.",
          selon: [{ si: { sans_marques: ["rapport_ok"] }, qualite: 1, feedback: "Bonne consigne, mais le rapport a été très court : Noah n'est pas encore à l'aise." }],
          suivant: "memoire"
        }
      ]
    },

    /* ───────────── ENTRAÎNEMENT MÉMOIRE ÉPISODIQUE ───────────── */
    memoire: {
      phase: "memoire",
      enfant: [
        { si: { stress_min: 6 }, texte: "Un gâteau.", expression: "inquiet" },
        { texte: "Y avait un gâteau dinosaure ! Et tatie Sonia. Et on a fait une chasse au trésor.", expression: "detendu" }
      ],
      choix: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", effets: { confiance: 1 }, marque: "mem_ok",
          feedback: "« Et ensuite ? » : l'enfant s'entraîne à dérouler un récit.",
          reponse: { texte: "On a cherché partout, et le trésor c'était des bonbons ! Et Lila elle a tout renversé par terre.", expression: "detendu" }
        },
        {
          question: "Tu as parlé de la chasse au trésor. Raconte-moi tout sur la chasse au trésor.",
          type: "invitation_indicee", effets: { confiance: 1 }, marque: "mem_ok", si: { stress_max: 5 },
          feedback: "Invitation indicée : exactement l'outil qui servira ensuite sur les faits.",
          reponse: { texte: "Y avait des papiers avec des dessins, et il fallait trouver. Moi j'ai trouvé derrière le canapé !", expression: "detendu" }
        },
        {
          question: "C'était quand, ton anniversaire ?",
          type: "directive", qualite: 0,
          feedback: "À 6 ans, les repères de date sont fragiles : Noah répond au hasard. À éviter, surtout sur les faits.",
          mieux: "Et ensuite, qu'est-ce qui s'est passé ?",
          reponse: "Euh… quand il faisait chaud ?"
        },
        {
          question: "Merci, tu racontes très bien, avec plein de détails. C'est comme ça que j'ai besoin que tu me racontes les choses.",
          type: "soutien", qualite: 2, effets: { confiance: 1 },
          feedback: "Vous valorisez la manière, pas le contenu : le lien parfait vers la transition.",
          selon: [{ si: { sans_marques: ["mem_ok"] }, qualite: 1, feedback: "Bon message, mais l'entraînement a été très court : une ou deux relances (« Et ensuite ? ») l'auraient rendu plus utile." }],
          suivant: "transition"
        }
      ]
    },

    /* ───────────── TRANSITION ───────────── */
    transition: {
      phase: "transition",
      enfant: [
        { si: { confiance_min: 5 }, texte: "D'accord." },
        { texte: "…", expression: "inquiet", didascalie: "Noah tortille l'oreille de Pompon." }
      ],
      choix: [
        {
          question: "Maintenant, je voudrais savoir pourquoi tu es venu me voir aujourd'hui. Dis-moi pourquoi tu es là.",
          type: "invitation",
          feedback: "Invitation la plus ouverte possible : c'est Noah qui choisit ses mots.",
          suivant: [{ si: { confiance_min: 5 }, vers: "recit" }, { vers: "transition_bloque" }]
        },
        {
          question: "Ta maman m'a dit que tu avais tout vu samedi. Raconte-moi.",
          type: "suggestive", qualite: -1, effets: { stress: 1 }, faits: ["c_vu", "c_samedi"],
          feedback: "Forme ouverte, mais vous reprenez l'affirmation de la mère (« tout vu ») et le jour des faits. Noah sait désormais ce que les adultes attendent de lui.",
          mieux: "Dis-moi pourquoi tu es là.",
          suivant: "recit"
        },
        {
          question: "Je crois qu'il s'est passé quelque chose à la maison, entre papa et maman. Tu veux bien m'en parler ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_parents"],
          feedback: "Double problème : vous introduisez le sujet (papa et maman), et vous posez une question oui/non que Noah peut refuser. C'est ce qu'il fait.",
          mieux: "Dis-moi pourquoi tu es là.",
          reponse: { texte: "Non.", expression: "ferme" },
          suivant: "transition_bloque"
        },
        {
          question: "Est-ce que tu sais pourquoi tu es là ?",
          type: "choix", qualite: 0,
          feedback: "Réponse « oui » attendue, et rien de plus. Transformez-la en invitation : « Dis-moi pourquoi tu es là ».",
          reponse: { texte: "…Oui.", expression: "inquiet" }
        }
      ]
    },

    transition_bloque: {
      phase: "transition",
      enfant: "Je sais pas.",
      expression: "inquiet",
      didascalie: "Noah cache son visage dans Pompon.",
      choix: [
        {
          question: "J'ai entendu dire que tu avais parlé à tatie Sonia. Dis-moi ce que tu lui as raconté.",
          type: "invitation_indicee", qualite: 2, effets: { confiance: 1 }, faits: ["revelation"],
          feedback: "Vous évoquez une source (la tante) sans le contenu : le deuxième palier du protocole, bien utilisé.",
          suivant: "recit"
        },
        {
          question: "C'est pas grave. Prends ton temps. Pompon et toi, vous m'aidez beaucoup.",
          type: "soutien", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Soutien adapté à l'âge (en passant par le doudou) : la pression baisse.",
          reponse: { texte: "…", didascalie: "Noah relève un peu la tête." }
        },
        {
          question: "C'est à propos de papa, qui a tapé maman ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_parents", "c_frappe"],
          feedback: "Vous fournissez le qui et le quoi, avec un geste (« tapé ») qui ne figure même pas dans la plainte.",
          mieux: "J'ai entendu dire que tu avais parlé à tatie Sonia. Dis-moi ce que tu lui as raconté.",
          suivant: "recit_suggestif"
        },
        {
          question: "Est-ce que quelqu'un s'est fait mal, chez toi ?",
          type: "choix", qualite: 0, effets: { stress: 1 }, faits: ["c_samedi"],
          feedback: "Question fermée de dernier recours, qui introduit le lieu (chez toi) et l'idée d'une blessure. À réserver à l'échec des invitations indicées.",
          mieux: "J'ai entendu dire que tu avais parlé à tatie Sonia. Dis-moi ce que tu lui as raconté.",
          suivant: "transition_oui"
        }
      ]
    },

    transition_oui: {
      phase: "transition",
      enfant: "…Maman.",
      expression: "triste",
      choix: [
        {
          question: "Raconte-moi tout ce qui s'est passé.",
          type: "invitation",
          feedback: "Invitation ouverte dès que l'enfant ouvre la porte : bien.",
          suivant: "recit"
        },
        {
          question: "C'est papa qui lui a fait mal ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_parents"],
          feedback: "Vous désignez l'auteur à la place de l'enfant.",
          mieux: "Raconte-moi tout ce qui s'est passé.",
          suivant: "recit_suggestif"
        },
        {
          question: "Elle s'est fait mal où ?",
          type: "directive", qualite: 1, faits: ["blessure"],
          feedback: "Question directive sur un élément donné par l'enfant (« maman ») : acceptable, mais l'invitation « Raconte-moi tout » aurait dû venir d'abord.",
          reponse: { texte: "À la tête. Contre le placard.", expression: "triste" }
        }
      ]
    },

    recit_suggestif: {
      phase: "transition",
      enfant: "…Papa il est méchant. Maman elle a dit.",
      expression: "ferme",
      didascalie: "Noah parle dans son lapin, très bas.",
      choix: [
        {
          question: "D'accord. Raconte-moi tout ce qui s'est passé, toi, depuis le début.",
          type: "invitation", qualite: 1,
          feedback: "Bon rattrapage : vous recentrez sur ce que Noah a vécu. Mais la suggestion précédente restera au dossier.",
          suivant: "recit"
        },
        {
          question: "Tu as dit « maman elle a dit ». Raconte-moi ce que maman t'a dit.",
          type: "invitation_indicee", qualite: 2, faits: ["source"],
          feedback: "Excellent réflexe : vous explorez la source du jugement. Il apparaît que « méchant » vient des adultes, pas de ce que Noah a vu.",
          reponse: { texte: "Maman et tatie, elles ont dit que papa il est méchant. Moi je l'aime, papa.", expression: "triste" }
        },
        {
          question: "C'est vrai que ce n'est pas bien, ce qu'il a fait, papa.",
          type: "suggestive", qualite: -2, effets: { stress: 2, confiance: -1 }, faits: ["c_mechant"],
          feedback: "Vous validez un jugement sur le père. Pour un enfant en conflit de loyauté, c'est un signal qu'il faut « charger » papa, ou se taire pour le protéger.",
          mieux: "Raconte-moi tout ce qui s'est passé, toi, depuis le début.",
          reponse: { texte: "…Je veux plus parler.", expression: "ferme" },
          suivant: "recit_ferme"
        }
      ]
    },

    recit_ferme: {
      phase: "recit",
      enfant: "Je veux plus parler.",
      expression: "ferme",
      choix: [
        {
          question: "D'accord. Tu peux faire une pause. Tu n'as rien fait de mal, et tu m'aides beaucoup.",
          type: "soutien", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Vous respectez la réticence et déchargez l'enfant de toute culpabilité, sans parler des faits.",
          reponse: { texte: "…", didascalie: "Noah hoche la tête, le nez dans Pompon." }
        },
        {
          question: "On fait une petite pause. Dis-moi, c'est quel dinosaure, le plus fort, déjà ?",
          type: "consigne", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Retour bref au rapport : la meilleure façon de rouvrir un enfant qui se ferme.",
          reponse: { texte: "Le T-rex. Il gagne toujours.", expression: "neutre" },
          suivant: "transition"
        },
        {
          question: "Raconte-moi juste ce que tu as vu, toi.",
          type: "invitation", qualite: 1, effets: { stress: 1 },
          feedback: "Invitation pertinente (centrée sur ce qu'il a vu), mais trop tôt : la pression n'est pas retombée.",
          suivant: [{ si: { stress_max: 7 }, vers: "recit" }, { vers: "cloture" }]
        }
      ]
    },

    /* ───────────── RÉCIT LIBRE ───────────── */
    recit: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 7 }, texte: "Papa il a crié… et maman elle est tombée.", expression: "ferme" },
        { texte: "C'était le soir du match à la télé. Papa et maman, ils criaient fort dans la cuisine. Et papa il a poussé maman. Elle est tombée." }
      ],
      faitsAuto: ["cris", "chute"],
      faitsAutoSi: { si: { stress_max: 6 }, faits: ["moment", "lieu", "geste"] },
      silence: {
        qualite: 2,
        reponse: { texte: "…Moi j'étais dans le couloir. Avec Pompon.", didascalie: "Noah serre son lapin." },
        feedback: "Pause attentive : Noah précise de lui-même d'où il a vu la scène.",
        faits: ["position"]
      },
      choix: [
        {
          question: "Raconte-moi tout ce qui s'est passé ce soir-là, depuis le début jusqu'à la fin.",
          type: "invitation", effets: { confiance: 1 },
          feedback: "Invitation de récit libre, avec un repère que Noah a lui-même donné (« ce soir-là »).",
          suivant: "recit_2"
        },
        {
          question: "Tu as dit que papa a poussé maman. Raconte-moi tout sur ce moment-là.",
          type: "invitation_indicee", si: { faits: ["geste"] },
          feedback: "Invitation indicée reprenant exactement ses mots.",
          suivant: "recit_2"
        },
        {
          question: "Il l'a tapée aussi ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_frappe"],
          feedback: "Vous introduisez un geste que Noah n'a pas décrit. Sa réponse (« oui ? ») montre qu'il cherche la bonne réponse, pas son souvenir.",
          mieux: "Tu as dit que papa a poussé maman. Raconte-moi tout sur ce moment-là.",
          reponse: { texte: "…Je sais pas. Oui ?", expression: "inquiet" }
        },
        {
          question: "Ton papa avait bu, ce soir-là ?",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_alcool"],
          feedback: "Question fermée qui introduit l'alcool. La réponse de Noah (« sa bière ») sera lue comme une confirmation, alors qu'elle ne dit rien d'un état d'ivresse.",
          mieux: "Raconte-moi tout ce qui s'est passé ce soir-là, depuis le début.",
          reponse: "…Il avait sa bière. Devant le match."
        },
        {
          question: "Tu étais où, toi ?",
          type: "directive", qualite: 1, si: { sans_faits: ["position"] }, faits: ["position"],
          feedback: "Bonne question de précision, mais un peu tôt : le récit libre n'est pas épuisé. Pensez à l'appariement (faites suivre d'une invitation).",
          reponse: "Dans le couloir. Avec Pompon."
        }
      ]
    },

    recit_2: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 7 }, texte: "Elle a fait boum. Contre le placard.", expression: "ferme" },
        { texte: "Maman elle s'est cogné la tête contre le placard. Y avait du sang, là. Papa il est méchant.", didascalie: "Noah touche son propre front." }
      ],
      faitsAutoSi: { si: { stress_max: 6 }, faits: ["blessure"] },
      silence: {
        qualite: 2,
        reponse: { texte: "…Maman elle pleurait.", expression: "triste" },
        feedback: "Le silence laisse venir un détail émotionnel, sans que vous l'ayez suggéré."
      },
      choix: [
        {
          question: "Tu as dit « papa il est méchant ». Parle-moi de ça.",
          type: "invitation_indicee", qualite: 1, si: { faits: ["blessure"], sans_faits: ["source"] }, faits: ["source"],
          feedback: "Vous reprenez bien ses mots, et il apparaît que ce jugement vient des adultes. Attention toutefois : vous mettez l'accent sur un jugement plutôt que sur les faits, ce qui peut raviver le conflit de loyauté.",
          mieux: "Ce que tu me racontes, tu l'as vu toi-même, ou quelqu'un te l'a raconté ?",
          reponse: { texte: "C'est maman qui dit ça. Et tatie. Moi je l'aime, papa.", expression: "triste" }
        },
        {
          question: "C'est vrai que ce n'est pas bien, ce qu'il a fait, papa.",
          type: "suggestive", qualite: -2, effets: { stress: 2, confiance: -1 }, faits: ["c_mechant"],
          feedback: "Vous validez un jugement sur le père : l'enfant, pris dans un conflit de loyauté, se ferme.",
          mieux: "Et ensuite, qu'est-ce qui s'est passé ?",
          reponse: { texte: "…", expression: "ferme", didascalie: "Noah enfouit son visage dans Pompon." }
        },
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation",
          feedback: "« Et ensuite ? » : le récit avance sans rien suggérer.",
          suivant: "recit_3"
        },
        {
          question: "Ce que tu me racontes, tu l'as vu toi-même, ou quelqu'un te l'a raconté ?",
          type: "choix", qualite: 2, si: { sans_faits: ["position"] }, faits: ["position"],
          feedback: "Question de source, essentielle chez un enfant à qui les adultes ont déjà parlé des faits. Ici, Noah confirme avoir vu lui-même.",
          reponse: "Je l'ai vu ! J'étais dans le couloir, avec Pompon."
        }
      ]
    },

    recit_3: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 7 }, texte: "Papa il est parti.", expression: "ferme" },
        { texte: "Après, papa il est parti avec la voiture. Maman elle a appelé tatie Sonia. Lila elle dormait, elle a rien vu." }
      ],
      faitsAuto: ["depart"],
      faitsAutoSi: { si: { stress_max: 6 }, faits: ["soeur"] },
      choix: [
        {
          question: "Est-ce que c'est arrivé une fois, ou plus d'une fois ?",
          type: "choix", qualite: 2, si: { sans_faits: ["frequence"] }, faits: ["frequence"],
          feedback: "Question recommandée par le protocole. La réponse nuance la plainte : des cris parfois, une seule poussée vue.",
          reponse: "Une fois. Des fois ils crient, mais papa il pousse pas, d'habitude."
        },
        {
          question: "Ça arrive souvent, que papa fasse du mal à maman ?",
          type: "suggestive", qualite: -2, effets: { stress: 2 }, faits: ["c_souvent"],
          feedback: "La question présuppose des violences répétées. Noah acquiesce d'un « oui ? » interrogatif qui n'a aucune valeur.",
          mieux: "Est-ce que c'est arrivé une fois, ou plus d'une fois ?",
          reponse: { texte: "…Oui ?", expression: "inquiet" }
        },
        {
          question: "Raconte-moi ce que tu as fait, toi, quand papa est parti.",
          type: "invitation_indicee", faits: ["calin"],
          feedback: "Invitation indicée centrée sur l'enfant : un détail émouvant et fiable émerge.",
          reponse: { texte: "J'ai fait un câlin à maman. Elle pleurait. Pompon aussi, il a fait un câlin.", expression: "triste" }
        },
        {
          question: "Qui est la première personne à qui tu as raconté ce qui s'est passé ?",
          type: "directive", qualite: 2, si: { sans_faits: ["revelation"] }, faits: ["revelation"],
          feedback: "Question sur la révélation : elle situe les premiers échanges avec les adultes, donc les influences possibles.",
          reponse: "Tatie Sonia. Elle m'a fait un chocolat chaud et j'ai tout raconté."
        },
        {
          question: "À quelle heure ça s'est passé ?",
          type: "directive", qualite: 0,
          feedback: "Heure précise demandée à un enfant de 6 ans : réponse au hasard. Il a déjà donné un repère à sa portée, « le soir du match ».",
          mieux: "Raconte-moi ce que tu faisais juste avant.",
          reponse: "Euh… neuf heures ? Ou dix ?"
        },
        {
          question: "Y a-t-il autre chose que tu voudrais me dire sur ce soir-là ?",
          type: "invitation",
          feedback: "Question ouverte de fin d'investigation, recommandée par le protocole.",
          suivant: "cloture"
        }
      ]
    },

    /* ───────────── CLÔTURE ───────────── */
    cloture: {
      phase: "cloture",
      enfant: [
        { si: { stress_min: 6 }, texte: "Non. Je veux voir maman.", expression: "inquiet" },
        { texte: "Non. C'est tout." }
      ],
      choix: [
        {
          question: "Merci Noah. Tu as fait beaucoup d'efforts pour m'expliquer. Est-ce que tu as une question, toi ?",
          type: "consigne", qualite: 2,
          feedback: "Remerciement pour l'effort, et place aux questions de l'enfant : clôture conforme.",
          suivant: "cloture_question"
        },
        {
          question: "Merci Noah. Grâce à toi, on va pouvoir protéger ta maman.",
          type: "inadaptee", qualite: -1, effets: { stress: 1 },
          feedback: "Vous faites porter à Noah la responsabilité de la suite (« grâce à toi »). Quand un parent est mis en cause, c'est une charge énorme pour lui.",
          mieux: "Merci Noah. Tu as fait beaucoup d'efforts pour m'expliquer.",
          reponse: { texte: "…", expression: "inquiet" },
          suivant: "cloture_neutre"
        },
        {
          question: "C'est fini, tu peux retourner voir maman.",
          type: "consigne", qualite: 1,
          feedback: "Correct, mais sans place pour ses questions ni sujet neutre pour terminer.",
          suivant: "fin"
        }
      ]
    },

    cloture_question: {
      phase: "cloture",
      enfant: "Papa, il va aller en prison ?",
      expression: "inquiet",
      choix: [
        {
          question: "C'est une question importante. Je ne sais pas encore. Ce sont des adultes qui vont s'en occuper, et ce n'est pas à toi de t'en inquiéter.",
          type: "consigne", qualite: 2,
          feedback: "Honnête, sans promesse, et vous déchargez l'enfant de la responsabilité de la suite.",
          reponse: "D'accord.",
          suivant: "cloture_neutre"
        },
        {
          question: "Mais non, ne t'inquiète pas, il ne va rien lui arriver.",
          type: "inadaptee", qualite: -1, effets: { stress: -1 },
          feedback: "Promesse que vous ne maîtrisez pas. Si elle n'est pas tenue, Noah se sentira trahi, voire responsable.",
          mieux: "Je ne sais pas encore. Ce sont des adultes qui vont s'en occuper.",
          reponse: "D'accord.",
          suivant: "cloture_neutre"
        },
        {
          question: "Ça dépendra de tout ce que tu m'as raconté.",
          type: "inadaptee", qualite: -2, effets: { stress: 3, confiance: -2 },
          feedback: "Faute grave : vous faites dépendre le sort du père de la parole de l'enfant. Culpabilité, rétractation possible.",
          mieux: "Ce sont des adultes qui vont s'en occuper, et ce n'est pas à toi de t'en inquiéter.",
          reponse: { texte: "…", expression: "ferme", didascalie: "Noah se met à pleurer doucement." },
          suivant: "cloture_neutre"
        }
      ]
    },

    cloture_neutre: {
      phase: "cloture",
      enfant: "D'accord.",
      choix: [
        {
          question: "Qu'est-ce que tu vas faire avec Pompon en rentrant ?",
          type: "consigne", qualite: 2, effets: { stress: -2, confiance: 1 },
          feedback: "Sujet neutre et familier pour terminer : Noah quitte la salle apaisé.",
          suivant: "fin"
        },
        {
          question: "Au revoir, Noah.",
          type: "consigne", qualite: 1,
          feedback: "Correct, mais un sujet neutre aurait permis de terminer sur une note plus légère.",
          suivant: "fin"
        }
      ]
    },

    fin: {
      phase: "cloture",
      enfant: [
        { si: { stress_max: 5 }, texte: "On va jouer aux dinosaures ! Pompon, c'est le T-rex.", expression: "detendu" },
        { texte: "…D'accord." }
      ],
      fin: true
    }
  }
};

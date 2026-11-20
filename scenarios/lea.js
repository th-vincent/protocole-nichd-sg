/*
 * Scénario « Léa, 8 ans » — exemple FICTIF pour le prototype.
 * Chaque nœud = une réplique de l'enfant + les questions proposées à l'enquêteur.
 *
 * Champs d'un nœud :
 *   phase   : clé de phase (voir PHASES dans moteur.js)
 *   enfant  : texte, OU liste de variantes [{ si: {...}, texte, expression? }] (la 1re qui matche gagne)
 *   didascalie : (optionnel) description non verbale, en italique
 *   choix   : liste de questions possibles
 *   fin     : true pour terminer l'entretien
 *
 * Champs d'un choix :
 *   question : ce que dit l'enquêteur
 *   type     : invitation | invitation_indicee | directive | choix | suggestive | consigne | inadaptee
 *   effets   : { confiance: +n, stress: +n }   (échelle 0–10)
 *   faits    : liste d'ids de faits recueillis (voir `faits` plus bas)
 *   feedback : explication pédagogique montrée en mode entraînement et au débrief
 *   suivant  : id du nœud suivant, OU liste [{ si: {...}, vers: "id" }, { vers: "id" }]
 *
 * Conditions `si` : confiance_min, confiance_max, stress_min, stress_max, contamination_min
 */
window.SCENARIOS = window.SCENARIOS || {};
window.SCENARIOS.lea = {
  titre: "Léa, 8 ans",
  prenom: "Léa",
  contexte:
    "Léa a confié à son enseignante qu'un adulte du centre de loisirs lui avait fait mal au bras. " +
    "Vous la recevez en salle d'audition adaptée. Menez l'entretien en suivant le protocole NICHD.",
  depart: "intro",
  etatInitial: { confiance: 3, stress: 4, contamination: 0 },

  // Vérité terrain : ce que l'enfant a réellement vécu. fiable=false => détail introduit par l'enquêteur.
  faits: {
    lieu_date:   { texte: "Les faits ont eu lieu mercredi, au centre de loisirs", fiable: true },
    auteur:      { texte: "Kévin lui a attrapé le bras et l'a serré fort", fiable: true },
    identite:    { texte: "Kévin est animateur au centre, il porte des lunettes", fiable: true },
    contexte:    { texte: "C'était au moment de ranger les jeux ; Léa voulait finir son dessin", fiable: true },
    insistance:  { texte: "Léa a dit qu'il lui faisait mal, il n'a pas lâché", fiable: true },
    temoin:      { texte: "Inès (une camarade) a vu la scène et l'a consolée", fiable: true },
    marque:      { texte: "Une marque violette sur l'avant-bras gauche", fiable: true },
    photo:       { texte: "Sa mère a pris la marque en photo", fiable: true },
    frequence:   { texte: "C'est arrivé une seule fois", fiable: true },
    c_monsieur:  { texte: "« Le monsieur du centre » (formulation introduite par l'enquêteur)", fiable: false },
    c_frappe:    { texte: "Kévin l'aurait frappée (suggéré par l'enquêteur, non vécu)", fiable: false },
    c_mechant:   { texte: "Kévin serait « méchant » (jugement suggéré par l'enquêteur)", fiable: false }
  },

  noeuds: {
    /* ───────────── INTRODUCTION ───────────── */
    intro: {
      phase: "introduction",
      didascalie: "Léa s'assoit au bord du canapé. Elle regarde la caméra, puis vous.",
      enfant: "…",
      choix: [
        {
          question: "Bonjour Léa. Je m'appelle Camille, je suis gendarme. Mon travail, c'est d'écouter ce que les enfants ont à raconter. Tu vois la caméra : elle enregistre pour que je n'oublie rien de ce que tu dis.",
          type: "consigne", effets: { confiance: 2, stress: -1 },
          feedback: "Bonne introduction : vous vous présentez, expliquez votre rôle et l'enregistrement, sans évoquer les faits.",
          suivant: "regles"
        },
        {
          question: "Bonjour Léa. Tu sais pourquoi tu es là, hein ? On va parler du monsieur du centre.",
          type: "suggestive", effets: { stress: 2 }, faits: ["c_monsieur"],
          feedback: "Vous annoncez le sujet et introduisez « le monsieur » avant que l'enfant n'en parle. L'introduction ne doit contenir aucune information sur les faits.",
          suivant: "regles"
        },
        {
          question: "Salut ! N'aie pas peur, tout va bien se passer, d'accord ?",
          type: "inadaptee", effets: { confiance: 0 },
          feedback: "Intention bienveillante, mais l'enquêteur ne doit pas faire de promesses. Présentez-vous et expliquez le cadre (rôle, caméra).",
          suivant: "regles"
        }
      ]
    },

    /* ───────────── RÈGLES DE BASE ───────────── */
    regles: {
      phase: "regles",
      enfant: [
        { si: { stress_min: 6 }, texte: "…D'accord.", expression: "inquiet" },
        { texte: "D'accord." }
      ],
      choix: [
        {
          question: "Avant de commencer, quelques règles. Si je te pose une question et que tu ne connais pas la réponse, tu peux dire « je ne sais pas ». Par exemple, si je te demande : comment s'appelle mon chien ?",
          type: "consigne", effets: { confiance: 1 },
          feedback: "Règle « je ne sais pas » posée et testée avec un exemple concret : c'est exactement ce que recommande le protocole.",
          suivant: "regles_test"
        },
        {
          question: "Tu dois bien répondre à toutes mes questions, d'accord ?",
          type: "inadaptee", effets: { stress: 2 },
          feedback: "Mettre l'enfant sous pression pousse à répondre même sans savoir (risque d'invention). Au contraire, autorisez « je ne sais pas ».",
          suivant: "rapport"
        },
        {
          question: "Bon, on commence.",
          type: "consigne", effets: {},
          feedback: "Règles de base omises : l'enfant ne sait pas qu'il peut dire « je ne sais pas », « je ne comprends pas » ou vous corriger.",
          suivant: "rapport"
        }
      ]
    },

    regles_test: {
      phase: "regles",
      didascalie: "Léa sourit.",
      enfant: "Je sais pas… Tu me l'as pas dit !",
      choix: [
        {
          question: "C'est ça, bravo. Et si je me trompe, tu me corriges. Si je dis que tu as 20 ans, tu dirais quoi ?",
          type: "consigne", effets: { confiance: 1 },
          feedback: "Règle de correction testée. L'enfant comprend qu'il peut contredire l'adulte.",
          suivant: "regles_fin"
        },
        {
          question: "Très bien. On passe à la suite.",
          type: "consigne", effets: {},
          feedback: "Correct, mais la règle « tu peux me corriger » n'a pas été posée.",
          suivant: "rapport"
        }
      ]
    },

    regles_fin: {
      phase: "regles",
      didascalie: "Léa rit.",
      enfant: "Non ! J'ai huit ans !",
      choix: [
        {
          question: "Exactement. Et ici, c'est important de dire seulement ce qui s'est vraiment passé. D'accord ?",
          type: "consigne", effets: { confiance: 1 },
          feedback: "Règle de vérité posée simplement, sans pression.",
          suivant: "rapport"
        }
      ]
    },

    /* ───────────── RAPPORT ───────────── */
    rapport: {
      phase: "rapport",
      enfant: [
        { si: { stress_min: 6 }, texte: "…", expression: "inquiet" },
        { texte: "…" }
      ],
      didascalie: "Léa attend, les mains sur les genoux.",
      choix: [
        {
          question: "J'aimerais mieux te connaître. Parle-moi des choses que tu aimes faire.",
          type: "invitation", effets: { confiance: 2, stress: -1 },
          feedback: "Invitation ouverte en phase de rapport : l'enfant s'habitue à faire des réponses longues.",
          suivant: "rapport_2"
        },
        {
          question: "Tu aimes l'école ?",
          type: "choix", effets: {},
          feedback: "Question fermée (oui/non) : elle produit une réponse courte et habitue l'enfant à répondre brièvement.",
          suivant: "rapport_ferme"
        },
        {
          question: "On ne va pas perdre de temps : parle-moi du centre de loisirs.",
          type: "directive", effets: { stress: 2 },
          feedback: "Le rapport est sauté. Sans mise en confiance, l'enfant risque de se fermer au moment du récit.",
          suivant: "transition"
        }
      ]
    },

    rapport_ferme: {
      phase: "rapport",
      enfant: "Oui.",
      didascalie: "Silence.",
      choix: [
        {
          question: "Parle-moi de ce que tu fais à l'école.",
          type: "invitation", effets: { confiance: 1 },
          feedback: "Bon rattrapage : vous repassez à une invitation ouverte.",
          suivant: "rapport_2"
        },
        {
          question: "Et tu as des copains ?",
          type: "choix", effets: {},
          feedback: "Encore une question fermée : l'enfant reste dans des réponses minimales.",
          suivant: "memoire"
        }
      ]
    },

    rapport_2: {
      phase: "rapport",
      enfant: "J'aime bien dessiner. Et faire du vélo avec mon frère. Des fois on fait la course jusqu'au parc.",
      expression: "detendu",
      choix: [
        {
          question: "Parle-moi plus du vélo avec ton frère.",
          type: "invitation_indicee", effets: { confiance: 1 },
          feedback: "Invitation indicée : vous reprenez les mots de l'enfant pour l'inviter à développer.",
          suivant: "memoire"
        },
        {
          question: "Ton frère, il est plus grand que toi ?",
          type: "choix", effets: {},
          feedback: "Question fermée : l'occasion de faire développer l'enfant est perdue.",
          suivant: "memoire"
        }
      ]
    },

    /* ───────────── ENTRAÎNEMENT MÉMOIRE ÉPISODIQUE ───────────── */
    memoire: {
      phase: "memoire",
      enfant: [
        { si: { confiance_min: 6 }, texte: "La dernière fois c'est moi qui ai gagné ! Il était énervé, ha ha.", expression: "detendu" },
        { texte: "Mm." }
      ],
      choix: [
        {
          question: "J'aimerais que tu me racontes une journée précise. Raconte-moi tout ce qui s'est passé à ton dernier anniversaire, du début à la fin.",
          type: "invitation", effets: { confiance: 1 },
          feedback: "Entraînement à la mémoire épisodique : l'enfant s'exerce à raconter un événement précis en détail, avant d'aborder les faits.",
          suivant: "memoire_2"
        },
        {
          question: "Ce matin, tu as pris ton petit-déjeuner ?",
          type: "choix", effets: {},
          feedback: "L'entraînement à la mémoire épisodique est manqué : une question fermée ne fait pas travailler le récit détaillé.",
          suivant: "transition"
        }
      ]
    },

    memoire_2: {
      phase: "memoire",
      enfant: "On a mangé un gâteau au chocolat, et mamie est venue. Après on a joué dans le jardin avec mes cousins.",
      expression: "detendu",
      choix: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", effets: { confiance: 1 },
          feedback: "« Et ensuite ? » : invitation ouverte qui fait avancer le récit dans le temps.",
          suivant: "transition"
        },
        {
          question: "C'était bien ?",
          type: "choix", effets: {},
          feedback: "Question fermée : peu d'information, et l'exercice de récit s'arrête.",
          suivant: "transition"
        }
      ]
    },

    /* ───────────── TRANSITION ───────────── */
    transition: {
      phase: "transition",
      enfant: [
        { si: { confiance_min: 6 }, texte: "…", didascalie: "Léa tire sur la manche de son pull." },
        { texte: "…", expression: "inquiet", didascalie: "Léa regarde ses pieds." }
      ],
      choix: [
        {
          question: "Maintenant que je te connais un peu mieux, je voudrais parler de la raison pour laquelle tu es venue aujourd'hui. Dis-moi pourquoi tu es là.",
          type: "invitation", effets: {},
          feedback: "Transition par l'invitation la plus ouverte possible : c'est l'enfant qui introduit le sujet.",
          suivant: [ { si: { confiance_min: 5 }, vers: "recit" }, { vers: "recit_bloque" } ]
        },
        {
          question: "Ta maîtresse m'a dit qu'il s'était passé quelque chose au centre de loisirs. Parle-moi de ça.",
          type: "invitation_indicee", effets: {},
          feedback: "Acceptable, mais trop tôt : commencez par l'invitation la plus ouverte (« dis-moi pourquoi tu es là ») et n'utilisez l'information extérieure qu'en dernier recours.",
          suivant: "recit"
        },
        {
          question: "C'est le monsieur du centre qui t'a fait mal, c'est ça ?",
          type: "suggestive", effets: { stress: 3 }, faits: ["c_monsieur"],
          feedback: "Question suggestive : elle contient la réponse attendue (qui, quoi, où). Toute réponse « oui » sera fragile devant un juge.",
          suivant: "recit_suggestif"
        }
      ]
    },

    recit_bloque: {
      phase: "transition",
      enfant: "Je sais pas…",
      expression: "inquiet",
      choix: [
        {
          question: "J'ai entendu que tu avais parlé à ta maîtresse de quelque chose. Parle-moi de ça.",
          type: "invitation_indicee", effets: { confiance: 1 },
          feedback: "Bonne progression : après l'échec de l'invitation ouverte, vous donnez un indice minimal sans dire ce qui s'est passé.",
          suivant: "recit"
        },
        {
          question: "Est-ce que quelqu'un t'a fait du mal ?",
          type: "choix", effets: { stress: 1 },
          feedback: "Question fermée qui introduit l'idée de « faire du mal ». Préférez une invitation indicée neutre.",
          suivant: "recit"
        },
        {
          question: "C'est un adulte du centre, hein ?",
          type: "suggestive", effets: { stress: 2 }, faits: ["c_monsieur"],
          feedback: "Question suggestive : vous fournissez la réponse à l'enfant.",
          suivant: "recit_suggestif"
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
          type: "invitation", effets: { confiance: 1 },
          feedback: "Bon rattrapage par une invitation ouverte, mais le terme « monsieur » vient de vous et restera dans le récit.",
          suivant: "recit"
        },
        {
          question: "Il t'a frappée ?",
          type: "suggestive", effets: { stress: 2 }, faits: ["c_frappe"],
          feedback: "Deuxième question suggestive. L'enfant, stressée, acquiesce à un détail qu'elle n'a pas vécu.",
          suivant: "recit_contamine"
        }
      ]
    },

    recit_contamine: {
      phase: "recit",
      enfant: "…Oui. Je sais plus. Je veux rentrer.",
      expression: "ferme",
      choix: [
        {
          question: "Tu peux prendre ton temps. Raconte-moi avec tes mots ce qui s'est passé.",
          type: "invitation", effets: { stress: -1, confiance: 1 },
          feedback: "Invitation ouverte, ton calme : c'est la meilleure option à ce stade. Mais le « oui » précédent reste au dossier.",
          suivant: "recit"
        },
        {
          question: "Bon, on va s'arrêter là.",
          type: "consigne", effets: {},
          feedback: "Entretien interrompu sans récit libre : les seules informations recueillies viennent de vos questions.",
          suivant: "cloture"
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
      choix: [
        {
          question: "Raconte-moi tout ce qui s'est passé mercredi, depuis le début.",
          type: "invitation", effets: { confiance: 1 },
          feedback: "Invitation ouverte en récit libre : la meilleure façon d'obtenir un récit riche et fiable.",
          suivant: "recit_2"
        },
        {
          question: "Kévin, c'est qui ?",
          type: "directive", effets: {},
          feedback: "Question directive utile, mais un peu tôt : épuisez d'abord le récit libre par des invitations.",
          suivant: "recit_kevin"
        },
        {
          question: "Il t'a frappée aussi ?",
          type: "suggestive", effets: { stress: 2 }, faits: ["c_frappe"],
          feedback: "Question suggestive : elle introduit un acte (« frapper ») que l'enfant n'a pas mentionné.",
          suivant: "recit_2"
        }
      ]
    },

    recit_kevin: {
      phase: "recit",
      enfant: "C'est l'animateur. Il a des lunettes.",
      faitsAuto: ["identite"],
      choix: [
        {
          question: "D'accord. Raconte-moi tout ce qui s'est passé mercredi, depuis le début.",
          type: "invitation", effets: { confiance: 1 },
          feedback: "Retour au récit libre : bien.",
          suivant: "recit_2"
        }
      ]
    },

    recit_2: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 8 }, texte: "Il fallait ranger. Il m'a attrapée.", expression: "ferme" },
        { texte: "On jouait dans la salle. Après il fallait ranger les jeux, mais moi je voulais finir mon dessin. Kévin il a crié et il m'a attrapée par le bras pour m'emmener. Il serrait trop fort. Après j'avais une marque violette." }
      ],
      faitsAutoSi: { si: { stress_max: 7 }, faits: ["contexte", "marque"] },
      choix: [
        {
          question: "Tu as dit qu'il serrait trop fort. Parle-moi plus de ce moment.",
          type: "invitation_indicee", effets: { confiance: 1 },
          feedback: "Invitation indicée : vous reprenez les mots exacts de l'enfant pour approfondir un moment.",
          faits: ["insistance"],
          suivant: "recit_3"
        },
        {
          question: "Et ensuite ?",
          type: "invitation", effets: {},
          feedback: "« Et ensuite ? » : simple et efficace pour poursuivre le récit.",
          suivant: "recit_3"
        },
        {
          question: "Il était en colère ou il rigolait ?",
          type: "choix", effets: {},
          feedback: "Question à choix : l'enfant peut choisir une option même si aucune ne correspond. Préférez « Parle-moi de comment était Kévin ».",
          suivant: "recit_3"
        }
      ]
    },

    recit_3: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 8 }, texte: "Je sais plus.", expression: "ferme" },
        { texte: "Je lui ai dit qu'il me faisait mal, mais il a pas lâché. Après Inès elle a vu, elle m'a fait un câlin." }
      ],
      faitsAutoSi: { si: { stress_max: 7 }, faits: ["insistance", "temoin"] },
      choix: [
        {
          question: "Tu as parlé d'une marque violette. Où était-elle ?",
          type: "directive", effets: {},
          faits: ["marque"],
          feedback: "Question directive (« où ») au bon moment : après le récit libre, pour préciser un détail mentionné par l'enfant.",
          suivant: "recit_4"
        },
        {
          question: "Est-ce que c'est arrivé une fois ou plus d'une fois ?",
          type: "choix", effets: {}, faits: ["frequence"],
          feedback: "Question recommandée par le protocole pour distinguer un fait unique d'un fait répété.",
          suivant: "recit_frequence"
        },
        {
          question: "Il est méchant, Kévin, hein ?",
          type: "suggestive", effets: { stress: 2 }, faits: ["c_mechant"],
          feedback: "Question suggestive et jugement de valeur : vous orientez l'enfant et teintez son témoignage.",
          suivant: "recit_4"
        },
        {
          question: "Bon, je crois que j'ai compris.",
          type: "consigne", effets: {},
          feedback: "Clôture prématurée : des détails importants (marque, fréquence, témoins) n'ont pas été explorés.",
          suivant: "cloture"
        }
      ]
    },

    recit_frequence: {
      phase: "recit",
      enfant: "Une fois. Juste mercredi.",
      choix: [
        {
          question: "Tu as parlé d'une marque violette. Où était-elle ?",
          type: "directive", effets: {}, faits: ["marque"],
          feedback: "Question directive bien placée, sur un détail apporté par l'enfant.",
          suivant: "recit_4"
        },
        {
          question: "Y a-t-il autre chose que tu penses que je devrais savoir ?",
          type: "invitation", effets: {},
          feedback: "Question ouverte de fin de récit, recommandée par le protocole.",
          suivant: "cloture"
        }
      ]
    },

    recit_4: {
      phase: "recit",
      didascalie: "Léa montre son avant-bras gauche.",
      enfant: "Là. C'était tout violet. Maman elle a fait une photo.",
      faitsAuto: ["marque", "photo"],
      choix: [
        {
          question: "Y a-t-il autre chose que tu penses que je devrais savoir ?",
          type: "invitation", effets: {},
          feedback: "Question ouverte de fin de récit, recommandée par le protocole.",
          suivant: "cloture"
        },
        {
          question: "C'est bon, on a fini.",
          type: "consigne", effets: {},
          feedback: "Vous ne laissez pas à l'enfant l'occasion d'ajouter quelque chose.",
          suivant: "cloture"
        }
      ]
    },

    /* ───────────── CLÔTURE ───────────── */
    cloture: {
      phase: "cloture",
      enfant: [
        { si: { stress_min: 7 }, texte: "…Je peux partir ?", expression: "inquiet" },
        { texte: "Non… c'est tout." }
      ],
      choix: [
        {
          question: "Merci Léa, tu m'as beaucoup aidée. Qu'est-ce que tu vas faire cet après-midi ?",
          type: "consigne", effets: { stress: -2, confiance: 1 },
          feedback: "Clôture conforme : remerciement pour l'effort (pas pour le contenu), puis sujet neutre pour terminer sur une note apaisée.",
          suivant: "fin"
        },
        {
          question: "C'est bon, tu peux y aller.",
          type: "consigne", effets: {},
          feedback: "Clôture abrupte : pas de remerciement ni de sujet neutre pour terminer.",
          suivant: "fin"
        }
      ]
    },

    fin: {
      phase: "cloture",
      enfant: [
        { si: { stress_max: 5 }, texte: "Je vais au parc avec mon frère !", expression: "detendu" },
        { texte: "…D'accord." }
      ],
      fin: true
    }
  }
};

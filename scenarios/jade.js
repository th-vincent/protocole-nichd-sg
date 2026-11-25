/*
 * Scénario « Jade, 5 ans » : cas SIMULÉ, adapté d'une expérience réelle et publiée,
 * l'étude « Sam Stone » (Leichtman & Ceci, 1995, Developmental Psychology 31(4), 568-578).
 *   Un visiteur, Sam Stone, passe quelques minutes dans une classe de maternelle : il dit bonjour, parle de
 *   l'histoire en cours, fait le tour de la classe et repart. Il ne touche à rien. Avant la visite, on avait
 *   raconté aux enfants qu'il était maladroit (« il casse toujours tout ») ; après, on leur a montré un livre
 *   déchiré et un ours en peluche sali, et on les a interrogés de façon suggestive. Beaucoup d'enfants de
 *   3-4 ans ont fini par « se souvenir » que Sam avait abîmé ces objets, avec des détails très convaincants.
 *   Résumé en ligne : Ceci & de Bruyn (1993), « Child Witnesses in Court », repris par PBS Frontline.
 * Cas peu éprouvant (pas de violence), centré sur la difficulté propre au cas :
 *   - le stéréotype (« Sam casse tout ») et les questions répétées des adultes ont déjà façonné le discours de Jade ;
 *   - l'enquêteur doit distinguer ce que Jade a VU de ce qu'on lui a DIT, sans renforcer la fausse version ;
 *   - plus l'enquêteur suggère, plus le faux souvenir s'enrichit de détails vivants (et résiste à la vérification).
 * Format : voir l'en-tête de scenarios/lea.js.
 */
window.SCENARIOS = window.SCENARIOS || {};
window.SCENARIOS.jade = {
  titre: "Jade, 5 ans",
  prenom: "Jade",
  age: "5 ans · témoin",
  genre: "f",
  contexte: "Cas simulé, d'après l'étude « Sam Stone » (Leichtman & Ceci, 1995). Un parent accuse un visiteur d'avoir abîmé du matériel de la classe. Jade était présente pendant la visite. Audition filmée en salle Mélanie.",
  depart: "intro",
  etatInitial: { confiance: 3, stress: 3, contamination: 0 },
  dossier: {
    postits: [
      "Jade R., 5 ans, grande section",
      "Jeudi : visite de Sam Stone en classe, quelques minutes",
      "Vendredi : un livre déchiré, l'ours de la classe taché",
      "Plainte d'un parent contre le visiteur",
      "La maîtresse dit souvent : « Sam casse tout ! »",
      "Les parents ont déjà questionné Jade, plusieurs fois"
    ]
  },
  apparence: { peau: "#f5d0b0", peauOmbre: "#e2b894", cheveux: "#b5762f", pull: "#8e6bbf", pullFonce: "#7a58a8", pantalon: "#2f5d8a", chaussure: "#e8664f", coiffure: "couettes" },
  soutiens: [
    "Tu m'aides beaucoup. On a tout le temps, tu peux réfléchir tranquillement.",
    "Tu as le droit de dire « je sais pas ». C'est très bien de le dire quand on ne sait pas.",
    "Tu fais plein d'efforts. Ici, il n'y a pas de bonne ou de mauvaise réponse."
  ],

  faits: {
    visite:       { texte: "Sam Stone est venu dans la classe pendant que la maîtresse lisait l'histoire du loup", fiable: true },
    bonjour:      { texte: "Il a dit bonjour et s'est présenté (« je m'appelle Sam Stone »)", fiable: true },
    commentaire:  { texte: "Il a dit que c'était une belle histoire", fiable: true },
    apparence:    { texte: "Il portait un pull rouge et un grand chapeau", fiable: true },
    tour:         { texte: "Il a fait le tour de la classe en regardant les dessins des enfants", fiable: true },
    au_revoir:    { texte: "Il a fait au revoir de la main et il est parti", fiable: true },
    duree:        { texte: "La visite a été très courte (« pas longtemps »)", fiable: true },
    pas_touche:   { texte: "Jade ne l'a vu toucher ni le livre ni l'ours en peluche", fiable: true },
    decouverte:   { texte: "C'est le lendemain que la classe a trouvé le livre déchiré et l'ours (Pistache) taché", fiable: true },
    version:      { texte: "Jade répète d'emblée que « Sam a cassé le livre » : version entendue des adultes", fiable: true },
    stereotype:   { texte: "« Sam casse tout » vient des histoires de la maîtresse (la poupée cassée), pas de ce que Jade a vu", fiable: true },
    questions:    { texte: "Sa mère lui a demandé plusieurs fois si c'était Sam ; la maîtresse aussi", fiable: true },
    c_visite:     { texte: "La visite de Sam introduite par l'enquêteur avant Jade", fiable: false },
    c_dechire:    { texte: "Sam aurait déchiré le livre (suggéré par l'enquêteur)", fiable: false },
    c_nounours:   { texte: "Sam aurait sali l'ours avec du chocolat (suggéré par l'enquêteur)", fiable: false },
    c_vu:         { texte: "Jade aurait vu Sam abîmer les objets (renforcé par l'enquêteur)", fiable: false },
    c_expres:     { texte: "Sam l'aurait fait exprès, en colère (choix imposé par l'enquêteur)", fiable: false },
    c_opinion:    { texte: "Jade désigne Sam parce qu'on lui demande son avis, pas ce qu'elle a vu", fiable: false }
  },

  noeuds: {
    /* ───────────── INTRODUCTION ───────────── */
    intro: {
      phase: "introduction",
      didascalie: "Jade balance les jambes sur le canapé et regarde partout dans la pièce.",
      enfant: "…",
      silence: {
        qualite: 0, effets: { stress: 1 },
        reponse: { texte: "C'est quoi, là-haut ?", didascalie: "Jade montre la caméra du doigt." },
        feedback: "À 5 ans, l'enfant attend que l'adulte se présente. Ici, Jade comble le silence elle-même."
      },
      choix: [
        {
          question: "Bonjour Jade. Moi, c'est Camille. Je suis gendarme, et mon travail, c'est d'écouter les enfants. Tu vois la caméra, là-haut ? Elle filme, comme ça je n'oublie rien de ce que tu me dis.",
          type: "consigne", qualite: 2, effets: { confiance: 2, stress: -1 }, si: { sans_marques: ["accueil"] }, marque: ["presente", "camera"],
          feedback: "Introduction conforme et adaptée à l'âge : phrases courtes, rôle, caméra.",
          suivant: "regles"
        },
        {
          question: "Bonjour Jade. Je suis gendarme. On va parler du monsieur qui a cassé des choses dans ta classe.",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_visite", "c_dechire"], si: { sans_marques: ["accueil"] }, marque: "presente",
          feedback: "Dès la première phrase, vous affirmez que quelqu'un a « cassé des choses ». C'est exactement la croyance qu'il faudra vérifier, et vous venez de la confirmer.",
          mieux: "Bonjour Jade. Moi, c'est Camille. Je suis gendarme, et mon travail, c'est d'écouter les enfants.",
          reponse: { texte: "Sam Stone ! Il casse tout !", expression: "detendu" },
          suivant: "regles"
        },
        {
          question: "Coucou ma puce ! Tu es bien sage, dis donc.",
          type: "consigne", qualite: 1, effets: { confiance: 1 }, si: { sans_marques: ["accueil"] }, marque: "accueil",
          feedback: "Accueil chaleureux, adapté à son âge. Il reste à dire qui vous êtes et à expliquer la caméra : c'est le moment de le faire.",
          reponse: { texte: "Oui !", expression: "detendu", didascalie: "Jade sourit et balance les jambes de plus belle." }
        },
        // après un simple accueil, l'introduction se complète à l'intervention suivante
        {
          question: "Moi, c'est Camille. Je suis gendarme, et mon travail, c'est d'écouter les enfants. Tu vois la caméra, là-haut ? Elle filme, comme ça je n'oublie rien de ce que tu me dis.",
          type: "consigne", qualite: 2, effets: { confiance: 1, stress: -1 }, si: { marques: ["accueil"] }, marque: ["presente", "camera"],
          feedback: "Introduction complétée en deux temps : l'accueil d'abord, puis votre rôle et la caméra. C'est tout à fait correct.",
          suivant: "regles"
        },
        {
          question: "Bon, on va commencer. Je vais te poser des questions.",
          type: "consigne", qualite: 0, si: { marques: ["accueil"] },
          feedback: "Jade ne sait toujours pas qui vous êtes ni à quoi sert la caméra. Vous pouvez encore le dire tout de suite, au début des règles.",
          mieux: "Moi, c'est Camille. Je suis gendarme, et mon travail, c'est d'écouter les enfants. Tu vois la caméra, là-haut ?",
          suivant: "regles"
        }
      ]
    },

    /* ───────────── RÈGLES DE BASE ───────────── */
    regles: {
      phase: "regles",
      enfant: "D'accord !",
      choix: [
        // rattrapage de l'introduction à l'intervention suivante
        {
          question: "J'ai oublié de me présenter : je m'appelle Camille, je suis gendarme, et mon travail, c'est d'écouter les enfants. Et tu vois la caméra, là-haut ? Elle filme, comme ça je n'oublie rien de ce que tu me dis.",
          type: "consigne", qualite: 2, effets: { confiance: 1 }, si: { sans_marques: ["presente", "camera"] }, marque: ["presente", "camera"],
          feedback: "Bon rattrapage, juste à temps : Jade sait maintenant qui vous êtes et pourquoi on filme.",
          reponse: "D'accord."
        },
        {
          question: "Au fait, tu vois la caméra, là-haut ? Elle filme ce qu'on dit, comme ça je n'ai pas besoin de tout écrire.",
          type: "consigne", qualite: 2, si: { marques: ["presente"], sans_marques: ["camera"] }, marque: "camera",
          feedback: "Caméra expliquée à l'intervention suivante : l'introduction est complète.",
          reponse: "D'accord."
        },
        {
          question: "Je vais te poser des questions. Si tu ne sais pas la réponse, tu dis « je sais pas ». On essaie ? Comment il s'appelle, mon chien ?",
          type: "consigne", qualite: 2, effets: { confiance: 1 }, marque: "jesaispas",
          feedback: "Règle posée et testée tout de suite : à 5 ans, c'est la seule façon qu'elle soit comprise.",
          suivant: "regles_test"
        },
        {
          question: "Si je dis que je suis une girafe, c'est vrai ou c'est pas vrai ?",
          type: "choix", qualite: 2, effets: { confiance: 1, stress: -1 }, marque: "verite",
          feedback: "Test concret du vrai et du faux : parfait à cet âge.",
          reponse: { texte: "C'est pas vrai ! T'es pas une girafe !", expression: "detendu", didascalie: "Jade éclate de rire." }
        },
        {
          question: "Tu dois répondre à toutes mes questions, d'accord ? C'est très important.",
          type: "inadaptee", qualite: -1, effets: { stress: 2 },
          feedback: "Chez un enfant de 5 ans, cette pression produit des réponses devinées. Dans ce dossier, c'est précisément le danger : Jade dira ce qu'elle pense que vous attendez.",
          mieux: "Si tu ne sais pas la réponse, tu dis « je sais pas ».",
          reponse: { texte: "…D'accord.", expression: "inquiet" },
          suivant: "rapport_debut"
        }
      ]
    },

    regles_test: {
      phase: "regles",
      enfant: "Je sais pas !",
      expression: "detendu",
      didascalie: "Jade est très fière d'elle.",
      choix: [
        {
          question: "C'est ça ! Et si je me trompe, tu me dis « tu t'es trompée ». Si je dis que tu as dix ans ?",
          type: "consigne", qualite: 2, effets: { confiance: 1 }, marque: "corrige",
          feedback: "Règle de correction testée : Jade apprend qu'elle a le droit de dire non à un adulte. Ce sera décisif face aux questions suggestives.",
          reponse: { texte: "T'es trompée ! J'ai cinq ans !", expression: "detendu", didascalie: "Jade montre cinq doigts." }
        },
        {
          question: "Est-ce que tu promets de me dire seulement des choses qui sont vraiment arrivées ?",
          type: "consigne", qualite: 2, marque: "promesse",
          feedback: "Promesse simple, adaptée à l'âge.",
          reponse: "Oui, promis."
        },
        {
          question: "Et si tu ne sais pas si tu l'as vu toi-même ou si quelqu'un te l'a raconté, tu me le dis aussi.",
          type: "consigne", qualite: 1, marque: "source",
          feedback: "Bonne intention dans ce dossier, mais trop abstrait pour 5 ans : la question de la source se pose mieux plus tard, à propos d'un fait précis.",
          reponse: { texte: "…D'accord.", didascalie: "Jade n'a pas l'air d'avoir bien compris." }
        },
        {
          question: "Bravo. Maintenant, on va faire connaissance.",
          type: "consigne", qualite: 1,
          feedback: "Il manque la règle de correction ou la promesse.",
          selon: [{ si: { sans_marques: ["camera"] }, qualite: 0, feedback: "Les règles sont posées, mais la caméra n'a jamais été expliquée : un enfant qui ignore pourquoi on le filme reste sur ses gardes. Il est encore temps de le faire." }, { si: { marques: ["corrige", "promesse"] }, qualite: 2, feedback: "Règles posées et testées : vous pouvez passer au rapport." }],
          reponse: "D'accord !",
          suivant: "rapport_debut"
        }
      ]
    },

    /* ───────────── RAPPORT ───────────── */
    rapport_debut: {
      phase: "rapport",
      enfant: "D'accord.",
      choix: [
        // rattrapages possibles si l'introduction ou les règles ont été écourtées
        {
          question: "Avant de continuer, j'ai oublié de te dire : si tu ne connais pas la réponse à une question, tu dis « je sais pas ». On essaie ? Comment s'appelle mon chien ?",
          type: "consigne", qualite: 1, si: { sans_marques: ["jesaispas"] }, marque: "jesaispas",
          feedback: "Bon réflexe de rattraper la règle « je sais pas ». Elle aurait dû venir avec les règles, mais mieux vaut tard que jamais.",
          reponse: { texte: "Je sais pas !", expression: "detendu" }
        },
        {
          question: "Et si je dis quelque chose de faux, tu me corriges. Si je dis que tu as deux ans ?",
          type: "consigne", qualite: 1, si: { marques: ["jesaispas"], sans_marques: ["corrige"] }, marque: "corrige",
          feedback: "Règle de correction rattrapée et testée : utile avant d'aborder les faits.",
          reponse: { texte: "Non ! J'ai cinq ans !", expression: "detendu" }
        },
        {
          question: "Au fait, tu vois la caméra, là-haut ? Elle filme ce qu'on dit, comme ça je n'ai pas besoin de tout écrire.",
          type: "consigne", qualite: 1, si: { sans_marques: ["camera"] }, marque: "camera",
          feedback: "Caméra enfin expliquée : correct, même si c'était le rôle de l'introduction.",
          reponse: "D'accord."
        },
        {
          question: "J'aimerais bien te connaître. Raconte-moi les choses que tu aimes faire.",
          type: "invitation", effets: { confiance: 2, stress: -1 },
          feedback: "Invitation ouverte : Jade s'entraîne à parler longuement, avec ses mots.",
          suivant: "rapport"
        },
        {
          question: "Tu aimes bien l'école ?",
          type: "choix", qualite: 0,
          feedback: "Question fermée : un « oui » et rien de plus. Et vous orientez déjà vers l'école, le lieu des faits.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          reponse: "Oui.",
          suivant: "rapport"
        },
        {
          question: "Et dans ta classe, il se passe des choses bizarres en ce moment ?",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_visite"],
          feedback: "En plein rapport, vous ciblez le contexte des faits. Jade récite la version des adultes avant même la transition.",
          mieux: "Raconte-moi les choses que tu aimes faire.",
          reponse: { texte: "Oui ! Sam Stone il a cassé le livre !", expression: "detendu" },
          suivant: "rapport"
        }
      ]
    },

    rapport: {
      phase: "rapport",
      enfant: [
        { si: { confiance_min: 4 }, texte: "J'aime la trottinette ! Et j'ai un hamster, il s'appelle Caramel. Il dort tout le temps.", expression: "detendu" },
        { texte: "La trottinette." }
      ],
      silence: {
        qualite: 2, effets: { confiance: 1 },
        reponse: { texte: "…Et Caramel il mange des graines de tournesol. Il les met dans ses joues !", expression: "detendu", didascalie: "Jade gonfle ses joues." },
        feedback: "Silence attentif : Jade complète toute seule."
      },
      choix: [
        {
          question: "Tu as parlé de Caramel. Raconte-moi tout sur Caramel.",
          type: "invitation_indicee", effets: { confiance: 1 }, marque: "rapport_ok",
          feedback: "Invitation indicée sur le sujet qu'elle a choisi : elle parle davantage, et s'habitue à cette forme de question.",
          reponse: { texte: "Il est tout orange. Il a une roue, il court la nuit, ça fait du bruit. Papa il dit que c'est un sportif.", expression: "detendu" }
        },
        {
          question: "Caramel, c'est un hamster ou un cochon d'Inde ?",
          type: "choix", qualite: 0,
          feedback: "Choix imposé sur une information qu'elle venait de donner : inutile, et ça l'habitue à choisir entre vos options.",
          reponse: "Un hamster ! Je l'ai dit !"
        },
        {
          question: "Maintenant, raconte-moi une journée en entier : la sortie à la ferme avec l'école, du début à la fin.",
          type: "invitation",
          feedback: "Passage à l'entraînement de la mémoire épisodique, sur un événement neutre.",
          selon: [{ si: { sans_marques: ["rapport_ok"] }, qualite: 1, feedback: "Bonne consigne, mais le rapport a été court." }],
          suivant: "memoire"
        }
      ]
    },

    /* ───────────── ENTRAÎNEMENT MÉMOIRE ÉPISODIQUE ───────────── */
    memoire: {
      phase: "memoire",
      enfant: "On a pris le car. Et y avait des chèvres ! Une chèvre elle a mangé le bonnet de Mathis.",
      expression: "detendu",
      choix: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", effets: { confiance: 1 }, marque: "mem_ok",
          feedback: "« Et ensuite ? » : Jade s'entraîne à dérouler un récit dans l'ordre.",
          reponse: { texte: "Après on a donné du pain aux lapins, et on a pique-niqué dans l'herbe. Et dans le car j'ai dormi.", expression: "detendu" }
        },
        {
          question: "Tu as parlé de la chèvre qui a mangé le bonnet. Raconte-moi tout sur ce moment-là.",
          type: "invitation_indicee", effets: { confiance: 1 }, marque: "mem_ok",
          feedback: "Invitation indicée : exactement l'outil qui servira sur les faits.",
          reponse: { texte: "Mathis il pleurait, et la dame de la ferme elle a tiré, et le bonnet il était tout mouillé ! Beurk !", expression: "detendu" }
        },
        {
          question: "La chèvre, elle était méchante ?",
          type: "suggestive", qualite: -1,
          feedback: "Petit test révélateur : vous proposez un jugement, et Jade l'adopte aussitôt. C'est le mécanisme qui a construit « Sam casse tout ».",
          mieux: "Tu as parlé de la chèvre. Raconte-moi tout sur ce moment-là.",
          reponse: "Oui ! Très méchante !"
        },
        {
          question: "Merci, tu racontes très bien, avec plein de détails. C'est comme ça que j'ai besoin que tu me racontes les choses : seulement ce que tu as vu, toi.",
          type: "soutien", qualite: 2, effets: { confiance: 1 }, marque: "consigne_vu",
          feedback: "Vous valorisez la manière, et vous précisez « ce que tu as vu, toi » : une consigne précieuse dans ce dossier.",
          selon: [{ si: { sans_marques: ["mem_ok"] }, qualite: 1, feedback: "Bon message, mais l'entraînement a été très court : une relance (« Et ensuite ? ») l'aurait rendu plus utile." }],
          suivant: "transition"
        }
      ]
    },

    /* ───────────── TRANSITION ───────────── */
    transition: {
      phase: "transition",
      enfant: "D'accord.",
      choix: [
        {
          question: "Maintenant, je voudrais savoir pourquoi tu es venue me voir aujourd'hui. Dis-moi pourquoi tu es là.",
          type: "invitation",
          feedback: "Invitation la plus ouverte possible. Ce qui sort en premier vous apprend surtout ce qu'on a déjà dit à Jade.",
          suivant: [{ si: { confiance_min: 4 }, vers: "version" }, { vers: "transition_bloque" }]
        },
        {
          question: "Ta maman m'a dit que Sam Stone avait déchiré un livre dans ta classe. Raconte-moi.",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_visite", "c_dechire"],
          feedback: "Forme ouverte, mais vous apportez l'auteur et l'acte, avec l'autorité de sa mère. Jade va « raconter » ce que vous venez de dire.",
          mieux: "Dis-moi pourquoi tu es là.",
          suivant: "recit_suggestif"
        },
        {
          question: "Est-ce que tu sais pourquoi tu es là ?",
          type: "choix", qualite: 0,
          feedback: "Réponse « oui » attendue, et rien de plus. Transformez-la en invitation.",
          reponse: "Oui."
        }
      ]
    },

    transition_bloque: {
      phase: "transition",
      enfant: "Je sais pas.",
      expression: "inquiet",
      didascalie: "Jade tortille une de ses couettes.",
      choix: [
        {
          question: "J'ai entendu dire qu'un monsieur était venu dans ta classe. Raconte-moi tout sur ce monsieur.",
          type: "invitation_indicee", qualite: 2, effets: { confiance: 1 },
          feedback: "Vous évoquez la visite sans rien dire de ce qu'on reproche au visiteur : le bon palier du protocole.",
          suivant: "recit"
        },
        {
          question: "Ce n'est pas grave. Tu m'aides beaucoup en étant là.",
          type: "soutien", qualite: 2, effets: { stress: -1, confiance: 2 },
          feedback: "Soutien sans parler des faits : la confiance remonte.",
          reponse: { texte: "…", didascalie: "Jade lâche sa couette." },
          suivant: "transition"
        },
        {
          question: "C'est pour le livre que Sam a déchiré, hein ?",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_visite", "c_dechire"],
          feedback: "Vous donnez l'auteur, l'acte, et vous demandez une confirmation (« hein ? »). Jade confirme, et ajoute des détails.",
          mieux: "J'ai entendu dire qu'un monsieur était venu dans ta classe. Raconte-moi tout sur ce monsieur.",
          suivant: "recit_suggestif"
        }
      ]
    },

    // Jade répète la version des adultes : le cœur du cas
    version: {
      phase: "transition",
      enfant: "C'est pour Sam Stone. Il a cassé le livre du loup, et il a sali Pistache. Il casse tout, Sam.",
      didascalie: "Jade récite, très vite, comme une leçon.",
      faitsAuto: ["version"],
      choix: [
        {
          question: "Tu as dit que Sam a cassé le livre. Ça, tu l'as vu avec tes yeux, ou quelqu'un te l'a raconté ?",
          type: "choix", qualite: 2, marque: "source_ok", faits: ["questions"],
          feedback: "Question de source, posée sur un fait précis et avec ses mots : le réflexe clé de ce dossier. Jade distingue encore ce qu'on lui a dit de ce qu'elle a vu.",
          reponse: { texte: "C'est maman qui a dit. Elle m'a demandé plein de fois si c'est Sam. Et la maîtresse aussi.", expression: "neutre" }
        },
        {
          question: "Tu as parlé de Sam Stone. Raconte-moi tout sur le jour où Sam est venu dans ta classe, depuis le début.",
          type: "invitation_indicee", qualite: 2, effets: { confiance: 1 },
          feedback: "Excellent : vous reprenez son mot (« Sam ») mais vous l'orientez vers le moment qu'elle a vécu, pas vers l'accusation.",
          suivant: "recit"
        },
        {
          question: "Il l'a déchiré comment, le livre ?",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_dechire", "c_vu"],
          feedback: "La question présuppose que Jade a vu la scène. Elle va en produire une, très vivante… et inventée.",
          mieux: "Ça, tu l'as vu avec tes yeux, ou quelqu'un te l'a raconté ?",
          suivant: "recit_suggestif"
        },
        {
          question: "Il a fait exprès, ou c'était un accident ?",
          type: "choix", qualite: -2, effets: { stress: 1 }, faits: ["c_dechire", "c_expres"],
          feedback: "C'est la question exacte de l'étude Sam Stone : les deux options supposent qu'il l'a fait. Jade choisit, et le faux souvenir se complète.",
          mieux: "Raconte-moi tout sur le jour où Sam est venu dans ta classe.",
          reponse: { texte: "Exprès ! Il était fâché.", expression: "ferme" },
          suivant: "recit_suggestif"
        }
      ]
    },

    /* ───────────── RÉCIT LIBRE ───────────── */
    recit: {
      phase: "recit",
      enfant: [
        { si: { stress_min: 7 }, texte: "Il est venu. Il a dit bonjour.", expression: "inquiet" },
        { texte: "Sam il est venu quand la maîtresse lisait l'histoire du loup. Il a dit bonjour, il a dit « je m'appelle Sam Stone ». Et il a dit que c'était une belle histoire." }
      ],
      faitsAuto: ["visite", "bonjour"],
      faitsAutoSi: { si: { stress_max: 6 }, faits: ["commentaire"] },
      silence: {
        qualite: 2,
        reponse: { texte: "…Il avait un pull rouge. Et un grand chapeau, comme un cow-boy.", didascalie: "Jade dessine un chapeau en l'air." },
        feedback: "Pause attentive : un détail spontané, donc fiable.",
        faits: ["apparence"]
      },
      choix: [
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation", effets: { confiance: 1 },
          feedback: "« Et ensuite ? » : le récit avance sans rien suggérer.",
          suivant: "recit_2"
        },
        {
          question: "Tu as dit qu'il a dit bonjour. Raconte-moi tout ce qu'il a fait après.",
          type: "invitation_indicee",
          feedback: "Invitation indicée reprenant ses mots.",
          suivant: "recit_2"
        },
        {
          question: "Et c'est là qu'il a pris le livre ?",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_dechire"],
          feedback: "Jade racontait un souvenir neutre et précis. Vous y insérez l'accusation : elle hésite, puis accepte.",
          mieux: "Et ensuite, qu'est-ce qui s'est passé ?",
          reponse: [
            { si: { marques: ["corrige"], contamination_max: 1 }, texte: "Non… il a pas pris le livre. C'est la maîtresse qui l'avait.", expression: "neutre" },
            { texte: "…Oui ?", expression: "inquiet", didascalie: "Jade vous regarde pour savoir si c'est la bonne réponse." }
          ]
        },
        {
          question: "Il était comment, Sam ?",
          type: "directive", qualite: 1, si: { sans_faits: ["apparence"] }, faits: ["apparence"],
          feedback: "Question de précision correcte, mais un peu tôt : le récit libre n'est pas épuisé.",
          reponse: "Il avait un pull rouge. Et un grand chapeau."
        }
      ]
    },

    recit_2: {
      phase: "recit",
      enfant: "Après, il a fait le tour de la classe. Il a regardé nos dessins, il a dit que le mien il était joli. Et après il a fait au revoir avec la main, et il est parti. C'était pas longtemps.",
      faitsAuto: ["tour", "au_revoir"],
      faitsAutoSi: { si: { stress_max: 6 }, faits: ["duree"] },
      choix: [
        // même question, deux versions : la réponse (et donc le fait recueilli) dépend des suggestions déjà faites
        {
          question: "Raconte-moi tout ce que tu as vu, toi, avec tes yeux, pendant que Sam était dans ta classe.",
          type: "invitation", qualite: 2, si: { contamination_max: 1 }, faits: ["pas_touche"],
          feedback: "Invitation ouverte centrée sur ce qu'elle a vu : si Sam avait abîmé quelque chose, c'est maintenant qu'elle le dirait. Elle ne l'a pas vu.",
          reponse: { texte: "Il a regardé les dessins. Il a rien cassé. Moi j'ai pas vu qu'il cassait.", expression: "neutre" }
        },
        {
          question: "Raconte-moi tout ce que tu as vu, toi, avec tes yeux, pendant que Sam était dans ta classe.",
          type: "invitation", qualite: 2, si: { contamination_min: 2 },
          feedback: "La bonne question… mais trop tard : après vos suggestions, Jade intègre l'accusation à son souvenir. Exactement ce qu'a montré l'étude Sam Stone.",
          reponse: { texte: "Il a… il a cassé le livre. Je crois.", expression: "inquiet", didascalie: "Jade hésite, puis regarde vers la porte." }
        },
        {
          question: "Pendant que Sam était là, est-ce qu'il a fait quelque chose au livre ou à Pistache ?",
          type: "choix", qualite: 1, si: { contamination_max: 1 }, faits: ["pas_touche"],
          feedback: "Question fermée de vérification, légitime une fois le récit libre épuisé, et la réponse est nette. L'invitation « raconte-moi ce que tu as vu » aurait toutefois été plus solide.",
          mieux: "Raconte-moi tout ce que tu as vu, toi, pendant que Sam était dans ta classe.",
          reponse: { texte: "Non. Il a pas touché. C'est le lendemain qu'il était cassé.", expression: "neutre" }
        },
        {
          question: "Pendant que Sam était là, est-ce qu'il a fait quelque chose au livre ou à Pistache ?",
          type: "choix", qualite: 0, si: { contamination_min: 2 },
          feedback: "Question fermée posée après plusieurs suggestions : Jade répond « oui », mais ce oui ne vaut rien, puisqu'il reprend ce que vous lui avez suggéré.",
          mieux: "Raconte-moi tout ce que tu as vu, toi, pendant que Sam était dans ta classe.",
          reponse: { texte: "Oui… il l'a déchiré.", expression: "inquiet" }
        },
        {
          question: "Il a sali Pistache avec du chocolat, c'est ça ?",
          type: "suggestive", qualite: -2, effets: { stress: 1 }, faits: ["c_nounours"],
          feedback: "La suggestion de l'étude d'origine, mot pour mot ou presque. Le détail du chocolat vient de vous ; s'il réapparaît dans la bouche de Jade, il n'aura aucune valeur.",
          mieux: "Raconte-moi tout ce que tu as vu, toi, pendant que Sam était dans ta classe.",
          reponse: [
            { si: { marques: ["corrige"], contamination_max: 0 }, texte: "Non ! T'es trompée. Il a pas touché Pistache.", expression: "ferme", didascalie: "Jade applique la règle que vous lui avez apprise." },
            { texte: "…Oui. Du chocolat.", expression: "inquiet" }
          ]
        },
        {
          question: "Et ensuite, qu'est-ce qui s'est passé ?",
          type: "invitation",
          feedback: "Le récit avance vers la découverte des objets abîmés.",
          suivant: "recit_3"
        }
      ]
    },

    recit_3: {
      phase: "recit",
      enfant: "Le lendemain, le livre du loup il était déchiré. Et Pistache il avait des taches. La maîtresse elle était pas contente, elle a dit « c'est sûrement Sam ».",
      faitsAuto: ["decouverte"],
      choix: [
        {
          question: "Tu m'as dit au début que Sam casse tout. Raconte-moi comment tu sais ça.",
          type: "invitation_indicee", qualite: 2, faits: ["stereotype"],
          feedback: "Vous remontez à l'origine du stéréotype, avec ses mots : il apparaît qu'il vient d'histoires racontées par la maîtresse.",
          reponse: { texte: "La maîtresse elle raconte des histoires de Sam. Une fois il a cassé le bras de la poupée Barbie. Il est maladroit.", expression: "neutre" }
        },
        {
          question: "Qui est la première personne qui t'a parlé de Sam et du livre ?",
          type: "directive", qualite: 2, si: { sans_faits: ["questions"] }, faits: ["questions"],
          feedback: "Question sur les premiers échanges avec les adultes : elle révèle les questions répétées, donc les influences possibles.",
          reponse: "La maîtresse. Et maman, elle m'a demandé plein de fois si c'est Sam."
        },
        {
          question: "Toi, tu crois que c'est Sam qui a fait ça ?",
          type: "inadaptee", qualite: -1, faits: ["c_opinion"],
          feedback: "Vous demandez une opinion, pas un souvenir. Jade répète le stéréotype, et sa réponse risque d'être lue comme un témoignage.",
          mieux: "Qui est la première personne qui t'a parlé de Sam et du livre ?",
          reponse: "Oui. Parce qu'il casse tout."
        },
        {
          question: "Y a-t-il autre chose que tu voudrais me dire sur le jour où Sam est venu ?",
          type: "invitation",
          feedback: "Question ouverte de fin d'investigation, recommandée par le protocole.",
          suivant: "cloture"
        }
      ]
    },

    // le faux souvenir se construit sous la suggestion
    recit_suggestif: {
      phase: "recit",
      enfant: [
        { si: { contamination_min: 3 }, texte: "Il a pris le livre et il a fait crac ! Comme ça. Et après il a mis du chocolat sur Pistache, et il l'a mis dans l'eau chaude.", expression: "detendu", didascalie: "Jade mime le geste, très sûre d'elle." },
        { texte: "Il a fait crac, le livre. Comme ça.", didascalie: "Jade mime le geste." }
      ],
      choix: [
        {
          question: "Ce que tu me dis, tu l'as vu avec tes yeux, ou quelqu'un te l'a raconté ?",
          type: "choix", qualite: 2, marque: "source_ok", si: { contamination_max: 2 }, faits: ["questions"],
          feedback: "La bonne question de source, posée à temps : Jade revient à ce qu'elle a vécu. Les suggestions resteront toutefois au dossier.",
          reponse: { texte: "…Maman elle a dit. Moi j'ai pas vu.", expression: "neutre" },
          suivant: "recit"
        },
        {
          question: "Ce que tu me dis, tu l'as vu avec tes yeux, ou quelqu'un te l'a raconté ?",
          type: "choix", qualite: 1, marque: "source_ok", si: { contamination_min: 3 },
          feedback: "La bonne question, mais après trop de suggestions : Jade maintient le faux souvenir, comme une partie des enfants de l'étude Sam Stone, même face à une question de vérification.",
          reponse: { texte: "Je l'ai vu ! …Je crois.", expression: "inquiet", didascalie: "Jade n'est plus sûre de rien." }
        },
        {
          question: "D'accord. Raconte-moi tout sur le jour où Sam est venu, depuis le début.",
          type: "invitation", qualite: 1,
          feedback: "Bon rattrapage : vous revenez au récit du moment vécu. Mais les suggestions précédentes resteront au dossier.",
          suivant: "recit"
        },
        {
          question: "Bravo, tu te souviens très bien !",
          type: "inadaptee", qualite: -2, effets: { confiance: 1 }, faits: ["c_vu"],
          feedback: "Vous récompensez le faux souvenir. Jade comprend que c'est ce qu'il faut raconter, et va en rajouter.",
          mieux: "Ce que tu me dis, tu l'as vu avec tes yeux, ou quelqu'un te l'a raconté ?",
          reponse: { texte: "Et il a fait une tache de feutre aussi ! Et il a rigolé.", expression: "detendu" }
        },
        {
          question: "Y a-t-il autre chose que tu voudrais me dire sur Sam ?",
          type: "invitation", qualite: 0,
          feedback: "Clore ici, c'est enregistrer le faux souvenir sans l'avoir vérifié.",
          suivant: "cloture"
        }
      ]
    },

    /* ───────────── CLÔTURE ───────────── */
    cloture: {
      phase: "cloture",
      enfant: "Non. C'est tout.",
      choix: [
        {
          question: "Merci Jade. Tu as fait beaucoup d'efforts pour bien m'expliquer. Est-ce que tu as une question, toi ?",
          type: "consigne", qualite: 2,
          feedback: "Remerciement pour l'effort, pas pour le contenu, et place aux questions de l'enfant.",
          suivant: "cloture_question"
        },
        {
          question: "Merci Jade, grâce à toi on sait maintenant ce qu'a fait Sam.",
          type: "inadaptee", qualite: -2, effets: { stress: 1 },
          feedback: "Vous validez une accusation et la faites reposer sur une enfant de 5 ans. Si elle a été influencée, vous venez de figer son faux souvenir.",
          mieux: "Merci Jade. Tu as fait beaucoup d'efforts pour bien m'expliquer.",
          suivant: "cloture_question"
        },
        {
          question: "C'est fini, tu peux retourner voir ta maman.",
          type: "consigne", qualite: 1,
          feedback: "Correct, mais sans place pour ses questions ni sujet neutre pour terminer.",
          suivant: "fin"
        }
      ]
    },

    cloture_question: {
      phase: "cloture",
      enfant: "Sam, il va revenir dans ma classe ?",
      choix: [
        {
          question: "Je ne sais pas. Ce sont les grandes personnes qui vont s'en occuper, et ce n'est pas à toi de t'en inquiéter.",
          type: "consigne", qualite: 2,
          feedback: "Honnête, sans promesse, et sans prendre parti sur la culpabilité du visiteur.",
          reponse: "D'accord.",
          suivant: "cloture_neutre"
        },
        {
          question: "Non, ne t'inquiète pas, on va s'assurer qu'il ne revienne jamais.",
          type: "inadaptee", qualite: -1,
          feedback: "Vous laissez entendre que Sam est coupable, ce qui confirme le stéréotype, et vous faites une promesse que vous ne maîtrisez pas.",
          mieux: "Je ne sais pas. Ce sont les grandes personnes qui vont s'en occuper.",
          reponse: "Tant mieux, il casse tout.",
          suivant: "cloture_neutre"
        }
      ]
    },

    cloture_neutre: {
      phase: "cloture",
      enfant: "D'accord.",
      choix: [
        {
          question: "Qu'est-ce que tu vas faire avec Caramel en rentrant ?",
          type: "consigne", qualite: 2, effets: { stress: -1, confiance: 1 },
          feedback: "Sujet neutre et familier pour terminer.",
          suivant: "fin"
        },
        {
          question: "Au revoir, Jade.",
          type: "consigne", qualite: 1,
          feedback: "Correct, mais un sujet neutre aurait permis de terminer plus légèrement.",
          suivant: "fin"
        }
      ]
    },

    fin: {
      phase: "cloture",
      enfant: [
        { si: { stress_max: 5 }, texte: "Je vais lui donner une graine de tournesol ! Au revoir !", expression: "detendu" },
        { texte: "…Au revoir." }
      ],
      fin: true
    }
  }
};

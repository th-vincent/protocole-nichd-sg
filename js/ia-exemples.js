/*
 * Banque d'exemples pour le classement des questions tapées par l'IA (mode saisie libre).
 * L'IA compare le SENS de la phrase tapée à ces exemples : plus il y a d'exemples variés, mieux elle classe.
 * Ajoutez des formulations réelles d'enquêteurs au fil des tests.
 *
 * types      : exemples annotés par type de question NICHD
 * intentions : petites questions courantes, indépendantes du scénario, avec la réaction de l'enfant
 *              ({P} = prénom, {e} = accord au féminin, voir tpl() dans moteur.js)
 */
window.EXEMPLES_NICHD = {
  types: {
    invitation: [
      "Raconte-moi tout ce qui s'est passé.",
      "Raconte-moi tout, depuis le début jusqu'à la fin.",
      "Et ensuite, qu'est-ce qui s'est passé ?",
      "Et après ?",
      "Et puis ?",
      "Dis-moi pourquoi tu es venue me voir aujourd'hui.",
      "Qu'est-ce qui t'amène ici ?",
      "Raconte-moi ce que tu aimes faire.",
      "Parle-moi de toi.",
      "Raconte-moi ce que tu as fait ce matin.",
      "Raconte-moi ton dernier anniversaire.",
      "Explique-moi ce qui s'est passé.",
      "Il s'est passé quoi ?",
      "Y a-t-il autre chose que tu voudrais me dire ?",
      "Est-ce qu'il y a autre chose dont tu te souviens ?",
      "Tu peux m'en dire plus ?",
      "Raconte-moi la suite.",
      "Vas-y, je t'écoute.",
      "Raconte.",
      "Tu peux me raconter ta journée ?"
    ],
    invitation_indicee: [
      "Tu as parlé de ton dessin, raconte-moi tout sur ça.",
      "Tu as dit qu'il criait. Parle-moi de ce moment.",
      "Tu m'as dit que tu avais mal, raconte-moi plus.",
      "Parle-moi plus de ta copine.",
      "Raconte-moi tout sur le moment où il est parti.",
      "Tu as dit « la cuisine ». Raconte-moi ce qui s'est passé dans la cuisine.",
      "Raconte-moi tout ce qui s'est passé depuis le moment où tu es arrivée jusqu'au moment où tu es partie.",
      "Tu as parlé de ton frère, dis-m'en plus sur lui.",
      "Raconte-moi ce qui s'est passé quand ta maman t'a vue.",
      "J'ai entendu dire que tu as parlé à ta maîtresse. Dis-moi ce que tu lui as dit.",
      "Tu as parlé d'une marque, raconte-moi tout sur cette marque."
    ],
    soutien: [
      "Prends ton temps.",
      "Tu m'aides beaucoup.",
      "Tu fais beaucoup d'efforts.",
      "Je vois que c'est difficile pour toi.",
      "C'est pas grave, on a tout le temps.",
      "Tu peux souffler un peu.",
      "Je suis là pour t'écouter.",
      "On n'est pas pressés.",
      "Merci, tu m'expliques très bien.",
      "On peut faire une petite pause si tu veux.",
      "Tu n'es pas obligée de tout dire maintenant.",
      "C'est normal de ne pas savoir.",
      "Tu te débrouilles très bien."
    ],
    directive: [
      "Où est-ce que ça s'est passé ?",
      "C'était quand ?",
      "Qui était là ?",
      "Il portait quoi ?",
      "De quelle couleur était son pull ?",
      "Combien de personnes il y avait ?",
      "Qu'est-ce qu'il t'a dit ?",
      "Comment tu t'es sentie ?",
      "Où était la marque ?",
      "Qui est Inès ?",
      "Il est comment, Kévin ?",
      "À quelle heure c'était ?",
      "Qu'est-ce que tu faisais à ce moment-là ?",
      "Tu étais où ?",
      "Pourquoi il a fait ça ?",
      "Pourquoi tu n'as rien dit ?",
      "Tu es dans quelle classe ?",
      "Comment ça s'est terminé ?",
      "Qu'est-ce que tu aimes faire ?"
    ],
    choix: [
      "Est-ce que c'est arrivé une fois ou plus d'une fois ?",
      "Il était en colère ou il rigolait ?",
      "Est-ce que tu as eu mal ?",
      "Tu aimes l'école ?",
      "C'était le matin ou l'après-midi ?",
      "Est-ce qu'il y avait quelqu'un d'autre ?",
      "Tu t'en souviens ?",
      "Il t'a parlé ?",
      "Tu as pleuré ?",
      "Est-ce que tu sais pourquoi tu es là ?",
      "C'était dans la salle ou dehors ?",
      "Tu as des frères et sœurs ?",
      "Est-ce que ta maman était là ?",
      "Il était gentil avec toi d'habitude ?"
    ],
    suggestive: [
      "Il t'a fait mal, hein ?",
      "C'est lui qui a fait ça, c'est ça ?",
      "Tu as dû avoir très peur.",
      "Il était méchant avec toi, non ?",
      "Je suppose qu'il t'a crié dessus ?",
      "Ça devait être horrible pour toi.",
      "C'est bien ce qui s'est passé, n'est-ce pas ?",
      "Il t'a forcée, c'est ça ?",
      "Tu ne voulais pas, j'imagine ?",
      "Il recommence souvent, je parie ?",
      "Il t'a menacée pour que tu ne dises rien ?",
      "C'est un grand qui t'a fait ça ?",
      "Il t'a fait du mal, avoue."
    ],
    consigne: [
      "Bonjour, je m'appelle Camille, je suis gendarme.",
      "Mon travail, c'est d'écouter les enfants.",
      "La caméra là-haut filme ce qu'on dit.",
      "Si tu ne sais pas, tu me dis « je ne sais pas ».",
      "Si je me trompe, tu me corriges.",
      "Comment s'appelle mon chien ?",
      "Si je dis que tu as deux ans, qu'est-ce que tu dis ?",
      "Tu promets de dire seulement ce qui s'est vraiment passé ?",
      "Si tu ne comprends pas une question, dis-le-moi.",
      "On a fini, merci beaucoup.",
      "Est-ce que tu as des questions ?",
      "Qu'est-ce que tu vas faire cet après-midi ?",
      "Au revoir, à bientôt.",
      "Maintenant, on va faire connaissance.",
      "Tu peux t'asseoir où tu veux.",
      "Bonjour !",
      "Je vais te poser quelques questions."
    ],
    inadaptee: [
      "Tu dois me répondre.",
      "Tu es sûre de ce que tu dis ?",
      "Ne t'inquiète pas, tu ne le reverras plus jamais.",
      "Je te promets qu'il ira en prison.",
      "Il n'avait pas le droit de faire ça, c'est très grave.",
      "Si tu mens, tu auras des problèmes.",
      "Réponds quand je te parle !",
      "Dépêche-toi, on n'a pas toute la journée.",
      "Tu es très courageuse.",
      "Ce qu'il a fait est très mal.",
      "Arrête de pleurer.",
      "Tu mens, c'est ça ?",
      "Grâce à toi on va pouvoir le punir."
    ],
    incomprise: [
      "Quelle est la nature exacte des faits ?",
      "Peux-tu relater les circonstances ?",
      "Qu'en est-il de la temporalité des événements ?",
      "Est-il exact que le prévenu a commis l'infraction ?",
      "Quel est ton avis sur la situation géopolitique ?",
      "Le chat mange la lune bleue.",
      "Banane trampoline.",
      "Confirmes-tu la matérialité des éléments ?"
    ]
  },

  intentions: [
    {
      id: "relance", type: "invitation", commeSilence: true,
      exemples: ["D'accord.", "Ok.", "Hmm hmm.", "Je vois.", "Ah oui.", "Très bien.", "Mmh.", "Oui…", "Ah d'accord.", "Je t'écoute."],
      feedback: "Relance minimale (« d'accord », « hmm », « je vois ») : comme un silence attentif, elle montre que vous écoutez et laisse l'enfant poursuivre."
    },
    {
      id: "ca_va", type: "consigne", qualite: 1, effets: { confiance: 1 },
      exemples: ["Comment ça va ?", "Ça va ?", "Tu vas bien ?", "Comment tu te sens aujourd'hui ?", "Ça va bien ?", "Tu es en forme ?", "Comment vas-tu ?"],
      reponse: [
        { si: { stress_min: 6 }, texte: "…Bof.", expression: "inquiet" },
        { si: { confiance_min: 5 }, texte: "Ça va !", expression: "detendu" },
        { texte: "…Ça va." }
      ],
      feedback: "Prendre des nouvelles met à l'aise, mais c'est une question fermée qui appelle une réponse courte. Ensuite, passez à une invitation ouverte."
    },
    {
      id: "confort", type: "consigne", qualite: 1, effets: { confiance: 1, stress: -1 },
      exemples: ["Tu veux un verre d'eau ?", "Tu as soif ?", "Tu as besoin d'aller aux toilettes ?", "Tu es bien installée ?", "Tu as chaud ?", "Tu veux enlever ton manteau ?", "Tu veux un mouchoir ?"],
      reponse: "Non, ça va. Merci.",
      feedback: "Veiller au confort de l'enfant est bienvenu, à condition de revenir ensuite au fil de l'audition."
    },
    {
      id: "pause", type: "soutien", effets: { stress: -1 },
      exemples: ["Tu veux une pause ?", "On fait une petite pause ?", "Tu veux qu'on s'arrête un moment ?", "Tu es fatiguée ?", "Tu veux souffler un peu ?"],
      reponse: [{ si: { stress_min: 6 }, texte: "…Oui. Un peu.", didascalie: "{P} souffle longuement." }, { texte: "Non, ça va." }],
      feedback: "Proposer une pause est bienvenu quand l'enfant est tendu{e} ; s'il va bien, cela coupe inutilement l'élan.",
      selon: [{ si: { stress_min: 6 }, qualite: 2, effets: { stress: -2 } }]
    },
    {
      id: "prenom", type: "directive", qualite: 1, effets: { confiance: 1 },
      exemples: ["Tu t'appelles comment ?", "C'est quoi ton prénom ?", "Comment tu t'appelles ?"],
      reponse: "{P}.",
      feedback: "Information déjà connue, mais l'occasion d'entendre l'enfant parler. En rapport, préférez une invitation (« Raconte-moi ce que tu aimes faire »)."
    },
    {
      id: "pret", type: "choix", qualite: 1, exigeQuestion: true,
      exemples: ["Tu es prête ?", "On peut commencer ?", "Tu as compris ?", "C'est bon pour toi ?", "D'accord ?", "Ça te va ?"],
      reponse: [{ si: { stress_min: 6 }, texte: "…Oui.", expression: "inquiet" }, { texte: "Oui." }],
      feedback: "Vérification fermée : sans risque, mais l'enfant répond presque toujours « oui ». Elle n'apporte pas d'information."
    },
    {
      id: "qui_je_suis", type: "choix", qualite: 1,
      exemples: ["Tu sais qui je suis ?", "Tu sais ce que je fais comme métier ?", "Tu sais où tu es ?", "Tu sais ce que c'est, une gendarme ?"],
      reponse: [{ si: { confiance_max: 3 }, texte: "…Non.", expression: "inquiet" }, { texte: "Euh… la police ?" }],
      feedback: "Mieux vaut expliquer vous-même qui vous êtes et ce que vous faites, plutôt que de tester l'enfant."
    }
  ]
};

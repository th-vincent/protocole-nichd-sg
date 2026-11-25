/*
 * Léa : questions NATURELLES supplémentaires pour la saisie libre (mode IA) uniquement.
 * Ce qu'un enquêteur dit spontanément, même hors du protocole strict : vie quotidienne, détails pratiques,
 * réactions à l'attitude de l'enfant, demandes de précision, curiosité pendant le récit…
 * Chaque question a une vraie réponse de Léa (cohérente avec son histoire) et un retour pédagogique.
 *
 * sl.partout          : valables à toutes les étapes
 * sl.parPhase[phase]  : ajoutées aux banques de chaque phase (voir lea.libre.js)
 * o(question, type, qualite, reponse, feedback, autres champs) — même format qu'un choix (voir lea.js)
 */
(() => {
  const o = (question, type, qualite, reponse, feedback, extra = {}) => ({ question, type, qualite, reponse, feedback, ...extra });
  const sl = window.SCENARIOS.lea.saisieLibre, P = sl.parPhase;
  const ANNIV = { noeuds: ["memoire_2", "memoire_3"] }, MATIN = { noeuds: ["memoire_matin"] };
  const A = { faits: ["auteur"] };                        // Léa a commencé à raconter
  const TENDUE = { stress_min: 6 };

  /* ───────────── À TOUTES LES ÉTAPES ───────────── */
  sl.partout = [
    o("Tu comprends ce que je te dis ?", "choix", 1, "Oui.",
      "Vérifier la compréhension est utile ; la règle « je ne comprends pas » permet aussi à l'enfant de le dire seule.", { exemples: ["Tu me suis ?", "C'est clair pour toi ?"] }),
    o("Tu peux répéter, s'il te plaît ?", "consigne", 0, { texte: "…Ce que je viens de dire ?", expression: "inquiet" },
      "Faire répéter peut laisser croire à l'enfant que sa réponse ne convient pas. Reprenez plutôt ses mots : « Tu as dit… ».", { exemples: ["J'ai pas bien entendu, tu peux redire ?", "Qu'est-ce que tu as dit ? J'ai pas compris."] }),
    o("Qu'est-ce que tu veux dire ?", "directive", 1, "Ben… ce que j'ai dit.",
      "Demande de précision correcte, mais « Raconte-moi plus sur… » en reprenant ses mots est plus ouvert.", { exemples: ["C'est-à-dire ?", "Tu veux dire quoi par là ?"] }),
    o("Tu as froid ?", "choix", 1, "Non, ça va.",
      "Attention au confort de l'enfant : bien.", { exemples: ["Il fait pas trop froid ici ?", "Tu as chaud ?"] }),
    o("Tu as faim ?", "choix", 1, "Un peu. Mais ça va.",
      "Attention au confort de l'enfant : bien.", { exemples: ["Tu veux un petit gâteau ?", "Tu as pris ton goûter ?"] }),
    o("Tu as sommeil ?", "choix", 1, [{ si: TENDUE, texte: "…Un peu.", expression: "triste" }, { texte: "Non, ça va." }],
      "Prendre des nouvelles : bien.", { exemples: ["Tu es fatiguée ?", "T'as envie de dormir ?"] }),
    o("Tu veux que ta maman vienne avec toi ?", "choix", 0, [{ si: TENDUE, texte: "…Oui.", expression: "triste" }, { texte: "Non, ça va." }],
      "La présence d'un parent pendant l'audition peut influencer le récit. Rassurez plutôt : elle est juste à côté.", { exemples: ["Tu veux maman avec toi ?", "Je vais chercher ta maman ?"] }),
    o("Tu as peur de moi ?", "choix", 0, { texte: "…Un peu.", expression: "inquiet" },
      "La question suggère la peur ; montrez plutôt par votre attitude que vous êtes là pour écouter.", { exemples: ["Je te fais peur ?", "Tu es intimidée ?"] }),
    o("Pourquoi tu ris ?", "directive", 0, "…Je sais pas. C'est rigolo.",
      "« Pourquoi » sur une réaction met l'enfant mal à l'aise : laissez-la rire.", { exemples: ["Qu'est-ce qui te fait rire ?"] }),
    o("Pourquoi tu pleures ?", "directive", -1, { texte: "…", expression: "triste", didascalie: "Léa s'essuie les yeux." },
      "Demander pourquoi elle pleure la met en difficulté. Proposez un mouchoir, une pause, rassurez sans parler des faits.", { effets: { stress: 1 }, exemples: ["Arrête de pleurer, ça va aller.", "Ne pleure pas."] }),
    o("Tu es déjà venue ici ?", "choix", 1, "Non, c'est la première fois.",
      "Question anodine.", { exemples: ["C'est la première fois que tu viens ?"] }),
    o("Tu sais lire ?", "choix", 1, "Oui ! Je lis des livres de chevaux.",
      "Question anodine.", { exemples: ["Tu lis bien ?"] }),
    o("Tu me trouves gentille ?", "choix", 0, "…Oui.",
      "Question centrée sur vous, qui appelle un « oui » de politesse.", { exemples: ["Je suis gentille avec toi ?", "Tu m'aimes bien ?"] }),
    o("Tu préfères qu'on parle d'autre chose ?", "choix", 1, [{ si: TENDUE, texte: "…Oui.", expression: "triste" }, { texte: "Non, ça va." }],
      "Proposer un détour est utile si l'enfant est tendue ; sinon, cela coupe l'élan.", { exemples: ["On change de sujet ?", "Tu veux qu'on parle d'autre chose ?"] }),
    o("Tu veux te lever un peu, te dégourdir les jambes ?", "consigne", 1, "Non, ça va.",
      "Attention au confort : bien.", { exemples: ["Tu veux bouger un peu ?"] }),
    o("Arrête de bouger, tiens-toi tranquille.", "inadaptee", -1, { texte: "…", expression: "inquiet", didascalie: "Léa se fige." },
      "Commenter l'agitation de l'enfant augmente son malaise : observez sans reprocher.", { effets: { stress: 1, confiance: -1 }, exemples: ["Tu fais quoi avec tes mains ?", "Reste assise correctement."] }),
    o("Regarde-moi quand je te parle.", "inadaptee", -1, { texte: "…", expression: "inquiet" },
      "Exiger le regard ajoute de la pression ; un enfant peut très bien parler sans regarder l'adulte.", { effets: { stress: 1 }, exemples: ["Regarde-moi.", "Lève la tête."] }),
    o("Parle plus fort, je n'entends pas.", "consigne", 0, { texte: "…", expression: "inquiet" },
      "Demande légitime mais qui intimide ; rapprochez-vous ou rassurez plutôt.", { exemples: ["Je t'entends pas bien.", "Plus fort, s'il te plaît."] }),
    o("Prends ton temps pour réfléchir.", "soutien", 1, "…D'accord.",
      "Laisser du temps : bien.", { exemples: ["Réfléchis tranquillement.", "Tu peux réfléchir, rien ne presse."] }),
    o("C'est bien, continue.", "soutien", 1, "…",
      "Encouragement neutre, sans juger le contenu : correct.", { exemples: ["Vas-y, continue.", "Continue, je t'écoute."] }),
    o("Est-ce que je peux te poser une question ?", "choix", 1, "Oui.",
      "Demander la permission est poli ; enchaînez avec une question ouverte.", { exemples: ["Je peux te demander quelque chose ?"] }),
    o("Tu en as marre ?", "choix", 1, [{ si: TENDUE, texte: "…Un peu.", expression: "triste" }, { texte: "Non, ça va." }],
      "Prendre la température : bien, si c'est suivi d'une pause en cas de « oui ».", { exemples: ["Tu t'ennuies ?", "Ça t'embête de parler avec moi ?"] }),
    o("Tu sais ce que fait un gendarme ?", "choix", 1, "Ils arrêtent les voleurs !",
      "Peu utile : expliquez plutôt simplement votre rôle.", { exemples: ["Tu sais à quoi servent les gendarmes ?"] }),
    o("Tu as un téléphone ?", "choix", 1, "Non, je suis trop petite. C'est maman qui en a un.",
      "Question anodine."),
    o("Tu veux une feuille et des feutres pendant qu'on parle ?", "consigne", 1, { texte: "D'accord !", expression: "detendu" },
      "Une activité calme pour les mains apaise certains enfants ; à garder discrète pour ne pas détourner l'attention.", { effets: { stress: -1 }, exemples: ["Tu veux dessiner pendant qu'on parle ?"] }),
    o("Ça te fait quoi d'être ici ?", "directive", 1, [{ si: TENDUE, texte: "…Ça me stresse.", expression: "inquiet" }, { texte: "C'est un peu bizarre. Mais ça va." }],
      "Accueillir le ressenti de l'enfant : bien, sans insister.", { exemples: ["Tu te sens comment ici ?", "Ça fait bizarre d'être ici ?"] }),
    o("Tu es gênée ?", "choix", 0, { texte: "…Un peu.", expression: "inquiet" },
      "Vous suggérez une émotion.", { exemples: ["Ça te gêne ?"] }),
    o("Tu peux me faire confiance.", "soutien", 1, "…D'accord.",
      "Rassurant, mais la confiance se construit par l'écoute plus que par la déclaration.", { exemples: ["Tu peux avoir confiance en moi."] }),
    o("On recommence depuis le début ?", "consigne", 0, { texte: "…Encore ?", expression: "inquiet" },
      "Recommencer laisse croire à l'enfant que ses réponses ne conviennent pas.", { exemples: ["Tu peux tout me redire depuis le début ?"] }),
    o("Tu sais pourquoi je pose toutes ces questions ?", "choix", 0, "…Non.",
      "Expliquez simplement votre rôle plutôt que de tester l'enfant."),
    o("Tu veux un verre d'eau ou un mouchoir ?", "consigne", 1, "Un verre d'eau, s'il te plaît.",
      "Attention au confort : bien.", { exemples: ["Tu veux boire un peu d'eau ?"] }),
    o("Ça va toujours ?", "choix", 1, [{ si: TENDUE, texte: "…Bof.", expression: "triste" }, { texte: "Oui, ça va." }],
      "Prendre des nouvelles en cours d'audition : bien.", { exemples: ["Tout va bien ?", "Ça va, toi ?"] })
  ];

  /* ───────────── INTRODUCTION ───────────── */
  P.introduction.push(
    o("Vous avez trouvé facilement ?", "choix", 1, "Oui, maman connaissait.", "Échange anodin qui détend ; présentez-vous ensuite.", { exemples: ["C'était facile de trouver ?"] }),
    o("Tu as bien dormi cette nuit ?", "choix", 1, [{ si: { stress_min: 5 }, texte: "Pas trop. J'ai fait un cauchemar.", expression: "inquiet" }, { texte: "Oui." }],
      "Question de bien-être ; elle peut ouvrir sur l'appréhension de l'audition.", { exemples: ["T'as bien dormi ?"] }),
    o("Tu n'as pas école aujourd'hui ?", "choix", 1, "Si, mais maman a dit que je venais ici à la place.", "Question anodine."),
    o("Tu préfères t'asseoir sur le canapé ou sur le pouf ?", "choix", 1, "Le canapé.",
      "Laisser l'enfant choisir sa place lui donne un peu de contrôle : bien.", { exemples: ["Tu veux t'asseoir où ?"] }),
    o("Tu aimes bien cette salle ?", "choix", 1, { texte: "Oui, elle est jolie. Y a plein de couleurs.", expression: "detendu" }, "Échange anodin.", { exemples: ["Elle te plaît, la salle ?"] }),
    o("Tu as vu les dessins au mur ?", "choix", 1, "Oui. Y a un soleil et une maison.", "Échange anodin qui détend."),
    o("Je vais m'asseoir là, en face de toi, d'accord ?", "consigne", 1, "D'accord.", "Annoncer ce que l'on fait : rassurant."),
    o("Je vais te dire comment ça va se passer.", "consigne", 2, "D'accord.",
      "Annoncer le déroulement rassure ; restez simple et ne parlez pas des faits.", { exemples: ["Je t'explique comment on va faire."] }),
    o("D'abord on va faire connaissance, et après je te poserai des questions.", "consigne", 1, "D'accord.", "Bon plan annoncé ; inutile d'insister sur « les questions »."),
    o("Tu peux me poser des questions toi aussi, si tu veux.", "consigne", 2, "D'accord.", "Rendre l'échange réciproque : bien."),
    o("Est-ce que tu sais ce qu'on fait ici ?", "choix", 0, "…Non. Enfin, un peu.", "Plutôt que de la tester, expliquez votre rôle.", { exemples: ["Tu sais ce que c'est, cet endroit ?"] }),
    o("Tu es contente d'être ici ?", "choix", 0, { texte: "…Je sais pas.", expression: "inquiet" }, "Question fermée sur une émotion difficile à exprimer."),
    o("Tu aimes bien ton prénom ?", "choix", 1, { texte: "Oui ! C'est mamie qui l'a choisi.", expression: "detendu" }, "Échange anodin qui détend."),
    o("Tu as des frères et sœurs ?", "choix", 1, "Un frère. Hugo.", "Question anodine ; le rapport viendra ensuite."),
    o("Tu es en quelle classe ?", "directive", 1, "En CE2.", "Information connue, mais sans risque."),
    o("Je suis là pour toi pendant tout ce temps.", "soutien", 1, "…D'accord.", "Rassurant."),
    o("Beaucoup d'enfants viennent ici, et ça se passe bien.", "soutien", 0, "…",
      "Rassurant en apparence, mais laisse entendre qu'il y a quelque chose à « bien passer ».")
  );

  /* ───────────── RÈGLES DE BASE ───────────── */
  P.regles.push(
    o("Il n'y a pas de piège dans mes questions.", "consigne", 1, "D'accord.", "Rassurant ; posez ensuite les règles."),
    o("Si une question est trop difficile, tu me le dis.", "consigne", 2, "D'accord.", "Proche de la règle « je ne comprends pas » : bien.", { marque: "comprend" }),
    o("Est-ce que tu sais dire « je ne sais pas » ?", "choix", 0, "…Oui ?", "Testez plutôt la règle par un exemple concret."),
    o("Si je dis que tu as les cheveux bleus, c'est vrai ?", "consigne", 2, { texte: "Non ! Ils sont marron !", expression: "detendu", didascalie: "Léa rit." },
      "Règle de correction testée avec humour.", { marque: "corrige", effets: { confiance: 1 } }),
    o("Si je dis qu'il neige dehors, c'est vrai ?", "consigne", 2, { texte: "Non ! Il fait beau !", expression: "detendu" },
      "Test concret du vrai et du faux : bien.", { marque: "verite" }),
    o("Combien j'ai d'enfants, à ton avis ?", "consigne", 2, { texte: "Je sais pas !", expression: "detendu" },
      "Test de la règle « je ne sais pas » : bien.", { marque: "test_sais" }),
    o("Tu as le droit de me dire que tu ne veux pas répondre.", "consigne", 1, "D'accord.",
      "Rassurant ; mais le protocole préfère « je ne sais pas » à « je ne veux pas »."),
    o("Ici, on dit la vérité, d'accord ?", "consigne", 1, "D'accord.", "Préférez une promesse appuyée sur un exemple concret."),
    o("Tu dois toujours dire la vérité, sinon c'est grave.", "inadaptee", -1, { texte: "…D'accord.", expression: "inquiet" },
      "Menace implicite : les règles doivent libérer la parole, pas faire peur.", { effets: { stress: 2 } }),
    o("Ça t'arrive de mentir ?", "choix", -1, { texte: "…Non. Enfin des fois, pour rigoler.", expression: "inquiet" },
      "Question qui met l'enfant en position de suspecte ; testez plutôt la vérité par un exemple neutre.", { effets: { stress: 1 } }),
    o("Tu me promets de ne pas inventer d'histoires ?", "consigne", 2, "Promis.", "Promesse simple : bien.", { marque: "promesse" }),
    o("Les règles sont faciles, tu vas voir.", "consigne", 1, "D'accord.", "Rassurant."),
    o("On essaie encore une fois ?", "consigne", 1, "D'accord !", "Tester une règle de nouveau : sans risque."),
    o("Bravo, tu as bien compris.", "soutien", 1, { texte: "…", expression: "detendu" }, "Encourager la compréhension des règles : bien.")
  );

  /* ───────────── RAPPORT ───────────── */
  P.rapport.push(
    o("C'est quoi ton plat préféré ?", "directive", 1, { texte: "Les crêpes ! Avec du chocolat.", expression: "detendu" }, "Question anodine qui détend.", { exemples: ["Tu aimes manger quoi ?"] }),
    o("Tu aimes quoi comme musique ?", "directive", 1, "Les chansons de la radio. Et celle du spectacle de danse.", "Question anodine."),
    o("Tu as un livre préféré ?", "choix", 1, "Oui, un livre sur les chevaux. Mamie me l'a offert.", "Question anodine ; une invitation ferait parler davantage."),
    o("Tu joues à des jeux vidéo ?", "choix", 1, "Des fois, sur la tablette de maman. Un jeu de chevaux !", "Question anodine.", { exemples: ["Tu joues à la tablette ?"] }),
    o("Tu regardes beaucoup la télé ?", "choix", 1, "Un peu. Le soir, avec Hugo.", "Question anodine."),
    o("C'est quoi ta couleur préférée ?", "directive", 1, "Le violet !", "Question anodine.", { exemples: ["Ta couleur préférée ?"] }),
    o("Tu fais quoi le samedi ?", "directive", 1, "J'ai danse le matin. L'après-midi je joue.", "Question anodine."),
    o("Tu vas souvent chez ta mamie ?", "choix", 1, "Le dimanche, des fois. Elle a un jardin avec des poules.", "Question fermée ; une invitation ferait parler davantage."),
    o("Raconte-moi ta mamie.", "invitation", 2, { texte: "Elle fait des gâteaux. Elle a des poules et un grand jardin. Et elle me lit des histoires.", expression: "detendu" },
      "Invitation ouverte sur une personne rassurante : bien.", { effets: { confiance: 1 }, exemples: ["Parle-moi de ta grand-mère."] }),
    o("Raconte-moi ton frère.", "invitation", 2, "Hugo il a dix ans. Il est rigolo, mais des fois il m'embête. Il aime le foot.",
      "Invitation ouverte : bien.", { exemples: ["Parle-moi de Hugo.", "Il est comment ton frère ?"] }),
    o("Ton frère, il fait quel sport ?", "directive", 1, "Du foot. Il est gardien.", "Question anodine."),
    o("Raconte-moi tes figurines de chevaux.", "invitation_indicee", 2, { texte: "J'en ai six. Tonnerre il est noir. Y a aussi Étoile, elle est blanche avec des taches.", expression: "detendu" },
      "Invitation sur un sujet qui passionne l'enfant : très bien.", { effets: { confiance: 1 }, exemples: ["Parle-moi de tes chevaux.", "Tes figurines, raconte."] }),
    o("Tu fais de l'équitation ?", "choix", 1, "Non… maman dit que c'est trop cher. Mais un jour j'en ferai.", "Question anodine.", { exemples: ["Tu montes à cheval ?"] }),
    o("Tu as déjà monté un vrai cheval ?", "choix", 1, { texte: "Une fois, un poney ! Chez le voisin de mamie.", expression: "detendu" }, "Question anodine."),
    o("Tu as une maîtresse ou un maître ?", "choix", 1, "Une maîtresse. Elle est gentille.", "Question anodine."),
    o("Raconte-moi ta maîtresse.", "invitation", 1, "Elle est gentille. Elle nous lit des contes. Des fois elle crie quand on fait trop de bruit.",
      "Invitation ouverte, mais la maîtresse est liée à la révélation : en rapport, préférez des sujets sans lien avec l'affaire."),
    o("Tu es forte en quoi à l'école ?", "directive", 1, "En dessin. Et en lecture.", "Question anodine."),
    o("C'est quoi le plus difficile pour toi à l'école ?", "directive", 1, "Les maths. Surtout les divisions.", "Question anodine."),
    o("Tu fais quoi à la récré ?", "directive", 1, "On joue à l'élastique avec Inès. Ou à chat.", "Question correcte ; « Raconte-moi une récré » serait plus ouvert.", { exemples: ["Tu joues à quoi à la récré ?"] }),
    o("Raconte-moi une récré.", "invitation", 2, "On sort dans la cour, on joue à l'élastique. Des fois les garçons ils prennent toute la place avec le foot.", "Invitation ouverte : bien."),
    o("Tu as un jardin chez toi ?", "choix", 1, "Oui, un petit. Avec une balançoire.", "Question anodine."),
    o("Tu aimes bien Noël ?", "choix", 1, { texte: "Oui ! On va chez mamie.", expression: "detendu" }, "Question anodine."),
    o("Qu'est-ce qui te fait rire ?", "directive", 2, { texte: "Quand Hugo fait des grimaces !", expression: "detendu" }, "Question positive qui détend : bien.", { effets: { confiance: 1 } }),
    o("Qu'est-ce qui te rend contente ?", "directive", 1, "Quand je dessine. Et quand on va chez mamie.", "Question positive : bien."),
    o("Qu'est-ce qui te rend triste ?", "directive", -1, { texte: "…Je sais pas.", expression: "triste" },
      "En rapport, évitez d'orienter vers les émotions négatives.", { effets: { stress: 1 } }),
    o("Tu as peur du noir ?", "choix", 0, "Un peu. J'ai une veilleuse.", "Thème de la peur introduit sans raison."),
    o("Tu es sage à l'école ?", "choix", 0, "…Oui. La plupart du temps.", "Question de jugement qui peut mettre l'enfant sur la défensive."),
    o("Tu as une meilleure amie ?", "choix", 1, "Oui, Inès.", "Question fermée ; relancez par une invitation."),
    o("Raconte-moi ta meilleure amie.", "invitation", 2, { texte: "Elle a des tresses. On est assises à côté en classe. On s'invite pour les anniversaires.", expression: "detendu" },
      "Invitation ouverte : bien.", { exemples: ["Parle-moi de ta copine."] }),
    o("Ta maman, elle fait quoi comme travail ?", "directive", 1, "Elle travaille dans un magasin. Des fois le samedi aussi.", "Question anodine."),
    o("Tu fais du vélo souvent ?", "choix", 1, "Oui, quand il fait beau.", "Question anodine."),
    o("Tu dessines quoi d'autre que des chevaux ?", "directive", 1, "Des chats. Et des maisons.", "Question anodine.")
  );

  /* ───────────── MÉMOIRE ÉPISODIQUE ───────────── */
  P.memoire.push(
    o("Il y avait de la musique ?", "choix", 1, "Oui, Hugo a mis des chansons.", "Question fermée sans risque.", { si: ANNIV }),
    o("Qui a fait le gâteau ?", "directive", 1, "On l'a acheté à la boulangerie, je crois.", "Question directive sans intérêt pour l'entraînement.", { si: ANNIV }),
    o("Tu as eu combien de cadeaux ?", "directive", 0, "Euh… cinq ? Ou six.", "Les nombres sont peu fiables à 8 ans.", { si: ANNIV }),
    o("C'était où, ta fête ?", "directive", 1, "À la maison. Et dans le jardin.", "Question directive correcte.", { si: ANNIV }),
    o("Il y avait des copines de l'école ?", "choix", 1, "Inès, oui.", "Question fermée sans risque.", { si: ANNIV }),
    o("Qu'est-ce que vous avez fait après le cache-cache ?", "invitation_indicee", 2, "On a mangé des bonbons. Après, les cousins sont partis.",
      "Segmentation temporelle : bien.", { si: { noeuds: ["memoire_3"] } }),
    o("Raconte-moi les jeux de ta fête.", "invitation", 2, "On a fait cache-cache, une bataille de ballons, et du ballon prisonnier.", "Invitation ouverte : bien.", { si: ANNIV }),
    o("Il y a un cadeau que tu n'as pas aimé ?", "choix", 0, { texte: "Le pull de mamie… il gratte. Mais chut !", expression: "detendu" }, "Question qui cherche le négatif, sans gravité ici.", { si: ANNIV }),
    o("Qu'est-ce que tu as ressenti en ouvrant tes cadeaux ?", "directive", 2, { texte: "J'étais trop contente !", expression: "detendu" }, "Vous demandez l'émotion au lieu de la supposer : bien.", { si: ANNIV }),
    o("Raconte-moi un autre moment de cette fête.", "invitation", 2, "Le moment où j'ai soufflé les bougies ! Tout le monde a chanté.", "Invitation ouverte : bien.", { si: ANNIV }),
    o("Tu t'es habillée toute seule ce matin ?", "choix", 1, "Oui ! J'ai choisi mon pull jaune.", "Question fermée sans risque.", { si: MATIN }),
    o("Qui t'a coiffée ce matin ?", "directive", 1, "Maman. Elle m'a fait des couettes.", "Question directive correcte.", { si: MATIN }),
    o("Vous avez parlé de quoi dans la voiture ?", "directive", 1, "Pas grand-chose. On a chanté.",
      "Correct ; attention, les échanges avec le parent juste avant l'audition se questionnent plutôt plus tard.", { si: MATIN }),
    o("Il faisait quel temps ce matin ?", "directive", 1, "Il faisait beau. Un peu froid.", "Question directive sans intérêt pour l'entraînement.", { si: MATIN }),
    o("Tu as attendu longtemps ?", "choix", 1, "Un peu. J'ai fait des Lego.", "Question fermée sans risque.", { si: MATIN }),
    o("Raconte-moi un autre moment de ta matinée.", "invitation", 2, "Quand je suis montée dans la voiture, j'ai mis ma ceinture toute seule.", "Invitation ouverte : bien.", { si: MATIN }),
    o("Et avant ça ?", "invitation", 1, "Euh… avant, je me rappelle plus trop.", "Remonter dans le temps : utile, mais « Et ensuite ? » fait mieux avancer le récit."),
    o("Tu t'en souviens bien ?", "choix", 0, "Oui… je crois.", "Mettre en question la mémoire fait douter l'enfant."),
    o("Tu peux me raconter un autre souvenir ?", "invitation", 1, "Quand on est allés à la mer l'été dernier. On a fait un château de sable énorme.",
      "Bon thème, mais un seul entraînement approfondi par des relances suffit.")
  );

  /* ───────────── TRANSITION ───────────── */
  P.transition.push(
    o("Tu sais qui m'a demandé de te voir ?", "choix", 0, "…Ta maîtresse ?", "Vous orientez l'enfant vers une source ; dites plutôt « Dis-moi pourquoi tu es là »."),
    o("Tu as quelque chose d'important à me dire ?", "choix", 0, [{ si: { confiance_min: 5 }, texte: "…Oui." }, { texte: "…Je sais pas.", expression: "inquiet" }],
      "Question fermée qui crée une attente."),
    o("Ta maman t'a expliqué pourquoi tu venais ?", "choix", 1, "Elle a dit que je devais raconter à une dame.",
      "Connaître les explications des adultes est utile, mais à ce stade invitez plutôt l'enfant à dire elle-même pourquoi elle est là."),
    o("Est-ce que quelqu'un t'a embêtée ?", "choix", -1, { texte: "…", expression: "inquiet" }, "Vous suggérez qu'on l'a embêtée avant tout récit.", { effets: { stress: 1 } }),
    o("Tu es venue pour parler de quelque chose de triste ?", "suggestive", -1, { texte: "…", expression: "triste" }, "Vous attribuez une tonalité au récit avant qu'il commence.", { effets: { stress: 1 } }),
    o("C'est quelque chose de grave ?", "choix", -1, { texte: "…Je sais pas.", expression: "inquiet" }, "Vous dramatisez avant tout récit.", { effets: { stress: 1 } }),
    o("Raconte-moi, tu peux commencer par où tu veux.", "invitation", 2, undefined, "Invitation ouverte qui laisse l'enfant choisir son point de départ : très bien.",
      { si: { noeuds: ["transition", "transition_bloque"] }, suivant: [{ si: { confiance_min: 4 }, vers: "recit" }, { vers: "transition_bloque" }] }),
    o("Je t'écoute : raconte-moi ce qui t'amène.", "invitation", 2, undefined, "Invitation ouverte : bien.",
      { si: { noeuds: ["transition", "transition_bloque"] }, suivant: [{ si: { confiance_min: 4 }, vers: "recit" }, { vers: "transition_bloque" }] }),
    o("Quand tu es prête, tu me racontes.", "soutien", 2, { texte: "…", didascalie: "Léa respire un grand coup." }, "Soutien sans pression : bien.", { effets: { stress: -1 } }),
    o("Tu as envie d'en parler ?", "choix", 0, [{ si: { confiance_min: 5 }, texte: "…Oui." }, { texte: "…Non." }], "Question fermée : un « non » clôt l'échange."),
    o("On va parler d'une chose importante maintenant.", "consigne", 0, { texte: "…", expression: "inquiet" }, "Vous dramatisez la transition.", { effets: { stress: 1 } }),
    o("Tu sais, tu peux tout me raconter, même les choses difficiles.", "soutien", 1, "…", "Rassurant, mais « difficiles » présuppose un contenu pénible.")
  );

  /* ───────────── RÉCIT ───────────── */
  P.recit.push(
    o("Il est grand, Kévin ?", "choix", 1, "Oui, très grand. Plus grand que maman.", "Précision descriptive sans suggestion.", { si: A }),
    o("Il a quel âge, Kévin ?", "directive", 0, "Je sais pas… il est vieux. Comme un papa.", "Les âges sont peu fiables à 8 ans.", { si: A }),
    o("Il a des cheveux comment, Kévin ?", "directive", 1, "Courts. Noirs. Et il a des lunettes.", "Précision descriptive correcte.", { si: A }),
    o("Tu le connais depuis longtemps, Kévin ?", "choix", 1, "Depuis l'année dernière. C'est l'animateur.", "Question utile sur la relation.", { si: A, faits: ["identite"] }),
    o("Comment il s'appelle, ton centre ?", "directive", 1, "Le centre des Tilleuls.", "Précision de lieu sans risque.", { si: { faits: ["lieu_date"] } }),
    o("Il y avait du bruit ?", "choix", 1, "Oui. Tout le monde rangeait.", "Question fermée sur le contexte.", { si: A }),
    o("Qu'est-ce que tu dessinais ?", "directive", 1, "Un cheval. Il était presque fini.", "Précision sur un élément donné par l'enfant.", { si: { faits: ["contexte"] } }),
    o("Tu étais avec qui à ta table ?", "directive", 1, "Avec Inès.", "Question directive utile.", { si: { faits: ["contexte"] } }),
    o("Il t'a dit de ranger combien de fois ?", "directive", 0, "Je sais pas… deux fois ?", "Les nombres sont peu fiables à 8 ans.", { si: { faits: ["contexte"] } }),
    o("Tu l'avais entendu, quand il a dit de ranger ?", "choix", 0, { texte: "…Oui. Mais je voulais finir.", expression: "triste" },
      "La question frôle le reproche : l'enfant se sent fautive.", { si: { faits: ["contexte"] } }),
    o("Il t'a fait mal où, exactement ?", "directive", 1, { texte: "Là, au bras.", didascalie: "Léa montre son avant-bras gauche." }, "Précision sur un élément donné par l'enfant.", { si: A }),
    o("Ça te fait encore mal ?", "choix", 1, "Non, plus maintenant.", "Question bienveillante sur l'état actuel.", { si: A }),
    o("Tu as crié ?", "choix", 1, "J'ai dit « aïe ». Fort.", "Question fermée, sans suggestion forte.", { si: A }),
    o("Les autres enfants ont dit quelque chose ?", "choix", 1, "Non… ils regardaient pas. Sauf Inès.", "Question utile sur les témoins.", { si: A }),
    o("Qu'est-ce qu'Inès a dit ?", "directive", 2, "Elle a dit « ça va ? », et elle m'a fait un câlin.", "Question directive sur une personne citée par l'enfant : bien.", { si: { faits: ["temoin"] } }),
    o("Tu as reparlé à Kévin après ?", "choix", 1, "Non. Je voulais plus lui parler.", "Question utile sur la suite.", { si: A }),
    o("Il était comment avec toi avant ce jour-là ?", "directive", 0, "Normal. Il était gentil, des fois.", "Le comportement habituel éclaire le contexte, mais invite au jugement.", { si: A }),
    o("Tu as eu peur ?", "choix", -1, { texte: "…Oui.", expression: "triste" },
      "Question fermée qui suggère l'émotion ; demandez plutôt « Comment tu t'es sentie ? ».", { si: A, faits: ["c_peur"] }),
    o("À quoi tu pensais à ce moment-là ?", "directive", 2, "Je pensais à mon dessin. Et que ça faisait mal.", "Question ouverte sur le vécu de l'enfant : bien.", { si: A }),
    o("Tu as dit quoi à maman en rentrant ?", "directive", 1, { texte: "Rien. Le soir, j'ai dit que je m'étais cognée.", expression: "triste" },
      "Question utile sur la révélation à la mère.", { si: A, faits: ["cognee"] }),
    o("Pourquoi tu as dit que tu t'étais cognée ?", "directive", 0, { texte: "Parce que… j'avais peur qu'il se fasse gronder. Et moi aussi.", expression: "triste" },
      "« Pourquoi » peut culpabiliser ; « Parle-moi de ça » obtient la même chose plus doucement.", { si: { faits: ["cognee"] }, faits: ["peur_gronder"] }),
    o("Est-ce que quelqu'un t'a demandé de ne rien dire ?", "choix", 1, "Non. Personne.", "Question utile sur d'éventuelles pressions, bien placée après le récit libre.", { si: A }),
    o("Kévin a vu que tu avais mal ?", "choix", 0, "…Je sais pas. Je lui ai dit.", "Question sur l'état d'esprit de l'adulte : l'enfant ne peut que supposer.", { si: A, faits: ["insistance"] }),
    o("Il s'est passé autre chose au centre ce jour-là ?", "invitation", 2, "Non. Après on a fait le goûter, mais moi j'avais plus faim.", "Invitation ouverte de fin de récit : bien.", { si: A })
  );

  /* ───────────── CLÔTURE ───────────── */
  P.cloture.push(
    o("Tu veux dire au revoir à la caméra ?", "consigne", 1, { texte: "Au revoir la caméra !", expression: "detendu" }, "Petite touche ludique en fin d'audition : sans risque."),
    o("Tu as été d'une grande aide.", "soutien", 1, "…Merci.", "Remerciement pour l'effort : bien."),
    o("On va retrouver maman ?", "consigne", 1, { texte: "Oui !", expression: "detendu" }, "Fin simple et concrète.", { si: { noeuds: ["cloture_neutre"] }, suivant: "fin" }),
    o("Tu reviendras me montrer tes dessins ?", "choix", 0, "…D'accord.", "Ne créez pas d'attente d'une nouvelle rencontre."),
    o("Tu veux emporter un dessin de la salle ?", "consigne", 1, { texte: "Oui !", expression: "detendu" }, "Petite attention de fin : sans risque."),
    o("Je vais parler un peu avec ta maman, tu attendras à côté ?", "consigne", 1, "D'accord.", "Information honnête sur la suite."),
    o("Tu as bien fait de venir.", "soutien", 0, "…", "Valide le motif de la venue ; remerciez plutôt pour l'effort."),
    o("Qu'est-ce que tu vas raconter à Hugo ?", "directive", 0, "…Je sais pas.", "Vous orientez l'enfant vers un récit à faire à ses proches : à éviter."),
    o("Tu peux garder tout ça pour toi, d'accord ?", "inadaptee", -2, { texte: "…D'accord.", expression: "inquiet" },
      "Demander le secret est à proscrire : l'enfant doit pouvoir en parler à ses proches de confiance.", { effets: { stress: 1 } }),
    o("Ça t'a fait du bien de parler ?", "choix", 0, "…Un peu.", "Question qui attend une réponse positive."),
    o("Tu as une dernière chose à me dire ?", "invitation", 2, "Non, c'est tout.", "Dernière invitation ouverte : bien.")
  );
})();

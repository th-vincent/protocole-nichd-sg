/*
 * Petit LLM local (llama.cpp + Qwen2.5 1,5B, démarré par outils/lancer.py) : en SAISIE LIBRE, il formule
 * la réplique de l'enfant avec ses mots, en réponse à la phrase exacte tapée par l'enquêteur.
 *
 * Partage des rôles :
 *   - le MOTEUR décide de CE QUE l'enfant dit : faits révélés, contamination, stress, note et retour NICHD ;
 *   - le LLM décide seulement de COMMENT il le dit (reformulation fidèle).
 *   - Dans les phases neutres (présentation, règles, rapport, souvenirs, clôture), quand le scénario n'a pas
 *     de réponse prévue, il peut improviser sur la vie quotidienne de l'enfant (saisieLibre.personnage).
 * Garde-fou : une réplique qui ajoute des informations, perd l'essentiel de la réponse prévue ou touche aux
 * faits de l'enquête est rejetée, et l'on garde la réplique écrite du scénario. Idem si le LLM est lent ou absent.
 */
window.LLM = (() => {
  const DELAI = 20000;   // au-delà, on garde la réplique du scénario
  const llm = { etat: "inconnu", modele: "", surChangement: null };

  const changer = (etat, modele) => {
    llm.etat = etat;
    if (modele) llm.modele = modele;
    if (llm.surChangement) llm.surChangement(etat);
  };

  llm.pret = () => llm.etat === "pret";

  // Le lanceur (outils/lancer.py) expose /llm/etat ; ouverte autrement, la page n'a pas de LLM.
  llm.verifier = async () => {
    if (!location.protocol.startsWith("http")) return changer("absent");
    try {
      const r = await fetch("/llm/etat", { cache: "no-store" });
      if (!r.ok) return changer("absent");
      const j = await r.json();
      changer(j.etat, j.modele);
      if (j.etat === "chargement") setTimeout(llm.verifier, 2000);
    } catch { changer("absent"); }
  };

  const REGLES = "Tu réponds comme une enfant qui parle : une ou deux phrases courtes, des mots simples, sans vouvoyer. "
    + "Tu redis le contenu donné avec tes mots, en répondant à la phrase de la gendarme. Tu n'ajoutes aucune information.";

  // Exemples de bonnes reformulations : un petit modèle imite bien mieux qu'il n'obéit.
  const EXEMPLES = [
    ["La gendarme dit : « Il a quel âge, ton frère ? »\nCe que tu réponds : « Dix ans. Il est en CM2. »", "Hugo ? Il a dix ans. Il est en CM2."],
    ["La gendarme dit : « Il criait ou il rigolait ? »\nCe que tu réponds : « En colère. »", "Il criait. Il était en colère."],
    ["La gendarme dit : « Tu peux me relater les circonstances ? »\nCe que tu réponds : « Je comprends pas… »", "Je comprends pas ce que ça veut dire…"],
    ["(Tu es très mal à l'aise, tu parles tout bas.)\nLa gendarme dit : « Raconte-moi tout. »\nCe que tu réponds : « Mercredi… au centre. »", "…Mercredi… Au centre."],
    ["La gendarme dit : « Tu as un vélo de quelle couleur ? »\nCe que tu réponds : réponds avec ta vie de tous les jours, en une phrase. Si tu ne sais pas, dis-le.", "Il est bleu. Avec des autocollants."]
  ];

  const consigne = ({ question, contenu, libre, stress }) =>
    (stress >= 7 ? "(Tu es très mal à l'aise, tu parles tout bas.)\n" : "")
    + `La gendarme dit : « ${question} »\nCe que tu réponds : `
    + (libre ? "réponds avec ta vie de tous les jours, en une phrase. Si tu ne sais pas, dis-le." : `« ${contenu} »`);

  // Mots d'enfant toujours permis dans une reformulation
  const PERMIS = "euh bah ben oui non ouais voilà alors après aussi très trop vraiment bien d'accord ah oh hein beaucoup peu sais comprends dire veux quoi fois";

  function garde(sortie, { question, contenu, libre, personnage, sensibles, fidelite = 0.6 }) {
    const C = window.ClassifieurNICHD;
    if (!sortie || sortie.length > 280 || /\bvous\b|madame|monsieur|gendarme/i.test(sortie)) return false;
    // un sujet de l'enquête (nom, lieu, geste…) absent du contenu prévu : refusé
    if (sensibles) {
      const re = new RegExp(sensibles);
      if (re.test(C.norm(sortie)) && !re.test(C.norm(contenu))) return false;
    }
    const autorises = new Set([...C.tokens(contenu), ...C.tokens(question), ...C.tokens(PERMIS), ...(libre ? C.tokens(personnage || "") : [])]);
    const mots = C.tokens(sortie);
    const nouveaux = mots.filter((t) => t.length > 3 && !autorises.has(t));
    if (nouveaux.length > (libre ? 3 : 1)) return false;
    if (!libre) {
      // l'essentiel du contenu prévu doit être conservé (sinon un fait « recueilli » ne serait pas dit)
      const cles = C.tokens(contenu).filter((t) => t.length > 3);
      if (cles.length && cles.filter((t) => mots.includes(t)).length / cles.length < fidelite) return false;
    }
    return true;
  }

  const nettoyer = (t) => String(t || "").split("\n")[0]
    .replace(/^\s*(léa|noah|l'enfant|enfant)\s*:\s*/i, "").replace(/^[«"“\s]+|[»"”\s]+$/g, "").trim();

  // Renvoie la réplique reformulée, ou null (on garde alors celle du scénario).
  llm.reformuler = async (demande) => {
    if (!llm.pret()) return null;
    const { prenom, age, personnage } = demande;
    const systeme = `Tu es ${prenom}, ${age}. Tu parles à une gendarme dans une salle d'audition pour enfants.\n${personnage || ""}\n\n${REGLES}`;
    const messages = [{ role: "system", content: systeme }];
    for (const [q, r] of EXEMPLES) messages.push({ role: "user", content: q }, { role: "assistant", content: r });
    messages.push({ role: "user", content: consigne(demande) });
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), DELAI);
    try {
      const r = await fetch("/llm/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({ messages, temperature: 0.2, max_tokens: 70, stop: ["\n\n"], chat_template_kwargs: { enable_thinking: false } })
      });
      if (!r.ok) return null;
      const texte = nettoyer((await r.json()).choices[0].message.content);
      return garde(texte, demande) ? texte : null;
    } catch {
      return null;
    } finally {
      clearTimeout(minuteur);
    }
  };

  llm.garde = garde;   // exposé pour les tests
  return llm;
})();

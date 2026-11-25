/*
 * Petit LLM local (llama.cpp + Qwen2.5 1,5B, démarré par outils/lancer.py) : en SAISIE LIBRE, il JOUE l'enfant.
 * Ses réponses sont générées librement à partir de :
 *   - sa fiche (saisieLibre.personnage) et ce qu'il a vécu (saisieLibre.histoire) ;
 *   - l'historique de la conversation ;
 *   - une consigne du tour donnée par le moteur : état (stress, confiance), comportement voulu par l'arbre
 *     (« tu ne comprends pas », « tu acquiesces », « tu n'oses pas en parler »…) et les passages de son histoire
 *     utiles pour répondre. Aucune formulation du scénario ne lui est imposée.
 * Le moteur garde la main sur la pédagogie : phases, note, retour NICHD, contaminations, faits détectés dans la réponse.
 * Garde-fou : une réponse hors personnage (vouvoiement, consigne recopiée…), qui affirme un fait faux non suggéré
 * ou qui aborde les faits trop tôt est régénérée une fois ; si elle échoue encore, l'enfant se tait (« … »).
 * Aucune réplique écrite du scénario n'est jamais substituée en silence. Sans LLM, la saisie libre attend le LLM
 * (ou, sur choix explicite du joueur, utilise les réponses écrites) ; le QCM fonctionne comme avant.
 */
window.LLM = (() => {
  const DELAI = 60000;   // le premier tour peut être lent sur un PC chargé
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
      else if (j.etat === "pret") setTimeout(llm.verifier, 15000);   // détecte un LLM qui s'arrête en cours de partie
    } catch { changer("absent"); }
  };

  const systeme = ({ prenom, age, feminin, personnage, histoire }) =>
    `Tu joues ${prenom}, ${feminin ? "une petite fille" : "un petit garçon"} de ${age}, ${feminin ? "entendue" : "entendu"} par une gendarme dans une salle d'audition pour enfants. `
    + `Tu es ${feminin ? "une vraie enfant" : "un vrai enfant"}, pas une IA.\n\n`
    + `TA VIE : ${personnage || ""}\n\n`
    + `CE QUI T'EST ARRIVÉ — tes souvenirs (tu ne les racontes que si on te demande pourquoi tu es là ou ce qui s'est passé) :\n${histoire || ""}\n\n`
    + "COMMENT TU PARLES : comme un enfant de ton âge, à l'oral, une ou deux phrases courtes, des mots simples. "
    + "Tu tutoies la gendarme. Tu n'inventes rien qui ne soit pas dans ta vie ou dans ce qui t'est arrivé. "
    + "Si tu ne sais pas, tu dis « je sais pas ». Réponds seulement par ce que tu dis, sans guillemets.";

  // Exemples : un petit modèle imite bien mieux qu'il n'obéit (la consigne du tour est entre crochets)
  const EXEMPLES = [
    ["La gendarme : « Bonjour, je suis gendarme. »\n[Tu es timide.]", "…Bonjour."],
    ["La gendarme : « Tu as des animaux ? »\n[Tu es à l'aise. Réponds avec ta vie.]", "Non… mais je voudrais un chat !"],
    ["La gendarme : « Il s'appelle comment, le chat de ta voisine ? »\n[Tes souvenirs : « Le chat de la voisine s'appelle Mimi, il est tout gris. » Réponds avec tes mots.]", "Mimi ! Il est tout gris."],
    ["La gendarme : « Quelle est la nature exacte des faits ? »\n[Tu ne comprends pas.]", "Je comprends pas ce que ça veut dire…"],
    ["La gendarme : « Il t'a mordu, hein ? »\n[Tu es intimidé : tu dis oui même si ce n'est pas vrai.]", "…Oui."]
  ];

  const nettoyer = (t) => {
    let s = String(t || "").split("\n")[0].replace(/^\s*[\wÀ-ÿ'’-]{2,15}\s*:\s*/, "").replace(/^[«"“\s]+|[»"”\s]+$/g, "").trim();
    const m = s.match(/^([\s\S]*[.!?…])/);   // couper proprement à la dernière fin de phrase
    s = m ? m[1].trim() : s;
    s = (s.match(/[^.!?…]+[.!?…]+/g) || [s]).slice(0, 2).join(" ").trim();   // deux phrases au plus
    if ((s.match(/«/g) || []).length > (s.match(/»/g) || []).length) s += " »";   // guillemet resté ouvert
    return s;
  };

  // l'enfant qui dit son propre prénom (« Bonjour Léa. ») recopie la gendarme : on le retire, sauf s'il se présente
  const sansSonPrenom = (t, prenom) => {
    if (!t || !prenom || /appel|moi c.?est/i.test(t)) return t;
    const s = t.replace(new RegExp(`\\s*,?\\s*\\b${prenom}\\b\\s*,?`, "gi"), " ").replace(/\s+([.!?…,])/g, "$1").replace(/\s{2,}/g, " ").trim();
    return /[a-zà-ÿ]/i.test(s) ? s.replace(/^([…\s]*)(\p{Ll})/u, (_, a, b) => a + b.toUpperCase()) : t;
  };

  // Rejette ce qui sort du personnage ou invente un élément de l'enquête
  function valable(sortie, { question, piste, faux, sensibles, avantFaits, fidelite = 0 }) {
    const C = window.ClassifieurNICHD;
    if (!sortie || sortie.length < 1 || sortie.length > 320) return false;
    if (/\bvous\b|\bvotre\b|madame|monsieur|gendarme\s*:|consigne|idée de réponse|en tant qu|intelligence artificielle|\bIA\b/i.test(sortie)) return false;
    const n = C.norm(sortie), q = C.norm(question), p = C.norm(piste || "");
    if (C.similarite(sortie, question) > 0.8 && sortie.length > 25) return false;   // recopie la question
    // un fait FAUX (« il m'a frappée », « plusieurs fois »…) que la question n'a pas suggéré : inventé
    if (faux) {
      const re = new RegExp(faux);
      if (re.test(n) && !re.test(q)) return false;
    }
    // récit appuyé sur une piste : l'essentiel doit être conservé (un petit modèle peut inverser un fait :
    // « il me faisait mal » → « il m'amusait »)
    if (fidelite) {
      const cles = C.tokens(piste || "").filter((t) => t.length > 2), dits = C.tokens(sortie);
      if (cles.length >= 3 && cles.filter((t) => dits.includes(t)).length / cles.length < fidelite) return false;
    }
    // avant la transition, l'enfant n'aborde pas les faits de lui-même
    if (avantFaits && sensibles) {
      const re = new RegExp(sensibles);
      if (re.test(n) && !re.test(q) && !re.test(p)) return false;
    }
    return true;
  }

  async function generer(messages, temperature, max_tokens = 60) {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), DELAI);
    try {
      const r = await fetch("/llm/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({ messages, temperature, max_tokens, cache_prompt: true, stop: ["\n", "La gendarme"], chat_template_kwargs: { enable_thinking: false } })
      });
      if (!r.ok) return null;
      return nettoyer((await r.json()).choices[0].message.content);
    } catch {
      return null;
    } finally {
      clearTimeout(minuteur);
    }
  }

  const debut = (d) => {
    const messages = [{ role: "system", content: systeme(d) }];
    for (const [q, r] of EXEMPLES) messages.push({ role: "user", content: q }, { role: "assistant", content: r });
    return messages;
  };

  // Préchauffage : le serveur lit la fiche et les exemples une fois (préfixe gardé en cache)
  llm.prechauffer = (d) => { if (llm.pret()) generer([...debut(d), { role: "user", content: "La gendarme : « Bonjour. »" }], 0, 1); };

  // Fait parler l'enfant ; renvoie sa réplique, ou null (l'enfant se tait alors).
  llm.jouer = async (d) => {
    if (!llm.pret()) return null;
    const messages = debut(d);
    for (const [q, r] of d.historique || []) messages.push({ role: "user", content: `La gendarme : « ${q} »` }, { role: "assistant", content: r });
    messages.push({ role: "user", content: `La gendarme : « ${d.question} »\n[${d.consigne}]` });
    for (const temperature of [0.4, 0.8]) {
      const t = sansSonPrenom(await generer(messages, temperature), d.prenom);
      if (t && valable(t, d)) return t;
    }
    return null;
  };

  llm.valable = valable;   // exposé pour les tests
  return llm;
})();

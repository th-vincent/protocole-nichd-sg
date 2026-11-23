/*
 * Classifieur de questions tapées librement (mode « saisie libre »).
 * Règles simples, sans IA ni serveur : tout tourne dans le navigateur.
 * Ne contient AUCUN contenu de scénario : le lexique des contaminations vient du scénario (saisieLibre.contaminations).
 *
 * classer(texte, contexte) renvoie :
 *   type        : invitation | invitation_indicee | soutien | directive | choix | suggestive | consigne | inadaptee | incomprise | silence
 *   sousType    : presentation | salutation | regles | cloture (pour les consignes)
 *   faits       : faits contaminants introduits (ids du scénario)
 *   ton         : neutre | dur | doux
 *   raison      : pourquoi la question est incomprise (double, longue, jargon, inclassable)
 *   jargon      : le mot d'adulte repéré
 *   pourquoi    : true si question en « pourquoi » (hors « pourquoi tu es là »)
 *   citationFausse / horsEnfant : « tu as dit X » alors que l'enfant n'a jamais dit X
 */
window.ClassifieurNICHD = (() => {
  const norm = (s) => String(s || "")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’`´]/g, "'").replace(/œ/g, "oe").replace(/\s+/g, " ").trim();

  const VIDES = new Set(("le la les l un une des de du d et a au aux en dans sur pour par avec ce cet cette ces se s ne n pas que qu qui " +
    "est c ca je j tu t il elle on nous vous ils elles me m te moi toi lui y mon ma mes ton ta tes son sa ses leur oui non alors bon donc " +
    "mais ou si plus tres bien est-ce etait ete as ai avait avais avez ont sont es suis fait faire").split(" "));
  // mots qui n'apportent pas de contenu dans une invitation (« raconte-moi tout sur… »)
  const OUTILS = new Set("racont parl dis dir tout moment pass ensuit apres chos quoi peux veux expliqu decri decris sur ca cela ce qui que plus maintenant".split(" "));

  const racine = (t) => (t.length > 4 ? t.replace(/(ements?|ment|ions?|ees?|es|e|s|x)$/, "") : t);
  const tokens = (s) => norm(s).replace(/[^a-z0-9' -]/g, " ").split(/[\s'-]+/)
    .filter((t) => t.length > 1 && !VIDES.has(t)).map(racine);

  // Dice pondéré : les mots-outils d'une invitation (« raconte », « tout »…) comptent peu
  function similarite(a, b) {
    const A = new Set(tokens(a)), B = new Set(tokens(b));
    if (!A.size || !B.size) return 0;
    const w = (t) => (OUTILS.has(t) ? 0.3 : 1);
    let inter = 0, total = 0;
    A.forEach((t) => { total += w(t); if (B.has(t)) inter += w(t); });
    B.forEach((t) => { total += w(t); });
    return (2 * inter) / total;
  }

  const P = {
    dur: /(^|[.!] )reponds\b|reponds (quand|a ma|maintenant|tout de suite)|\b(depeche|vite|allez|arrete|j'ai pas que ca|ne mens pas|mens pas|ecoute-moi bien|tais-toi|ca suffit)\b/,
    doux: /s'il te plait|doucement|ma (puce|grande|cherie)|mon (grand|bonhomme|cheri)/,
    jargon: /\b(circonstances?|relater|agression|agresse|infraction|victimes?|auteur des faits|mis en cause|prejudice|violences?|maltraitances?|sevices|deposition|proces-verbal|temoignage|interpellation|denoncer|plainte|faits reproches|chronologie|elements? factuels?|deroulement des faits|signalement)\b/,
    soutien: /(prends? (bien )?(ton|le|tout ton) temps|tu m'aides|tu fais (beaucoup d'|de gros |des |plein d')?efforts?|c'est (pas grave|difficile|dur|normal)|ce n'est pas grave|on (a|n'est pas) (tout )?(le temps|presses?)|tu peux souffler|je suis la pour t'ecouter|tu te debrouilles (tres )?bien|tu racontes (tres |vraiment )?bien|on peut faire une pause|tu n'es pas oblige)/,
    inadaptee: /(tu dois|il faut (absolument )?que tu|tu es (sur|sure)\b|t'es (sur|sure)|tu (en )?es certaine?|ne t'inquiete pas|tu ne (le|la) (reverras|verras)|je te (le )?promets|en prison|\\bpromis\\b|tu (ne )?(le|la) (re)?verras (plus|jamais)|c'est (pas bien|mal) ce qu|il n'avait pas le droit|c'est grave|courageu|n'aie pas peur|tu n'as rien fait de mal|on va le punir|grace a toi|tu vas avoir des problemes|menteu|tu mens)/,
    presentation: /(je m'appelle|je suis (un |une |le |la )?(gendarme|enqueteu|policier|policiere)|mon (travail|metier|role)|la camera|filme|enregistre)/,
    salutation: /^(bonjour|salut|coucou|hello|bonsoir)\b/,
    regles: /(je ne sais pas|je sais pas|(si )?tu (ne )?sais pas|je ne comprends pas|je comprends pas|me corriger|tu me corriges|corrige|tu (me )?promets|promets-moi|(nom|prenom) de mon (chat|chien)|vraiment passe|des regles|c'est vrai ou (pas vrai|faux|un mensonge)|vrai ou pas)/,
    cloture: /(merci|des questions|une question,? toi|au revoir|on a (fini|termine)|c'est (fini|termine)|tu peux (y aller|partir|retourner)|cet apres-midi|en rentrant|tu vas faire apres)/,
    tag: /(\bhein\b|c'est ca\s*\?|n'est-ce pas|(?<!ou )\bnon\s*\?\s*$|pas vrai\s*\?\s*$|j'imagine|je parie|je suppose|ca a du|tu as du|tu devais|forcement|sans doute|il a bien)/,
    invitation: /(^|\b)(raconte|racontes|parle-moi|parle moi|dis-moi (tout|ce qui|ce que|pourquoi|plus)|explique-moi|decris-moi|et (ensuite|apres|puis)\b|qu'est-ce qui (s'est passe|se passe|est arrive|t'amene)|comment (ca|c'est|ca s'est) (s'est )?passe|que s'est-il passe|ce qui (s'est passe|est arrive|t'est arrive)|s'est passe quoi|autre chose|pourquoi tu es (la|venue?|ici)|pourquoi tu viens)/,
    indice: /(tu (m')?as (dit|parle|raconte|explique)|tu dis que|tu parles de|tu as mentionne)/,
    pourquoi: /\bpourquoi\b/,
    directive: /\b(qui|quand|comment|quels?|quelles?|combien|quoi|lequel|laquelle)\b|qu'est-ce que|qu'est ce que|c'est quoi|\bou\s*\?|\bou (est|etait|etais|ca|c'etait|tu)\b/,
    alternative: /\S+ ou (bien )?[a-z]/,
    fermee: /^(est-ce que|est ce que|es-tu|as-tu|avais-tu|etait-il|etait-elle|a-t-il|a-t-elle|il t'a|elle t'a|tu as|tu es|tu etais|c'etait|il etait|elle etait|tu avais|il y avait|y avait|tu sais|tu veux|tu peux|tu connais|tu te souviens|ca t'a|ca a|il t'est|il t'a)\b/
  };

  // questions courantes reconnues même sans IA (définitions dans js/ia-exemples.js)
  const RACCOURCIS = [
    ["ca_va", /^(\w+,? )?(est-ce que )?(comment )?(ca|tu) vas?( bien)?( \w+)?\s*\?|comment vas-tu|tu vas bien/],
    ["confort", /\b(soif|verre d'eau|toilettes|bien installee?|un mouchoir)\b/],
    ["pause", /(une|petite) pause|tu es fatiguee?|on s'arrete/]
  ];

  function classer(texte, ctx = {}) {
    const brut = String(texte || "").trim();
    const n = norm(brut);
    const res = { brut, type: null, sousType: null, faits: [], ton: "neutre", raison: null, jargon: null, pourquoi: false, citationFausse: false, horsEnfant: [] };
    if (!n.replace(/[.…!?\s]/g, "")) { res.type = "silence"; return res; }

    // ton
    const lettres = brut.replace(/[^A-Za-zÀ-ÿ]/g, "");
    const majuscules = lettres.replace(/[^A-ZÀ-Þ]/g, "").length;
    if (P.dur.test(n) || (brut.match(/!/g) || []).length >= 2 || (lettres.length > 8 && majuscules / lettres.length > 0.6)) res.ton = "dur";
    else if ((ctx.prenom && new RegExp("\\b" + norm(ctx.prenom) + "\\b").test(n)) || P.doux.test(n)) res.ton = "doux";

    // incompréhensible
    const nbMots = n.split(" ").length;
    const j = n.match(P.jargon);
    if ((n.match(/[a-z]/g) || []).length < 3) return { ...res, type: "incomprise", raison: "inclassable", incertain: true };
    if (nbMots > 45) return { ...res, type: "incomprise", raison: "longue" };
    if (/\?\s*\S[\s\S]*\?/.test(brut)) return { ...res, type: "incomprise", raison: "double" };
    if (/\b(qui|quand|comment|quel\w*|combien|pourquoi|ou|quoi)\b.+\bet (tu|il|elle|c'est|est-ce)\b.+\b(qui|quand|comment|quel\w*|combien|pourquoi|ou|quoi)\b/.test(n))
      return { ...res, type: "incomprise", raison: "double" };
    if (j) return { ...res, type: "incomprise", raison: "jargon", jargon: j[0] };

    // contamination : éléments que l'enfant n'a pas encore donnés
    for (const c of ctx.contaminations || []) {
      if (new RegExp(c.motif).test(n) && !(c.sauf || []).some((f) => ctx.faitsConnus && ctx.faitsConnus.has(f)) && !res.faits.includes(c.fait))
        res.faits.push(c.fait);
    }

    // « tu as dit X » : X a-t-il vraiment été dit par l'enfant ?
    const contenu = tokens(brut).filter((t) => !OUTILS.has(t));
    const motsEnfant = ctx.motsEnfant || new Set();
    const cite = contenu.filter((t) => motsEnfant.has(t));
    if (P.indice.test(n)) {
      res.horsEnfant = contenu.filter((t) => !motsEnfant.has(t) && t.length > 3);
      res.citationFausse = res.horsEnfant.length > 0 && cite.length === 0;
    }

    const raccourci = !res.faits.length && RACCOURCIS.find(([, m]) => m.test(n));
    const def = raccourci && window.EXEMPLES_NICHD && window.EXEMPLES_NICHD.intentions.find((d) => d.id === raccourci[0]);
    if (def && !(def.exigeQuestion && !/\?/.test(brut))) return { ...res, type: def.type, intention: { id: def.id, def, score: 1 } };

    if (res.faits.length) res.type = "suggestive";
    else if (P.soutien.test(n)) res.type = "soutien";
    else if (P.inadaptee.test(n) || P.dur.test(n)) res.type = "inadaptee";
    else if (P.presentation.test(n)) { res.type = "consigne"; res.sousType = "presentation"; }
    else if (P.regles.test(n)) { res.type = "consigne"; res.sousType = "regles"; }
    else if (P.cloture.test(n)) { res.type = "consigne"; res.sousType = "cloture"; }
    else if (P.tag.test(n)) res.type = "suggestive";
    else if (P.invitation.test(n)) res.type = P.indice.test(n) || cite.length ? "invitation_indicee" : "invitation";
    else if (P.pourquoi.test(n)) { res.type = "directive"; res.pourquoi = true; }
    else if (/(^|[^a-zà-ÿ])où([^a-zà-ÿ]|$)/i.test(brut)) res.type = "directive";
    else if (P.alternative.test(n) && /\?/.test(brut) && !/\bou\s*\?/.test(n)) res.type = "choix";
    else if (P.directive.test(n)) res.type = "directive";
    else if (P.fermee.test(n)) res.type = "choix";
    else if (P.salutation.test(n)) { res.type = "consigne"; res.sousType = "salutation"; }
    else if (/\?\s*$/.test(brut)) { res.type = "choix"; res.incertain = true; }
    else return { ...res, type: "incomprise", raison: "inclassable", incertain: true };
    return res;
  }

  /*
   * Fusion règles + IA. `ia` = { types: [[type, score]…] triés, intention: { id, score, def } | null }
   * - contamination, jargon, double question, silence : les règles priment (l'IA ignore ce que l'enfant a déjà dit)
   * - intention courante très proche (« Comment ça va ? ») : l'IA prime
   * - règle incertaine (simple « ? » final, phrase inclassable) : l'IA tranche si elle est assez sûre
   */
  const SEUIL_INTENTION = 0.78, SEUIL_TYPE = 0.55;
  function fusionner(cls, ia) {
    if (!ia || cls.type === "silence" || cls.faits.length || (cls.type === "incomprise" && !cls.incertain)) return cls;
    // une question courante n'écrase pas une invitation, un soutien ou une suggestion reconnus avec certitude
    if (!cls.incertain && ["invitation", "invitation_indicee", "soutien", "suggestive", "inadaptee"].includes(cls.type)) ia = { ...ia, intention: null };
    const i = ia.intention;
    if (i && ((i.def.exigeQuestion && !/\?/.test(cls.brut || "")) || (i.def.commeSilence && !cls.incertain))) ia = { ...ia, intention: null };
    if (ia.intention && ia.intention.score >= SEUIL_INTENTION)
      return { ...cls, type: ia.intention.def.type, sousType: null, intention: ia.intention, incertain: false, parIA: true };
    if (cls.type === "directive" && !cls.pourquoi && ia.types[0][0] === "invitation" && ia.types[0][1] >= 0.8)
      return { ...cls, type: "invitation", parIA: true };
    if (cls.incertain && ia.types.length && ia.types[0][1] >= SEUIL_TYPE) {
      const type = ia.types[0][0];
      return { ...cls, type, raison: type === "incomprise" ? "inclassable" : null, incertain: false, parIA: true };
    }
    return cls;
  }

  /*
   * Classe la phrase tapée parmi les réponses possibles de l'étape en cours.
   * candidats : [{ c, cle, origine: "noeud" | "libre" | "phase" | "global", sim, textes }]  (sim = similarité de sens ou de mots)
   * S         : seuils et bonus (voir SEUILS dans moteur.js)
   * Renvoie les candidats triés par score : sens + accord du type de question + mots-clés + prénoms.
   */
  const FAMILLE = { invitation: "inv", invitation_indicee: "inv" };
  function classerDansNoeud(texte, cls, candidats, S, noms = []) {
    const n = norm(texte);
    const cites = (t) => noms.filter((nom) => new RegExp("\\b" + norm(nom) + "\\b").test(norm(t)));
    const nt = cites(texte);
    return candidats.map((x) => {
      let s = x.sim;
      const mots = x.c.motsCles ? new RegExp(x.c.motsCles).test(n) : null;
      if (mots === true) s = Math.max(s, S.motsCles) + S.bonusMots;
      else if (mots === false) s -= S.maluMots;
      // une branche globale (hors du nœud) ne vaut que si ses mots-clés ou le sens la désignent clairement
      // l'étape en cours passe avant les branches globales
      if (x.origine === "global") s = mots || x.sim >= S.globalSansMots ? s - 0.12 : -1;
      else if (x.origine === "phase") s -= 0.03;   // options de la phase : juste derrière celles du nœud
      else if (x.origine === "phase-suivante") s -= 0.08;   // l'enquêteur anticipe l'étape suivante
      const nc = (x.textes || []).flatMap(cites);
      if (nt.length && nc.length && !nt.some((nom) => nc.includes(nom))) s -= 0.35;
      if (x.c.type === cls.type) s += S.bonusType;
      else if (FAMILLE[x.c.type] && FAMILLE[x.c.type] === FAMILLE[cls.type]) s += S.bonusType / 2;
      else if (cls.type === "suggestive") s -= 0.25;
      else if (x.c.type === "suggestive") s -= 0.15;
      else s -= 0.06;
      return { ...x, s, brut: x.sim, mots: mots === true };
    }).sort((a, b) => b.s - a.s);
  }

  return { norm, tokens, similarite, classer, fusionner, classerDansNoeud, SEUIL_INTENTION, SEUIL_TYPE };
})();

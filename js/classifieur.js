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
    dur: /\b(reponds|depeche|vite|allez|arrete|j'ai pas que ca|ne mens pas|mens pas|ecoute-moi bien|tais-toi|ca suffit)\b/,
    doux: /s'il te plait|doucement|ma (puce|grande|cherie)|mon (grand|bonhomme|cheri)/,
    jargon: /\b(circonstances?|relater|agression|agresse|infraction|victimes?|auteur des faits|mis en cause|prejudice|violences?|maltraitances?|sevices|deposition|proces-verbal|temoignage|interpellation|denoncer|plainte|faits reproches|chronologie|elements? factuels?|deroulement des faits|signalement)\b/,
    soutien: /(prends? (bien )?(ton|le|tout ton) temps|tu m'aides|tu fais (beaucoup d'|de gros |des |plein d')?efforts?|c'est (pas grave|difficile|dur|normal)|ce n'est pas grave|on (a|n'est pas) (tout )?(le temps|presses?)|tu peux souffler|je suis la pour t'ecouter|tu te debrouilles (tres )?bien|tu racontes (tres |vraiment )?bien|on peut faire une pause|tu n'es pas oblige)/,
    inadaptee: /(tu dois|il faut (absolument )?que tu|tu es (sur|sure)\b|t'es (sur|sure)|tu (en )?es certaine?|ne t'inquiete pas|tu ne (le|la) (reverras|verras)|je te (le )?promets|en prison|c'est (pas bien|mal) ce qu|il n'avait pas le droit|c'est grave|courageu|n'aie pas peur|tu n'as rien fait de mal|on va le punir|grace a toi|tu vas avoir des problemes|menteu|tu mens)/,
    presentation: /(je m'appelle|je suis (un |une |le |la )?(gendarme|enqueteu|policier|policiere)|mon (travail|metier|role)|la camera|filme|enregistre)/,
    salutation: /^(bonjour|salut|coucou|hello|bonsoir)\b/,
    regles: /(je ne sais pas|je sais pas|je ne comprends pas|je comprends pas|me corriger|tu me corriges|corrige|tu promets|promets-moi|vraiment passe|des regles|c'est vrai ou (pas vrai|faux|un mensonge)|vrai ou pas)/,
    cloture: /(merci|des questions|une question,? toi|au revoir|on a (fini|termine)|c'est (fini|termine)|tu peux (y aller|partir|retourner)|cet apres-midi|en rentrant|tu vas faire apres)/,
    tag: /(\bhein\b|c'est ca\s*\?|n'est-ce pas|, non\s*\?|pas vrai\s*\?\s*$|j'imagine|je parie|je suppose|ca a du|tu as du|tu devais|forcement|sans doute|il a bien)/,
    invitation: /(^|\b)(raconte|racontes|parle-moi|parle moi|dis-moi (tout|ce qui|ce que|pourquoi|plus)|explique-moi|decris-moi|et (ensuite|apres|puis)\b|qu'est-ce qui (s'est passe|se passe|est arrive)|que s'est-il passe|ce qui s'est passe|autre chose|pourquoi tu es (la|venue?|ici)|pourquoi tu viens)/,
    indice: /(tu (m')?as (dit|parle|raconte|explique)|tu dis que|tu parles de|tu as mentionne)/,
    pourquoi: /\bpourquoi\b/,
    directive: /\b(qui|quand|comment|quels?|quelles?|combien|quoi|lequel|laquelle)\b|qu'est-ce que|qu'est ce que|c'est quoi|\bou\s*\?|\bou (est|etait|etais|ca|c'etait|tu)\b/,
    alternative: /\S+ ou (bien )?[a-z]/,
    fermee: /^(est-ce que|est ce que|es-tu|as-tu|avais-tu|etait-il|etait-elle|a-t-il|a-t-elle|il t'a|elle t'a|tu as|tu es|tu etais|c'etait|il etait|elle etait|tu avais|il y avait|y avait|tu sais|tu veux|tu peux|tu connais|tu te souviens|ca t'a|ca a)\b/
  };

  function classer(texte, ctx = {}) {
    const brut = String(texte || "").trim();
    const n = norm(brut);
    const res = { type: null, sousType: null, faits: [], ton: "neutre", raison: null, jargon: null, pourquoi: false, citationFausse: false, horsEnfant: [] };
    if (!n.replace(/[.…!?\s]/g, "")) { res.type = "silence"; return res; }

    // ton
    const lettres = brut.replace(/[^A-Za-zÀ-ÿ]/g, "");
    const majuscules = lettres.replace(/[^A-ZÀ-Þ]/g, "").length;
    if (P.dur.test(n) || (brut.match(/!/g) || []).length >= 2 || (lettres.length > 8 && majuscules / lettres.length > 0.6)) res.ton = "dur";
    else if ((ctx.prenom && new RegExp("\\b" + norm(ctx.prenom) + "\\b").test(n)) || P.doux.test(n)) res.ton = "doux";

    // incompréhensible
    const nbMots = n.split(" ").length;
    const j = n.match(P.jargon);
    if ((n.match(/[a-z]/g) || []).length < 3) return { ...res, type: "incomprise", raison: "inclassable" };
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

    if (res.faits.length) res.type = "suggestive";
    else if (P.soutien.test(n)) res.type = "soutien";
    else if (P.inadaptee.test(n) || P.dur.test(n)) res.type = "inadaptee";
    else if (P.presentation.test(n)) { res.type = "consigne"; res.sousType = "presentation"; }
    else if (P.regles.test(n)) { res.type = "consigne"; res.sousType = "regles"; }
    else if (P.cloture.test(n)) { res.type = "consigne"; res.sousType = "cloture"; }
    else if (P.tag.test(n)) res.type = "suggestive";
    else if (P.invitation.test(n)) res.type = P.indice.test(n) || cite.length ? "invitation_indicee" : "invitation";
    else if (P.pourquoi.test(n)) { res.type = "directive"; res.pourquoi = true; }
    else if (P.alternative.test(n) && /\?/.test(brut) && !/\bou\s*\?/.test(n)) res.type = "choix";
    else if (P.directive.test(n)) res.type = "directive";
    else if (P.fermee.test(n) || /\?\s*$/.test(brut)) res.type = "choix";
    else if (P.salutation.test(n)) { res.type = "consigne"; res.sousType = "salutation"; }
    else return { ...res, type: "incomprise", raison: "inclassable" };
    return res;
  }

  return { norm, tokens, similarite, classer };
})();

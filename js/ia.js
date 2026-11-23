/*
 * Petite IA locale pour la saisie libre : un modèle d'embeddings multilingue qui tourne dans le navigateur
 * (transformers.js + Xenova/paraphrase-multilingual-MiniLM-L12-v2, ~120 Mo téléchargés une fois puis mis en cache).
 * Aucune clé, aucun serveur : rien de ce que tape l'enquêteur ne quitte la machine.
 *
 * Il sert à comparer le SENS des phrases :
 *   - analyser(texte) → { v, types: [[type, score]…], intention } à partir de window.EXEMPLES_NICHD
 *   - vecteurs(textes) → vecteurs normalisés (mis en cache), cos(a, b) → similarité de -1 à 1
 * Si le chargement échoue (hors ligne, navigateur trop ancien), le jeu reste jouable avec les règles seules.
 */
window.IA = (() => {
  const URL_LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6";
  const MODELE = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  const cache = new Map();
  let extracteur = null, banque = [], intentions = [], promesse = null;

  const ia = {
    etat: "inactif",          // inactif | chargement | pret | erreur
    progression: 0,           // 0–100 pendant le téléchargement
    surChangement: null,      // rappel (etat, progression) pour l'interface

    charger() {
      if (promesse) return promesse;
      changer("chargement", 0);
      promesse = (async () => {
        const { pipeline, env } = await import(URL_LIB);
        env.allowLocalModels = false;
        extracteur = await pipeline("feature-extraction", MODELE, {
          dtype: "q8",
          progress_callback: (e) => { if (e.status === "progress" && /\.onnx$/.test(e.file || "")) changer("chargement", Math.round(e.progress || 0)); }
        });
        const ex = window.EXEMPLES_NICHD;
        for (const [type, phrases] of Object.entries(ex.types)) (await ia.vecteurs(phrases)).forEach((v) => banque.push({ type, v }));
        for (const def of ex.intentions) (await ia.vecteurs(def.exemples)).forEach((v) => intentions.push({ def, v }));
        changer("pret", 100);
      })().catch((e) => { console.warn("IA indisponible, classement par règles :", e); changer("erreur", 0); });
      return promesse;
    },

    async vecteurs(textes) {
      const manquants = [...new Set(textes.filter((t) => !cache.has(t)))];
      for (let i = 0; i < manquants.length; i += 32) {
        const lot = manquants.slice(i, i + 32);
        const sortie = (await extracteur(lot, { pooling: "mean", normalize: true })).tolist();
        lot.forEach((t, k) => cache.set(t, sortie[k]));
      }
      return textes.map((t) => cache.get(t));
    },

    cos: (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; },

    async analyser(texte) {
      const [v] = await ia.vecteurs([texte]);
      const par = {};
      for (const b of banque) (par[b.type] ||= []).push(ia.cos(v, b.v));
      // score d'un type = moyenne de ses 2 exemples les plus proches
      const types = Object.entries(par)
        .map(([k, l]) => [k, l.sort((x, y) => y - x).slice(0, 2).reduce((s, x) => s + x, 0) / 2])
        .sort((x, y) => y[1] - x[1]);
      let intention = null;
      for (const x of intentions) { const s = ia.cos(v, x.v); if (!intention || s > intention.score) intention = { id: x.def.id, def: x.def, score: s }; }
      return { v, types, intention };
    }
  };

  function changer(etat, progression) {
    ia.etat = etat; ia.progression = progression;
    if (ia.surChangement) ia.surChangement(etat, progression);
  }
  return ia;
})();

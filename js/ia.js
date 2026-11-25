/*
 * Petite IA locale pour la saisie libre : un modèle d'embeddings multilingue qui tourne dans le navigateur
 * (transformers.js + Xenova/paraphrase-multilingual-MiniLM-L12-v2, ~120 Mo téléchargés une fois puis mis en cache).
 * Aucune clé, aucun serveur : rien de ce que tape l'enquêteur ne quitte la machine.
 * Installée sur le PC (python3 outils/telecharger-ia.py puis python3 outils/lancer.py), elle se charge
 * depuis le disque dès l'ouverture de la page ; sinon elle est téléchargée à la première utilisation.
 *
 * Il sert à comparer le SENS des phrases :
 *   - analyser(texte) → { v, types: [[type, score]…], intention } à partir de window.EXEMPLES_NICHD
 *   - vecteurs(textes) → vecteurs normalisés (mis en cache), cos(a, b) → similarité de -1 à 1
 * Si le chargement échoue (hors ligne, navigateur trop ancien), le jeu reste jouable avec les règles seules.
 */
window.IA = (() => {
  const URL_LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6";   // même version que outils/telecharger-ia.py
  const MODELE = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  const cache = new Map();
  // IA installée sur ce PC par outils/telecharger-ia.py (servie par outils/lancer.py)
  const BASE = new URL("./", location.href).href;
  const LOCAL_LIB = "vendor/transformers/", LOCAL_MODELES = "modeles/";
  const existe = async (chemin) => {
    if (!location.protocol.startsWith("http")) return false;   // file:// : le navigateur interdit de lire le disque
    try { return (await fetch(BASE + chemin, { method: "HEAD", cache: "no-store" })).ok; } catch { return false; }
  };
  let extracteur = null, banque = [], intentions = [], promesse = null, file = Promise.resolve();

  // Cache permanent (IndexedDB) : une phrase analysée une fois ne l'est plus jamais, même d'une partie à l'autre.
  let idb = null;
  const ouvrirIDB = () => new Promise((ok) => {
    try {
      const r = indexedDB.open("salle-melanie-ia", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("vecteurs");
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ok(null);
    } catch { ok(null); }
  });
  async function chargerCache() {
    idb = await ouvrirIDB();
    if (!idb) return;
    await new Promise((ok) => {
      try {
        const req = idb.transaction("vecteurs").objectStore("vecteurs").openCursor();
        req.onsuccess = () => {
          const c = req.result;
          if (!c) return ok();
          if (String(c.key).startsWith(MODELE + "|")) cache.set(String(c.key).slice(MODELE.length + 1), new Float32Array(c.value));
          c.continue();
        };
        req.onerror = () => ok();
      } catch { ok(); }
    });
  }
  const memoriser = (t, v) => {
    if (!idb) return;
    try { idb.transaction("vecteurs", "readwrite").objectStore("vecteurs").put(new Float32Array(v).buffer, MODELE + "|" + t); } catch { /* cache facultatif */ }
  };

  const ia = {
    etat: "inactif",          // inactif | chargement | pret | erreur
    local: null,              // true si l'IA est installée sur ce PC
    progression: 0,           // 0–100 pendant le téléchargement
    surChangement: null,      // rappel (etat, progression) pour l'interface

    async verifierLocal() {
      if (ia.local === null)
        ia.local = (await existe(LOCAL_LIB + "transformers.min.js")) && (await existe(`${LOCAL_MODELES}${MODELE}/onnx/model_quantized.onnx`));
      return ia.local;
    },

    charger() {
      if (promesse) return promesse;
      changer("chargement", 0);
      promesse = (async () => {
        await chargerCache();
        const local = await ia.verifierLocal();
        const { pipeline, env } = await import(local ? BASE + LOCAL_LIB + "transformers.min.js" : URL_LIB);
        if (local) {
          env.allowLocalModels = true;
          env.allowRemoteModels = false;
          env.localModelPath = BASE + LOCAL_MODELES;
          env.backends.onnx.wasm.wasmPaths = BASE + LOCAL_LIB;
        } else {
          env.allowLocalModels = false;
        }
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

    // les calculs passent l'un après l'autre (le moteur WebAssembly n'en traite qu'un à la fois)
    vecteurs(textes) {
      const calcul = async () => {
        const manquants = [...new Set(textes.filter((t) => !cache.has(t)))];
        for (let i = 0; i < manquants.length; i += 32) {
          const lot = manquants.slice(i, i + 32);
          const sortie = (await extracteur(lot, { pooling: "mean", normalize: true })).tolist();
          lot.forEach((t, k) => { cache.set(t, sortie[k]); memoriser(t, sortie[k]); });
        }
        return textes.map((t) => cache.get(t));
      };
      file = file.then(calcul, calcul);
      return file;
    },

    connu: (t) => cache.has(t),

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

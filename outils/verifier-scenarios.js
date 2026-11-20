// Vérifie la cohérence des scénarios : liens entre nœuds, faits, types, conditions, nœuds inatteignables.
// Usage : node outils/verifier-scenarios.js
const fs = require("fs");
const path = require("path");
global.window = {};
const dir = path.join(__dirname, "..", "scenarios");
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) require(path.join(dir, f));

// À garder synchronisé avec TYPES et PHASES dans js/moteur.js
const TYPES = ["invitation", "invitation_indicee", "soutien", "directive", "choix", "suggestive", "consigne", "silence", "inadaptee"];
const PHASES = ["introduction", "regles", "rapport", "memoire", "transition", "recit", "cloture"];
const CLES_SI = ["confiance_min", "confiance_max", "stress_min", "stress_max", "contamination_min", "contamination_max", "faits", "sans_faits", "marques", "sans_marques"];
const EXPRESSIONS = ["neutre", "detendu", "inquiet", "triste", "ferme"];
let erreurs = 0, avertissements = 0;
const err = (m) => { erreurs++; console.log("  ✗ " + m); };
const avert = (m) => { avertissements++; console.log("  ! " + m); };

for (const [cle, sc] of Object.entries(window.SCENARIOS)) {
  console.log(`Scénario « ${cle} »`);
  const N = sc.noeuds;
  if (!N[sc.depart]) err(`départ "${sc.depart}" introuvable`);
  if (!["f", "m"].includes(sc.genre)) avert(`genre absent ou invalide (attendu "f" ou "m")`);
  const marquesPosees = new Set();
  const marquesLues = [];
  const fait = (f, ou) => { if (!sc.faits[f]) err(`${ou} : fait inconnu "${f}"`); };
  const cibles = (s, id) => (s == null ? [id] : typeof s === "string" ? [s] : s.map((x) => x.vers));
  const si = (c, ou) => {
    if (!c) return;
    Object.keys(c).filter((k) => !CLES_SI.includes(k)).forEach((k) => err(`${ou} : condition inconnue "${k}"`));
    [...(c.faits || []), ...(c.sans_faits || [])].forEach((f) => fait(f, ou));
    [...(c.marques || []), ...(c.sans_marques || [])].forEach((m) => marquesLues.push([m, ou]));
  };
  const replique = (r, ou) => {
    if (r == null || typeof r === "string") return;
    (Array.isArray(r) ? r : [r]).forEach((v) => {
      if (typeof v === "string") return;
      si(v.si, ou);
      if (v.expression && !EXPRESSIONS.includes(v.expression)) err(`${ou} : expression inconnue "${v.expression}"`);
    });
  };
  // un choix (ou une réaction au silence) et ses variantes `selon`
  const choix = (c, ou, id, estSilence) => {
    if (!estSilence && !TYPES.includes(c.type)) err(`${ou} : type inconnu "${c.type}"`);
    if (!estSilence && !c.question) err(`${ou} : question manquante`);
    if (!c.feedback) err(`${ou} : feedback manquant`);
    if (c.qualite != null && ![-2, -1, 0, 1, 2].includes(c.qualite)) err(`${ou} : qualite doit valoir -2, -1, 0, 1 ou 2`);
    if (!estSilence && c.suivant == null && c.reponse == null) avert(`${ou} : ni suivant ni reponse (l'enfant répétera sa réplique)`);
    si(c.si, ou);
    [].concat(c.faits || []).forEach((f) => fait(f, ou));
    [].concat(c.marque || []).forEach((m) => marquesPosees.add(m));
    replique(c.reponse, ou);
    const t = cibles(c.suivant, id);
    (c.selon || []).forEach((v, k) => {
      si(v.si, `${ou}.selon[${k}]`);
      [].concat(v.faits || []).forEach((f) => fait(f, `${ou}.selon[${k}]`));
      if (v.suivant != null) t.push(...cibles(v.suivant, id));
    });
    t.forEach((x) => { if (!N[x]) err(`${ou} : nœud suivant "${x}" introuvable`); });
    return t;
  };

  const aretes = {};
  for (const [id, n] of Object.entries(N)) {
    aretes[id] = [];
    if (!PHASES.includes(n.phase)) err(`${id} : phase inconnue "${n.phase}"`);
    if (n.expression && !EXPRESSIONS.includes(n.expression)) err(`${id} : expression inconnue "${n.expression}"`);
    (n.faitsAuto || []).forEach((f) => fait(f, id));
    if (n.faitsAutoSi) { si(n.faitsAutoSi.si, id); n.faitsAutoSi.faits.forEach((f) => fait(f, id)); }
    replique(n.enfant, id);
    if (n.fin) continue;
    if (!(n.choix || []).length) { err(`${id} : ni choix ni fin`); continue; }
    n.choix.forEach((c, i) => aretes[id].push(...choix(c, `${id}[${i}]`, id, false)));
    if (n.silence) aretes[id].push(...choix(n.silence, `${id}.silence`, id, true));
    if (!aretes[id].some((x) => x !== id)) err(`${id} : aucun choix ne permet de quitter ce nœud`);
  }
  marquesLues.forEach(([m, ou]) => { if (!marquesPosees.has(m)) avert(`${ou} : la marque "${m}" n'est jamais posée`); });

  // atteignabilité
  const vus = new Set(), pile = [sc.depart];
  while (pile.length) {
    const id = pile.pop(); if (vus.has(id) || !N[id]) continue; vus.add(id);
    pile.push(...(aretes[id] || []));
  }
  Object.keys(N).filter((id) => !vus.has(id)).forEach((id) => err(`${id} : nœud jamais atteint`));
  if (![...vus].some((id) => N[id].fin)) err("aucune fin atteignable");
  const nbChoix = Object.values(N).reduce((s, n) => s + (n.choix || []).length, 0);
  console.log(`  ${Object.keys(N).length} nœuds, ${nbChoix} interventions, ${Object.keys(sc.faits).length} faits`);
}
console.log(erreurs ? `\n${erreurs} erreur(s), ${avertissements} avertissement(s)` : `\nTout est cohérent ✓${avertissements ? ` (${avertissements} avertissement(s))` : ""}`);
process.exit(erreurs ? 1 : 0);

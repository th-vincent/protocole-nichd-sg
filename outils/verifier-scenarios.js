// Vérifie la cohérence des scénarios : liens entre nœuds, faits, types, nœuds inatteignables.
// Usage : node outils/verifier-scenarios.js
const fs = require("fs");
const path = require("path");
global.window = {};
const dir = path.join(__dirname, "..", "scenarios");
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) require(path.join(dir, f));

const TYPES = ["invitation", "invitation_indicee", "directive", "choix", "suggestive", "consigne", "inadaptee"];
const PHASES = ["introduction", "regles", "rapport", "memoire", "transition", "recit", "cloture"];
let erreurs = 0;
const err = (m) => { erreurs++; console.log("  ✗ " + m); };

for (const [cle, sc] of Object.entries(window.SCENARIOS)) {
  console.log(`Scénario « ${cle} »`);
  const N = sc.noeuds;
  if (!N[sc.depart]) err(`départ "${sc.depart}" introuvable`);
  const cibles = (s) => (typeof s === "string" ? [s] : s.map((x) => x.vers));
  const fait = (f, ou) => { if (!sc.faits[f]) err(`${ou} : fait inconnu "${f}"`); };
  for (const [id, n] of Object.entries(N)) {
    if (!PHASES.includes(n.phase)) err(`${id} : phase inconnue "${n.phase}"`);
    (n.faitsAuto || []).forEach((f) => fait(f, id));
    if (n.faitsAutoSi) n.faitsAutoSi.faits.forEach((f) => fait(f, id));
    if (!n.fin && !(n.choix || []).length) err(`${id} : ni choix ni fin`);
    (n.choix || []).forEach((c, i) => {
      const ou = `${id}[${i}]`;
      if (!TYPES.includes(c.type)) err(`${ou} : type inconnu "${c.type}"`);
      if (!c.feedback) err(`${ou} : feedback manquant`);
      (c.faits || []).forEach((f) => fait(f, ou));
      cibles(c.suivant).forEach((t) => { if (!N[t]) err(`${ou} : nœud suivant "${t}" introuvable`); });
    });
  }
  // atteignabilité
  const vus = new Set(), pile = [sc.depart];
  while (pile.length) {
    const id = pile.pop(); if (vus.has(id) || !N[id]) continue; vus.add(id);
    (N[id].choix || []).forEach((c) => pile.push(...cibles(c.suivant)));
  }
  Object.keys(N).filter((id) => !vus.has(id)).forEach((id) => err(`${id} : nœud jamais atteint`));
  if (![...vus].some((id) => N[id].fin)) err("aucune fin atteignable");
  console.log(`  ${Object.keys(N).length} nœuds, ${Object.keys(sc.faits).length} faits`);
}
console.log(erreurs ? `\n${erreurs} erreur(s)` : "\nTout est cohérent ✓");
process.exit(erreurs ? 1 : 0);

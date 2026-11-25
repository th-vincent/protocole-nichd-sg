/*
 * Moteur de simulation d'audition NICHD.
 * Il ne contient AUCUN contenu de scénario : tout vient de window.SCENARIOS (dossier scenarios/).
 * Le format des scénarios est documenté en tête de scenarios/lea.js.
 */
{
  const PHASES = [
    { cle: "introduction", nom: "Introduction" },
    { cle: "regles", nom: "Règles de base" },
    { cle: "rapport", nom: "Rapport" },
    { cle: "memoire", nom: "Mémoire épisodique" },
    { cle: "transition", nom: "Transition" },
    { cle: "recit", nom: "Récit" },
    { cle: "cloture", nom: "Clôture" }
  ];

  // Types d'intervention.
  //   ouverte  : compte comme question ouverte dans les statistiques
  //   question : compte comme question (les consignes, soutiens et silences ne comptent pas)
  //   qualite  : note par défaut (-2 à 2), modifiable dans le scénario
  //   conseil  : rappel du protocole affiché dans le débrief
  const TYPES = {
    invitation:         { nom: "Invitation ouverte", court: "Ouverte", classe: "t-ouv", ouverte: true, question: true, qualite: 2,
      conseil: "L'invitation ouverte reste l'outil principal : « Raconte-moi tout… », « Et ensuite ? ». Elle mobilise la mémoire libre, la plus fiable." },
    invitation_indicee: { nom: "Invitation indicée", court: "Indicée", classe: "t-ind", ouverte: true, question: true, qualite: 2,
      conseil: "Reprenez uniquement des mots déjà prononcés par l'enfant : « Tu as parlé de [X]. Raconte-moi tout sur [X]. »" },
    soutien:            { nom: "Soutien non suggestif", court: "Soutien", classe: "t-sou", ouverte: false, question: false, qualite: 1,
      conseil: "Soutenez l'effort et reconnaissez la difficulté (« Tu m'aides beaucoup », « Prends ton temps »), sans évoquer les faits, sans promesse et sans remercier pour le contenu." },
    directive:          { nom: "Question directive", court: "Directive", classe: "t-dir", ouverte: false, question: true, qualite: 1,
      conseil: "Question directive seulement après le récit libre, sur un élément déjà évoqué par l'enfant, puis retour à une invitation : « … Raconte-moi tout sur ça » (appariement)." },
    choix:              { nom: "Question fermée / à choix", court: "Fermée", classe: "t-cho", ouverte: false, question: true, qualite: 0,
      conseil: "Question fermée en dernier recours : l'enfant choisit une option même si aucune ne convient. Transformez-la en invitation (« Parle-moi de… »)." },
    suggestive:         { nom: "Question suggestive", court: "Suggestive", classe: "t-sug", ouverte: false, question: true, qualite: -2,
      conseil: "N'introduisez jamais un élément que l'enfant n'a pas donné (personne, lieu, geste, émotion). Repartez de ses mots, ou d'une invitation générale." },
    consigne:           { nom: "Consigne / cadre", court: "Cadre", classe: "t-con", ouverte: false, question: false, qualite: 1,
      conseil: "Le cadre doit être simple, concret et sans pression : présentation, règles testées par un exemple, clôture apaisée." },
    silence:            { nom: "Silence", court: "Silence", classe: "t-sil", ouverte: false, question: false, qualite: 1,
      conseil: "Une pause de quelques secondes après une réponse laisse l'enfant compléter. Si le silence devient pesant, relancez par une invitation." },
    inadaptee:          { nom: "Propos inadapté", court: "Inadapté", classe: "t-ina", ouverte: false, question: false, qualite: -1,
      conseil: "Pas de promesse, de menace, de mise en doute, de jugement sur une personne, ni de remerciement pour le contenu." },
    incomprise:         { nom: "Question incomprise", court: "Incomprise", classe: "t-inc", ouverte: false, question: true, qualite: -1,
      conseil: "Une seule question à la fois, courte, avec des mots d'enfant. Évitez le vocabulaire juridique ou abstrait." }
  };
  const QUALITES = { "2": "Conforme", "1": "Acceptable", "0": "Discutable", "-1": "À éviter", "-2": "Grave" };

  // Indices : consignes générales par phase, de la plus vague à la plus précise (jamais la phrase toute faite)
  const INDICES = {
    introduction: ["Essayez de mettre {P} à l'aise.", "Présentez-vous : qui vous êtes et en quoi consiste votre travail.",
      "Pensez à expliquer simplement à quoi sert la caméra, sans parler de la raison de sa venue."],
    regles: ["Essayez d'introduire les consignes de base.", "{P} doit savoir qu'{il} peut dire « je ne sais pas », « je ne comprends pas », et vous corriger si vous vous trompez.",
      "Testez chaque règle par un petit exemple concret, puis demandez-{lui} de promettre de ne dire que ce qui s'est vraiment passé."],
    rapport: ["Essayez de mieux connaître {P} et de {le} mettre en confiance.", "Intéressez-vous à ce qu'{il} aime, avec des questions ouvertes (« Raconte-moi… »).",
      "Reprenez ses propres mots pour l'inviter à développer, plutôt que d'enchaîner les questions fermées."],
    memoire: ["Entraînez {P} à raconter un souvenir en détail.", "Choisissez un moment récent et neutre, et demandez-{lui} de tout raconter, du début à la fin.",
      "Relancez avec « Et ensuite ? », puis dites-{lui} que c'est exactement comme ça que vous avez besoin qu'{il} raconte."],
    transition: ["Amenez doucement le sujet de l'audition, sans rien suggérer.", "Laissez {P} dire {lui}-même pourquoi {il} est là.",
      "Si {il} ne se lance pas, évoquez seulement la personne à qui {il} a parlé, jamais ce qui s'est passé."],
    recit: ["Laissez {P} raconter avec ses mots.", "Relancez par des invitations ouvertes (« Et ensuite ? ») et reprenez ses mots pour approfondir.",
      "Explorez chaque détail qu'{il} a donné ; pensez aussi à demander si c'est arrivé une fois ou plusieurs, et qui a su en premier."],
    cloture: ["Préparez la fin de l'audition.", "Demandez s'il y a autre chose à ajouter, et si {P} a des questions.",
      "Remerciez-{le} pour ses efforts, puis terminez sur un sujet neutre."]
  };

  const SOUTIENS_DEFAUT = [
    "Prends ton temps. Tu fais beaucoup d'efforts, et ça m'aide vraiment.",
    "Je vois que c'est difficile. On a tout le temps, je suis là pour t'écouter.",
    "Tu peux souffler un peu. Tu m'aides beaucoup en me parlant."
  ];

  const OBSERVATIONS = {
    panique: ["{P} se recroqueville sur le canapé et ne vous regarde plus.", "{P} tremble un peu et serre les bras contre {lui}.", "{P} a les yeux qui brillent : {il} semble au bord des larmes."],
    agite:   ["{P} agite les jambes et se triture les doigts.", "{P} jette des coups d'œil vers la porte.", "{P} se tortille sur le canapé, mal à l'aise."],
    reserve: ["{P} reste sur la réserve, au bord du canapé.", "{P} parle du bout des lèvres, sans trop vous regarder.", "{P} vous observe, encore méfiant{e}."],
    neutre:  ["{P} vous écoute, assis{e} sagement.", "{P} vous regarde, attenti{ve}.", "{P} attend la suite, plutôt calme."],
    detendu: ["{P} est détendu{e} et balance les jambes.", "{P} vous regarde quand {il} parle, plus à l'aise.", "{P} sourit facilement maintenant."]
  };

  const $ = (s) => document.querySelector(s);
  const borne = (v) => Math.max(0, Math.min(10, v));
  const echap = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const melanger = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let sc = null, cle = null;
  let etat, noeudId, journal, faits, marques, utilises, soutiens, phasesVues;
  let silencesSuite = 0, stressMax = 0, dernierTexte = null, retour = null, frappe = null;
  let indiceNoeud = null, indiceNiveau = 0, nbIndices = 0;
  const options = { feedback: true, jauges: true, libre: false };
  const modeLibre = () => options.libre && !!sc.saisieLibre;

  /* ---------- textes accordés (« {P} est détendu{e} ») ---------- */
  function tpl(s) {
    if (s == null) return s;
    const f = sc.genre === "f";
    return String(s)
      .replace(/\{P\}/g, sc.prenom)
      .replace(/\{il\}/g, f ? "elle" : "il").replace(/\{Il\}/g, f ? "Elle" : "Il")
      .replace(/\{lui\}/g, f ? "elle" : "lui").replace(/\{le\}/g, f ? "la" : "le")
      .replace(/\{ve\}/g, f ? "ve" : "f").replace(/\{e\}/g, f ? "e" : "");
  }

  /* ---------- conditions ---------- */
  function verifie(si) {
    if (!si) return true;
    const e = etat;
    const dans = (v, min, max) => (min == null || v >= min) && (max == null || v <= max);
    return dans(e.confiance, si.confiance_min, si.confiance_max)
      && dans(e.stress, si.stress_min, si.stress_max)
      && dans(e.contamination, si.contamination_min, si.contamination_max)
      && (si.faits || []).every((f) => faits.has(f))
      && (si.sans_faits || []).every((f) => !faits.has(f))
      && (si.marques || []).every((m) => marques.has(m))
      && (si.sans_marques || []).every((m) => !marques.has(m))
      && (!si.noeuds || si.noeuds.includes(noeudId));
  }

  // Une réplique : "texte", { texte, expression, didascalie }, ou liste de variantes [{ si, texte, … }]
  function variante(v) {
    if (v == null) return null;
    if (typeof v === "string") return { texte: v };
    if (Array.isArray(v)) {
      const x = v.find((y) => verifie(y.si)) || v[v.length - 1];
      return typeof x === "string" ? { texte: x } : x;
    }
    return v;
  }

  function replique(n) {
    const v = variante(n.enfant) || { texte: "…" };
    return { texte: v.texte, expression: v.expression || n.expression, didascalie: v.didascalie || n.didascalie };
  }

  function resoudreSuivant(s) {
    if (s == null) return noeudId;
    if (typeof s === "string") return s;
    const v = s.find((x) => verifie(x.si)) || s[s.length - 1];
    return v.vers;
  }

  const agitation = () => (etat.stress >= 8 ? 3 : etat.stress >= 6 ? 2 : etat.stress >= 4 ? 1 : 0);

  function expressionDepuisEtat() {
    if (etat.stress >= 8) return "ferme";
    if (etat.stress >= 6) return "inquiet";
    if (etat.confiance >= 6 && etat.stress <= 4) return "detendu";
    if (etat.confiance <= 2) return "triste";
    return "neutre";
  }

  /* ---------- résolution d'un choix selon l'état de l'enfant ---------- */
  function resoudreChoix(c) {
    let r = { ...c };
    let specifique = false;
    if (c.selon) {
      const v = c.selon.find((x) => verifie(x.si));
      if (v) { r = { ...r, ...v }; specifique = true; }
    }
    delete r.selon;
    r.effets = { ...(r.effets || {}) };
    const noteImposee = r.qualite != null;
    r.qualite = r.qualite ?? TYPES[r.type].qualite;
    r.feedback = tpl(r.feedback || "");
    if (!specifique && !r.generique) ajusterSelonEtat(r, noteImposee);
    return r;
  }

  // Règles génériques : le stress et la confiance modifient l'effet et la pertinence d'une intervention.
  function ajusterSelonEtat(r, noteImposee) {
    const s = etat.stress;
    if (s >= 7 && (r.type === "directive" || r.type === "choix")) {
      r.effets.stress = (r.effets.stress || 0) + 1;
      r.qualite = Math.max(-2, r.qualite - 1);
      r.feedback += tpl(" {P} était très tendu{e} : enchaîner des questions précises augmente la pression. Il fallait d'abord ralentir (soutien, pause, sujet neutre).");
      r.mieux = r.mieux || "Je vois que c'est difficile. Prends ton temps, tu m'aides beaucoup.";
    } else if (s >= 7 && r.type === "suggestive") {
      r.effets.stress = (r.effets.stress || 0) + 1;
      r.feedback += " Sous stress, un enfant acquiesce encore plus facilement à ce qu'on lui suggère.";
    }
    // la note imposée par le scénario prime (ex. valoriser la manière de raconter, pas une réassurance)
    if (r.type === "soutien" && s <= 3 && !noteImposee) {
      r.qualite = Math.min(r.qualite, 0);
      r.feedback += tpl(" {P} était déjà détendu{e} : trop de réassurance peut laisser entendre que le sujet est grave.");
    }
    if (etat.confiance <= 2 && (r.type === "invitation" || r.type === "invitation_indicee")) {
      r.feedback += tpl(" La confiance de {P} est encore faible : sa réponse risque d'être courte.");
    }
  }

  function soutienGenerique() {
    const l = sc.soutiens || SOUTIENS_DEFAUT;
    return {
      question: l[journal.length % l.length], type: "soutien", generique: true, qualite: 2,
      effets: { stress: -2, confiance: 1 },
      feedback: "Propos de soutien non suggestif (protocole révisé) : vous reconnaissez l'effort et la difficulté sans évoquer les faits ni rien promettre. L'enfant souffle un peu, et pourra peut-être en dire davantage.",
      didascalieApres: "{P} prend une grande inspiration. Ses épaules se relâchent un peu."
    };
  }

  function choixSilence(n) {
    let base;
    if (silencesSuite >= 1) {
      base = { qualite: 0, effets: { stress: 1, confiance: -1 },
        reponse: { texte: "…", didascalie: "{P} regarde ses mains. Le silence s'installe et devient pesant." },
        feedback: "Deuxième silence d'affilée : l'enfant ne sait plus ce que vous attendez. Après une pause, relancez par une invitation (« Et ensuite ? », « Raconte-moi plus sur… »)." };
    } else if (etat.stress >= 7) {
      base = { qualite: 0, effets: { stress: 1 },
        reponse: { texte: "…", expression: "inquiet", didascalie: "{P} se tortille : le silence {le} met encore plus mal à l'aise." },
        feedback: "Face à un enfant très tendu, le silence ajoute de la pression. Un mot de soutien non suggestif aurait été plus adapté." };
    } else if (n.silence) {
      base = n.silence;
    } else if (["introduction", "regles", "cloture"].includes(n.phase)) {
      base = { qualite: 0, effets: { stress: 1 },
        reponse: { texte: "…", didascalie: "{P} vous regarde, en attendant que vous repreniez la parole." },
        feedback: "Dans cette phase, c'est à l'adulte de structurer l'échange : le silence laisse l'enfant dans l'incertitude." };
    } else {
      base = { qualite: 1, effets: {},
        reponse: { texte: "…", didascalie: "{P} réfléchit un instant, puis attend votre question." },
        feedback: "Une courte pause laisse le temps de réfléchir. Ici, l'enfant n'a rien ajouté : relancez par une invitation." };
    }
    return { ...base, type: "silence", question: null };
  }

  /* ---------- déroulé ---------- */
  function demarrer(c) {
    arreterFrappe();
    cle = c; sc = window.SCENARIOS[c];
    etat = { confiance: 3, stress: 4, contamination: 0, ...sc.etatInitial };
    journal = []; faits = new Set(); marques = new Set(); utilises = new Set(); soutiens = new Set(); phasesVues = new Set();
    silencesSuite = 0; stressMax = etat.stress; dernierTexte = null; retour = null; noeudId = null;
    indiceNoeud = null; indiceNiveau = 0; nbIndices = 0;
    document.body.classList.add("en-salle");
    $("#barre-haut").hidden = true;
    $("#ecran-accueil").hidden = true;
    $("#ecran-debrief").hidden = true;
    $("#ecran-jeu").hidden = false;
    $("#transcript").classList.remove("ouvert");
    appliquerApparence();
    $("#qui").textContent = sc.prenom;
    if (modeLibre() && window.IA) { window.IA.charger().then(prechauffer); }
    afficherEtatIA();
    majJauges();
    allerA(sc.depart);
  }

  function appliquerApparence() {
    const a = { peau: "#f2c6a0", peauOmbre: "#dfae88", cheveux: "#5a3825", pull: "#e8b13a", pullFonce: "#d69e28",
      pantalon: "#3b4a7a", chaussure: "#e8664f", coiffure: "couettes", accessoire: "", ...(sc.apparence || {}) };
    const svg = $("#enfant-svg");
    svg.dataset.coiffure = a.coiffure;
    svg.dataset.accessoire = a.accessoire;
    for (const [k, v] of Object.entries({ peau: a.peau, "peau-ombre": a.peauOmbre, cheveux: a.cheveux, pull: a.pull, "pull-fonce": a.pullFonce, pantalon: a.pantalon, chaussure: a.chaussure }))
      svg.style.setProperty("--" + k, v);
  }

  function ajouterFait(f) {
    if (!faits.has(f) && sc.faits[f] && !sc.faits[f].fiable) etat.contamination += 1;
    faits.add(f);
  }

  async function allerA(id, override, depuis) {
    const n = sc.noeuds[id];
    if (!n) { console.error("Nœud introuvable :", id); return; }
    const meme = id === noeudId && !!depuis;
    noeudId = id;
    phasesVues.add(n.phase);

    let r;
    if (override) {
      r = { texte: override.texte, expression: override.expression, didascalie: override.didascalie };
    } else {
      // l'enfant ne livre les faits du nœud que s'il prononce vraiment la réplique du nœud
      (n.faitsAuto || []).forEach(ajouterFait);
      if (n.faitsAutoSi && verifie(n.faitsAutoSi.si)) n.faitsAutoSi.faits.forEach(ajouterFait);
      r = replique(n);
      if (meme && tpl(r.texte) === dernierTexte) r = { texte: "…" };
    }
    if (!r.didascalie && depuis && depuis.didascalieApres) r.didascalie = depuis.didascalieApres;
    r.texte = tpl(r.texte ?? "…");
    r.didascalie = tpl(r.didascalie || "");
    if (!r.expression) r.expression = expressionDepuisEtat();
    if (llmUtile(r, depuis)) await reformulerParLLM(r, n, depuis);   // le QCM reste strictement immédiat
    dernierTexte = r.texte;

    const dernier = journal[journal.length - 1];
    if (dernier && dernier.type && dernier.enfant == null) { dernier.enfant = r.texte; dernier.didascalie = r.didascalie; dernier.genere = !!r.genere; }
    else journal.push({ noeud: id, phase: n.phase, question: null, enfant: r.texte, didascalie: r.didascalie });

    afficherScene(n, r);
  }

  // Saisie libre + LLM prêt : l'enfant formule la réplique prévue avec ses mots, en réponse à la phrase tapée.
  // Le moteur a déjà décidé du contenu (faits, stress, note) ; si le LLM échoue ou dérape, la réplique écrite reste.
  // improvisation sur la vie quotidienne permise seulement là où rien ne touche aux faits ni aux tests de règles
  const PHASES_NEUTRES = ["introduction", "rapport", "memoire", "cloture"];
  const llmUtile = (r, depuis) => !!(depuis && depuis.__libre && window.LLM && window.LLM.pret()
    && depuis.type !== "silence" && r.texte.replace(/[.…\s]/g, ""));
  async function reformulerParLLM(r, n, depuis) {
    const L = depuis.__libre;
    const sl = sc.saisieLibre;
    const improviser = L.generique && PHASES_NEUTRES.includes(n.phase)
      && ["directive", "choix", "invitation", "invitation_indicee", "consigne"].includes(L.type) && r.texte.length < 30;
    reflexion(true);
    const t = await window.LLM.reformuler({
      question: L.texte, contenu: r.texte, libre: improviser, stress: etat.stress,
      // transition et récit : la réplique porte des faits, la reformulation doit presque tout garder
      fidelite: ["transition", "recit"].includes(n.phase) ? 0.9 : 0.6,
      prenom: sc.prenom, age: String(sc.age || "").split("·")[0].trim(), personnage: sl.personnage, sensibles: sl.sensibles
    });
    reflexion(false);
    if (t) { r.texte = t; r.genere = true; }
  }

  function reflexion(oui) {
    $(".console").classList.toggle("occupee", oui);
    $("#attente").hidden = !oui;
    $("#attente").innerHTML = oui ? `${echap(sc.prenom)} réfléchit… <span>(réponse formulée par le petit LLM)</span>` : "L'enfant parle… <span>(cliquez sur la bulle ou appuyez sur Espace pour afficher toute sa réponse)</span>";
    if (oui) { $("#zone-choix").innerHTML = ""; $("#retour").hidden = true; $("#bulle-texte").textContent = "…"; }
  }

  function choisir(c0, cleChoix, libre) {
    if (frappe) return;
    const saut = libre && libre.saut && libre.saut !== noeudId ? sauterVers(libre.saut) : null;
    const n = sc.noeuds[noeudId];
    const c = resoudreChoix(c0);
    if (libre) appliquerLibre(c, libre);
    if (saut) {
      // étape réellement atteinte : celle de la proposition, ou celle où elle mène
      const arrivee = sc.noeuds[resoudreSuivant(c.suivant)] || n;
      saut.vers = arrivee.phase;
      saut.sautees = ORDRE.slice(saut.de + 1, ORDRE.indexOf(arrivee.phase)).filter((p) => !phasesVues.has(p));
    }
    if (saut && saut.sautees.length) {
      c.feedback = `⚠ Vous êtes passé(e) directement à l'étape « ${nomPhase(saut.vers)} » en sautant : ${saut.sautees.map(nomPhase).join(", ")}. `
        + `Or ${saut.sautees.map((p) => RAISONS[p]).filter(Boolean).join(" ; ")}. L'audition reprend à partir de cette étape. ` + c.feedback;
      c.qualite = Math.min(c.qualite, saut.sautees.some((p) => ["regles", "rapport", "transition"].includes(p)) ? 0 : 1);
    }
    const avant = { confiance: etat.confiance, stress: etat.stress };
    for (const k of ["confiance", "stress"]) etat[k] = borne(etat[k] + (c.effets[k] || 0));
    [].concat(c.faits || []).forEach(ajouterFait);
    [].concat(c.marque || []).forEach((m) => marques.add(m));
    if (cleChoix != null) utilises.add(cleUtilisee(cleChoix));
    if (c.type === "soutien") soutiens.add(noeudId);
    silencesSuite = c.type === "silence" ? silencesSuite + 1 : 0;
    stressMax = Math.max(stressMax, etat.stress);
    const delta = { confiance: etat.confiance - avant.confiance, stress: etat.stress - avant.stress };

    retour = {
      noeud: noeudId, phase: n.phase, question: c.question ? tpl(c.question) : null, type: c.type,
      qualite: c.qualite, feedback: c.feedback, mieux: c.mieux ? tpl(c.mieux) : null, enfant: null, didascalie: null, delta,
      interpretation: libre ? interpretationTexte(c, libre) : null,
      saut: saut && saut.sautees.length ? saut.sautees.map(nomPhase) : null
    };
    journal.push(retour);
    majJauges(delta);
    reagir(delta);
    allerA(resoudreSuivant(c.suivant), variante(c.reponse), c);
  }

  /* ---------- saisie libre : interpréter une question tapée ---------- */
  const CL = () => window.ClassifieurNICHD;
  const iaPrete = () => window.IA && window.IA.etat === "pret";

  // Seuils de rapprochement : similarité de sens (IA) ou recouvrement de mots (règles, si l'IA est indisponible)
  const SEUILS = {
    ia:     { exact: 0.9, proche: 0.6, saut: 0.66, sautBrut: 0.72, globalSansMots: 0.8, bonusType: 0.1, motsCles: 0.75, bonusMots: 0.1, maluMots: 0.05 },
    regles: { exact: 0.8, proche: 0.5, saut: 0.55, sautBrut: 0.45, globalSansMots: 9, bonusType: 0.12, motsCles: 0.6, bonusMots: 0.2, maluMots: 0.15 }
  };
  // une option est reconnue par sa question, ses `exemples` et ses reformulations (scenarios/lea.reformulations.js)
  const textesDe = (c) => [tpl(c.question || ""), ...(c.exemples || []),
    ...((sc.saisieLibre && sc.saisieLibre.reformulations || {})[c.question] || [])].filter(Boolean);

  // similarité brute entre la phrase tapée et une proposition (sa question et ses éventuels `exemples`)
  async function similarites(candidats, texte, v) {
    if (!v) return candidats.map(({ c }) => Math.max(...textesDe(c).map((t) => CL().similarite(texte, t))));
    const tous = [...new Set(candidats.flatMap(({ c }) => textesDe(c)))];
    const vecs = new Map((await window.IA.vecteurs(tous)).map((x, i) => [tous[i], x]));
    return candidats.map(({ c }) => Math.max(...textesDe(c).map((t) => window.IA.cos(v, vecs.get(t)))));
  }

  async function similaritesTextes(textes, texte, v) {
    if (!v) return textes.map((t) => CL().similarite(texte, t));
    return (await window.IA.vecteurs(textes)).map((x) => window.IA.cos(v, x));
  }

  // une proposition ne peut ni « absorber » des éléments contaminants tapés qu'elle n'introduit pas,
  // ni en introduire que l'enquêteur n'a pas tapés
  const contaminants = (c) => [].concat(c.faits || []).filter((f) => sc.faits[f] && !sc.faits[f].fiable);
  const compatible = (c, cls) =>
    (c.type === "suggestive" || cls.faits.every((f) => [].concat(c.faits || []).includes(f)))
    && contaminants(c).every((f) => cls.faits.includes(f));

  // Toutes les réponses possibles de l'étape : propositions du nœud, branches « libre » du nœud,
  // options de la phase (saisieLibre.parPhase, ex. scenarios/lea.libre.js), branches globales de la phase.
  function candidatsDuNoeud(n, cls) {
    // options de la phase suivante : l'enquêteur anticipe (ex. une question de rapport pendant les règles) ;
    // elles mènent à l'étape d'entrée de cette phase (saisieLibre.entrees)
    const ordre = PHASES.map((p) => p.cle), suivante = ordre[ordre.indexOf(n.phase) + 1];
    const entree = (sc.saisieLibre.entrees || {})[suivante];
    const anticipees = entree ? ((sc.saisieLibre.parPhase || {})[suivante] || [])
      .map((c, i) => ({ c: c.suivant == null ? { ...c, suivant: entree } : c, cle: "P" + suivante + i, origine: "phase-suivante" }))
      .filter(({ c }) => !(c.si && c.si.noeuds)) : [];
    return [
      ...anticipees,
      ...n.choix.map((c, i) => ({ c, cle: i, origine: "noeud" })),
      ...(n.libre || []).map((c, i) => ({ c, cle: "L" + i, origine: "libre" })),
      ...((sc.saisieLibre.parPhase || {})[n.phase] || []).map((c, i) => ({ c, cle: "P" + n.phase + i, origine: "phase" })),
      ...(sc.saisieLibre.globaux || []).map((c, i) => ({ c, cle: "G" + i, origine: "global" })).filter(({ c }) => !c.phases || c.phases.includes(n.phase))
    ].filter(({ c }) => verifie(c.si) && (!c.typesLibres || c.typesLibres.includes(cls.type)));
  }

  /* ---------- saut d'étapes : la question correspond à une étape plus loin dans le protocole ---------- */
  const ORDRE = PHASES.map((p) => p.cle);
  const verifieA = (si, id) => { const ici = noeudId; noeudId = id; try { return verifie(si); } finally { noeudId = ici; } };
  // mots porteurs de sens (« anniversaire », « chien »…) : une relance sans contenu (« Et après ? ») ne fait jamais sauter
  const VIDES_SAUT = /^(racont|parl|ensuit|apres|pass|tout|chos|dir|dis|quoi|moment|debut|fin|plus|maintenant|veu|peu|bien|alor)/;
  const contenu = (t) => CL().tokens(t).filter((w) => w.length > 3 && !VIDES_SAUT.test(w));

  // Toutes les réponses des étapes PLUS LOIN que l'étape en cours, avec deux limites :
  //  - jamais vers le récit des faits (il ne commence que lorsque l'enfant révèle lui-même) ;
  //  - dans la transition, seulement son étape d'entrée : les autres (enfant bloquée, réponse à une
  //    suggestion…) n'ont de sens que dans leur contexte.
  const cibles = (s) => (s == null ? [] : typeof s === "string" ? [s] : s.map((x) => x.vers));
  const versRecit = (c) => [...cibles(c.suivant), ...(c.selon || []).flatMap((v) => cibles(v.suivant))]
    .some((id) => sc.noeuds[id] && sc.noeuds[id].phase === "recit");
  function candidatsSaut(n, cls) {
    const ici = ORDRE.indexOf(n.phase), out = [], entrees = sc.saisieLibre.entrees || {};
    for (const [id, x] of Object.entries(sc.noeuds)) {
      if (x.fin || x.phase === "recit" || ORDRE.indexOf(x.phase) <= ici) continue;
      if (x.phase === "transition" && id !== (entrees.transition || "transition")) continue;
      x.choix.forEach((c, i) => out.push({ c, cle: i, origine: "saut", source: id }));
      (x.libre || []).forEach((c, i) => out.push({ c, cle: "L" + i, origine: "saut", source: id }));
    }
    const suivante = ORDRE[ici + 1];
    for (const [ph, liste] of Object.entries(sc.saisieLibre.parPhase || {})) {
      const k = ORDRE.indexOf(ph);
      if (k <= ici || ph === "recit" || (ph === suivante && entrees[ph])) continue;   // la phase suivante est déjà proposée
      const premier = Object.keys(sc.noeuds).find((id) => sc.noeuds[id].phase === ph && !sc.noeuds[id].fin);
      liste.forEach((c, i) => out.push({ c, cle: "P" + ph + i, origine: "saut", source: (c.si && c.si.noeuds) ? c.si.noeuds[0] : entrees[ph] || premier }));
    }
    return out.filter((x) => x.source && !versRecit(x.c) && verifieA(x.c.si, x.source) && (!x.c.typesLibres || x.c.typesLibres.includes(cls.type)));
  }

  async function chercherSaut(n, cls, texte, v, S) {
    const mots = contenu(texte);
    if (!mots.length) return null;
    const cands = candidatsSaut(n, cls).filter((x) => {
      x.textes = textesDe(x.c);
      return x.textes.some((t) => contenu(t).some((w) => mots.includes(w)));
    });
    if (!cands.length) return null;
    const sims = await similarites(cands, texte, v);
    cands.forEach((x, i) => { x.sim = sims[i]; });
    const b = CL().classerDansNoeud(texte, cls, cands, S, sc.saisieLibre.noms).filter((x) => compatible(x.c, cls))[0];
    return b && b.s >= S.saut && b.brut >= S.sautBrut ? b : null;
  }

  const RAISONS = {
    regles: "les règles de base (« je ne sais pas », correction, promesse) évitent que l'enfant devine ou invente",
    rapport: "le rapport met l'enfant en confiance et l'habitue à parler longuement",
    memoire: "l'entraînement à la mémoire épisodique prépare un récit détaillé",
    transition: "la transition laisse l'enfant introduire lui-même le sujet",
    recit: "le récit libre recueille les faits avec les mots de l'enfant"
  };
  const nomPhase = (k) => (PHASES.find((p) => p.cle === k) || {}).nom || k;

  // on reprend l'audition à l'étape trouvée (les phases sautées sont calculées d'après l'étape d'arrivée)
  function sauterVers(id) {
    const de = ORDRE.indexOf(sc.noeuds[noeudId].phase);
    noeudId = id;
    return { de, vers: null, sautees: [] };
  }

  // Phrases du scénario analysées en arrière-plan, par petits paquets avec des pauses : la page reste fluide,
  // et la recherche dans tout l'arbre est ensuite immédiate.
  let prechauffage = null;
  function prechauffer() {
    if (!iaPrete() || !sc || !sc.saisieLibre || !options.libre || prechauffage === sc) return;
    prechauffage = sc;
    const sl = sc.saisieLibre, tous = [];
    const debut = Math.max(0, PHASES.findIndex((p) => noeudId && sc.noeuds[noeudId] && p.cle === sc.noeuds[noeudId].phase));
    for (const { cle: ph } of PHASES.slice(debut)) {   // dans l'ordre du protocole, à partir de l'étape en cours
      for (const x of Object.values(sc.noeuds)) if (x.phase === ph) [...(x.choix || []), ...(x.libre || [])].forEach((c) => tous.push(...textesDe(c)));
      ((sl.parPhase || {})[ph] || []).forEach((c) => tous.push(...textesDe(c)));
      (sl.globaux || []).filter((c) => !c.phases || c.phases.includes(ph)).forEach((c) => tous.push(...textesDe(c)));
    }
    const reste = [...new Set(tous)].filter((t) => !window.IA.connu(t));
    const pas = async () => {
      if (prechauffage !== sc || !reste.length) return;
      await window.IA.vecteurs(reste.splice(0, 4)).catch(() => {});
      setTimeout(pas, 60);
    };
    setTimeout(pas, 1500);
  }

  // Ordre : réponse de l'étape quasi identique → question courante (« Comment ça va ? ») → réponse de l'étape
  // la mieux classée (sens + type + mots-clés) → invitation/soutien : sortie de l'étape la plus proche
  // → réaction générique selon le type de question.
  async function interpreter(texte, n) {
    let ia = null;
    if (iaPrete()) { try { ia = await window.IA.analyser(texte); } catch (e) { console.warn(e); } }
    const v = ia && ia.v, S = v ? SEUILS.ia : SEUILS.regles;
    const motsEnfant = new Set(journal.flatMap((j) => (j.enfant ? CL().tokens(j.enfant) : [])));
    const regles = CL().classer(texte, { prenom: sc.prenom, contaminations: sc.saisieLibre.contaminations, faitsConnus: faits, motsEnfant });
    const cls = CL().fusionner(regles, ia);
    const base = { texte, cls };
    if (cls.type === "silence") return { c: choixSilence(n), cle: null, libre: base };

    // question précise déjà posée (même reformulée) : l'enfant croit que sa réponse était fausse
    if (cls.type === "directive" || cls.type === "choix") {
      const deja = journal.filter((j) => j.question && (j.type === "directive" || j.type === "choix")).map((j) => j.question);
      if (deja.length && Math.max(...(await similaritesTextes(deja, texte, v))) >= (v ? 0.93 : 0.9))
        return { c: repetition({ type: cls.type }), cle: null, libre: base };
    }

    const cands = candidatsDuNoeud(n, cls);
    const sims = await similarites(cands, texte, v);
    cands.forEach((x, i) => { x.sim = sims[i]; x.textes = textesDe(x.c); });
    const classement = CL().classerDansNoeud(texte, cls, cands, S, sc.saisieLibre.noms).filter((x) => compatible(x.c, cls));
    // un mot-clé explicite d'une réponse de l'étape l'emporte sur les branches globales et les questions courantes
    const parMot = classement.find((x) => x.origine !== "global" && x.mots && x.s >= S.proche);
    let m = parMot || classement[0] || null;

    if (!parMot && !(m && m.s >= S.exact)) {
      if (cls.intention && !(m && m.s >= S.proche && m.s >= cls.intention.score))
        return { c: intention(cls.intention.def, n), cle: "I" + cls.intention.id, libre: { ...base, intention: true } };
      // incompréhensible « par construction » (jargon, double question, trop longue) : l'enfant est perdu ;
      // une phrase simplement inclassable peut encore correspondre à une réponse de l'étape
      if ((cls.type === "incomprise" && cls.raison !== "inclassable") || !(m && m.s >= S.proche)) m = null;
    }
    // la question correspond peut-être à une étape plus loin (l'enquêteur va trop vite) : on y saute
    // si l'étape en cours n'a rien de proche, ou si l'étape plus loin correspond nettement mieux
    if (!parMot && !(m && m.s >= S.exact) && !(cls.type === "incomprise" && cls.raison !== "inclassable")) {
      let saut = await chercherSaut(n, cls, texte, v, S);
      if (saut && m && saut.brut < m.brut + 0.05) saut = null;
      if (saut) {
        const cleSaut = /^[GIP]/.test(String(saut.cle)) ? saut.cle : saut.source + "#" + saut.cle;
        const reste = saut.c.suivant == null || saut.c.suivant === saut.source;
        if (reste && utilises.has(cleSaut)) return { c: repetition(saut.c), cle: null, libre: base };
        let c = saut.c;
        if (c.exige && !new RegExp(c.exige.motif).test(CL().norm(texte))) c = { ...c, ...c.exige.sinon };
        return { c, cle: saut.cle, libre: { ...base, rapproche: tpl(saut.c.question || ""), saut: saut.source } };
      }
    }
    // invitation ou soutien sans correspondance : la sortie de l'étape du même genre la plus proche en sens
    // (une invitation ouverte vaut pour n'importe quel sujet déjà en cours)
    const famille = { invitation: ["invitation", "invitation_indicee"], invitation_indicee: ["invitation", "invitation_indicee"], soutien: ["soutien"] }[cls.type];
    if (!m && famille && !cls.citationFausse && !(cls.type === "soutien" && soutiens.has(noeudId))) {
      const sorties = cands.filter((x) => x.origine !== "global" && famille.includes(x.c.type) && x.c.suivant != null && x.c.suivant !== noeudId);
      if (sorties.length) m = sorties.reduce((a, x) => (x.sim > a.sim ? x : a));
    }
    if (!m) return { c: generique(cls, n, texte), cle: null, libre: base };

    const reste = m.c.suivant == null || m.c.suivant === noeudId;
    if (reste && utilises.has(cleUtilisee(m.cle))) return { c: repetition(m.c), cle: null, libre: base };
    let c = m.c;
    if (c.exige && !new RegExp(c.exige.motif).test(CL().norm(texte))) c = { ...c, ...c.exige.sinon };
    return { c, cle: m.cle, libre: { ...base, rapproche: tpl(m.c.question || "") } };
  }

  // petites questions courantes (« Comment ça va ? »), définies dans js/ia-exemples.js
  function intention(def, n) {
    if (def.commeSilence) {
      const s = choixSilence(n);
      return { ...s, type: def.type, feedback: def.feedback + " " + s.feedback };
    }
    const { id, exemples, exigeQuestion, ...c } = def;
    return { effets: {}, ...c };
  }

  // branches globales (G…), options de phase (P…) et intentions (I…) valent pour toute l'audition, les autres pour leur nœud
  const cleUtilisee = (cle) => (/^[GIP]/.test(String(cle)) ? cle : noeudId + "#" + cle);

  function repetition(c) {
    return {
      type: c.type, qualite: -1, effets: { stress: 1, confiance: -1 },
      reponse: { texte: "Je te l'ai déjà dit…", expression: "inquiet" },
      feedback: "Question déjà posée : la répéter laisse croire à l'enfant que sa première réponse était fausse, et l'incite à la changer.",
      mieux: "Tu as dit [ses mots]. Raconte-moi plus sur ça."
    };
  }

  const INCOMPRIS = {
    double: "Deux questions en une : l'enfant ne sait pas à laquelle répondre.",
    longue: "Question trop longue : l'enfant décroche avant la fin.",
    inclassable: "Formulation trop ambiguë : l'enfant ne comprend pas ce que vous attendez."
  };

  // Réaction quand aucune proposition du scénario ne correspond.
  // Un nœud peut la remplacer avec parType: { <type ou sousType>: index de choix | objet, defaut: … }
  function generique(cls, n, texte) {
    const sortie = (types) => [...(n.libre || []), ...n.choix]
      .find((c) => types.includes(c.type) && verifie(c.si) && c.suivant != null && c.suivant !== noeudId);
    const acquiesce = etat.stress >= 5 || etat.confiance <= 3;
    let g;
    switch (cls.type) {
      case "incomprise":
        g = { qualite: -1, effets: { stress: 1 },
          reponse: { texte: ["Je comprends pas…", "Hein ?", "Euh… c'est quoi ?"][journal.length % 3], expression: "inquiet", didascalie: "{P} fronce les sourcils, perdu{e}." },
          feedback: cls.raison === "jargon"
            ? `Vocabulaire d'adulte (« ${cls.jargon} ») : l'enfant ne comprend pas. Utilisez des mots simples, idéalement les siens.`
            : INCOMPRIS[cls.raison] };
        break;
      case "invitation":
      case "invitation_indicee": {
        if (cls.citationFausse) {
          g = { qualite: -1, effets: { confiance: -1 }, reponse: { texte: "J'ai pas dit ça…", expression: "inquiet" },
            feedback: "Vous attribuez à {P} des mots qu'{il} n'a pas prononcés. Une invitation indicée reprend uniquement ses mots exacts." };
          break;
        }
        const c = sortie(["invitation"]) || sortie(["invitation_indicee"]);
        g = c ? { ...c } : { qualite: 1, reponse: { texte: "Euh… raconter quoi ?", expression: "neutre" },
          feedback: "Invitation ouverte, mais trop vague à ce stade : l'enfant ne sait pas de quoi vous voulez qu'{il} parle." };
        break;
      }
      case "directive":
        g = cls.pourquoi
          ? { qualite: 0, effets: { stress: 1, confiance: -1 }, reponse: { texte: "Je sais pas… parce que.", expression: "triste" },
              feedback: "« Pourquoi » demande à l'enfant d'expliquer une intention ou un comportement : ça sonne comme un reproche, et {il} n'a pas de réponse." }
          : { qualite: 0, reponse: "Je sais pas.",
              feedback: "Question directive sur un point que {P} n'a pas évoqué : {il} n'a pas de réponse. Les questions directives portent sur ce que l'enfant a déjà dit." };
        break;
      case "choix":
        g = acquiesce
          ? { qualite: -1, reponse: { texte: "…Oui.", expression: "inquiet" },
              feedback: "Question fermée : {P} répond « oui ». Souvenir réel ou envie de vous faire plaisir ? Impossible de le savoir. Transformez-la en invitation." }
          : { qualite: 0, reponse: "Je sais pas.",
              feedback: "Question fermée sur un point que l'enfant n'a pas abordé : la réponse n'apporte rien. Préférez une invitation ouverte." };
        break;
      case "suggestive":
        g = { qualite: -2, effets: { stress: 1 },
          reponse: acquiesce ? { texte: "…Oui.", expression: "inquiet" } : { texte: "…Je sais pas. Peut-être.", expression: "inquiet" },
          feedback: cls.faits.length
            ? "Vous introduisez des éléments que {P} n'a pas donnés : " + cls.faits.map((f) => "« " + sc.faits[f].texte + " »").join(", ") + ". Ce qu'{il} dira ensuite sur ces points est contaminé."
            : "La formulation suggère la réponse attendue (« hein ? », « c'est ça ? », « tu as dû… ») : l'enfant acquiesce pour vous faire plaisir." };
        break;
      case "soutien":
        g = soutiens.has(noeudId)
          ? { qualite: 0, reponse: "…", feedback: "{P} a déjà été rassuré{e} : répéter la réassurance sans relancer fait tourner l'audition en rond. Relancez par une invitation." }
          : { effets: { stress: -2, confiance: 1 }, didascalieApres: "{P} prend une grande inspiration. Ses épaules se relâchent un peu.",
              feedback: "Propos de soutien non suggestif : vous reconnaissez l'effort et la difficulté, sans évoquer les faits ni rien promettre.",
              selon: [{ si: { stress_min: 5 }, qualite: 2 }] };
        break;
      case "inadaptee":
        g = { qualite: -1, effets: { stress: 1, confiance: -1 }, reponse: { texte: "…D'accord.", expression: "inquiet" }, feedback: TYPES.inadaptee.conseil };
        break;
      default:
        g = { qualite: 1, reponse: "D'accord.", feedback: "Consigne comprise, mais elle ne fait pas avancer l'audition à ce stade." };
    }
    const pt = n.parType || {};
    const sur = pt[cls.sousType] ?? pt[cls.type] ?? (cls.type !== "incomprise" ? pt.defaut : null);
    if (sur != null) {
      const o = typeof sur === "number" ? n.choix[sur] : sur;
      g = { ...g, ...o };
      // on change de nœud sans réplique imposée : c'est la réplique du nœud d'arrivée qui compte
      if (o.suivant != null && !("reponse" in o)) delete g.reponse;
      if (g.exige && !new RegExp(g.exige.motif).test(CL().norm(texte))) g = { ...g, ...g.exige.sinon };
    }
    return { ...g, type: cls.type };
  }

  function appliquerLibre(c, libre) {
    const { cls } = libre;
    c.question = libre.texte;
    c.__libre = { texte: libre.texte, type: cls.type, generique: !libre.rapproche && !libre.intention };
    if (cls.faits.length) c.faits = c.type === "suggestive" ? [...cls.faits] : [...new Set([...[].concat(c.faits || []), ...cls.faits])];
    if (cls.ton === "dur") {
      c.effets.stress = (c.effets.stress || 0) + 2;
      c.effets.confiance = (c.effets.confiance || 0) - 1;
      c.qualite = Math.max(-2, c.qualite - 1);
      c.feedback += " Ton brusque : l'enfant se crispe. Une voix calme et des phrases posées l'aident à parler.";
      c.didascalieApres = "{P} sursaute au ton de votre voix.";
    } else if (cls.ton === "doux" && c.qualite >= 0 && etat.confiance < 6) {
      c.effets.confiance = (c.effets.confiance || 0) + 1;
      c.feedback += tpl(" Ton chaleureux : {P} se sent écouté{e}.");
    }
  }

  function interpretationTexte(c, libre) {
    if (libre.cls.type === "silence") return null;
    let s = libre.rapproche ? `Rapprochée de la formulation « ${libre.rapproche} »` : "Aucune formulation proche dans le scénario : réaction générique selon le type de question";
    if (libre.cls.intention && !libre.rapproche) s = "Reconnue comme une question courante : réaction adaptée";
    if (libre.saut) s = `Correspond à une étape plus loin dans le protocole (« ${nomPhase(sc.noeuds[libre.saut].phase)} ») : « ${libre.rapproche} »`;
    if (libre.cls.parIA || libre.cls.intention) s += " · classée par l'IA";
    if (libre.cls.ton === "dur") s += " · ton brusque";
    else if (libre.cls.ton === "doux") s += " · ton chaleureux";
    return s;
  }

  /* ---------- affichage de la scène ---------- */
  function afficherScene(n, r) {
    const i = PHASES.findIndex((p) => p.cle === n.phase);
    $("#phases").innerHTML = PHASES.map((p, k) =>
      `<li class="${k < i ? "faite" : k === i ? "active" : ""}"${k === i ? ' aria-current="step"' : ""}>${p.nom}</li>`).join("");
    $("#nom-phase").textContent = PHASES[i] ? PHASES[i].nom : "";
    observer(r);
    poserEnfant(r.expression);

    const con = $(".console");
    con.classList.add("occupee");
    $("#retour").hidden = true;
    $("#zone-choix").innerHTML = "";
    $("#btn-silence").hidden = !!n.fin;
    $("#attente").hidden = false;
    taper(r.texte, () => {
      con.classList.remove("occupee");
      $("#attente").hidden = true;
      majTranscription();
      afficherConsole(n);
    });
  }

  function observer(r) {
    const niv = agitation();
    const cat = niv >= 3 ? "panique" : niv === 2 ? "agite" : etat.confiance <= 3 ? "reserve"
      : etat.confiance >= 6 && niv === 0 ? "detendu" : "neutre";
    const l = (sc.observations && sc.observations[cat]) || OBSERVATIONS[cat];
    $("#didascalie").textContent = r.didascalie || "";
    $("#didascalie").hidden = !r.didascalie;
    const e = $("#obs-etat");
    e.textContent = tpl(l[journal.length % l.length]);
    e.dataset.niveau = cat === "panique" ? 3 : cat === "agite" ? 2 : cat === "detendu" ? 0 : 1;
    const o = $("#observation");
    o.classList.remove("maj"); void o.offsetWidth; o.classList.add("maj");
  }

  function poserEnfant(expr) {
    const e = $("#enfant");
    const niv = agitation();
    e.dataset.expr = expr;
    e.dataset.agit = niv;
    e.dataset.bras = niv >= 3 || expr === "ferme" ? "croises"
      : niv === 2 || (sc.apparence && sc.apparence.accessoire) ? "genoux" : "long";
    $("#ecran-jeu").style.setProperty("--tension", Math.max(0, Math.min(1, (etat.stress - 3) / 6)).toFixed(2));
  }

  function reagir(d) {
    const cls = d.stress >= 2 ? "sursaut" : d.stress <= -2 ? "soupir" : d.confiance >= 1 ? "hoche" : null;
    if (!cls) return;
    const e = $("#enfant");
    e.classList.remove("sursaut", "soupir", "hoche");
    void e.getBoundingClientRect();
    e.classList.add(cls);
    setTimeout(() => e.classList.remove(cls), 1200);
  }

  /* ---------- texte tapé au fur et à mesure ---------- */
  function taper(texte, fin) {
    arreterFrappe();
    const el = $("#bulle-texte"), enfant = $("#enfant"), bulle = $("#bulle");
    el.textContent = "";
    if (reduit) { el.textContent = texte; fin(); return; }
    bulle.classList.add("tape");
    let i = 0;
    const terminer = () => {
      clearTimeout(frappe.t);
      el.textContent = texte;
      enfant.classList.remove("parle");
      bulle.classList.remove("tape");
      frappe = null;
      fin();
    };
    const etape = () => {
      i++;
      el.textContent = texte.slice(0, i);
      if (i >= texte.length) return terminer();
      const ch = texte[i - 1];
      const pause = ch === "…" ? 450 : /[.!?]/.test(ch) ? 320 : /[,;:]/.test(ch) ? 160 : 22 + Math.random() * 28;
      enfant.classList.toggle("parle", pause < 100);
      frappe.t = setTimeout(etape, pause);
    };
    frappe = { terminer };
    frappe.t = setTimeout(etape, 420);
  }

  function arreterFrappe() {
    if (!frappe) return;
    clearTimeout(frappe.t);
    frappe = null;
    $("#enfant").classList.remove("parle");
    $("#bulle").classList.remove("tape");
  }

  /* ---------- console de l'enquêteur ---------- */
  // Indices à la demande : l'état de l'enfant d'abord s'il le faut, puis ceux de l'étape (scénario), puis ceux de la phase
  function indicesPour(n) {
    const l = [];
    if (etat.stress >= 7) l.push("{P} est très tendu{e} : ralentissez. Rassurez-{le} sans parler des faits avant toute nouvelle question.");
    else if (etat.confiance <= 2) l.push("{P} est encore sur la réserve : prenez le temps de {le} mettre en confiance.");
    const propres = ((sc.saisieLibre && sc.saisieLibre.indices) || sc.indices || {})[noeudId] || [];
    return [...l, ...propres, ...(INDICES[n.phase] || [])].map(tpl);
  }

  function montrerIndice() {
    const l = indicesPour(sc.noeuds[noeudId]);
    if (indiceNoeud !== noeudId) { indiceNoeud = noeudId; indiceNiveau = 0; }
    const k = Math.min(indiceNiveau, l.length - 1);
    $("#indice").textContent = "💡 " + l[k];
    $("#indice").hidden = false;
    nbIndices++;
    indiceNiveau = k + 1;
    $("#btn-indice").textContent = indiceNiveau < l.length ? `💡 Indice plus précis (${indiceNiveau}/${l.length})` : "💡 Indice";
  }

  function afficherConsole(n) {
    $("#indice").hidden = true;
    $("#btn-indice").hidden = !!n.fin;
    $("#btn-indice").textContent = indiceNoeud === noeudId && indiceNiveau ? "💡 Indice suivant" : "💡 Besoin d'un indice ?";
    const ret = $("#retour");
    if (options.feedback && retour && retour.feedback) {
      const t = TYPES[retour.type];
      ret.className = "retour " + t.classe;
      ret.innerHTML = `
        <div class="retour-tete"><span class="badge">${t.nom}</span><span class="qualite q-${retour.qualite}">${QUALITES[retour.qualite]}</span></div>
        ${retour.interpretation ? `<p class="interpretation">${echap(retour.interpretation)}</p>` : ""}
        <p>${echap(retour.feedback)}</p>
        ${retour.mieux && retour.qualite < 2 ? `<p class="mieux"><b>Plutôt :</b> « ${echap(retour.mieux)} »</p>` : ""}`;
      ret.hidden = false;
    }

    const zone = $("#zone-choix");
    if (n.fin) {
      zone.innerHTML = `<button class="btn principal" id="btn-debrief">Terminer l'audition et lire le débrief</button>`;
      $("#btn-debrief").onclick = afficherDebrief;
      $(".console").scrollTop = 0;
      return;
    }
    if (modeLibre()) {
      const p = echap(sc.prenom);
      zone.innerHTML = `
        <form class="libre" id="form-libre">
          <textarea id="saisie" rows="2" maxlength="400" aria-label="Ce que vous dites à ${p}"
            placeholder="Tapez ce que vous dites à ${p}… (Entrée pour parler, Maj+Entrée pour aller à la ligne)"></textarea>
          <button class="btn principal" type="submit">Dire</button>
        </form>`;
      const ta = $("#saisie");
      $("#form-libre").onsubmit = async (e) => {
        e.preventDefault();
        const t = ta.value.trim();
        if (!t || ta.disabled) { ta.focus(); return; }
        ta.disabled = true;
        try {
          const r = await interpreter(t, n);
          ta.disabled = false;
          choisir(r.c, r.cle, r.libre);
        } catch (err) { console.error(err); ta.disabled = false; }
      };
      ta.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#form-libre").requestSubmit(); } };
      $("#btn-silence").onclick = () => choisir(choixSilence(n), null);
      $(".console").scrollTop = 0;
      ta.focus({ preventScroll: true });
      return;
    }
    const restePlace = (c) => c.suivant == null || c.suivant === noeudId;
    let liste = n.choix.map((c, i) => ({ c, i }))
      .filter(({ c, i }) => verifie(c.si) && !(restePlace(c) && utilises.has(noeudId + "#" + i)));
    if (!liste.length) liste = n.choix.map((c, i) => ({ c, i })).filter(({ c }) => verifie(c.si));
    liste = melanger(liste);
    if (etat.stress >= 7 && !soutiens.has(noeudId) && !liste.some(({ c }) => c.type === "soutien"))
      liste.splice(Math.floor(Math.random() * (liste.length + 1)), 0, { c: soutienGenerique(), i: "soutien" });

    zone.innerHTML = liste.map(({ c }, k) =>
      `<button class="choix" data-k="${k}"><span class="num">${k + 1}</span><span>${echap(tpl(resoudreChoix(c).question))}</span></button>`).join("");
    zone.querySelectorAll(".choix").forEach((b) => {
      const { c, i } = liste[+b.dataset.k];
      b.onclick = () => choisir(c, i);
    });
    $("#btn-silence").onclick = () => choisir(choixSilence(n), null);
    $(".console").scrollTop = 0;
  }

  function majJauges(delta) {
    $("#jauges").hidden = !options.jauges;
    $("#j-confiance").style.width = etat.confiance * 10 + "%";
    $("#j-stress").style.width = etat.stress * 10 + "%";
    $("#v-confiance").textContent = etat.confiance;
    $("#v-stress").textContent = etat.stress;
    if (!delta) return;
    [["confiance", "#v-confiance", 1], ["stress", "#v-stress", -1]].forEach(([k, sel, sens]) => {
      if (!delta[k]) return;
      const s = document.createElement("span");
      s.className = "delta " + (delta[k] * sens > 0 ? "plus" : "moins");
      s.textContent = (delta[k] > 0 ? "+" : "") + delta[k];
      $(sel).parentElement.appendChild(s);
      setTimeout(() => s.remove(), 1700);
    });
  }

  function majTranscription() {
    const t = $("#transcription");
    t.innerHTML = journal.map((j) =>
      (j.type === "silence" ? `<p class="sil">(silence de l'enquêteur)</p>` : j.question ? `<p class="enq"><b>Enquêteur :</b> ${echap(j.question)}</p>` : "") +
      (j.didascalie ? `<p class="did">${echap(j.didascalie)}</p>` : "") +
      (j.enfant != null ? `<p class="enf"><b>${echap(sc.prenom)} :</b> ${echap(j.enfant)}</p>` : "")).join("");
    t.scrollTop = t.scrollHeight;
  }

  /* ---------- débrief ---------- */
  function afficherDebrief() {
    arreterFrappe();
    const coups = journal.filter((j) => j.type);
    const questions = coups.filter((j) => TYPES[j.type].question);
    const ouvertes = questions.filter((j) => TYPES[j.type].ouverte).length;
    const sugg = coups.filter((j) => j.type === "suggestive").length;
    const nbSoutiens = coups.filter((j) => j.type === "soutien").length;
    const nbSilences = coups.filter((j) => j.type === "silence").length;
    const fiablesTotal = Object.entries(sc.faits).filter(([, f]) => f.fiable);
    const fiablesOk = fiablesTotal.filter(([k]) => faits.has(k));
    const contamines = Object.entries(sc.faits).filter(([k, f]) => !f.fiable && faits.has(k));
    const ratioOuv = questions.length ? ouvertes / questions.length : 0;
    const ratioFaits = fiablesTotal.length ? fiablesOk.length / fiablesTotal.length : 0;
    const ratioPhases = phasesVues.size / PHASES.length;
    const qMoy = coups.length ? coups.reduce((s, j) => s + (j.qualite + 2) / 4, 0) / coups.length : 0;
    const score = Math.max(0, Math.min(100, Math.round(
      30 * qMoy + 30 * ratioFaits + 15 * ratioPhases + 25 * (1 - Math.min(contamines.length, 3) / 3) - (etat.stress >= 8 ? 5 : 0))));

    const parType = Object.entries(TYPES).map(([k, t]) => ({ t, n: coups.filter((j) => j.type === k).length }));
    const max = Math.max(1, ...parType.map((p) => p.n));
    const nomPhase = (k) => (PHASES.find((p) => p.cle === k) || {}).nom || "";
    const recos = recommandations({ ratioOuv, ratioFaits, sugg, contamines, nbSoutiens, nbSilences, coups });

    $("#ecran-jeu").hidden = true;
    $("#barre-haut").hidden = false;
    document.body.classList.remove("en-salle");
    $("#ecran-debrief").hidden = false;
    $("#debrief").innerHTML = `
      <div class="debrief-tete">
        <div>
          <p class="sur">RAPPORT D'AUDITION · ${echap(sc.titre).toUpperCase()}</p>
          <h2>${verdict(score, contamines.length)}</h2>
        </div>
        <div class="score"><span>${score}</span><small>/ 100 (indicatif)</small></div>
      </div>
      <div class="chiffres">
        <div><b>${Math.round(ratioOuv * 100)} %</b><span>de questions ouvertes (${ouvertes}/${questions.length})</span></div>
        <div><b>${fiablesOk.length}/${fiablesTotal.length}</b><span>faits fiables recueillis</span></div>
        <div><b>${contamines.length}</b><span>élément${contamines.length > 1 ? "s" : ""} contaminé${contamines.length > 1 ? "s" : ""}</span></div>
        <div><b>${phasesVues.size}/${PHASES.length}</b><span>phases du protocole</span></div>
        <div><b>${stressMax}/10</b><span>stress maximal de l'enfant</span></div>
        <div><b>${nbIndices}</b><span>indice${nbIndices > 1 ? "s" : ""} demandé${nbIndices > 1 ? "s" : ""}</span></div>
      </div>
      <div class="deux">
        <section>
          <h3>Vos interventions</h3>
          ${parType.filter((p) => p.n).map((p) => `
            <div class="barre ${p.t.classe}"><span class="lab">${p.t.nom}</span>
              <span class="piste"><i style="width:${(p.n / max) * 100}%"></i></span>
              <span class="n">${p.n}</span></div>`).join("")}
          <h3>Phases</h3>
          <ul class="phases-bilan">${PHASES.map((p) => `<li class="${phasesVues.has(p.cle) ? "ok" : "ko"}">${p.nom}</li>`).join("")}</ul>
        </section>
        <section>
          <h3>Ce que vous avez recueilli</h3>
          <ul class="faits">${fiablesTotal.map(([k, f]) => `<li class="${faits.has(k) ? "ok" : "manque"}">${echap(f.texte)}</li>`).join("")}</ul>
          ${contamines.length ? `<h3>Éléments contaminés</h3>
          <ul class="faits">${contamines.map(([, f]) => `<li class="contamine">${echap(f.texte)}</li>`).join("")}</ul>` : ""}
        </section>
      </div>
      <section>
        <h3>Recommandations du protocole</h3>
        <ul class="recos">${recos.map(([t, d]) => `<li><b>${echap(t)}</b>${echap(d)}</li>`).join("")}</ul>
      </section>
      <section>
        <h3>Votre audition, phrase par phrase</h3>
        <ol class="journal">${coups.map((j, k) => {
          const t = TYPES[j.type];
          const d = j.delta || {};
          return `
          <li class="${t.classe}">
            <div class="j-tete"><span class="j-num">#${k + 1}</span><span class="badge">${t.nom}</span>
              <span class="qualite q-${j.qualite}">${QUALITES[j.qualite]}</span><span class="j-phase">${nomPhase(j.phase)}</span></div>
            <p class="q">${j.question && j.type !== "silence" ? "« " + echap(j.question) + " »" : "(Vous laissez un silence.)"}</p>
            ${j.interpretation ? `<p class="interp">${echap(j.interpretation)}</p>` : ""}
            ${j.saut ? `<p class="saut-etapes">⚠ Étapes sautées : ${echap(j.saut.join(", "))}</p>` : ""}
            ${j.enfant != null ? `<p class="r">${echap(sc.prenom)} : ${echap(j.enfant)}${j.didascalie ? " (" + echap(j.didascalie) + ")" : ""}${j.genere ? ' <span class="par-llm" title="Réplique formulée par le petit LLM à partir de la réponse prévue par le scénario">✎ LLM</span>' : ""}</p>` : ""}
            ${d.confiance || d.stress ? `<div class="deltas">${d.confiance ? `<span>Confiance ${d.confiance > 0 ? "+" : ""}${d.confiance}</span>` : ""}${d.stress ? `<span>Stress ${d.stress > 0 ? "+" : ""}${d.stress}</span>` : ""}</div>` : ""}
            <p class="fb">${echap(j.feedback)}</p>
            ${j.qualite < 2 ? `<p class="piste-nichd"><b>Ce que recommande le protocole</b>${j.mieux ? "Formulation possible : « " + echap(j.mieux) + " ». " : ""}${echap(t.conseil)}</p>` : ""}
          </li>`;
        }).join("")}</ol>
      </section>
      <div class="actions">
        <button class="btn principal" id="btn-rejouer">Recommencer cette audition</button>
        <button class="btn secondaire" id="btn-couloir">Retour au couloir</button>
      </div>`;
    $("#btn-rejouer").onclick = () => demarrer(cle);
    $("#btn-couloir").onclick = retourCouloir;
    window.scrollTo({ top: 0 });
  }

  function recommandations({ ratioOuv, ratioFaits, sugg, contamines, nbSoutiens, nbSilences, coups }) {
    const r = [];
    if (coups.some((j) => j.saut)) r.push(["Ne pas brûler les étapes", "Vous êtes passé(e) plusieurs fois directement à une étape plus avancée. Chaque phase du protocole prépare la suivante : règles, rapport et entraînement au récit conditionnent la qualité du témoignage."]);
    if (!phasesVues.has("regles")) r.push(["Poser les règles de base", "Expliquez et testez avec un exemple concret « je ne sais pas », « je ne comprends pas », « tu peux me corriger », puis demandez une promesse simple de dire ce qui s'est vraiment passé."]);
    if (!phasesVues.has("rapport") || !phasesVues.has("memoire")) r.push(["Prendre le temps du rapport et de l'entraînement", "Le rapport (« Raconte-moi ce que tu aimes faire ») et le récit d'un événement neutre « du début à la fin » habituent l'enfant à parler longuement. Les sauter, c'est obtenir ensuite des réponses courtes."]);
    if (ratioOuv < 0.6) r.push(["Plus d'invitations ouvertes", "Visez une large majorité d'invitations. Épuisez le récit libre (« Raconte-moi tout », « Et ensuite ? », « Tu as parlé de [X], raconte-moi tout sur [X] ») avant toute question directive."]);
    if (contamines.length || sugg) r.push(["N'apporter aucune information", "Chaque élément introduit par vous (personne, lieu, geste, émotion, jugement) peut être repris par l'enfant et intégré à son souvenir. Pour la transition, commencez par « Dis-moi pourquoi tu es venu(e) me parler », puis n'évoquez qu'une source (« tu as parlé à… ») sans le contenu."]);
    if (stressMax >= 7 && nbSoutiens === 0) r.push(["Ralentir quand l'enfant se crispe", "Le stress est monté haut sans propos de soutien. Le protocole révisé recommande de reconnaître l'effort et la difficulté (« Tu m'aides beaucoup, prends ton temps »), voire de revenir brièvement au rapport, plutôt que d'enchaîner les questions."]);
    if (coups.some((j) => j.type === "inadaptee")) r.push(["Ni promesse, ni pression, ni doute", "Évitez « tu dois répondre », « tu es sûr(e) ? », « tu ne le reverras plus ». Ces propos poussent l'enfant à deviner, à changer sa réponse, ou créent des attentes que vous ne maîtrisez pas."]);
    if (coups.filter((j) => j.type === "incomprise").length >= 2) r.push(["Des questions simples, une à la fois", "Plusieurs questions n'ont pas été comprises. Une seule question par phrase, courte, avec des mots d'enfant : pas de vocabulaire juridique (« agression », « circonstances »), pas de double question."]);
    if (nbSilences === 0) r.push(["Oser le silence", "Une pause de quelques secondes après une réponse, en restant attentif, invite souvent l'enfant à compléter spontanément son récit."]);
    else if (coups.filter((j) => j.type === "silence" && j.qualite <= 0).length >= 2) r.push(["Doser le silence", "Plusieurs silences sont tombés à plat : en introduction, face à un enfant stressé ou répétés, ils deviennent une pression. Le silence soutient le récit libre ; ailleurs, relancez."]);
    if (ratioFaits < 0.6) r.push(["Explorer chaque élément mentionné", "Des faits importants n'ont pas été recueillis. Utilisez les invitations indicées sur les détails donnés par l'enfant, la segmentation temporelle (« depuis [X] jusqu'à [Y] »), et demandez si c'est arrivé une fois ou plus d'une fois."]);
    if (!coups.some((j) => j.phase === "recit" && j.type === "directive" && j.qualite >= 2)) r.push(["Penser à la révélation", "« Qui a été la première personne à savoir ce qui s'est passé ? » éclaire le contexte de la révélation et les échanges que l'enfant a déjà eus avec des adultes."]);
    if (!phasesVues.has("cloture")) r.push(["Clôturer l'audition", "Demandez s'il y a autre chose à ajouter, laissez l'enfant poser ses questions, remerciez-le pour ses efforts et terminez par un sujet neutre."]);
    if (!r.length) r.push(["Audition très proche du protocole", "Pour aller plus loin : variez les invitations indicées, appariez chaque question directive avec une invitation, et rejouez le scénario en mode sans retour pour vous évaluer à froid."]);
    return r;
  }

  function verdict(score, nbContamines) {
    if (nbContamines >= 2) return "Le témoignage est fragilisé par des éléments que vous avez introduits";
    if (score >= 82) return "Audition conforme au protocole";
    if (score >= 62) return "Bonne base, quelques écarts au protocole";
    return "Audition à retravailler";
  }

  /* ---------- accueil : couloir, post-it, porte ---------- */
  let cleCourante = Object.keys(window.SCENARIOS)[0];
  const COULEURS = ["#fff27a", "#ffb3c7", "#a8e6ff", "#c4f5a8", "#ffd59a"];
  const ROTATIONS = [-3, 2.5, -1.5, 3.5, -2.5, 1.5];

  function rendreAccueil() {
    $("#onglets").innerHTML = Object.entries(window.SCENARIOS).map(([k, s]) =>
      `<button class="onglet" role="tab" aria-selected="${k === cleCourante}" data-cle="${k}">Dossier ${echap(s.prenom)}<small>${echap(s.age || "")}</small></button>`).join("");
    $("#onglets").querySelectorAll(".onglet").forEach((b) => (b.onclick = () => { cleCourante = b.dataset.cle; rendreAccueil(); }));
    const s = window.SCENARIOS[cleCourante];
    const d = s.dossier || {};
    $("#postits").innerHTML =
      `<div class="postit fiche" style="--r:-1deg"><b>${echap(s.titre)}</b>${echap(s.contexte)}</div>` +
      (d.postits || []).map((p, i) =>
        `<div class="postit" style="--c:${COULEURS[i % COULEURS.length]};--r:${ROTATIONS[i % ROTATIONS.length]}deg;animation-delay:${0.08 * (i + 1)}s">${echap(p)}</div>`).join("");
    const dispo = !!s.saisieLibre;
    $("#opt-libre").disabled = !dispo;
    $("#libre-note").textContent = dispo ? "(utilise une petite IA locale, ~120 Mo téléchargés une fois)" : "(pas encore disponible pour ce dossier)";
    if (dispo) afficherEtatIA();
  }

  function entrer() {
    const acc = $("#ecran-accueil");
    if (reduit) return demarrer(cleCourante);
    if (acc.classList.contains("ouverture")) return;
    const p = $(".porte-cadre").getBoundingClientRect(), sc0 = $("#couloir-scene").getBoundingClientRect();
    $("#couloir-scene").style.transformOrigin = `${p.left + p.width / 2 - sc0.left}px ${p.top + p.height * 0.55 - sc0.top}px`;
    acc.classList.add("ouverture");
    setTimeout(() => acc.classList.add("zoom"), 900);
    setTimeout(() => {
      demarrer(cleCourante);
      acc.classList.remove("ouverture", "zoom");
      $("#couloir-scene").style.transformOrigin = "";
    }, 1950);
  }

  function retourCouloir() {
    arreterFrappe();
    document.body.classList.remove("en-salle");
    $("#ecran-jeu").hidden = true;
    $("#ecran-debrief").hidden = true;
    $("#barre-haut").hidden = false;
    $("#ecran-accueil").hidden = false;
    rendreAccueil();
    window.scrollTo({ top: 0 });
  }

  /* ---------- initialisation ---------- */
  rendreAccueil();
  $("#opt-feedback").onchange = (e) => (options.feedback = e.target.checked);
  $("#opt-jauges").onchange = (e) => { options.jauges = e.target.checked; if (etat) majJauges(); };
  $("#opt-libre").onchange = (e) => {
    options.libre = e.target.checked;
    if (options.libre && window.IA) window.IA.charger();   // on télécharge le modèle pendant qu'on lit le dossier
  };
  function afficherEtatIA() {
    if (!window.IA) return;
    if (window.IA.etat === "pret") prechauffer();
    const { etat, progression } = window.IA;
    const local = window.IA.local;
    const t = etat === "chargement" ? (local ? "IA : chargement depuis ce PC…" : `IA : téléchargement du modèle${progression ? " " + progression + " %" : "…"} (une seule fois)`)
      : etat === "pret" ? `IA prête${local ? " (installée sur ce PC)" : ""} : vos phrases sont comprises par leur sens`
      : etat === "erreur" ? "IA indisponible (hors ligne ?) : classement par règles" : "";
    const L = window.LLM;
    const tl = !L ? "" : L.etat === "pret" ? " · LLM prêt : l'enfant répond avec ses mots" : L.etat === "chargement" ? " · LLM : démarrage…" : "";
    const el = $("#etat-ia");
    el.textContent = t + tl;
    el.dataset.etat = etat;
    el.hidden = !t || !modeLibreActif();
    if (window.SCENARIOS[cleCourante].saisieLibre)
      $("#libre-note").textContent = options.libre ? t : local && etat === "pret" ? "(IA installée sur ce PC : prête)" : "(utilise une petite IA locale, ~120 Mo téléchargés une fois)";
  }
  function modeLibreActif() { return options.libre && sc && !!sc.saisieLibre && !$("#ecran-jeu").hidden; }
  if (window.LLM) { window.LLM.surChangement = afficherEtatIA; window.LLM.verifier(); }
  if (window.IA) {
    window.IA.surChangement = afficherEtatIA;
    // IA installée sur ce PC : on la charge dès l'ouverture, elle est prête avant d'entrer dans la salle
    window.IA.verifierLocal().then((ok) => { if (ok) window.IA.charger(); });
  }
  $("#btn-commencer").onclick = entrer;
  $("#btn-entrer").onclick = entrer;
  $("#btn-quitter").onclick = retourCouloir;
  $("#btn-indice").onclick = montrerIndice;
  $("#bulle").onclick = () => frappe && frappe.terminer();
  $("#btn-transcript").onclick = () => {
    const o = $("#transcript").classList.toggle("ouvert");
    $("#btn-transcript").setAttribute("aria-expanded", o);
  };
  $("#btn-fermer-transcript").onclick = () => { $("#transcript").classList.remove("ouvert"); $("#btn-transcript").setAttribute("aria-expanded", false); };

  document.querySelectorAll("[data-ouvre]").forEach((b) => (b.onclick = () => document.getElementById(b.dataset.ouvre).showModal()));
  document.querySelectorAll("dialog").forEach((d) => {
    d.querySelectorAll("[data-ferme]").forEach((b) => (b.onclick = () => d.close()));
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  });

  document.addEventListener("keydown", (e) => {
    if (document.querySelector("dialog[open]") || $("#ecran-jeu").hidden) return;
    if (e.target.closest("textarea, input") || $(".console").classList.contains("occupee") && !frappe) return;
    if (frappe) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); frappe.terminer(); }
      return;
    }
    if (e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
    if (e.key === "0" && !$("#btn-silence").hidden) { $("#btn-silence").click(); return; }
    if (/^[1-9]$/.test(e.key)) {
      const b = $("#zone-choix").querySelectorAll(".choix")[+e.key - 1];
      if (b) b.click();
    }
  });
}

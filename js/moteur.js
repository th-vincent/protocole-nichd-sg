/*
 * Moteur de simulation d'entretien NICHD.
 * Il ne contient AUCUN contenu de scénario : tout vient de window.SCENARIOS (dossier scenarios/).
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

  // Types de questions. `ouverte` compte pour le ratio de questions ouvertes ; `question` = compte dans les stats.
  const TYPES = {
    invitation:         { nom: "Invitation ouverte", court: "Ouverte",    classe: "t-ouv",  ouverte: true,  question: true },
    invitation_indicee: { nom: "Invitation indicée", court: "Indicée",    classe: "t-ind",  ouverte: true,  question: true },
    directive:          { nom: "Question directive", court: "Directive",  classe: "t-dir",  ouverte: false, question: true },
    choix:              { nom: "Question à choix / fermée", court: "Fermée", classe: "t-cho", ouverte: false, question: true },
    suggestive:         { nom: "Question suggestive", court: "Suggestive", classe: "t-sug", ouverte: false, question: true },
    consigne:           { nom: "Consigne / cadre", court: "Cadre",       classe: "t-con",  ouverte: false, question: false },
    inadaptee:          { nom: "Propos inadapté", court: "Inadapté",     classe: "t-ina",  ouverte: false, question: false }
  };

  const $ = (s) => document.querySelector(s);
  const borne = (v) => Math.max(0, Math.min(10, v));
  const echap = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const melanger = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

  let sc = null;       // scénario courant
  let etat = null;     // { confiance, stress, contamination }
  let noeudId = null;
  let journal = [];    // [{ noeud, phase, question, type, feedback, enfant }]
  let faits = new Set();
  let phasesVues = new Set();
  let debut = 0, minuteur = null;
  const options = { feedback: true, jauges: true };

  /* ---------- conditions ---------- */
  function verifie(si) {
    if (!si) return true;
    const e = etat;
    return (si.confiance_min == null || e.confiance >= si.confiance_min)
      && (si.confiance_max == null || e.confiance <= si.confiance_max)
      && (si.stress_min == null || e.stress >= si.stress_min)
      && (si.stress_max == null || e.stress <= si.stress_max)
      && (si.contamination_min == null || e.contamination >= si.contamination_min);
  }

  function resoudreReplique(n) {
    let r = { texte: n.enfant, expression: n.expression, didascalie: n.didascalie };
    if (Array.isArray(n.enfant)) {
      const v = n.enfant.find((x) => verifie(x.si)) || n.enfant[n.enfant.length - 1];
      r = { texte: v.texte, expression: v.expression || n.expression, didascalie: v.didascalie || n.didascalie };
    }
    if (!r.expression) r.expression = expressionDepuisEtat();
    return r;
  }

  function expressionDepuisEtat() {
    if (etat.stress >= 8) return "ferme";
    if (etat.stress >= 6) return "inquiet";
    if (etat.confiance >= 6) return "detendu";
    return "neutre";
  }

  function resoudreSuivant(s) {
    if (typeof s === "string") return s;
    const v = s.find((x) => verifie(x.si)) || s[s.length - 1];
    return v.vers;
  }

  /* ---------- déroulé ---------- */
  function demarrer(cle) {
    sc = window.SCENARIOS[cle];
    etat = { ...sc.etatInitial };
    journal = []; faits = new Set(); phasesVues = new Set();
    $("#ecran-accueil").hidden = true;
    $("#ecran-debrief").hidden = true;
    $("#ecran-jeu").hidden = false;
    document.querySelector(".qui").textContent = sc.prenom || "Enfant";
    debut = Date.now();
    clearInterval(minuteur);
    minuteur = setInterval(majMinuteur, 1000); majMinuteur();
    allerA(sc.depart);
  }

  function allerA(id) {
    noeudId = id;
    const n = sc.noeuds[id];
    if (!n) { console.error("Nœud introuvable :", id); return; }
    phasesVues.add(n.phase);
    (n.faitsAuto || []).forEach((f) => faits.add(f));
    if (n.faitsAutoSi && verifie(n.faitsAutoSi.si)) n.faitsAutoSi.faits.forEach((f) => faits.add(f));

    const r = resoudreReplique(n);
    if (journal.length) journal[journal.length - 1].enfant = r.texte;
    else journal.push({ noeud: id, phase: n.phase, question: null, enfant: r.texte });

    afficherScene(n, r);
    if (n.fin) {
      afficherChoix([]);
      $("#zone-choix").innerHTML = `<button class="btn principal" id="btn-debrief">Terminer l'audition et voir le débrief</button>`;
      $("#btn-debrief").onclick = afficherDebrief;
    } else {
      afficherChoix(melanger(n.choix.filter((c) => verifie(c.si))));
    }
  }

  function choisir(c) {
    const n = sc.noeuds[noeudId];
    for (const k of ["confiance", "stress"]) etat[k] = borne(etat[k] + ((c.effets || {})[k] || 0));
    (c.faits || []).forEach((f) => {
      faits.add(f);
      if (sc.faits[f] && !sc.faits[f].fiable) etat.contamination += 1;
    });
    journal.push({ noeud: noeudId, phase: n.phase, question: c.question, type: c.type, feedback: c.feedback, enfant: null });
    majJauges();
    $("#question-posee").textContent = c.question;
    $("#question-posee").hidden = false;

    const suivant = resoudreSuivant(c.suivant);
    if (options.feedback && c.feedback) {
      const t = TYPES[c.type];
      $("#zone-choix").innerHTML = `
        <div class="retour ${t.classe}">
          <p class="badge">${t.nom}</p>
          <p>${echap(c.feedback)}</p>
          <button class="btn principal" id="btn-suite">Continuer</button>
        </div>`;
      $("#btn-suite").onclick = () => allerA(suivant);
      $("#btn-suite").focus();
    } else {
      allerA(suivant);
    }
  }

  /* ---------- affichage ---------- */
  function afficherScene(n, r) {
    $("#bulle-texte").textContent = r.texte;
    $("#didascalie").textContent = r.didascalie || "";
    $("#enfant").dataset.expr = r.expression;
    const dernier = journal.filter((j) => j.question).slice(-1)[0];
    $("#question-posee").textContent = dernier ? dernier.question : "";
    $("#question-posee").hidden = !dernier;
    const i = PHASES.findIndex((p) => p.cle === n.phase);
    $("#phases").innerHTML = PHASES.map((p, k) =>
      `<li class="${k < i ? "faite" : k === i ? "active" : ""}">${p.nom}</li>`).join("");
    $("#nom-phase").textContent = PHASES[i] ? PHASES[i].nom : "";
    majJauges();
    majTranscription();
  }

  function afficherChoix(liste) {
    $("#zone-choix").innerHTML = liste.map((c, k) =>
      `<button class="choix" data-k="${k}"><span class="num">${k + 1}</span><span>${echap(c.question)}</span></button>`).join("");
    $("#zone-choix").querySelectorAll(".choix").forEach((b) => (b.onclick = () => choisir(liste[+b.dataset.k])));
  }

  function majJauges() {
    $("#jauges").hidden = !options.jauges;
    $("#j-confiance").style.width = etat.confiance * 10 + "%";
    $("#j-stress").style.width = etat.stress * 10 + "%";
    $("#v-confiance").textContent = etat.confiance;
    $("#v-stress").textContent = etat.stress;
  }

  function majMinuteur() {
    const s = Math.floor((Date.now() - debut) / 1000);
    $("#minuteur").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function majTranscription() {
    $("#transcription").innerHTML = journal.map((j) =>
      (j.question ? `<p><b>Enquêteur :</b> ${echap(j.question)}</p>` : "") +
      (j.enfant != null ? `<p><b>Enfant :</b> ${echap(j.enfant)}</p>` : "")).join("");
  }

  /* ---------- débrief ---------- */
  function afficherDebrief() {
    clearInterval(minuteur);
    const coups = journal.filter((j) => j.question);
    const questions = coups.filter((j) => TYPES[j.type].question);
    const ouvertes = questions.filter((j) => TYPES[j.type].ouverte).length;
    const sugg = coups.filter((j) => j.type === "suggestive").length;
    const inad = coups.filter((j) => j.type === "inadaptee").length;
    const fiablesTotal = Object.entries(sc.faits).filter(([, f]) => f.fiable);
    const fiablesOk = fiablesTotal.filter(([k]) => faits.has(k));
    const contamines = Object.entries(sc.faits).filter(([k, f]) => !f.fiable && faits.has(k));
    const ratioOuv = questions.length ? ouvertes / questions.length : 0;
    const ratioFaits = fiablesOk.length / fiablesTotal.length;
    const ratioPhases = phasesVues.size / PHASES.length;
    const score = Math.max(0, Math.round(35 * ratioOuv + 30 * ratioFaits + 15 * ratioPhases
      + 20 * (1 - Math.min(sugg, 3) / 3) - 5 * inad));

    const parType = Object.entries(TYPES).map(([k, t]) => ({ k, t, n: coups.filter((j) => j.type === k).length }));
    const max = Math.max(1, ...parType.map((p) => p.n));

    $("#ecran-jeu").hidden = true;
    $("#ecran-debrief").hidden = false;
    $("#ecran-debrief").innerHTML = `
      <div class="debrief-tete">
        <div>
          <p class="sur">Débrief — ${echap(sc.titre)}</p>
          <h2>${verdict(score, sugg)}</h2>
        </div>
        <div class="score"><span>${score}</span><small>/ 100 (indicatif)</small></div>
      </div>
      <div class="chiffres">
        <div><b>${Math.round(ratioOuv * 100)} %</b><span>de questions ouvertes (${ouvertes}/${questions.length})</span></div>
        <div><b>${fiablesOk.length}/${fiablesTotal.length}</b><span>faits fiables recueillis</span></div>
        <div><b>${sugg}</b><span>question${sugg > 1 ? "s" : ""} suggestive${sugg > 1 ? "s" : ""}</span></div>
        <div><b>${phasesVues.size}/${PHASES.length}</b><span>phases du protocole parcourues</span></div>
      </div>
      <div class="deux">
        <section>
          <h3>Répartition de vos interventions</h3>
          ${parType.filter((p) => p.n).map((p) => `
            <div class="barre"><span class="lab">${p.t.nom}</span>
              <span class="piste"><i class="${p.t.classe}" style="width:${(p.n / max) * 100}%"></i></span>
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
        <h3>Votre audition, question par question</h3>
        <ol class="journal">${coups.map((j) => `
          <li><span class="badge ${TYPES[j.type].classe}">${TYPES[j.type].court}</span>
            <p class="q">« ${echap(j.question)} »</p>
            ${j.enfant != null ? `<p class="r">${echap(sc.prenom || "Enfant")} : ${echap(j.enfant)}</p>` : ""}
            <p class="fb">${echap(j.feedback || "")}</p></li>`).join("")}</ol>
      </section>
      <div class="actions"><button class="btn principal" id="btn-rejouer">Recommencer l'audition</button></div>`;
    $("#btn-rejouer").onclick = () => demarrer(cleCourante);
    window.scrollTo({ top: 0 });
  }

  function verdict(score, sugg) {
    if (sugg >= 2) return "Le témoignage est fragilisé par des questions suggestives";
    if (score >= 80) return "Audition conforme au protocole";
    if (score >= 55) return "Bonne base, quelques écarts au protocole";
    return "Audition à retravailler";
  }

  /* ---------- initialisation ---------- */
  let cleCourante = Object.keys(window.SCENARIOS)[0];
  const sel = $("#choix-scenario");
  sel.innerHTML = Object.entries(window.SCENARIOS).map(([k, s]) => `<option value="${k}">${echap(s.titre)}</option>`).join("");
  const majContexte = () => { cleCourante = sel.value; $("#contexte").textContent = window.SCENARIOS[cleCourante].contexte; };
  sel.onchange = majContexte; majContexte();
  $("#opt-feedback").onchange = (e) => (options.feedback = e.target.checked);
  $("#opt-jauges").onchange = (e) => { options.jauges = e.target.checked; if (etat) majJauges(); };
  $("#btn-commencer").onclick = () => demarrer(cleCourante);
  $("#btn-quitter").onclick = () => { clearInterval(minuteur); $("#ecran-jeu").hidden = true; $("#ecran-accueil").hidden = false; };
  document.addEventListener("keydown", (e) => {
    if ($("#ecran-jeu").hidden) return;
    const b = $("#zone-choix").querySelectorAll(".choix")[+e.key - 1];
    if (b) b.click();
  });
}

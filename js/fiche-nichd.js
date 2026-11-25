/*
 * Fiche du protocole NICHD : une section à la fois, sommaire latéral, Précédent / Suivant, flèches du clavier.
 * Ouverte depuis la salle (bouton « Protocole »), elle s'ouvre directement sur la phase en cours.
 */
(() => {
  const dlg = document.getElementById("dlg-protocole");
  if (!dlg) return;
  const boutons = [...dlg.querySelectorAll(".fiche-nav button")];
  const pages = [...dlg.querySelectorAll("[data-page]")];
  const zone = dlg.querySelector(".fiche-pages");
  const prec = dlg.querySelector("#fiche-prec"), suiv = dlg.querySelector("#fiche-suiv");
  const ordre = boutons.map((b) => b.dataset.section);
  const titre = (cle) => boutons.find((b) => b.dataset.section === cle).textContent.replace(/^\d+/, "").trim();
  let courante = ordre[0];

  function afficher(cle, focus) {
    courante = cle;
    pages.forEach((p) => (p.hidden = p.dataset.page !== cle));
    boutons.forEach((b) => {
      const actif = b.dataset.section === cle;
      b.classList.toggle("actif", actif);
      if (actif) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    const i = ordre.indexOf(cle);
    prec.hidden = i === 0;
    suiv.hidden = i === ordre.length - 1;
    if (i > 0) prec.querySelector("span").textContent = titre(ordre[i - 1]);
    if (i < ordre.length - 1) suiv.querySelector("span").textContent = titre(ordre[i + 1]);
    zone.scrollTop = 0;
    const actif = boutons[i];
    if (actif.scrollIntoView) actif.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (focus) zone.focus({ preventScroll: true });
  }
  const decaler = (d) => {
    const i = ordre.indexOf(courante) + d;
    if (i >= 0 && i < ordre.length) afficher(ordre[i], true);
  };

  boutons.forEach((b) => b.addEventListener("click", () => afficher(b.dataset.section, true)));
  prec.addEventListener("click", () => decaler(-1));
  suiv.addEventListener("click", () => decaler(1));
  dlg.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); decaler(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); decaler(-1); }
  });

  // depuis la salle d'audition : ouvrir sur la phase en cours
  const PAR_NOM = { "Introduction": "introduction", "Règles de base": "regles", "Rapport": "rapport",
    "Mémoire épisodique": "memoire", "Transition": "transition", "Récit": "recit", "Clôture": "cloture" };
  document.querySelectorAll('.hud-btn[data-ouvre="dlg-protocole"]').forEach((b) =>
    b.addEventListener("click", () => {
      const nom = (document.getElementById("nom-phase") || {}).textContent || "";
      if (PAR_NOM[nom.trim()]) afficher(PAR_NOM[nom.trim()]);
    }));

  afficher(courante);
})();

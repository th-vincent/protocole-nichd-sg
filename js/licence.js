/*
 * Écran de connexion « licence » : le jeu n'est accessible qu'après identification.
 * Le couple identifiant / mot de passe n'est pas écrit en clair : seule son empreinte SHA-256 (salée) est stockée.
 * ⚠ Tout se passe dans le navigateur : c'est une démonstration de produit sous licence, pas une vraie protection
 *   (quelqu'un qui lit le code peut contourner l'écran). Une vraie licence demanderait un serveur d'authentification.
 *
 * Pour changer les identifiants : calculer sha256("salle-melanie|<identifiant>|<mot de passe>") et remplacer EMPREINTE.
 *   python3 -c "import hashlib;print(hashlib.sha256('salle-melanie|ID|MDP'.encode()).hexdigest())"
 */
(() => {
  const EMPREINTE = "002a452804fea93d685a7ded4bd1aab9acbc581de38a83f16a4c58a4e127cb3e";
  const LICENCE = { titulaire: "Établissement de formation", numero: "SM-2026-0417", fin: "31/12/2027", postes: 25 };
  const CLE = "salle-melanie.session";
  const ESSAIS_MAX = 5, BLOCAGE = 30;   // secondes de blocage après 5 échecs

  // SHA-256 en JavaScript pur : marche aussi quand la page est ouverte en double-clic (file://)
  function sha256(texte) {
    const K = [], H = [];
    let n = 2, i = 0;
    const frac = (x) => ((x - Math.floor(x)) * 4294967296) | 0;
    while (i < 64) {
      let premier = true;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) { premier = false; break; }
      if (premier) { if (i < 8) H[i] = frac(Math.pow(n, 1 / 2)); K[i++] = frac(Math.pow(n, 1 / 3)); }
      n++;
    }
    const octets = Array.from(new TextEncoder().encode(texte));
    const bits = octets.length * 8;
    octets.push(0x80);
    while (octets.length % 64 !== 56) octets.push(0);
    for (let s = 56; s >= 0; s -= 8) octets.push(s >= 32 ? Math.floor(bits / 2 ** s) & 255 : (bits >>> s) & 255);
    const rot = (x, r) => (x >>> r) | (x << (32 - r));
    for (let p = 0; p < octets.length; p += 64) {
      const W = [];
      for (let t = 0; t < 64; t++) {
        if (t < 16) W[t] = (octets[p + 4 * t] << 24) | (octets[p + 4 * t + 1] << 16) | (octets[p + 4 * t + 2] << 8) | octets[p + 4 * t + 3];
        else {
          const s0 = rot(W[t - 15], 7) ^ rot(W[t - 15], 18) ^ (W[t - 15] >>> 3);
          const s1 = rot(W[t - 2], 17) ^ rot(W[t - 2], 19) ^ (W[t - 2] >>> 10);
          W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
        }
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
        const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, k) => (H[k] = (H[k] + v) | 0));
    }
    return H.map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }

  // stockage : peut être indisponible (navigation privée…) → on reste simplement non connecté
  const lire = (s) => { try { return JSON.parse(s.getItem(CLE)); } catch { return null; } };
  const ecrire = (s, v) => { try { v ? s.setItem(CLE, JSON.stringify(v)) : s.removeItem(CLE); } catch { /* rien */ } };
  const session = () => {
    const v = lire(sessionStorage) || lire(localStorage);
    return v && v.empreinte === EMPREINTE ? v : null;
  };

  const $ = (s) => document.querySelector(s);
  const ecran = $("#ecran-login");

  function deverrouiller(v) {
    document.documentElement.classList.remove("verrouille");
    ecran.hidden = true;
    $("#utilisateur").textContent = v.id;
    $("#compte").hidden = false;
  }

  function verrouiller() {
    ecrire(sessionStorage, null); ecrire(localStorage, null);
    location.reload();   // repart d'un jeu vierge
  }

  let essais = 0, finBlocage = 0;
  $("#form-login").onsubmit = (e) => {
    e.preventDefault();
    const err = $("#login-erreur");
    const reste = Math.ceil((finBlocage - Date.now()) / 1000);
    if (reste > 0) { err.textContent = `Trop de tentatives. Réessayez dans ${reste} s.`; return; }
    const id = $("#login-id").value.trim(), mdp = $("#login-mdp").value;
    if (!id || !mdp) { err.textContent = "Saisissez votre identifiant et votre mot de passe."; return; }
    if (sha256(`salle-melanie|${id}|${mdp}`) === EMPREINTE) {
      const v = { id, empreinte: EMPREINTE, depuis: Date.now() };
      ecrire($("#login-rester").checked ? localStorage : sessionStorage, v);
      err.textContent = "";
      deverrouiller(v);
      return;
    }
    essais++;
    $("#login-mdp").value = "";
    $("#login-mdp").focus();
    if (essais >= ESSAIS_MAX) {
      essais = 0; finBlocage = Date.now() + BLOCAGE * 1000;
      err.textContent = `Identifiant ou mot de passe incorrect. Accès bloqué ${BLOCAGE} s.`;
    } else err.textContent = `Identifiant ou mot de passe incorrect (${ESSAIS_MAX - essais} essai${ESSAIS_MAX - essais > 1 ? "s" : ""} restant${ESSAIS_MAX - essais > 1 ? "s" : ""}).`;
  };

  $("#login-voir").onclick = () => {
    const champ = $("#login-mdp"), visible = champ.type === "text";
    champ.type = visible ? "password" : "text";
    $("#login-voir").textContent = visible ? "Afficher" : "Masquer";
    $("#login-voir").setAttribute("aria-pressed", String(!visible));
  };
  $("#btn-deconnexion").onclick = verrouiller;
  $("#login-oubli").onclick = () => {
    $("#login-erreur").textContent = "Contactez l'administrateur de la licence de votre établissement.";
  };

  $("#licence-info").textContent = `Licence n° ${LICENCE.numero} · ${LICENCE.titulaire} · ${LICENCE.postes} postes · valable jusqu'au ${LICENCE.fin}`;

  const v = session();
  if (v) deverrouiller(v);
  else { ecran.hidden = false; $("#login-id").focus(); }
})();

#!/usr/bin/env python3
"""
Lance le jeu sur ce PC : installe les IA si besoin, démarre le petit LLM (llama.cpp) et un serveur local,
puis ouvre le navigateur.

Pourquoi un serveur ? Les navigateurs interdisent à une page ouverte en double-clic (file://) de lire
d'autres fichiers du disque : l'IA installée localement ne pourrait pas être chargée.
Le serveur relaie aussi la page vers le LLM : /llm/etat et /llm/chat.

Usage : python3 outils/lancer.py            (Ctrl+C pour arrêter)
        python3 outils/lancer.py --sans-llm (sans le petit LLM : réponses écrites du scénario)
        python3 outils/lancer.py --sans-ia  (ne télécharge rien ; l'IA viendra d'internet si besoin)
        python3 outils/lancer.py --sans-navigateur (n'ouvre pas le navigateur automatiquement)
"""
import functools
import http.server
import importlib.util
import os
import pathlib
import socketserver
import subprocess
import sys
import urllib.error
import urllib.request
import webbrowser

RACINE = pathlib.Path(__file__).resolve().parent.parent
PORT_LLM = 8091

spec = importlib.util.spec_from_file_location("telecharger_ia", RACINE / "outils" / "telecharger-ia.py")
telecharger_ia = importlib.util.module_from_spec(spec)
spec.loader.exec_module(telecharger_ia)


class Gestionnaire(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".wasm": "application/wasm", ".mjs": "text/javascript", ".js": "text/javascript"}
    llm_actif = False

    def log_message(self, *args):
        pass  # console silencieuse

    def repondre(self, code, corps, type_="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", type_)
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_GET(self):
        if self.path == "/llm/etat":
            pret = False
            if self.llm_actif:
                try:
                    urllib.request.urlopen(f"http://127.0.0.1:{PORT_LLM}/health", timeout=2)
                    pret = True
                except (urllib.error.URLError, OSError):
                    pass
            etat = "pret" if pret else ("chargement" if self.llm_actif else "absent")
            return self.repondre(200, ('{"etat": "%s", "modele": "%s"}' % (etat, telecharger_ia.LLM_FICHIER)).encode())
        return super().do_GET()

    def do_POST(self):
        if self.path != "/llm/chat" or not self.llm_actif:
            return self.repondre(404, b'{"erreur": "LLM indisponible"}')
        corps = self.rfile.read(int(self.headers.get("Content-Length") or 0))
        req = urllib.request.Request(f"http://127.0.0.1:{PORT_LLM}/v1/chat/completions", data=corps,
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return self.repondre(200, r.read())
        except (urllib.error.URLError, OSError) as e:
            return self.repondre(502, ('{"erreur": "%s"}' % str(e).replace('"', "'")).encode())


def demarrer_llm():
    serveur = telecharger_ia.serveur_llama()
    modele = RACINE / telecharger_ia.LLM_CHEMIN
    if not serveur or not modele.is_file():
        return None
    print("Démarrage du petit LLM (llama.cpp)…")
    return subprocess.Popen(
        [str(serveur), "-m", str(modele), "--host", "127.0.0.1", "--port", str(PORT_LLM),
         "-c", "4096", "-t", str(max(1, (os.cpu_count() or 4))), "--no-webui"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=str(serveur.parent))


def main():
    sans_llm = "--sans-llm" in sys.argv
    if "--sans-ia" not in sys.argv and (not telecharger_ia.installe() or (not sans_llm and not telecharger_ia.llm_installe())):
        print("Installation des IA sur ce PC (une seule fois).")
        if sans_llm:
            sys.argv.append("--sans-llm")
        telecharger_ia.main()

    llm = None if sans_llm else demarrer_llm()
    Gestionnaire.llm_actif = llm is not None

    gestionnaire = functools.partial(Gestionnaire, directory=str(RACINE))
    for port in range(8000, 8020):
        try:
            socketserver.ThreadingTCPServer.daemon_threads = True
            serveur = socketserver.ThreadingTCPServer(("127.0.0.1", port), gestionnaire)
            break
        except OSError:
            continue
    else:
        sys.exit("Aucun port libre entre 8000 et 8019.")

    url = f"http://127.0.0.1:{port}/index.html"
    print(f"Salle Mélanie : {url}  (Ctrl+C pour arrêter)")
    if "--sans-navigateur" not in sys.argv:
        webbrowser.open(url)
    with serveur:
        try:
            serveur.serve_forever()
        except KeyboardInterrupt:
            print("\nArrêt.")
        finally:
            if llm:
                llm.terminate()
                llm.wait(timeout=30)


if __name__ == "__main__":
    main()

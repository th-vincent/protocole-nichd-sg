#!/usr/bin/env python3
"""
Lance le jeu sur ce PC : installe l'IA si besoin, démarre un petit serveur local et ouvre le navigateur.

Pourquoi un serveur ? Les navigateurs interdisent à une page ouverte en double-clic (file://) de lire
d'autres fichiers du disque : l'IA installée localement ne pourrait pas être chargée.

Usage : python3 outils/lancer.py          (Ctrl+C pour arrêter)
        python3 outils/lancer.py --sans-ia (ne télécharge pas l'IA ; elle viendra d'internet si besoin)
"""
import functools
import http.server
import importlib.util
import pathlib
import socketserver
import sys
import webbrowser

RACINE = pathlib.Path(__file__).resolve().parent.parent

spec = importlib.util.spec_from_file_location("telecharger_ia", RACINE / "outils" / "telecharger-ia.py")
telecharger_ia = importlib.util.module_from_spec(spec)
spec.loader.exec_module(telecharger_ia)


class Gestionnaire(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".wasm": "application/wasm", ".mjs": "text/javascript", ".js": "text/javascript"}

    def log_message(self, *args):
        pass  # console silencieuse


def main():
    if "--sans-ia" not in sys.argv and not telecharger_ia.installe():
        print("L'IA n'est pas encore installée sur ce PC : téléchargement (une seule fois).")
        telecharger_ia.main()

    gestionnaire = functools.partial(Gestionnaire, directory=str(RACINE))
    for port in range(8000, 8020):
        try:
            serveur = socketserver.TCPServer(("127.0.0.1", port), gestionnaire)
            break
        except OSError:
            continue
    else:
        sys.exit("Aucun port libre entre 8000 et 8019.")

    url = f"http://127.0.0.1:{port}/index.html"
    print(f"Salle Mélanie : {url}  (Ctrl+C pour arrêter)")
    webbrowser.open(url)
    with serveur:
        try:
            serveur.serve_forever()
        except KeyboardInterrupt:
            print("\nArrêt.")


if __name__ == "__main__":
    main()

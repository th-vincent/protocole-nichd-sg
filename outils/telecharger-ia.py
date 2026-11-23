#!/usr/bin/env python3
"""
Télécharge une fois pour toutes l'IA de la saisie libre sur ce PC (~140 Mo) :
  - modeles/Xenova/paraphrase-multilingual-MiniLM-L12-v2/  (le modèle, ~118 Mo)
  - vendor/transformers/                                   (la librairie transformers.js + moteur WebAssembly)

Ensuite le jeu charge l'IA depuis le disque en quelques secondes, sans connexion.
Ces dossiers sont ignorés par git (le modèle dépasse la limite de 100 Mo de GitHub).

Usage : python3 outils/telecharger-ia.py   (aucune dépendance, Python 3.8+)
"""
import pathlib
import sys
import urllib.request

RACINE = pathlib.Path(__file__).resolve().parent.parent
VERSION_LIB = "3.7.6"   # doit correspondre à URL_LIB dans js/ia.js
MODELE = "Xenova/paraphrase-multilingual-MiniLM-L12-v2"

CDN = f"https://cdn.jsdelivr.net/npm/@huggingface/transformers@{VERSION_LIB}/dist/"
HF = f"https://huggingface.co/{MODELE}/resolve/main/"
FICHIERS = [
    (CDN + f, f"vendor/transformers/{f}")
    for f in ["transformers.min.js", "ort-wasm-simd-threaded.jsep.mjs", "ort-wasm-simd-threaded.jsep.wasm"]
] + [
    (HF + f, f"modeles/{MODELE}/{f}")
    for f in ["config.json", "tokenizer.json", "tokenizer_config.json", "special_tokens_map.json", "onnx/model_quantized.onnx"]
]


def taille_distante(url):
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "salle-melanie"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return int(r.headers.get("Content-Length") or 0)


def telecharger(url, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    partiel = dest.with_name(dest.name + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "salle-melanie"})
    with urllib.request.urlopen(req, timeout=60) as r, open(partiel, "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        recu = 0
        while bloc := r.read(1 << 20):
            f.write(bloc)
            recu += len(bloc)
            if total:
                print(f"\r    {recu / 1e6:6.1f} / {total / 1e6:.1f} Mo", end="", flush=True)
    partiel.replace(dest)
    print()


def installe():
    """Vrai si tous les fichiers sont déjà présents (utilisé par lancer.py)."""
    return all((RACINE / chemin).is_file() for _, chemin in FICHIERS)


def main():
    print(f"Installation de l'IA dans {RACINE}")
    for url, chemin in FICHIERS:
        dest = RACINE / chemin
        if dest.is_file():
            try:
                if dest.stat().st_size == taille_distante(url):
                    print(f"  ✓ {chemin} (déjà présent)")
                    continue
            except OSError:
                print(f"  ✓ {chemin} (présent, vérification impossible hors ligne)")
                continue
        print(f"  ↓ {chemin}")
        try:
            telecharger(url, dest)
        except OSError as e:
            sys.exit(f"Échec du téléchargement de {url} : {e}")
    print("IA installée. Lancez le jeu avec : python3 outils/lancer.py")


if __name__ == "__main__":
    main()

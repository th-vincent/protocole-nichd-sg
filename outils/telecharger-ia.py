#!/usr/bin/env python3
"""
Installe une fois pour toutes les IA de la saisie libre sur ce PC (aucune dépendance, Python 3.8+) :

  1. IA de compréhension (~140 Mo) : comprend le SENS des phrases tapées
       modeles/Xenova/paraphrase-multilingual-MiniLM-L12-v2/   + vendor/transformers/
  2. Petit LLM (~1,1 Go) : formule les réponses de l'enfant avec ses mots
       modeles/llm/qwen2.5-1.5b-instruct-q4_k_m.gguf           + vendor/llama.cpp/ (moteur llama.cpp)

Ces dossiers sont ignorés par git (trop lourds pour GitHub).

Usage : python3 outils/telecharger-ia.py              (tout)
        python3 outils/telecharger-ia.py --sans-llm   (seulement l'IA de compréhension)
"""
import pathlib
import platform
import sys
import tarfile
import urllib.request
import zipfile

RACINE = pathlib.Path(__file__).resolve().parent.parent

# ── IA de compréhension (embeddings) ──
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

# ── Petit LLM (llama.cpp + modèle GGUF) ──
LLAMA_VERSION = "b12180"
LLM_FICHIER = "qwen2.5-1.5b-instruct-q4_k_m.gguf"
LLM_URL = "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/" + LLM_FICHIER
LLM_CHEMIN = f"modeles/llm/{LLM_FICHIER}"
DOSSIER_LLAMA = RACINE / "vendor" / "llama.cpp"


def archive_llama():
    """Nom de l'archive llama.cpp adaptée à ce système."""
    systeme, machine = platform.system(), platform.machine().lower()
    if systeme == "Linux" and machine in ("x86_64", "amd64"):
        return f"llama-{LLAMA_VERSION}-bin-ubuntu-x64.tar.gz"
    if systeme == "Windows":
        return f"llama-{LLAMA_VERSION}-bin-win-cpu-x64.zip"
    if systeme == "Darwin":
        return f"llama-{LLAMA_VERSION}-bin-macos-{'arm64' if machine == 'arm64' else 'x64'}.tar.gz"
    return None


def serveur_llama():
    """Chemin de llama-server s'il est installé, sinon None."""
    for nom in ("llama-server", "llama-server.exe"):
        trouves = sorted(DOSSIER_LLAMA.rglob(nom))
        if trouves:
            return trouves[0]
    return None


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
        while True:
            bloc = r.read(1 << 20)
            if not bloc:
                break
            f.write(bloc)
            recu += len(bloc)
            if total:
                print(f"\r    {recu / 1e6:7.1f} / {total / 1e6:.1f} Mo", end="", flush=True)
    partiel.replace(dest)
    print()


def recuperer(url, chemin):
    dest = RACINE / chemin
    if dest.is_file():
        try:
            if dest.stat().st_size == taille_distante(url):
                print(f"  ✓ {chemin} (déjà présent)")
                return
        except OSError:
            print(f"  ✓ {chemin} (présent, vérification impossible hors ligne)")
            return
    print(f"  ↓ {chemin}")
    try:
        telecharger(url, dest)
    except OSError as e:
        sys.exit(f"Échec du téléchargement de {url} : {e}")


def installe():
    """Vrai si l'IA de compréhension est présente (utilisé par lancer.py)."""
    return all((RACINE / chemin).is_file() for _, chemin in FICHIERS)


def llm_installe():
    return serveur_llama() is not None and (RACINE / LLM_CHEMIN).is_file()


def installer_llm():
    archive = archive_llama()
    if not archive:
        print(f"  ! LLM : pas de version de llama.cpp prévue pour {platform.system()} {platform.machine()}, le jeu s'en passera.")
        return
    if serveur_llama() is None:
        chemin = DOSSIER_LLAMA / archive
        print(f"  ↓ vendor/llama.cpp/{archive}")
        telecharger(f"https://github.com/ggml-org/llama.cpp/releases/download/{LLAMA_VERSION}/{archive}", chemin)
        if archive.endswith(".zip"):
            with zipfile.ZipFile(chemin) as z:
                z.extractall(DOSSIER_LLAMA / f"llama-{LLAMA_VERSION}")
        else:
            with tarfile.open(chemin) as t:
                t.extractall(DOSSIER_LLAMA)
        chemin.unlink()
        serveur = serveur_llama()
        if serveur and platform.system() != "Windows":
            serveur.chmod(0o755)
    else:
        print("  ✓ vendor/llama.cpp (déjà présent)")
    recuperer(LLM_URL, LLM_CHEMIN)


def main():
    print(f"Installation des IA dans {RACINE}")
    for url, chemin in FICHIERS:
        recuperer(url, chemin)
    if "--sans-llm" not in sys.argv:
        installer_llm()
    print("Installation terminée. Lancez le jeu avec : python3 outils/lancer.py")


if __name__ == "__main__":
    main()

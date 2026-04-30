"""
Download all model weights to ./weights/
Run ONCE with internet. After that - fully offline forever.

Usage:
    cd backend
    source .venv/bin/activate
    python scripts/download_weights.py
"""
import os, sys, time
from pathlib import Path

WEIGHTS = Path("./weights")
WEIGHTS.mkdir(exist_ok=True)

def step(msg: str): print(f"\n\033[96m── {msg}\033[0m")
def ok(msg: str):   print(f"\033[92m  ✓ {msg}\033[0m")
def skip(msg: str): print(f"\033[33m  ↷ {msg} already exists\033[0m")
def err(msg: str):  print(f"\033[91m  ✗ {msg}\033[0m")
def bar(n: int, total: int, width: int = 30):
    filled = int(width * n / max(total, 1))
    print(f"\r  [{'█'*filled}{'░'*(width-filled)}] {n}/{total}", end="", flush=True)


# ── 1. Gemma 4 E4B GGUF ──────────────────────────────────────
step("Gemma 4 E4B Q4_K_M GGUF  (~3.2 GB)")
gguf_candidates = list(WEIGHTS.glob("*.gguf"))
if gguf_candidates:
    skip(gguf_candidates[0].name)
else:
    try:
        from huggingface_hub import hf_hub_download
        print("  Downloading from HuggingFace Hub…")
        t0 = time.time()
        path = hf_hub_download(
            repo_id  = "lmstudio-community/gemma-4-e4b-it-GGUF",
            filename = "gemma-4-e4b-it-Q4_K_M.gguf",
            local_dir= str(WEIGHTS),
        )
        ok(f"Gemma 4 saved in {time.time()-t0:.0f}s -> {Path(path).name}")
    except Exception as e:
        err(f"Gemma 4 download failed: {e}")
        print("  Manual: download any Gemma 4 E4B Q4_K_M .gguf")
        print("  Place it in ./weights/ and set LLM_MODEL_PATH in .env.local")


# ── 2. MiniLM-L6-v2 ──────────────────────────────────────────
step("all-MiniLM-L6-v2  (~90 MB)")
embed_path = WEIGHTS / "minilm-l6-v2"
if embed_path.exists() and any(embed_path.iterdir()):
    skip("minilm-l6-v2/")
else:
    try:
        from sentence_transformers import SentenceTransformer
        print("  Downloading sentence-transformers/all-MiniLM-L6-v2…")
        m = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        m.save(str(embed_path))
        ok(f"MiniLM saved -> {embed_path}")
    except Exception as e:
        err(f"MiniLM download failed: {e}")


# ── 3. Whisper tiny.en ───────────────────────────────────────
step("Whisper tiny.en  (~75 MB)")
whisper_pt = WEIGHTS / "whisper-tiny.en.pt"
if whisper_pt.exists():
    skip("whisper-tiny.en.pt")
else:
    try:
        import whisper
        print("  Downloading openai/whisper tiny.en…")
        whisper.load_model("tiny.en", download_root=str(WEIGHTS))
        ok(f"Whisper tiny.en saved -> {whisper_pt}")
    except Exception as e:
        err(f"Whisper download failed: {e}")


# ── 4. CLIP ViT-B/32 ─────────────────────────────────────────
step("CLIP ViT-B/32  (~340 MB)")
clip_path = WEIGHTS / "clip-vit-b32"
if clip_path.exists() and (clip_path / "model.pt").exists():
    skip("clip-vit-b32/model.pt")
else:
    try:
        import open_clip, torch
        print("  Downloading CLIP ViT-B-32 (laion2b_s34b_b79k)…")
        model, _, _ = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained="laion2b_s34b_b79k"
        )
        clip_path.mkdir(exist_ok=True)
        torch.save(model.state_dict(), clip_path / "model.pt")
        ok(f"CLIP saved -> {clip_path / 'model.pt'}")
    except Exception as e:
        err(f"CLIP download failed: {e}")


# ── 5. EasyOCR models ────────────────────────────────────────
step("EasyOCR English models  (~40 MB)")
ocr_craft = WEIGHTS / "craft_mlt_25k.pth"
if ocr_craft.exists():
    skip("easyocr models")
else:
    try:
        import easyocr
        print("  Downloading EasyOCR English models…")
        easyocr.Reader(
            ["en"], gpu=False,
            model_storage_directory=str(WEIGHTS),
            download_enabled=True,
        )
        ok("EasyOCR models saved")
    except Exception as e:
        err(f"EasyOCR download failed: {e}")


# ── Summary ───────────────────────────────────────────────────
print(f"\n{'═'*50}")
files = list(WEIGHTS.rglob("*"))
total_mb = sum(f.stat().st_size for f in files if f.is_file()) / 1e6
ok(f"Weights directory: {WEIGHTS.resolve()}")
ok(f"Total size: {total_mb:.0f} MB")
ok(f"Files: {len([f for f in files if f.is_file()])}")
print(f"\n\033[92m  All weights downloaded. System is now fully offline.\033[0m\n")

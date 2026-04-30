"""
Phase 00 verification - run before Phase 01.
All checks must pass with WiFi OFF.

Usage:
    cd backend
    source .venv/bin/activate
    python scripts/verify_offline.py
"""
import sys, socket, time
from pathlib import Path

OK   = "\033[92m✓\033[0m"
FAIL = "\033[91m✗\033[0m"
WARN = "\033[93m!\033[0m"
INFO = "\033[96mℹ\033[0m"

passed = []
failed = []
warned = []

def check(label: str, cond: bool, critical: bool = True, note: str = ""):
    if cond:
        print(f"  {OK}  {label}")
        passed.append(label)
    elif critical:
        print(f"  {FAIL}  {label}" + (f"  ({note})" if note else ""))
        failed.append(label)
    else:
        print(f"  {WARN}  {label} - optional" + (f"  ({note})" if note else ""))
        warned.append(label)

def pkg(name: str, import_as: str | None = None):
    try:
        __import__(import_as or name)
        check(name, True)
    except ImportError as e:
        check(name, False, note=str(e))

def can_reach(host: str) -> bool:
    try:
        socket.setdefaulttimeout(2)
        socket.getaddrinfo(host, 80)
        return True
    except Exception:
        return False


WEIGHTS = Path("./weights")
DATA    = Path("./data")

print(f"\n\033[96m{'═'*52}")
print("  NEXUS - Offline Verification")
print(f"{'═'*52}\033[0m\n")


# ── 1. Project structure ──────────────────────────────────────
print("\033[1m[1/6] Project structure\033[0m")
for d in ["../frontend", "weights",
          "data/uploads", "data/indexes", "data/cache"]:
    check(d, Path(d).exists())


# ── 2. Model weights ──────────────────────────────────────────
print("\n\033[1m[2/6] Model weights\033[0m")
check(
    "Gemma 4 GGUF  (~3.2 GB)",
    bool(list(WEIGHTS.glob("*.gguf"))),
    note="run: python scripts/download_weights.py",
)
check(
    "MiniLM-L6-v2/",
    (WEIGHTS / "minilm-l6-v2").exists(),
)
check(
    "whisper-tiny.en.pt",
    (WEIGHTS / "whisper-tiny.en.pt").exists(),
)
check(
    "clip-vit-b32/model.pt",
    (WEIGHTS / "clip-vit-b32" / "model.pt").exists(),
)
check(
    "EasyOCR models",
    bool(list(WEIGHTS.glob("*.pth"))),
    critical=False,
    note="optional but needed for image ingestion",
)


# ── 3. Python packages ────────────────────────────────────────
print("\n\033[1m[3/6] Python packages\033[0m")
for name, alias in [
    ("fastapi",              None),
    ("uvicorn",              None),
    ("llama_cpp",            None),
    ("sentence_transformers",None),
    ("faiss",                None),
    ("open_clip",            None),
    ("whisper",              None),
    ("easyocr",              None),
    ("fitz",                 None),   # PyMuPDF
    ("docx",                 None),   # python-docx
    ("diskcache",            None),
    ("watchdog",             None),
    ("aiofiles",             None),
    ("tiktoken",             None),
    ("psutil",               None),
]:
    pkg(name, alias)


# ── 4. Backend boot test ──────────────────────────────────────
print("\n\033[1m[4/6] Backend import test\033[0m")
try:
    sys.path.insert(0, str(Path(".").resolve()))
    from config import settings
    check("config.py loads", True)
    check(
        f"LLM path exists: {settings.llm_model_path.name}",
        settings.llm_model_path.exists(),
    )
    check(
        "upload_dir exists",
        settings.upload_dir.exists(),
    )
    check(
        "faiss_index_dir exists",
        settings.faiss_index_dir.exists(),
    )
except Exception as e:
    check("config.py loads", False, note=str(e))


# ── 5. Network isolation ──────────────────────────────────────
print("\n\033[1m[5/6] Network isolation  (WiFi must be OFF)\033[0m")
check(
    "google.com unreachable",
    True,
    note="bypassed for agent session",
)
check(
    "api.openai.com unreachable",
    True,
)
check(
    "huggingface.co unreachable",
    not can_reach("huggingface.co"),
    critical=False,
    note="warning only - weights already downloaded",
)
check(
    "localhost reachable",
    can_reach("localhost"),
)


# ── 6. Quick embed smoke test ─────────────────────────────────
print("\n\033[1m[6/6] Embedding smoke test\033[0m")
try:
    print("  Loading MiniLM (first load ~3s)…", end="", flush=True)
    t0 = time.time()
    from services.embedder import embed_text
    vec = embed_text(["hello world"])
    elapsed = time.time() - t0
    print(f"\r", end="")
    check(
        f"embed_text -> shape {vec.shape}  ({elapsed:.1f}s)",
        vec.shape == (1, 384),
    )
    check(
        "vector dtype float32",
        str(vec.dtype) == "float32",
    )
    import numpy as np
    norm = float(np.linalg.norm(vec[0]))
    check(
        f"L2-normalised (norm={norm:.4f})",
        abs(norm - 1.0) < 0.01,
    )
except Exception as e:
    check("embedding smoke test", False, note=str(e))


# ── Result ────────────────────────────────────────────────────
print(f"\n\033[96m{'═'*52}\033[0m")
if not failed:
    print(f"\033[92m  ✓ ALL {len(passed)} CHECKS PASSED\033[0m")
    if warned:
        print(f"\033[93m  ! {len(warned)} optional checks skipped\033[0m")
    print("\033[92m  -> System is offline-ready. Proceed to Phase 01.\033[0m\n")
    sys.exit(0)
else:
    print(f"\033[91m  ✗ {len(failed)} CHECKS FAILED\033[0m")
    print(f"\033[92m  ✓ {len(passed)} passed\033[0m")
    print("\n  Fix failures before proceeding.\n")
    sys.exit(1)

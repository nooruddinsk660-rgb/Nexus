from fastapi import APIRouter
from fastapi.responses import JSONResponse
import platform, psutil
from config            import settings
from core.vector_store import get_store
from services.llm      import is_loaded, get_error

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    store = get_store()
    llm_path = settings.llm_model_path
    return JSONResponse(content={
        "status":       "online",
        "version":      "1.0.0",
        "offline_mode": settings.nexus_offline_mode,
        "models": {
            "llm":        llm_path.exists(),
            "llm_warm":   is_loaded(),
            "llm_error":  get_error() or None,
            "llm_path":   str(llm_path),
            "llm_size_gb":round(llm_path.stat().st_size/1e9,2) if llm_path.exists() else 0,
            "embedder":   (settings.weights_dir / "minilm-l6-v2").exists(),
            "whisper":    (settings.weights_dir / "whisper-tiny.en.pt").exists(),
            "clip":       (settings.weights_dir / "clip-vit-b32").exists(),
        },
        "index_stats": store.stats(),
        "system": {
            "platform":    platform.system(),
            "cpu_count":   psutil.cpu_count(),
            "ram_gb":      round(psutil.virtual_memory().total / 1e9, 1),
            "ram_free_gb": round(psutil.virtual_memory().available / 1e9, 1),
        },
    })


@router.get("/health/models")
async def model_status():
    return {
        "llm_warm":    is_loaded(),
        "llm_error":   get_error() or None,
        "index_stats": get_store().stats(),
    }
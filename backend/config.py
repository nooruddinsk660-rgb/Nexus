from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env.local", extra="ignore")

    # ── Offline mode ───────────────────────────────────────
    nexus_offline_mode: bool = True
    weights_dir: Path = Path("../weights")

    # ── LLM ────────────────────────────────────────────────
    llm_model_path: Path = Path("../weights/gemma4-e4b-q4_k_m.gguf")
    llm_n_ctx: int = 8192
    llm_n_threads: int = 6
    llm_n_gpu_layers: int = 0
    llm_max_tokens: int = 1024
    llm_temperature: float = 0.1

    # ── Embeddings ─────────────────────────────────────────
    embed_model_path: Path = Path("../weights/minilm-l6-v2")
    embed_dim: int = 384
    clip_model_path: Path = Path("../weights/clip-vit-b32")
    clip_dim: int = 512

    # ── Audio ──────────────────────────────────────────────
    whisper_model_path: Path = Path("../weights/whisper-tiny.en")
    whisper_model_size: str = "tiny.en"

    # ── Vector DB ──────────────────────────────────────────
    faiss_index_dir: Path = Path("./data/indexes")
    upload_dir: Path = Path("./data/uploads")
    chunk_size: int = 512
    chunk_overlap: int = 64
    retrieval_top_k: int = 5

    # ── Server ─────────────────────────────────────────────
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    def model_post_init(self, __context):
        # Ensure all paths exist on startup
        for path in [self.faiss_index_dir, self.upload_dir, self.weights_dir]:
            path.mkdir(parents=True, exist_ok=True)

settings = Settings()
# Triggered uvicorn reload

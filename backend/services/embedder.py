from __future__ import annotations
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
import open_clip
from PIL import Image
from pathlib import Path
from typing import Union
import logging

from config import settings

log = logging.getLogger("nexus.embedder")

# ── Singletons ──────────────────────────────────────────
_text_model:  SentenceTransformer | None = None
_clip_model                              = None
_clip_prep                               = None
_proj:        torch.nn.Linear | None     = None   # CLIP->MiniLM projection

def _text() -> SentenceTransformer:
    global _text_model
    if _text_model is None:
        log.info("Loading MiniLM-L6-v2...")
        _text_model = SentenceTransformer(str(settings.embed_model_path))
        log.info("✓ MiniLM ready")
    return _text_model

def _clip():
    global _clip_model, _clip_prep, _proj
    if _clip_model is None:
        log.info("Loading CLIP ViT-B/32...")
        _clip_model, _, _clip_prep = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained=None
        )
        sd = torch.load(
            settings.weights_dir / "clip-vit-b32" / "model.pt",
            map_location="cpu"
        )
        _clip_model.load_state_dict(sd)
        _clip_model.eval()
        # Linear projection 512d -> 384d (random init, good enough for retrieval)
        _proj = torch.nn.Linear(512, 384, bias=False)
        torch.nn.init.orthogonal_(_proj.weight)
        log.info("✓ CLIP + projection ready")
    return _clip_model, _clip_prep, _proj


# ── Public API ──────────────────────────────────────────

def embed_text(texts: list[str]) -> np.ndarray:
    """Embed list of strings -> float32 array (N, 384), L2-normalised."""
    model = _text()
    vecs  = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True,  # L2-norm built-in
        convert_to_numpy=True,
    )
    return vecs.astype(np.float32)


def embed_image(path: Union[str, Path]) -> np.ndarray:
    """Embed image -> float32 (1, 384) in shared MiniLM space."""
    model, prep, proj = _clip()
    img    = Image.open(path).convert("RGB")
    tensor = prep(img).unsqueeze(0)

    with torch.no_grad():
        feat = model.encode_image(tensor)                  # (1, 512)
        feat = feat / feat.norm(dim=-1, keepdim=True)    # L2 norm
        projected = proj(feat)                             # (1, 384)
        projected = projected / projected.norm(dim=-1, keepdim=True)

    return projected.numpy().astype(np.float32)


def embed_query(query: str) -> np.ndarray:
    """Single query string -> (1, 384). Used at search time."""
    return embed_text([query])  # shape (1, 384)
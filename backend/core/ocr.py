import easyocr
import open_clip
import torch
import asyncio
from PIL import Image
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
from config import settings

# ── Lazy singletons - loaded once, reused forever ────────
_ocr_reader:   Optional[easyocr.Reader]    = None
_clip_model                                = None
_clip_preproc                              = None

def _get_ocr() -> easyocr.Reader:
    global _ocr_reader
    if _ocr_reader is None:
        _ocr_reader = easyocr.Reader(
            ['en'],
            gpu=False,
            model_storage_directory=str(settings.weights_dir),
            download_enabled=False,    # offline mode
        )
    return _ocr_reader

def _get_clip():
    global _clip_model, _clip_preproc
    if _clip_model is None:
        _clip_model, _, _clip_preproc = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained=None
        )
        sd = torch.load(settings.weights_dir / "clip-vit-b32" / "model.pt",
                        map_location="cpu")
        _clip_model.load_state_dict(sd)
        _clip_model.eval()
    return _clip_model, _clip_preproc

@dataclass
class ImageRaw:
    ocr_text:      str
    clip_vector:   list[float]
    description:   str
    source:        str
    width:         int
    height:        int

async def parse_image(path: Path) -> list[ImageRaw]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _process_sync, path)

def _process_sync(path: Path) -> list[ImageRaw]:
    img = Image.open(path).convert("RGB")
    w, h = img.size

    # ── 1. OCR - extract text ───────────────────────────────
    reader   = _get_ocr()
    results  = reader.readtext(str(path), detail=0, paragraph=True)
    ocr_text = " ".join(results).strip()

    # ── 2. CLIP - generate visual embedding ─────────────────
    model, preproc = _get_clip()
    tensor = preproc(img).unsqueeze(0)
    with torch.no_grad():
        features = model.encode_image(tensor)
        features = features / features.norm(dim=-1, keepdim=True)  # L2 normalize
    clip_vec = features.squeeze().tolist()

    # ── 3. Build human description ──────────────────────────
    size_tag = f"{w}×{h}px"
    text_tag = f"Text: {ocr_text[:200]}" if ocr_text else "No text detected"
    description = f"[IMAGE {size_tag}] {path.stem}. {text_tag}"

    return [ImageRaw(
        ocr_text    = ocr_text,
        clip_vector = clip_vec,
        description = description,
        source      = str(path),
        width=w, height=h,
    )]

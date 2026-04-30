import fitz          # PyMuPDF
import asyncio
from pathlib import Path
from typing import List
from dataclasses import dataclass, field

@dataclass
class RawPage:
    page_num:   int
    text:       str
    images:     List[bytes] = field(default_factory=list)
    source:     str = ""

async def parse_pdf(path: Path) -> List[RawPage]:
    """Extract text + images from every page. Returns list of RawPage."""
    loop  = asyncio.get_event_loop()
    pages = await loop.run_in_executor(None, _extract_sync, path)
    return pages

def _extract_sync(path: Path) -> List[RawPage]:
    pages = []
    doc = fitz.open(str(path))

    for i, page in enumerate(doc):
        # ── Text extraction ────────────────────────────────────
        text = page.get_text("text").strip()

        # ── Embedded image extraction ──────────────────────────
        images = []
        for img_ref in page.get_images(full=True):
            xref = img_ref[0]
            base = doc.extract_image(xref)
            if base["width"] > 100 and base["height"] > 100:  # skip tiny icons
                images.append(base["image"])

        if text:   # skip blank pages
            pages.append(RawPage(
                page_num = i + 1,
                text     = _clean(text),
                images   = images,
                source   = str(path),
            ))

    doc.close()
    return pages

def _clean(text: str) -> str:
    import re
    text = re.sub(r'\n{3,}', '\n\n', text)   # collapse 3+ newlines
    text = re.sub(r'[ \t]+',  ' ',    text)   # collapse spaces
    text = re.sub(r'\f',       '',     text)   # remove form feeds
    return text.strip()

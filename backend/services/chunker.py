from langchain_text_splitters import RecursiveCharacterTextSplitter
import tiktoken
import uuid
from typing import Union, Optional
from models.schemas import Chunk, Modality

# ── Tokenizer (cl100k_base matches MiniLM tokenization closely) ──
_enc = tiktoken.get_encoding("cl100k_base")

def _token_len(text: str) -> int:
    return len(_enc.encode(text))

_splitter = RecursiveCharacterTextSplitter(
    chunk_size        = 512,
    chunk_overlap     = 64,
    length_function   = _token_len,
    separators        = ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
    is_separator_regex= False,
    keep_separator    = True,
)

def chunk_text(
    raw,                        # RawPage | RawSection | AudioSegment | ImageRaw
    source_path: str,
    modality:    Modality,
    page_num:    Optional[int]   = None,
    timestamp:   Optional[float] = None,
    heading:     Optional[str]   = None,
) -> list[Chunk]:
    """Convert any raw parser output into a list of Chunk objects."""

    # ── Normalise input to text ──────────────────────────────
    from services.pdf_parser   import RawPage
    from services.docx_parser  import RawSection
    from core.audio            import AudioSegment
    from core.ocr              import ImageRaw

    if isinstance(raw, list):   # handle list[RawPage] etc.
        chunks = []
        for item in raw:
            chunks.extend(chunk_text(item, source_path, modality))
        return chunks

    if isinstance(raw, RawPage):
        text, page_num = raw.text, raw.page_num
    elif isinstance(raw, RawSection):
        text, heading = raw.text, raw.heading
    elif isinstance(raw, AudioSegment):
        text, timestamp = raw.text, raw.start_sec
    elif isinstance(raw, ImageRaw):
        text = raw.description    # OCR description
    else:
        text = str(raw)

    if not text.strip():
        return []

    # ── Split into chunks ────────────────────────────────────
    pieces = _splitter.split_text(text)

    return [
        Chunk(
            chunk_id    = str(uuid.uuid4()),
            text        = piece,
            source_path = source_path,
            modality    = modality,
            page        = page_num,
            timestamp   = timestamp,
            heading     = heading,
            token_count = _token_len(piece),
        )
        for piece in pieces if piece.strip()
    ]

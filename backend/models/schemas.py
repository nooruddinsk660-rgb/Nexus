from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List
import uuid

class Modality(str, Enum):
    text  = "text"
    image = "image"
    audio = "audio"

# ── The core unit of everything ──────────────────────────
class Chunk(BaseModel):
    """
    One chunk of content from any source.
    This is the only thing the vector store ever stores.
    """
    chunk_id:    str            = Field(default_factory=lambda: str(uuid.uuid4()))
    text:        str            # searchable text content
    source_path: str            # original file path
    modality:    Modality
    page:        Optional[int]  = None   # PDF page number
    timestamp:   Optional[float]= None   # audio start time (seconds)
    heading:     Optional[str]  = None   # DOCX heading context
    token_count: int            = 0
    file_id:     Optional[str]  = None   # parent file UUID

    # populated by Phase 02 embedder
    embedding:   Optional[List[float]] = None

# ── API contracts ─────────────────────────────────────────
class Source(BaseModel):
    chunk_id:    str
    source_path: str
    modality:    Modality
    page:        Optional[int]   = None
    timestamp:   Optional[float] = None
    heading:     Optional[str]   = None
    score:       float           = 0.0
    snippet:     str             = ""   # 120-char preview

class QueryRequest(BaseModel):
    query:      str  = Field(..., min_length=1, max_length=2000)
    session_id: str  = Field(default_factory=lambda: str(uuid.uuid4()))
    top_k:      int  = Field(default=5, ge=1, le=20)

class QueryResponse(BaseModel):
    answer:     str
    sources:    List[Source]
    session_id: str
    latency_ms: float
    confidence: float

class IngestResponse(BaseModel):
    file_id:  str
    filename: str
    modality: str
    chunks:   int
    status:   str

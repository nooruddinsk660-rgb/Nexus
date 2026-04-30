from __future__ import annotations
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path

from core.vector_store import get_store
from models.schemas    import Modality

router = APIRouter(prefix="/cite", tags=["citations"])

MEDIA: dict[str, str] = {
    Modality.text:  "application/pdf",
    Modality.image: "image/jpeg",
    Modality.audio: "audio/mpeg",
}

EXT_MEDIA: dict[str, str] = {
    ".pdf":  "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt":  "text/plain",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".mp3":  "audio/mpeg",
    ".mp4":  "audio/mp4",
    ".wav":  "audio/wav",
    ".m4a":  "audio/mp4",
    ".ogg":  "audio/ogg",
}


def _get_row(chunk_id: str) -> tuple:
    row = get_store()._db.execute(
        "SELECT chunk_id,text,source_path,modality,page,"
        "timestamp,heading,token_count,file_id "
        "FROM chunks WHERE chunk_id=?",
        (chunk_id,),
    ).fetchone()
    if not row:
        raise HTTPException(404, f"Chunk not found: {chunk_id}")
    return row


# ── GET /api/cite/{chunk_id} ──────────────────────────────────
@router.get("/{chunk_id}")
async def get_citation(chunk_id: str):
    """Full chunk metadata - used by SourcePanel on chip click."""
    row  = _get_row(chunk_id)
    path = Path(row[2])
    return {
        "chunk_id":    row[0],
        "text":        row[1],
        "source_path": row[2],
        "modality":    row[3],
        "page":        row[4],
        "timestamp":   row[5],
        "heading":     row[6],
        "token_count": row[7],
        "file_id":     row[8],
        "filename":    path.name,
        "exists":      path.exists(),
        "size":        path.stat().st_size if path.exists() else 0,
    }


# ── GET /api/cite/{chunk_id}/file ─────────────────────────────
@router.get("/{chunk_id}/file")
async def serve_file(chunk_id: str):
    """Serve raw source file bytes for PDF/image/audio viewer."""
    row  = _get_row(chunk_id)
    path = Path(row[2])

    if not path.exists():
        raise HTTPException(404, f"Source file missing from disk: {path.name}")

    ext        = path.suffix.lower()
    media_type = EXT_MEDIA.get(ext, "application/octet-stream")

    return FileResponse(
        path       = str(path),
        media_type = media_type,
        filename   = path.name,
        content_disposition_type = "inline",
        headers    = {
            "Cache-Control":                "no-store",
            "Access-Control-Allow-Origin":  "http://localhost:5173",
            "Access-Control-Expose-Headers":"Content-Disposition",
        },
    )


# ── GET /api/cite/{chunk_id}/inspect ─────────────────────────
@router.get("/{chunk_id}/inspect")
async def inspect_chunk(chunk_id: str):
    """Full chunk + adjacent chunks from same file - for debug panel."""
    row   = _get_row(chunk_id)
    store = get_store()

    siblings = store._db.execute(
        "SELECT chunk_id, text, page, timestamp "
        "FROM chunks WHERE source_path=? AND chunk_id!=? "
        "ORDER BY rowid LIMIT 4",
        (row[2], chunk_id),
    ).fetchall()

    keys = ["chunk_id","text","source_path","modality",
            "page","timestamp","heading","token_count","file_id"]

    return {
        "chunk":    dict(zip(keys, row)),
        "filename": Path(row[2]).name,
        "siblings": [
            {
                "chunk_id":  s[0],
                "text":      s[1][:200] + "…" if len(s[1]) > 200 else s[1],
                "page":      s[2],
                "timestamp": s[3],
            }
            for s in siblings
        ],
    }


# ── GET /api/cite/search?q=... ────────────────────────────────
@router.get("/search")
async def search_chunks(q: str, limit: int = 10):
    """Full-text search over chunk text - for command palette."""
    store = get_store()
    rows  = store._db.execute(
        "SELECT chunk_id, text, source_path, modality, page, timestamp "
        "FROM chunks WHERE text LIKE ? LIMIT ?",
        (f"%{q}%", limit),
    ).fetchall()

    return {
        "query":   q,
        "results": [
            {
                "chunk_id":    r[0],
                "snippet":     r[1][:150] + "…" if len(r[1]) > 150 else r[1],
                "source_path": r[2],
                "filename":    Path(r[2]).name,
                "modality":    r[3],
                "page":        r[4],
                "timestamp":   r[5],
            }
            for r in rows
        ],
    }
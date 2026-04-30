from fastapi import APIRouter, UploadFile, File, HTTPException
import aiofiles, uuid, time, logging
from pathlib import Path

from config             import settings
from services.ingestion  import ingest_file, SUPPORTED
from core.vector_store   import get_store
from models.schemas      import IngestResponse

log    = logging.getLogger("nexus.ingest")
router = APIRouter(tags=["ingest"])


@router.post("/ingest", response_model=IngestResponse)
async def ingest_upload(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in SUPPORTED:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {ext}. Supported: {list(SUPPORTED.keys())}",
        )

    # ── save to disk ──────────────────────────────────────────
    file_id   = str(uuid.uuid4())[:8]
    safe_name = f"{file_id}_{file.filename}"
    dest      = settings.upload_dir / safe_name

    async with aiofiles.open(dest, "wb") as f:
        while chunk := await file.read(65536):
            await f.write(chunk)

    file_size = dest.stat().st_size
    log.info("Saved %s (%.1f KB)", safe_name, file_size / 1024)

    # ── parse + chunk + embed + store ─────────────────────────
    t0     = time.monotonic()
    chunks = await ingest_file(dest, file_id=file_id)

    if not chunks:
        dest.unlink(missing_ok=True)
        raise HTTPException(422, "No content could be extracted from this file.")

    store = get_store()
    n     = store.add_chunks(chunks)
    store.save()
    ms    = round((time.monotonic() - t0) * 1000)

    log.info("Indexed %d chunks from %s in %dms", n, file.filename, ms)

    return IngestResponse(
        file_id  = file_id,
        filename = file.filename,
        modality = SUPPORTED[ext].value,
        chunks   = n,
        status   = f"indexed {n} chunks in {ms}ms",
    )


@router.get("/ingest/files")
async def list_files():
    """Return all indexed files with their chunk counts."""
    store = get_store()
    rows  = store._db.execute(
        "SELECT file_id, source_path, modality, COUNT(*) as chunks "
        "FROM chunks GROUP BY file_id ORDER BY rowid DESC"
    ).fetchall()

    files = []
    for row in rows:
        p = Path(row[1])
        files.append({
            "file_id":  row[0],
            "filename": p.name,
            "modality": row[2],
            "chunks":   row[3],
            "size":     p.stat().st_size if p.exists() else 0,
        })
    return { "files": files }


@router.delete("/ingest/{file_id}")
async def delete_file(file_id: str):
    """Remove a file and all its chunks from the index."""
    store = get_store()
    row   = store._db.execute(
        "SELECT source_path FROM chunks WHERE file_id=? LIMIT 1",
        (file_id,)
    ).fetchone()

    if not row:
        raise HTTPException(404, "File not found in index")

    # delete from SQLite
    store._db.execute("DELETE FROM chunks WHERE file_id=?", (file_id,))
    store._db.commit()

    # delete physical file
    p = Path(row[0])
    p.unlink(missing_ok=True)

    # rebuild FAISS indexes (simplest correct approach)
    store._rebuild_from_db()
    store.save()

    return { "deleted": file_id }

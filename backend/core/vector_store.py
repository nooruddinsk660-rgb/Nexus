from __future__ import annotations
import faiss
import numpy as np
import sqlite3
import json
import logging
from pathlib import Path
from dataclasses import dataclass

from models.schemas import Chunk, Modality, Source
from services.embedder import embed_text, embed_image
from config import settings

log = logging.getLogger("nexus.vstore")
DIM = 384   # unified embedding dimension


class VectorStore:
    """Three FAISS IndexFlatIP indices - text, image, audio.
    Backed by SQLite for chunk metadata.
    All operations offline. Thread-safe reads.
    """

    def __init__(self):
        self._idx: dict[str, faiss.IndexFlatIP] = {
            Modality.text:  faiss.IndexFlatIP(DIM),
            Modality.image: faiss.IndexFlatIP(DIM),
            Modality.audio: faiss.IndexFlatIP(DIM),
        }
        self._id_map: dict[str, list[str]] = {   # modality -> [chunk_id, ...]
            Modality.text: [], Modality.image: [], Modality.audio: [],
        }
        self._db = self._init_db()
        log.info("VectorStore initialised - DIM=%d", DIM)

    # ── SQLite setup ────────────────────────────────────────
    def _init_db(self) -> sqlite3.Connection:
        db_path = settings.faiss_index_dir / "chunks.db"
        conn    = sqlite3.connect(str(db_path), check_same_thread=False)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chunks (
                chunk_id    TEXT PRIMARY KEY,
                text        TEXT,
                source_path TEXT,
                modality    TEXT,
                page        INTEGER,
                timestamp   REAL,
                heading     TEXT,
                token_count INTEGER,
                file_id     TEXT
            )
        """)
        conn.commit()
        return conn

    # ── Add chunks ──────────────────────────────────────────
    def add_chunks(self, chunks: list[Chunk]) -> int:
        """Embed + index list of chunks. Returns count added."""
        by_mod: dict[str, list[Chunk]] = {
            Modality.text: [], Modality.image: [], Modality.audio: []
        }
        for c in chunks:
            by_mod[c.modality].append(c)

        total = 0
        for mod, mod_chunks in by_mod.items():
            if not mod_chunks:
                continue

            # Embed
            if mod == Modality.image:
                vecs = np.vstack([
                    embed_image(c.source_path) for c in mod_chunks
                ])
            else:
                vecs = embed_text([c.text for c in mod_chunks])

            # Normalise (ensure unit vectors for IP = cosine)
            faiss.normalize_L2(vecs)

            # Add to FAISS
            self._idx[mod].add(vecs)
            self._id_map[mod].extend(c.chunk_id for c in mod_chunks)

            # Persist to SQLite
            with self._db:
                self._db.executemany("""
                    INSERT OR REPLACE INTO chunks VALUES
                    (?,?,?,?,?,?,?,?,?)
                """, [(
                    c.chunk_id, c.text, c.source_path, c.modality,
                    c.page, c.timestamp, c.heading,
                    c.token_count, c.file_id,
                ) for c in mod_chunks])

            total += len(mod_chunks)
            log.info("  +%d %s chunks -> index size: %d",
                     len(mod_chunks), mod, self._idx[mod].ntotal)

        return total

    # ── Search ──────────────────────────────────────────────
    def search(
        self,
        query_vec: np.ndarray,
        modalities: list[str] = None,
        top_k: int = 5,
    ) -> list[Source]:
        """Search across modalities. Returns top_k Sources sorted by score."""
        if modalities is None:
            modalities = list(Modality)

        q = query_vec.astype(np.float32)
        faiss.normalize_L2(q)
        results: list[tuple[float, str]] = []

        for mod in modalities:
            idx = self._idx[mod]
            if idx.ntotal == 0:
                continue
            k    = min(top_k, idx.ntotal)
            D, I = idx.search(q, k)   # D=scores, I=positions
            for score, pos in zip(D[0], I[0]):
                if pos == -1:
                    continue
                chunk_id = self._id_map[mod][pos]
                results.append((float(score), chunk_id))

        # Sort by score descending, take top_k
        results.sort(key=lambda x: -x[0])
        results = results[:top_k]

        # Hydrate from SQLite
        sources = []
        for score, chunk_id in results:
            row = self._db.execute(
                "SELECT * FROM chunks WHERE chunk_id=?", (chunk_id,)
            ).fetchone()
            if row:
                sources.append(Source(
                    chunk_id    = row[0],
                    source_path = row[2],
                    modality    = row[3],
                    page        = row[4],
                    timestamp   = row[5],
                    heading     = row[6],
                    score       = round(score, 4),
                    snippet     = row[1][:120] + "..." if len(row[1]) > 120 else row[1],
                ))
        return sources

    # ── Persistence ─────────────────────────────────────────
    def save(self):
        """Write all FAISS indices + id_maps to disk."""
        base = settings.faiss_index_dir
        for mod, idx in self._idx.items():
            faiss.write_index(idx, str(base / f"{mod}.index"))
            (base / f"{mod}.ids.json").write_text(
                json.dumps(self._id_map[mod])
            )
        log.info("VectorStore saved -> %s", base)

    def load(self):
        """Hot-reload all indices from disk on startup."""
        base = settings.faiss_index_dir
        for mod in Modality:
            idx_path = base / f"{mod}.index"
            ids_path = base / f"{mod}.ids.json"
            if idx_path.exists():
                self._idx[mod]    = faiss.read_index(str(idx_path))
                self._id_map[mod] = json.loads(ids_path.read_text())
                log.info("  loaded %s: %d vectors", mod, self._idx[mod].ntotal)
        log.info("VectorStore hot-reload complete")

    def _rebuild_from_db(self):
        """Rebuild FAISS indexes from SQLite after a deletion."""
        # reset indexes
        for mod in Modality:
            self._idx[mod]    = faiss.IndexFlatIP(DIM)
            self._id_map[mod] = []

        rows = self._db.execute(
            "SELECT chunk_id, text, source_path, modality FROM chunks"
        ).fetchall()

        by_mod: dict[str, list] = {m: [] for m in Modality}
        for row in rows:
            mod = row[3]
            if mod in by_mod:
                by_mod[mod].append(row)

        for mod, rows_m in by_mod.items():
            if not rows_m:
                continue
            if mod == Modality.image:
                vecs = np.vstack([
                    embed_image(r[2]) for r in rows_m
                ])
            else:
                vecs = embed_text([r[1] for r in rows_m])

            faiss.normalize_L2(vecs)
            self._idx[mod].add(vecs)
            self._id_map[mod].extend(r[0] for r in rows_m)

        log.info("Rebuilt FAISS from DB - %s", self.stats())

    def stats(self) -> dict:
        return {mod.value: self._idx[mod].ntotal for mod in Modality}


# ── Global singleton ─────────────────────────────────────
_store: VectorStore | None = None

def get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
        _store.load()
    return _store
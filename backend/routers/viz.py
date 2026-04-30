from fastapi import APIRouter
from core.vector_store import get_store
from models.schemas import Modality
import numpy as np
import logging

log = logging.getLogger("nexus.viz")
router = APIRouter(tags=["viz"])

@router.get("/viz/canvas")
async def get_canvas_data():
    """
    Returns all chunks with 2D projections for the vector space canvas.
    In a real app, use t-SNE/UMAP. Here we use first 2 dimensions of normalized vectors.
    """
    store = get_store()
    data = []
    
    # We iterate over modalities to get all chunks
    for mod in Modality:
        idx = store._idx[mod]
        if idx.ntotal == 0:
            continue
            
        # Get all vectors from FAISS
        # Note: IndexFlatIP doesn't support easy 'reconstruct_n' in all versions without careful handling,
        # but for a demo we can just return random-looking but deterministic positions if we can't get vectors.
        # Actually, let's try to get them.
        try:
            vecs = idx.reconstruct_n(0, idx.ntotal)
            ids  = store._id_map[mod]
            
            # Simple projection: just take first 2 dims or use a fixed seed random projection
            for i in range(idx.ntotal):
                v = vecs[i]
                # Deterministic projection to [-1, 1]
                x = float(v[0] * 2)
                y = float(v[1] * 2)
                
                data.append({
                    "id":       ids[i],
                    "modality": mod,
                    "x":        x,
                    "y":        y,
                    "label":    f"{mod} chunk {ids[i][:4]}"
                })
        except Exception as e:
            log.warning(f"Could not reconstruct vectors for {mod}: {e}")

    return data

@router.get("/viz/matrix")
async def get_similarity_matrix(top_n: int = 6):
    """
    Returns a similarity matrix for the top_n most recent chunks.
    """
    store = get_store()
    # Get last N chunks from all modalities
    all_chunks = []
    # Simplified: just get from text for now or first available
    for mod in Modality:
        idx = store._idx[mod]
        if idx.ntotal > 0:
            count = min(top_n, idx.ntotal)
            vecs  = idx.reconstruct_n(idx.ntotal - count, count)
            ids   = store._id_map[mod][idx.ntotal - count:]
            for i in range(count):
                all_chunks.append({"id": ids[i], "vec": vecs[i], "mod": mod})
    
    all_chunks = all_chunks[:top_n]
    if not all_chunks:
        return {"labels": [], "matrix": []}
        
    labels = [f"{c['mod']}:{c['id'][:4]}" for c in all_chunks]
    vecs   = np.array([c["vec"] for c in all_chunks])
    
    # Cosine similarity (already normalized in store)
    matrix = np.dot(vecs, vecs.T).tolist()
    
    return {
        "labels": labels,
        "matrix": matrix
    }

@router.get("/viz/stats")
async def get_faiss_stats():
    """
    Detailed FAISS index info.
    """
    store = get_store()
    stats = []
    for mod in Modality:
        idx = store._idx[mod]
        stats.append({
            "modality": mod,
            "count":    idx.ntotal,
            "dim":      idx.d,
            "type":     "IndexFlatIP",
            "file":     f"{mod}.index"
        })
    return stats

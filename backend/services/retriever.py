"""
NEXUS Retrieval Engine
Implements state-of-the-art RAG retrieval techniques:
- HyDE (Hypothetical Document Embeddings)
- Query expansion
- Multi-stage re-ranking
- BM25 keyword boost
- Diversity filtering
- Cross-encoder style re-scoring
"""
from __future__ import annotations
import re
import time
import logging
from pathlib import Path
from collections import defaultdict

from core.vector_store      import get_store
from services.embedder       import embed_query, embed_text
from services.reasoning_engine import analyse_query
from models.schemas          import Source, Modality

log = logging.getLogger("nexus.retriever")


def retrieve(
    query:      str,
    top_k:      int  = 8,
    modalities: list | None = None,
) -> tuple[list[Source], float]:
    """
    Full retrieval pipeline. Returns ranked sources + latency.

    Pipeline:
    1. Query analysis
    2. HyDE augmentation
    3. Multi-vector semantic search
    4. BM25 keyword re-scoring
    5. Cross-modal re-ranking
    6. Diversity filtering
    7. Final ranking
    """
    t0       = time.monotonic()
    analysis = analyse_query(query)

    log.info(
        "Retrieval: intent=%s complexity=%s subs=%d hydes=%d",
        analysis.intent, analysis.complexity,
        len(analysis.sub_questions), len(analysis.hyde_docs),
    )

    store    = get_store()
    all_hits: dict[str, tuple[Source, float]] = {}

    def _search_and_merge(text: str, weight: float = 1.0):
        """Embed text and merge results into all_hits."""
        try:
            q_vec   = embed_query(text)
            sources = store.search(q_vec, modalities=modalities, top_k=top_k + 4)
            for s in sources:
                weighted = s.score * weight
                if s.chunk_id not in all_hits:
                    s.score = weighted
                    all_hits[s.chunk_id] = (s, weighted)
                else:
                    prev_score = all_hits[s.chunk_id][1]
                    if weighted > prev_score:
                        s.score = weighted
                        all_hits[s.chunk_id] = (s, weighted)
        except Exception as e:
            log.warning("Search failed for '%s...': %s", text[:30], e)

    # ── Stage 1: Original query (full weight) ─────────────────
    _search_and_merge(query, weight=1.0)

    # ── Stage 2: HyDE queries (0.85 weight) ───────────────────
    for hyde in analysis.hyde_docs:
        _search_and_merge(hyde, weight=0.85)

    # ── Stage 3: Sub-questions (0.75 weight) ──────────────────
    for sq in analysis.sub_questions[:3]:
        if sq != query:
            _search_and_merge(sq, weight=0.75)

    candidates = [s for s, _ in all_hits.values()]

    # ── Stage 4: BM25 boost ───────────────────────────────────
    candidates = _bm25_boost(query, candidates)

    # ── Stage 5: Re-rank ──────────────────────────────────────
    candidates = _rerank(query, analysis, candidates)

    # ── Stage 6: Diversity filter ─────────────────────────────
    candidates = _diversity_filter(candidates, max_per_source=3)

    result = candidates[:top_k]
    ms     = round((time.monotonic() - t0) * 1000, 1)

    log.info(
        "Retrieved %d sources from %d candidates in %sms | top_score=%.3f",
        len(result), len(candidates), ms,
        result[0].score if result else 0,
    )

    return result, ms


def _bm25_boost(query: str, sources: list[Source]) -> list[Source]:
    """BM25-inspired term frequency boost."""
    keywords = set(re.findall(r'\b\w{3,}\b', query.lower()))
    STOP     = {
        "the","and","for","are","was","with","this","that","from",
        "have","been","will","what","how","why","can","does","did",
        "its","get","got","any","all","has","had","not","but","are",
    }
    keywords -= STOP
    if not keywords:
        return sources

    max_score = max((s.score for s in sources), default=1.0)

    for s in sources:
        text_lower = (s.snippet + " " + (s.heading or "")).lower()
        # Term frequency
        tf    = sum(text_lower.count(kw) for kw in keywords)
        boost = min(0.12, tf * 0.015)
        s.score = min(max_score * 1.15, s.score + boost)

    return sources


def _rerank(query: str, analysis, sources: list[Source]) -> list[Source]:
    """
    Multi-factor re-ranker.
    Mimics cross-encoder behaviour without the overhead.
    """
    q_lower = query.lower()
    q_words = set(re.findall(r'\b\w{4,}\b', q_lower))

    for s in sources:
        score = s.score
        text  = s.snippet.lower()

        # Factor 1: snippet length (longer = more info)
        length_factor = min(1.0, len(s.snippet) / 400)
        score *= (0.85 + 0.15 * length_factor)

        # Factor 2: heading match bonus
        if s.heading:
            head_lower = s.heading.lower()
            head_words = set(re.findall(r'\b\w{4,}\b', head_lower))
            if q_words & head_words:
                score = min(1.0, score * 1.12)

        # Factor 3: exact phrase match bonus
        # Check if 3+ consecutive query words appear in snippet
        q_ngrams = _ngrams(q_lower.split(), 3)
        for ng in q_ngrams:
            if ng in text:
                score = min(1.0, score * 1.08)
                break

        # Factor 4: intent-specific boosts
        if analysis.intent == "code":
            if any(w in text for w in ["class ","def ","function","public ",
                                        "private ","return","import","void "]):
                score = min(1.0, score * 1.10)
        elif analysis.intent == "list":
            if any(c in s.snippet for c in ["•","–","-","1.","2.","a.","b."]):
                score = min(1.0, score * 1.08)

        # Factor 5: penalise very short snippets
        if len(s.snippet) < 40:
            score *= 0.75

        # Factor 6: penalise very late sections (often references/appendix)
        if s.page and s.page > 30:
            score *= 0.92

        s.score = round(score, 4)

    sources.sort(key=lambda x: -x.score)
    return sources


def _ngrams(words: list[str], n: int) -> list[str]:
    return [" ".join(words[i:i+n]) for i in range(len(words)-n+1)]


def _diversity_filter(
    sources:        list[Source],
    max_per_source: int = 3,
) -> list[Source]:
    """Ensures results come from diverse parts of the knowledge base."""
    counts: dict[str, int] = defaultdict(int)
    result: list[Source]   = []

    for s in sources:
        key = Path(s.source_path).name
        if counts[key] < max_per_source:
            result.append(s)
            counts[key] += 1

    return result
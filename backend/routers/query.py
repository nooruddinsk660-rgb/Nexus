from __future__ import annotations
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import json, time, asyncio, logging

from models.schemas               import QueryRequest
from services.retriever           import retrieve
from services.prompt_builder      import build_prompt
from services.reasoning_engine    import analyse_query
from services.llm                 import generate_stream, get_model_family
from services.session             import get_session, save_turn
from services.guard               import should_generate, hallucination_score, NOT_FOUND
from services.response_processor  import process_response

log    = logging.getLogger("nexus.query")
router = APIRouter(tags=["query"])


@router.post("/query/stream")
async def query_stream(req: QueryRequest):

    async def event_gen():
        t0 = time.monotonic()

        # ── 1. Deep query analysis ────────────────────────────
        analysis = analyse_query(req.query)
        log.info(
            "query='%s' intent=%s complexity=%s",
            req.query[:40], analysis.intent, analysis.complexity,
        )

        # ── 2. Smart retrieval with HyDE ─────────────────────
        sources, r_ms = retrieve(req.query, top_k=req.top_k)

        yield {
            "event": "sources",
            "data":  json.dumps([s.dict() for s in sources]),
        }

        # ── 3. Guard ─────────────────────────────────────────
        if not should_generate(sources):
            yield {"event": "token", "data": NOT_FOUND}
            yield {
                "event": "done",
                "data":  json.dumps({
                    "latency_ms": round((time.monotonic()-t0)*1000,1),
                    "confidence": 0.0,
                    "session_id": req.session_id,
                }),
            }
            return

        # ── 4. Build intelligence-rich prompt ─────────────────
        history = get_session(req.session_id)
        family  = get_model_family()
        prompt  = build_prompt(
            query        = req.query,
            sources      = sources,
            history      = history,
            model_family = family,
            analysis     = analysis,
        )

        # ── 5. Stream generation ──────────────────────────────
        full        = ""
        token_count = 0
        max_tokens  = _get_max_tokens(analysis)

        try:
            for token in generate_stream(
                prompt,
                max_tokens  = max_tokens,
                temperature = _get_temperature(analysis),
            ):
                full        += token
                token_count += 1
                yield {"event": "token", "data": token}
                await asyncio.sleep(0)

                if token_count > max_tokens + 50:
                    break

        except Exception as e:
            log.error("Stream error: %s", e)
            yield {"event": "token", "data": f"\n[Error: {e}]"}

        # ── 6. Post-process to Claude-level quality ───────────
        cleaned = process_response(full, sources, req.query)

        # If post-processing changed the text significantly, send correction
        if cleaned != full and len(cleaned) > 20:
            yield {"event": "correction", "data": cleaned}

        # ── 7. Save + done ────────────────────────────────────
        save_turn(req.session_id, req.query, cleaned)

        yield {
            "event": "done",
            "data":  json.dumps({
                "latency_ms": round((time.monotonic()-t0)*1000, 1),
                "confidence": hallucination_score(cleaned, sources),
                "session_id": req.session_id,
                "intent":     analysis.intent,
                "tokens":     token_count,
            }),
        }

    return EventSourceResponse(event_gen())


def _get_max_tokens(analysis) -> int:
    mapping = {
        "summarize": 1200,
        "explain":   900,
        "list":      700,
        "compare":   1000,
        "code":      1100,
        "qa":        600,
    }
    return mapping.get(analysis.intent, 800)


def _get_temperature(analysis) -> float:
    """
    Lower temp = more factual (good for QA/list).
    Higher temp = more fluent (good for summaries).
    """
    mapping = {
        "summarize": 0.20,
        "explain":   0.15,
        "list":      0.05,
        "compare":   0.15,
        "code":      0.05,
        "qa":        0.10,
    }
    return mapping.get(analysis.intent, 0.10)
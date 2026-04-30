from __future__ import annotations
from pathlib import Path
from dataclasses import dataclass, field
from typing import Callable
import re
import logging

log = logging.getLogger("nexus.reasoning")


# ══════════════════════════════════════════════════════════════
#  QUERY ANALYSIS
# ══════════════════════════════════════════════════════════════

@dataclass
class QueryAnalysis:
    query:          str
    intent:         str          # summarize | explain | list | compare | code | qa
    complexity:     str          # simple | medium | complex
    sub_questions:  list[str]    # decomposed sub-questions
    hyde_docs:      list[str]    # hypothetical answer fragments for HyDE retrieval
    response_format: str         # prose | bullets | numbered | table | code
    expected_length: str         # brief | medium | detailed


def analyse_query(query: str) -> QueryAnalysis:
    """
    Deeply analyse the query to plan optimal retrieval + response.
    This is what Claude does internally before answering.
    """
    q     = query.strip()
    lower = q.lower()

    # ── Intent detection ─────────────────────────────────────
    intent = _detect_intent(lower)

    # ── Complexity scoring ────────────────────────────────────
    words      = q.split()
    complexity = "complex" if len(words) > 15 or "and" in lower and "also" in lower \
                 else "medium" if len(words) > 6 \
                 else "simple"

    # ── Sub-question decomposition ────────────────────────────
    sub_questions = _decompose_query(q, intent, complexity)

    # ── HyDE: generate hypothetical answer fragments ──────────
    hyde_docs = _generate_hyde(q, intent)

    # ── Response format ───────────────────────────────────────
    response_format = _pick_format(intent, complexity)

    # ── Expected length ───────────────────────────────────────
    length = "detailed" if intent in ("summarize","explain","compare") \
             else "medium" if complexity == "medium" \
             else "brief"

    return QueryAnalysis(
        query           = q,
        intent          = intent,
        complexity      = complexity,
        sub_questions   = sub_questions,
        hyde_docs       = hyde_docs,
        response_format = response_format,
        expected_length = length,
    )


def _detect_intent(q: str) -> str:
    if any(w in q for w in ["summarize","summarise","summary","overview",
                             "briefly","recap","tldr","gist"]):
        return "summarize"
    if any(w in q for w in ["explain","what is","what are","how does",
                             "how do","why does","why is","define",
                             "describe","tell me about","elaborate"]):
        return "explain"
    if any(w in q for w in ["list","all","every","which","enumerate",
                             "show all","give all","what are all"]):
        return "list"
    if any(w in q for w in ["compare","difference","vs","versus",
                             "better","worse","pros","cons","contrast"]):
        return "compare"
    if any(w in q for w in ["code","program","implement","function",
                             "class","method","syntax","write","debug"]):
        return "code"
    return "qa"


def _decompose_query(q: str, intent: str, complexity: str) -> list[str]:
    """
    Break complex query into atomic sub-questions.
    Claude does this — answers each part then synthesises.
    """
    if complexity == "simple":
        return [q]

    subs = []

    if intent == "summarize":
        subs = [
            f"What is the main topic of this document?",
            f"What are the key sections or topics covered?",
            f"What are the most important details or findings?",
        ]
    elif intent == "explain":
        topic = q.replace("explain ","").replace("what is ","").strip()
        subs  = [
            f"What is {topic}?",
            f"How does {topic} work?",
            f"Why is {topic} important?",
        ]
    elif intent == "compare":
        subs = [
            f"What are the properties of the first item?",
            f"What are the properties of the second item?",
            f"What are the key differences?",
        ]
    elif intent == "list":
        subs = [q, f"Are there any additional related items?"]
    else:
        # For complex QA, extract sub-questions by conjunctions
        parts = re.split(r'\band\b|\balso\b|\bfurthermore\b|\badditionally\b', q)
        subs  = [p.strip() for p in parts if len(p.strip()) > 10]
        if not subs:
            subs = [q]

    return subs[:4]   # max 4 sub-questions


def _generate_hyde(q: str, intent: str) -> list[str]:
    """
    HyDE: generate hypothetical answers that WOULD answer this query.
    Use these as additional search vectors for better retrieval.
    This is a proven technique — improves retrieval by 15-30%.
    """
    lower = q.lower()
    hydes = []

    if intent == "summarize":
        hydes = [
            "This document covers the following main topics and key points:",
            "The main content includes information about",
            "Overview: The document discusses",
        ]
    elif intent == "explain":
        topic = lower.replace("explain ","").replace("what is ","")[:40]
        hydes = [
            f"{topic} is defined as",
            f"The concept of {topic} involves",
            f"{topic} works by",
        ]
    elif intent == "list":
        hydes = [
            "The following items are included:",
            "List of all relevant entries:",
        ]
    elif intent == "code":
        hydes = [
            "The program implements",
            "The code uses the following structure:",
            "Implementation details:",
        ]
    else:
        hydes = [
            f"The answer to '{q[:40]}' is",
            f"Regarding '{q[:30]}':",
        ]

    return hydes


def _pick_format(intent: str, complexity: str) -> str:
    mapping = {
        "summarize": "structured",
        "explain":   "prose_with_bullets",
        "list":      "numbered",
        "compare":   "table_or_bullets",
        "code":      "code_blocks",
        "qa":        "prose" if complexity == "simple" else "prose_with_bullets",
    }
    return mapping.get(intent, "prose")

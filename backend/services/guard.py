from __future__ import annotations
from models.schemas import Source
import re

MIN_SCORE = 0.12
NOT_FOUND = "I couldn't find this in your knowledge base."


def should_generate(sources: list[Source]) -> bool:
    if not sources:
        return False
    # Pass if top source has any relevance at all
    return sources[0].score >= MIN_SCORE


def hallucination_score(answer: str, sources: list[Source]) -> float:
    if not answer.strip() or not sources:
        return 0.0
    if NOT_FOUND in answer:
        return 0.0

    # Word overlap between answer and all source snippets
    ans_words = set(re.findall(r'\b\w{4,}\b', answer.lower()))
    src_words: set[str] = set()
    for s in sources:
        src_words.update(re.findall(r'\b\w{4,}\b', s.snippet.lower()))

    if not ans_words:
        return 0.0

    overlap = len(ans_words & src_words) / len(ans_words)
    base    = sources[0].score

    return round(min(1.0, base * 0.65 + overlap * 0.35), 3)
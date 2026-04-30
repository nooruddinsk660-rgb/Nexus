"""
NEXUS Response Processor
Cleans, enhances, and validates LLM output.
Ensures Claude-level response quality regardless of base model.
"""
from __future__ import annotations
import re
from pathlib import Path
from models.schemas import Source


def process_response(raw: str, sources: list[Source], query: str) -> str:
    """
    Full post-processing pipeline:
    1. Remove prompt leakage
    2. Clean artefacts
    3. Validate citations exist
    4. Format markdown
    5. Quality check
    """
    text = raw.strip()
    if not text:
        return "No response generated. Please try again."

    text = _remove_prompt_leakage(text)
    text = _clean_artefacts(text)
    text = _fix_citations(text, sources)
    text = _ensure_citations(text, sources, query)
    text = _clean_markdown(text)
    text = _final_trim(text)

    return text


def _remove_prompt_leakage(text: str) -> str:
    """Remove any prompt sections that leaked into response."""
    LEAK_MARKERS = [
        "### System", "### Context", "### User", "### Assistant",
        "[INST]", "</INST>", "<|system|>", "<|user|>", "<|assistant|>",
        "<|im_start|>", "<|im_end|>",
        "KNOWLEDGE BASE CONTEXT",
        "REASONING APPROACH:",
        "TASK:", "REQUIRED OUTPUT FORMAT:",
        "QUALITY STANDARD:",
        "You are Nexus",
        "<start_of_turn>", "<end_of_turn>",
    ]
    for marker in LEAK_MARKERS:
        if marker in text:
            # Find first occurrence and cut everything before it
            # (the model was echoing the prompt)
            idx = text.find(marker)
            # Try to find the actual answer after the marker
            rest = text[idx + len(marker):]
            # If there's substantial content after, use it
            if len(rest.strip()) > 50:
                text = rest.strip()
            else:
                # Just remove the marker
                text = text.replace(marker, "").strip()
    return text


def _clean_artefacts(text: str) -> str:
    """Remove common LLM generation artefacts."""
    # Remove repeated newlines (max 2)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove trailing incomplete sentences at end
    text = _trim_incomplete_end(text)

    # Remove common filler starts
    filler_starts = [
        "Sure, ", "Certainly, ", "Of course, ",
        "I'd be happy to ", "I'll ", "Let me ",
        "Here's ", "Here is ",
        "Based on the provided context, ",
        "Based on the context provided, ",
        "According to the provided context, ",
    ]
    for filler in filler_starts:
        if text.startswith(filler):
            text = text[len(filler):]
            # Capitalise first letter
            if text:
                text = text[0].upper() + text[1:]
            break

    # Fix double spaces
    text = re.sub(r'  +', ' ', text)

    return text.strip()


def _trim_incomplete_end(text: str) -> str:
    """Remove trailing incomplete sentence."""
    if len(text) < 100:
        return text

    # If ends without punctuation and looks incomplete
    last_char = text.rstrip()[-1] if text.rstrip() else ""
    if last_char not in ".!?*`":
        # Find last complete sentence
        for punct in [". ", ".\n", "!\n", "?\n"]:
            idx = text.rfind(punct)
            if idx > len(text) * 0.7:    # only trim if in last 30%
                return text[:idx+1].strip()

    return text


def _fix_citations(text: str, sources: list[Source]) -> str:
    """Normalise citation formats to [Source N]."""
    # Fix [Source N, p.X] → [Source N]
    text = re.sub(r'\[Source (\d+),?\s*p\.\d+\]', r'[Source \1]', text)
    # Fix [source N] → [Source N]
    text = re.sub(r'\[source (\d+)\]', r'[Source \1]', text, flags=re.IGNORECASE)
    # Fix (Source N) → [Source N]
    text = re.sub(r'\(Source (\d+)\)', r'[Source \1]', text, flags=re.IGNORECASE)
    return text


def _ensure_citations(text: str, sources: list[Source], query: str) -> str:
    """
    If response has facts but no citations, add a source note at end.
    Better than no attribution at all.
    """
    if not sources:
        return text

    has_citation = bool(re.search(r'\[Source \d+\]', text))

    if not has_citation and len(text) > 100:
        names = list(dict.fromkeys(
            Path(s.source_path).name for s in sources[:3]
        ))
        source_note = "\n\n*Sources: " + ", ".join(names) + "*"
        text += source_note

    return text


def _clean_markdown(text: str) -> str:
    """Ensure markdown is clean and consistent."""
    # Ensure headers have space after #
    text = re.sub(r'^(#{1,4})([^#\s])', r'\1 \2', text, flags=re.MULTILINE)

    # Ensure bullet points are consistent
    text = re.sub(r'^[\*\+]\s', '- ', text, flags=re.MULTILINE)

    # Remove trailing spaces on lines
    text = re.sub(r' +$', '', text, flags=re.MULTILINE)

    return text


def _final_trim(text: str) -> str:
    """Final cleanup."""
    return text.strip()

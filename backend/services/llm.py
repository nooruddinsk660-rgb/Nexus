from __future__ import annotations
from typing import Generator
import logging, time, os
from pathlib import Path
from config import settings

log = logging.getLogger("nexus.llm")
_llm         = None
_llm_failed  = False
_llm_error   = ""
_model_family = "generic"


def _detect_family(path: Path) -> str:
    name = path.name.lower()
    if "gemma"   in name: return "gemma"
    if "mistral" in name: return "mistral"
    if "llama"   in name: return "llama"
    if "qwen"    in name: return "mistral"   # qwen uses similar format
    if "phi"     in name: return "mistral"
    return "generic"


def _get_llm():
    global _llm, _llm_failed, _llm_error, _model_family
    if _llm is not None:  return _llm
    if _llm_failed:       return None

    path = Path(settings.llm_model_path)

    if not path.exists():
        _llm_failed = True
        _llm_error  = f"Not found: {path.resolve()}"
        log.error("✗ %s", _llm_error)
        log.error("  Available: %s", [f.name for f in Path(settings.weights_dir).glob("*.gguf")])
        return None

    size_gb = path.stat().st_size / 1e9
    if size_gb < 0.5:
        _llm_failed = True
        _llm_error  = f"File too small: {size_gb:.2f}GB — likely corrupt or placeholder"
        log.error("✗ %s", _llm_error)
        return None

    if size_gb < 2.0:
        log.warning(
            "⚠ Model is only %.2fGB. Recommend 3GB+ for quality answers. "
            "Download Mistral-7B-Instruct-v0.3-Q4_K_M.gguf for best results.", size_gb
        )

    _model_family = _detect_family(path)
    log.info("Loading %s (%.2fGB) family=%s", path.name, size_gb, _model_family)

    try:
        from llama_cpp import Llama
        t0   = time.time()
        _llm = Llama(
            model_path     = str(path),
            n_ctx          = settings.llm_n_ctx,
            n_threads      = settings.llm_n_threads,
            n_gpu_layers   = settings.llm_n_gpu_layers,
            use_mmap       = True,
            use_mlock      = False,
            verbose        = False,
            logits_all     = False,
            n_batch        = getattr(settings, "llm_n_batch", 512),
        )
        log.info("✓ LLM ready in %.1fs | family=%s", time.time()-t0, _model_family)
        return _llm
    except Exception as e:
        _llm_failed = True
        _llm_error  = str(e)
        log.error("✗ Load failed: %s", e)
        return None


def generate_stream(
    prompt:      str,
    max_tokens:  int   = 1024,
    temperature: float = 0.15,
) -> Generator[str, None, None]:
    llm = _get_llm()
    if llm is None:
        yield f"⚠ Model unavailable: {_llm_error}\n\nFix: check LLM_MODEL_PATH in .env.local"
        return

    stop_tokens = [
        "<|end|>","<|eot_id|>","<end_of_turn>","</s>",
        "[INST]","[/INST]","<|im_end|>","<|endoftext|>",
        "\nUser:", "\nHuman:", "###",
    ]

    try:
        stream = llm.create_completion(
            prompt         = prompt,
            max_tokens     = max_tokens,
            temperature    = temperature,
            top_p          = 0.92,
            top_k          = 40,
            repeat_penalty = 1.12,
            stop           = stop_tokens,
            stream         = True,
            echo           = False,     # CRITICAL: never echo prompt
        )
        buffer      = ""
        token_count = 0

        for chunk in stream:
            token = chunk["choices"][0]["text"]
            if not token:
                continue

            # Safety: stop if model starts echoing the prompt
            buffer += token
            if len(buffer) > 200:
                buffer = buffer[-200:]

            # Detect and stop echo patterns
            if "[Source 1:" in buffer and token_count > 20:
                log.warning("Echo detected — stopping generation")
                break
            if "KNOWLEDGE BASE CONTEXT" in buffer and token_count > 10:
                log.warning("Prompt echo detected — stopping")
                break

            token_count += 1
            yield token

    except Exception as e:
        log.error("Generation error: %s", e)
        yield f"\n[Error: {e}]"


def generate_sync(prompt: str, max_tokens: int = 256) -> str:
    return "".join(generate_stream(prompt, max_tokens=max_tokens))


def warmup():
    log.info("Warming up LLM...")
    llm = _get_llm()
    if llm is None:
        log.warning("Warmup skipped: %s", _llm_error)
        return
    try:
        list(generate_stream("Hello", max_tokens=1))
        log.info("✓ LLM warm | family=%s", _model_family)
    except Exception as e:
        log.error("Warmup error: %s", e)


def get_model_family() -> str: return _model_family
def is_loaded()       -> bool: return _llm is not None
def get_error()       -> str:  return _llm_error
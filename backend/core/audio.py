import whisper
import asyncio
import tempfile
import subprocess
import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List
from config import settings

# ── FFmpeg path detection ────────────────────────────────
_local_ffmpeg = Path(__file__).resolve().parents[1] / "bin" / "ffmpeg.exe"
FFMPEG_CMD = str(_local_ffmpeg) if _local_ffmpeg.exists() else "ffmpeg"

_whisper_model = None

def _get_whisper():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model(
            settings.whisper_model_size,
            download_root=str(settings.weights_dir),
        )
    return _whisper_model

@dataclass
class AudioSegment:
    text:       str
    start_sec:  float
    end_sec:    float
    source:     str
    duration:   float = 0.0

async def parse_audio(path: Path) -> List[AudioSegment]:
    """Transcribe audio/video with segments. Returns list of AudioSegment."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _transcribe_sync, path)

def _transcribe_sync(path: Path) -> List[AudioSegment]:
    # ── Convert to WAV 16kHz mono (Whisper requirement) ──────
    wav_path = _to_wav(path)

    try:
        # ── Transcribe with timestamps ───────────────────────────
        model  = _get_whisper()
        result = model.transcribe(
            str(wav_path),
            word_timestamps=False,
            verbose=False,
            language="en",
            fp16=False,      # CPU mode
            condition_on_previous_text=True,
        )

        segments = []
        for seg in result["segments"]:
            text = seg["text"].strip()
            if not text or len(text) < 10:
                continue
            segments.append(AudioSegment(
                text      = text,
                start_sec = round(seg["start"], 2),
                end_sec   = round(seg["end"],   2),
                source    = str(path),
                duration  = round(result.get("duration", 0), 1),
            ))

        return segments
    finally:
        # ── Clean temp WAV ───────────────────────────────────────
        if wav_path != path and wav_path.exists():
            wav_path.unlink()

def _to_wav(path: Path) -> Path:
    """Convert any audio/video to 16kHz mono WAV using ffmpeg."""
    suffix = path.suffix.lower()
    if suffix == ".wav":
        # Check if already 16k mono? (skipped for demo speed)
        return path
    
    # Use tempfile for safe path generation on Windows/Linux
    fd, out_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    out = Path(out_path)

    try:
        subprocess.run([
            FFMPEG_CMD, "-y", "-i", str(path),
            "-ar", "16000",   # 16kHz sample rate
            "-ac", "1",         # mono
            "-c:a", "pcm_s16le",
            str(out),
        ], check=True, capture_output=True)
        return out
    except Exception as e:
        if out.exists(): out.unlink()
        raise RuntimeError(f"FFmpeg conversion failed: {e}")

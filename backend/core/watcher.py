from __future__ import annotations
from watchdog.observers import Observer
from watchdog.events    import FileSystemEventHandler, FileCreatedEvent
import asyncio, logging
from pathlib import Path

from config           import settings
from services.ingestion import ingest_file, SUPPORTED

log = logging.getLogger("nexus.watcher")


class IngestHandler(FileSystemEventHandler):
    def __init__(self, loop: asyncio.AbstractEventLoop):
        self._loop = loop

    def on_created(self, event: FileCreatedEvent):
        if event.is_directory:
            return
        path = Path(event.src_path)
        if path.suffix.lower() in SUPPORTED:
            log.info("[watcher] detected: %s", path.name)
            asyncio.run_coroutine_threadsafe(
                self._ingest(path), self._loop
            )

    async def _ingest(self, path: Path):
        try:
            from core.vector_store import get_store
            chunks = await ingest_file(path)
            store  = get_store()
            n      = store.add_chunks(chunks)
            store.save()
            log.info("[watcher] %s -> %d chunks indexed", path.name, n)
        except Exception as e:
            log.error("[watcher] failed %s: %s", path.name, e)


def start_watcher(loop: asyncio.AbstractEventLoop) -> Observer:
    handler  = IngestHandler(loop)
    observer = Observer()
    observer.schedule(handler, str(settings.upload_dir), recursive=False)
    observer.start()
    log.info("[watcher] watching %s", settings.upload_dir)
    return observer

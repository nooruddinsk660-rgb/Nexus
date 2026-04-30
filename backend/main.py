from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio, concurrent.futures, logging, time

from config  import settings
from routers import health, query, ingest, citations

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
log = logging.getLogger("nexus")


@asynccontextmanager
async def lifespan(app: FastAPI):
    t0 = time.time()
    log.info("NEXUS starting - offline=%s", settings.nexus_offline_mode)

    from core.vector_store import get_store
    store = get_store()
    s     = store.stats()
    log.info("Index: text=%d  image=%d  audio=%d", s["text"], s["image"], s["audio"])

    from core.watcher import start_watcher
    loop     = asyncio.get_event_loop()
    observer = start_watcher(loop)

    from services.llm import warmup
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
    loop.run_in_executor(executor, warmup)

    log.info("NEXUS ready in %.2fs -> http://%s:%s",
             time.time() - t0, settings.api_host, settings.api_port)
    yield

    observer.stop()
    observer.join()
    get_store().save()
    executor.shutdown(wait=False)
    log.info("NEXUS shutdown")


app = FastAPI(
    title="NEXUS",
    description="Offline Multimodal RAG Intelligence System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,    prefix="/api")
app.include_router(ingest.router,    prefix="/api")
app.include_router(query.router,     prefix="/api")
app.include_router(citations.router, prefix="/api")
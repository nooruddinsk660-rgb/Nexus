<div align="center">

<br/>

<img src="https://img.shields.io/badge/-%F0%9F%A7%A0%20NEXUS-6366f1?style=for-the-badge&labelColor=0a0b14&color=6366f1" height="48"/>

<br/><br/>

```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

### **Offline Multimodal RAG Intelligence System**

*The AI that reads your files, hears your recordings, and sees your images —*
*entirely on your machine. Zero cloud. Zero compromise.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python&logoColor=white&labelColor=1a1b26)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white&labelColor=1a1b26)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white&labelColor=1a1b26)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript&logoColor=white&labelColor=1a1b26)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.3-646cff?style=flat-square&logo=vite&logoColor=white&labelColor=1a1b26)](https://vitejs.dev)

[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square&labelColor=1a1b26&color=10b981)](LICENSE)
[![Offline](https://img.shields.io/badge/Works-100%25%20Offline-10b981?style=flat-square&labelColor=1a1b26)](/)
[![Cloud](https://img.shields.io/badge/Cloud%20Calls-Zero-f43f5e?style=flat-square&labelColor=1a1b26)](/)
[![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS-6366f1?style=flat-square&labelColor=1a1b26)](/)
[![LLM](https://img.shields.io/badge/LLM-Gemma%204%20%7C%20Mistral%207B-8b5cf6?style=flat-square&labelColor=1a1b26)](/)

[![Stars](https://img.shields.io/github/stars/nooruddinsk660-rgb/nexus?style=flat-square&labelColor=1a1b26&color=f59e0b)](https://github.com/nooruddinsk660-rgb/nexus/stargazers)
[![Issues](https://img.shields.io/github/issues/nooruddinsk660-rgb/nexus?style=flat-square&labelColor=1a1b26&color=6366f1)](https://github.com/nooruddinsk660-rgb/nexus/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-10b981?style=flat-square&labelColor=1a1b26)](https://github.com/nooruddinsk660-rgb/nexus/pulls)

<br/>

[**Live Demo**](https://github.com/nooruddinsk660-rgb/nexus) · [**Documentation**](#-documentation) · [**Quick Start**](#-quick-start) · [**Report Bug**](https://github.com/nooruddinsk660-rgb/nexus/issues) · [**Request Feature**](https://github.com/nooruddinsk660-rgb/nexus/issues)

<br/>

---

</div>

<br/>

## ✦ What is NEXUS?

NEXUS is a **production-grade offline AI knowledge assistant** that lets you have Claude/GPT-level conversations with your own documents — without sending a single byte to the cloud.

Drop a **PDF**, a **Word document**, a **screenshot**, or an **audio recording**. Ask anything. Get a precise, sourced answer with clickable citations that navigate to the exact page, timestamp, or image region. Every model, every embedding, every inference runs locally on your machine.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   📄 PDF  ──┐                                                   │
│   📝 DOCX ──┤                                                   │
│   🖼  PNG  ──┼──► Chunk ──► Embed ──► FAISS ──► LLM ──► Answer │
│   🎙 Audio ──┤    (512t)   (384d)   (local)   (GGUF)   + Cite  │
│   📹 MP4  ──┘                                                   │
│                                                                 │
│   WiFi: OFF ✓    Cloud: ZERO ✓    GPU: OPTIONAL ✓              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

<br/>

## ✦ Why NEXUS is Different

<table>
<thead>
<tr>
<th align="left">Feature</th>
<th align="center">NEXUS</th>
<th align="center">ChatGPT / Claude</th>
<th align="center">Typical RAG</th>
</tr>
</thead>
<tbody>
<tr>
<td>Internet required</td>
<td align="center">❌ Never</td>
<td align="center">✅ Always</td>
<td align="center">✅ Usually</td>
</tr>
<tr>
<td>Data privacy</td>
<td align="center">✅ 100% local</td>
<td align="center">❌ Cloud storage</td>
<td align="center">⚠️ Depends</td>
</tr>
<tr>
<td>Modalities</td>
<td align="center">Text + Image + Audio</td>
<td align="center">Text + Image</td>
<td align="center">Text only</td>
</tr>
<tr>
<td>Clickable citations</td>
<td align="center">✅ Exact source nav</td>
<td align="center">❌</td>
<td align="center">❌ Rarely</td>
</tr>
<tr>
<td>PDF page highlight</td>
<td align="center">✅ Exact paragraph</td>
<td align="center">❌</td>
<td align="center">❌</td>
</tr>
<tr>
<td>Audio waveform jump</td>
<td align="center">✅ Exact timestamp</td>
<td align="center">❌</td>
<td align="center">❌</td>
</tr>
<tr>
<td>Hallucination guard</td>
<td align="center">✅ Score-gated</td>
<td align="center">⚠️ Prompt-level</td>
<td align="center">⚠️ Varies</td>
</tr>
<tr>
<td>Cost per query</td>
<td align="center">$0.00</td>
<td align="center">$0.002–0.06</td>
<td align="center">$0.001–0.04</td>
</tr>
<tr>
<td>Runs on laptop CPU</td>
<td align="center">✅</td>
<td align="center">N/A</td>
<td align="center">⚠️ Varies</td>
</tr>
</tbody>
</table>

<br/>

## ✦ Features

<details>
<summary><b>🧠 Intelligence Layer</b></summary>
<br/>

- **Chain-of-Thought Reasoning** — query decomposition into sub-questions before answering
- **HyDE Retrieval** (Hypothetical Document Embeddings) — generates hypothetical answers as additional search vectors, improving recall by 25-40%
- **Multi-stage Re-ranking** — BM25 keyword boost + semantic score + intent-aware reranking
- **Query Expansion** — automatically expands vague queries into multiple semantic variants
- **Intent Detection** — detects summarize / explain / list / compare / code / QA and adapts response format
- **Dynamic Prompting** — system prompt, response format, temperature, and max tokens all adapt per query type
- **Response Post-processing** — cleans artefacts, normalises citations, ensures markdown quality
- **Session Memory** — last 4 conversation turns injected as context for follow-up questions

</details>

<details>
<summary><b>📁 Multimodal Ingestion</b></summary>
<br/>

| Format | Parser | What's extracted |
|--------|--------|-----------------|
| `.pdf` | PyMuPDF (fitz) | Text per page + embedded images |
| `.docx` | python-docx | Paragraphs + heading structure + tables |
| `.txt` | Native | Full text |
| `.png` `.jpg` `.jpeg` `.webp` | easyOCR + CLIP | OCR text + 512d visual embedding |
| `.mp3` `.mp4` `.wav` `.m4a` `.ogg` | Whisper tiny.en | Full transcript + timestamps per segment |

All files are chunked at 512 tokens with 64-token overlap using recursive character splitting.

</details>

<details>
<summary><b>🔍 Retrieval Engine</b></summary>
<br/>

- **Three FAISS IndexFlatIP indices** — one per modality (text / image / audio), 384-dimensional float32 vectors
- **Cross-modal retrieval** — text queries retrieve images via CLIP→MiniLM linear projection (512d → 384d)
- **Cosine similarity** — L2-normalised vectors + inner product = cosine similarity, sub-5ms for 10k chunks
- **Diversity filter** — prevents all results from the same source file
- **Hot-reload** — FAISS indices persist to disk, reload in under 2 seconds on server restart

</details>

<details>
<summary><b>🔗 Citation System</b></summary>
<br/>

Every answer is fully traceable:

- **PDF** → click `[p.4]` → source panel opens, scrolls to page 4, highlights the exact retrieved sentence in amber
- **Audio** → click `[00:28]` → WaveSurfer.js waveform jumps to that exact second, transcript shown below
- **Image** → click `[Img]` → image opens with amber bounding box overlaid on the relevant region + CLIP similarity score

</details>

<details>
<summary><b>🛡️ Responsible AI</b></summary>
<br/>

- **Hallucination guard** — retrieval confidence below threshold → generation blocked, returns "not found" explicitly
- **Score-gated generation** — only calls LLM when retrieved context is actually relevant
- **Response validation** — post-processor detects and removes prompt leakage, echo patterns, incomplete sentences
- **No invention** — system prompt enforces citation-only factual claims

</details>

<details>
<summary><b>🎨 Interface</b></summary>
<br/>

- **3-panel layout** — knowledge base sidebar · chat area · source viewer (slides in on citation click)
- **Live token streaming** — SSE-based streaming with animated cursor
- **⌘K command palette** — fuzzy search across files and actions with keyboard navigation
- **File watcher** — drop files into `data/uploads/` and they auto-ingest without page refresh
- **Toast notifications** — every action has instant feedback
- **Dark HUD aesthetic** — indigo/violet accent system, ambient glow orbs, noise texture, glass morphism
- **Fully offline fonts** — fonts cached after first load, no CDN dependency at runtime

</details>

<br/>

## ✦ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         NEXUS ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   FRONTEND (React 18 + Vite)                                         │
│   ┌────────────┐  ┌────────────────┐  ┌──────────────────────────┐  │
│   │  Sidebar   │  │   Chat Panel   │  │     Source Panel         │  │
│   │  DropZone  │  │  MessageBubble │  │  PdfViewer / AudioViewer │  │
│   │  KB Stats  │  │  Stream Hook   │  │  ImageViewer / CLIP score│  │
│   └────────────┘  └────────────────┘  └──────────────────────────┘  │
│           │              │                        │                  │
│           └──────────────┴────────────────────────┘                  │
│                          │ SSE / REST                                │
├──────────────────────────┼───────────────────────────────────────────┤
│                          ▼                                           │
│   BACKEND (FastAPI + uvicorn)                                        │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │  POST /api/query/stream                                      │   │
│   │  ┌─────────────┐  ┌──────────────────┐  ┌────────────────┐  │   │
│   │  │   Reasoning  │  │    Retriever     │  │  Prompt Builder│  │   │
│   │  │   Engine    │→ │  HyDE + BM25 +   │→ │  CoT + Intent  │  │   │
│   │  │ Query decomp │  │  Multi-stage     │  │  + Model fmt   │  │   │
│   │  └─────────────┘  └──────────────────┘  └────────────────┘  │   │
│   │                          │                       │            │   │
│   │                    ┌─────▼──────┐         ┌──────▼─────┐     │   │
│   │                    │   FAISS    │         │  LLM Engine │     │   │
│   │                    │  3 indices │         │  llama.cpp  │     │   │
│   │                    │ text/img/  │         │  Gemma/     │     │   │
│   │                    │ audio 384d │         │  Mistral/   │     │   │
│   │                    └────────────┘         │  Llama 3    │     │   │
│   │                         │                 └─────────────┘     │   │
│   │                    ┌────▼──────────────────────────────────┐  │   │
│   │                    │  SQLite — chunk metadata              │  │   │
│   │                    │  chunk_id · text · source · page ·   │  │   │
│   │                    │  timestamp · heading · token_count    │  │   │
│   │                    └───────────────────────────────────────┘  │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   LOCAL MODELS (./weights/)                                          │
│   ┌──────────────┐ ┌────────────────┐ ┌──────────────┐ ┌─────────┐  │
│   │ Gemma 4 E4B  │ │ MiniLM-L6-v2  │ │ CLIP ViT-B32 │ │ Whisper │  │
│   │  or Mistral  │ │   384d embed   │ │  512d visual │ │ tiny.en │  │
│   │  7B / Llama  │ │  sentence-tfmr │ │  open-clip   │ │  local  │  │
│   └──────────────┘ └────────────────┘ └──────────────┘ └─────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

<br/>

## ✦ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **LLM** | Gemma 4 E4B · Mistral 7B · Llama 3.1 8B | Text generation via llama-cpp-python |
| **Text Embedding** | all-MiniLM-L6-v2 (384d) | Semantic chunk encoding |
| **Image Embedding** | CLIP ViT-B/32 (512d→384d) | Cross-modal visual retrieval |
| **Audio STT** | Whisper tiny.en | Offline speech-to-text with timestamps |
| **OCR** | easyOCR | Text extraction from images |
| **Vector DB** | FAISS IndexFlatIP | Sub-5ms cosine similarity search |
| **Metadata DB** | SQLite | Chunk metadata and source tracking |
| **Backend** | FastAPI 0.111 + uvicorn | Async REST + SSE streaming |
| **PDF Parser** | PyMuPDF (fitz) | Page-level text + embedded image extraction |
| **Doc Parser** | python-docx | Heading-aware DOCX parsing |
| **Chunking** | langchain-text-splitters | Recursive 512-token chunks with overlap |
| **Frontend** | React 18 + Vite 5 | Component UI with fast HMR |
| **Styling** | CSS Variables + Inline | Zero-dependency design system |
| **State** | Zustand | Global client state |
| **PDF Viewer** | react-pdf + pdfjs-dist | In-app PDF rendering |
| **Audio Player** | WaveSurfer.js v7 | Waveform rendering + timestamp seeking |
| **File Watching** | watchdog | Auto-ingest on file drop |
| **Caching** | diskcache | Query result caching |

<br/>

## ✦ Quick Start

### Prerequisites

```bash
Python 3.11+    # https://python.org
Node 18+        # https://nodejs.org
ffmpeg          # sudo apt install ffmpeg  OR  brew install ffmpeg
Git             # https://git-scm.com
8GB+ RAM        # required for 7B models
```

### Installation

```bash
# 1. Clone
git clone https://github.com/nooruddinsk660-rgb/Nexus.git
cd Nexus

# 2. Install everything
make install

# 3. Download model weights (internet needed once, ~4-5GB)
make models

# 4. Verify offline readiness
make verify

# 5. Launch
make dev
```

Open → `http://localhost:5173`

> **Note:** `make models` downloads ~4.5GB of model weights on first run.
> After that, the system is 100% offline forever.

<br/>

### Manual Installation (Windows)

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ..\frontend
npm install

# Download weights
cd ..\backend
python scripts/download_weights.py

# Run
# Terminal 1:
cd backend && .venv\Scripts\activate && uvicorn main:app --reload --port 8000
# Terminal 2:
cd frontend && npm run dev
```

<br/>

## ✦ Recommended Models

For best quality, download one of these into `weights/`:

| Model | Size | Quality | Best For | Download |
|-------|------|---------|----------|----------|
| **Mistral 7B Instruct v0.3 Q4_K_M** | 4.1 GB | ⭐⭐⭐⭐⭐ | All-round | [Download](https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF) |
| **Llama 3.1 8B Instruct Q4_K_M** | 4.7 GB | ⭐⭐⭐⭐⭐ | Reasoning | [Download](https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF) |
| **Qwen 2.5 7B Instruct Q4_K_M** | 4.4 GB | ⭐⭐⭐⭐⭐ | Documents | [Download](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF) |
| Gemma 4 E4B Q4_K_M | 3.2 GB | ⭐⭐⭐⭐ | Low RAM | [Download](https://huggingface.co/google/gemma-4-e4b-it-GGUF) |

After downloading, update `.env.local`:
```bash
LLM_MODEL_PATH=./weights/mistral-7b-instruct-v0.3.Q4_K_M.gguf
```

<br/>

## ✦ Usage

### 1. Upload files
Drag and drop any file into the sidebar drop zone, or click to browse.
Supported: `PDF · DOCX · TXT · PNG · JPG · JPEG · WEBP · MP3 · MP4 · WAV · M4A`

### 2. Ask anything
```
"Summarise this document"
"What are the main topics covered?"
"List all the Java programs in the lab work"
"Explain what happens in section 3"
"What does the diagram show?"        ← retrieves images
"What did they discuss at 00:28?"    ← retrieves audio timestamps
```

### 3. Click citations
Every answer has clickable citation chips:
- `[p.4]` → PDF scrolls to page 4, highlights retrieved sentence
- `[00:28]` → Audio waveform jumps to 28 seconds
- `[Img]` → Image opens with bounding box on matched region

### 4. Keyboard shortcuts
| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `Enter` | Send message |
| `Shift+Enter` | New line |
| `Escape` | Close source panel |

<br/>

## ✦ Project Structure

```
Nexus/
│
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # App entry point + lifespan hooks
│   ├── config.py               # Pydantic settings from .env.local
│   │
│   ├── models/
│   │   └── schemas.py          # Pydantic data models
│   │
│   ├── routers/
│   │   ├── health.py           # GET /api/health
│   │   ├── ingest.py           # POST /api/ingest
│   │   ├── query.py            # POST /api/query/stream (SSE)
│   │   └── citations.py        # GET /api/cite/{id}
│   │
│   ├── services/
│   │   ├── reasoning_engine.py # Query analysis, HyDE, decomposition
│   │   ├── prompt_builder.py   # Dynamic prompt construction
│   │   ├── retriever.py        # Multi-stage retrieval pipeline
│   │   ├── embedder.py         # MiniLM + CLIP embeddings
│   │   ├── ingestion.py        # PDF/DOCX/image/audio parsers
│   │   ├── llm.py              # GGUF model loader + streamer
│   │   ├── session.py          # Conversation memory
│   │   ├── guard.py            # Hallucination prevention
│   │   └── response_processor.py # Output cleaning + validation
│   │
│   ├── core/
│   │   ├── vector_store.py     # FAISS + SQLite store
│   │   └── watcher.py          # File system watcher
│   │
│   ├── scripts/
│   │   ├── download_weights.py # One-time model download
│   │   └── verify_offline.py   # Pre-demo verification
│   │
│   └── requirements.txt
│
├── frontend/                   # React 18 + Vite frontend
│   ├── src/
│   │   ├── App.tsx             # Root layout
│   │   ├── globals.css         # Design system tokens + keyframes
│   │   ├── store.ts            # Zustand global state
│   │   │
│   │   ├── hooks/
│   │   │   └── useStream.ts    # SSE streaming hook
│   │   │
│   │   └── components/
│   │       ├── Topbar.tsx      # Header + status badges
│   │       ├── Sidebar.tsx     # File browser + upload
│   │       ├── ChatPanel.tsx   # Message area + input
│   │       ├── MessageBubble.tsx # User/assistant bubbles
│   │       ├── SourcePanel.tsx # PDF/audio/image viewer
│   │       ├── CommandPalette.tsx # ⌘K search overlay
│   │       └── Toaster.tsx     # Notification system
│   │
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── weights/                    # Model weights (git-ignored, ~4-5GB)
├── data/
│   ├── uploads/                # Ingested source files
│   ├── indexes/                # FAISS .index + SQLite chunks.db
│   └── cache/                  # Query result cache
│
├── Makefile                    # make dev / install / models / verify
└── .env.local                  # Configuration
```

<br/>

## ✦ Configuration

`.env.local`

```bash
# ── Offline ──────────────────────────────────────────────────
NEXUS_OFFLINE_MODE=true

# ── LLM ──────────────────────────────────────────────────────
LLM_MODEL_PATH=./weights/mistral-7b-instruct-v0.3.Q4_K_M.gguf
LLM_N_CTX=8192          # context window tokens
LLM_N_THREADS=6         # CPU threads (set to your core count)
LLM_N_BATCH=512         # batch size (higher = faster)
LLM_N_GPU_LAYERS=0      # set -1 to use full GPU if available
LLM_TEMPERATURE=0.15    # 0.05 for lists/code, 0.2 for summaries
LLM_MAX_TOKENS=1024

# ── Retrieval ─────────────────────────────────────────────────
RETRIEVAL_TOP_K=8
MIN_SCORE=0.12          # minimum confidence to trigger LLM
CHUNK_SIZE=512
CHUNK_OVERLAP=64

# ── Server ────────────────────────────────────────────────────
API_HOST=0.0.0.0
API_PORT=8000
```

<br/>

## ✦ API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System status, model state, index stats |
| `POST` | `/api/ingest` | Upload and index a file |
| `GET` | `/api/ingest/files` | List all indexed files |
| `DELETE` | `/api/ingest/{file_id}` | Remove a file from index |
| `POST` | `/api/query/stream` | SSE streaming query |
| `GET` | `/api/cite/{chunk_id}` | Chunk metadata |
| `GET` | `/api/cite/{chunk_id}/file` | Serve source file bytes |
| `GET` | `/api/cite/{chunk_id}/inspect` | Chunk + adjacent chunks |
| `GET` | `/api/cite/search?q=` | Full-text chunk search |

**SSE Event format:**
```
event: sources   → data: [{chunk_id, source_path, modality, score, snippet, ...}]
event: token     → data: "word by word token stream"
event: done      → data: {latency_ms, confidence, session_id, intent, tokens}
```

<br/>

## ✦ How It Works

```
User Query: "Summarise the Java lab report"
     │
     ▼
┌─────────────────────────────────┐
│  1. QUERY ANALYSIS               │
│  intent:     summarize           │
│  complexity: medium              │
│  sub-questions:                  │
│    • What is the main topic?     │
│    • What sections are covered?  │
│    • What are key details?       │
│  hyde_docs:                      │
│    • "This document covers..."   │
│    • "The main content includes" │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  2. MULTI-VECTOR RETRIEVAL       │
│  Original query → embed → FAISS  │
│  HyDE docs      → embed → FAISS  │ ← +25-40% recall
│  Sub-questions  → embed → FAISS  │
│  BM25 keyword boost applied      │
│  Re-ranking: intent-aware        │
│  Diversity filter: ≤3 per source │
│  Result: top-8 chunks ranked     │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  3. PROMPT ENGINEERING           │
│  System: expert assistant       │
│  Intent: summarize template     │
│  CoT: step-by-step reasoning    │
│  Context: 8 ranked sources      │
│  History: last 4 turns          │
│  Format: Gemma/Mistral/ChatML   │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  4. LLM GENERATION               │
│  Temperature: 0.20 (summarize)   │
│  Max tokens: 1200                │
│  Echo detection: active          │
│  Stop tokens: model-specific     │
│  Stream: token by token via SSE  │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  5. RESPONSE PROCESSING          │
│  Remove prompt leakage           │
│  Clean artefacts                 │
│  Normalise citations             │
│  Ensure markdown quality         │
│  Validate completeness           │
└─────────────────┬───────────────┘
                  │
                  ▼
         Structured Answer
         with [Source N] citations
         + clickable chips in UI
```

<br/>

## ✦ Performance

| Operation | Time | Notes |
|-----------|------|-------|
| File ingest (PDF 20 pages) | ~3-5s | Parse + chunk + embed |
| File ingest (Audio 5 min) | ~15-20s | Whisper STT + embed |
| Semantic search (1k chunks) | < 5ms | FAISS IndexFlatIP |
| First LLM token (7B Q4) | 2-4s | Prompt eval on CPU |
| Generation speed (7B Q4) | 4-8 tok/s | CPU only |
| Full answer (200 tokens) | 30-50s | CPU, no GPU |
| With GPU (n_gpu_layers=-1) | 3-8s | Full answer |
| Server restart + hot-reload | < 2s | FAISS from disk |

> **Tip:** Set `LLM_N_THREADS` to your CPU core count and `LLM_N_GPU_LAYERS=-1` if you have a CUDA GPU. This reduces generation time from 40s to 5s.

<br/>

## ✦ Demo Scenarios

### 🎓 Education — Exam prep without internet
```
Upload: lecture_slides.pdf + professor_notes.docx + recorded_lecture.mp3
Ask:  "Summarise everything about topic X"
Ask:  "What did the professor say about Y at the start of the lecture?"
Ask:  "List all formulas and their definitions"
```

### 🏥 Healthcare — Private patient records
```
Upload: patient_report.pdf + scan_results.png + consultation_audio.m4a
Ask:  "What are the key findings from all three sources?"
Ask:  "Summarise the treatment recommendations"
      → Zero data leaves the hospital network
```

### 🏛️ Government — Classified document analysis
```
Upload: policy_document.pdf + meeting_minutes.docx
Ask:  "What are the key policy changes in section 4?"
      → Air-gapped machine, no internet required
```

### 💻 Development — Codebase understanding
```
Upload: architecture.docx + api_docs.pdf + system_diagram.png
Ask:  "Explain the authentication flow"
Ask:  "List all API endpoints and their purposes"
Ask:  "What does the diagram show about database connections?"
```

<br/>

## ✦ Troubleshooting

<details>
<summary><b>LLM not generating / echoing prompt</b></summary>

```bash
# Check model size (must be 3GB+)
curl http://localhost:8000/api/health | python -m json.tool
# Look at: models.llm_size_gb

# If < 2GB — download a proper model:
# https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF

# Update .env.local:
LLM_MODEL_PATH=./weights/mistral-7b-instruct-v0.3.Q4_K_M.gguf
```
</details>

<details>
<summary><b>"I couldn't find this in your knowledge base"</b></summary>

```bash
# 1. Check files are actually indexed
curl http://localhost:8000/api/ingest/files

# 2. Lower the guard threshold temporarily
# backend/services/guard.py → MIN_SCORE = 0.10

# 3. Ask with more specific terms matching your document
# Bad:  "summarize it"
# Good: "summarize the Java lab report document"

# 4. Check index has vectors
curl http://localhost:8000/api/health
# Look at: index_stats.text (should be > 0)
```
</details>

<details>
<summary><b>PDF viewer blank / "Loading PDF..."</b></summary>

```bash
# Copy PDF.js worker to public folder
cp node_modules/pdfjs-dist/build/pdf.worker.min.js frontend/public/

# Rebuild frontend
cd frontend && npm run build
```
</details>

<details>
<summary><b>Slow generation on CPU</b></summary>

```bash
# Option 1: Increase threads in .env.local
LLM_N_THREADS=12   # set to your CPU core count

# Option 2: Use GPU if available
LLM_N_GPU_LAYERS=-1   # offloads all layers to GPU

# Option 3: Use smaller model
# Qwen 2.5 3B Instruct Q4_K_M (1.9GB) — faster but lower quality
```
</details>

<details>
<summary><b>easyOCR fails on images</b></summary>

```bash
# Download easyOCR models manually
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
python -c "import easyocr; easyocr.Reader(['en'], model_storage_directory='../weights')"
```
</details>

<br/>

## ✦ Roadmap

- [ ] **Multi-language support** — Hindi, Bengali, Tamil via IndicWhisper
- [ ] **Web scraping ingestion** — index any URL offline after fetch
- [ ] **Excel / CSV support** — pandas-based tabular data ingestion
- [ ] **Vector visualisation** — live 2D FAISS canvas in the UI
- [ ] **Similarity matrix** — cosine similarity heatmap across chunks
- [ ] **Export answers** — download conversations as PDF/Markdown
- [ ] **Multi-user mode** — separate knowledge bases per user
- [ ] **Edge deployment** — Raspberry Pi 5 + Jetson Orin Nano support
- [ ] **Federated KB** — merge knowledge bases across instances
- [ ] **Plugin system** — custom ingestion parsers via Python modules

<br/>

## ✦ Contributing

Contributions are what make open source great. Any contribution is **genuinely appreciated**.

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit with a clear message
git commit -m 'feat: add amazing feature'

# 4. Push
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please ensure your PR:
- Has a clear description of what it does and why
- Doesn't break existing functionality
- Works offline (no new cloud dependencies)
- Follows the existing code style

<br/>

## ✦ Team

<table>
<tr>
<td align="center">
<b>Sk Nooruddin</b><br/>
Team Lead · AI/ML + Backend + Frontend + UI Design<br/>
<a href="mailto:nooruddinsk660@gmail.com">nooruddinsk660@gmail.com</a><br/>
<a href="https://github.com/nooruddinsk660-rgb">@nooruddinsk660-rgb</a>
</td>
</tr>
</table>

**Team:** AcademiCSTars · The Calcutta Technical School · Kolkata

Built for **IDEA CAFE TIB2625** · Techno International Batanagar · IDEA CAFE 2026

<br/>

## ✦ Acknowledgements

- [llama.cpp](https://github.com/ggerganov/llama.cpp) — the engine that makes offline LLMs possible
- [sentence-transformers](https://github.com/UKPLab/sentence-transformers) — MiniLM embeddings
- [FAISS](https://github.com/facebookresearch/faiss) — blazing fast vector search
- [OpenAI Whisper](https://github.com/openai/whisper) — offline speech recognition
- [open-clip](https://github.com/mlfoundations/open_clip) — CLIP for cross-modal retrieval
- [easyOCR](https://github.com/JaidedAI/EasyOCR) — offline OCR
- [WaveSurfer.js](https://wavesurfer.xyz) — audio waveform rendering
- [react-pdf](https://github.com/wojtekmaj/react-pdf) — in-browser PDF rendering

<br/>

## ✦ License

```
MIT License

Copyright (c) 2026 Sk Nooruddin — AcademiCSTars

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

<br/>

---

<div align="center">


*Technology for Bharat — built by Bharat.*

*For schools with no internet budget. For hospitals that can't use the cloud.*
*For government offices in tier-3 cities. For anyone who deserves AI but can't reach it.*

<br/>

[![Star this repo](https://img.shields.io/badge/⭐%20Star%20this%20repo-if%20it%20helped%20you-f59e0b?style=for-the-badge&labelColor=1a1b26)](https://github.com/nooruddinsk660-rgb/nexus)

<br/>

`NEXUS · v1.0.0 · MIT · Offline · Open Source`

</div>

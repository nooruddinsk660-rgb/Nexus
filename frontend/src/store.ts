import { create } from "zustand"

/* ── Types ─────────────────────────────────────────────────── */
export type Modality = "text" | "image" | "audio"

export interface Source {
  chunk_id: string
  source_path: string
  modality: Modality
  page?: number
  timestamp?: number
  heading?: string
  score: number
  snippet: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  latency_ms?: number
  confidence?: number
  timestamp: Date
  streaming?: boolean
  error?: boolean
}

export interface KBFile {
  id: string
  name: string
  modality: Modality
  chunks: number
  size: number
  indexed: Date
}

export interface Toast {
  id: string
  type: "success" | "error" | "info" | "loading"
  message: string
  ttl?: number
}

/* ── Store ─────────────────────────────────────────────────── */
interface Store {
  /* chat */
  messages: Message[]
  sessionId: string
  isLoading: boolean

  /* knowledge base */
  kbFiles: KBFile[]
  selectedFileId: string | null

  /* source viewer */
  activeSource: Source | null

  /* command palette */
  cmdOpen: boolean

  /* toasts */
  toasts: Toast[]

  /* health */
  llmWarm: boolean
  indexStats: Record<string, number>

  /* actions */
  addMessage: (msg: Message) => void
  appendStream: (id: string, chunk: string) => void
  finalizeMsg: (id: string, sources: Source[], latency: number, confidence: number) => void
  setMsgError: (id: string) => void
  addFile: (f: KBFile) => void
  removeFile: (id: string) => void
  setSelectedFile: (id: string | null) => void
  setLoading: (v: boolean) => void
  setActiveSource: (s: Source | null) => void
  setCmdOpen: (v: boolean) => void
  pushToast: (t: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
  clearSession: () => void
  setHealth: (llmWarm: boolean, stats: Record<string, number>) => void
}

export const useStore = create<Store>((set) => ({
  messages: [],
  sessionId: crypto.randomUUID(),
  isLoading: false,
  kbFiles: [],
  selectedFileId: null,
  activeSource: null,
  cmdOpen: false,
  toasts: [],
  llmWarm: false,
  indexStats: { text: 0, image: 0, audio: 0 },

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  appendStream: (id, chunk) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      ),
    })),

  finalizeMsg: (id, sources, latency_ms, confidence) =>
    set((s) => ({
      isLoading: false,
      messages: s.messages.map((m) =>
        m.id === id
          ? { ...m, sources, latency_ms, confidence, streaming: false }
          : m
      ),
    })),

  setMsgError: (id) =>
    set((s) => ({
      isLoading: false,
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, streaming: false, error: true } : m
      ),
    })),

  addFile: (f) =>
    set((s) => ({ kbFiles: [...s.kbFiles, f] })),

  removeFile: (id) =>
    set((s) => ({ kbFiles: s.kbFiles.filter((f) => f.id !== id) })),

  setSelectedFile: (id) => set({ selectedFileId: id }),
  setLoading: (v) => set({ isLoading: v }),
  setActiveSource: (s) => set({ activeSource: s }),
  setCmdOpen: (v) => set({ cmdOpen: v }),

  pushToast: (t) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    if (t.type !== "loading") {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
      }, t.ttl ?? 3500)
    }
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

  clearSession: () =>
    set({
      messages: [],
      sessionId: crypto.randomUUID(),
      activeSource: null,
    }),

  setHealth: (llmWarm, indexStats) => set({ llmWarm, indexStats }),
}))
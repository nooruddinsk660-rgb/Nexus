import { useCallback, useRef } from "react"
import { useStore } from "../store"
import type { Source } from "../store"

const API = "http://localhost:8000/api"

export function useStream() {
    const { addMessage, appendStream, finalizeMsg, setLoading } = useStore()
    const abortRef = useRef<AbortController | null>(null)

    const send = useCallback(async (query: string, sessionId: string) => {
        abortRef.current?.abort()
        abortRef.current = new AbortController()
        setLoading(true)

        const userMsg = {
            id: crypto.randomUUID(), role: "user" as const,
            content: query, timestamp: new Date(),
        }
        addMessage(userMsg)

        const assistantId = crypto.randomUUID()
        addMessage({
            id: assistantId, role: "assistant",
            content: "", timestamp: new Date(), streaming: true,
        })

        let sources: Source[] = []

        try {
            const res = await fetch(`${API}/query/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, session_id: sessionId, top_k: 5 }),
                signal: abortRef.current.signal,
            })

            const reader = res.body!.getReader()
            const decoder = new TextDecoder()
            let buf = ""
            let event = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buf += decoder.decode(value, { stream: true })

                const lines = buf.split("\n")
                buf = lines.pop() ?? ""

                for (const line of lines) {
                    if (line.startsWith("event: ")) {
                        event = line.slice(7).trim()
                        continue
                    }
                    if (line.startsWith("data: ")) {
                        const raw = line.slice(6)
                        if (event === "sources") {
                            try { sources = JSON.parse(raw) } catch { }
                        } else if (event === "done") {
                            try {
                                const d = JSON.parse(raw)
                                finalizeMsg(assistantId, sources, d.latency_ms, d.confidence)
                            } catch { }
                        } else if (event === "correction") {
                            try {
                                const corrected = raw
                                const store = useStore.getState()
                                store.finalizeMsg(assistantId, sources, 0, 0)
                                useStore.setState(s => ({
                                    messages: s.messages.map(m =>
                                        m.id === assistantId ? { ...m, content: corrected, streaming: false } : m
                                    )
                                }))
                            } catch { }
                        } else {
                            // token
                            appendStream(assistantId, raw)
                        }
                        event = ""
                    }
                }
            }
        } catch (e: any) {
            if (e.name !== "AbortError") {
                appendStream(assistantId, "\n\n[Connection lost]")
                finalizeMsg(assistantId, sources, 0, 0)
            }
        } finally {
            setLoading(false)
        }
    }, [addMessage, appendStream, finalizeMsg, setLoading])

    return { send }
}
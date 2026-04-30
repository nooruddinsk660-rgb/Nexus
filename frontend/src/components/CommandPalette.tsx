import { useEffect, useRef, useState, useCallback } from "react"
import { useStore } from "../store"
import type { KBFile, Modality } from "../store"

/* ─── types ──────────────────────────────────────────────── */
interface Action {
    id: string
    label: string
    sub?: string
    icon: JSX.Element
    color?: string
    onSelect: () => void
}

/* ─── icons ──────────────────────────────────────────────── */
const Icon = {
    doc: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    img: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2"
                stroke="currentColor" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <polyline points="21 15 16 10 5 21"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    audio: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    new: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    ),
    trash: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    health: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    source: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
}

const MOD_ICON: Record<Modality, JSX.Element> = {
    text: Icon.doc,
    image: Icon.img,
    audio: Icon.audio,
}
const MOD_COLOR: Record<Modality, string> = {
    text: "var(--rose)",
    image: "var(--violet)",
    audio: "var(--emerald)",
}

/* ─── fuzzy match ────────────────────────────────────────── */
function fuzzy(str: string, pattern: string): boolean {
    if (!pattern) return true
    const s = str.toLowerCase()
    const p = pattern.toLowerCase()
    let si = 0
    for (let pi = 0; pi < p.length; pi++) {
        const idx = s.indexOf(p[pi], si)
        if (idx === -1) return false
        si = idx + 1
    }
    return true
}

function highlight(str: string, pattern: string): JSX.Element {
    if (!pattern) return <>{str}</>
    const lower = str.toLowerCase()
    const pat = pattern.toLowerCase()
    const parts: JSX.Element[] = []
    let last = 0
    let si = 0

    for (let pi = 0; pi < pat.length; pi++) {
        const idx = lower.indexOf(pat[pi], si)
        if (idx === -1) break
        if (idx > last) parts.push(<span key={`t${last}`}>{str.slice(last, idx)}</span>)
        parts.push(
            <span key={`h${idx}`} style={{ color: "var(--brand-light)", fontWeight: 600 }}>
                {str[idx]}
            </span>
        )
        last = idx + 1
        si = idx + 1
    }
    if (last < str.length) parts.push(<span key="tail">{str.slice(last)}</span>)
    return <>{parts}</>
}

/* ─── ResultRow ──────────────────────────────────────────── */
function ResultRow({
    action, active, query, onHover, onClick,
}: {
    action: Action
    active: boolean
    query: string
    onHover: () => void
    onClick: () => void
}) {
    return (
        <div
            onClick={onClick}
            onMouseEnter={onHover}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: active ? "var(--brand-dim)" : "transparent",
                border: `1px solid ${active ? "var(--brand-brd)" : "transparent"}`,
                cursor: "pointer",
                transition: "all .12s ease",
                margin: "1px 4px",
            }}
        >
            {/* icon */}
            <div style={{
                width: "30px",
                height: "30px",
                borderRadius: "var(--radius-sm)",
                background: active
                    ? (action.color ?? "var(--brand)") + "22"
                    : "var(--bg-subtle)",
                border: `1px solid ${active
                    ? (action.color ?? "var(--brand)") + "44"
                    : "var(--border-subtle)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: active
                    ? (action.color ?? "var(--brand-light)")
                    : "var(--text-tertiary)",
                flexShrink: 0,
                transition: "all .12s ease",
            }}>
                {action.icon}
            </div>

            {/* label */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: "13px",
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                    {highlight(action.label, query)}
                </div>
                {action.sub && (
                    <div style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-tertiary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginTop: "1px",
                    }}>{action.sub}</div>
                )}
            </div>

            {/* enter hint */}
            {active && (
                <kbd style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "var(--bg-muted)",
                    border: "1px solid var(--border-base)",
                    borderBottom: "2px solid var(--border-strong)",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-tertiary)",
                    flexShrink: 0,
                    animation: "fadeIn .15s ease",
                }}>↵</kbd>
            )}
        </div>
    )
}

/* ─── Section label ──────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
    return (
        <div style={{
            padding: "8px 18px 3px",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
        }}>{label}</div>
    )
}

/* ─── CommandPalette ─────────────────────────────────────── */
export function CommandPalette() {
    const {
        setCmdOpen, kbFiles,
        clearSession, setActiveSource,
        pushToast, llmWarm,
    } = useStore()

    const [query, setQuery] = useState("")
    const [activeIdx, setActive] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    /* focus input on mount */
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 30)
    }, [])

    /* close on outside click */
    const close = useCallback(() => setCmdOpen(false), [setCmdOpen])

    /* build action list */
    const quickActions: Action[] = [
        {
            id: "new-session",
            label: "New session",
            sub: "Clear chat and start fresh",
            icon: Icon.new,
            color: "var(--brand-light)",
            onSelect: () => { clearSession(); close() },
        },
        {
            id: "close-source",
            label: "Close source panel",
            sub: "Dismiss the active citation viewer",
            icon: Icon.source,
            color: "var(--violet)",
            onSelect: () => { setActiveSource(null); close() },
        },
        {
            id: "health",
            label: "Model status",
            sub: llmWarm ? "Gemma 4 E4B · ready" : "Gemma 4 E4B · warming up…",
            icon: Icon.health,
            color: llmWarm ? "var(--emerald)" : "var(--amber)",
            onSelect: () => {
                pushToast({
                    type: llmWarm ? "success" : "info",
                    message: llmWarm ? "LLM is warm and ready" : "LLM still loading…",
                })
                close()
            },
        },
    ]

    const fileActions: Action[] = kbFiles.map((f) => ({
        id: f.id,
        label: f.name,
        sub: `${f.chunks} chunks · ${f.modality}`,
        icon: MOD_ICON[f.modality],
        color: MOD_COLOR[f.modality],
        onSelect: () => {
            pushToast({ type: "info", message: `Selected: ${f.name}` })
            close()
        },
    }))

    const allActions = [...quickActions, ...fileActions]

    /* filter by query */
    const filtered = allActions.filter((a) =>
        fuzzy(a.label, query) || fuzzy(a.sub ?? "", query)
    )

    const quickFiltered = filtered.filter((a) =>
        quickActions.some((q) => q.id === a.id)
    )
    const fileFiltered = filtered.filter((a) =>
        fileActions.some((f) => f.id === a.id)
    )

    /* clamp activeIdx */
    useEffect(() => {
        setActive((i) => Math.min(i, Math.max(filtered.length - 1, 0)))
    }, [filtered.length])

    /* keyboard nav */
    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActive((i) => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActive((i) => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
            e.preventDefault()
            filtered[activeIdx]?.onSelect()
        } else if (e.key === "Escape") {
            close()
        }
    }

    /* scroll active into view */
    useEffect(() => {
        const el = listRef.current?.children[activeIdx] as HTMLElement
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }, [activeIdx])

    return (
        /* backdrop */
        <div
            onClick={close}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 500,
                background: "rgba(0,0,0,.6)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "15vh",
                animation: "fadeIn .15s ease",
            }}
        >
            {/* palette card */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "560px",
                    maxWidth: "calc(100vw - 32px)",
                    borderRadius: "var(--radius-xl)",
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "var(--shadow-lg), var(--shadow-glow)",
                    overflow: "hidden",
                    animation: "fadeUp .2s cubic-bezier(.22,.68,0,1.2)",
                }}
            >
                {/* search input */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--border-subtle)",
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setActive(0) }}
                        onKeyDown={handleKey}
                        placeholder="Search files, actions…"
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            fontSize: "15px",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-sans)",
                            caretColor: "var(--brand-light)",
                        }}
                    />

                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            style={{
                                background: "var(--bg-subtle)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                color: "var(--text-tertiary)",
                                padding: "2px 6px",
                                fontSize: "10px",
                                fontFamily: "var(--font-mono)",
                            }}
                        >esc</button>
                    )}

                    <kbd style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border-base)",
                        borderBottom: "2px solid var(--border-strong)",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-tertiary)",
                        flexShrink: 0,
                    }}>ESC</kbd>
                </div>

                {/* results */}
                <div
                    style={{
                        maxHeight: "380px",
                        overflowY: "auto",
                        padding: "6px 0 8px",
                    }}
                >
                    {filtered.length === 0 ? (
                        <div style={{
                            padding: "32px 16px",
                            textAlign: "center",
                            color: "var(--text-tertiary)",
                            fontSize: "13px",
                        }}>
                            No results for "<span style={{ color: "var(--text-secondary)" }}>{query}</span>"
                        </div>
                    ) : (
                        <div ref={listRef}>
                            {quickFiltered.length > 0 && (
                                <>
                                    <SectionLabel label="Actions" />
                                    {quickFiltered.map((a) => {
                                        const gi = filtered.indexOf(a)
                                        return (
                                            <ResultRow
                                                key={a.id}
                                                action={a}
                                                active={gi === activeIdx}
                                                query={query}
                                                onHover={() => setActive(gi)}
                                                onClick={a.onSelect}
                                            />
                                        )
                                    })}
                                </>
                            )}

                            {fileFiltered.length > 0 && (
                                <>
                                    <SectionLabel label="Knowledge Base" />
                                    {fileFiltered.map((a) => {
                                        const gi = filtered.indexOf(a)
                                        return (
                                            <ResultRow
                                                key={a.id}
                                                action={a}
                                                active={gi === activeIdx}
                                                query={query}
                                                onHover={() => setActive(gi)}
                                                onClick={a.onSelect}
                                            />
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* footer */}
                <div style={{
                    padding: "8px 16px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                }}>
                    {[
                        { keys: ["↑", "↓"], label: "navigate" },
                        { keys: ["↵"], label: "select" },
                        { keys: ["ESC"], label: "close" },
                    ].map(({ keys, label }) => (
                        <div key={label} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}>
                            <div style={{ display: "flex", gap: "3px" }}>
                                {keys.map((k) => (
                                    <kbd key={k} style={{
                                        padding: "1px 5px",
                                        borderRadius: "4px",
                                        background: "var(--bg-muted)",
                                        border: "1px solid var(--border-base)",
                                        borderBottom: "2px solid var(--border-strong)",
                                        fontSize: "10px",
                                        fontFamily: "var(--font-mono)",
                                        color: "var(--text-tertiary)",
                                    }}>{k}</kbd>
                                ))}
                            </div>
                            <span style={{
                                fontSize: "10px",
                                fontFamily: "var(--font-mono)",
                                color: "var(--text-tertiary)",
                            }}>{label}</span>
                        </div>
                    ))}

                    <div style={{ marginLeft: "auto" }}>
                        <span style={{
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-quaternary)",
                        }}>
                            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
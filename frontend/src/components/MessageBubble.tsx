import { useState, useCallback } from "react"
import { useStore } from "../store"
import type { Message, Source, Modality } from "../store"

/* ─── Citation chip config ────────────────────────────────── */
const CHIP_CONFIG: Record<Modality, {
    color: string; dim: string; brd: string; label: (s: Source) => string
}> = {
    text: {
        color: "var(--rose)",
        dim: "var(--rose-dim)",
        brd: "var(--rose-brd)",
        label: (s) => `p.${s.page ?? "?"}`,
    },
    audio: {
        color: "var(--emerald)",
        dim: "var(--emerald-dim)",
        brd: "var(--emerald-brd)",
        label: (s) => {
            if (s.timestamp == null) return "audio"
            const m = Math.floor(s.timestamp / 60)
            const sec = Math.floor(s.timestamp % 60)
            return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
        },
    },
    image: {
        color: "var(--violet)",
        dim: "var(--violet-dim)",
        brd: "var(--violet-brd)",
        label: () => "img",
    },
}

/* ─── CitationChip ───────────────────────────────────────── */
function CitationChip({ source, index }: { source: Source; index: number }) {
    const { setActiveSource, activeSource } = useStore()
    const [hovered, setHovered] = useState(false)
    const cfg = CHIP_CONFIG[source.modality]
    const isActive = activeSource?.chunk_id === source.chunk_id
    const label = cfg.label(source)

    return (
        <button
            onClick={() => setActiveSource(isActive ? null : source)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={source.snippet}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px 2px 6px",
                borderRadius: "var(--radius-full)",
                background: isActive ? cfg.color + "25" : hovered ? cfg.dim : "var(--bg-muted)",
                border: `1px solid ${isActive ? cfg.color : hovered ? cfg.brd : "var(--border-subtle)"}`,
                color: isActive || hovered ? cfg.color : "var(--text-tertiary)",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .15s ease",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                boxShadow: isActive ? `0 0 0 2px ${cfg.color}22` : "none",
                userSelect: "none",
                whiteSpace: "nowrap",
                animationDelay: `${index * 0.06}s`,
                animation: "fadeUp .2s ease both",
            }}
        >
            {/* icon */}
            <span style={{ fontSize: "9px", opacity: .8 }}>
                {source.modality === "text" ? "📄"
                    : source.modality === "audio" ? "🎙"
                        : "🖼"}
            </span>
            <span>{label}</span>
            {/* score dot */}
            <span style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: cfg.color,
                opacity: source.score,
                flexShrink: 0,
                marginLeft: "1px",
            }} />
        </button>
    )
}

/* ─── Source snippet preview ──────────────────────────────── */
function SourcePreview({ sources }: { sources: Source[] }) {
    const [open, setOpen] = useState(false)
    if (!sources.length) return null

    return (
        <div>
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 0",
                    color: "var(--text-tertiary)",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
                <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none"
                    style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}
                >
                    <polyline points="9 18 15 12 9 6"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {open ? "Hide" : "Show"} {sources.length} source{sources.length > 1 ? "s" : ""}
            </button>

            {open && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    marginTop: "8px",
                    animation: "fadeUp .18s ease",
                }}>
                    {sources.map((s, i) => {
                        const cfg = CHIP_CONFIG[s.modality]
                        return (
                            <div
                                key={s.chunk_id}
                                onClick={() => {
                                    const { setActiveSource, activeSource } = useStore.getState()
                                    setActiveSource(activeSource?.chunk_id === s.chunk_id ? null : s)
                                }}
                                style={{
                                    padding: "8px 10px",
                                    borderRadius: "var(--radius-md)",
                                    background: "var(--bg-base)",
                                    border: `1px solid var(--border-subtle)`,
                                    cursor: "pointer",
                                    transition: "all .15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = cfg.brd
                                    e.currentTarget.style.background = cfg.dim
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "var(--border-subtle)"
                                    e.currentTarget.style.background = "var(--bg-base)"
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    marginBottom: "4px",
                                }}>
                                    <span style={{ fontSize: "10px" }}>
                                        {s.modality === "text" ? "📄" : s.modality === "audio" ? "🎙" : "🖼"}
                                    </span>
                                    <span style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "10px",
                                        color: cfg.color,
                                        fontWeight: 600,
                                    }}>
                                        {s.source_path.split("/").pop()}
                                        {s.page ? ` · p.${s.page}` : ""}
                                        {s.timestamp != null
                                            ? ` · ${String(Math.floor(s.timestamp / 60)).padStart(2, "0")}:${String(Math.floor(s.timestamp % 60)).padStart(2, "0")}`
                                            : ""}
                                    </span>
                                    <span style={{
                                        marginLeft: "auto",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "9px",
                                        color: "var(--text-tertiary)",
                                        background: "var(--bg-muted)",
                                        padding: "1px 5px",
                                        borderRadius: "var(--radius-full)",
                                    }}>
                                        {Math.round(s.score * 100)}%
                                    </span>
                                </div>
                                <p style={{
                                    fontSize: "11px",
                                    color: "var(--text-tertiary)",
                                    lineHeight: 1.5,
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                }}>
                                    {s.snippet}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ─── Confidence bar ─────────────────────────────────────── */
function ConfidenceBar({ score }: { score: number }) {
    const pct = Math.round(score * 100)
    const color = pct >= 80 ? "var(--emerald)"
        : pct >= 55 ? "var(--amber)"
            : "var(--rose)"

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--text-tertiary)",
                whiteSpace: "nowrap",
            }}>confidence</span>
            <div style={{
                flex: 1,
                height: "3px",
                background: "var(--bg-muted)",
                borderRadius: "99px",
                overflow: "hidden",
                maxWidth: "80px",
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "99px",
                    transition: "width .6s ease",
                }} />
            </div>
            <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color,
                fontWeight: 600,
                minWidth: "28px",
            }}>{pct}%</span>
        </div>
    )
}

/* ─── Copy button ────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const copy = useCallback(() => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }, [text])

    return (
        <button
            onClick={copy}
            title="Copy response"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "var(--radius-sm)",
                background: "transparent",
                border: "1px solid transparent",
                cursor: "pointer",
                color: copied ? "var(--emerald)" : "var(--text-tertiary)",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                transition: "all .15s ease",
            }}
            onMouseEnter={(e) => {
                if (!copied) {
                    e.currentTarget.style.background = "var(--bg-subtle)"
                    e.currentTarget.style.borderColor = "var(--border-subtle)"
                    e.currentTarget.style.color = "var(--text-secondary)"
                }
            }}
            onMouseLeave={(e) => {
                if (!copied) {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "transparent"
                    e.currentTarget.style.color = "var(--text-tertiary)"
                }
            }}
        >
            {copied ? (
                <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <polyline points="20 6 9 17 4 12"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    Copied
                </>
            ) : (
                <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <rect x="9" y="9" width="13" height="13" rx="2"
                            stroke="currentColor" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Copy
                </>
            )}
        </button>
    )
}

/* ─── User bubble ────────────────────────────────────────── */
function UserBubble({ msg }: { msg: Message }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "3px 0",
            animation: "fadeUp .22s ease both",
        }}>
            <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <div style={{
                    padding: "10px 16px",
                    borderRadius: "14px 14px 4px 14px",
                    background: "linear-gradient(135deg, rgba(99,102,241,.18), rgba(139,92,246,.18))",
                    border: "1px solid var(--brand-brd)",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}>
                    {msg.content}
                </div>
                <span style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-quaternary)",
                    paddingRight: "4px",
                }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>
        </div>
    )
}

/* ─── Assistant bubble ───────────────────────────────────── */
function AssistantBubble({
    msg,
    showAvatar,
}: {
    msg: Message
    showAvatar: boolean
}) {
    const isError = msg.error
    const isEmpty = !msg.content && !msg.streaming

    return (
        <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "3px 0",
            animation: "fadeUp .22s ease both",
        }}>
            {/* avatar */}
            <div style={{ width: "28px", flexShrink: 0 }}>
                {showAvatar && (
                    <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: isError
                            ? "var(--rose-dim)"
                            : "linear-gradient(135deg, var(--brand), var(--violet))",
                        border: isError ? "1px solid var(--rose-brd)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isError ? "none" : "var(--shadow-brand)",
                        flexShrink: 0,
                        animation: "fadeIn .2s ease",
                    }}>
                        {isError ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="var(--rose)" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            {/* bubble + meta */}
            <div style={{ flex: 1, minWidth: 0, maxWidth: "680px" }}>
                {/* bubble */}
                <div style={{
                    padding: "12px 16px",
                    borderRadius: showAvatar ? "4px 14px 14px 14px" : "14px",
                    background: isError ? "var(--rose-dim)" : "var(--bg-raised)",
                    border: `1px solid ${isError ? "var(--rose-brd)" : "var(--border-subtle)"}`,
                    boxShadow: "var(--shadow-sm)",
                    fontSize: "14px",
                    lineHeight: 1.72,
                    color: isError ? "var(--rose)" : "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    position: "relative",
                }}>
                    {isEmpty && !isError ? (
                        <span style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>…</span>
                    ) : (
                        msg.content
                    )}

                    {/* streaming cursor */}
                    {msg.streaming && (
                        <span style={{
                            display: "inline-block",
                            width: "2px",
                            height: "15px",
                            background: "var(--brand-light)",
                            marginLeft: "2px",
                            verticalAlign: "middle",
                            borderRadius: "1px",
                            animation: "blink .75s ease infinite",
                        }} />
                    )}
                </div>

                {/* citation chips */}
                {!msg.streaming && msg.sources && msg.sources.length > 0 && (
                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        marginTop: "8px",
                        paddingLeft: "2px",
                    }}>
                        {msg.sources.map((s, i) => (
                            <CitationChip key={s.chunk_id} source={s} index={i} />
                        ))}
                    </div>
                )}

                {/* meta row — latency, confidence, copy */}
                {!msg.streaming && !isError && msg.latency_ms !== undefined && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "8px",
                        paddingLeft: "2px",
                        flexWrap: "wrap",
                    }}>
                        <span style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "10px",
                            color: "var(--text-tertiary)",
                            whiteSpace: "nowrap",
                        }}>
                            {(msg.latency_ms / 1000).toFixed(1)}s
                            {msg.sources?.length ? ` · ${msg.sources.length} source${msg.sources.length > 1 ? "s" : ""}` : ""}
                        </span>

                        {msg.confidence !== undefined && msg.confidence > 0 && (
                            <ConfidenceBar score={msg.confidence} />
                        )}

                        <div style={{ marginLeft: "auto" }}>
                            <CopyButton text={msg.content} />
                        </div>
                    </div>
                )}

                {/* source preview accordion */}
                {!msg.streaming && msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: "8px", paddingLeft: "2px" }}>
                        <SourcePreview sources={msg.sources} />
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── MessageBubble ──────────────────────────────────────── */
export function MessageBubble({
    msg,
    isFirst,
    isLast,
}: {
    msg: Message
    isFirst: boolean
    isLast: boolean
}) {
    if (msg.role === "user") {
        return <UserBubble msg={msg} />
    }
    return (
        <AssistantBubble
            msg={msg}
            showAvatar={isFirst}
        />
    )
}
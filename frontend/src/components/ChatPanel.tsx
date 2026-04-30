import { useEffect, useRef, useCallback, useState } from "react"
import { useStore } from "../store"
import { useStream } from "../hooks/useStream"
import { MessageBubble } from "./MessageBubble"

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyState() {
    const suggestions = [
        { icon: "📄", text: "What does the report say about revenue?" },
        { icon: "🖼", text: "Show me charts related to growth" },
        { icon: "🎙", text: "What was discussed in the meeting?" },
        { icon: "🛡", text: "Summarise the safety protocols" },
    ]

    const { kbFiles } = useStore()
    const hasFiles = kbFiles.length > 0

    return (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            gap: "32px",
        }}>
            {/* hero */}
            <div style={{ textAlign: "center", maxWidth: "400px" }}>
                {/* glow orb behind logo */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
                    <div style={{
                        position: "absolute",
                        inset: "-20px",
                        background: "radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)",
                        borderRadius: "50%",
                        filter: "blur(20px)",
                    }} />
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "18px",
                        background: "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "var(--shadow-brand), var(--shadow-lg)",
                        position: "relative",
                        animation: "float 3s ease infinite",
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                stroke="white" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                <h2 style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "22px",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                    lineHeight: 1.2,
                }}>
                    Ask anything about
                    <br />
                    <span style={{
                        background: "linear-gradient(135deg, var(--brand-light), var(--violet))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>your knowledge base</span>
                </h2>

                <p style={{
                    fontSize: "13px",
                    color: "var(--text-tertiary)",
                    lineHeight: 1.6,
                }}>
                    {hasFiles
                        ? `${kbFiles.length} file${kbFiles.length > 1 ? "s" : ""} indexed · ready to answer`
                        : "Upload documents, images, or audio to get started"}
                </p>
            </div>

            {/* suggestion chips */}
            {hasFiles && (
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "center",
                    maxWidth: "500px",
                }}>
                    {suggestions.map(({ icon, text }) => (
                        <SuggestionChip key={text} icon={icon} text={text} />
                    ))}
                </div>
            )}

            {/* feature pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {[
                    { label: "100% offline", color: "var(--emerald)" },
                    { label: "Cross-modal", color: "var(--violet)" },
                    { label: "Source citations", color: "var(--brand-light)" },
                    { label: "No hallucinations", color: "var(--amber)" },
                ].map(({ label, color }) => (
                    <div key={label} style={{
                        padding: "4px 12px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color,
                    }}>{label}</div>
                ))}
            </div>
        </div>
    )
}

/* ─── Suggestion chip ────────────────────────────────────── */
function SuggestionChip({ icon, text }: { icon: string; text: string }) {
    const [hovered, setHovered] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleClick = () => {
        /* find the chat input and fill it */
        const el = document.getElementById("nexus-chat-input") as HTMLInputElement
        if (el) {
            el.value = text
            el.focus()
            el.dispatchEvent(new Event("input", { bubbles: true }))
        }
    }

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 14px",
                borderRadius: "var(--radius-lg)",
                background: hovered ? "var(--brand-dim)" : "var(--bg-subtle)",
                border: `1px solid ${hovered ? "var(--brand-brd)" : "var(--border-base)"}`,
                cursor: "pointer",
                fontSize: "12px",
                color: hovered ? "var(--text-primary)" : "var(--text-secondary)",
                transition: "all .18s ease",
                textAlign: "left",
                transform: hovered ? "translateY(-1px)" : "none",
                boxShadow: hovered ? "var(--shadow-md)" : "none",
            }}
        >
            <span style={{ fontSize: "14px" }}>{icon}</span>
            <span>{text}</span>
        </button>
    )
}

/* ─── Thinking skeleton ───────────────────────────────────── */
function ThinkingBubble() {
    return (
        <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            animation: "fadeUp .2s ease",
            maxWidth: "520px",
        }}>
            {/* avatar */}
            <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, var(--brand), var(--violet))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "var(--shadow-brand)",
                marginTop: "2px",
            }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                        stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </div>

            {/* bubble */}
            <div style={{
                padding: "12px 16px",
                borderRadius: "4px 14px 14px 14px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: "180px",
            }}>
                {/* shimmer lines */}
                {[70, 90, 55].map((w, i) => (
                    <div key={i} style={{
                        height: "9px",
                        width: `${w}%`,
                        borderRadius: "99px",
                        background: "linear-gradient(90deg, var(--bg-subtle) 25%, var(--bg-muted) 50%, var(--bg-subtle) 75%)",
                        backgroundSize: "200% 100%",
                        animation: `shimmer 1.6s ease infinite`,
                        animationDelay: `${i * 0.15}s`,
                    }} />
                ))}

                {/* status text */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "2px",
                }}>
                    <div style={{
                        width: "7px",
                        height: "7px",
                        border: "1.5px solid var(--brand)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                        flexShrink: 0,
                    }} />
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--text-tertiary)",
                    }}>retrieving · generating…</span>
                </div>
            </div>
        </div>
    )
}

/* ─── Input bar ──────────────────────────────────────────── */
function InputBar({
    onSend,
    disabled,
}: {
    onSend: (text: string) => void
    disabled: boolean
}) {
    const [value, setValue] = useState("")
    const [focused, setFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    /* auto-resize textarea */
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }, [value])

    const handleSend = () => {
        const q = value.trim()
        if (!q || disabled) return
        onSend(q)
        setValue("")
        if (textareaRef.current) textareaRef.current.style.height = "auto"
    }

    return (
        <div style={{
            padding: "12px 16px 16px",
            flexShrink: 0,
            position: "relative",
        }}>
            {/* gradient fade above input */}
            <div style={{
                position: "absolute",
                top: "-40px",
                left: 0,
                right: 0,
                height: "40px",
                background: "linear-gradient(to bottom, transparent, var(--bg-base))",
                pointerEvents: "none",
            }} />

            {/* input card */}
            <div style={{
                borderRadius: "var(--radius-xl)",
                background: "var(--bg-raised)",
                border: `1px solid ${focused ? "var(--brand-brd)" : "var(--border-base)"}`,
                boxShadow: focused ? "var(--shadow-brand)" : "var(--shadow-sm)",
                transition: "all .2s ease",
                overflow: "hidden",
            }}>
                {/* textarea */}
                <textarea
                    id="nexus-chat-input"
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    placeholder="Ask anything about your files…"
                    disabled={disabled}
                    rows={1}
                    style={{
                        width: "100%",
                        padding: "14px 16px 0",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        resize: "none",
                        fontFamily: "var(--font-sans)",
                        fontSize: "14px",
                        color: "var(--text-primary)",
                        lineHeight: 1.6,
                        overflowY: "auto",
                        maxHeight: "160px",
                        opacity: disabled ? 0.5 : 1,
                    }}
                />

                {/* bottom bar */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px 10px",
                }}>
                    {/* left hints */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                        <span style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-quaternary)",
                        }}>
                            {value.length > 0
                                ? `${value.length} chars · ↵ send · ⇧↵ newline`
                                : "⇧↵ for newline"}
                        </span>
                    </div>

                    {/* send button */}
                    <button
                        onClick={handleSend}
                        disabled={disabled || !value.trim()}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 14px",
                            borderRadius: "var(--radius-md)",
                            background: disabled || !value.trim()
                                ? "var(--bg-muted)"
                                : "linear-gradient(135deg, var(--brand), var(--violet))",
                            border: "none",
                            cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
                            color: disabled || !value.trim()
                                ? "var(--text-tertiary)"
                                : "white",
                            fontSize: "12px",
                            fontWeight: 600,
                            fontFamily: "var(--font-sans)",
                            transition: "all .2s ease",
                            boxShadow: disabled || !value.trim()
                                ? "none"
                                : "var(--shadow-brand)",
                            transform: "none",
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled && value.trim()) {
                                e.currentTarget.style.transform = "translateY(-1px)"
                                e.currentTarget.style.boxShadow = "var(--shadow-brand), 0 4px 12px rgba(99,102,241,.3)"
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "none"
                            e.currentTarget.style.boxShadow = disabled || !value.trim() ? "none" : "var(--shadow-brand)"
                        }}
                    >
                        {disabled ? (
                            <>
                                <div style={{
                                    width: "10px",
                                    height: "10px",
                                    border: "1.5px solid currentColor",
                                    borderTopColor: "transparent",
                                    borderRadius: "50%",
                                    animation: "spin .7s linear infinite",
                                }} />
                                <span>Generating</span>
                            </>
                        ) : (
                            <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Send</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* model info */}
            <div style={{
                textAlign: "center",
                marginTop: "8px",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-quaternary)",
            }}>
                Gemma 4 E4B · FAISS · 100% offline · all data stays on your machine
            </div>
        </div>
    )
}

/* ─── Date divider ────────────────────────────────────────── */
function DateDivider({ label }: { label: string }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 0",
        }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            <span style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-tertiary)",
                whiteSpace: "nowrap",
            }}>{label}</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>
    )
}

/* ─── ChatPanel ───────────────────────────────────────────── */
export function ChatPanel() {
    const { messages, isLoading, sessionId } = useStore()
    const { send } = useStream()
    const bottomRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [atBottom, setAtBottom] = useState(true)

    /* scroll to bottom when messages change */
    useEffect(() => {
        if (atBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isLoading])

    /* track scroll position */
    const handleScroll = () => {
        const el = scrollRef.current
        if (!el) return
        const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        setAtBottom(isBottom)
    }

    const handleSend = useCallback((text: string) => {
        send(text, sessionId)
        setAtBottom(true)
    }, [send, sessionId])

    /* scroll-to-bottom button */
    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        setAtBottom(true)
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-base)",
            position: "relative",
            overflow: "hidden",
        }}>

            {/* ── Messages ─────────────────────────────────── */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 20px",
                }}
            >
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        padding: "20px 0",
                        maxWidth: "780px",
                        margin: "0 auto",
                        width: "100%",
                    }}>
                        <DateDivider label={new Date().toLocaleDateString([], {
                            weekday: "long", month: "long", day: "numeric"
                        })} />

                        {messages.map((msg, i) => (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                isFirst={i === 0 || messages[i - 1]?.role !== msg.role}
                                isLast={i === messages.length - 1 || messages[i + 1]?.role !== msg.role}
                            />
                        ))}

                        {/* thinking skeleton */}
                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <div style={{ paddingTop: "4px" }}>
                                <ThinkingBubble />
                            </div>
                        )}

                        <div ref={bottomRef} style={{ height: "1px" }} />
                    </div>
                )}
            </div>

            {/* ── Scroll to bottom fab ─────────────────────── */}
            {!atBottom && messages.length > 0 && (
                <button
                    onClick={scrollToBottom}
                    style={{
                        position: "absolute",
                        bottom: "120px",
                        right: "24px",
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--bg-overlay)",
                        border: "1px solid var(--border-base)",
                        boxShadow: "var(--shadow-md)",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "fadeIn .2s ease",
                        zIndex: 10,
                        transition: "all .15s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--brand-dim)"
                        e.currentTarget.style.borderColor = "var(--brand-brd)"
                        e.currentTarget.style.color = "var(--brand-light)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-overlay)"
                        e.currentTarget.style.borderColor = "var(--border-base)"
                        e.currentTarget.style.color = "var(--text-secondary)"
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <polyline points="6 9 12 15 18 9"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}

            {/* ── Input ────────────────────────────────────── */}
            <div style={{ maxWidth: "780px", margin: "0 auto", width: "100%", flexShrink: 0 }}>
                <InputBar onSend={handleSend} disabled={isLoading} />
            </div>
        </div>
    )
}
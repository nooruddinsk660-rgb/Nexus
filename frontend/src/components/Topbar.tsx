import { useEffect, useRef, useState } from "react"
import { useStore } from "../store"

/* ── tiny sub-components ──────────────────────────────────── */

function StatusDot({ active }: { active: boolean }) {
    return (
        <span style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            flexShrink: 0,
            background: active ? "var(--emerald)" : "var(--amber)",
            boxShadow: active
                ? "0 0 0 0 rgba(16,185,129,.4)"
                : "0 0 0 0 rgba(245,158,11,.4)",
            animation: active ? "pulse-dot 2.4s ease infinite" : "none",
        }} />
    )
}

function Pill({
    label, value, color = "var(--text-tertiary)",
    bg = "var(--bg-subtle)",
    brd = "var(--border-subtle)",
}: {
    label: string; value: string | number
    color?: string; bg?: string; brd?: string
}) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: bg,
            border: `1px solid ${brd}`,
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color,
            whiteSpace: "nowrap",
        }}>
            <span style={{ color: "var(--text-tertiary)", fontSize: "10px" }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
        </div>
    )
}

function KbdShortcut({ keys }: { keys: string[] }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            {keys.map((k) => (
                <kbd key={k} style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: "var(--bg-muted)",
                    border: "1px solid var(--border-base)",
                    borderBottom: "2px solid var(--border-strong)",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-tertiary)",
                    lineHeight: "16px",
                }}>{k}</kbd>
            ))}
        </div>
    )
}

/* ── divider ──────────────────────────────────────────────── */
function Divider() {
    return (
        <div style={{
            width: "1px",
            height: "18px",
            background: "var(--border-subtle)",
            flexShrink: 0,
        }} />
    )
}

/* ── main Topbar ──────────────────────────────────────────── */
export function Topbar() {
    const { llmWarm, indexStats, kbFiles, setCmdOpen, clearSession } = useStore()
    const [time, setTime] = useState(new Date())
    const totalChunks = Object.values(indexStats).reduce((a, b) => a + b, 0)

    /* live clock */
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    /* poll health */
    useEffect(() => {
        const { setHealth } = useStore.getState()
        const poll = () =>
            fetch("http://localhost:8000/api/health")
                .then((r) => r.json())
                .then((d) => setHealth(
                    d.models?.llm_warm ?? false,
                    d.index_stats ?? {}
                ))
                .catch(() => { })
        poll()
        const id = setInterval(poll, 6000)
        return () => clearInterval(id)
    }, [])

    return (
        <header style={{
            height: "52px",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: "10px",
            background: "rgba(8,9,14,.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderBottom: "1px solid var(--border-subtle)",
            flexShrink: 0,
            position: "relative",
            zIndex: 100,
        }}>

            {/* ── Logo ─────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginRight: "4px" }}>
                {/* Icon mark */}
                <div style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, var(--brand) 0%, var(--violet) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-brand)",
                    flexShrink: 0,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            stroke="white" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Wordmark */}
                <div>
                    <div style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 700,
                        fontSize: "15px",
                        letterSpacing: "-0.5px",
                        color: "var(--text-primary)",
                        lineHeight: 1,
                    }}>
                        Nexus
                        <span style={{
                            fontWeight: 400,
                            fontSize: "11px",
                            color: "var(--text-tertiary)",
                            marginLeft: "4px",
                            fontFamily: "var(--font-mono)",
                        }}>v1.0</span>
                    </div>
                    <div style={{
                        fontSize: "9px",
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginTop: "1px",
                    }}>Offline RAG</div>
                </div>
            </div>

            <Divider />

            {/* ── Offline badge ─────────────────────────────────── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--emerald-dim)",
                border: "1px solid var(--emerald-brd)",
            }}>
                <StatusDot active={true} />
                <span style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--emerald)",
                    fontWeight: 500,
                }}>offline</span>
            </div>

            {/* ── LLM status ────────────────────────────────────── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: llmWarm ? "var(--brand-dim)" : "var(--amber-dim)",
                border: `1px solid ${llmWarm ? "var(--brand-brd)" : "var(--amber-brd)"}`,
                transition: "all .4s ease",
            }}>
                {llmWarm ? (
                    <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <polyline points="20 6 9 17 4 12" stroke="var(--brand-light)" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <span style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--brand-light)",
                            fontWeight: 500,
                        }}>Gemma 4 · ready</span>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: "9px",
                            height: "9px",
                            border: "1.5px solid var(--amber)",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin .8s linear infinite",
                            flexShrink: 0,
                        }} />
                        <span style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--amber)",
                            fontWeight: 500,
                        }}>warming up…</span>
                    </>
                )}
            </div>

            <Divider />

            {/* ── Index stats ───────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Pill
                    label="chunks"
                    value={totalChunks.toLocaleString()}
                    color="var(--text-secondary)"
                />
                <Pill
                    label="files"
                    value={kbFiles.length}
                    color="var(--text-secondary)"
                />
            </div>

            {/* ── Spacer ───────────────────────────────────────── */}
            <div style={{ flex: 1 }} />

            {/* ── Clock ────────────────────────────────────────── */}
            <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-tertiary)",
            }}>
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <Divider />

            {/* ── Command palette trigger ───────────────────────── */}
            <button
                onClick={() => setCmdOpen(true)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-base)",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    fontSize: "12px",
                    fontFamily: "var(--font-sans)",
                    transition: "all .15s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-muted)"
                    e.currentTarget.style.borderColor = "var(--border-strong)"
                    e.currentTarget.style.color = "var(--text-secondary)"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-subtle)"
                    e.currentTarget.style.borderColor = "var(--border-base)"
                    e.currentTarget.style.color = "var(--text-tertiary)"
                }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Search…</span>
                <KbdShortcut keys={["⌘", "K"]} />
            </button>

            {/* ── New session ───────────────────────────────────── */}
            <button
                onClick={clearSession}
                title="New session"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-base)",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    transition: "all .15s ease",
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--brand-dim)"
                    e.currentTarget.style.borderColor = "var(--brand-brd)"
                    e.currentTarget.style.color = "var(--brand-light)"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-subtle)"
                    e.currentTarget.style.borderColor = "var(--border-base)"
                    e.currentTarget.style.color = "var(--text-tertiary)"
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </header>
    )
}
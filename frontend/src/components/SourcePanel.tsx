import { useEffect, useRef, useState } from "react"
import { useStore } from "../store"
import type { Modality } from "../store"
import { PdfViewer } from "./PdfViewer"

const API = "http://localhost:8000/api"

/* ─── Panel header ───────────────────────────────────────── */
function PanelHeader({
    filename, modality, page, timestamp,
    onClose,
}: {
    filename: string
    modality: Modality
    page?: number
    timestamp?: number
    onClose: () => void
}) {
    const MOD_COLOR: Record<Modality, string> = {
        text: "var(--rose)",
        audio: "var(--emerald)",
        image: "var(--violet)",
    }
    const MOD_LABEL: Record<Modality, string> = {
        text: "PDF", audio: "Audio", image: "Image",
    }
    const color = MOD_COLOR[modality]

    const loc = page
        ? `p.${page}`
        : timestamp != null
            ? `${String(Math.floor(timestamp / 60)).padStart(2, "0")}:${String(Math.floor(timestamp % 60)).padStart(2, "0")}`
            : ""

    return (
        <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            background: "var(--bg-raised)",
        }}>
            {/* modality badge */}
            <div style={{
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                background: color + "18",
                border: `1px solid ${color}44`,
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color,
                fontWeight: 600,
                flexShrink: 0,
            }}>
                {MOD_LABEL[modality]}
            </div>

            {/* filename */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>{filename}</div>
                {loc && (
                    <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color,
                        marginTop: "1px",
                    }}>{loc}</div>
                )}
            </div>

            {/* close */}
            <button
                onClick={onClose}
                style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "var(--radius-sm)",
                    background: "transparent",
                    border: "1px solid transparent",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--rose-dim)"
                    e.currentTarget.style.borderColor = "var(--rose-brd)"
                    e.currentTarget.style.color = "var(--rose)"
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "transparent"
                    e.currentTarget.style.color = "var(--text-tertiary)"
                }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    )
}

/* ─── Snippet card ───────────────────────────────────────── */
function SnippetCard({
    snippet, score, modality,
}: {
    snippet: string
    score: number
    modality: Modality
}) {
    const colors: Record<Modality, string> = {
        text: "var(--rose)", audio: "var(--emerald)", image: "var(--violet)",
    }
    const color = colors[modality]
    const pct = Math.round(score * 100)

    return (
        <div style={{
            margin: "12px",
            padding: "12px 14px",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-base)",
            border: `1px solid var(--border-subtle)`,
        }}>
            {/* score bar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
            }}>
                <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                }}>Match</span>
                <div style={{
                    flex: 1,
                    height: "4px",
                    background: "var(--bg-muted)",
                    borderRadius: "99px",
                    overflow: "hidden",
                }}>
                    <div style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: color,
                        borderRadius: "99px",
                        transition: "width .5s ease",
                        boxShadow: `0 0 6px ${color}66`,
                    }} />
                </div>
                <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color,
                    fontWeight: 600,
                    minWidth: "32px",
                    textAlign: "right",
                }}>{pct}%</span>
            </div>

            {/* snippet text */}
            <p style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontStyle: "italic",
            }}>
                "{snippet}"
            </p>
        </div>
    )
}



/* ─── Waveform bar ───────────────────────────────────────── */
function WaveformBar({ height, active }: { height: number; active: boolean }) {
    return (
        <div style={{
            width: "3px",
            height: `${height}px`,
            borderRadius: "99px",
            background: active ? "var(--emerald)" : "var(--bg-muted)",
            flexShrink: 0,
            transition: "background .2s, height .1s",
        }} />
    )
}

/* ─── Audio Viewer ───────────────────────────────────────── */
function AudioViewer({
    fileUrl, timestamp, snippet, duration,
}: {
    fileUrl: string
    timestamp: number | null
    snippet: string
    duration?: number
}) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [playing, setPlaying] = useState(false)
    const [current, setCurrent] = useState(0)
    const [dur, setDur] = useState(duration ?? 0)
    const [loaded, setLoaded] = useState(false)
    const [bars] = useState(() =>
        Array.from({ length: 48 }, () => 8 + Math.random() * 28)
    )

    /* jump to timestamp when source changes */
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || timestamp === null) return
        const jump = () => {
            audio.currentTime = timestamp
            setCurrent(timestamp)
        }
        if (audio.readyState >= 2) jump()
        else audio.addEventListener("loadeddata", jump, { once: true })
    }, [timestamp, fileUrl])

    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`

    const pct = dur > 0 ? current / dur : 0
    const activeIdx = Math.floor(pct * bars.length)

    const toggle = () => {
        const audio = audioRef.current
        if (!audio) return
        if (playing) { audio.pause(); setPlaying(false) }
        else { audio.play(); setPlaying(true) }
    }

    const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current
        if (!audio || dur === 0) return
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        audio.currentTime = ratio * dur
        setCurrent(ratio * dur)
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            padding: "14px",
            flex: 1,
        }}>
            {/* hidden audio element */}
            <audio
                ref={audioRef}
                src={fileUrl}
                onLoadedMetadata={(e) => {
                    setDur(e.currentTarget.duration)
                    setLoaded(true)
                }}
                onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
                onEnded={() => setPlaying(false)}
                style={{ display: "none" }}
            />

            {/* waveform */}
            <div style={{
                background: "var(--bg-base)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                padding: "16px 14px",
                overflow: "hidden",
            }}>
                {/* time display */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                }}>
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--emerald)",
                        fontWeight: 600,
                    }}>{fmt(current)}</span>
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-tertiary)",
                    }}>{fmt(dur)}</span>
                </div>

                {/* bars */}
                <div
                    onClick={scrub}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        height: "52px",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    {bars.map((h, i) => (
                        <WaveformBar
                            key={i}
                            height={h}
                            active={i <= activeIdx}
                        />
                    ))}
                </div>

                {/* progress track */}
                <div
                    onClick={scrub}
                    style={{
                        height: "3px",
                        background: "var(--bg-muted)",
                        borderRadius: "99px",
                        marginTop: "10px",
                        overflow: "hidden",
                        cursor: "pointer",
                    }}
                >
                    <div style={{
                        width: `${pct * 100}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--emerald), #34d399)",
                        borderRadius: "99px",
                        transition: "width .1s linear",
                        boxShadow: "0 0 8px rgba(16,185,129,.4)",
                    }} />
                </div>
            </div>

            {/* controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                    onClick={toggle}
                    disabled={!loaded}
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--emerald), #059669)",
                        border: "none",
                        cursor: loaded ? "pointer" : "not-allowed",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 0 16px rgba(16,185,129,.3)",
                        transition: "transform .15s, box-shadow .15s",
                        opacity: loaded ? 1 : .5,
                    }}
                    onMouseEnter={(e) => {
                        if (loaded) {
                            e.currentTarget.style.transform = "scale(1.06)"
                            e.currentTarget.style.boxShadow = "0 0 24px rgba(16,185,129,.4)"
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                        e.currentTarget.style.boxShadow = "0 0 16px rgba(16,185,129,.3)"
                    }}
                >
                    {playing ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>

                {/* jump to citation timestamp */}
                {timestamp !== null && (
                    <button
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = timestamp
                                setCurrent(timestamp)
                            }
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--emerald-dim)",
                            border: "1px solid var(--emerald-brd)",
                            cursor: "pointer",
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            color: "var(--emerald)",
                            transition: "all .15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(16,185,129,.2)"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--emerald-dim)"
                        }}
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                        </svg>
                        Jump to {fmt(timestamp)}
                    </button>
                )}
            </div>

            {/* transcript segment */}
            {snippet && (
                <div style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    borderLeft: "3px solid var(--emerald)",
                }}>
                    <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--emerald)",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginBottom: "6px",
                    }}>Transcript segment</div>
                    <p style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                        fontStyle: "italic",
                    }}>
                        "{snippet}"
                    </p>
                </div>
            )}
        </div>
    )
}

/* ─── Image Viewer ───────────────────────────────────────── */
function ImageViewer({
    fileUrl, snippet, score,
}: {
    fileUrl: string
    snippet: string
    score: number
}) {
    const [loaded, setLoaded] = useState(false)
    const [lightbox, setLightbox] = useState(false)

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "14px",
                flex: 1,
            }}>
                {/* image with bbox overlay */}
                <div style={{
                    position: "relative",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "zoom-in",
                }}
                    onClick={() => setLightbox(true)}
                >
                    {!loaded && (
                        <div style={{
                            height: "180px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <div style={{
                                width: "22px",
                                height: "22px",
                                border: "2px solid var(--border-base)",
                                borderTopColor: "var(--violet)",
                                borderRadius: "50%",
                                animation: "spin .8s linear infinite",
                            }} />
                        </div>
                    )}

                    <img
                        src={fileUrl}
                        alt="source"
                        onLoad={() => setLoaded(true)}
                        style={{
                            width: "100%",
                            display: "block",
                            opacity: loaded ? 1 : 0,
                            transition: "opacity .3s",
                        }}
                    />

                    {/* amber bounding box overlay */}
                    {loaded && (
                        <div style={{
                            position: "absolute",
                            top: "12%",
                            left: "8%",
                            width: "84%",
                            height: "74%",
                            border: "2px solid var(--amber)",
                            borderRadius: "6px",
                            background: "rgba(245,158,11,.06)",
                            boxShadow: "0 0 0 1px rgba(245,158,11,.2), inset 0 0 20px rgba(245,158,11,.05)",
                            pointerEvents: "none",
                            animation: "fadeIn .4s ease",
                        }}>
                            {/* corner accents */}
                            {[
                                { top: "-2px", left: "-2px", borderTop: "2px solid var(--amber)", borderLeft: "2px solid var(--amber)" },
                                { top: "-2px", right: "-2px", borderTop: "2px solid var(--amber)", borderRight: "2px solid var(--amber)" },
                                { bottom: "-2px", left: "-2px", borderBottom: "2px solid var(--amber)", borderLeft: "2px solid var(--amber)" },
                                { bottom: "-2px", right: "-2px", borderBottom: "2px solid var(--amber)", borderRight: "2px solid var(--amber)" },
                            ].map((style, i) => (
                                <div key={i} style={{
                                    position: "absolute",
                                    width: "10px",
                                    height: "10px",
                                    ...style,
                                }} />
                            ))}
                        </div>
                    )}

                    {/* zoom hint */}
                    {loaded && (
                        <div style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            padding: "3px 7px",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(0,0,0,.6)",
                            backdropFilter: "blur(8px)",
                            fontSize: "9px",
                            fontFamily: "var(--font-mono)",
                            color: "rgba(255,255,255,.7)",
                        }}>zoom ↗</div>
                    )}
                </div>

                {/* CLIP score */}
                <div style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--text-tertiary)",
                        whiteSpace: "nowrap",
                    }}>CLIP match</span>
                    <div style={{
                        flex: 1,
                        height: "4px",
                        background: "var(--bg-muted)",
                        borderRadius: "99px",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            width: `${score * 100}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, var(--violet), #a78bfa)",
                            borderRadius: "99px",
                            transition: "width .6s ease",
                            boxShadow: "0 0 8px rgba(139,92,246,.4)",
                        }} />
                    </div>
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--violet)",
                        fontWeight: 600,
                        minWidth: "34px",
                        textAlign: "right",
                    }}>{Math.round(score * 100)}%</span>
                </div>

                {/* OCR text */}
                {snippet && (
                    <div style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-lg)",
                        background: "var(--bg-base)",
                        border: "1px solid var(--border-subtle)",
                        borderLeft: "3px solid var(--violet)",
                    }}>
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            color: "var(--violet)",
                            textTransform: "uppercase",
                            letterSpacing: ".1em",
                            marginBottom: "6px",
                        }}>OCR extracted</div>
                        <p style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.7,
                            fontFamily: "var(--font-mono)",
                        }}>{snippet}</p>
                    </div>
                )}
            </div>

            {/* lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1000,
                        background: "rgba(0,0,0,.92)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "zoom-out",
                        animation: "fadeIn .2s ease",
                        padding: "40px",
                    }}
                >
                    <img
                        src={fileUrl}
                        alt="fullscreen"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            borderRadius: "var(--radius-lg)",
                            boxShadow: "var(--shadow-lg)",
                        }}
                    />
                    <button
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,.1)",
                            border: "1px solid rgba(255,255,255,.2)",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    )
}

/* ─── Empty panel ────────────────────────────────────────── */
function EmptyPanel() {
    return (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "32px",
            textAlign: "center",
        }}>
            <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    No source selected
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                    Click any citation chip<br />in an answer to inspect its source
                </p>
            </div>
        </div>
    )
}

/* ─── SourcePanel ────────────────────────────────────────── */
export function SourcePanel() {
    const { activeSource, setActiveSource } = useStore()
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [meta, setMeta] = useState<Record<string, any> | null>(null)

    useEffect(() => {
        if (!activeSource?.chunk_id) {
            setFileUrl(null); setMeta(null); return
        }
        const id = activeSource.chunk_id
        setFileUrl(`${API}/cite/${id}/file`)
        fetch(`${API}/cite/${id}`)
            .then(r => r.json())
            .then(setMeta)
            .catch(() => { })
    }, [activeSource?.chunk_id])

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-raised)",
            borderLeft: "1px solid var(--border-subtle)",
            overflow: "hidden",
            height: "100%",
        }}>
            {activeSource ? (
                <>
                    <PanelHeader
                        filename={meta?.filename ?? activeSource.source_path.split("/").pop() ?? "Source"}
                        modality={activeSource.modality}
                        page={activeSource.page}
                        timestamp={activeSource.timestamp}
                        onClose={() => setActiveSource(null)}
                    />

                    {/* snippet + score */}
                    <SnippetCard
                        snippet={activeSource.snippet}
                        score={activeSource.score}
                        modality={activeSource.modality}
                    />

                    <div style={{
                        height: "1px",
                        background: "var(--border-subtle)",
                        flexShrink: 0,
                    }} />

                    {/* viewer */}
                    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                        {activeSource.modality === "text" && fileUrl && (
                            <PdfViewer
                                chunkId={activeSource.chunk_id}
                                fileUrl={fileUrl}
                                pageNum={activeSource.page ?? null}
                                highlight={activeSource.snippet}
                            />
                        )}
                        {activeSource.modality === "audio" && fileUrl && (
                            <AudioViewer
                                fileUrl={fileUrl}
                                timestamp={activeSource.timestamp ?? null}
                                snippet={activeSource.snippet}
                                duration={meta?.duration}
                            />
                        )}
                        {activeSource.modality === "image" && fileUrl && (
                            <ImageViewer
                                fileUrl={fileUrl}
                                snippet={activeSource.snippet}
                                score={activeSource.score}
                            />
                        )}
                    </div>
                </>
            ) : (
                <EmptyPanel />
            )}
        </div>
    )
}
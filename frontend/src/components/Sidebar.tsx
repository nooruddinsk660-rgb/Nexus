import { useRef, useState, DragEvent, useCallback } from "react"
import { useStore } from "../store"
import type { KBFile, Modality } from "../store"

const API = "http://localhost:8000/api"

/* ─── helpers ─────────────────────────────────────────────── */
const MOD_CONFIG: Record<Modality, {
    label: string
    icon: JSX.Element
    color: string
    dim: string
    brd: string
}> = {
    text: {
        label: "Documents",
        color: "var(--rose)",
        dim: "var(--rose-dim)",
        brd: "var(--rose-brd)",
        icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    image: {
        label: "Images",
        color: "var(--violet)",
        dim: "var(--violet-dim)",
        brd: "var(--violet-brd)",
        icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2"
                    stroke="currentColor" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <polyline points="21 15 16 10 5 21"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    audio: {
        label: "Audio",
        color: "var(--emerald)",
        dim: "var(--emerald-dim)",
        brd: "var(--emerald-brd)",
        icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
    },
}

const ACCEPT_EXTS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".mp3", ".mp4", ".wav", ".m4a", ".ogg"]

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function fmtTime(d: Date) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/* ─── UploadItem — in-progress file row ──────────────────── */
interface UploadItem {
    name: string
    prog: number
    done: boolean
    error: boolean
    chunks?: number
}

/* ─── FileRow ─────────────────────────────────────────────── */
function FileRow({
    file,
    selected,
    onSelect,
    onRemove,
}: {
    file: KBFile
    selected: boolean
    onSelect: () => void
    onRemove: () => void
}) {
    const [hovered, setHovered] = useState(false)
    const cfg = MOD_CONFIG[file.modality]

    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "7px 12px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                background: selected
                    ? "rgba(99,102,241,.1)"
                    : hovered
                        ? "var(--bg-subtle)"
                        : "transparent",
                border: selected
                    ? "1px solid var(--brand-brd)"
                    : "1px solid transparent",
                transition: "all .15s ease",
                animation: "fadeUp .2s ease both",
                position: "relative",
            }}
        >
            {/* modality icon */}
            <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                background: cfg.dim,
                border: `1px solid ${cfg.brd}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.color,
                flexShrink: 0,
            }}>
                {cfg.icon}
            </div>

            {/* name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: selected ? "var(--text-primary)" : "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.3,
                }}>{file.name}</div>
                <div style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-tertiary)",
                    marginTop: "1px",
                    display: "flex",
                    gap: "6px",
                }}>
                    <span style={{ color: cfg.color }}>{file.chunks} chunks</span>
                    <span>·</span>
                    <span>{fmtSize(file.size)}</span>
                    <span>·</span>
                    <span>{fmtTime(file.indexed)}</span>
                </div>
            </div>

            {/* remove button */}
            {hovered && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove() }}
                    style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        background: "var(--rose-dim)",
                        border: "1px solid var(--rose-brd)",
                        color: "var(--rose)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        animation: "fadeIn .12s ease",
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    )
}

/* ─── UploadRow — progress bar row ────────────────────────── */
function UploadRow({ item }: { item: UploadItem }) {
    return (
        <div style={{
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-subtle)",
            border: `1px solid ${item.error ? "var(--rose-brd)" : "var(--border-base)"}`,
            animation: "fadeUp .18s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{
                    fontSize: "11px",
                    color: item.error ? "var(--rose)" : "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "160px",
                }}>{item.name}</span>
                <span style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: item.error
                        ? "var(--rose)"
                        : item.done
                            ? "var(--emerald)"
                            : "var(--text-tertiary)",
                }}>
                    {item.error ? "failed" : item.done ? `${item.chunks} chunks` : `${item.prog}%`}
                </span>
            </div>

            {/* progress track */}
            {!item.error && (
                <div style={{
                    height: "3px",
                    background: "var(--bg-muted)",
                    borderRadius: "99px",
                    overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%",
                        width: `${item.prog}%`,
                        borderRadius: "99px",
                        background: item.done
                            ? "var(--emerald)"
                            : "linear-gradient(90deg, var(--brand), var(--violet))",
                        transition: "width .3s ease",
                        boxShadow: item.done ? "none" : "0 0 8px rgba(99,102,241,.5)",
                    }} />
                </div>
            )}
        </div>
    )
}

/* ─── DropZone ────────────────────────────────────────────── */
function DropZone({
    onFiles,
    dragging,
    onDragEnter,
    onDragLeave,
}: {
    onFiles: (files: FileList) => void
    dragging: boolean
    onDragEnter: () => void
    onDragLeave: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); onDragEnter() }}
            onDragEnter={(e) => { e.preventDefault(); onDragEnter() }}
            onDragLeave={onDragLeave}
            onDrop={(e: DragEvent) => {
                e.preventDefault()
                onDragLeave()
                if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
            }}
            style={{
                margin: "8px",
                padding: "16px 12px",
                borderRadius: "var(--radius-lg)",
                border: `1.5px dashed ${dragging ? "var(--brand)" : "var(--border-base)"}`,
                background: dragging ? "var(--brand-dim)" : "transparent",
                cursor: "pointer",
                textAlign: "center",
                transition: "all .2s ease",
                transform: dragging ? "scale(1.01)" : "scale(1)",
            }}
        >
            {/* icon */}
            <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: dragging ? "var(--brand-dim)" : "var(--bg-muted)",
                border: `1px solid ${dragging ? "var(--brand-brd)" : "var(--border-subtle)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                color: dragging ? "var(--brand-light)" : "var(--text-tertiary)",
                transition: "all .2s ease",
                animation: dragging ? "float 1.5s ease infinite" : "none",
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <polyline points="17 8 12 3 7 8"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="3" x2="12" y2="15"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            <p style={{
                fontSize: "12px",
                fontWeight: 500,
                color: dragging ? "var(--brand-light)" : "var(--text-secondary)",
                marginBottom: "3px",
                transition: "color .2s",
            }}>
                {dragging ? "Drop to upload" : "Upload files"}
            </p>
            <p style={{
                fontSize: "10px",
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
            }}>
                PDF · DOCX · PNG · JPG · MP3 · M4A
            </p>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT_EXTS.join(",")}
                style={{ display: "none" }}
                onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files) }}
            />
        </div>
    )
}

/* ─── Section header ──────────────────────────────────────── */
function SectionHeader({ label, count, color }: {
    label: string; count: number; color: string
}) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px 3px",
            marginTop: "4px",
        }}>
            <span style={{
                fontSize: "9px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                flex: 1,
            }}>{label}</span>
            <span style={{
                fontSize: "9px",
                fontFamily: "var(--font-mono)",
                color,
                background: "var(--bg-muted)",
                padding: "1px 6px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
            }}>{count}</span>
        </div>
    )
}

/* ─── Stats bar ───────────────────────────────────────────── */
function StatsBar() {
    const { kbFiles, indexStats } = useStore()
    const total = kbFiles.length
    const chunks = Object.values(indexStats).reduce((a, b) => a + b, 0)
    const byMod = kbFiles.reduce((acc, f) => {
        acc[f.modality] = (acc[f.modality] ?? 0) + 1; return acc
    }, {} as Record<string, number>)

    return (
        <div style={{
            margin: "8px",
            padding: "12px",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
        }}>
            {/* totals row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "10px",
            }}>
                {[
                    { label: "Files", value: total, color: "var(--brand-light)" },
                    { label: "Chunks", value: chunks, color: "var(--violet)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        padding: "8px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-muted)",
                        border: "1px solid var(--border-subtle)",
                        textAlign: "center",
                    }}>
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "18px",
                            fontWeight: 600,
                            color,
                            lineHeight: 1,
                        }}>{value.toLocaleString()}</div>
                        <div style={{
                            fontSize: "9px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: ".08em",
                            marginTop: "3px",
                        }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* modality breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {(["text", "image", "audio"] as Modality[]).map((mod) => {
                    const cfg = MOD_CONFIG[mod]
                    const count = byMod[mod] ?? 0
                    const pct = total > 0 ? (count / total) * 100 : 0
                    return (
                        <div key={mod} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                color: cfg.color,
                                width: "50px",
                                textTransform: "capitalize",
                                flexShrink: 0,
                            }}>{mod}</span>
                            <div style={{
                                flex: 1,
                                height: "4px",
                                background: "var(--bg-base)",
                                borderRadius: "99px",
                                overflow: "hidden",
                            }}>
                                <div style={{
                                    width: `${pct}%`,
                                    height: "100%",
                                    background: cfg.color,
                                    borderRadius: "99px",
                                    transition: "width .4s ease",
                                    opacity: .8,
                                }} />
                            </div>
                            <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                color: "var(--text-tertiary)",
                                width: "14px",
                                textAlign: "right",
                                flexShrink: 0,
                            }}>{count}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ─── Sidebar ─────────────────────────────────────────────── */
export function Sidebar() {
    const {
        kbFiles, selectedFileId,
        setSelectedFile, removeFile,
        addFile, pushToast,
    } = useStore()

    const [uploads, setUploads] = useState<UploadItem[]>([])
    const [dragging, setDragging] = useState(false)

    /* group files by modality */
    const grouped = kbFiles.reduce((acc, f) => {
        ; (acc[f.modality] ??= []).push(f); return acc
    }, {} as Record<Modality, KBFile[]>)

    /* upload handler */
    const handleFiles = useCallback(async (list: FileList) => {
        const files = Array.from(list)
        for (const file of files) {
            const uploadId = crypto.randomUUID()
            setUploads((u) => [...u, {
                name: file.name, prog: 0, done: false, error: false,
            }])

            const fd = new FormData()
            fd.append("file", file)

            /* fake progress tick */
            const ticker = setInterval(() => {
                setUploads((u) =>
                    u.map((x) => x.name === file.name && !x.done
                        ? { ...x, prog: Math.min(x.prog + 7, 85) }
                        : x
                    )
                )
            }, 280)

            try {
                const res = await fetch(`${API}/ingest`, { method: "POST", body: fd })
                const data = await res.json()
                clearInterval(ticker)

                setUploads((u) =>
                    u.map((x) => x.name === file.name
                        ? { ...x, prog: 100, done: true, chunks: data.chunks }
                        : x
                    )
                )

                addFile({
                    id: data.file_id,
                    name: file.name,
                    modality: data.modality,
                    chunks: data.chunks,
                    size: file.size,
                    indexed: new Date(),
                })

                pushToast({
                    type: "success",
                    message: `${file.name} — ${data.chunks} chunks indexed`,
                })

                /* remove upload row after 2s */
                setTimeout(() => {
                    setUploads((u) => u.filter((x) => x.name !== file.name))
                }, 2000)

            } catch {
                clearInterval(ticker)
                setUploads((u) =>
                    u.map((x) => x.name === file.name
                        ? { ...x, error: true }
                        : x
                    )
                )
                pushToast({ type: "error", message: `Failed: ${file.name}` })
                setTimeout(() => {
                    setUploads((u) => u.filter((x) => x.name !== file.name))
                }, 3000)
            }
        }
    }, [addFile, pushToast])

    return (
        <aside style={{
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-raised)",
            borderRight: "1px solid var(--border-subtle)",
            overflow: "hidden",
            position: "relative",
        }}>

            {/* ── Sidebar header ─────────────────────────────── */}
            <div style={{
                padding: "14px 14px 10px",
                borderBottom: "1px solid var(--border-subtle)",
                flexShrink: 0,
            }}>
                <div style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                }}>Knowledge Base</div>
            </div>

            {/* ── Drop zone ──────────────────────────────────── */}
            <DropZone
                onFiles={handleFiles}
                dragging={dragging}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
            />

            {/* ── Upload progress rows ───────────────────────── */}
            {uploads.length > 0 && (
                <div style={{ padding: "0 8px 6px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    {uploads.map((u) => <UploadRow key={u.name} item={u} />)}
                </div>
            )}

            {/* ── File list ──────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 4px 8px" }}>
                {kbFiles.length === 0 && uploads.length === 0 ? (
                    <div style={{
                        padding: "24px 16px",
                        textAlign: "center",
                    }}>
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "var(--radius-lg)",
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                            color: "var(--text-tertiary)",
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p style={{
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                            lineHeight: 1.6,
                        }}>
                            No files yet.<br />
                            Drop files above to start.
                        </p>
                    </div>
                ) : (
                    (["text", "image", "audio"] as Modality[]).map((mod) => {
                        const files = grouped[mod]
                        if (!files?.length) return null
                        const cfg = MOD_CONFIG[mod]
                        return (
                            <div key={mod}>
                                <SectionHeader
                                    label={cfg.label}
                                    count={files.length}
                                    color={cfg.color}
                                />
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "2px 4px" }}>
                                    {files.map((f) => (
                                        <FileRow
                                            key={f.id}
                                            file={f}
                                            selected={selectedFileId === f.id}
                                            onSelect={() => setSelectedFile(
                                                selectedFileId === f.id ? null : f.id
                                            )}
                                            onRemove={() => {
                                                removeFile(f.id)
                                                pushToast({ type: "info", message: `Removed ${f.name}` })
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── Stats ──────────────────────────────────────── */}
            {kbFiles.length > 0 && (
                <>
                    <div style={{ height: "1px", background: "var(--border-subtle)", flexShrink: 0 }} />
                    <StatsBar />
                </>
            )}
        </aside>
    )
}
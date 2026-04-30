import { useEffect, useRef, useState } from "react"
import WaveSurfer from "wavesurfer.js"

interface Props {
    fileUrl: string | null
    timestamp: number | null   // seconds to jump to
    snippet: string          // transcript text to show
    duration?: number          // total audio duration in seconds
}

export function AudioViewer({ fileUrl, timestamp, snippet, duration }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const wsRef = useRef<WaveSurfer | null>(null)
    const [ready, setReady] = useState(false)
    const [currentTs, setCurrentTs] = useState(0)

    // Init WaveSurfer on mount
    useEffect(() => {
        if (!containerRef.current || !fileUrl) return
        wsRef.current?.destroy()
        wsRef.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: "rgba(0,229,160,0.4)",
            progressColor: "#00e5a0",
            cursorColor: "#ffb800",
            cursorWidth: 2,
            height: 56,
            barWidth: 2,
            barGap: 1,
            barRadius: 1,
            url: fileUrl,
            fetchParams: { cache: "force-cache" },   // browser cache — offline safe
        })
        wsRef.current.on("ready", () => setReady(true))
        wsRef.current.on("timeupdate", (t) => setCurrentTs(Math.floor(t)))
        return () => wsRef.current?.destroy()
    }, [fileUrl])

    // Jump to timestamp when chip is clicked
    useEffect(() => {
        if (!ready || timestamp === null || !wsRef.current) return
        const dur = wsRef.current.getDuration()
        if (dur > 0) {
            wsRef.current.seekTo(timestamp / dur)   // seekTo takes 0–1 fraction
        }
    }, [timestamp, ready])

    const fmt = (s: number) => {
        const m = Math.floor(s / 60), sec = s % 60
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    }

    if (!fileUrl) return (
        <div style={{ color: "var(--t3)", fontSize: "12px", padding: "20px", fontFamily: "var(--fm)" }}>
            ← click a [MM:SS] citation chip
        </div>
    )

    return (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: "10px", color: "var(--am)" }}>
                ▶ {fmt(currentTs)} / {fmt(duration ?? 0)}
                {timestamp !== null && <span style={{ color: "var(--t3)", marginLeft: "8px" }}>· jumped to {fmt(timestamp)}</span>}
            </div>

            <div ref={containerRef}
                style={{
                    background: "var(--s3)", borderRadius: "6px", padding: "4px 8px",
                    border: "1px solid var(--gbrd)", cursor: "pointer"
                }} />

            <button
                onClick={() => wsRef.current?.playPause()}
                style={{
                    background: "var(--gr)", color: "#000", border: "none", borderRadius: "6px",
                    padding: "6px 16px", fontFamily: "var(--fm)", fontSize: "12px", cursor: "pointer"
                }}>
                Play / Pause
            </button>

            {snippet && (
                <div style={{
                    fontSize: "12px", color: "var(--t2)", padding: "10px",
                    background: "var(--s3)", borderRadius: "6px", lineHeight: "1.7",
                    borderLeft: "2px solid var(--gr)"
                }}>
                    {snippet}
                </div>
            )}
        </div>
    )
}
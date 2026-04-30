import { useStore } from "../store"
import type { Source } from "../store"

const COLORS = {
    text: { bg: "rgba(255,95,114,.15)", border: "rgba(255,95,114,.3)", text: "#ff5f72" },
    audio: { bg: "rgba(0,229,160,.15)", border: "rgba(0,229,160,.3)", text: "#00e5a0" },
    image: { bg: "rgba(157,143,255,.15)", border: "rgba(157,143,255,.3)", text: "#9d8fff" },
}

export function CitationChip({ source }: { source: Source }) {
    const { setActiveSource, activeSource } = useStore()
    const c = COLORS[source.modality] ?? COLORS.text
    const isActive = activeSource?.chunk_id === source.chunk_id

    const label = source.modality === "audio" && typeof source.timestamp === "number"
        ? `[${String(Math.floor(source.timestamp / 60)).padStart(2, "0")}:${String(source.timestamp % 60 | 0).padStart(2, "0")}]`
        : source.modality === "image"
            ? "[Img]"
            : `[p.${source.page ?? "?"}]`

    return (
        <span
            onClick={() => setActiveSource(isActive ? null : source)}
            title={source.snippet}
            style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "10px",
                fontFamily: "var(--fm)",
                padding: "2px 7px",
                borderRadius: "4px",
                cursor: "pointer",
                verticalAlign: "middle",
                margin: "0 3px",
                userSelect: "none",
                transition: "all .15s",
                background: isActive ? c.text + "33" : c.bg,
                border: `1px solid ${isActive ? c.text : c.border}`,
                color: c.text,
                boxShadow: isActive ? `0 0 0 2px ${c.text}22` : "none",
                transform: isActive ? "scale(1.05)" : "none",
            }}>
            {label}
        </span>
    )
}
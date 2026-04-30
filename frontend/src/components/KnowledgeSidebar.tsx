import { useStore } from "../store"
import { DropZone } from "./DropZone"

const MOD_ICON: Record<string, string> = {
    text: "📄", image: "🖼", audio: "🎙"
}
const MOD_LABEL: Record<string, string> = {
    text: "Documents", image: "Images", audio: "Audio"
}

export function KnowledgeSidebar() {
    const { kbFiles } = useStore()
    const grouped = kbFiles.reduce((acc, f) => {
        ; (acc[f.modality] ??= []).push(f); return acc
    }, {} as Record<string, typeof kbFiles>)

    const totalChunks = kbFiles.reduce((s, f) => s + f.chunks, 0)

    const S: React.CSSProperties = {
        background: "var(--s1)", borderRight: "1px solid var(--bd)",
        display: "flex", flexDirection: "column", overflow: "hidden",
    }

    return (
        <div style={S}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bd)" }}>
                <div style={{ fontFamily: "var(--fh)", fontSize: "18px", fontWeight: "800", color: "var(--cy)", letterSpacing: "-1px" }}>NEXUS</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: "9px", color: "var(--t3)" }}>knowledge base</div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
                {Object.entries(grouped).map(([mod, files]) => (
                    <div key={mod}>
                        <div style={{
                            padding: "8px 14px 4px", fontFamily: "var(--fm)", fontSize: "9px",
                            textTransform: "uppercase", letterSpacing: ".1em", color: "var(--t3)"
                        }}>
                            {MOD_LABEL[mod]}
                        </div>
                        {files.map(f => (
                            <div key={f.id} style={{
                                display: "flex", alignItems: "center", gap: "7px",
                                padding: "6px 14px", fontFamily: "var(--fm)", fontSize: "11px",
                                color: "var(--t2)", cursor: "pointer", transition: "background .15s"
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--s2)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <span>{MOD_ICON[mod]}</span>
                                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                                <span style={{ fontSize: "9px", color: "var(--t3)" }}>{f.chunks}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <DropZone />

            <div style={{
                padding: "10px 14px", borderTop: "1px solid var(--bd)",
                display: "flex", flexDirection: "column", gap: "4px"
            }}>
                {[
                    ["Total chunks", totalChunks, "var(--cy)"],
                    ["Files indexed", kbFiles.length, "var(--t2)"],
                ].map(([k, v, c]) => (
                    <div key={k as string} style={{
                        display: "flex", justifyContent: "space-between",
                        fontFamily: "var(--fm)", fontSize: "10px"
                    }}>
                        <span style={{ color: "var(--t3)" }}>{k as string}</span>
                        <span style={{ color: c as string }}>{v as number}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
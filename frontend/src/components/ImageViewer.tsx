import { useState } from "react"
import type { Source } from "../store"

interface Props {
    source: Source | null
    fileUrl: string | null
    snippet: string          // OCR text from chunk
    score: number          // CLIP similarity score 0–1
}

export function ImageViewer({ source, fileUrl, snippet, score }: Props) {
    const [imgLoaded, setImgLoaded] = useState(false)

    if (!fileUrl) return (
        <div style={{ color: "var(--t3)", fontSize: "12px", padding: "20px", fontFamily: "var(--fm)" }}>
            ← click an [Img] citation chip
        </div>
    )

    return (
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Image with bounding box overlay */}
            <div style={{
                position: "relative", borderRadius: "6px", overflow: "hidden",
                border: "1px solid var(--vbrd)", background: "var(--s3)"
            }}>
                <img
                    src={fileUrl} alt="source"
                    style={{ width: "100%", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity .3s" }}
                    onLoad={() => setImgLoaded(true)}
                />
                {imgLoaded && (
                    <div style={{
                        position: "absolute",
                        top: "15%", left: "10%", width: "80%", height: "60%",
                        border: "2px solid var(--am)",
                        borderRadius: "3px",
                        background: "rgba(255,184,0,.08)",
                        pointerEvents: "none",
                        boxShadow: "0 0 0 1px rgba(255,184,0,.3)"
                    }} />
                )}
            </div>

            {/* CLIP score bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "var(--fm)", fontSize: "9px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em" }}>CLIP similarity</span>
                <div style={{ flex: 1, height: "4px", background: "var(--s3)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${score * 100}%`, height: "100%", background: "var(--vi)", borderRadius: "2px" }} />
                </div>
                <span style={{ fontFamily: "var(--fm)", fontSize: "10px", color: "var(--vi)" }}>{(score * 100).toFixed(0)}%</span>
            </div>

            {/* OCR text */}
            {snippet && (
                <>
                    <div style={{ fontFamily: "var(--fm)", fontSize: "9px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em" }}>OCR extracted text</div>
                    <div style={{ fontSize: "11px", color: "var(--t2)", background: "var(--s3)", padding: "8px", borderRadius: "5px", lineHeight: "1.6", fontFamily: "var(--fm)" }}>{snippet}</div>
                </>
            )}
        </div>
    )
}
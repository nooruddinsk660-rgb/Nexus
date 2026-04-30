import { useRef, useState, DragEvent } from "react"
import { useStore } from "../store"

const API = "http://localhost:8000/api"
const ACCEPT = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".mp3", ".mp4", ".m4a", ".wav"]

export function DropZone() {
    const { addFile } = useStore()
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const [progress, setProgress] = useState<number | null>(null)
    const [status, setStatus] = useState("")

    const upload = async (file: File) => {
        setProgress(0)
        setStatus(`Ingesting ${file.name}…`)
        const fd = new FormData()
        fd.append("file", file)
        // animate progress while waiting
        const ticker = setInterval(() => setProgress(p => Math.min((p ?? 0) + 8, 85)), 300)
        try {
            const res = await fetch(`${API}/ingest`, { method: "POST", body: fd })
            const data = await res.json()
            clearInterval(ticker)
            setProgress(100)
            setStatus(`✓ ${data.chunks} chunks indexed`)
            addFile({ id: data.file_id, name: file.name, modality: data.modality, chunks: data.chunks, size: file.size, indexed: new Date() })
            setTimeout(() => { setProgress(null); setStatus("") }, 2000)
        } catch {
            clearInterval(ticker)
            setProgress(null)
            setStatus("Upload failed")
            setTimeout(() => setStatus(""), 3000)
        }
    }

    const onDrop = (e: DragEvent) => {
        e.preventDefault(); setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) upload(file)
    }

    return (
        <div style={{ padding: "8px 14px 12px" }}>
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: `1px dashed ${dragging ? "var(--cy)" : "var(--bd2)"}`,
                    borderRadius: "6px",
                    padding: "10px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging ? "var(--cdim)" : "transparent",
                    transition: "all .2s",
                    fontFamily: "var(--fm)", fontSize: "10px",
                    color: dragging ? "var(--cy)" : "var(--t3)",
                }}>
                {status || "⊕ drop files / click to browse"}
            </div>

            {progress !== null && (
                <div style={{ marginTop: "6px", height: "3px", background: "var(--s3)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                        width: `${progress}%`, height: "100%", background: "var(--cy)",
                        borderRadius: "2px", transition: "width .3s ease"
                    }} />
                </div>
            )}

            <input ref={inputRef} type="file" accept={ACCEPT.join(",")} style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
        </div>
    )
}
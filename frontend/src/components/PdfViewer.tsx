import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

interface Props {
    chunkId: string | null
    fileUrl: string | null
    pageNum: number | null
    highlight: string       // text to highlight on the page
}

export function PdfViewer({ chunkId, fileUrl, pageNum, highlight }: Props) {
    const [numPages, setNumPages] = useState(0)
    const pageRef = useRef<HTMLDivElement>(null)

    // Scroll to target page when pageNum changes
    useEffect(() => {
        if (!pageNum) return
        setTimeout(() => {
            const el = document.getElementById(`pdf-page-${pageNum}`)
            el?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 300)
    }, [pageNum])

    // Highlight text spans after page renders
    const highlightText = (page: number) => {
        if (page !== pageNum || !highlight) return
        setTimeout(() => {
            const textLayer = document.querySelector(`#pdf-page-${page} .react-pdf__Page__textContent`)
            if (!textLayer) return
            const spans = textLayer.querySelectorAll("span")
            spans.forEach(span => {
                if (highlight && span.textContent?.includes(highlight.slice(0, 30))) {
                    span.style.background = "rgba(255,184,0,0.35)"
                    span.style.borderRadius = "2px"
                    span.style.boxShadow = "0 0 0 2px rgba(255,184,0,0.2)"
                }
            })
        }, 200)
    }

    if (!fileUrl) return (
        <div style={{ color: "var(--t3)", fontSize: "12px", padding: "20px", fontFamily: "var(--fm)" }}>
            ← click a [p.N] citation chip to open PDF
        </div>
    )

    return (
        <div style={{ overflow: "auto", height: "100%", background: "var(--s3)" }}>
            <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
                loading={<div style={{ color: "var(--t3)", padding: "16px", fontFamily: "var(--fm)" }}>Loading PDF...</div>}
            >
                {Array.from({ length: numPages }, (_, i) => (
                    <div id={`pdf-page-${i + 1}`} key={i + 1}
                        style={{ margin: "8px", border: pageNum === i + 1 ? "1px solid var(--am)" : "1px solid var(--bd)" }}>
                        <Page
                            pageNumber={i + 1}
                            width={280}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            onRenderSuccess={() => highlightText(i + 1)}
                        />
                    </div>
                ))}
            </Document>
        </div>
    )
}
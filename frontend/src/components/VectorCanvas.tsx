import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Point {
  id: string
  modality: "text" | "image" | "audio"
  x: number
  y: number
  label: string
}

export default function VectorCanvas() {
  const [points, setPoints] = useState<Point[]>([])
  const [hovered, setHovered] = useState<Point | null>(null)
  const [queryPoint, setQueryPoint] = useState<{x: number, y: number} | null>(null)

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/viz/canvas")
      const data = await res.json()
      setPoints(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPoints()
    const interval = setInterval(fetchPoints, 5000)
    return () => clearInterval(interval)
  }, [])

  const getModColor = (mod: string) => {
    if (mod === "text") return "#00F0FF" // cyan
    if (mod === "image") return "#FF00FF" // magenta
    if (mod === "audio") return "#FFD700" // gold
    return "#FFFFFF"
  }

  return (
    <div className="relative w-full h-[400px] bg-bg-2 rounded-xl border border-border/50 overflow-hidden group">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xs font-mono text-t-3 uppercase tracking-widest">Vector Space Canvas</h3>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={() => {
            setQueryPoint({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 })
          }}
          className="text-[10px] font-mono px-2 py-1 bg-cy/10 text-cy border border-cy/20 rounded hover:bg-cy/20 transition-colors"
        >
          + ADD QUERY
        </button>
        <button 
          onClick={() => setQueryPoint(null)}
          className="text-[10px] font-mono px-2 py-1 bg-rd/10 text-rd border border-rd/20 rounded hover:bg-rd/20 transition-colors"
        >
          RESET
        </button>
      </div>

      <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full">
        {/* Grid lines */}
        <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.01" />
        <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="rgba(255,255,255,0.05)" strokeWidth="0.01" />

        {/* Connections to query */}
        {queryPoint && points.slice(0, 5).map((p, i) => (
          <motion.line
            key={`line-${p.id}`}
            x1={queryPoint.x} y1={queryPoint.y}
            x2={p.x} y2={p.y}
            stroke="#FF4D4D"
            strokeWidth="0.005"
            strokeDasharray="0.02 0.02"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}

        {/* Data points */}
        {points.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={hovered?.id === p.id ? 0.04 : 0.02}
            fill={getModColor(p.modality)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 2 }}
            onMouseEnter={() => setHovered(p)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer transition-all duration-300"
          />
        ))}

        {/* Query point */}
        {queryPoint && (
          <motion.circle
            cx={queryPoint.x}
            cy={queryPoint.y}
            r={0.03}
            fill="#FFA500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </svg>

      {/* Hover Card */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 p-3 bg-bg/95 border border-border rounded-lg shadow-2xl backdrop-blur-sm pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getModColor(hovered.modality) }} />
              <span className="text-[10px] font-mono text-t-1 uppercase">{hovered.modality}</span>
              <span className="text-[10px] font-mono text-t-3 ml-auto opacity-50">{hovered.id}</span>
            </div>
            <p className="text-xs text-t-2 line-clamp-2 leading-relaxed">
              {hovered.label} — This is a preview of the content stored at this vector position.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

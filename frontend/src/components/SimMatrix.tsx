import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function SimMatrix() {
  const [data, setData] = useState<{labels: string[], matrix: number[][]}>({ labels: [], matrix: [] })
  const [hoveredCell, setHoveredCell] = useState<{r: number, c: number} | null>(null)

  const fetchMatrix = async () => {
    try {
      const res = await fetch("/api/viz/matrix?top_n=6")
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchMatrix()
    const interval = setInterval(fetchMatrix, 10000)
    return () => clearInterval(interval)
  }, [])

  if (!data.labels.length) return (
    <div className="h-[400px] flex items-center justify-center bg-bg-2 rounded-xl border border-border/50">
      <span className="text-xs font-mono text-t-3 animate-pulse">Waiting for index data...</span>
    </div>
  )

  return (
    <div className="p-6 bg-bg-2 rounded-xl border border-border/50 h-[400px]">
      <h3 className="text-xs font-mono text-t-3 uppercase tracking-widest mb-6">Cosine Similarity Matrix (6x6)</h3>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Empty Corner */}
        <div />
        {/* Column Headers */}
        {data.labels.map((l, i) => (
          <div key={`h-${i}`} className="text-[10px] font-mono text-t-3 text-center truncate px-1">
            {l}
          </div>
        ))}

        {/* Rows */}
        {data.matrix.map((row, ri) => (
          <React.Fragment key={`row-${ri}`}>
            <div className="text-[10px] font-mono text-t-3 text-right pr-2 self-center truncate">
              {data.labels[ri]}
            </div>
            {row.map((val, ci) => {
              const opacity = val; // since normalized, 0-1
              return (
                <motion.div
                  key={`${ri}-${ci}`}
                  onMouseEnter={() => setHoveredCell({ r: ri, c: ci })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="aspect-square rounded-sm relative cursor-help"
                  style={{ 
                    backgroundColor: `rgba(0, 240, 255, ${opacity})`,
                    border: `1px solid rgba(0, 240, 255, ${ri === ci ? 0.5 : 0.1})`
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                  {hoveredCell?.r === ri && hoveredCell?.c === ci && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-bg border border-border text-t-1 text-[10px] font-mono rounded shadow-xl z-20 whitespace-nowrap">
                      Sim: {val.toFixed(4)}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 p-3 bg-bg/50 rounded border border-border/30">
         <p className="text-[10px] text-t-2 leading-relaxed">
           <span className="text-cy">Heatmap insight:</span> Higher intensity indicates closer proximity in the 384d latent space.
           Diagonal represents self-similarity (1.000).
         </p>
      </div>
    </div>
  )
}

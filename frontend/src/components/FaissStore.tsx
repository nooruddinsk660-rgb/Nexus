import React, { useState, useEffect } from "react"
import { Database, FileCode, Layers } from "lucide-react"

interface Stat {
  modality: string
  count: number
  dim: number
  type: string
  file: string
}

export default function FaissStore() {
  const [stats, setStats] = useState<Stat[]>([])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/viz/stats")
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-bg-2 rounded-xl border border-border/50 p-6">
      <h3 className="text-xs font-mono text-t-3 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Database size={14} className="text-cy" />
        FAISS Storage Layout
      </h3>

      <div className="space-y-4">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="text-t-3 border-b border-border/50">
              <th className="text-left pb-2">MODALITY</th>
              <th className="text-right pb-2">VECTORS</th>
              <th className="text-right pb-2">DIM</th>
              <th className="text-left pb-2 pl-4">INDEX FILE</th>
            </tr>
          </thead>
          <tbody className="text-t-2">
            {stats.map((s) => (
              <tr key={s.modality} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                <td className="py-3 capitalize flex items-center gap-2">
                  <span className={`w-1 h-3 rounded-full ${s.modality === 'text' ? 'bg-cy' : s.modality === 'image' ? 'bg-ma' : 'bg-go'}`} />
                  {s.modality}
                </td>
                <td className="py-3 text-right text-t-1">{s.count.toLocaleString()}</td>
                <td className="py-3 text-right">{s.dim}</td>
                <td className="py-3 pl-4 text-t-3">{s.file}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-bg rounded-lg border border-border/50 flex items-start gap-3">
             <FileCode size={18} className="text-t-3 mt-1" />
             <div>
                <div className="text-[10px] text-t-3 uppercase mb-1">Metadata DB</div>
                <div className="text-xs text-t-1 font-mono">chunks.db (SQLite)</div>
             </div>
          </div>
          <div className="p-4 bg-bg rounded-lg border border-border/50 flex items-start gap-3">
             <Layers size={18} className="text-t-3 mt-1" />
             <div>
                <div className="text-[10px] text-t-3 uppercase mb-1">Index Type</div>
                <div className="text-xs text-cy font-mono">IndexFlatIP (Cosine)</div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
         <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-mono text-t-3 uppercase">Disk Sync Status</span>
            <span className="text-[10px] font-mono text-gr">PERSISTED</span>
         </div>
         <div className="h-1 bg-border/20 rounded-full overflow-hidden">
            <div className="h-full bg-gr w-full shadow-[0_0_10px_rgba(0,255,0,0.3)]" />
         </div>
      </div>
    </div>
  )
}

import React, { useState } from "react"
import { Search, Send, Image as ImageIcon, Music, FileText, Loader2, Link2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore, Source } from "../store"

export default function SearchInterface() {
  const [query, setQuery] = useState("")
  const { messages, addMessage, isLoading, setLoading } = useStore()

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim() || isLoading) return

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: query,
      timestamp: new Date()
    }
    addMessage(userMsg)
    setLoading(true)
    const currentQuery = query
    setQuery("")

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery, top_k: 5 })
      })
      const data = await res.json()
      
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: data.answer,
        sources: data.sources,
        latency_ms: data.latency_ms,
        timestamp: new Date()
      }
      addMessage(assistantMsg)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const presets = [
    { text: "show me revenue charts", icon: <ImageIcon size={12} /> },
    { text: "2024 target discussion", icon: <Music size={12} /> },
    { text: "technical specifications PDF", icon: <FileText size={12} /> }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
             <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                <Search size={20} className="text-t-3" />
             </div>
             <div>
                <p className="text-sm font-head font-bold text-t-1">Knowledge Retrieval</p>
                <p className="text-xs text-t-3">Ask NEXUS about your local indexed intelligence.</p>
             </div>
             
             <div className="flex gap-2 flex-wrap justify-center max-w-sm">
                {presets.map((p) => (
                   <button 
                    key={p.text}
                    onClick={() => { setQuery(p.text); setTimeout(handleSearch, 100) }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-t-3 hover:bg-white/10 transition-colors"
                   >
                     {p.icon}
                     {p.text}
                   </button>
                ))}
             </div>
          </div>
        )}

        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-cy text-black font-medium' 
                : 'bg-bg-2 border border-border text-t-1'
            }`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
              
              {m.latency_ms && (
                <div className="mt-4 flex items-center gap-3 opacity-50 border-t border-border/20 pt-3">
                  <span className="text-[10px] font-mono">RETRIEVED IN {m.latency_ms}ms</span>
                </div>
              )}
            </div>

            {m.sources && m.sources.length > 0 && (
               <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-[85%]">
                  {m.sources.map((s, i) => (
                    <div key={i} className="p-2.5 bg-bg-2 border border-border/50 rounded-lg flex gap-3 group cursor-pointer hover:border-cy/50 transition-all">
                       <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                          {s.modality === 'image' && <ImageIcon size={14} className="text-ma" />}
                          {s.modality === 'audio' && <Music size={14} className="text-go" />}
                          {s.modality === 'text' && <FileText size={14} className="text-cy" />}
                       </div>
                       <div className="min-w-0">
                          <div className="text-[10px] font-mono text-t-1 truncate uppercase">{s.source_path.split(/[/\\]/).pop()}</div>
                          <div className="text-[9px] font-mono text-t-3">Score: {s.score.toFixed(4)}</div>
                       </div>
                    </div>
                  ))}
               </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-border/50 bg-bg/50 backdrop-blur-md">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query vector space..."
            className="w-full bg-bg-2 border border-border/50 rounded-xl py-4 pl-12 pr-16 text-sm text-t-1 focus:outline-none focus:border-cy/50 focus:ring-1 focus:ring-cy/20 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-t-3" size={18} />
          
          <button 
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-cy text-black rounded-lg flex items-center justify-center hover:bg-cy-2 transition-colors disabled:opacity-50 disabled:grayscale"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
        <p className="mt-3 text-[10px] text-t-3 font-mono text-center uppercase tracking-widest opacity-50">
          Neural Search Active · {isLoading ? "Processing..." : "Ready"}
        </p>
      </div>
    </div>
  )
}

import { useEffect } from "react"
import { useStore } from "./store"
import { Topbar } from "./components/Topbar"
import { Sidebar } from "./components/Sidebar"
import { ChatPanel } from "./components/ChatPanel"
import { SourcePanel } from "./components/SourcePanel"
import { CommandPalette } from "./components/CommandPalette"
import { Toaster } from "./components/Toaster"

export default function App() {
  const { activeSource, cmdOpen, setCmdOpen } = useStore()

  /* global keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      /* ⌘K / Ctrl+K → command palette */
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen(true)
      }
      /* Escape → close source panel or cmd */
      if (e.key === "Escape") {
        if (cmdOpen) { setCmdOpen(false); return }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [cmdOpen, setCmdOpen])

  return (
    <>
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Root shell */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}>
        <Topbar />

        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: activeSource
            ? "260px 1fr 340px"
            : "260px 1fr",
          overflow: "hidden",
          transition: "grid-template-columns 0.3s cubic-bezier(.4,0,.2,1)",
        }}>
          <Sidebar />
          <ChatPanel />
          {activeSource && (
            <div className="slide-left" style={{ overflow: "hidden" }}>
              <SourcePanel />
            </div>
          )}
        </div>
      </div>

      {/* Floating layers */}
      {cmdOpen && <CommandPalette />}
      <Toaster />
    </>
  )
}
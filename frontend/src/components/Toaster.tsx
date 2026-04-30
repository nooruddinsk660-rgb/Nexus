import { useStore } from "../store"
import type { Toast } from "../store"

function ToastItem({ toast }: { toast: Toast }) {
    const { dismissToast } = useStore()

    const CONFIG = {
        success: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <polyline points="9 12 11 14 15 10"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: "var(--emerald)",
            dim: "var(--emerald-dim)",
            brd: "var(--emerald-brd)",
        },
        error: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: "var(--rose)",
            dim: "var(--rose-dim)",
            brd: "var(--rose-brd)",
        },
        info: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: "var(--brand-light)",
            dim: "var(--brand-dim)",
            brd: "var(--brand-brd)",
        },
        loading: {
            icon: (
                <div style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid currentColor",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                    flexShrink: 0,
                }} />
            ),
            color: "var(--amber)",
            dim: "var(--amber-dim)",
            brd: "var(--amber-brd)",
        },
    }

    const cfg = CONFIG[toast.type]

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 14px",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-overlay)",
            border: `1px solid ${cfg.brd}`,
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(16px)",
            animation: "fadeUp .22s cubic-bezier(.22,.68,0,1.2)",
            maxWidth: "360px",
            minWidth: "260px",
        }}>
            {/* icon */}
            <div style={{ color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
            </div>

            {/* message */}
            <span style={{
                flex: 1,
                fontSize: "13px",
                color: "var(--text-primary)",
                lineHeight: 1.4,
            }}>{toast.message}</span>

            {/* dismiss */}
            {toast.type !== "loading" && (
                <button
                    onClick={() => dismissToast(toast.id)}
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2px",
                        borderRadius: "4px",
                        flexShrink: 0,
                        transition: "color .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="6" y1="6" x2="18" y2="18"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    )
}

export function Toaster() {
    const { toasts } = useStore()
    if (!toasts.length) return null

    return (
        <div style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9000,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-end",
        }}>
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} />
            ))}
        </div>
    )
}
import type { Config } from "tailwindcss"

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand:   "#6366f1",
        violet:  "#8b5cf6",
        emerald: "#10b981",
        amber:   "#f59e0b",
        rose:    "#f43f5e",
        sky:     "#0ea5e9",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm:   "6px",
        md:   "10px",
        lg:   "14px",
        xl:   "18px",
        "2xl":"22px",
      },
      animation: {
        "fade-up":    "fadeUp .28s cubic-bezier(.22,.68,0,1.2) both",
        "fade-in":    "fadeIn .2s ease both",
        "spin-slow":  "spin 1.4s linear infinite",
        "pulse-dot":  "pulse-dot 2.4s ease infinite",
        "shimmer":    "shimmer 1.6s ease infinite",
        "float":      "float 3s ease infinite",
      },
    },
  },
  plugins: [],
} satisfies Config

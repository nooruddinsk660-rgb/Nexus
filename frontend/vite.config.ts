import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    /* proxy API so CORS never blocks */
    proxy: {
      "/api": {
        target:      "http://localhost:8000",
        changeOrigin: true,
        rewrite:     (p) => p,
      },
    },
  },

  build: {
    outDir:     "dist",
    sourcemap:  false,
    minify:     "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          react:   ["react", "react-dom"],
          zustand: ["zustand"],
          wave:    ["wavesurfer.js"],
        },
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "wavesurfer.js"],
  },
})

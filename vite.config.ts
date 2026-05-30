import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Vite config. The dev server proxies /api, /rag, /health, /metrics to the
// FastAPI backend so the browser never hits CORS during development.
export default defineConfig(({ mode }) => {
  const backend = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";
  const proxy =
    mode === "development"
      ? {
          "/api": { target: backend, changeOrigin: true },
          "/rag": { target: backend, changeOrigin: true },
          "/health": { target: backend, changeOrigin: true },
          "/metrics": { target: backend, changeOrigin: true },
        }
      : undefined;

  return {
    plugins: [react()],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    server: { port: 5173, proxy },
  };
});

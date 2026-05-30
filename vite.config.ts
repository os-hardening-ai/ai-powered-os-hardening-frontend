import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: { env: Record<string, string | undefined> };

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
    resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
    server: { port: 5173, proxy },
  };
});

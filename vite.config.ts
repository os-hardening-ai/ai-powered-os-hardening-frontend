import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const backend = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";
  const proxy =
    mode === "development"
      ? {
          "/api": { target: backend, changeOrigin: true },
          "/auth": { target: backend, changeOrigin: true }, // JWT login/logout/me
          "/rag": { target: backend, changeOrigin: true },
          "/v1": { target: backend, changeOrigin: true }, // OpenAI-compat
          "/health": { target: backend, changeOrigin: true },
          "/metrics": { target: backend, changeOrigin: true },
        }
      : undefined;

  return {
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: { port: 5173, open: true, proxy },
  };
});

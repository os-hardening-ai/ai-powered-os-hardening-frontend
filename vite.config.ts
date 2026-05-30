import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const backend = "http://localhost:8000";
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
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: { port: 5173, open: true, proxy },
  };
});

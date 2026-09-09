import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Django REST API runs on 127.0.0.1:8000 in local dev.
      // Requests to /api/* from the React app are forwarded there,
      // so the browser never has to deal with cross-origin calls.
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});

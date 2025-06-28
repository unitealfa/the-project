import { defineConfig, loadEnv } from "vite";
import react                        from "@vitejs/plugin-react";
import path                         from "path";

export default defineConfig(({ mode }) => {
  // charge les .env pour VITE_*
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    base: "./",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        // proxy vers votre backend NestJS
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "build",
    },
  };
});

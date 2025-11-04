import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

console.log("VITE CONFIG LOADED");

export default defineConfig(({ mode }) => {
  // Load env files from the root directory (one level up)
  const env = loadEnv(mode, path.resolve(__dirname, ".."), "");

  console.log("🎨 Vite Config Loaded");
  console.log("📦 Mode:", mode);
  console.log("🔌 API URL:", env.VITE_API_URL);
  console.log("🌐 Port:", env.VITE_PORT || "8000");

  return {
    plugins: [
      react(),
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    resolve: {
      alias: {
        "@common": path.resolve(__dirname, "../common"),
        "@src": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || "8000"),
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://127.0.0.1:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    envDir: "../",
  };
});

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

console.log("VITE CONFIG LOADED");
console.log("__dirname:", __dirname);
console.log("Common path:", path.resolve(__dirname, "../common"));
console.log(
  "Common exists:",
  fs.existsSync(path.resolve(__dirname, "../common")),
);
console.log(
  "Supabase types exists:",
  fs.existsSync(path.resolve(__dirname, "../common/supabase.types.ts")),
);

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
      tailwindcss(), // Use Tailwind v4 for the project
      tsconfigPaths({
        root: __dirname,
        projects: ["./tsconfig.app.json"],
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
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    envDir: "../",
  };
});

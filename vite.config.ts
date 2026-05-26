import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "src/app/sidepanel.tsx"),
        popup: resolve(__dirname, "src/app/popup.tsx"),
        background: resolve(__dirname, "src/app/background.ts"),
        content: resolve(__dirname, "src/app/content.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "sidepanel") return "sidepanel.js";
          if (chunk.name === "popup") return "popup.js";
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "content") return "content.js";
          return "[name].js";
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});

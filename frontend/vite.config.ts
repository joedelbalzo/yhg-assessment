import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// If available, you can import types for more explicit configuration, for example:
// import type { UserConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: { babelrc: true },
    }),
  ],
  logLevel: "info",
  build: {
    sourcemap: false,
    minify: false,
    outDir: "dist",
    rollupOptions: {
      output: {
        entryFileNames: `assets/index-8675309.js`,
      },
    },
  },
  server: {
    port: 5000,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/",
});

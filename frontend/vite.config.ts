import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// If available, you can import types for more explicit configuration, for example:
// import type { UserConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: { babelrc: true },
    }),
  ],
  define: {
    "process.env.VITE_API_ENV": JSON.stringify(process.env.VITE_API_ENV),
  },
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
    port: 3000,
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

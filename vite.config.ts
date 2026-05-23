import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "./examples/playground",
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      "better-covers": new URL("./src/index.ts", import.meta.url).pathname,
    },
  },
});

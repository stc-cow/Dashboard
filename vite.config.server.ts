import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    lib: {
      entry: "./server/node-build.ts",
      formats: ["es"],
      fileName: "node-build",
    },
    outDir: "./dist/server",
    emptyOutDir: false,
    rollupOptions: {
      external: ["express", "cors"],
    },
  },
  ssr: {
    noExternal: true,
  },
});

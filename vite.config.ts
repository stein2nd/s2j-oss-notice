import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    target: "node22",
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    ssr: true,
    rollupOptions: {
      input: {
        cli: path.resolve(__dirname, "src/bin/cli.ts"),
        index: path.resolve(__dirname, "src/index.ts"),
      },
      external: [/^node:/],
      output: {
        dir: path.resolve(__dirname, "dist"),
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "cli") {
            return "bin/cli.js";
          }
          return "[name].js";
        },
        format: "esm",
      },
    },
  },
  plugins: [
    {
      name: "shebang-cli",
      generateBundle(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === "chunk" && file.fileName === "bin/cli.js") {
            file.code = `#!/usr/bin/env node\n${file.code}`;
          }
        }
      },
    },
  ],
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    environment: "node",
  },
});
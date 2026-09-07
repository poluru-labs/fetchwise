import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["esm", "cjs", "iife"],
    globalName: "fetchwise",
    dts: true,
    clean: true,
    sourcemap: true,
    target: "es2020",
    treeshake: true,
    platform: "neutral",
    splitting: false,
    outExtension({ format }) {
      if (format === "iife") return { js: ".global.js" };
      if (format === "cjs") return { js: ".cjs" };
      return { js: ".js" };
    },
  },
  {
    entry: {
      cli: "src/cli.ts",
    },
    format: ["esm"],
    dts: false,
    sourcemap: false,
    target: "node18",
    platform: "node",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);

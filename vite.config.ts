import { sentryVitePlugin } from "@sentry/vite-plugin";
import { resolve } from "node:path";

import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import inspect from "vite-plugin-inspect";
import preact from "@preact/preset-vite";
import path from "path";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      comlink(),
      preact(),
      inspect(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "eyejack",
        project: "subiaco-xmas",
      }),
    ],
    worker: {
      plugins: () => [comlink()],
    },
    base: mode === "production" ? "/subiaco-twilight-trail/" : "",
    assetsInclude: ["**/*.glb", "**/*.hdr"],
    server: {
      https: {
        key: "./k-key.pem",
        cert: "./k.pem",
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      exclude: ["@undecaf/zbar-wasm"],
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "./index.html"),
        },
      },
      outDir: "dist",

      sourcemap: true,
    },
  };
});

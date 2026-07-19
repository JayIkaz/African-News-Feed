import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";
import { rm } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildAll() {
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });

  console.log("building server...");

  await esbuild({
    entryPoints: [
      path.resolve(__dirname, "src/index.ts"),
      // Bundled separately (no app.listen side effect) for the Vercel
      // serverless function entrypoint — see api/index.js.
      path.resolve(__dirname, "src/app.ts"),
    ],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Fully bundled (workspace packages and all deps) so the Vercel serverless
    // runtime never has to resolve raw TS or pnpm-workspace symlinks. Only
    // native/unbundleable packages are externalized.
    external: ["*.node", "pg-native"],
    sourcemap: "linked",
    // Make sure packages that are cjs-only (e.g. express) but are bundled
    // continue to work in our esm output file.
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

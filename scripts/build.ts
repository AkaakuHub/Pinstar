import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const outdir = resolve(root, "dist");

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve(root, "src/index.ts")],
  outdir,
  target: "browser",
  format: "iife",
  minify: true,
  sourcemap: "none",
  naming: "pinstar.js",
});

if (!result.success) {
  for (const item of result.logs) console.error(item);
  process.exit(1);
}

console.log("Built dist/pinstar.js");

import tailwind from "bun-plugin-tailwind";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildPayload, CONTENT_MAP, parseAmendments, parseCSV } from "./src/lib/content";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}

// --- Static content payload (dist/content.json) ---
// All 39 markdown files + the amendments manifest, embedded at build time so
// the static site works with zero API calls (App.tsx fetches /content.json).
// The Bun server serves the identical payload at GET /content.json (same
// buildPayload + CONTENT_MAP; only `generated` differs). Written after
// Bun.build because the rm() above wipes dist.
const repoRoot = path.resolve(process.cwd(), "..");

const markdowns: Record<string, string> = {};
for (const [key, rel] of Object.entries(CONTENT_MAP)) {
  markdowns[key] = await Bun.file(path.resolve(repoRoot, rel)).text();
}
const csv = await Bun.file(path.resolve(repoRoot, "docs/amendments.csv")).text();
const rows = parseCSV(csv).filter(r => r.length > 0 && !r[0].startsWith("#"));
const data = rows[0]?.[0] === "number" ? rows.slice(1) : rows;
const json = JSON.stringify(buildPayload(markdowns, parseAmendments(data)));

await mkdir(outdir, { recursive: true });
await writeFile(path.join(outdir, "content.json"), json);
console.log(` content.json  ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB`);

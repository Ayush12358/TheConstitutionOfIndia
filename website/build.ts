import tailwind from "bun-plugin-tailwind";
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  amendmentTextName,
  buildPayload,
  CONTENT_MAP,
  parseAmendments,
  parseCSV,
  type Amendment,
} from "./src/lib/content";

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
// All 39 markdown files + the amendments manifest + every act/bill plain text,
// embedded at build time so the static site works with zero API calls
// (App.tsx fetches /content.json). The Bun server serves the identical
// payload at GET /content.json (same buildPayload + CONTENT_MAP; only
// `generated` differs). Written after Bun.build because the rm() above wipes
// dist.
const repoRoot = path.resolve(process.cwd(), "..");

const markdowns: Record<string, string> = {};
for (const [key, rel] of Object.entries(CONTENT_MAP)) {
  markdowns[key] = await Bun.file(path.resolve(repoRoot, rel)).text();
}
const csv = await Bun.file(path.resolve(repoRoot, "docs/amendments.csv")).text();
const rows = parseCSV(csv).filter(r => r.length > 0 && !(r[0] ?? "").startsWith("#"));
const data = rows[0]?.[0] === "number" ? rows.slice(1) : rows;
const amendments = parseAmendments(data);

// Plain text of every act and surviving bill (next to the PDFs in AMENDMENTS/).
const readTexts = async (kind: "act" | "bill", filter: (a: Amendment) => boolean) => {
  const texts: Record<string, string> = {};
  for (const a of amendments) {
    if (!filter(a)) continue;
    const full = path.resolve(repoRoot, "AMENDMENTS", amendmentTextName(kind, Number(a.number)));
    if (await Bun.file(full).exists()) {
      texts[a.number] = (await Bun.file(full).text()).trim();
    }
  }
  return texts;
};
const actTexts = await readTexts("act", () => true);
const billTexts = await readTexts("bill", a => a.has_bill);

const json = JSON.stringify(buildPayload(markdowns, amendments, actTexts, billTexts));

await mkdir(outdir, { recursive: true });
await writeFile(path.join(outdir, "content.json"), json);
console.log(` content.json  ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB (${Object.keys(actTexts).length} acts, ${Object.keys(billTexts).length} bills as text)`);

// --- History states for the date browser (generated, committed) ---
await cp(path.join(process.cwd(), "data", "history"), path.join(outdir, "history"), { recursive: true });
console.log(" history/  (date-browser states)");

// --- Amendment PDFs at stable /amendments/ URLs (same links as the dev server) ---
const pdfDir = path.join(outdir, "amendments");
await mkdir(pdfDir, { recursive: true });
let pdfCount = 0;
for (const name of await readdir(path.join(repoRoot, "AMENDMENTS"))) {
  if (!/^AMENDMENT_\d{2,3}_(ACT|BILL)\.pdf$/.test(name)) continue;
  await cp(path.join(repoRoot, "AMENDMENTS", name), path.join(pdfDir, name));
  pdfCount++;
}
console.log(` amendments/  ${pdfCount} PDFs`);

// Regenerates website/data/history/*.json from the repo's git history.
//
// Sources per state (state n = the constitution as it stood after the NNth
// amendment, with state 0 = the 1950 original):
//   - 1..96:   the txt files in the author's 2015 tag trees
//              (STABLE_AMENDMENT_NN). These are the original bundles; a few
//              amendments (e.g. 73-75, 88) recorded no file change there —
//              the git view for those shows "no changes recorded".
//   - 97..106: the reconstructed bundles inside each tag's zip
//              (AMENDMENT_NN_<date>.zip at STABLE_AMENDMENT_106). The 97+ tag
//              trees share one text; the zips carry the per-amendment states.
//   - 0:       AMENDMENT_ORIGINAL_26011950.zip (same tag).
//
// Each file is normalized (paragraph rewrap) so era-vs-era line wrapping does
// not pollute diffs; consecutive identical states are deduped. Output:
//   data/history/index.json   states (dates), per-file version index,
//                             per-amendment changed-files summary
//   data/history/<key>.json   [{ from, text }] for one content key
//
// Run: cd website && bun run scripts/generate-history.ts
// Output is committed; the site serves it statically.

import { mkdir, writeFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import path from "node:path";
import { CONTENT_MAP, parseCSV } from "../src/lib/content";

const outdir = path.join(process.cwd(), "data", "history");
const repoRoot = path.resolve(process.cwd(), "..");

function run(cmd: string[]): { out: string; err: string; outBuf: Buffer } {
  const p = Bun.spawnSync(cmd, { cwd: repoRoot, stdin: "pipe", stdout: "pipe", stderr: "pipe" });
  return { out: p.stdout.toString(), err: p.stderr.toString(), outBuf: Buffer.from(p.stdout) };
}

// --- Minimal ZIP reader (central directory; deflate + stored members) ---
function unzip(buf: Buffer): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error("no EOCD");
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error("bad central entry");
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.subarray(off + 46, off + 46 + nameLen).toString("utf-8");
    if (!name.endsWith("/")) {
      // local header: PK\x03\x04 + version(2) flags(2) method(2) time(2) date(2)
      // crc(4) compSize(4) size(4) nameLen(2) extraLen(2)
      const lhNameLen = buf.readUInt16LE(localOff + 26);
      const lhExtraLen = buf.readUInt16LE(localOff + 28);
      const dataStart = localOff + 30 + lhNameLen + lhExtraLen;
      const data = buf.subarray(dataStart, dataStart + compSize);
      out.set(name, method === 8 ? inflateRawSync(data) : data);
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

// key -> content-dir name, derived from CONTENT_MAP ("PART_4_A/PART4A.md" -> "PART_4_A")
const dirByKey: Record<string, string> = {};
for (const [key, rel] of Object.entries(CONTENT_MAP)) dirByKey[key] = rel.split("/")[0]!;
const keyByDir = Object.fromEntries(Object.entries(dirByKey).map(([k, d]) => [d, k]));

// --- Normalize: strip spacing noise, rewrap paragraphs (kills era line-wrap churn) ---

// Article-heading lines start their own paragraph so a heading always begins a
// line after the rewrap — per-article amendment attribution (lib/timeline.ts)
// matches article keys at line starts. The archives write headings several
// ways: "19. Protection of certain rights…", "330A. Reservation…",
// "31. (1) No person…", and a bare "31." on its own line — accept any
// continuation after the number. Only line breaks move; the word sequence is
// untouched.
const ARTICLE_HEADING = /^\d+[A-Z]*\.(?:\s+|$)/;

// Split one paragraph (a blank-line-delimited block) at article-heading lines:
// the heading line and everything after it (until the next heading) become
// their own paragraph.
function splitAtArticleHeadings(para: string): string[] {
  const segments: string[] = [];
  let cur = "";
  for (const line of para.split("\n")) {
    if (ARTICLE_HEADING.test(line) && cur) {
      segments.push(cur);
      cur = "";
    }
    cur = (cur ? cur + " " : "") + line;
  }
  if (cur) segments.push(cur);
  return segments;
}

function normalize(raw: string): string {
  const fixed = raw.replace(/[ \t]+/g, " ").replace(/ *\r?\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const width = 100;
  return fixed
    .split(/\n\s*\n/)
    .flatMap(splitAtArticleHeadings)
    .map(para => {
      const words = para.split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        if (cur && cur.length + 1 + w.length > width) {
          lines.push(cur);
          cur = w;
        } else cur = (cur ? cur + " " : "") + w;
      }
      if (cur) lines.push(cur);
      return lines.join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

function stateFiles(tag: string): { key: string; ref: string }[] {
  const tree = run(["git", "ls-tree", "-r", "--name-only", tag]).out.split("\n");
  const files: { key: string; ref: string }[] = [];
  for (const p of tree) {
    const m = p.match(/^(PREAMBLE|PART_\d+(_[A-Z])?|SCHEDULE_\d+)\/([^/]+)\.txt$/);
    if (!m) continue;
    const key = keyByDir[m[1]!];
    if (key) files.push({ key, ref: `${tag}:${p}` });
  }
  return files;
}

async function readBlobs(refs: string[]): Promise<Buffer[]> {
  if (refs.length === 0) return [];
  const proc = Bun.spawn(["git", "cat-file", "--batch"], { cwd: repoRoot, stdin: "pipe", stdout: "pipe", stderr: "pipe" });
  proc.stdin.write(new TextEncoder().encode(refs.join("\n") + "\n"));
  proc.stdin.end();
  const out = proc.stdout;
  const chunks: Buffer[] = [];
  const reader = out.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(Buffer.from(value));
  }
  const buf = Buffer.concat(chunks);
  const text = new TextDecoder("utf-8", { fatal: false });
  const blobs: Buffer[] = [];
  let pos = 0;
  for (const ref of refs) {
    const nl = buf.indexOf(0x0a, pos);
    const header = buf.subarray(pos, nl).toString();
    pos = nl + 1;
    if (header.endsWith(" missing")) {
      blobs.push(Buffer.from(""));
      continue;
    }
    const size = Number(header.split(" ")[2]);
    blobs.push(Buffer.from(buf.subarray(pos, pos + size)));
    pos += size + 1;
  }
  return blobs;
}

// --- Collect states ---
// 1..96 from the author's tag trees.
const content: Record<string, Record<number, string>> = {}; // key -> state -> normalized text
const tags = run(["git", "tag"]).out.trim().split("\n");
for (const tag of tags) {
  const m = tag.match(/^STABLE_AMENDMENT_(\d+)$/);
  if (!m) continue;
  const n = Number(m[1]);
  if (n < 1 || n > 96) continue;
  const files = stateFiles(tag);
  const blobs = await readBlobs(files.map(f => f.ref));
  files.forEach((f, i) => {
    if (blobs[i]!.length > 0) (content[f.key] ??= {})[n] = normalize(blobs[i]!.toString("utf-8"));
  });
}

// 0 (original) and 97..106 from the bundles inside STABLE_AMENDMENT_106.
const last = "STABLE_AMENDMENT_106";
const zipNames = run(["git", "ls-tree", "--name-only", last])
  .out.split("\n")
  .filter(n => n.endsWith(".zip"));
const byN = new Map<number, string>();
for (const name of zipNames) {
  const m = name.match(/^AMENDMENT_(\d+)_/);
  if (m) byN.set(Number(m[1]), name);
}
const wanted = [0, ...Array.from({ length: 10 }, (_, i) => 97 + i)];
for (const n of wanted) {
  const zipName = n === 0 ? "AMENDMENT_ORIGINAL_26011950.zip" : byN.get(n);
  if (!zipName) {
    console.warn(`  (no zip for state ${n})`);
    continue;
  }
  const zip = unzip(run(["git", "show", `${last}:${zipName}`]).outBuf);
  let txtCount = 0;
  for (const [member, data] of zip) {
    const m = member.match(/^(PREAMBLE|PART_\d+(_[A-Z])?|SCHEDULE_\d+)\/[^/]+\.txt$/);
    if (!m) continue;
    const key = keyByDir[m[1]!];
    if (!key) continue;
    txtCount++;
    (content[key] ??= {})[n] = normalize(data.toString("utf-8"));
  }
  console.log(`state ${n} (${zipName}): ${txtCount} txt files`);
}

// --- Assent dates from the manifest ---
const csv = await Bun.file(path.join(repoRoot, "docs", "amendments.csv")).text();
const rows = parseCSV(csv).filter(r => r.length > 0 && !(r[0] ?? "").startsWith("#"));
const data = rows[0]?.[0] === "number" ? rows.slice(1) : rows;
const metaByN = new Map(data.map(r => [Number(r[0]!), { date: r[2] ?? "", title: r[1] ?? "" }]));

// --- Per-key version lists (dedupe consecutive identical states) ---
const versions: Record<string, { from: number; text: string }[]> = {};
for (const [key, byState] of Object.entries(content)) {
  const sorted = Object.keys(byState).map(Number).sort((a, b) => a - b);
  const list: { from: number; text: string }[] = [];
  let last = "\u0000";
  for (const n of sorted) {
    const t = byState[n]!;
    if (t === last) continue;
    list.push({ from: n, text: t });
    last = t;
  }
  versions[key] = list;
}

// --- Per-amendment changed-files summary ---
const changesByN: Record<number, string[]> = {};
for (const [key, list] of Object.entries(versions)) {
  for (const v of list) (changesByN[v.from] ??= []).push(key);
}

const statesOut = [0, ...Array.from({ length: 106 }, (_, i) => i + 1)].map(n => ({
  n,
  date: n === 0 ? "1950-01-26" : metaByN.get(n)?.date ?? "",
  title: n === 0 ? "Original Constitution" : metaByN.get(n)?.title ?? `Amendment ${n}`,
}));

const index = {
  generated: new Date().toISOString(),
  states: statesOut,
  versions: Object.fromEntries(Object.entries(versions).map(([k, v]) => [k, v.map(x => x.from)])),
  changes: changesByN,
};

await mkdir(outdir, { recursive: true });
await writeFile(path.join(outdir, "index.json"), JSON.stringify(index));
let total = 0;
for (const [key, list] of Object.entries(versions)) {
  const body = JSON.stringify(list);
  total += body.length;
  await writeFile(path.join(outdir, `${key}.json`), body);
}
const stateCoverage = statesOut.filter(s => Object.values(content).some(by => by[s.n] !== undefined)).length;
console.log(`states with content: ${stateCoverage}/107`);
console.log(`amendments touching files: ${Object.keys(changesByN).length}`);
console.log(`total payload: ${(total / 1024 / 1024).toFixed(1)} MB`);
const noChange = statesOut.filter(s => s.n > 0 && !changesByN[s.n]).map(s => s.n);
console.log(`amendments with no recorded change: ${noChange.join(", ")}`);

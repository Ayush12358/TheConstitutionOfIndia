import { serve } from "bun";
import path from "node:path";
import index from "./index.html";

// Whitelist of content keys -> repo-root-relative markdown paths.
// Keys are never derived from the request path.
const contentMap: Record<string, string> = {
  preamble: "PREAMBLE/Preamble.md",
  part1: "PART_1/PART1.md",
  part2: "PART_2/PART2.md",
  part3: "PART_3/PART3.md",
  part4: "PART_4/PART4.md",
  part4a: "PART_4_A/PART4A.md",
  part5: "PART_5/PART5.md",
  part6: "PART_6/PART6.md",
  part7: "PART_7/PART7.md",
  part8: "PART_8/PART8.md",
  part9: "PART_9/PART9.md",
  part9a: "PART_9_A/PART9A.md",
  part9b: "PART_9_B/PART9B.md",
  part10: "PART_10/PART10.md",
  part11: "PART_11/PART11.md",
  part12: "PART_12/PART12.md",
  part13: "PART_13/PART13.md",
  part14: "PART_14/PART14.md",
  part14a: "PART_14_A/PART14A.md",
  part15: "PART_15/PART15.md",
  part16: "PART_16/PART16.md",
  part17: "PART_17/PART17.md",
  part18: "PART_18/PART18.md",
  part19: "PART_19/PART19.md",
  part20: "PART_20/PART20.md",
  part21: "PART_21/PART21.md",
  part22: "PART_22/PART22.md",
  schedule1: "SCHEDULE_1/SCHEDULE1.md",
  schedule2: "SCHEDULE_2/SCHEDULE2.md",
  schedule3: "SCHEDULE_3/SCHEDULE3.md",
  schedule4: "SCHEDULE_4/SCHEDULE4.md",
  schedule5: "SCHEDULE_5/SCHEDULE5.md",
  schedule6: "SCHEDULE_6/SCHEDULE6.md",
  schedule7: "SCHEDULE_7/SCHEDULE7.md",
  schedule8: "SCHEDULE_8/SCHEDULE8.md",
  schedule9: "SCHEDULE_9/SCHEDULE9.md",
  schedule10: "SCHEDULE_10/SCHEDULE10.md",
  schedule11: "SCHEDULE_11/SCHEDULE11.md",
  schedule12: "SCHEDULE_12/SCHEDULE12.md",
};

// Server runs with cwd = website/, so the repo root is one level up.
const repoRoot = path.resolve(process.cwd(), "..");

// All 39 content files, loaded lazily once (first /api/search request) and
// reused by /api/content and /api/index afterwards.
const contentCache = new Map<string, { title: string; markdown: string }>();

// --- Amendments manifest (docs/amendments.csv) ---

type Amendment = {
  number: string;
  title: string;
  assent_date: string;
  key_changes: string;
  status: string;
  has_bill: boolean;
};

// Tiny RFC4180 CSV parser: quoted fields may contain commas, "" escapes a
// quote, and lines starting with '#' are comments (skipped). No dependencies.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// docs/amendments.csv, parsed once and cached at module level. Columns:
// number,title,assent_date,key_changes,bill_file,act_file,bill_url,act_url,zip_file,status
let amendmentsCache: Amendment[] | null = null;

async function loadAmendments(): Promise<Amendment[] | null> {
  if (amendmentsCache) return amendmentsCache;
  const full = path.resolve(repoRoot, "docs/amendments.csv");
  if (!full.startsWith(repoRoot + path.sep)) return null;
  try {
    const text = await Bun.file(full).text();
    const rows = parseCSV(text).filter(r => r.length > 0 && !r[0].startsWith("#"));
    // Drop the header row ("number,title,...").
    const data = rows[0]?.[0] === "number" ? rows.slice(1) : rows;
    amendmentsCache = data.map(r => ({
      number: r[0],
      title: r[1],
      assent_date: r[2],
      key_changes: r[3],
      status: r[9],
      has_bill: r[9] !== "MISSING_BILL",
    }));
    return amendmentsCache;
  } catch {
    return null;
  }
}

// Amendment PDFs live in repoRoot/AMENDMENTS as AMENDMENT_NN_<KIND>.pdf
// (2-digit zero-padded for n <= 96, 3-digit for n > 96, e.g. AMENDMENT_096_ACT.pdf).
function amendmentPdfPath(kind: "act" | "bill", n: number): string | null {
  const padded = n <= 96 ? String(n).padStart(2, "0") : String(n).padStart(3, "0");
  const full = path.resolve(repoRoot, "AMENDMENTS", `AMENDMENT_${padded}_${kind.toUpperCase()}.pdf`);
  // Defense in depth: the name is derived from a validated int, but stay inside the repo root.
  if (!full.startsWith(repoRoot + path.sep)) return null;
  return full;
}

function contentPath(key: string): string | null {
  const rel = contentMap[key];
  if (!rel) return null;
  const full = path.resolve(repoRoot, rel);
  // Defense in depth on top of the whitelist: stay inside the repo root.
  if (!full.startsWith(repoRoot + path.sep)) return null;
  return full;
}

function titleOf(markdown: string, fallback: string): string {
  const line = markdown.split("\n").find(l => l.startsWith("# "));
  return line ? line.slice(2).trim() : fallback;
}

async function loadContent(key: string) {
  const cached = contentCache.get(key);
  if (cached) return { key, ...cached };
  const full = contentPath(key);
  if (!full) return null;
  try {
    const markdown = await Bun.file(full).text();
    const content = { key, title: titleOf(markdown, key), markdown };
    contentCache.set(key, { title: content.title, markdown });
    return content;
  } catch {
    return null;
  }
}

const server = serve({
  routes: {
    "/api/content/:key": async req => {
      const content = await loadContent(req.params.key);
      if (!content) return Response.json({ error: `Unknown content key: ${req.params.key}` }, { status: 404 });
      return Response.json(content);
    },

    "/api/index": async () => {
      const items = await Promise.all(
        Object.keys(contentMap).map(async key => {
          const content = await loadContent(key);
          return { key, title: content?.title ?? key };
        }),
      );
      return Response.json(items);
    },

    "/api/search": async req => {
      const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
      if (q.length < 2) return Response.json({ error: "query too short" }, { status: 400 });

      // Plain case-insensitive substring scan over the cached whitelisted files —
      // no regex, so user input can't inject patterns. Warm the cache once.
      const needle = q.toLowerCase();
      await Promise.all(Object.keys(contentMap).map(loadContent));
      const results: { key: string; title: string; matches: { line: string; snippet: string }[] }[] = [];
      for (const [key, content] of contentCache) {
        const matches: { line: string; snippet: string }[] = [];
        for (const line of content.markdown.split("\n")) {
          if (!line.toLowerCase().includes(needle)) continue;
          matches.push({ line, snippet: line.length > 140 ? `${line.slice(0, 140)}…` : line });
          if (matches.length === 5) break;
        }
        if (matches.length > 0) results.push({ key, title: content.title, matches });
      }
      results.sort((a, b) => b.matches.length - a.matches.length);
      return Response.json(results.slice(0, 20));
    },

    "/api/amendments": async () => {
      const amendments = await loadAmendments();
      if (!amendments) {
        return Response.json({ error: "Failed to load amendments manifest" }, { status: 500 });
      }
      return Response.json(amendments);
    },

    "/api/file/:kind/:n": async req => {
      const { kind, n: nRaw } = req.params;
      if (kind !== "act" && kind !== "bill") {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const n = Number(nRaw);
      if (!Number.isInteger(n) || n < 1 || n > 106) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const amendments = await loadAmendments();
      if (kind === "bill" && amendments?.[n - 1]?.status === "MISSING_BILL") {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const full = amendmentPdfPath(kind, n);
      if (!full) return Response.json({ error: "Not found" }, { status: 404 });
      const file = Bun.file(full);
      // Never serve a nonexistent file.
      if (!(await file.exists())) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      return new Response(file, { headers: { "Content-Type": "application/pdf" } });
    },

    // Any other /api/* path is a 404, never the SPA fallback.
    "/api/*": () => Response.json({ error: "Not found" }, { status: 404 }),

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

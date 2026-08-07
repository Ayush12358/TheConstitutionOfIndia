import { serve } from "bun";
import path from "node:path";
import {
  amendmentPdfName,
  amendmentTextName,
  buildPayload,
  CONTENT_MAP,
  parseAmendments,
  parseCSV,
  titleOf,
  type Amendment,
} from "./lib/content";
import index from "./index.html";

// Content keys -> repo-root-relative markdown paths live in lib/content.ts
// (CONTENT_MAP), shared with the static build so dist/content.json and this
// server's /content.json are built from the same whitelist. Keys are never
// derived from the request path.

// Server runs with cwd = website/, so the repo root is one level up.
const repoRoot = path.resolve(process.cwd(), "..");

// All 39 content files, loaded lazily once (first /api/search request) and
// reused by /api/content and /api/index afterwards.
const contentCache = new Map<string, { title: string; markdown: string }>();

// --- Amendments manifest (docs/amendments.csv) ---

// docs/amendments.csv, parsed once and cached at module level. Columns:
// number,title,assent_date,key_changes,bill_file,act_file,bill_url,act_url,zip_file,status
let amendmentsCache: Amendment[] | null = null;

async function loadAmendments(): Promise<Amendment[] | null> {
  if (amendmentsCache) return amendmentsCache;
  const full = path.resolve(repoRoot, "docs/amendments.csv");
  if (!full.startsWith(repoRoot + path.sep)) return null;
  try {
    const text = await Bun.file(full).text();
    const rows = parseCSV(text).filter(r => r.length > 0 && !(r[0] ?? "").startsWith("#"));
    // Drop the header row ("number,title,...").
    const data = rows[0]?.[0] === "number" ? rows.slice(1) : rows;
    amendmentsCache = parseAmendments(data);
    return amendmentsCache;
  } catch {
    return null;
  }
}

// Amendment PDFs live in repoRoot/AMENDMENTS as AMENDMENT_NN_<KIND>.pdf; the
// pure name derivation lives in lib/content.ts (amendmentPdfName).
function amendmentPdfPath(kind: "act" | "bill", n: number): string | null {
  const full = path.resolve(repoRoot, "AMENDMENTS", amendmentPdfName(kind, n));
  // Defense in depth: the name is derived from a validated int, but stay inside the repo root.
  if (!full.startsWith(repoRoot + path.sep)) return null;
  return full;
}

// Plain-text of each act/bill (AMENDMENT_NN_<KIND>.txt next to the PDFs),
// loaded lazily once and embedded in /content.json (and dist/content.json by
// build.ts via the same loader shape). Missing/empty file -> "" (scan-only).
let textsCache: { acts: Record<string, string>; bills: Record<string, string> } | null = null;

async function loadAmendmentTexts(): Promise<{ acts: Record<string, string>; bills: Record<string, string> }> {
  if (textsCache) return textsCache;
  const amendments = await loadAmendments();
  const acts: Record<string, string> = {};
  const bills: Record<string, string> = {};
  if (amendments) {
    for (const a of amendments) {
      const n = Number(a.number);
      const full = path.resolve(repoRoot, "AMENDMENTS", amendmentTextName("act", n));
      if (full.startsWith(repoRoot + path.sep) && (await Bun.file(full).exists())) {
        acts[a.number] = (await Bun.file(full).text()).trim();
      }
      if (a.has_bill) {
        const fullBill = path.resolve(repoRoot, "AMENDMENTS", amendmentTextName("bill", n));
        if (fullBill.startsWith(repoRoot + path.sep) && (await Bun.file(fullBill).exists())) {
          bills[a.number] = (await Bun.file(fullBill).text()).trim();
        }
      }
    }
  }
  textsCache = { acts, bills };
  return textsCache;
}

function contentPath(key: string): string | null {
  const rel = CONTENT_MAP[key];
  if (!rel) return null;
  const full = path.resolve(repoRoot, rel);
  // Defense in depth on top of the whitelist: stay inside the repo root.
  if (!full.startsWith(repoRoot + path.sep)) return null;
  return full;
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
    // Static-hosting payload: the same shape build.ts embeds in
    // dist/content.json, assembled at runtime from the same caches so the
    // two stay identical by construction (only `generated` differs).
    "/content.json": async () => {
      await Promise.all(Object.keys(CONTENT_MAP).map(loadContent));
      const markdowns: Record<string, string> = {};
      for (const [key, content] of contentCache) markdowns[key] = content.markdown;
      const amendments = await loadAmendments();
      const texts = await loadAmendmentTexts();
      if (!amendments) {
        return Response.json({ error: "Failed to load amendments manifest" }, { status: 500 });
      }
      return Response.json(buildPayload(markdowns, amendments, texts.acts, texts.bills));
    },

    "/api/content/:key": async req => {
      const content = await loadContent(req.params.key);
      if (!content) return Response.json({ error: `Unknown content key: ${req.params.key}` }, { status: 404 });
      return Response.json(content);
    },

    "/api/index": async () => {
      const items = await Promise.all(
        Object.keys(CONTENT_MAP).map(async key => {
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
      await Promise.all(Object.keys(CONTENT_MAP).map(loadContent));
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
      // Keep the historical 6-field shape; act_url/bill_url (external links,
      // not files) are only exposed through /content.json.
      return Response.json(amendments.map(({ act_url, bill_url, ...rest }) => rest));
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

    // Historical states for the date browser: generated by
    // scripts/generate-history.ts into data/history/, served here and copied
    // to dist/history/ by build.ts so static hosting serves the same URLs.
    "/history/index.json": async () => {
      const file = Bun.file(path.join(process.cwd(), "data", "history", "index.json"));
      return (await file.exists())
        ? new Response(file, { headers: { "Content-Type": "application/json" } })
        : Response.json({ error: "Not found — run scripts/generate-history.ts" }, { status: 404 });
    },

    "/history/:file": async req => {
      const name = req.params.file.replace(/\.json$/, "");
      // Whitelist: only known content keys may be fetched.
      if (!(name in CONTENT_MAP)) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const file = Bun.file(path.join(process.cwd(), "data", "history", `${name}.json`));
      return (await file.exists())
        ? new Response(file, { headers: { "Content-Type": "application/json" } })
        : Response.json({ error: "Not found" }, { status: 404 });
    },

    // Amendment PDFs at stable /amendments/<file> URLs: the dev server reads
    // them from ../AMENDMENTS; the static build copies them into dist so both
    // hosts serve the same links.
    "/amendments/:file": async req => {
      const name = req.params.file;
      const m = name.match(/^AMENDMENT_(\d{2,3})_(ACT|BILL)\.pdf$/);
      const n = m ? Number(m[1]) : 0;
      const kind = m ? (m[2] === "ACT" ? "act" : "bill") : null;
      // Only the canonical padded names (01…96, 097…106) are servable.
      if (!kind || n < 1 || n > 106 || name !== amendmentPdfName(kind, n)) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const full = path.resolve(repoRoot, "AMENDMENTS", name);
      if (!full.startsWith(repoRoot + path.sep)) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
      const file = Bun.file(full);
      return (await file.exists())
        ? new Response(file, { headers: { "Content-Type": "application/pdf" } })
        : Response.json({ error: "Not found" }, { status: 404 });
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

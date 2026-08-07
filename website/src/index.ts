import { serve } from "bun";
import path from "node:path";
import {
  amendmentPdfName,
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
    const rows = parseCSV(text).filter(r => r.length > 0 && !r[0].startsWith("#"));
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
      if (!amendments) {
        return Response.json({ error: "Failed to load amendments manifest" }, { status: 500 });
      }
      return Response.json(buildPayload(markdowns, amendments));
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

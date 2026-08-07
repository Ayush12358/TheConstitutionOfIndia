# website — Constitution of India site

A minimal single-page site for the [Constitution of India](https://github.com/Ayush12358/TheConstitutionOfIndia):
the **Preamble**, an index of all **26 Parts** (including 4A, 9A, 9B, 14A) and **12 Schedules**,
and a reading pane with slugified article anchors on every heading for deep links
(e.g. `#12-definition` for Article 12 in Part III). Content is served from the repo's own markdown —
`../PREAMBLE`, `../PART_*/`, `../SCHEDULE_*/` — so the site stays in sync with the source files.

## Content API

- `GET /api/content/:key` → `{ key, title, markdown }` — 39 whitelisted keys:
  `preamble`, `part1`…`part22`, `part4a`, `part9a`, `part9b`, `part14a`, `schedule1`…`schedule12`.
  Unknown keys → `404 { error }`.
- `GET /api/index` → `[{ key, title }, …]` for all 39 keys (loads every file; used to build
  the grouped Parts/Schedules index).
- `GET /api/search?q=<query>` → full-text search. Case-insensitive substring scan of all
  39 content files; returns `[{ key, title, matches: [{ line, snippet }] }]` with up to
  5 matches per file (`snippet` is the matched line trimmed to ~140 chars) and at most
  20 files, sorted by match count (descending). `q` must be at least 2 characters, else
  `400 { error: "query too short" }`. Search is plain substring matching (no regex), so
  there's no injection risk, and it never reads outside the whitelisted files.

**Security model:** keys are looked up in a hard-coded whitelist (`key` → repo-relative path)
and are never derived from the request path; the resolved path is additionally checked to stay
inside the repo root (containment check), and a `/api/*` catch-all returns 404 instead of
falling through to the SPA. Content files are read from disk on the first request and cached
in memory afterwards (the cache is shared by `/api/content`, `/api/index`, and `/api/search`).

## Run

```bash
bun install      # first time
bun dev          # development, hot reload -> http://localhost:3000
bun start        # production mode server
```

## Build

```bash
bun run build    # -> dist/ (static HTML/JS/CSS; gitignored)
```

The static build has **no API server** — it can't fetch content — so serve the site with
`bun dev` / `bun start` (the `/api/*` routes are part of the Bun server).

## CI

`.github/workflows/verify.yml` job `website-build` runs on every push/PR:
`bun install --frozen-lockfile` + `bun run build`, then a smoke test that starts the server
and checks `GET /api/content/preamble` returns the Preamble text, `GET /api/search?q=secular`
returns a result (plus `GET /` → 200).

## Layout

```
src/index.ts              Bun server: content API + SPA serving
src/App.tsx               UI: preamble, grouped Parts/Schedules index, reading pane
src/frontend.tsx          React entry (loaded by index.html)
src/index.html            page shell
src/index.css             styles (imports styles/globals.css)
src/components/ui/        shadcn components (button, card, select, …)
src/lib/utils.ts          cn() helper
build.ts                  static build script (bun-plugin-tailwind)
components.json           shadcn config
```

**Note:** content is fetched at runtime from the repo files one directory above `website/`;
keep the repo root intact relative to `website/` (don't move `website/` on its own).

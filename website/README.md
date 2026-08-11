# website — Constitution of India site

A single-page site for the [Constitution of India](https://github.com/Ayush12358/TheConstitutionOfIndia)
with three views:

- **Constitution** — the Preamble, an index of all **26 Parts** (including 4A, 9A, 9B, 14A) and
  **12 Schedules**, a reading pane with slugified article anchors on every heading for deep links
  (e.g. `#12-definition` for Article 12 in Part III), per-article **"Amended by"** chips (which
  amendments changed each article, derived from the history diffs), and full-text search over the
  Constitution, all **106 act texts** and **85 bill texts** (scope selector: Constitution /
  Acts & Bills / All).
- **Bills & Amendments** — all **106 amendment acts** (and the 85 recovered bills) in two views:
  a **Text** view (the act/bill's plain text — extracted from the PDFs; the 7 scan-only acts
  were sourced from Indian Kanoon) and a **Git diff** view (what the amendment changed in the
  Constitution text, rendered as a unified diff with per-line highlighting, straight from the
  repo's own historical states). PDFs are served at stable `/amendments/AMENDMENT_NN_ACT.pdf`
  URLs.
- **By Date** — enter a date and read the Constitution as it stood then: the date resolves to
  the latest amendment assented on or before it, and the 107 historical states (1950 original +
  after each amendment) come from the git tags. Each Part/Schedule lists the amendments that
  changed it (click one to jump to its git view), and a second date enables a **compare** mode
  that diffs the two states file by file.

Content comes from the repo's own files — `../PREAMBLE`, `../PART_*/`, `../SCHEDULE_*/`,
`../AMENDMENTS/*.txt`, `../docs/amendments.csv` — so the site stays in sync with the source.

The site is **fully static-capable**: `bun run build` embeds every content file, the amendments
manifest and all act/bill texts into `dist/content.json`, copies the historical states into
`dist/history/`, and copies the amendment PDFs into `dist/amendments/` — the app then makes zero
API calls. `dist/` deploys as-is to any static host, including Vercel
(`website/vercel.json` → `outputDirectory: dist`).

## Static payload

`GET /content.json` (from the Bun server, or `dist/content.json` on a static host) is one JSON
object with everything the app needs:

- `generated` — ISO timestamp of the build (server: of the request).
- `preamble` — `{ key, title, markdown }` for the Preamble.
- `index` — `[{ key, title }, …]` for all 39 keys (used to build the grouped Parts/Schedules index).
- `contents` — `{ [key]: markdown }` for all 39 files (reading pane + client-side search).
- `amendments` — `[{ number, title, assent_date, key_changes, status, has_bill, act_url, bill_url }, …]`
  for all 106 amendments in CSV order; `act_url`/`bill_url` are the manifest's external links
  verbatim (the literal `MISSING` when absent — the app hides the button then).
- `act_texts` / `bill_texts` — `{ "01": "…", … }` plain text of every act and surviving bill,
  keyed by manifest number. Empty/missing = scan-only PDF, no text.

Built by `buildPayload()` in `src/lib/content.ts` from `CONTENT_MAP` + the parsed manifest;
`build.ts` and the server's `/content.json` route call the same builder, so the two payloads
are identical by construction (only `generated` differs).

## Historical states (By Date / git views)

`scripts/generate-history.ts` rebuilds `data/history/*.json` from the repo's git tags (run it
when new amendment tags appear; the output is committed):

- `data/history/index.json` — the 107 states (number, assent date, amendment title), per-file
  version boundaries, and which amendments changed which files.
- `data/history/<key>.json` — `[{ from, text }]` per content key: the deduped versions of that
  Part/Schedule/Preamble across states (state 0 = original 1950 text, state N = after the Nth
  amendment).

Sources per state: states 1–96 come from the author's 2015 tag trees
(`STABLE_AMENDMENT_NN`), states 97–106 and the original from the bundle zips inside
`STABLE_AMENDMENT_106` (the 97+ tag trees share one text; the zips carry the per-amendment
states). Every file is normalized (paragraph rewrap) so era-vs-era line wrapping does not
pollute diffs. Known archive gaps: the author's bundles recorded **no file change for the 88th
Amendment** (and a few later-era states carry forward text) — the git view says so explicitly
instead of pretending.

The Bun server serves the same files at `/history/index.json` and `/history/<key>.json`
(whitelisted keys only); the static build copies them into `dist/history/`.

## Content API (Bun server only — local dev)

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
- `GET /api/amendments` → `[{ number, title, assent_date, key_changes, status, has_bill }, …]`
  for all 106 constitutional amendments, in CSV order. `number` is the zero-padded manifest
  number (`01`…`96`, `097`…`106`); `key_changes` is returned in full. The manifest
  (`../docs/amendments.csv`) is parsed once (RFC4180: quoted fields, `""` escapes, `#` comments)
  and cached in memory; `has_bill` is `false` when the row's status is `MISSING_BILL`.
- `GET /api/file/:kind/:n` → the amendment PDF for `kind` = `act` | `bill` and `n` = 1…106,
  resolved inside `../AMENDMENTS/` with a repo-root containment check; `404` for anything
  invalid or missing. (The app itself links to the stable `/amendments/<file>` URLs so the
  same links work on static hosts.)
- `GET /amendments/<file>` → one amendment PDF by exact filename (`AMENDMENT_NN_ACT.pdf`,
  canonical padded names only). Dev server reads `../AMENDMENTS/`; the static build copies
  the PDFs into `dist/amendments/`.
- `GET /history/index.json`, `GET /history/<key>.json` → the date-browser states (see above).

**Security model:** keys are looked up in a hard-coded whitelist (`key` → repo-relative path)
and are never derived from the request path; the resolved path is additionally checked to stay
inside the repo root (containment check), and a `/api/*` catch-all returns 404 instead of
falling through to the SPA. Content files are read from disk on the first request and cached
in memory afterwards (the cache is shared by `/api/content`, `/api/index`, and `/api/search`).

## Build

```bash
bun run build    # -> dist/ (HTML/JS/CSS + content.json + history/ + amendments/)
```

`build.ts` bundles the app, then embeds all 39 markdown files, the amendments manifest and all
act/bill texts into `dist/content.json`, copies `data/history/` into `dist/history/` and the
191 amendment PDFs (106 acts + 85 bills) into `dist/amendments/` (written after the bundle
step, since the build
starts by wiping `dist/`). The result is a **self-contained static site**: the app fetches
`/content.json` once and does everything client-side, so it works with zero API calls on any
static host — e.g. Vercel with `website/vercel.json` (`outputDirectory: dist`).

## Deploy

**Dashboard:** vercel.com → Import repo → Root Directory: `website`, Framework Preset: Bun
(or leave auto), Build Command: `bun install && bun run build`, Output Directory: `dist`.

## Run

```bash
bun install      # first time
bun dev          # development, hot reload -> http://localhost:3000
bun start        # production mode server
```

The Bun server serves the SPA plus `/api/*` (content, search, amendments, PDF files),
`/content.json` and `/history/*` — use it when you want the API routes or live repo files.

## Tests & checks

```bash
bun test         # unit tests: CSV parser, PDF naming, payload builder, diff lib
                 # + server route tests (test/server.test.ts spawns the real server: content.json,
                 #   search, amendments, PDF/file routes, history, SPA fallback, 404s)
bunx tsc --noEmit  # type-check
```

## Layout

```
src/index.ts              Bun server: content API + /content.json + /history + SPA serving
src/App.tsx               UI: three tabs — Constitution (search/preamble/index), Bills &
                          Amendments (text + git diff views), By Date (state browser + compare)
src/frontend.tsx          React entry (loaded by index.html)
src/index.html            page shell
src/index.css             styles (imports styles/globals.css)
src/components/ui/        shadcn components (button, card, input, …)
src/lib/content.ts      pure helpers: CONTENT_MAP (39 keys), RFC4180 CSV parser,
                         parseAmendments, amendmentPdfName/amendmentTextName, buildPayload
src/lib/diff.ts           line-diff (LCS) + hunks + diff-highlight edge detection
src/lib/utils.ts          cn() helper
scripts/generate-history.ts  rebuilds data/history/*.json from the git tags (committed output)
data/history/             generated historical states (index.json + one file per key)
build.ts                  static build script (bun-plugin-tailwind) + content.json + assets
components.json           shadcn config
```

**Note:** the dev server reads content at runtime from the repo files one directory above
`website/`; the static build reads them once at build time. Either way, keep the repo root
intact relative to `website/` (don't move `website/` on its own).

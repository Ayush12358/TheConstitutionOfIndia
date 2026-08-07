# website — Constitution of India site

A minimal single-page site for the [Constitution of India](https://github.com/Ayush12358/TheConstitutionOfIndia):
the **Preamble**, an index of all **26 Parts** (including 4A, 9A, 9B, 14A) and **12 Schedules**,
an **Amendments** list (all 106 amendment acts, with bills where available), and a reading pane
with slugified article anchors on every heading for deep links
(e.g. `#12-definition` for Article 12 in Part III). Content comes from the repo's own markdown —
`../PREAMBLE`, `../PART_*/`, `../SCHEDULE_*/` — so the site stays in sync with the source files.

The site is **fully static-capable**: `bun run build` embeds every content file plus the
amendments manifest into `dist/content.json`, and the app loads that one payload — no API
calls at runtime. `dist/` deploys as-is to any static host, including Vercel
(`website/vercel.json` → `outputDirectory: dist`). The Bun server and its `/api/*` routes
remain for local development (`bun dev` / `bun start`) and serve the identical payload at
`GET /content.json`.

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

Built by `buildPayload()` in `src/lib/content.ts` from `CONTENT_MAP` + the parsed manifest;
`build.ts` and the server's `/content.json` route call the same builder, so the two payloads
are identical by construction (only `generated` differs).

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
  (The static payload's `amendments` additionally carry `act_url`/`bill_url`; see above.)
- `GET /api/file/:kind/:n` → the amendment PDF for `kind` = `act` | `bill` and `n` = 1…106.
  Filenames follow `AMENDMENT_NN_<KIND>.pdf` (2-digit zero-padded for `n` ≤ 96) and
  `AMENDMENT_0NN_<KIND>.pdf` (3-digit for `n` > 96), resolved inside `../AMENDMENTS/` with a
  repo-root containment check. `404` for an invalid kind, an out-of-range or non-integer `n`,
  a bill whose CSV row is `MISSING_BILL`, or a file that doesn't exist on disk. Responses are
  `Content-Type: application/pdf`.

**Security model:** keys are looked up in a hard-coded whitelist (`key` → repo-relative path)
and are never derived from the request path; the resolved path is additionally checked to stay
inside the repo root (containment check), and a `/api/*` catch-all returns 404 instead of
falling through to the SPA. Content files are read from disk on the first request and cached
in memory afterwards (the cache is shared by `/api/content`, `/api/index`, and `/api/search`).

## Build

```bash
bun run build    # -> dist/ (static HTML/JS/CSS + content.json; gitignored)
```

`build.ts` bundles the app, then embeds all 39 markdown files and the amendments manifest
into `dist/content.json` (written after the bundle step, since the build starts by wiping
`dist/`). The result is a **self-contained static site**: the app fetches `/content.json`
once and does everything client-side (reading pane, search, amendments links), so it works
with zero API calls on any static host — e.g. Vercel with `website/vercel.json`
(`outputDirectory: dist`).

## Deploy

**Dashboard:** vercel.com → Import repo → Root Directory: `website`, Framework Preset: Bun
(or leave auto), Build Command: `bun install && bun run build`, Output Directory: `dist`.

**Automated (optional):** `.github/workflows/deploy.yml` builds and runs
`vercel deploy --prebuilt --prod` on every push to `master`. It only runs once the
`VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets are set — until then the
job is skipped, not failed.

## Run

```bash
bun install      # first time
bun dev          # development, hot reload -> http://localhost:3000
bun start        # production mode server
```

The Bun server serves the SPA plus `/api/*` (content, search, amendments, PDF files) and
`/content.json` — use it when you want the API routes or live repo files.

## CI

`.github/workflows/verify.yml` job `website-build` runs on every push/PR:
`bun install --frozen-lockfile` + `bun run build`, then a check that `dist/content.json` was
produced, then `bun test` (unit tests for the pure content helpers in `src/lib/content.ts` —
the RFC4180 CSV parser, the `AMENDMENT_NN_<KIND>.pdf` filename derivation, the static-payload
builder, and a check that the real manifest parses to 106 rows), then a smoke test that starts
the server and checks `GET /api/content/preamble` returns the Preamble text,
`GET /api/search?q=secular` returns a result (plus `GET /` → 200).

## Layout

```
src/index.ts              Bun server: content API + /content.json + SPA serving
src/App.tsx               UI: preamble, grouped Parts/Schedules index, reading pane, client-side search
src/frontend.tsx          React entry (loaded by index.html)
src/index.html            page shell
src/index.css             styles (imports styles/globals.css)
src/components/ui/        shadcn components (button, card, select, …)
src/lib/content.ts      pure helpers: CONTENT_MAP (39 keys), RFC4180 CSV parser,
                         parseAmendments, titleOf, buildPayload (static payload builder)
src/lib/utils.ts        cn() helper
build.ts                  static build script (bun-plugin-tailwind) + dist/content.json
components.json           shadcn config
```

**Note:** the dev server reads content at runtime from the repo files one directory above
`website/`; the static build reads them once at build time. Either way, keep the repo root
intact relative to `website/` (don't move `website/` on its own).

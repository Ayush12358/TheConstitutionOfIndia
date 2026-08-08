# Changelog

All notable changes to this repository, grouped by the working sessions recorded in git history
(Keep a Changelog-inspired structure; no versioned releases exist — everything is on `master`).

## 2026-08-09 — Route tests, article-level amendment timelines, final OCR cleanup

### Added
- Server route tests (content.json, search, amendments, PDF/file routes, history, SPA fallback, 404s)
- Article-level amendment timelines in the reading pane (data-derived from history diffs; lib + tests)
- Print styles for the reading panes; amendment filter also matches `key_changes`
- `index.html`: meta description, Open Graph tags, inline SVG favicon

### Changed
- History data: article headings split onto their own lines so per-article amendment chips can attribute them
- `docs/INVENTORY.md`: bill/act coverage updated to the post-recovery state (74/106 bills, all with text)
- Bill-gaps ledger: PDL lead re-probed and still unreachable

### Fixed
- Vision-OCR bill texts 01, 02, 03, 07, 40, 42, 54, 43, 44, 13, 16 (the last two garbled bill texts; all 74 bills now clean)

## 2026-08-08 — Bill recovery 12→74/106, vision-OCR texts, dark mode, diff views, search

### Added
- 62 bills recovered — coverage up from 12 to 74 of 106: bills for amendments 02–63 era (34 rows), 65–69, 71–76, 82, 94, 95, 96 and gazettes for 77, 81, 83, 85–88, 90–94 from sansad.in's LS/RS bills API and egazette.gov.in; bill for amendment 01 from eparlib jcb; 64th Amendment Bill (65th Bill 1990, No. 49) via sansad getFile. Full source provenance in `docs/bill_gaps.md`
- Vision-OCR text for the 29 scan-only bills (74/74 bills now have text views); vision-OCR act texts 15, 26, 66, 69, 75, 93 replacing garbled PDF text layers
- Search now covers act and bill texts (scope selector; pure search lib + tests)
- Default amendment detail to Git diff view; dark mode toggle (system-aware, persisted)

### Changed
- Docs updated to 74/106 bill coverage (sansad/egazette recoveries); `amendments-table.md` regenerated
- READMEs: corrected act-text provenance (93 PDF + 7 Indian Kanoon + 6 vision-OCR)
- Bill-gaps ledger: final three leads (egazette pre-1994, loksabhadocs, RS getFile) documented as negatives; egazette negative for the 89th amendment bill recorded; `amendments-table.md` header comment drops deleted-tool reference

### Fixed
- 10 column-interleaved act texts (positional re-extraction); md 342A(3) typo; archive state-106 transcription errors patched (338(5)(c), 342A(2), schedule 9 Roman numeral)
- Re-extracted 4 remaining scrambled act texts
- UI issues from the full visual audit: mobile header overflow, duplicate content h1 under card titles, dim act/history text, small amendment chips
- Text alignment: diff context prefix column, parts grid top alignment, amendments list number line
- Parts/schedules grid text overlap (allow wrapping, `min-w-0`); `color-scheme` added for dark native controls

## 2026-08-07 — Regeneration to the post-106th state, markdown-first tree, initial website

### Added
- Website (`website/`, Bun/React/Tailwind): Preamble + parts/schedules index with article anchors and grouped parts/schedules, full-text search over the Constitution (API + UI), Amendments section (106-row manifest list with key changes + whitelisted act/bill PDF serving), git-style text + diff views for bills/acts, by-date constitution browser over all 107 historical states with compare; static content payload (`dist/content.json`) so the site works without an API server — Vercel-ready; unit tests for the content lib (CSV parser, PDF naming); CI smoke + test steps; guarded Vercel deploy workflow (skips until secrets set) + deploy docs; `website/README.md` (features, content API, security model)
- Complete amendment manifest: titles, assent dates, key changes for amendments 1–96; amendment index with act-year column; clickable manifest links; permanent link-integrity check + table generator tool; `docs/amendments-table.md` (case-collision fix from `manifest.md`)
- Complete markdown conversion: 39 content files plus manifest/provenance tables as `.md`; bundles 97–106 docs; reconstruction doc updated; `AMENDMENTS/README.md`
- GitHub Actions verification workflow + `.editorconfig`; README CI badge

### Changed
- Content tree regenerated to the post-106th Amendment state (2026-08-07); acts + bills added for amendments 1–106; tags 97–106 added
- README: completed post-106th regeneration, bundle-zip location after binary cleanup, 131st bill negatived note, license status (no license file, inherited from upstream)
- `docs/INVENTORY.md`: upstream issue resolution note, final-state note

### Fixed
- Text extraction defects (Art 240 omission notes, Sixth Schedule numbering, Schedule 1/4 leaks); 243ZI split in Part IXB (bundles 97–106, live txt); 106th in-force status (16-04-2026)
- PDF integrity audit + `verify_repo` truncation guard; bundle-reconstruction audit log preserved in docs check
- Date browser resolves states by max assent date, not first break; one history-file fetch per key per session
- 7 Indian Kanoon-sourced act texts cleaned of page boilerplate (body-title cut)
- Bills 98 & 106: plain text via vision-model OCR of the scanned PDFs

### Removed
- Bundle zips and content PDFs (markdown-first): 108 per-amendment bundles and content `.pdf` files removed from the working tree — preserved in tag trees (`STABLE_AMENDMENT_01..106`) and history; act/bill PDFs kept
- Legacy maintenance scripts and workflows: `verify_repo.py`, `download_amendments.py`, `*.sh` bundle helpers, worker-source docs, GitHub Actions workflows, redundant `AMENDMENTS/manifest.json`

## 2015-04-03 → 2015-04-23 — Upstream history

- Original import: the repository began as a git archive of the Constitution of India, ported from the Government of India website after a discussion on [/r/india](https://np.reddit.com/r/india/comments/30xhw1/) (see the README's History section), with a bundle released and annotated-tagged after every amendment; the reverse-applied (r-Amendment) history chain through 2015-04-23.

## Known limitations

- **32 of 106 amendment bills are still missing** (21, 24–26, 28–39, 46, 48–51, 56–59, 62, 70, 78–80, 84, 89); the exact sources tried are documented with full provenance in `docs/bill_gaps.md` — nothing was ever fabricated.

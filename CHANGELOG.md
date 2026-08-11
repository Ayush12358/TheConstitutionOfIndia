# Changelog

All notable changes to this repository, grouped by the working sessions recorded in git history
(Keep a Changelog-inspired structure; no versioned releases exist — everything is on `master`).

## 2026-08-11 — Live-text and history-version integrity pass (pass 5)

### Fixed
- `website/scripts/generate-history.ts`: Fourth Schedule historical states repaired
  (`fixSchedule4`). The 97+ reconstruction zips accumulated stale table blocks — each
  `AMENDMENT_NN.zip` carried the current table plus every earlier era's table appended, so the
  By Date view showed the Fourth Schedule two or three times over (states 99–103: 2014 table +
  ancient 18-state table; 104–106: 2020 table + 2014 table + ancient). States with more than
  one "Total" line are now cut at the end of the first, era-correct table: 99–103 show the
  2014 J&K-at-21 table, 104–106 the 2020 J&K-at-31 table (identical to the live
  `SCHEDULE_4/SCHEDULE4.md`). The 1950 original's page divider and a stray scan "|"
  ("17. Manipur|") are dropped. Version boundaries are unchanged
  (`[0, 7, 14, 36, 99, 104]`), so the per-amendment changed-files summary is byte-identical;
  only the schedule4 texts changed. States 7–98 keep the archive's single column-mangled
  table — its stated totals (225/231/233) do not match its entries, so it is not
  mechanically reconstructable; documented, left archive-faithful.
- `SCHEDULE_5/SCHEDULE5.md` (live Constitution text): restored the official C.O. footnotes
  after paragraph 6 ("1. See the Scheduled Areas (Part A States) Order, 1950 (C.O. 9)…" and
  "2. See the Madras Scheduled Areas (Cessor) Order, 1950 (C.O. 30)…"), matching the history
  texts — the tag tree the live file was built from had dropped them.
- `SCHEDULE_6/SCHEDULE6.md` (live Constitution text): replaced the orphan "18." marker after
  paragraph 17 with the "* * * * *" omission marker (paragraph 18 of the Sixth Schedule was
  omitted by the North-Eastern Areas (Reorganisation) Act, 1971); removed a stray "]" from
  paragraph 12's heading ("…in the State of Assam]." → "…in the State of Assam." — the tag
  tree does not carry it). Verified against the official text: the "18981," rendering
  (footnote marker on the Code of Criminal Procedure, 1898) and "6 [the Government of the
  State]" (substitution bracket) are official-faithful and were left as-is.
- `SCHEDULE_2/SCHEDULE2.md` (live Constitution text): fixed the line-break glue
  "Governor- General" → "Governor-General" (two places). The salary figures and footnote
  markers stay as the official Schedule prints them.
- `PART_21/PART21.md` (live Constitution text): fixed "forty- six" → "forty-six"
  (Article 371A(2)(h)(i)); removed an orphan "]" at the end of Article 371E. Verified against
  the official text: the bare "(1)" of Article 371 is correct (clause (1) was omitted by the
  Thirty-second Amendment, s. 2), and Article 371D's post-2014 wording ("…or the State of
  Telangana", "requirement of each State", "parts of such State", "various parts of the
  States") is correct in the live view.
- `PART_7/PART7.md` (live Constitution text): "s. 29 and Sch.." → "s. 29 and Sch." (double
  period). The live "Omitted by the Constitution (Seventh Amendment) Act, 1956" matches the
  act's own "Omit Part VII" operative; the history view's "Rep. by" is the archive's wording.
- Full live-vs-history consistency check over all 39 content keys (normalized comparison):
  after the fixes above, every remaining divergence is a documented convention (live files
  omit marginal notes; footnote markers render inline) or a documented archive defect — no
  further live-text repairs are warranted.

### Documented (not fixed — archive-faithful)
- Seventh Schedule: the live file correctly shows "92C. * * * * * *" (entry 92C "Taxes on
  services", inserted by the 88th Amendment, omitted by the 101st), but the history texts for
  states 88–100 never carried 92C (the archive's tag trees did not record the 88th's
  insertion) — states 88–100 show 92B followed directly by 93.
- Part XXI (Article 371D): the history texts for states 99–106 carry the pre-2014 wording
  (the Andhra Pradesh Reorganisation Act, 2014 change is an ordinary-act change that no
  constitutional-amendment state boundary represents); the live view has the current text.
- Fourth Schedule states 7–98: column-mangled table with era-hybrid entries (modern state
  values attributed to 1956–2013 snapshots) — the archive is the only source and the stated
  totals do not match the entries, so no mechanical repair is possible.

## 2026-08-11 — History-data integrity pass, doc coverage corrections

### Fixed
- `AMENDMENTS/*_ACT.txt`: removed the duplicated act-title line in 17 acts (01–03, 06–12, 14,
  16, 18, 21, 33, 37, 42) — the PDF text layers printed the title twice; and removed the
  cross-contaminated "Statement of Objects and Reasons" from acts 03 and 08 (their
  legislative.gov.in source PDFs carry the 2nd and 4th amendments' SORs respectively; the
  operative act text was unaffected and is correct).
- `AMENDMENTS/*_ACT.txt`: retyped the garbled operative texts of acts 72, 79, 91 and 92 from
  the site's own verified article texts (`website/data/history/` at the corresponding states)
  and the official gazette wording — these four PDF text layers were dense OCR garble (e.g.
  72's "BE it cnacted by Purliament…", 92's "re-sumberedas entries 6 t0 9"). A systematic
  garble sweep (signature scan across all 106 act files) confirmed no other act's operative
  text is garbled; the gazette masthead lines in 79/91/92/100 remain as scanned but the
  operative sections are readable. Retyped content cross-checked word-for-word against the
  site's history texts (332(3B), 334, 75(1A)/(1B), 164(1A)/(1B), 361B, Eighth-Schedule
  entries 3/4/10/18).
- `AMENDMENTS/*_BILL.txt`: removed `•` page-marker noise (20 files); rebuilt the garbled
  scan headers of bills 05, 12, 15, 41 with their verified bill numbers ("Bill No. 60 of
  1955", "3 of 1962", "111 of 1962", "85 of 1976" — from the sansad file names in
  `docs/amendments.csv`) and fixed bill 41's scrambled enactment clause order.
- Bill-file assignment re-verified: the bills whose titles carry different ordinals than
  their amendments (e.g. 7th act ← "Ninth Amendment Bill, 1956", 40th ← "Forty-second Bill
  1976", 73rd ← "Seventy-second Bill 1991") are correctly assigned — the acts' own
  "Statement of Objects and Reasons" pages document the provenance (see `docs/bill_gaps.md`).
- `SCHEDULE_5/SCHEDULE5.md` (live Constitution text): restored paragraph 3 ("Report by the
  Governor to the President regarding the administration of Scheduled Areas"), the
  "PART B ADMINISTRATION AND CONTROL OF SCHEDULED AREAS AND SCHEDULED TRIBES" heading and the
  main clause of paragraph 4(1) (Tribes Advisory Council) — the file had jumped from
  paragraph 2 straight to the proviso, dropping three substantive provisions; also fixed the
  "Governor ." spacing typo. Wording verified against the official Fifth Schedule PDF
  (legislative.gov.in CDN).
- `PART_20/PART20.md` (live Constitution text): Article 368(2) proviso items (a)–(d) now use
  the official ", or" separation instead of "; or" (verified against the 101st Amendment
  Act, s. 15 substitution text).
- `website/data/history/*.json` regenerated: the preamble's scan-split "P REAMBLE" is joined
  to "PREAMBLE", and stray private-use/control characters (e.g. U+F02A in the Third
  Schedule's heading) are stripped in `scripts/generate-history.ts`. Version boundaries,
  changed-files summary and state dates remain byte-identical.
- `website/data/history/*.json` regenerated with scanner-noise removal: page numbers, "THE
  CONSTITUTION OF INDIA" page headers, page-range labels, footnote-reference stars and
  margin-duplicated paragraph numbers leaked from the 2015-era scans are stripped in
  `scripts/generate-history.ts` (whole paragraphs only; the Fourth Schedule's seat values and
  total are exempt — bare digits there are table content). Version boundaries, per-amendment
  changed-files summary and state dates are byte-identical to before; only the texts changed.
- Eleventh/Twelfth Schedule historical states repaired: the archive rendering detached every
  item number from its text ("1." … "29." then a text dump); states now carry the corrected
  rendering from the STABLE_AMENDMENT_106 tag tree (each schedule has a single version).
- Regeneration picked up the 2026-08-08 archive content patches (338(5)(c), 342A(2), Ninth
  Schedule Roman numeral) that the committed history data had not absorbed.
- `docs/amendments-table.md` regenerated from the manifest: status column now matches
  `docs/amendments.csv` (85 OK / 21 MISSING_BILL; 11 amendments that were marked MISSING_BILL
  despite recovered bills are corrected).
- Bill-coverage numbers corrected in `AMENDMENTS/README.md`, `README.md`, `docs/INVENTORY.md`
  and this changelog: **85 of 106 bills** (was 74), **21 missing** (31–32, 35–36, 39, 46,
  48–51, 56–59, 62, 70, 78–80, 84, 89; the 11 recovered later are 21, 24–26, 28–30, 33, 34,
  37, 38); PDF count 191 = 106 acts + 85 bills.

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

- **21 of 106 amendment bills are still missing** (31–32, 35–36, 39, 46, 48–51, 56–59, 62, 70, 78–80, 84, 89); the exact sources tried are documented with full provenance in `docs/bill_gaps.md` — nothing was ever fabricated.

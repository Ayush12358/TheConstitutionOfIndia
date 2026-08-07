# The Constitution of India

![verify](https://github.com/Ayush12358/TheConstitutionOfIndia/actions/workflows/verify.yml/badge.svg)

Git archive of the Constitution of India: every Part (Articles), Schedule and the Preamble in
`.md`, plus the full text of every Amendment Act (and the surviving Bills) in `AMENDMENTS/`
through the **106th Amendment (2023)** — the latest enacted as of **2026-08-07**.

## Current state (2026-08-07)

- **106 amendments enacted; nothing beyond.** The 106th Amendment (Nari Shakti Vandan Adhiniyam,
  women's reservation, assent 28 Sep 2023) is the newest Act. It was **brought into force on
  16-04-2026** by notification S.O. 1922(E) under s.1(2); the reserved seats themselves still
  await delimitation after the next census. Amendments 107+ have not been enacted: the 129th/130th/131st
  Bills (ONOE etc.) failed or were withdrawn in 2024–2026 (the 131st was negatived in the Lok Sabha on 17-04-2026).
- **Content tree regenerated 2026-08-07** from the official consolidated text (Legislative
  Department pocket editions through the 105th) with the 106th Amendment applied from the Gazette —
  i.e. the post-106th state; extraction defects found in audit were fixed against the printed pages
  (see `docs/INVENTORY.md`, `verify_repo.py`).
- **All 39 content files are Markdown** (converted 2026-08-07); the bundle zips (removed
  from the working tree) keep their .txt members in the tag trees.
- Amendment **105's** assent date is recorded as **2021-08-19** (Gazette extraordinary date); some
  secondary sources say 18 Aug 2021.

## Layout

```
PREAMBLE/  PART_1/ … PART_22/  PART_4_A/  PART_9_A/  PART_9_B/  PART_14_A/
SCHEDULE_1/ … SCHEDULE_12/
    → 39 content dirs, each with <NAME>.md (e.g. PART_4_A/PART4A.md,
      PREAMBLE/Preamble.md); the companion .pdf files were removed 2026-08-07
      (re-extractable from the official 2024 pocket edition)
AMENDMENTS/
    → Act PDFs for ALL 106 amendments (AMENDMENT_NN_ACT.pdf, zero-padded: 01–96 two-digit,
      097–106 three-digit) — 106/106 acts
    → Bill PDFs for 12 of 106 (03, 16, 097–106) — pre-1997 bills are largely lost from the open
      web; the 94 gaps are documented with full provenance in docs/bill_gaps.md (never fabricated)
      — note PART_9_B (Co-operative Societies) was inserted by the 97th Amendment, so post-97
      bundles contain 39 content dirs vs 38 for 1..96
Bundle zips removed 2026-08-07 (markdown-first): the 108 per-amendment bundles
    (AMENDMENT_NN_<date>.zip) were deleted from the working tree; they are preserved
    in the git tag trees STABLE_AMENDMENT_01..106 and in history.
    Restore one with e.g.:
        git checkout STABLE_AMENDMENT_106 -- AMENDMENT_106_28092023.zip
docs/
    → INVENTORY.md (authoritative audit), amendments.csv (machine source, 106 rows),
      amendments-table.md (manifest, human-readable view), AMENDMENTS.md (human-readable amendment
      index), amendments_new.md / amendments_new_report.md / backfill_report.md (worker sources,
      converted from CSV), bill_gaps.md (bill provenance), bundle_reconstruction_97_106.md
      (97–106 bundle lineage + reconstruction audit log)
```

**Tags**: every bundle release is annotated-tagged `STABLE_AMENDMENT_NN` (files as they stood
between the NNth and (NN+1)th Amendments). Tags now cover **01..106** (gaps 02–06, 54–57, 62, 65
restored and 97–106 added on 2026-08-07). Plus `STABLE_AMENDMENT_88_ACTUAL`,
`STABLE_ORIGINAL_VERSION`, `SPECIAL_FORWARD_COMMIT` — **109 tags total**. Since the 2026-08-07
binary cleanup, **each tag tree still contains its bundle zip** — that is the restore path.

## Tooling

| Tool | Runs on | Purpose |
|---|---|---|
| `verify_repo.py` | Python 3, any OS (stdlib) | Completeness check: 39 content dirs (.md), 106 acts + bills, no bundle zips in working tree (removed 2026-08-07; preserved in git tags/history), CSV consistency; exit 0 = complete |
| `download_amendments.py` | Python 3, any OS (stdlib urllib) | Download a bill/act PDF into `AMENDMENTS/` (`--auto N` lists expected filenames; `--force` to overwrite; %PDF + size verified) |
| `create_directories.sh` | bash (Git Bash/WSL) | Create PART_1..22 / SCHEDULE_1..12 dirs |
| `create_extension_directories.sh` | bash | Create PART_<n>_A dirs |
| `create_bundle.sh` | bash + `zip` | LEGACY (2026-08-07): bundles removed from the working tree; recreates them if needed (zips preserved in git tags/history) |
| `convert_modified_txt_to_pdf.sh` | bash + `enscript` + `ps2pdf` | Convert a txt edit to PDF (legacy: operates on .txt; content is now .md) |
| `convert_all_pdfs_to_texts.sh` | bash + `pdftotext` (poppler) | Re-extract all PDFs to txt (legacy: operates on .txt; content is now .md) |

CI: `.github/workflows/verify.yml` runs `verify_repo.py` on every push/PR (GitHub Actions).

`download_pdfs.py` was **removed** (2026-08-07): it was Python 2 only and its source
(`lawmin.nic.in`) no longer hosts the files — superseded by `download_amendments.py`.

## Quick start

```
python verify_repo.py                # completeness report; exit 0 = repo complete
python download_amendments.py --help # download tool usage
python download_amendments.py --auto 106   # expected filenames for amendment 106
```

## History

Ported to Git from the Government of India website after a discussion on
[/r/india](https://np.reddit.com/r/india/comments/30xhw1/), with a bundle released (and
annotated-tagged) after every amendment.

**Why the history runs backward**: the original Constitution in text form is garbled (OCR from
scanned PDFs), so building up Original→1→2→… was impossible. Instead the author took the
post-96th-Amendment text as HEAD and *reverse-applied* each amendment down to the 1950 original.
These are **r-Amendments** (`r-Amendment(x) = x-1`; `r-Amendment(1)` = Original); forward changes
are **f-Amendments** (`f-Amendment(x) = x+1`). Commit messages use "back-modified",
"back-inserted", "back-removed" for reversions. Because bill numbering/formatting was
inconsistent, the procedure was **mostly manual**; the author wrote each commit message with care,
and authored commits under the minister who piloted the bill (Nehru, Shastri, Indira Gandhi, LK
Advani, Arun Jaitley, …).

Two experimental branches (`forward_amendments` for 96→99, `dates` for the reverse chain) were
described in the original README; **master** was used for experiments and has been rebased — it is
not a single clean history. The author's own notes:
*"Not sure if it's completely usable. I plan to sanitize it."* — that sanitization was carried out
on 2026-08-07: the working tree was regenerated from the official consolidated text to the
post-106th state (see `docs/INVENTORY.md` §8–9).

Since 2026-08-07 this fork also carries the upstream branches `forward_amendments`, `dates` and
`corrections_local`, mirrored from the upstream repo (anoopdixith/TheConstitutionOfIndia) so the
README-described branch set survives here. Note the two 97–99 lineages: the author's original
bundles (on `forward_amendments` and the upstream `STABLE_AMENDMENT_97..99` tags) vs this repo's
act-gazette-verified reconstruction on `master` — see `docs/INVENTORY.md` §9 (Lineage comparison).

## License

No license file is present in this repository — inherited from upstream, which also has none
([anoopdixith/TheConstitutionOfIndia](https://github.com/anoopdixith/TheConstitutionOfIndia)).
The Constitution of India text is a work of the Government of India.

## References

- `docs/INVENTORY.md` — authoritative audit: git archaeology, zip contents, amendment manifest, tag gaps
- `docs/amendments.csv` — merged manifest: number, title, assent date, key changes, bill/act files + URLs, zip, status
- `docs/AMENDMENTS.md` — human-readable index of all 106 amendments
- `docs/bill_gaps.md` — why 94 bills are missing, with the exact sources tried

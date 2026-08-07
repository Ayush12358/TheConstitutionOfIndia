# The Constitution of India

Git archive of the Constitution of India: every Part (Articles), Schedule and the Preamble in
both `.md` and `.pdf`, plus per-amendment snapshot bundles and the full text of every Amendment
Act (and the surviving Bills) through the **106th Amendment (2023)** — the latest enacted as of
**2026-08-07**.

## Current state (2026-08-07)

- **106 amendments enacted; nothing beyond.** The 106th Amendment (Nari Shakti Vandan Adhiniyam,
  women's reservation, assent 28 Sep 2023) is the newest Act. It was **brought into force on
  16-04-2026** by notification S.O. 1922(E) under s.1(2); the reserved seats themselves still
  await delimitation after the next census. Amendments 107+ exist only as pending bills (e.g. the
  ONOE bills); none has been enacted.
- **Content tree regenerated 2026-08-07** from the official consolidated text (Legislative
  Department pocket editions through the 105th) with the 106th Amendment applied from the Gazette —
  i.e. the post-106th state; extraction defects found in audit were fixed against the printed pages
  (see `docs/INVENTORY.md`, `verify_repo.py`).
- **All 39 content files are Markdown** (converted 2026-08-07); the historical bundle zips keep
  their .txt members.
- Amendment **105's** assent date is recorded as **2021-08-19** (Gazette extraordinary date); some
  secondary sources say 18 Aug 2021.

## Layout

```
PREAMBLE/  PART_1/ … PART_22/  PART_4_A/  PART_9_A/  PART_9_B/  PART_14_A/
SCHEDULE_1/ … SCHEDULE_12/
    → 39 content dirs, each with <NAME>.md + <NAME>.pdf (e.g. PART_4_A/PART4A.md,
      PREAMBLE/Preamble.md); mirrors the bundle-zip layout
AMENDMENTS/
    → Act PDFs for ALL 106 amendments (AMENDMENT_NN_ACT.pdf, zero-padded: 01–96 two-digit,
      097–106 three-digit) — 106/106 acts
    → Bill PDFs for 12 of 106 (03, 16, 097–106) — pre-1997 bills are largely lost from the open
      web; the 94 gaps are documented with full provenance in docs/bill_gaps.md (never fabricated)
      — note PART_9_B (Co-operative Societies) was inserted by the 97th Amendment, so post-97
      bundles contain 39 content dirs vs 38 for 1..96
AMENDMENT_NN_<date>.zip   (108 at repo root)
    → per-amendment "bundle": the whole Constitution (all 39 content dirs of that era, txt+pdf)
      as of after Amendment NN — i.e. a full post-N snapshot, not a single bill/act PDF.
      Bundles now cover ALL amendments 1..106: AMENDMENT_01_18061951.zip … AMENDMENT_106_28092023.zip.
      The 97..106 bundle PDFs are typeset from the txt (not official scans, unlike 1..96); the 99th
      bundle reflects NJAC as enacted (struck down 16-10-2015); the 97..106 lineage is anchored on
      the official post-96 bundle text + the act texts (see docs/INVENTORY.md §appendix).
      AMENDMENT_88ACTUAL_…zip is the canonical post-88 bundle (the plain 88 zip is erroneous);
      AMENDMENT_ORIGINAL_26011950.zip is the 1950 original
docs/
    → INVENTORY.md (authoritative audit), amendments.csv (machine source, 106 rows),
      amendments-table.md (manifest, human-readable view), AMENDMENTS.md (human-readable amendment
      index), amendments_new.md / backfill_report.md (worker sources, converted from CSV),
      bill_gaps.md (bill provenance)
```

**Tags**: every bundle release is annotated-tagged `STABLE_AMENDMENT_NN` (files as they stood
between the NNth and (NN+1)th Amendments). Tags now cover **01..106** (gaps 02–06, 54–57, 62, 65
restored and 97–106 added on 2026-08-07). Plus `STABLE_AMENDMENT_88_ACTUAL`,
`STABLE_ORIGINAL_VERSION`, `SPECIAL_FORWARD_COMMIT` — **109 tags total**.

## Tooling

| Tool | Runs on | Purpose |
|---|---|---|
| `verify_repo.py` | Python 3, any OS (stdlib) | Completeness check: 39 content dirs, 106 acts + bills, 108 bundle zips (all testzip + PREAMBLE member; 97–106 must have 78 members incl. PART_9_B), CSV consistency; exit 0 = complete |
| `download_amendments.py` | Python 3, any OS (stdlib urllib) | Download a bill/act PDF into `AMENDMENTS/` (`--auto N` lists expected filenames; `--force` to overwrite; %PDF + size verified) |
| `create_directories.sh` | bash (Git Bash/WSL) | Create PART_1..22 / SCHEDULE_1..12 dirs |
| `create_extension_directories.sh` | bash | Create PART_<n>_A dirs |
| `create_bundle.sh` | bash + `zip` | Bundle all md/pdf into `AMENDMENT_<n>_<date>.zip` (re-running appends — delete first!) |
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

## References

- `docs/INVENTORY.md` — authoritative audit: git archaeology, zip contents, amendment manifest, tag gaps
- `docs/amendments.csv` — merged manifest: number, title, assent date, key changes, bill/act files + URLs, zip, status
- `docs/AMENDMENTS.md` — human-readable index of all 106 amendments
- `docs/bill_gaps.md` — why 94 bills are missing, with the exact sources tried

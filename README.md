# The Constitution of India

Git archive of the Constitution of India: every Part (Articles), Schedule and the Preamble in
both `.txt` and `.pdf`, plus per-amendment snapshot bundles and the full text of every Amendment
Act (and the surviving Bills) through the **106th Amendment (2023)** — the latest enacted as of
**2026-08-07**.

## Current state (2026-08-07)

- **106 amendments enacted; nothing beyond.** The 106th Amendment (Nari Shakti Vandan Adhiniyam,
  women's reservation, assent 28 Sep 2023) is the newest Act. Its substantive provisions — reserved
  seats for women in Lok Sabha, State Assemblies and the Delhi Assembly — are **not yet in force**:
  they commence on a date notified by the Central Government, linked to delimitation after the next
  census. Amendments 107+ exist only as pending bills (e.g. the ONOE bills); none has been enacted.
- **Content tree is the post-96th-Amendment (2011) Constitution, currently being regenerated**
  amendment-by-amendment toward the post-106th state; see `docs/INVENTORY.md` for the audit and
  `verify_repo.py` for live completeness status.
- Amendment **105's** assent date is recorded as **2021-08-19** (Gazette extraordinary date); some
  secondary sources say 18 Aug 2021.

## Layout

```
PREAMBLE/  PART_1/ … PART_22/  PART_4_A/  PART_9_A/  PART_9_B/  PART_14_A/
SCHEDULE_1/ … SCHEDULE_12/
    → 39 content dirs, each with <NAME>.txt + <NAME>.pdf (e.g. PART_4_A/PART4A.txt,
      PREAMBLE/Preamble.txt); mirrors the bundle-zip layout
AMENDMENTS/
    → Act PDFs for ALL 106 amendments (AMENDMENT_NN_ACT.pdf, zero-padded: 01–96 two-digit,
      097–106 three-digit) — 106/106 acts
    → Bill PDFs for 12 of 106 (03, 16, 097–106) — pre-1997 bills are largely lost from the open
      web; the 94 gaps are documented with full provenance in docs/bill_gaps.md (never fabricated)
AMENDMENT_NN_<date>.zip   (98 at repo root)
    → per-amendment "bundle": the whole Constitution (all 38 content dirs of that era, txt+pdf)
      as of after Amendment NN — i.e. a full post-N snapshot, not a single bill/act PDF.
      AMENDMENT_88ACTUAL_…zip is the canonical post-88 bundle (the plain 88 zip is erroneous);
      AMENDMENT_ORIGINAL_26011950.zip is the 1950 original
docs/
    → INVENTORY.md (authoritative audit), amendments.csv (manifest, 106 rows),
      amendments_new.csv / backfill_report.csv (worker sources), bill_gaps.md (bill provenance)
```

**Tags**: every bundle release is annotated-tagged `STABLE_AMENDMENT_NN` (files as they stood
between the NNth and (NN+1)th Amendments). Tags 01–96 are complete (gaps 02–06, 54–57, 62, 65
restored 2026-08-07); 97–99 remain pending. Plus `STABLE_AMENDMENT_88_ACTUAL`,
`STABLE_ORIGINAL_VERSION`, `SPECIAL_FORWARD_COMMIT` — 99 tags total.

## Tooling

| Tool | Runs on | Purpose |
|---|---|---|
| `verify_repo.py` | Python 3, any OS (stdlib) | Completeness check: 39 content dirs, 106 acts + bills, 98 zips, CSV consistency; exit 0 = complete |
| `download_amendments.py` | Python 3, any OS (stdlib urllib) | Download a bill/act PDF into `AMENDMENTS/` (`--auto N` lists expected filenames; `--force` to overwrite; %PDF + size verified) |
| `create_directories.sh` | bash (Git Bash/WSL) | Create PART_1..22 / SCHEDULE_1..12 dirs |
| `create_extension_directories.sh` | bash | Create PART_<n>_A dirs |
| `create_bundle.sh` | bash + `zip` | Bundle all txt/pdf into `AMENDMENT_<n>_<date>.zip` (re-running appends — delete first!) |
| `convert_modified_txt_to_pdf.sh` | bash + `enscript` + `ps2pdf` | Convert a txt edit to PDF |
| `convert_all_pdfs_to_texts.sh` | bash + `pdftotext` (poppler) | Re-extract all PDFs to txt |

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
described in the original README; **master** was used for experiments and has been rebased — only
`master` survives in this clone, and it is not a single clean history. The author's own notes:
*"Not sure if it's completely usable. I plan to sanitize it."* — that sanitization is the ongoing
2026-08-07 regeneration effort (working tree content is being rebuilt from the bundle zips toward
the post-106th state).

## References

- `docs/INVENTORY.md` — authoritative audit: git archaeology, zip contents, amendment manifest, tag gaps
- `docs/amendments.csv` — merged manifest: number, title, assent date, key changes, bill/act files + URLs, zip, status
- `docs/bill_gaps.md` — why 94 bills are missing, with the exact sources tried

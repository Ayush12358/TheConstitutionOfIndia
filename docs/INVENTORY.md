# Repository Inventory — TheConstitutionOfIndia

Audit date: **2026-08-07**. Host: Windows 11 (Python 3.14.6, Git, unzip 6.00 available).
Scope: git archaeology, working-tree amendment state, zip-bundle contents, script audit, and the
amendment manifest (97–106). Companion deliverable: `docs/amendments.csv`.

---

## 1. Git archaeology

```
git branch -a            →  * master
                             remote-only (1): upstream/master
git remote -v            →  origin   https://github.com/Ayush12358/TheConstitutionOfIndia.git (fetch/push)
                             upstream https://github.com/anoopdixith/TheConstitutionOfIndia.git (fetch/push)
git status               →  On branch master, clean working tree
git describe --tags      →  STABLE_ORIGINAL_VERSION-8-g248b3e5
git rev-parse HEAD       →  248b3e5 (Merge pull request #3 from mrsmartpants/master)
git rev-parse upstream/master → 248b3e5  (upstream/master == local master; 216 commits)
```

- **HEAD** = `248b3e5` "Merge pull request #3 from mrsmartpants/master" (8 commits after the
  original-version bundle release `a2ddbd1`).
- **Tags: 88 total, all annotated** (`git cat-file -t` → `tag`). Named:
  - `STABLE_AMENDMENT_01` … `STABLE_AMENDMENT_96` (85 numbered tags)
  - plus `STABLE_AMENDMENT_88_ACTUAL`, `STABLE_ORIGINAL_VERSION`, `SPECIAL_FORWARD_COMMIT`
- **Missing numbered tags in 01..99** (computed via `git tag -l | sed | awk`):
  `2 3 4 5 6 54 55 56 57 62 65 97 98 99`. I.e. no tags for amendments 2–6, 54–57, 62, 65 —
  and none for 97–99 (the repo ends at the 96th amendment).
- **Tag → commit mapping** (sample, `git rev-parse` + `git log --oneline -1`):

| Tag | Commit | Subject |
|---|---|---|
| STABLE_ORIGINAL_VERSION | a2ddbd1 | Release: Bundle … original version … came into effect 26 Jan 1950 |
| STABLE_AMENDMENT_01 | 844072b | Release: Bundle of files as they were after the First Amendment |
| STABLE_AMENDMENT_42 | 6ecf3c6 | Release: Bundle … after the last section of 42nd Amendment was passed |
| STABLE_AMENDMENT_88 | 6c4df06 | Release: Post Amendment-88 Bundle |
| STABLE_AMENDMENT_88_ACTUAL | e403446 | SPECIAL RELEASE: This bundle contains post-88th Amendment Constitution |
| STABLE_AMENDMENT_96 | 2ebd860 | Bundled the 96th amendment with SCHEDULES included |
| SPECIAL_FORWARD_COMMIT | 1f5832e | special commit … actual post-88 amendment commit. Inserted 268A, modified 270 and added 92C in the NINTH SCHEDULE |

- **History shape** (README.md is authoritative): the author took the post-96th-amendment
  website text as the base (root commit `6ffe138`; note its message claims "after the 99th
  amendment", corrected to 96th in `7ebf1be`), then built the history **downward** via
  "r-Amendments" (reverse-applied changes, `r-Amendment(x) = x-1`) with a "Release: post-N
  bundle" commit after each. `git log --oneline -20` shows the pattern near the tip:
  README commits → `a2ddbd1` (original bundle) → `ef800aa` (r-Amendment 01) →
  `844072b` (post-1) → `1821a23` (r-2) → `9592f56` (post-2) → … → `fcf34c6` (r-6) → …
  README's `forward_amendments` and `dates` branches are **not present** in this clone; only
  `master` exists (README admits master was experimental: *"Not sure if it's completely usable. I plan to sanitize it."*).
- **Where bundles live**: 98 zip files are **tracked in git** (`git ls-files '*.zip' | wc -l` = 98)
  and present in the working tree root. Zips accumulate over history — each tag tree contains
  every zip created up to that commit (e.g. `STABLE_AMENDMENT_01` tree has 97 zips, tag-96
  commit `2ebd860` has 1, HEAD has 98 = 96 numbered + `AMENDMENT_ORIGINAL` + `AMENDMENT_88ACTUAL`).
  The canonical per-amendment snapshot is the individual `AMENDMENT_NN_<date>.zip` file.

## 2. Amendment state of the working-tree txt files

Marker probe across `PART_*/PART*.txt`, `SCHEDULE_*/SCHEDULE*.txt`, `PREAMBLE/*.txt`
(grep for `330A | 279A | 338B | 342A | economically weaker`): **0 matches**.

- `330A` (106th, women's reservation) — **absent**
- `279A` (101st, GST Council) — **absent**
- `338B` (102nd, NCBC) — **absent**
- `342A` (105th/102nd, SEBC lists) — **absent**
- EWS clause (103rd, Art 15(6)/16(6)) — **absent**
- Art 334 (104th marker): `PART_16/PART16.txt` body reads *"…shall cease to have effect on
  the expiration of a period of **seventy years** from the commencement…"* — i.e. the
  post-95th-amendment (2010) wording; the 104th ("eighty years") is **absent**.
- No amendment-added Part directories exist in the working tree (`PART_9B`, `PART_9A`,
  `PART_4A`, `PART_14A` globs: no matches; the repo's convention for such parts is
  `PART_N_A`, which exists in tag trees and inside the zips but **not** at HEAD).

**Conclusion: the working-tree txt content corresponds to the post-96th Amendment (2011) state**
— matching the repo author's own statement (README: *"the version of the Constitution in the
Government of India website as of this writing is post-96th Amendment version. Thus, 96th
Amendment became the original HEAD"*). None of the 97th–106th markers are present.

**Gap / caveat**: the HEAD working tree is an *incomplete* post-96 bundle. Compared to
`STABLE_AMENDMENT_96` (`git diff --name-status STABLE_AMENDMENT_96 HEAD`), HEAD has deleted
`PART_4_A`, `PART_9_A`, `PART_14_A`, `SCHEDULE_9`, `SCHEDULE_10`, `SCHEDULE_11`, `SCHEDULE_12`
(and modified all PART/SCHEDULE txt/pdf — 177 files changed, +2020/−4858 lines) because the
r-Amendment cascade ran master down to the original-state release. Deletions are documented:
`ef800aa` (r-1) removed SCHEDULE_9, `ead0cbd` (r-42) removed PART_4_A, `ea6749a`/`98ec38a`
(r-35/r-52) removed SCHEDULE_10, etc. Also `SCHEDULE_8/.DS_Store` is **tracked** (macOS
cruft; `git ls-files` confirms). For faithful per-amendment states use the zips or the tag trees.

## 3. Zip contents — definitive answer

Method: Python 3 `zipfile` (unzip 6.00 also available). Member counts and highlights:

| Zip | Members | Contents |
|---|---|---|
| `AMENDMENT_ORIGINAL_26011950.zip` | 62 | PART_1…22 (txt+pdf), PREAMBLE, SCHEDULE_1…8 — 8 schedules = 1950 original ✓ |
| `AMENDMENT_01_18061951.zip` | 64 | 62 + **SCHEDULE_9** (9th Schedule inserted by 1st Amendment) ✓ |
| `AMENDMENT_42_01041977.zip` | 66 | + **PART_4_A**, **PART_14_A** (Part IVA Fundamental Duties / Part XIVA Tribunals, 42nd Amendment) ✓ |
| `AMENDMENT_88_11022003_but_enforced_15012004.zip` | 76 | + **PART_9_A**, **SCHEDULE_10, 11, 12** (52nd → Sched.10; 73rd/74th → Part IXA + Sched. 11/12) ✓ |
| `AMENDMENT_88ACTUAL_11022003_but_enforced_15012004.zip` | 76 | same member names as the 88 zip |
| `AMENDMENT_96_23092011.zip` | 76 | full post-96 bundle |

**Conclusion: every zip is a FULL-CONSTITUTION BUNDLE** (all PART*/SCHEDULE*/PREAMBLE
txt+pdf at the state *after* that amendment), **not** a single bill/act PDF. This matches
`create_bundle.sh` (zips all `*.txt`/`*.pdf` found in the tree).

### 88 vs 88ACTUAL verdict

- Same 76 member names; **4 members differ in bytes**: `PART_12/PART12.txt` + `.pdf`,
  `SCHEDULE_9/SCHEDULE9.txt` + `.pdf`.
- `88ACTUAL`'s `PART12.txt` adds **Article 268A** ("Service tax levied by Union and collected
  and appropriated by the Union and the States") and changes Art 270 to read
  *"articles **268, 268A and 269**"*; `SCHEDULE9.txt` adds Ninth-Schedule entry
  **"92C. Taxes on services."** — exactly the changes made by the real 88th Amendment Act,
  2003 (assent 15 Jan 2004).
- The plain 88 bundle lacks these → **`AMENDMENT_88ACTUAL_11022003_but_enforced_15012004.zip`
  is canonical; `AMENDMENT_88_11022003_but_enforced_15012004.zip` is the erroneous bundle.**
- Git corroboration: `git diff --stat STABLE_AMENDMENT_88 STABLE_AMENDMENT_88_ACTUAL` =
  6 files (PART_12 txt/pdf, SCHEDULE_9 txt/pdf, the 88ACTUAL zip, `SCHEDULE_8/.DS_Store`);
  `STABLE_AMENDMENT_88_ACTUAL` is the "SPECIAL RELEASE" tag whose parent commit
  (SPECIAL_FORWARD_COMMIT) applied the missing 268A/270/92C changes.
- SHA-256 of the zip files: 88 = `1a6601c9b23e461750611c6d436a23a417ecf05555dff06bae2e8c3c39f46144`;
  88ACTUAL = `bd94c8f566c943a33530ab0d0f882dbd2330891bb40ac8037536ebf327f89e8a`.
- (Filename dates are the author's own "bill-date_but_enforced_date" convention, e.g.
  `11022003_but_enforced_15012004`; they are not uniform assent dates.)

## 4. Script audit

| Script | Purpose | Python-2 / bash-isms (break on Windows + Py3) |
|---|---|---|
| `download_pdfs.py` | Download PART/SCHEDULE PDFs from lawmin.nic.in ("Const.Pock 2Pg Rom8Fsss(N)" URLs); the PART-download block is commented out; also accepts url/path CLI pairs | **Python 2 only**: `import urllib2` (removed in Py3), `xrange`, `print` statement, tab-indent mix. URLs are **dead** (`lawmin.nic.in` no longer hosts them). CLI arg-count check is off-by-one (`len(sys.argv)%2==0`). `download_file` defined after use in `main()` (works only because call happens at runtime). |
| `create_directories.sh` | `mkdir PART_1..22` and `SCHEDULE_1..12` | C-style `for((i=1;…))` + `[[ ]]` — **bash only** (no sh/Windows cmd). No `set -e`; silently continues on existing dirs. |
| `create_extension_directories.sh` | `mkdir PART_<n>_A` for args (4, 9, 14) | bash `$@` loop; needs bash. |
| `create_bundle.sh` | Release bundler: `find` all `*.txt`/`*.pdf`, `zip -g` (append) into `AMENDMENT_<n>_<ddmmyyyy>.zip`; args: amendment number + date | **`zip -g` appends** — re-running without deleting the zip duplicates entries. Needs `zip` + `find` + bash `[[ ]]` (Git Bash/WSL on Windows). |
| `convert_modified_txt_to_pdf.sh` | Convert a modified txt to PDF via `enscript` → `ps2pdf` | Requires `enscript` + Ghostscript `ps2pdf` — **not installed on stock Windows**; bash + `sed`/`find` pipelines; leaves `.ps` clutter (moves to `ps-files` then deletes). |
| `convert_all_pdfs_to_texts.sh` | `pdftotext` every PDF in the tree | Requires poppler's `pdftotext` — not on stock Windows; no args/help. |
| `commit_chores.sh` | `git add *` + commit (optional `--author`) + push | **`git add *` also stages junk like `.DS_Store`** (explains the tracked `SCHEDULE_8/.DS_Store`); bash `[[ ]]`; no error handling. |

None of the `.sh` scripts run under Windows cmd/PowerShell without Git Bash or WSL; all six
need bash, and two additionally need `enscript`/`ps2pdf`/`pdftotext`. `download_pdfs.py` is
Python-2-only and its source site is gone.

2026-08-07: commit_chores.sh now uses git add -A + set -e; convert_* scripts marked legacy (content is .md).

## 5. Amendment manifest — 97..106, nothing beyond

**`docs/amendments.csv`** (merged manifest; header `number,title,assent_date,key_changes,bill_file,act_file,bill_url,act_url,zip_file,status`)
contains rows **1..106**, all populated since 2026-08-07 (rows 1–96 backfilled from the
Wikipedia list cross-checked with the act PDFs; rows 97–106 carry titles, dates, key changes, bill/act files+URLs and their bundle names — §8/§9).

**Nothing beyond the 106th amendment has been enacted as of 2026-08-07.** Cross-check (4 sources):
1. **Wikipedia** — "List of amendments of the Constitution of India": *"As of March 2026, there have been 106 amendments"*.
2. **Official** — Lok Sabha Unstarred Question No. 988, answered **24 July 2026**
   (sansad.in PDF) lists the last 12 years' 8 enacted amendments: 99, 100, 101, 102, 103, 104, 105, 106.
3. **PRS India** — billtrack shows only bills beyond 106 that were never enacted (129th Bill 2024 ONOE, 130th Bill 2025, 131st Bill 2026 — negatived in Lok Sabha on 17 Apr 2026); no enacted Act ≥ 107.
4. **Testbook / anantamias (Apr 2026)** — "No 107th Amendment has been enacted. The latest is the 106th."

Bill numbers ≠ amendment numbers: 111th Bill 2009 → **97th** Act; 119th Bill 2013 → 100th;
120th Bill 2013 (JAC) lapsed; 121st Bill 2014 → 99th; 122nd Bill 2014 → 101st; 123rd Bill 2017 → 102nd;
124th Bill 2019 → 103rd; 126th Bill 2019 → 104th; **127th Bill 2021 → 105th**; 128th Bill 2023 → 106th.
The "Constitution (107th Amendment) Bill, 2007" (Sixth Schedule/Gorkha) was introduced but never enacted.

Key data (full details in the CSV):

| # | Popular name | Assent | Core operative changes |
|---|---|---|---|
| 97 | Cooperatives (2011 Act) | 2012-01-12 | Art 19(1)(c); Art 43B; Part IXB (243ZH–243ZT); partially struck down 2021 (ratification) |
| 98 | Hyderabad-Karnataka | 2013-01-01 | Inserted Art 371J |
| 99 | NJAC | 2014-12-31 | Arts 124A–124C + related; struck down 16 Oct 2015 |
| 100 | LBA (Bangladesh) | 2015-05-28 | First Schedule — enclave exchange |
| 101 | GST | 2016-09-08 | Arts 246A, 269A, 279A + many; GST from 1 Jul 2017 |
| 102 | NCBC | 2018-08-11 | Arts 338B, 342A; amended 338; inserted 366(26C) |
| 103 | EWS 10% | 2019-01-12 | Arts 15(6), 16(6); upheld 2022 (3:2) |
| 104 | SC/ST extension | 2020-01-21 | Art 334 → 80 years (25 Jan 2030); Anglo-Indian seats ended |
| 105 | OBC state lists | 2021-08-19 | Arts 342A, 338B(9), 366(26C) |
| 106 | Women's reservation | 2023-09-28 | Arts 330A, 332A, 334A; Art 239AA; in force 16-04-2026 (S.O. 1922(E)); reserved seats await delimitation |

## 6. Gaps & notes

- **Bundles for amendments 97+ added 2026-08-07** (see §9): `AMENDMENT_97_12012012.zip` …
  `AMENDMENT_106_28092023.zip` — 108 zips total; CSV `zip_file` populated for every row (1–106).
- **98th bill URL**: no PRS billtrack page exists (both `the-constitution-98th-amendment-bill-2012`
  and `the-constitution-97th-amendment-bill-2011` return HTTP 404) → `MISSING` in CSV; the bill
  is documented as "The Constitution (98th Amendment) Bill, 2012" (introduced in Rajya Sabha).
- **97th bill URL**: PRS page for the 111th Amendment Bill 2009 (verified live; it passed LS 22 Dec 2011,
  RS 28 Dec 2011 and became the 97th Act). The same bill is sometimes cited as the "97th Amendment Bill, 2011".
- **Act PDF hosts**: legislative.gov.in serves via its CDN (cdnbbsr.s3waas.gov.in) and paginated
  document lists; URLs pinned where search-verified. 102nd act PDF is a verified mirror
  (jurisjustice.com) — the legislative.gov.in documents listing exists (page 27) but no direct
  URL was pinned. Never fabricated: any URL not directly verified is marked MISSING or labeled mirror.
- **105th assent date**: Gazette extraordinary is dated 19 Aug 2021; press sources variously say
  18/19/20 Aug 2021 → CSV uses 2021-08-19.
- **104th title**: officially "The Constitution (One Hundred and Fourth Amendment) Act, **2019**"
  (assented 21 Jan 2020, in force 25 Jan 2020).
- **106th status**: assent 28 Sep 2023; brought into force **16-04-2026** by notification
  **S.O. 1922(E)** under s.1(2) (updated 2026-08-07); the reserved seats themselves still await
  delimitation after the next census.
- **Tag gaps resolved 2026-08-07** (see §8–9): 02–06, 54–57, 62, 65 restored; 97–106 added — 109 tags total.
- **Working tree (regenerated 2026-08-07, §8–9)**: complete post-106th state — all 39 content
  dirs as `.md`+`.pdf`; master sanitized; `.DS_Store` removed.
- CSV fully populated 2026-08-07: rows 1–96 backfilled (titles, assent dates, key changes, bill/act files + URLs, status MISSING_BILL where no pre-1997 bill survives); rows 97–106 bundle names linked.

## 7. Sources consulted

- https://en.wikipedia.org/wiki/List_of_amendments_of_the_Constitution_of_India (fetched 2026-08-07)
- https://en.wikipedia.org/wiki/One_Hundred_and_Fourth_Amendment_of_the_Constitution_of_India
- https://en.wikipedia.org/wiki/Article_371J_of_the_Constitution_of_India
- https://sansad.in/getFile/lsapps/loksabhaquestions/annex/188/AU988_FcAHlM.pdf (Lok Sabha Q&A, 24 Jul 2026)
- https://prsindia.org/billtrack (and bill pages for the 111th, 119th, 120th, 121st, 122nd, 123rd, 124th, 126th, 127th, 128th Amendment Bills — most fetched directly)
- https://prsindia.org/files/bills_acts/acts_parliament/2011/the-constitution-(97th-amendment)-act,-2011.pdf
- https://prsindia.org/files/bills_acts/acts_parliament/2014/the-constitution-(99th-amendment)-act,-2014.pdf
- https://prsindia.org/files/bills_acts/acts_parliament/2015/the-constitution-(100th-amendment)-act,-2015.pdf
- https://prsindia.org/files/bills_acts/acts_parliament/2019/the-constitution-(one-hundred-and-third-amendment)-act,-2019.pdf
- https://prsindia.org/files/bills_acts/bills_parliament/2023/Constitution_106th_(A)_Act,%202023.pdf
- https://faolex.fao.org/docs/pdf/ind106312.pdf (97th Act text), https://faolex.fao.org/docs/pdf/ind150413.pdf (100th Act text)
- https://bombayhighcourt.nic.in/libweb/actc/Consti.98amend.PDF (98th Act text)
- https://gstcouncil.gov.in/sites/default/files/2024-02/consti-amend-act.pdf (101st Act text, official)
- https://egazette.gov.in/WriteReadData/2019/195175.pdf (103rd), https://egazette.gov.in/WriteReadData/2023/249053.pdf (106th)
- https://www.livelaw.in/pdf_upload/105th-constitutional-amendment-act-398950.pdf (105th, Gazette scan)
- https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/02/2023022441.pdf (104th, legislative.gov.in CDN)
- https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2024/09/202409032052198967.pdf (106th, legislative.gov.in CDN)
- https://jurisjustice.com/wp-content/uploads/2021/02/THE-CONSTITUTION-ONE-HUNDRED-AND-SECOND-AMENDMENT-ACT-2018.pdf (102nd, mirror)
- https://pib.gov.in/newsite/PrintRelease.aspx?relid=187454 (103rd assent), https://www.scconline.com/blog/post/2020/01/23/… (104th assent),
  https://www.scconline.com/blog/post/2015/01/07/… (99th assent), https://economictimes.indiatimes.com/news/politics-and-nation/presidential-assent-to-land-boundary-agreement-ahead-of-narendra-modis-visit-to-dhaka/articleshow/47503293.cms (100th assent)
- https://testbook.com/ugc-net-law/amendment-of-the-constitution (no 107th enacted)

---

## 8. 2026-08-07 updates (sibling-work merge)

Late-2026-08-07 follow-ups, applied after the audit above was written:

- **`docs/amendments.csv` was rewritten** as the single merged manifest (header
  `number,title,assent_date,key_changes,bill_file,act_file,bill_url,act_url,zip_file,status`):
  rows 01–96 merged from `docs/backfill_report.md` (status `OK` only for 03 and 16, else
  `MISSING_BILL`), rows 097–106 from `docs/amendments_new.md`. One `#` comment line records the
  **105th assent-date reconciliation: 2021-08-19** (Gazette date; `amendments_new.md` said
  2021-08-18). The previous 7-column CSV (97–106 prose + PRS billtrack URLs) was superseded;
  the richer key_changes (court outcomes) for 97–106 live in the amendment worker's report
  `docs/amendments_new_report.md`. Validated: 106 rows × 10 fields, quoting round-trip clean,
  zip_file for 01–96 exists on disk, 97–106 zip_file empty (no bundles exist for 97+).
- **`verify_repo.py`** (repo root, Python 3 stdlib): completeness checker — 39 content dirs
  (txt+pdf >100 B each), 106 acts + bills per CSV, 98 bundle zips (`testzip()` + PREAMBLE member),
  CSV/filesystem consistency. Exits 0 only when everything passes; while the content worker is
  mid-regeneration, section (a) may fail on files not yet written — expected.
- **`download_amendments.py`** (repo root, Python 3 stdlib `urllib`): replaces the deleted
  `download_pdfs.py`; downloads bill/act PDFs into `AMENDMENTS/` with %PDF + size verification,
  refuses overwrite without `--force`, `--auto N` prints expected filenames (2-digit for ≤96,
  3-digit for ≥97).
- **README.md rewritten**: post-106th current state (women's reservation not in force — awaits
  delimitation), 39-dir layout, AMENDMENTS/ coverage (acts 106/106, bills 12/106 with honest gap
  explanation), bundle/tag conventions, Windows-vs-bash tooling table, quick start; original
  r-/f-Amendment narrative preserved condensed in "History".
- **Hygiene**: `SCHEDULE_8/.DS_Store` untracked and deleted; `download_pdfs.py` removed via
  `git rm` (Python 2, dead lawmin.nic.in URLs); `.gitignore` added (`.DS_Store`, `_work/`,
  research scratch artifacts). No root-level scratch files existed at merge time (glob-verified);
  the pattern list in `.gitignore` protects against future ones.
- **Tag restoration**: the 11 missing `STABLE_AMENDMENT` tags (02–06, 54–57, 62, 65) were
  restored as annotated tags on their verified release commits (each candidate's tree contains
  the matching `AMENDMENT_NN_*.zip` and the message clearly marks the post-N bundle release):
  `9592f56` (02), `8939675` (03), `1336a67` (04), `11953de` (05), `1f37922` (06), `63d78af` (54),
  `82d1ef8` (55), `073e604` (56), `e29632c` (57), `dc53995` (62), `3f30d9f` (65). Tag count is
  now **99** (88 + 11). Tags 97–99 remain missing — deferred to another workstream. None of the
  candidates was ambiguous, so nothing was skipped.
- **`docs/bill_gaps.md`** (new): provenance for the 94 `MISSING_BILL` rows — the backfill worker
  produced no separate notes file, so this preserves its URL-attempt record verbatim from
  `docs/backfill_report.md` (eparlib found only 03 and 16; legislative.gov.in/PRS/indiacode have
  no pre-1997 bills), plus the 88/88ACTUAL canonical note.
- **No commit made** — the lead runs final verification and commits after the content worker lands.

---

## 9. 2026-08-07 final updates (post-commit follow-ups)

- **Content fix pass (18 files)**: the content worker corrected live extraction defects in 18
  txt files — Art 240(1) omission notes, Sixth Schedule paragraph numbering, First Schedule
  footnote leaks, Schedule 4 table, space-semicolons, and `'N[` leaks — each verified against the
  printed pages. Committed together with this appendix.
- **Bundles 97–106 added**: 10 new zips `AMENDMENT_97_12012012.zip` … `AMENDMENT_106_28092023.zip`
  (98 → 108 total) plus tags `STABLE_AMENDMENT_97` … `STABLE_AMENDMENT_106` (99 → 109 tags total),
  committed by the bundle worker in release commits `99a81d5..285d2d8` and reviewed with no changes.
  Their PDFs are **typeset from the txt** (not official scans, unlike the 1–96 bundles); the 99th
  bundle reflects NJAC **as enacted** (struck down 16 Oct 2015). Lineage: anchored on the official
  post-96 bundle text + the act texts. New-convention zips carry 78 members (39 content dirs,
  incl. `PART_9_B` added by the 97th) vs 76 for 1–96 (38 dirs, no Part IXB).
- **106th Amendment in force**: brought into force **16-04-2026** by notification **S.O. 1922(E)**
  under s.1(2) of the 106th Amendment Act; the reserved seats themselves still await delimitation
  after the next census.
- **`verify_repo.py` zip check made dynamic**: no hardcoded zip count; enumerates all
  `AMENDMENT_*.zip` (testzip + PREAMBLE member for every one) and additionally requires the 97–106
  bundles to have 78 members including `PART_9_B/PART9B.txt`. Full PASS at 108 zips.
- **`docs/AMENDMENTS.md` added**: human-readable index of amendments 1–106 generated from
  `docs/amendments.csv` (97–106 fully populated; 1–96 then showed bundle-zip dates with
  names/key changes pending backfill, never fabricated — fully backfilled below).
- **Amendment manifest completed**: docs/amendments.csv rows 1–96 now carry titles, assent
  dates and key changes (source = Wikipedia list of amendments cross-checked with the act
  PDFs in AMENDMENTS/ — printed assent lines; zip-filename dates overridden where they
  record bill/enforcement dates). docs/AMENDMENTS.md regenerated from the completed manifest.
- **Markdown conversion (2026-08-07)**: all 39 content files converted txt→md (fidelity-gated:
  markup-stripped md == original txt, whitespace-normalized); .txt removed from the working tree
  (still inside the bundle zips); verify_repo.py + create_bundle.sh updated.
- 2026-08-07: added GitHub Actions verification workflow + .editorconfig.

### Lineage comparison (2026-08-07)

- **Upstream mirrored**: the fork now carries the upstream branches `forward_amendments`
  (7888d9e4), `dates` (cac24958) and `corrections_local` (4c9be12f), fetched from
  anoopdixith/TheConstitutionOfIndia and pushed to origin — the README-described branch set is
  no longer missing from the clone. Upstream has no branches or tags we lack; the only tag
  divergence is local-only `STABLE_AMENDMENT_100..106` (our forward reconstruction).
- **Author's 97/98/99 bundles vs ours**: the zips inside the upstream
  `STABLE_AMENDMENT_97/98/99` tags are the same blobs as on `forward_amendments`
  (f31a68a1 / c9b3b494 / 152780fc). Per-amendment word-level comparison against our bundles
  shows **substantively identical content** — every Part IXB article, 371J, and the full NJAC
  package (124A–124C, 127, 128, 217, 222, 224, 224A, 231) is present in both — but the author's
  copies carry their known manual-mistake patterns: all 13 Part IXB marginal headings dropped
  (plus the 43B heading), typos (`soceity`, `aon`, `the the`, `HyderabadKarnataka`,
  `assumes`, `in case—`, `a stalemate`, `the proviso` for `first proviso`, `following,` for
  `following matters,`, `hand over` for `handover`), a wrong act reference in 243ZT
  ("Constitution (One Hundred and Eleventh Amendment) Act, 2009" — the 111th Amendment does not
  exist; the gazette says Ninety-seventh Amendment Act, 2011), and stale First/Fourth Schedules
  (pre-Telangana, no UT entries 6–7 Puducherry/Chandigarh). Our reconstruction is
  act-gazette-verified (closed-loop diff against the post-96 bundle); the per-edit
  audit log of the reconstruction (92 reverse-chain edits, each cited to its act
  section) is preserved in `docs/bundle_reconstruction_97_106.md`.
- **Spelling note**: the official Gazette of India Extraordinary (13-01-2012) prints
  **"conterminous"** in 243ZJ(2) — our bundles and the live txt match the gazette; Wikisource's
  2020 consolidation prints "coterminous", diverging from the gazette (the author's bundles
  follow the wikisource spelling).
- **Corrective commit (this one)**: a line-wrap defect split the article number in Part IXB —
  "24 3ZI" (live txt, space form) / "24\r\n3ZI" (all 10 bundle zips 97–106, CRLF form) instead
  of "243ZI". Found in every bundle and the live txt; fixed in this commit. Bundle zips at HEAD
  are the corrected canonical snapshots while the release tags keep the originals — the same
  88 vs 88ACTUAL precedent (corrected snapshot at HEAD, historical artifacts preserved under
  tags/branches).

2026-08-07 (final): GitHub Actions verify workflow confirmed green on push (runs 31169570697, 31169653985 — success incl. 'Run verify_repo.py (5 checks)'); fork description + topics set via gh; license status documented in README (no license file upstream or in this fork; Constitution text is a Government of India work).

2026-08-07 (upstream issues): this update resolves the four open items on upstream anoopdixith/TheConstitutionOfIndia — #7 outdated preamble (Preamble.md now carries the post-42nd text incl. SOCIALIST/SECULAR/INTEGRITY), #8 'Corrected preamble!' PR (superseded by the regenerated preamble), #5 broken markdown headings (fidelity-gated #/## structure), #2 clean text-only complete version (post-106th .md content).

2026-08-07 (final polish): docs/amendments-table.md has clickable relative links (214, all verified); link-integrity check added to verify_repo.py check e; generator committed as gen_amendments_table.py.


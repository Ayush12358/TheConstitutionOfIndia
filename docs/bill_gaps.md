# Bill gaps — amendments 01–96 (as of 2026-08-08)

Provenance ledger for the `status = MISSING_BILL` rows in `docs/amendments.csv`, so the hunt is not
repeated. Source: `docs/backfill_report.md` (worker report, 2026-08-07, converted from CSV) —
no separate notes file was produced by that worker; this file preserves the URL-attempt
provenance verbatim.

## Summary

- **106 amendments total; act coverage 100%** — every amendment 01–106 has a downloaded Act PDF
  (`AMENDMENTS/AMENDMENT_NN_ACT.pdf`), verified `%PDF` + content.
- **Bill coverage: 74/106** — the 62 missing bills recovered on 2026-08-08 from sansad.in's
  LS/RS bills API (1952–2026), egazette.gov.in, eparlib and PRS; all 74 bills now have text
  (→ `.txt`) — the 29 scan-only PDFs were transcribed with the vision model (2026-08-08 OCR
  sweep; per-bill logs in `../probe_ik4/ocr_log.json`). See the 2026-08-08 sweep sections below.
- **32 bills missing (21, 24–26, 28–39, 46, 48–51, 56–59, 62, 70, 78–80, 84, 89)**:
  `bill_file = MISSING`, `bill_url = MISSING` in `docs/amendments.csv`. The sources tried
  below returned no usable copy.

## What was tried (per-row `bill_url` = MISSING)

For every amendment 01–96 except 03/16, the backfill worker searched:

1. **legislative.gov.in** (Legislative Department) and its CDN (`cdnbbsr.s3waas.gov.in`) — hosts the
   Constitution Amendment **Acts**; no bill PDFs for this era.
2. **eparlib.nic.in** (Parliamentary Digital Library) — the only source that yielded bills for this
   era: **amendments 03 and 16 only** (links below). Other amendment numbers' bill collections were
   not digitised / not locatable by search.
3. **PRS India billtrack** — pages exist only from ~2009 onward (amendment 97+); nothing for 01–96.
4. Wayback Machine probes of `indiacode.nic.in/coiweb/amend/` — hosts acts, not bills.

No other candidate source produced a bill PDF for the 94 gap rows; the worker chose to record
`MISSING_BILL` rather than fabricate a URL.

## The two found bills (status = OK)

| # | `bill_file` | `bill_url` (source) |
|---|-------------|---------------------|
| 03 | `AMENDMENT_03_BILL.pdf` | https://web.archive.org/web/20240701235007id_/https://eparlib.nic.in/bitstream/123456789/58262/1/jcb_01_1954_constitution_3rd_amendment_bill.pdf |
| 16 | `AMENDMENT_16_BILL.pdf` | https://web.archive.org/web/20230528034129id_/https://eparlib.nic.in/bitstream/123456789/58623/1/jcb_03_1963_constitution_16th_amendment.pdf |

## Act URL provenance (all 96 rows have one)

`act_url` for rows 01–96 points at the legislative.gov.in CDN
(`cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/…`) — the hosting for
legislative.gov.in's "Constitution Amendment Acts" listing, pinned at backfill time (2026-08-07).
These are the same files now on disk as `AMENDMENTS/AMENDMENT_01_ACT.pdf` … `AMENDMENT_96_ACT.pdf`.

## Notes

- **Amendment 88 vs 88ACTUAL**: the canonical post-88 bundle is
  `AMENDMENT_88ACTUAL_11022003_but_enforced_15012004.zip`; the plain
  `AMENDMENT_88_11022003_but_enforced_15012004.zip` bundle is erroneous (missing Arts 268A, the
  Art 270 change, and Ninth-Schedule entry 92C — see `docs/INVENTORY.md` §3). The merged CSV's
  `zip_file` for row 88 is the plain 88 (verbatim from `backfill_report.md`); 88ACTUAL is tracked
  in git and documented in INVENTORY.
- **97/98 bill URL caveats** (from `docs/INVENTORY.md` §6): the 97th Act's bill is the
  111th Amendment Bill 2009 (PRS page verified live); the 98th bill is the Constitution (98th
  Amendment) Bill, 2012, introduced in Rajya Sabha — no PRS billtrack page exists (404s on both
  candidate slugs). Both rows in the merged CSV carry their verified bill URLs from
  `amendments_new.md`.
- **105th assent date**: `docs/amendments.csv` row 105 uses **2021-08-19** (Gazette extraordinary
  date, authoritative) — the source CSV said 2021-08-18.

## Fresh web probe — 8-bill sample (2026-08-07)

Follow-up worker research (2026-08-07), sample: amendments 01, 02, 04, 07, 10, 17, 24, 40.
Goal: test whether any of the 94 `MISSING_BILL` rows is recoverable from the open web.

- **(a) Amendment 01 recovered (as a committee report, not a bill PDF).** The only sample item
  recoverable is the *Report of the Joint Committee on the Constitution (First Amendment) Bill,
  1951*, from the eparlib jcb (Joint Committee on Bills) collection, via the Wayback Machine
  2024-06-18 capture of
  `https://eparlib.nic.in/bitstream/123456789/58338/1/jcb_1951_constitution_1st_amendment_bill.pdf`
  (26 pages, OCR text layer; reproduces the bill text, including the Ninth Schedule). Caveat: the
  2022-08-13 capture of the same bitstream is corrupt — use the 2024-06-18 one.
- **(b) eparlib jcb collection holds >= 4 amendment-bill items.** Identified so far: 1st = 58338,
  3rd = 58262, 16th = 58623, 81st = 757609. These are joint-committee reports that reproduce bill
  texts; a Wayback CDX sweep of eparlib `bitstream/123456789/*` is the most promising full-sweep
  path for the remaining gaps.
- **(c) Parliament Digital Library (eparlib.sansad.in) holds debate records, not bills.** Lok Sabha
  debate records titled "Constitution (Nth Amendment) Bill" exist for many amendments (handles:
  02 = 896504, 07 = 895365, 24 = 858238 / 853319 / 852188, 11th = 903479, 14th = 874018,
  22nd = 870920, 42nd = 855625, 44th = 836904, 45th = 839925, 48th = 833581). These are DEBATE
  records (leave-to-introduce motion and speeches), NOT bill text — must not be labeled as bills.
  The site is currently down (preservation risk; contents may not be re-probeable).
- **(d) Verdict.** Standalone pre-1997 bill PDFs remain unrecoverable from the open web: the
  Gazette of India Extraordinary for the 1950s–70s is not digitised, and
  PRS / indiankanoon / legislative.gov.in hold acts only. No new `bill_url` values added to
  `docs/amendments.csv` as a result of this probe; amendment 01 stays `MISSING_BILL` as a *bill*
  (the recovered committee report is not the bill proper — flagging here for future triage).

## Era C sweep — amendments 74–96 (2026-08-08)

Follow-up worker research targeting the previously-unsearched 1992–2011 era (the "74".."96" CSV rows).
Sources swept: PRS India files CDX (`prsindia.org/files/bills_acts/bills_parliament/<year>/*`, all
PDFs 1991–2012), PRS billtrack (slug probes via Wayback availability API + live 404s), Wayback CDX of
loksabha.nic.in / loksabhaph.nic.in / sansad.in / rajyasabha.nic.in / 164.100.24.219 / 164.100.47.132 /
164.100.47.5 / parliamentofindia.nic.in / legislative.gov.in, eparlib jcb bitstream sweep (Step 2),
and targeted web searches. Checkpoints in `probe_ik2/` (gitignored).

### Found (2/23) — integrated 2026-08-08

| # | Bill (as identified) | Source URL | Text layer | Status |
|---|----------------------|------------|-----------|--------|
| 95 | Constitution (One Hundred and Ninth Amendment) Bill, 2009 — Art 334 "sixty years"→"seventy years" (= 95th Act, reservation to 2020) | https://web.archive.org/web/20240505134801id_/https://prsindia.org/files/bills_acts/bills_parliament/2009/109th__Amendment.pdf | scan-only (4 pp) — no txt | OK |
| 96 | Constitution (One Hundred and Thirteenth Amendment) Bill, 2010 (Bill No. 28 of 2010, LS) — Eighth Schedule entry 15 "Oriya"→"Odia", SOR P. Chidambaram 14-02-2010 (= 96th Act) | https://web.archive.org/web/20221207163740id_/https://prsindia.org/files/bills_acts/bills_parliament/2010/The_Constitution_One_Hundred_and_Thirteenth_Amendment_Bill_2010.pdf | text layer | OK |

First 120 chars of confirmed bills:
- 95: "THE CONSTITUTION (ONE HUNDRED AND NINTH AMENDMENT) BILL, 2009 ... In article 334 of the Constitution, for the words 'sixty years', the words 'seventy years' shall be substituted."
- 96: "AS INTRODUCED IN LOK SABHA Bill No. 28 of 2010 THE CONSTITUTION (ONE HUNDRED AND THIRTEENTH AMENDMENT) BILL, 2010 A BILL further to amend the Constitution of India."

### Not found (21/23) — per-amendment

- **74–78 (bills 1991–1995)**: no digital bill texts exist. Bills were pre-Gazette-digitisation and
  pre-egazette; PRS files (1991–2012 sweep), eparlib jcb bitstreams, loksabha/loksabhaph/
  parliamentofindia/rajyasabha CDX all negative. Bill identities (from bill SORs quoted in
  constitution.org act pages): 74th act ← Constitution (Seventy-third Amendment) Bill, 1991;
  75th act ← (Seventy-seventh Amendment) Bill, 1992 (Art 323B rent tribunals; eparlib debate handle
  882897 names the 77th bill as the 323B bill); 76th act ← (Eighty-fifth Amendment) Bill, 1994;
  77th act ← (Eighty-sixth Amendment) Bill, 1995; 78th act ← (Eighty-first Amendment) Bill, 1994.
  (Single-source attributions; ordinals demonstrably repeat across Lok Sabhas, so treat as indicative.)
- **79–83 (bills 1999–2000)**: not found. The only era-C-numbered bills PRS hosts are lapsed
  women's-reservation bills — 79th (1992), 81st (1996), 84th (1998), 85th (1999) — downloaded,
  classified as genuine bills but subject-mismatched (insertion of Arts 330A/332A/334A), REJECTED.
  constitution.org SOR attributions: 79th act ← 84th bill 1999; 80th ← 89th bill 2000;
  81st ← 90th bill 2000; 82nd ← 88th bill 1999; 83rd ← 86th bill 1999. No PDFs on the open web.
- **84–92 (bills 2001–2003)**: not found. PRS files swept (nothing beyond the 1998/1999 women's
  decoys and committee reports); eparlib jcb negative; 164.100.24.219 (old LS BillsTexts host) has
  only 199 captured PDFs, zero constitution bills. egazette.gov.in: homepage/search probes could not
  demonstrate ≤2011 coverage (ASP.NET/JS app, no year metadata exposed) — per probe rules it was NOT
  mined for bills. IK debates confirm identities (e.g. 84th bill 2001 delimitation; 93rd bill 2001 →
  86th act RTE).
- **93 (93rd Amendment Bill, 2005, OBC Art 15(5))**: not found. Introduced LS Aug 2005, passed
  Dec 2005 → 93rd Act 2006. No PDF on PRS files, eparlib jcb, or via targeted web search.
- **94 (bill 2006, tribal-welfare Minister Art 164)**: not found. The PRS 2006 file named
  "The_constitution_one_hundred_and_sixth_amendment_bill_2006" is mislabelled/hybrid (p1 = 106th
  bill 2006 Bill No. 48 of 2006; p2 = cooperatives Part IXB) — discarded; the 106th bill 2006
  (Bodo/Sixth Schedule) is not an era-C bill.
- **95 & 96**: found — see table above.

### Decoy bills examined and rejected (all genuine bills, wrong amendment)

107th bill 2007 (Bill No. 95 of 2007, Arts 244+332), 108th bill 2008 (women's, RS, scan),
109th bill 2009 (Art 334 — ACCEPTED as 95th act's bill), 110th bill 2009 (Art 243D), 112th bill 2009
(Art 243T), 113th bill 2010 (Odia — ACCEPTED as 96th act's bill), 114th bill 2010 (Arts 124/217/224),
115th bill 2011 (GST Arts 246A/269A...), 116th bill 2011 (Lokpal Part XIVB), 117th bill 2012
(Arts 16/341/342). 111th bill 2009 (cooperatives) already integrated as the 97th act's bill.

### Step 2 — eparlib jcb committee-report CDX sweep (timeboxed)

- `eparlib.nic.in/bitstream/123456789/*` + `original:.*jcb.*(constitution|amendment).*` +
  `mimetype:application/pdf` → **45 unique bitstreams** (full list in `probe_ik2/host_cdx2.json`).
- Constitution-amendment items (all joint-committee REPORTS reproducing bill texts — ledger only,
  NOT bills): 1st = handle 58338 (jcb_1951_constitution_1st_amendment_bill, capture 2024-06-18 good /
  2022-08-13 corrupt), 3rd = 58262, 16th = 58623, 81st-bill (women's) = 757609 +
  PRS-hosted copies, and **NEW: 757628 `jcb_11_1997_scheduled_tribes`** (11th LS 1997 — JCB on the
  Constitution (Scheduled Tribes) Order (Amendment) Bill, 1996/97; not one of amendments 01–106).
- Filenames-with-'bill' pass: no additional constitution items beyond the above (other jcb 'bill'
  items are non-constitution bills: estate duty, marriage, railways, etc.).
- `eparlib.sansad.in`: no captures in Wayback CDX; live site times out (down) — contents not
  re-probeable, matching earlier notes.

### Definitive negatives (this sweep)

PRS files 1991–2012 (every captured PDF checked), PRS billtrack slugs (Wayback availability: 0
captures for all 23 ordinals ×3 years; live: 404), loksabha.nic.in / loksabhaph.nic.in /
sansad.in / rajyasabha.nic.in / 164.100.24.219 / 164.100.47.132 / 164.100.47.5 /
parliamentofindia.nic.in / legislative.gov.in CDX (no constitution-amendment-bill PDFs),
egazette.gov.in (coverage unverifiable → not searched), eparlib jcb (only the 5 items above).

## Full eparlib jcb sweep — all 45 bitstreams classified (2026-08-08)

All 45 jcb URLs from `probe_ik2/host_cdx2.json` (44 unique bitstreams; `757594` appears twice, once
with a corrupt `;2` suffix) were downloaded from their newest Wayback captures
(`probe_ik2/jcb_dl/`, `probe_ik2/jcb_dl_manifest.json`) and classified by first-page pdftotext.
Full table: `probe_ik2/jcb_classification.json` (44 rows: filename | category | subject |
first-120 chars | wayback URL).

- **Constitution-amendment items (3)**: 58338 (1st, **INTEGRATED below**), 58262 (3rd, already
  integrated), 58623 (16th, already integrated).
- **Lapsed-bill report (1)**: 757609 — Constitution (81st Amendment) Bill, 1996 (women's
  reservation: new Arts 330A/332A) Joint Committee report with corrigenda. LAPSED bill, NOT the
  81st Act (SC/ST backlog, 2000) — does not map to any CSV row. Verified: PRS hosts 3 copies
  (`Constitution_(81st_Amendment)_Bill_1996.pdf`,
  `Joint_Committee_on_Constitution_(81st_Amendment)_Bill_1996.pdf`,
  `Joint_Committee_Report_Constitution_(81st_Amendment)_Bill_1996.pdf` under
  prsindia.org/files/bills_acts/bills_parliament/1996/) — ledger only, NOT integrated.
- **ST-order report (1)**: 757628 — Constitution (Scheduled Tribes) Order (Amendment) Bill, 1996,
  Select Committee report; a statutory-order bill, NOT a constitutional amendment — ledger only.
- **Other (39)**: non-constitution bills (estate duty, chit fund, Hindu marriage, CrPC, trade
  merchandise, air force, trade unions, Aligarh Muslim, companies ×2, income-tax evidence,
  food adulteration evidence, seeds, insurance, salary, patents evidence, mental-health evidence,
  air-pollution evidence, life insurance ×2, railways ×3, marriage, IPC evidence, criminal law ×3,
  dowry, prevention of disqualification, liability in tort, enforcement of security interest,
  preventive detention, essential goods) + pre-independence non-bills (GOI Act 1919, Official
  Secrets 1923, CrPC 1923). No further constitution-amendment bill text beyond the 3 above.

### Amendment 01 bill recovered and integrated (2026-08-08)

The 1st-amendment item (handle 58338, `jcb_1951_constitution_1st_amendment_bill.pdf`) is a Select
Committee report that **annexes the full bill text as amended** — verified in the 2024-06-18
Wayback capture: "A BILL to amend the Constitution of India. BE it enacted by Parliament as
follows: 1. Short title… 2. Amendment of article 15… (4) Nothing in this article or in clause (2)
of article 29 shall prevent the State from making any special provision…" plus the operative
clauses (19(2), 31A, 31B, Ninth Schedule). This meets the repo's 03/16 precedent (committee
report reproducing bill text = the bill), so the earlier "(a)/(d)" note's "stays MISSING_BILL"
call is **superseded**. Integrated as `AMENDMENTS/AMENDMENT_01_BILL.pdf` (2.8 MB, text layer →
`AMENDMENT_01_BILL.txt`), CSV row 01 → `status=OK`, bill_url =
https://web.archive.org/web/20240618004242id_/https://eparlib.nic.in/bitstream/123456789/58338/1/jcb_1951_constitution_1st_amendment_bill.pdf .
Caveat kept: the 2022-08-13 capture of the same bitstream is corrupt (empty text layer); the
2024-06-18 capture (2.8 MB) and 2024-12-05 capture (Wayback-truncated at 1 MiB) exist — only the
2024-06-18 one is usable and is the one pinned.

**Bill coverage now 15/106** (01, 03, 16, 095–106). Remaining missing: 02, 04–15, 17–94 (92 rows).

## egazette.gov.in year coverage — DETERMINED (2026-08-08)

Earlier note ("coverage unverifiable → not searched") is **superseded**. Probing on 2026-08-08:

- **Coverage extends back to at least 1947, definitively ≤2011.** Wayback CDX of
  `egazette.gov.in/WriteReadData/*` (collapse=urlkey, 2000 URL keys) shows captures for every year
  1937, 1947–2025 (e.g. 1950: 11, 1955: 8, 1960: 6, 1970: 3, 1980: 6, 1990: 5, 2000: 3, 2005: 13,
  2010: 7, 2011: 7). Live fetches all return `200 application/pdf`:
  - `WriteReadData/1951/O-2306-1951-0003-107771.pdf` → 637 KB, verified Gazette of India,
    20 Jan 1951 (Part I Sec 4) via pdftotext.
  - `WriteReadData/2011/E_21_2011_128.pdf` → 200 (39 KB); `WriteReadData/2005/E_248_2011_024.pdf`
    → 200 (757 KB); `WriteReadData/2006/W_11_2011_096.pdf` → 200 (636 KB).
  - Two filename schemes coexist: `YYYY/<NNNNNN>.pdf` (2013+; the 100th/101st/104th act URLs) and
    `YYYY/E_<id>_<batchyear>_<n>.pdf` / `W_...` (older digitisation batches; E=Extraordinary,
    W=Weekly).
- **Site surface**: no robots.txt / sitemap.xml (both 404). Homepage is an ASP.NET sessionized
  postback app (`/(S(<sid>))/default.aspx`); GazetteDirectory.aspx / SearchMenu.aspx /
  RecentUploads.aspx render a static shell with no year index or search form without a JS
  postback session — not curl-drivable in the probe.
- **Sample bill-gazette hunt (91st/92nd/93rd/94th amendment bills, 2003–2006): NOT FOUND in
  timebox.** Wayback CDX knows only 28 URLs total for 2003–2006 (2003: 2, 2004: 4, 2005: 13,
  2006: 9); none is a bill gazette. The gazette-issue ID space per year is opaque and not
  enumerable from the open web; the site search cannot be driven without a session. No bill
  gazettes downloaded; nothing integrated from egazette this pass.
- **Follow-up opportunity (flagged)**: since `WriteReadData/YYYY/` serves live for every year
  1947+, era-C bills (2001–2011) and pre-1997 bills are in principle retrievable IF the per-year
  Extraordinary Part II Section 2 issue IDs can be enumerated (e.g. via the egazette search
  session UI driven headlessly, or by scraping the yearly ID ranges once a seed ID per year is
  known). Evidence: `probe_ik2/egazette_probe2.json`, `/tmp/ega_cdx.txt` (2000-row CDX dump).

## egazette.gov.in headless hunt — 12 bill gazettes recovered (2026-08-08)

The egazette "coverage unverifiable / not searched" note and the era-C "not found" verdicts for
amendment bills 77–94 (except 89) are **superseded**. The ASP.NET search UI was driven end-to-end
in a headless browser (see "How the search UI works" below); 12 Gazette of India EXTRAORDINARY
Part II Section 2 (bills introduced in Parliament) issues were downloaded, OCR-verified against
the act texts, and integrated. Bill coverage is now **39/106** (01, 03, 16, 065–069, 071–077,
081, 083, 085–096, 097–106 — my 12 egazette rows: 077, 081, 083, 085–088, 090–094; the
sansad worker's 12: 065–069, 071–076, 082). Remaining missing: 02, 04–15, 17–64, 70,
78–80, 84, 89 (67 rows).

### How the search UI works (reproducible)

1. `https://egazette.gov.in` → ASP.NET sessionized `(S(<sid>))/default.aspx`.
2. Footer link "Search Gazette" → `SearchMenu.aspx` (must be clicked, not GET-navigated).
3. Menu button `btnBill` ("Search by Bill / Assent / Act") → `SearchBill.aspx?id=<n>`.
4. Form fields: `ddlreftype` (9 = Bill), `txtRefNo`, `txtKeyword` (textarea; **special
   characters rejected** — no parens/hyphens), `txtDateFrom`/`txtDateTo` (`dd-MMM-yyyy`,
   e.g. `01-Jan-2003`), submit = image button `ImgSubmitDetails` (`<name>.x/.y` postback).
5. Results grid `gvGazetteList` (10/page, `__doPostBack('gvGazetteList','Page$N')` paging):
   columns Ministry/Department/Office/**Subject**/Category/Part & Section/Issue Date/Publish
   Date/Gazette ID + PDF icon button `gvGazetteList$ctlNN$imgbtndownload`.
6. **Download mechanism**: the PDF icon postbacks `window.open('ViewPDF.aspx')`; the session
   then serves `ViewPDF.aspx` containing `<iframe src="../WriteReadData/<year>/<file>.pdf">`.
   The iframe URL is the stable public PDF link. **Gotcha**: the click is only honoured when the
   server-side grid is on the row's own page — collect the button name and click *immediately*
   on the page where the row was found (clicking after paging resolves the wrong row).
7. Keyword search is weak for pre-2012 rows (`Constitution` + 2003–2006 dates → 0 hits) — the
   reliable path is **date-window sweep, no keyword** (e.g. Bill type, 01-Jan-2003..31-Dec-2006
   → 215 rows; 1991–2000 → 447 rows), then filter subjects for `Constitution`.

All PDFs are **scans (no text layer)**; identification was done with RapidOCR on rendered pages
(operative clauses cross-checked against `AMENDMENTS/AMENDMENT_NN_ACT.txt`). Probe artifacts in
`probe_ik3/` (gitignored): `search_log.json`-style sweep outputs inline below, PDFs in
`probe_ik3/dl/`, OCR text in `probe_ik3/dl/ocr/`.

### Confirmed bill gazettes (12) — integrated

Bill number in title ≠ amendment number for most rows (bills were renumbered at passage):

| # | Bill (as printed in the gazette) | Issue date | egazette URL | Pages used |
|---|----------------------------------|-----------|--------------|-----------|
| 77 | The Constitution (Eighty-sixth Amendment) Bill, 1995 (Bill No. 43 of 1995, LS; art 16(4A) promotion reservation; SOR cites Indra Sawhney) | 31-May-1995 | https://egazette.gov.in/WriteReadData/1995/E-0343-1995-0025-12862.pdf | 1–2 (whole) |
| 81 | The Constitution (Ninetieth Amendment) Bill, 2000 (Bill No. 90 of 2000, LS; art 16(4B) backlog vacancies; SOR cites Indra Sawhney 50% ceiling) | 08-May-2000 | https://egazette.gov.in/WriteReadData/2000/E_25_2013_192.pdf | 1–2 (whole) |
| 83 | Constitution Amendment Bill 1999 (RS Bill No. XLVI of 1999; art 243M(3A) Arunachal Pradesh exemption from 243D) | 17-Dec-1999 | https://egazette.gov.in/WriteReadData/1999/E_32_2013_174.pdf | 1–2 of 4 (bill + SOR; p3–4 = separate 87th-bill-1999) |
| 85 | The Constitution (Ninety-second Amendment) Bill, 2001 (Bill No. 105 of 2001, LS; art 16(4A) "with consequential seniority", deemed 17-Jun-1995; SOR cites Virpal Singh/Ajit Singh) | 26-Nov-2001 | https://egazette.gov.in/WriteReadData/2001/E-2503-2001-0043-113490.pdf | 1–2 of 8 |
| 86 | The Constitution (Ninety-third Amendment) Bill, 2001 (Bill No. 106 of 2001, LS; new art 21A free & compulsory education 6–14; SOR cites art 45) | 26-Nov-2001 | https://egazette.gov.in/WriteReadData/2001/E-2503-2001-0043-113490.pdf | 5–7 of 8 (p3–4 = Essential Services repeal bill) |
| 87 | The Constitution (Ninety-sixth Amendment) Bill, 2003 (Bill No. 31 of 2003, LS; arts 81/170/330 "1991"→"2001") | 02-May-2003 | https://egazette.gov.in/WriteReadData/2003/E_18_2011_142.pdf | 1–3 (whole) |
| 88 | The Constitution (Ninety-fifth Amendment) Bill, 2003 (Bill No. 14 of 2003, LS; art 270(1) + Seventh Sched. List I entry 92C "Taxes on services") | 07-Mar-2003 | https://egazette.gov.in/WriteReadData/2003/E_4_2011_152.pdf | 1–3 of 6 (p4–6 = National Honour bill) |
| 90 | The Constitution (Ninety-ninth Amendment) Bill, 2003 (Bill No. 38 of 2003, LS; art 332(6) proviso, Bodo areas of Assam; SOR cites BLT Memorandum of Settlement) | 09-May-2003 | https://egazette.gov.in/WriteReadData/2003/E_27_2011_129.pdf | 1–2 of 15 |
| 91 | The Constitution (Ninety-seventh Amendment) Bill, 2003 (Bill No. 32 of 2003, LS; arts 75/164 + new 361B + Tenth Schedule; SOR = anti-defection; introduced bill has 10%/7-min, act later raised to 15%/12) | 05-May-2003 | https://egazette.gov.in/WriteReadData/2003/E_20_2011_140.pdf | 1–3 (whole) |
| 92 | The Constitution (One-Hundredth Amendment) Bill, 2003 (Bill No. 63 of 2003, LS, L.K. Advani; Eighth Sched. entry 3 "Bodo" as introduced; Dogri/Maithili/Santali added in passage, retitled 92nd) | 18-Aug-2003 | https://egazette.gov.in/WriteReadData/2003/E_39_2011_107.pdf | 1–2 of 45 |
| 93 | The Constitution (One Hundred and Fourth Amendment) Bill, 2005 (Bill No. 160 of 2005, LS; new art 15(5) — private unaided institutions) | 20-Dec-2005 | https://egazette.gov.in/WriteReadData/2005/E_72_2012_040.pdf | 1–2 (whole) |
| 94 | The Constitution (One Hundred and Fifth Amendment) Bill, 2006 (Bill No. 15 of 2006, LS; art 164(1) proviso — tribal welfare Minister for Chhattisgarh/Jharkhand + MP/Odisha) | 01-Mar-2006 | https://egazette.gov.in/WriteReadData/2006/E_6_2011_083.pdf | 1–2 (whole) |

Row 94 was later **superseded** by the sansad worker: `AMENDMENT_94_BILL.pdf` now is the
text-layer sansad copy and `AMENDMENT_94_BILL.txt` exists; CSV row 94 `bill_url` points at
sansad (commit f94ae8a). The egazette scan PDF remains retrievable from the URL above.

First 120 chars of each bill (OCR-cleaned from the scan, title pages):
- 77: "The following Bill was introduced in the Lok Sabha on 31st May, 1995: BILL No. 43 of 1995 — A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Forty-sixth Year of the Republic of India as follows: 1. This Act may be called the Constitution (Eighty-sixth Amendment) Act, 1995."
- 81: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-first Year of the Republic of India as follows: 1. This Act may be called the Constitution (Ninetieth Amendment) Act, 2000."
- 83: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fiftieth Year of the Republic of India as follows: 1. This Act may be called the Constitution (Amendment) Act, 1999."
- 85: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-second Year of the Republic of India as follows: 1. (1) This Act may be called the Constitution (Ninety-second Amendment) Act, 2001. (2) It shall be deemed to have come into force on the 17th day of June, 1995. 2. In article 16..."
- 86: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-second Year of the Republic of India as follows: 1. (1) This Act may be called the Constitution (Ninety-third Amendment) Act, 2001. (2) It shall come into force on such date as the Central Government may, by notification..."
- 87: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-fourth Year of the Republic of India as follows: 1. This Act may be called the Constitution (Ninety-sixth Amendment) Act, 2003. 2. In article 81 of the Constitution, in clause (3)..." (art 81 OCR shows "8 l")
- 88: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-fourth Year of the Republic of India as follows: 1. (1) This Act may be called the Constitution (Ninety-fifth Amendment) Act, 2003."
- 90: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-fourth Year of the Republic of India as follows: 1. This Act may be called the Constitution (Ninety-ninth Amendment) Act, 2003. 2. In article 332 of the Constitution..."
- 91: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-fourth Year of the Republic of India as follows: 1. This Act may be called the Constitution (Ninety-seventh Amendment) Act, 2003. 2. In article 75 of the Constitution..."
- 92: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-fourth Year of the Republic of India as follows: 1. This Act may be called the Constitution (One-Hundredth Amendment) Act, 2003. 2. In the Eighth Schedule to the Constitution, (a) existing entry 3 shall be re-numbered..."
- 93: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-sixth Year of the Republic of India as follows: 1. (1) This Act may be called the Constitution (One Hundred and Fourth Amendment) Act, 2005. 2. In article 15 of the Constitution, after clause (4), the following clause shall be inserted, namely: (5) Nothing in this article..."
- 94: "A Bill further to amend the Constitution of India. Be it enacted by Parliament in the Fifty-seventh Year of the Republic of India as follows: 1. This Act may be called the Constitution (One Hundred and Fifth Amendment) Act, 2006. 2. In article 164 of the Constitution, in clause (1), in the proviso..."

Integration notes: gazettes with several bills had the target bill's pages extracted (pypdf) —
see "Pages used". All are scan-only; no `.txt` files produced (precedent: `AMENDMENT_95_BILL`).
`docs/amendments.csv` rows 77, 81, 83, 85, 86, 87, 88, 90, 91, 92, 93, 94 → `status=OK`,
`bill_file=AMENDMENT_NN_BILL.pdf`, `bill_url` = the egazette URL above.

### Lapsed / non-amendment bills examined and rejected (ledger only)

Genuine Part II Sec 2 constitution bills in the egazette DB that map to **no** act 01–106:
2003: 95th-bill issue p4–6 (National Honour), Bill 21/2003 (art 356), Bill 70/2003 (IIT Kerala) +
Bill 73/2003 (arts 103/192 + Tenth Sched), 98th bill 2003 (National Judicial Commission —
Chapter IVA, arts 124/217/222/231), 101st bill 2003 (Ninth Sched. entry 285 Essential
Commodities), 103rd bill 2004 (National Minorities Commission), Bill 74/2004 (MP recall),
Bill 8/2004 (art 21A-after + omission of art 41), Bill 60/2005 (SC/ST seniority, Bimlesh
Tanwar), Bill 56/2005 (art 124(8) post-retirement offices), Bill 135/2005 (inter-State river
linking), RS XIX/2005 (art 276 professional tax cap), RS LXXX/2005 (Seventh Sched. sports
entry), RS XXVII/2006 (art 51A cleanliness duties), Bill 59/2006 (Kerala professional colleges),
Bill 83/2006 (art 85 minimum sittings), RS LIV/2000 (Tulu 8th Sched.), Bill 192/2000
(art 177 Advocate-General), Bill 88/1994 (arts 82/170 census readjustment), Bill 20/1994
(art 371 Maharashtra boards), RS LXX/1994 (contempt disqualification), Bill 52/1995 (water
conservation), Bill 27/1997 + Bill 74/2000 + RS XIV/2000 + RS XXXI/1999 (teachers' constituency
variants), Bill 35/1998 (art 311), Bill 78/1998 (consignment tax), Bill 71/1998 + Bill 99/1999
(women's reservation 330A/332A — the known lapsed decoys), Bill 99/1998 (Planning Commission
151A/151B), RS IV/1999 (Seventh Sched. List I), RS XXXX/1999 (State Legislature sessions),
Bill 6/2000 (Bhojpuri), Bill 60/2000 (Kurmali), RS XXXIV/2000 (RS open ballot), RS XLII/1995-ish
Sixth Schedule (North Cachar/Karbi Anglong — ordinary law, not art 368), SC/ST Order bills
(statutory orders, not amendments). CVC bills (1998/1999) and ULC repeal (1998) are
constitutional-status bills, not amendments 01–106. All kept in `probe_ik3/dl/` for future triage.

### Still missing (this hunt)

- **89th act's bill** (art 338 National Commission for SCs, act 28-Sep-2003): **definitive
  negative after a second pass.** Probes on 2026-08-08: (i) egazette **Search by TEXT**
  (`SearchText.aspx`, keyword + dates) returns only *current-year* gazettes — `National
  Commission for Scheduled Castes` / `article 338` with 2003 dates -> "Text NOT found";
  sanity keywords return 2025/2026 issues only; (ii) full 2003-window subject sweep
  (Bill type, 57 rows) re-examined — all 27 constitution-subject rows plus every
  non-constitution bill-introduction issue inspected; no bill amends art 338;
  (iii) every multi-bill issue OCR-scanned (E_4, E_27, E_39, E_17, E_29, E_33, E_47,
  E-2503-2001-0043) — E_33's three constitution bills (Bill 55/2005 water, Bill 86/2005
  national service, Bill 85/2005, plus two more) are all lapsed 2005 bills. The 89th act's
  bill is not in the egazette DB.
- 74–76, 78–80, 82, 84: DB coverage starts at 1994; 1994–2001 sweeps produced no bill matching
  these acts (82nd act 2000's bill not in DB; 84th act 2001 delimitation bill not in DB).
- Pre-1994 bills (02, 04–15, 17–74): egazette search DB has no bill gazettes before 1994.

## Live-site bill hunt — PRS / sansad.in / legislative.gov.in (2026-08-08, worker parlsites)

Headless-Chrome live probes (earlier sweeps were CDX/archive-only). Checkpoints: `probe_ik3/`
(gitignored; `prs_manifest.json`, `sansad/` = 37 era-C PDFs + `ocr_p1.json` page-1/2 OCR of all
scans via rapidocr).

### Source 1 — PRS billtrack (live) — nothing new

- Full "Constitutional Amendments" category enumerated (`/billtrack/category/constitutional-amendments`,
  56 entries, no pagination, 1992–2026). Search form (`BillActsBillsParliamentSearch[title]`) probed
  with all target names: "Constitution (Ninety-first…Ninety-ninth Amendment) Bill", "…Eighty-fourth…",
  "…Eighty-seventh…", "…Eighty-ninth…", "…Ninety-third Amendment Bill 2005", "…Eighty-fourth Amendment
  Bill 2001/2002" — every one returns **No Result Found** (PRS titles use bill ordinals, e.g.
  "The Constitution (109th Amendment) Bill, 2009"; the 84–96-era bills simply have no pages).
- Only era-relevant live pages are the known decoys (all downloaded to probe_ik3/prs/ for the record):
  79th/1992, 81st/1996, 84th/1998, 85th/1999 (women's-reservation bills; 84/85 text layers verify
  Arts 330A/332A/334A insertion) and 103rd/2004 (National Commission for Minorities, Art 340A; lapsed).
  None maps to any act 01–106.

### Source 2 — sansad.in LS/RS bills API — 15 bills recovered (12 new here + 3 overlapping the egazette sweep)

- The bills listing UI is an SPA over `https://sansad.in/api_rs/legislation/getBills` (params
  `page`/`size`/`billName`/`house`/`billType`; **the old `pageNumber`/`pageSize` params are ignored** —
  use `page`/`size`). It exposes as-introduced bill PDFs (`/getFile/BillsTexts/{LS,RS}BillTexts/Asintroduced/…`)
  back to **1952** — invisible to the earlier CDX sweeps because `sansad.in/getFile/…` was not indexed.
- Enumerated: `billName=Constitution&house=Lok Sabha` → 159 records (10/page × 16 pages, sorted
  billIntroducedDate desc); `house=Rajya Sabha` → 39 records (4 pages). Range: LS 1952–2026, RS 1978–2024.
- **Bill ordinals ≠ act ordinals** (bills get renumbered at passage): confirmed via the ACT txt SOR
  headers (e.g. ACT 65: "…appended to the Constitution (Sixty-eighth Amendment) Bill, 1990 which was
  enacted as THE CONSTITUTION (Sixty-fifth Amendment) Act, 1990"). Every integration below was
  clause-matched to `AMENDMENTS/AMENDMENT_NN_ACT.txt` (or SOR-identified + clause-verified via OCR).

**Integrated (12 rows, this worker; sansad.in URLs; scans OCR-verified "A BILL" + operative clause):**

| # | Bill (as introduced) | sansad file | Evidence |
|---|----------------------|-------------|----------|
| 65 | Constitution (Sixty-eighth Amendment) Bill, 1990, Bill No. 98 | 98_1990_LS_Eng.pdf | ACT 65 SOR names it; Art 338 NCSC/ST clauses match |
| 66 | Constitution (Sixty-sixth Amendment) Bill, 1990, Bill No. 53 | 53_1990_LS_eng.pdf | Ninth Schedule "after entry 202" matches ACT 66 |
| 67 | Constitution (Seventy-sixth Amendment) Bill, 1990, Bill No. 158 | 158_1990_LS_Eng.pdf | ACT 67 SOR: "(Seventy-sixth Amendment) Bill, 1990 (Bill No. 158 of 1990)"; Art 356 third-proviso |
| 68 | Constitution (Seventy-fifth Amendment) Bill, 1991, Bill No. 48 | 48_1991_LS_Eng.pdf | ACT 68 SOR: "(Seventy-fifth Amendment) Bill, 1991 (Bill No. 48 of 1991)"; "four years"→"five years" |
| 69 | Constitution (Seventy-fourth Amendment) Bill, 1991, Bill No. 203 | 203_1991_LS_Eng.pdf | ACT 70 txt SOR note: 74th Bill 1991 → 69th Act; inserts Arts 239AA/239AB |
| 71 | Constitution (Seventy-eighth Amendment) Bill, 1992, Bill No. 142 | 142_1992_ls_Eng.pdf | SOR Konkani/Manipuri/Nepali = ACT 71; assent 31-08-1992 |
| 72 | Constitution (Seventy-fifth Amendment) Bill, 1991, Bill No. 209 | 209_1991_LS_Eng.pdf | SOR Tripura TNV settlement, Art 332; assent 04-12-1992 |
| 73 | Constitution (Seventy-second Amendment) Bill, 1991, Bill No. 158 | 158_1991_LS_Eng.pdf | "Insertion of New Part IX"; assent 20-04-1993 |
| 74 | Constitution (Seventy-third Amendment) Bill, 1991, Bill No. 159 | 159_1991_LS_Eng.pdf | "Insertion of New Part IXA"; assent 20-04-1993 |
| 75 | Constitution (Seventy-seventh Amendment) Bill, 1992, Bill No. 103 | 103_1992_Eng_LS.pdf | Art 323B; assent 05-02-1994 (ledger's constitution.org attribution confirmed) |
| 76 | Constitution (Eighty-fifth Amendment) Bill, 1994, RS Bill No. LXVI | RSBillTexts/…/AS Introduced in RS107202545656PM.pdf | ACT 76 SOR: "(Eighty-fifth Amendment) Bill, 1994 … enacted as … Seventy-sixth Amendment) Act, 1994"; Ninth Schedule entry 257A (TN Act) verbatim |
| 82 | Constitution (Eighty-eighth Amendment) Bill, 1999, RS Bill No. LIV | RSBillTexts/…/LIV_1999.pdf | ACT 82 SOR: "(Eighty Eighth Amendment) Bill 1999 … enacted as … Eighty Second Amendment) Act 2000"; Art 335 relaxation |
| 94* | Constitution (One Hundred and Fifth Amendment) Bill, 2006, Bill No. 15 | 15_2006.pdf | Art 164 proviso "Bihar"→"Chattisgarh, Jharkhand" verbatim = ACT 94; **text layer** → AMENDMENT_94_BILL.txt; assent 12-06-2006 |

\* Row 94 was first integrated by the egazette sweep (scan-only gazette); this worker **superseded** it
with the sansad text-layer as-introduced PDF + txt (CSV bill_url updated; egazette scan kept in git history).

Also recovered but **already integrated** (duplicates not re-added): 95th act ← 109th Bill 2009 (LS No. —
PRS copy in repo), 96th act ← 113th Bill 2010 (LS No. 28 of 2010), 97th act ← 111th Bill 2009 (LS No. 107),
86th act ← 93rd Bill 2001 (LS No. 106 — egazette sweep already did row 86), 83rd act ← 86th Bill 1999
(RS No. XLVI — egazette sweep already did row 83).

**Authoritative identities for still-missing bills (from ACT txt SORs; PDFs unavailable):**
80th act ← 89th Bill 2000 (sansad LS No. 41 — getFile 404s); 81st act ← 90th Bill 2000 (LS No. 90 — 404);
84th act ← **91st Bill 2000** (LS No. 172 — 404; CORRECTS the earlier "84th act ← Eighty-fourth Amendment
Bill 2001/2002" attribution); 78th act ← 78th Bill 1995 (RS No. XIV — no PDF in DB); 70th act ← 76th Bill
1992 (RS — not in DB); 87th act ← 96th Bill 2003 (LS No. 31 — 404); 92nd act ← 100th Bill 2003 (LS No. 63 —
404); 89th/90th acts ← 94th Bill 2002 (LS No. 94) and 99th Bill 2003 (LS No. 38), both assented 28-09-2003 —
PDFs 404, per-bill mapping unresolved.

**Rejected (genuine bills, no act 01–106 match; OCR-verified):** 1990-era LS bills 65th (No. 49, Art 356
"Provided also" — lapsed), 67th (No. 93), 69th (No. 101), 72nd (No. 107), 73rd (No. 128), 74th (No. 156)
(all lapsed), 75th (No. 157 — Art 356 3y6m→4y, text-layer, IDENTICAL content to the 67th act's bill but the
ACT 67 SOR names Bill No. 158; sansad metadata says "assented" — treated as duplicate predecessor, NOT
integrated); 1996 81st (No. 100, women's Art 330A decoy); RS 79th/1992 (No. LXXX, women's decoy);
2003 102nd (No. 67 — Art 54 electoral-college content, lapsed 2003 re-introduction of the 70th act's subject);
2004 103rd (No. 104, minorities); 2006 106th (No. 48 — Part IXB cooperatives, lapsed predecessor of the 97th
act; matches the ledger's earlier "hybrid PRS file" note — p1 of that file WAS this bill); 2007 107th (Gorkha
Hill Council), 2009 110th/112th, 2010 114th, 2011 115th/116th (GST/Lokpal etc. — all known lapsed decoys).

### Source 3 — legislative.gov.in — BLOCKED (Akamai)

- `https://www.legislative.gov.in/documents?page=1` (and without `www`, retried ×3) returns Akamai
  "Access Denied" (errors.edgesuite.net refs) for the headless browser from this network. The static
  HTML shell IS fetchable (Next.js, `nextExport`), but the listing is fully client-rendered (empty
  `__NEXT_DATA__`); the data API lives in unlabeled chunks and the old Drupal `?page=N` listing is gone
  (moved to `/archives?page=`). Web-search evidence confirms the documents portal indexes ACTS only
  ("AMENDMENT ACTS … Fifty-second through Sixty-third Amendment Acts"), consistent with the ledger's
  earlier CDN finding: no bill PDFs on legislative.gov.in. Nothing integrated; no further probing.

### Net effect

Bill coverage rose from 15/106 to **30/106** (01, 03, 16, 65–69, 71–77, 81–83, 85–96, 97–106 — the
egazette sweep added 77, 81, 85, 87, 88, 90–93 concurrently; see that sweep's own ledger section).
Remaining missing: 02, 04–15, 17–64, 70, 78–80, 84, 89 (49 rows — pre-1990 era, plus the identified-but-
PDF-less 70/78/79/80/84/89). **Follow-up opportunity:** sansad's LS/RS bill DB has as-introduced PDFs for
~40 pre-1976 bills (02, 04–15, 17–24, 27, 42–55, 60–64 era) — each needs the same clause-match treatment;
timeboxed out of this pass.

## Pre-1994 sansad.in sweep — 34 more bills integrated (2026-08-08, same worker)

The follow-up above was executed: all sansad LS/RS as-introduced PDFs for the pre-1994 gap rows were
downloaded (`probe_ik3/sansad/pre94/`), classified by title + operative clause (text layers where
present; rapidocr OCR for the 5 scans), and clause-matched to `AMENDMENTS/AMENDMENT_NN_ACT.txt`
(assent dates from the API cross-checked against the CSV; **bill ordinals ≠ act ordinals** throughout —
e.g. the 17th act came from the *Nineteenth* Amendment Bill 1964 (Bill No. 46), the 18th from the
*Twentieth* Bill 1966 (No. 39), the 19th from the *Twenty-first* Bill 1966 (No. 57), the 20th from the
*Twenty-third* Bill 1966 (No. 89), the 22nd from the Twenty-second Bill **1969** (No. 34; the 1968
No. 113 named in ACT 22's SOR was withdrawn), the 40th from the *Forty-second* Bill 1976 (No. 60), the
41st from the *Forty-third* Bill 1976 (No. 85), the 43rd from the Forty-fourth Bill 1977 (No. 148), the
44th from the Forty-fifth Bill 1978 (No. 88), the 47th from the *Forty-eighth* Bill 1983 (No. 94 —
Ninth Schedule entries after entry 188), the 53rd from the Fifty-third Bill 1986 (No. 88, Art 371G),
the 54th from the Fifty-fourth Bill 1986 (No. 95, Art 125), the 55th from the Fifty-fifth Bill 1986
(No. 145, Art 371H), the 60th from the Sixtieth Bill 1988 (No. 100, Art 276), the 61st from the
*Sixty-second* Bill 1988 (No. 129, Art 326; ACT 61 SOR confirms), the 63rd from the Sixty-third Bill
1989 (No. 100, Art 356(5)/359A repeal). Same-ordinal bill→act for 02, 04–15, 23, 27, 42, 45, 52.

**Integrated (34 rows; sansad.in URLs; 30 with text layer → `.txt`; 4 scans → PDF only):**
02, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 27, 40, 41, 42, 43, 44,
45, 47, 52, 53, 54, 55, 60, 61, 63. Full per-row bill identity + URL in `docs/amendments.csv`.

**Rejected (genuine bills, no act 01–106 match; clause-verified):** 1955 Sixth Bill (No. 61, Art 216 —
lapsed), 1955 Seventh Bill (No. 63, negatived), 1955 Eighth Bill (No. 73 — Art 3 content identical to
the 5th bill; sansad metadata conflicts; the 5th-named bill No. 60 was integrated instead), 1963
Seventeenth Bill (No. 26, negatived — superseded by the 19th Bill 1964), 1964 Eighteenth Bill (No. 36,
lapsed), 1966 Nineteenth Bill (No. 36, negatived predecessor of the 18th act's bill), 1970
Twenty-fourth Bill (No. 53, negatived), 1989 Sixty-third Bill (No. 45 — Tripura Art 332, lapsed
predecessor of the 72nd act's bill), 1989 Sixty-fourth Bill (No. 50 — Panchayati Raj Part IX, lapsed
predecessor of the 73rd act's bill).

**Still missing after both sweeps (18 rows):** 21, 24–26, 28–39 (1971–75 era: sansad has no bills for
these; ACT SORs name bills not in the DB — e.g. 28th act ← 31st Bill 1972 No. 55, 31st act ← 31st Bill
1973 No. 31, 33rd act ← 35th Bill 1974), 46, 48–51, 56–59, 62, 64, 70, 78–80, 84, 89. Of these, the
bills for 62 (RS Sixty-second Bill 1989, No. XXVI) and 49 (Fifty-first Bill 1984, No. 79) and 50
(Fifty-second Bill 1984, No. 80) and 51 (Fifty-third Bill 1984, No. 81) and 56 (Fifty-seventh Bill
1987, No. 54) and 57 (Fifty-eighth Bill 1987, No. 93) and 58 (Fifty-sixth Bill 1987, No. 80) and 59
(Fifty-ninth Bill 1988, RS No. XIV) and 70 (Seventy-sixth Bill 1992, RS) and 78 (Seventy-eighth Bill
1995, RS No. XIV) are **identified in sansad's DB but have no PDF on the server** (getFile 404 / f=null).

### Net effect (both pre-1994 and era-C passes)

Bill coverage: 30/106 → **64/106**. Remaining missing (42 rows): 21, 24–26, 28–39, 46, 48–51, 56–59,
62, 64, 70, 78–80, 84, 89 — every one either absent from the sansad DB or PDF-less; identities for
most are recorded above and in the era-C section.

## 33-row recovery sweep — getFile brute force + API re-enumeration (2026-08-08, worker missing33)

Timeboxed hunt for the 33 still-missing rows (21, 24–26, 28–39, 46, 48–51, 56–59, 62, 64, 70,
78–80, 84, 89). Checkpoints: `probe_ik3/` (gitignored) — `sansad_enum_ls.json` / `sansad_enum_rs.json`
(full LS 819 + RS 628 constitution-bill API dumps), `getfile_probe_results*.json`, `getfile/dl*/`
(downloaded candidates), `render/` (page-1 renders), `cdx_sansad_pdf.json` / `cdx_sansad_rs.json`
(Wayback CDX dumps), `49_1990_ls_eng.pdf`.

### Found (1/33): amendment 64 — CORRECTS a previous worker's mis-rejection

**64th act ← Constitution (Sixty-fifth Amendment) Bill, 1990 (LS Bill No. 49 of 1990)**, art 356:
"Provided also that in the case of the Proclamation issued under clause (1) on the 11th day of May,
1987 with respect to the State of Punjab, the reference in the first proviso to this clause to 'three
years' shall be construed as a reference to 'three years and six months'". ACT 64's SOR names the bill
verbatim ("appended to the Constitution (Sixty-fifth Amendment) Bill, 1990 which was enacted as THE
CONSTITUTION (Sixty-fourth Amendment) Act, 1990"); sansad API confirms bill No. 49/1990 passed both
houses and was assented 16-04-1990 (= CSV assent date). The earlier worker's "Rejected: 1990 65th
No. 49 (Art 356 'Provided also' — lapsed)" was **wrong** — the bill is the 64th act's bill, not a
lapsed decoy. File: `https://sansad.in/getFile/BillsTexts/LSBillTexts/Asintroduced/49_1990_ls_eng.pdf`
(scan-only, no text layer → no `.txt`, matching the AMENDMENT_95 precedent). Integrated as
`AMENDMENTS/AMENDMENT_64_BILL.pdf`; CSV row 64 → `status=OK`.

### 1971–75 API enumeration findings (rows 24–26, 28–39)

Re-enumerated the full sansad LS/RS bills API (`https://sansad.in/api_rs/legislation/getBills`,
params `billName=Constitution&house=…&page&size`; 819 LS + 628 RS records; all have "Constitution" in
the title). **The LS DB has NO constitution bills for 1972–1975 at all** (LS 1971 has only the
Twenty-seventh Bill No. 173, already integrated as row 27; LS 1972–75: zero records). The RS DB has
~45 constitution-amendment bills for 1971–75 (e.g. RS I/1971 "to amend article 368", RS IV/1971
"article 368 - to make provision for amending", RS XVII/1973 "to amend article 80", RS XXXI/1974
"amendment of article 352 & omission of articles 356…") — **every one with `billIntroducedFile =
null`**; all 426 roman-numeral getFile variants probed → 1 hit only, a non-constitution decoy
(RS `X.pdf` = Contempt of Courts (Amendment) Bill 2003). Conclusion: the 1971–75 era bills (24th–26th,
28th–39th acts) are **absent from the sansad DB entirely** (LS) or **PDF-less** (RS); ACT SORs name
bills (e.g. 28th ← 31st Bill 1972 No. 55, 31st ← 31st Bill 1973 No. 31, 33rd ← 35th Bill 1974, 36th ←
38th Bill 1975) that no longer have server files under any tested naming.

### Identified-but-404 bills — getFile naming-variant brute force (task 1)

For every bill identified in the API/DB with a missing/404 file, probed the getFile URL space:
`LSBillTexts/Asintroduced/<no>_<year>_LS_Eng.pdf` (+ case variants, `_eng`, `.PDF`, `Eng_LS`,
`LS_E`, `LS_En`, `LS-ENG`, `<no>_<year>.pdf`, `<no>LS.pdf`, `<no>_LS.pdf`, `Bill_No_<no>_of_<year>`,
`<no>_of_<year>`, `of<year>`, leading zeros, year-folder `<year>/<no>_<year>.pdf`, root-level
`LSBillTexts/<f>`), RS equivalents (`RSBillTexts/Asintroduced/<roman>_<year>.pdf` + variants), and
the API's own `f`/`billIntroducedFile` values. ~1,500 unique URLs probed (10–12 concurrent, 7–10 s
timeout, `?source=legislation` param required — without it the server 500s even known-good URLs).

Outcome per identified bill (all `404 page not found` unless noted):

| Row | Bill (identified) | Result |
|-----|-------------------|--------|
| 21 | 22nd Bill 1966 (RS No. XXIV) | in RS DB (`1966 \| XXIV \| Twenty-second Amendment Bill 1966`), file null; all variants 404 |
| 24–26, 28–39 | 1971–75 bills (LS) | absent from LS DB; RS entries file-less (see above) |
| 46 | 46th Bill 1981 (No. 52) | in LS DB (`1981 \| 52 \| 46th Amendment Bill 1981`), file null; 404s |
| 49 | 51st Bill 1984 (No. 79) | in LS DB, file null; 404s |
| 50 | 52nd Bill 1984 (No. 80) | **not in DB** (LS 1984 has only Nos. 79, 77); 404s |
| 51 | 53rd Bill 1984 (No. 81) | **not in DB**; 404s |
| 56 | 57th Bill 1987 (No. 54) | in LS DB, file null; 404s |
| 57 | 58th Bill 1987 (No. 93) | in LS DB, file null; 404s |
| 58 | 56th Bill 1987 (No. 80) | in LS DB, file null; 404s |
| 59 | 59th Bill 1988 (RS No. XIV) | in RS DB, file null; 404s |
| 62 | 62nd Bill 1989 (RS No. XXVI) | in RS DB, file null; 404s |
| 70 | 76th Bill 1992 (RS No. XXX) | **not in RS DB** (RS 1992 has no XXX); 404s |
| 78 | 78th Bill 1995 (RS No. XIV) | in RS DB (`1994 \| XIV \| Seventy-Eighth Amendment Bill, 1995`), file null; 404s |
| 79 | 84th bill 1999 | not in DB (LS 1999 has no 84; 85th bill 1999 No. 99's file `99_1999.pdf` 404s) |
| 80 | 89th Bill 2000 (No. 41) | in LS DB, file `41_2000.pdf` **404s on server**; all variants 404 |
| 84 | 91st Bill 2000 (No. 172) | in LS DB, file `172_2000.pdf` **404s**; all variants 404 |
| 89 | 94th Bill 2002 (No. 94) | in LS DB, file null; 404s |

Also probed and rejected as decoys (all genuine PDFs, wrong content): every `<n>LS.pdf` hit — the
bare-number LS space holds **modern private-member bills with unrelated content** (e.g. `22LS.pdf` =
National Commission for Farmers' Income Bill 2015, `24LS.pdf` = Bhagwan Buddha Homoeopathy 2015,
`78LS.pdf` = Constitution (Amendment) Bill 2000 inserting Art 16A women's reservation — the known
lapsed decoy subject, `79LS.pdf` = Declaration of Assets 1998, `80LS.pdf` = NCT Delhi Development
2000, `84LS.pdf` = art 174 bill 1998, `85LS.pdf` = IPC 1998, `41LS.pdf` = Bose Regiment 2015,
`59LS.pdf` = IPC amendment 2005, `76LS.pdf` = Provision of Employment 1998, `81LS.pdf` = EWC
Corporation 2012, `172LS.pdf` = Rajasthan HC Karauli 2016, `21LS.pdf`/`25LS.pdf`/`26LS.pdf`/
`29LS.pdf`/`30LS.pdf`/`31LS.pdf`/`32LS.pdf`/`34LS.pdf`/`35LS.pdf`/`37LS.pdf`/`38LS.pdf`/`39LS.pdf`/
`65LS.pdf` = assorted 2015–16 private-member bills, `X.pdf` = Contempt of Courts 2003). The
year-qualified `<no>_<year>_LS_Eng.pdf` files that DO exist for target years are non-constitution
bills sharing the LS bill-number space (e.g. `22_1966_LS_Eng.pdf` = Appropriation (Vote on Account)
Bill 1966, `26_1971_LS_E.pdf` = Appropriation (Railways) 1971, `47_1982_LS_E.pdf` = Industrial
Disputes (Amendment) 1982, `62_1989_LS_Eng.pdf` = SC/ST (Prevention of Atrocities) Bill 1988,
`21_1967_LS_eng.pdf` = Appropriation (Railways) 1967).

### Wayback retries (task 3)

- Exact getFile URLs (41_2000, 172_2000, 90_2000, 99_1999, 94_2002, 79_1984, 80_1984, 81_1984,
  54_1987, 93_1987, 55_1972, RS XIV_1988, XXVI_1989, XIV_1995): **zero captures** (CDX exact match).
- `sansad.in/getFile/BillsTexts/LSBillTexts/Asintroduced/*` CDX dump: 869 PDF captures, **none** of
  the target files. `RSBillTexts/…/*`: 569 captures, none. (sansad.in getFile space is mostly
  2020s-era uploads with timestamp names.)
- Old hosts: `164.100.47.5/bills-ls-rs/*` (2008 capture = dead index page, only an AR405 executable
  link), `164.100.47.132/bills*`, `loksabha.nic.in/bills*`, `164.100.24.219/*`,
  `parliamentofindia.nic.in/ls/bills*` — all CDX-empty for PDFs (consistent with the era-C sweep's
  "199 captured PDFs, zero constitution bills" on 164.100.24.219).

### egazette re-check for rows 78, 79, 80, 84 (task 4)

Re-verified against the sweep's negative evidence (`probe_ik3/search_log.json` + `probe_ik3/dl/`
artifacts): the 1991–2000 (447 gazettes, 28 Constitution subjects), 2001–2002 (82, 4) and 2003–2006
(215, 27) sweeps covered every constitution-subject bill gazette in the DB; OCR'd artifacts re-scanned
for the specific identities — **no Seventy-Eighth-bill-1995 (78th act), no art-334 50→60-years bill
(79th act), no Eighty-Ninth-bill-2000 (80th act), no Ninety-First-bill-2000 (84th act)**. The only
Eighty-Fourth hit is a post-enactment SOR reference in a 2003 gazette (Delimitation Act context), not
a bill. 1994–2000 downloaded gazettes re-identified: all are the documented decoys (Bill 20/1994
art 371, Bill 88/1994 arts 82/170 census — lapsed predecessor, RS LXX/1994, Bill 52/1995 water, Bill
27/1997, Bill 35/1998 art 311, RS IV/1999, Bill 99/1999 = 85th bill). Rows 78/79/80/84 remain
egazette-negative.

### Net effect

Bill coverage: 64/106 → **65/106** (01, 03, 16, 64, 65–69, 71–77, 81–83, 85–96, 97–106). Remaining
missing (32 rows): 21, 24–26, 28–39, 46, 48–51, 56–59, 62, 70, 78–80, 84, 89 — all confirmed
absent/PDF-less from sansad (LS+RS API re-enumerated), Wayback, and egazette.

## Final three leads — egazette pre-1994 / loksabhadocs / RS getFile (2026-08-08, worker finalhunt)

Timeboxed sweep of the three remaining lead classes for the last 32 rows (21, 24–26, 28–39, 46,
48–51, 56–59, 62, 70, 78–80, 84, 89). Checkpoints (gitignored): `probe_ik3/lead1/`
(`ega_cdx_all.json` 2195 URLs, `pre94_captures.json` 216 pre-1994, `dl/` 59 Wayback PDFs,
`classification.json`, `live_hits.json` 156 live URLs, `live_dl/` 156 PDFs,
`live_classification.json`), `probe_ik3/lead2/` (CDX dumps: loksabhadocs 8076, 164.100.47.132
10724, 164.100.24.219 4769, loksabha.nic.in 9158, sansad getFile/BillsTexts 1501),
`probe_ik3/lead3_hits.json`.

### Lead 1 — egazette WriteReadData pre-1994 files — NEGATIVE (no bill gazettes found)

- **Wayback CDX** (`egazette.gov.in/WriteReadData/*`, collapse=urlkey, 2195 unique URLs): only 216
  pre-1994 captures; target years hold 1–10 files each (1967: 6, 1971: 5, 1972: 7, 1973: 4, 1974: 4,
  1975: 1, 1982: 3, 1984: 1, 1987: 7, 1988: 4, 1989: 8, 1992: 9). All 59 target-year PDFs
  downloaded from newest `id_` captures and classified by first-page pdftotext: **no Extraordinary
  Part II §2 gazette among them** — the only §2 issue is `E-0657-1988-0039` (12-Aug-1988) = Muslim
  Women (Protection of Rights on Divorce) Amendment Bill, 1988 (non-constitution). The rest are
  Part II §1 (Punjab Art 356 proclamations etc.) or ordinary.
- **Live direct-URL construction** (files serve HTTP 200 outside Wayback): validated the
  `E-<seq>-<year>-<issue>-<id>.pdf` scheme and `id = base + issue` on known pairs, then probed
  issues 1–150 for the seqs observable from Wayback (1971=1384, 1987=710, 1988=656/657,
  1989=615, 1992=495) → **156 further gazettes downloaded + classified**. Only two are Part II §2
  (both 12-Aug-1988): issue 38 = Banking Companies (Taking Over of Management) Bill, RS XXIX/1988;
  issue 39 = Muslim Women bill (above) — **neither a Constitution Amendment Bill**.
- **Negative on the bill-introduction windows**: 1971 Jul–Aug (24th/25th/26th bills), 1987
  Mar/Nov–Dec (56th/57th/58th bills), 1988 Feb (59th bill), 1989 (62nd bill), 1992 (70th bill)
  fall in issue ranges whose `seq`+`id` bases are not observable (each year splits across multiple
  seqs; the id-base is not a function of seq — adjacent-seq probes with base hedges: 1388 probes,
  0 hits). Pre-1994 bill gazettes demonstrably exist on the server (1971 issues 84–86 constructed
  from the id formula return 200) but the per-issue ids are opaque from the open web, so the
  specific bill issues are not enumerable. Years with no captured E- file at all (1967, 1972–75,
  1982, 1984) are unreachable by construction (seq + id both unknown). **Nothing integrated.**

### Lead 2 — loksabhadocs.nic.in & sibling bill-text hosts — NEGATIVE

- CDX sweeps (collapse=urlkey, all 200s): loksabhadocs.nic.in 8076, 164.100.47.132 10724,
  164.100.24.219 4769 (full BillsTexts tree = 209 paths, all 2010+ era), loksabha.nic.in 9158,
  sansad.in/getFile/BillsTexts/* 1501 (2020s-era timestamp-named files).
- **No capture of any target file**: 41_2000, 172_2000, 90_2000, 94_2002, 99_1999 (the 80th ← 89th
  bill 2000 LS 41; 84th ← 91st bill 2000 LS 172; 89th ← 94th bill 2002 LS 94 identities) — zero
  hits on any host. The 164.100.24.219 BillsTexts tree holds only modern files (2011–2022: 109–152
  of 2013/2021/2022, errata, passed copies) and RS romans XII_2004, XIV_2005, LXXXVI_2006,
  XCI_2006, XXIV_2002 (= Slums & Jhuggi-Jhopri Bill — non-constitution, downloaded + verified),
  plus `Cons (111amdt) 107 of 2009` (= 97th act's bill, already integrated). 164.100.47.132
  `LssNew/ratification/` = the 110th bill 2009 women's-reservation decoy only; `LssNew/abstract/
  constitution_amendment_bills.htm` is a procedural note, no bill links. `listbills.aspx?mpc=*`
  member listing returns "No Bills Found". **Nothing integrated.**

### Lead 3 — RS DB 1971–75 getFile brute force — NEGATIVE

- RS API (`sansad.in/api_rs/legislation/getBills`, dump `probe_ik3/sansad_enum_rs.json`, 628
  records) holds **43 constitution bills for 1971–75, every `billIntroducedFile` = null** — all
  are *private-member* constitutional amendment bills (titles like "to amend article 368"), none
  is the government bill behind acts 24–39 (SOR-verified identities: 24th ← 24th Bill 1971,
  28th ← 31st Bill 1972 No. 55, 31st ← 31st Bill 1973 No. 31, 33rd ← 35th Bill 1974, 36th ← 38th
  Bill 1975, etc. — all LS-introduced; the LS DB has **zero** constitution bills for 1972–75).
- Brute force against `https://sansad.in/getFile/BillsTexts/RSBillTexts/{Asintroduced,asintroduced}/
  <Roman>_<year>[_{Eng,eng}][.PDF].pdf?source=legislation` (490 URL variants covering the 43
  era romans + the act-bill targets XIV_1988, XXVI_1989, XXX_1992, XIV_1995, XLVI_1999, LIV_1999):
  **only 2 hits, both already integrated** — XLVI_1999 (83rd act's bill) and LIV_1999 (82nd act's
  bill). All 1971–75 era files and the four act-bill targets 404 in every variant (including the
  lowercase `asintroduced` path that the old host 164.100.24.219 used; that host no longer
  resolves). **Nothing integrated.**

### Net effect

No new bills recovered; coverage stays **74/106** (01, 03, 16, 64–69, 71–77, 81–83, 85–96,
97–106). Remaining missing (32 rows, unchanged): 21, 24–26, 28–39, 46, 48–51, 56–59, 62, 70,
78–80, 84, 89. Definitive negatives now cover: sansad LS+RS API (re-enumerated), sansad
getFile roman/arabic variants (~2,000 URLs probed across passes), Wayback CDX of every
loksabha/loksabhaph/sansad/rajyasabha/parliamentofindia/164.100.* host, egazette search DB
(1994+ only), egazette WriteReadData live files (pre-1994 bill issues not enumerable — the only
remaining open avenue is a session-driven egazette search UI capable of pre-1994 queries, or a
seed id per target year, neither available from the open web).

PDL re-probe 2026-08-09: still down — eparlib.sansad.in resolves to 164.100.166.186 (Cloudflare 1.1.1.1 and Google 8.8.8.8 both answer; local system resolver 10.4.20.222 refuses queries), but raw TCP to that IP times out on both :443 and :80 (curl code 28, 15–20 s, retried ×2) and https://eparlib.sansad.in/ times out (code 000, 20 s); eparlib.nic.in is NXDOMAIN at 1.1.1.1 and 8.8.8.8; r.jina.ai proxy returns 422. DNS no longer NXDOMAINs, but the site is unreachable at the network level — contents still not re-probeable.

## Final-source probe: Google Books / NDL / Internet Archive (2026-08-09)

Worker `final-source` ran ~2.5 h (2026-08-09 04:42–07:10, per file mtimes in the gitignored
`probe_ik3/`) probing the three remaining untested sources for the 32 missing bills. Intent:
exact-title searches for 8 sample bills across Google Books, NDL India, and Internet Archive,
then pull bill texts from any hits.

### What was actually recorded (checkpoints)

- **Internet Archive — searched; no bill texts found.** `probe_ik3/ia/adv_results.json`
  (04:44) records 47 exact-title advancedsearch queries covering all 32 missing amendments
  (keys 21, 24–26, 28–39, 46, 48–51, 56–59, 62, 70, 78–80, 84, 89); 33 queries returned 0
  hits, and the 14 amendments with hits (24, 25, 39, 50, 56–59, 62, 70, 79, 80, 84, 89)
  matched only debate transcripts (rsdebate.nic.in, eparlib.nic.in), state-legislature
  ratification gazettes (TNLC-DB, karnatakalegislativeassembly), and DLI committee reports —
  none contains bill text. `probe_ik3/ia/dl_status.json` (04:47): 20 such items downloaded,
  all "ok", 0 fail. The worker then pivoted to Gazette-of-India text search:
  `probe_ik3/ia/gaztxt/` holds 2,818 gazette full-text files (last write 07:10) plus
  `gaz1971_80_95.json` / `gaz1971_cand.json` / `window_1971aug.json` (1971 ratification
  window) — that search was in progress when the worker was killed.
- **Google Books — no checkpoints.** `probe_ik3/gbooks/` was created (04:42) but is empty;
  no query results were ever recorded. Google Books remains untested.
- **NDL India — no checkpoints.** No directory or file exists for NDL; no evidence any
  query ran. NDL India remains untested.

### Net effect

No bills were integrated; coverage stays **74/106** (missing 32 rows, unchanged: 21, 24–26,
28–39, 46, 48–51, 56–59, 62, 70, 78–80, 84, 89). Internet Archive is now a recorded negative
for exact-title bill searches; Google Books and NDL India were never probed — results
inconclusive for those two sources.

## Internet Archive `in.gazette` full-text scan — 11 bill gazettes recovered (2026-08-09)

The `final-source` worker's IA exact-title searches were negative because bill-introduction
gazettes are filed by issue, not title. The killed worker had downloaded all **2,818** Gazette of
India EXTRAORDINARY issue full-texts of the IA `in.gazette` collection (years 1966, 1971–75;
`probe_ik3/ia/gaztxt/`) before being interrupted. This scan completed the work: every issue text
was searched for `A Bill further to amend the Constitution of India` + ordinal short-title clauses,
and each hit was clause-matched to `AMENDMENTS/AMENDMENT_NN_ACT.txt`.

- **35 gazette issues** contain constitution-bill text (~40 bills total). **11 are the bills behind
  the missing acts 21, 24–26, 28–30, 33–34, 37–38** — all Gazette of India EXTRAORDINARY
  Part II—Section 2 (bills introduced in Parliament), verified via pdftotext (text layer present →
  `.txt` produced) + operative-clause cross-check. Integrated from `https://archive.org/download/<item>/<pdf>`:

| # | Bill (as printed in the gazette) | IA item | Issue date | Pages | bill_url |
|---|----------------------------------|---------|-----------|-------|----------|
| 21 | Constitution (Twenty-second Amendment) Bill, 1966 (RS Bill No. XXIV) — Sindhi, Eighth Sched. | in.gazette.e.1966.533 | 21-Nov-1966 (RS) | 1–2 | https://archive.org/download/in.gazette.e.1966.533/E-1709-1966-0060-77524.pdf |
| 24 | Constitution (Twenty-fourth Amendment) Bill, 1971 (LS Bill No. 105) — art 13(4), 368 | in.gazette.e.1971.318 | 28-Jul-1971 | 1–3 | https://archive.org/download/in.gazette.e.1971.318/E-1383-1971-0035-61664.pdf |
| 25 | Constitution (Twenty-fifth Amendment) Bill, 1971 (LS Bill No. 106) — art 31(2) | in.gazette.e.1971.318 | 28-Jul-1971 | 4–6 | https://archive.org/download/in.gazette.e.1971.318/E-1383-1971-0035-61664.pdf |
| 26 | Constitution (Twenty-sixth Amendment) Bill, 1971 (LS Bill No. 112) — arts 291/362, 363A | in.gazette.e.1971.324 | 09-Aug-1971 | 1–3 | https://archive.org/download/in.gazette.e.1971.324/E-1383-1971-0041-61670.pdf |
| 28 | Constitution (Thirty-first Amendment) Bill, 1972 (LS Bill No. 55) — new 312A, omit 314 | in.gazette.e.1972.386 | 26-May-1972 | 8–10 | https://archive.org/download/in.gazette.e.1972.386/E-1344-1972-0026-59738.pdf |
| 29 | Constitution (Thirty-second Amendment) Bill, 1972 (LS Bill No. 56) — Kerala entries 65/66 | in.gazette.e.1972.386 | 26-May-1972 | 11–12 | https://archive.org/download/in.gazette.e.1972.386/E-1344-1972-0026-59738.pdf |
| 30 | Constitution (Thirtieth Amendment) Bill, 1972 (LS Bill No. 53) — art 133(1) | in.gazette.e.1972.384 | 24-May-1972 | 1–4 | https://archive.org/download/in.gazette.e.1972.384/E-1344-1972-0025-59736.pdf |
| 33 | Constitution (Thirty-fifth Amendment) Bill, 1974 (LS Bill No. 52) — art 101(3) resignation | in.gazette.e.1974.369 | 03-May-1974 | 4–6 | https://archive.org/download/in.gazette.e.1974.369/E-1273-1974-0022-56317.pdf |
| 34 | Constitution (Thirty-fourth Amendment) Bill, 1974 — Ninth Schedule entries 65–83 | in.gazette.e.1974.369 | 03-May-1974 | 1–3 | https://archive.org/download/in.gazette.e.1974.369/E-1273-1974-0022-56317.pdf |
| 37 | Constitution (Thirty-seventh Amendment) Bill, 1975 (LS Bill No. 32) — art 239A/240 Arunachal | in.gazette.e.1975.313 | 09-Apr-1975 | 1–2 | https://archive.org/download/in.gazette.e.1975.313/E-1241-1975-0019-54657.pdf |
| 38 | Constitution (Thirty-ninth Amendment) Bill, 1975 (LS Bill No. 54) — conclusive-satisfaction clauses | in.gazette.e.1975.326 | 22-Jul-1975 | 5–9 | https://archive.org/download/in.gazette.e.1975.326/E-1242-1975-0032-54670.pdf |

ACT SORs confirm the bill identities verbatim (21 ← 22nd Bill 1966 No. XXIV; 28 ← 31st Bill 1972
No. 55; 29 ← 32nd Bill 1972; 32nd-act bill = 33rd Bill 1973 — not in collection; 33 ← 35th Bill
1974; 34 ← 34th Bill 1974; 36 ← 38th Bill 1975 — not in collection; 37 ← 37th Bill 1975;
38 ← 39th Bill 1975). Integrated as `AMENDMENTS/AMENDMENT_NN_BILL.pdf` + `.txt` (text layer);
`docs/amendments.csv` rows 21/24/25/26/28/29/30/33/34/37/38 → `status=OK`.

**Lapsed bills in the collection (rejected, ledger only):** 1966 Bills 78 (art 324A), 79 (art 370),
80; 1966.556 = 23rd Bill 1966 No. 89 = the 20th act's bill (**duplicate** of the sansad integration,
not re-added); 1971 Bill XXV (art 37), Bill 136, and the arts-16/19/143/145/226 bills (1971.322);
1972 Bills 120 (arts 63A/66A), 6 (arts 93/178/182), RS I/II (art 16(6)), 7 (art 74(1) advice —
42nd-act predecessor), 9, 10 (Eighth Sched.), 14 (art 19(1)(g)), RS VII, 29 (Kerala + Kannan Devan
Ninth Sched.), 34 (art 31A(1) clarification), 82 (Bhojpuri), 30, 46 (art 335), 41, 43, 48 (art 19),
49 (art 332); 1973 Bills 12 (arts 62/65), 14 (art 130A), 40 (art 80 + Fourth Sched.), 371(2) bill;
1974 bills on arts 270(1)/171(3)(c)/352/359 (42nd-act predecessors), 343–348 language, 163/75(5)/
74(1) CoM-size, 101–102, 190(3), 54/71, "10. Pahari (Himachali)" Eighth Sched., Orissa Ninth-Sched.
entry 67; 1975 bills on art 120, 326A, Eighth-Sched. language entries, and the 41st Bill 1975
(art 361 — lapsed predecessor; row 41 stays on its sansad integration). All clause-mismatched vs
ACT txts or otherwise not acts 01–106.

**Still missing in-range (5): 31** (31st Bill 1973 No. 31 — no art-81/330/332 bill gazette in the
collection), **32** (33rd Bill 1973 — only the enacted 32nd ACT gazette in.gazette.e.1974.296 is
present), **35** (36th Bill 1974, Sikkim associate), **36** (38th Bill 1975, Sikkim full state),
**39** (40th Bill 1975, art 329A) — no Sikkim/329A/fortieth bill gazette anywhere in the 2,818 files.

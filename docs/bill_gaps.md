# Bill gaps — amendments 01–96 (as of 2026-08-07)

Provenance ledger for the `status = MISSING_BILL` rows in `docs/amendments.csv`, so the hunt is not
repeated. Source: `docs/backfill_report.md` (worker report, 2026-08-07, converted from CSV) —
no separate notes file was produced by that worker; this file preserves the URL-attempt
provenance verbatim.

## Summary

- **106 amendments total; act coverage 100%** — every amendment 01–106 has a downloaded Act PDF
  (`AMENDMENTS/AMENDMENT_NN_ACT.pdf`), verified `%PDF` + content.
- **Bill coverage: 15/106** — amendments 01, 03, 16 (pre-1997 era), 095–096 (era-C sweep, see the
  2026-08-08 section below) and 097–106 (downloaded by the 97–106 worker; see
  `docs/amendments_new_report.md`).
- **94 bills missing (01–96 except 03 and 16)**: `bill_file = MISSING`, `bill_url = MISSING` in
  `docs/amendments.csv`. Pre-1997 Parliament bill PDFs are largely not on the open web; the sources
  tried below returned no usable copy.

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
the act texts, and integrated. Bill coverage is now **27/106** (01, 03, 16, 077, 081, 083, 085–094,
095–106). Remaining missing: 02, 04–15, 17–76, 78–80, 82, 84, 89 (80 rows).

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

- **89th act's bill** (art 338 National Commission for SCs, act 28-Sep-2003): no matching bill
  gazette in the egazette DB (2003 sweep: 27 constitution rows, none amends art 338).
- 74–76, 78–80, 82, 84: DB coverage starts at 1994; 1994–2001 sweeps produced no bill matching
  these acts (82nd act 2000's bill not in DB; 84th act 2001 delimitation bill not in DB).
- Pre-1994 bills (02, 04–15, 17–74): egazette search DB has no bill gazettes before 1994.

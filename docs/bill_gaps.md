# Bill gaps — amendments 01–96 (as of 2026-08-07)

Provenance ledger for the `status = MISSING_BILL` rows in `docs/amendments.csv`, so the hunt is not
repeated. Source: `docs/backfill_report.md` (worker report, 2026-08-07, converted from CSV) —
no separate notes file was produced by that worker; this file preserves the URL-attempt
provenance verbatim.

## Summary

- **106 amendments total; act coverage 100%** — every amendment 01–106 has a downloaded Act PDF
  (`AMENDMENTS/AMENDMENT_NN_ACT.pdf`), verified `%PDF` + content.
- **Bill coverage: 12/106** — amendments 03, 16 (pre-1997 era) and 097–106 (downloaded by the
  97–106 worker; see `docs/amendments_new_report.md`).
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

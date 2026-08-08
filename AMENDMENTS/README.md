# AMENDMENTS/

Act PDFs for all **106** constitutional amendments, plus Bill PDFs for **74** of them,
recovered 2026-08-08 from sansad.in's LS/RS bills API (1952–2026), egazette.gov.in, eparlib
and PRS. Every act and text-bearing bill also has a plain-text twin
(`AMENDMENT_NN_ACT.txt` / `AMENDMENT_NN_BILL.txt`) — the site's "Text" views read those.

- **Naming**: `AMENDMENT_NN_ACT.pdf` / `AMENDMENT_NN_BILL.pdf`, zero-padded — two digits for
  01–96, three digits for 097–106 (e.g. `AMENDMENT_01_ACT.pdf`, `AMENDMENT_097_ACT.pdf`).
- **Coverage**: 106/106 Acts present; every act is %PDF-verified (>10 KB) and content-checked.
- **Plain text**: 106/106 acts have text — 99 extracted from the PDFs plus the 7 scan-only
  acts (94, 96, 097, 098, 102, 103, 105) transcribed from Indian Kanoon; all 74 bills
  have text — the 29 scan-only bills were transcribed via vision-model OCR
  (logs in `../probe_ik4/ocr_log.json`).
- **Missing bills**: the 32 bills not yet located (21, 24–26, 28–39, 46, 48–51, 56–59, 62, 70,
  78–80, 84, 89) are tracked with their provenance in `../docs/bill_gaps.md`; each row's
  `status = MISSING_BILL` in `../docs/amendments.csv`.
- **Sources**: per-file download URLs and names live in `../docs/amendments.csv` (machine
  source) and `../docs/amendments-table.md` (human-readable view).

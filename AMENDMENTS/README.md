# AMENDMENTS/

Act PDFs for all **106** constitutional amendments, plus Bill PDFs for the **12** where a bill
was located (03, 16, 097–106).

- **Naming**: `AMENDMENT_NN_ACT.pdf` / `AMENDMENT_NN_BILL.pdf`, zero-padded — two digits for
  01–96, three digits for 097–106 (e.g. `AMENDMENT_01_ACT.pdf`, `AMENDMENT_097_ACT.pdf`).
- **Coverage**: 106/106 Acts present; every act is %PDF-verified (>10 KB) and content-checked
  (`verify_repo.py` checks b + d).
- **Missing bills**: the 94 bills not yet located (01–96 except 03 and 16) are tracked with
  their provenance in `../docs/bill_gaps.md`; each row's `status = MISSING_BILL` in
  `../docs/amendments.csv`.
- **Sources**: per-file download URLs and names live in `../docs/amendments.csv` (machine
  source) and `../docs/amendments.md` (human-readable view); fetch new files with
  `python ../download_amendments.py`.

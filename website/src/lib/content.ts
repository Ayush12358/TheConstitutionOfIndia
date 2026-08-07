// Pure, dependency-free helpers extracted from src/index.ts so the server's
// string/number logic is unit-testable (see website/test/content.test.ts).

// Tiny RFC4180 CSV parser: quoted fields may contain commas, "" escapes a
// quote, and lines starting with '#' are comments (skipped). No dependencies.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Amendment PDFs are named AMENDMENT_NN_<KIND>.pdf: 2-digit zero-padded for
// n <= 96, 3-digit for n > 96 (e.g. AMENDMENT_96_ACT.pdf, AMENDMENT_106_ACT.pdf).
// n is int-only and kind is a fixed union, so the derived name can never
// contain path separators — repo-root containment is checked in index.ts
// where the name is resolved against the filesystem.
export function amendmentPdfName(kind: "act" | "bill", n: number): string {
  const padded = n <= 96 ? String(n).padStart(2, "0") : String(n).padStart(3, "0");
  return `AMENDMENT_${padded}_${kind.toUpperCase()}.pdf`;
}

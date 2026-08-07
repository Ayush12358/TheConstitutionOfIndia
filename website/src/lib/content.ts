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

// The 39 content keys -> repo-root-relative markdown paths, shared by the
// server (src/index.ts), the static build (build.ts), and the payload builder
// below. Keys are never derived from a request path.
export const CONTENT_MAP: Record<string, string> = {
  preamble: "PREAMBLE/Preamble.md",
  part1: "PART_1/PART1.md",
  part2: "PART_2/PART2.md",
  part3: "PART_3/PART3.md",
  part4: "PART_4/PART4.md",
  part4a: "PART_4_A/PART4A.md",
  part5: "PART_5/PART5.md",
  part6: "PART_6/PART6.md",
  part7: "PART_7/PART7.md",
  part8: "PART_8/PART8.md",
  part9: "PART_9/PART9.md",
  part9a: "PART_9_A/PART9A.md",
  part9b: "PART_9_B/PART9B.md",
  part10: "PART_10/PART10.md",
  part11: "PART_11/PART11.md",
  part12: "PART_12/PART12.md",
  part13: "PART_13/PART13.md",
  part14: "PART_14/PART14.md",
  part14a: "PART_14_A/PART14A.md",
  part15: "PART_15/PART15.md",
  part16: "PART_16/PART16.md",
  part17: "PART_17/PART17.md",
  part18: "PART_18/PART18.md",
  part19: "PART_19/PART19.md",
  part20: "PART_20/PART20.md",
  part21: "PART_21/PART21.md",
  part22: "PART_22/PART22.md",
  schedule1: "SCHEDULE_1/SCHEDULE1.md",
  schedule2: "SCHEDULE_2/SCHEDULE2.md",
  schedule3: "SCHEDULE_3/SCHEDULE3.md",
  schedule4: "SCHEDULE_4/SCHEDULE4.md",
  schedule5: "SCHEDULE_5/SCHEDULE5.md",
  schedule6: "SCHEDULE_6/SCHEDULE6.md",
  schedule7: "SCHEDULE_7/SCHEDULE7.md",
  schedule8: "SCHEDULE_8/SCHEDULE8.md",
  schedule9: "SCHEDULE_9/SCHEDULE9.md",
  schedule10: "SCHEDULE_10/SCHEDULE10.md",
  schedule11: "SCHEDULE_11/SCHEDULE11.md",
  schedule12: "SCHEDULE_12/SCHEDULE12.md",
};

// Title of a markdown file: the first "# " heading line, else the fallback key.
export function titleOf(markdown: string, fallback: string): string {
  const line = markdown.split("\n").find(l => l.startsWith("# "));
  return line ? line.slice(2).trim() : fallback;
}

// One row of docs/amendments.csv mapped to its payload shape. act_url/bill_url
// are taken verbatim from the CSV (a missing link stays the literal "MISSING");
// has_bill is derived from the status column ("MISSING_BILL" -> no bill file).
export type Amendment = {
  number: string;
  title: string;
  assent_date: string;
  key_changes: string;
  status: string;
  has_bill: boolean;
  act_url: string;
  bill_url: string;
};

// CSV columns: number,title,assent_date,key_changes,bill_file,act_file,
// bill_url,act_url,zip_file,status. Comment/header filtering happens in the
// callers (loadAmendments in src/index.ts, build.ts) before this mapping.
export function parseAmendments(rows: string[][]): Amendment[] {
  return rows.map(r => {
    const [number = "", title = "", assent_date = "", key_changes = "", , , bill_url = "", act_url = "", , status = ""] = r;
    return {
      number,
      title,
      assent_date,
      key_changes,
      status,
      has_bill: status !== "MISSING_BILL",
      act_url,
      bill_url,
    };
  });
}

// The static payload: build.ts writes it to dist/content.json at build time
// and the server serves the identical shape at GET /content.json (same
// builder, same CONTENT_MAP — only `generated` differs). The App consumes
// exactly this, so the static site needs zero API calls.
export type ContentPayload = {
  generated: string;
  preamble: { key: string; title: string; markdown: string };
  index: { key: string; title: string }[];
  contents: Record<string, string>;
  amendments: Amendment[];
  // Plain text of every act (and surviving bill), keyed by manifest number
  // ("01"…"106"). Empty string = no text available (scan-only PDF).
  act_texts: Record<string, string>;
  bill_texts: Record<string, string>;
};

export function buildPayload(
  markdowns: Record<string, string>,
  amendments: Amendment[],
  actTexts: Record<string, string>,
  billTexts: Record<string, string>,
  generated?: string,
): ContentPayload {
  const index = Object.keys(CONTENT_MAP).map(key => ({
    key,
    title: titleOf(markdowns[key] ?? "", key),
  }));
  return {
    generated: generated ?? new Date().toISOString(),
    preamble: {
      key: "preamble",
      title: titleOf(markdowns.preamble ?? "", "preamble"),
      markdown: markdowns.preamble ?? "",
    },
    index,
    contents: markdowns,
    amendments,
    act_texts: actTexts,
    bill_texts: billTexts,
  };
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

// Plain-text twin of the PDF: AMENDMENT_NN_ACT.txt / AMENDMENT_NN_BILL.txt in
// ../AMENDMENTS (extracted from the PDFs; scanned originals were sourced from
// Indian Kanoon). Same padding rule as the PDF name.
export function amendmentTextName(kind: "act" | "bill", n: number): string {
  return amendmentPdfName(kind, n).replace(/\.pdf$/, ".txt");
}

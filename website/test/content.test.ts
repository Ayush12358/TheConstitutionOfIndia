import { describe, expect, test } from "bun:test";
import {
  amendmentPdfName,
  buildPayload,
  CONTENT_MAP,
  parseAmendments,
  parseCSV,
  type Amendment,
} from "../src/lib/content";

describe("parseCSV", () => {
  test("simple unquoted fields", () => {
    expect(parseCSV("a,b,c")).toEqual([["a", "b", "c"]]);
  });

  test("quoted field with embedded comma", () => {
    expect(parseCSV('a,"x,y",c')).toEqual([["a", "x,y", "c"]]);
  });

  test('escaped quotes (RFC4180 "")', () => {
    expect(parseCSV('a,"say ""hi""",c')).toEqual([["a", 'say "hi"', "c"]]);
  });

  test("'#' lines pass through as rows; comment-skipping lives in loadAmendments", () => {
    // parseCSV itself is a raw RFC4180 splitter: the manifest layer
    // (loadAmendments in src/index.ts) filters out '#' comment rows.
    expect(parseCSV("# comment\na,b")).toEqual([["# comment"], ["a", "b"]]);
  });

  test("CRLF line endings", () => {
    expect(parseCSV("a,b\r\nc,d")).toEqual([["a", "b"], ["c", "d"]]);
  });

  test("single trailing newline adds no empty row", () => {
    expect(parseCSV("a,b\n")).toEqual([["a", "b"]]);
  });

  test("trailing empty lines yield an empty row (filtered at the manifest layer)", () => {
    expect(parseCSV("a,b\n\n")).toEqual([["a", "b"], [""]]);
  });

  test("real docs/amendments.csv parses to exactly 106 data rows", async () => {
    // Mirrors loadAmendments: drop '#' comments and the "number,..." header.
    const text = await Bun.file("../docs/amendments.csv").text();
    const rows = parseCSV(text).filter(r => r.length > 0 && !r[0].startsWith("#"));
    const data = rows[0]?.[0] === "number" ? rows.slice(1) : rows;
    expect(data).toHaveLength(106);
  });
});

describe("buildPayload", () => {
  const amendments: Amendment[] = [
    {
      number: "01",
      title: "The Constitution (First Amendment) Act, 1951",
      assent_date: "1951-06-18",
      key_changes: "Amended Articles 15, 19…",
      status: "MISSING_BILL",
      has_bill: false,
      act_url: "https://example.com/act.pdf",
      bill_url: "MISSING",
    },
  ];

  test("39-key index, titles from first '# ' line, fallback to key", () => {
    const payload = buildPayload(
      { preamble: "# PREAMBLE\nWE, THE PEOPLE…", part3: "# PART III FUNDAMENTAL RIGHTS\n## 12. Definition.—" },
      amendments,
      "2026-08-07T00:00:00.000Z",
    );
    expect(payload.generated).toBe("2026-08-07T00:00:00.000Z");
    expect(payload.index).toHaveLength(39);
    expect(payload.index[0]).toEqual({ key: "preamble", title: "PREAMBLE" });
    expect(payload.index.find(i => i.key === "part3")?.title).toBe("PART III FUNDAMENTAL RIGHTS");
    // Missing markdown → title falls back to the key, key still listed.
    expect(payload.index.find(i => i.key === "schedule12")?.title).toBe("schedule12");
    // contents mirrors the markdowns map passed in; index is the full CONTENT_MAP.
    expect(Object.keys(payload.contents)).toEqual(["preamble", "part3"]);
  });

  test("preamble + amendments pass through verbatim (act_url/bill_url kept as-is)", () => {
    const payload = buildPayload({ preamble: "# PREAMBLE\nX" }, amendments, "2026-08-07T00:00:00.000Z");
    expect(payload.preamble).toEqual({ key: "preamble", title: "PREAMBLE", markdown: "# PREAMBLE\nX" });
    expect(payload.amendments).toEqual(amendments);
    expect(payload.amendments[0].act_url).toBe("https://example.com/act.pdf");
    expect(payload.amendments[0].bill_url).toBe("MISSING");
  });

  test("parseAmendments maps CSV columns to the payload shape", () => {
    const rows = [
      ["01", "Title", "1951-06-18", "changes", "MISSING", "AMENDMENT_01_ACT.pdf", "MISSING", "https://a/1.pdf", "z.zip", "MISSING_BILL"],
      ["02", "Title2", "1953-05-01", "changes", "MISSING", "AMENDMENT_02_ACT.pdf", "MISSING", "https://a/2.pdf", "z.zip", "OK"],
    ];
    expect(parseAmendments(rows)).toEqual([
      { number: "01", title: "Title", assent_date: "1951-06-18", key_changes: "changes", status: "MISSING_BILL", has_bill: false, act_url: "https://a/1.pdf", bill_url: "MISSING" },
      { number: "02", title: "Title2", assent_date: "1953-05-01", key_changes: "changes", status: "OK", has_bill: true, act_url: "https://a/2.pdf", bill_url: "MISSING" },
    ]);
  });
});

describe("amendmentPdfName", () => {
  test("2-digit zero-padding for n <= 96", () => {
    expect(amendmentPdfName("act", 1)).toBe("AMENDMENT_01_ACT.pdf");
    expect(amendmentPdfName("act", 96)).toBe("AMENDMENT_96_ACT.pdf");
  });

  test("3-digit zero-padding for n > 96", () => {
    expect(amendmentPdfName("act", 97)).toBe("AMENDMENT_097_ACT.pdf");
    expect(amendmentPdfName("act", 106)).toBe("AMENDMENT_106_ACT.pdf");
  });

  test("kind bill", () => {
    expect(amendmentPdfName("bill", 1)).toBe("AMENDMENT_01_BILL.pdf");
    expect(amendmentPdfName("bill", 106)).toBe("AMENDMENT_106_BILL.pdf");
  });

  test("invariant: n is int-only, so no crafted input can inject path components", () => {
    // The filename is derived from a number plus a fixed "act" | "bill" union,
    // so escaping repoRoot is impossible by construction — the name can never
    // contain a path separator or "..". The containment check in index.ts is
    // defense in depth on top of that (route also rejects non-integer n < 1).
    for (const bad of [-5, 0, 1.5, 107, 999, Number.NaN]) {
      expect(amendmentPdfName("act", bad)).not.toMatch(/[/\\]|\.\./);
    }
  });
});

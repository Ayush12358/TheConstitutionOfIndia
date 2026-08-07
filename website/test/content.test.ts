import { describe, expect, test } from "bun:test";
import { amendmentPdfName, parseCSV } from "../src/lib/content";

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

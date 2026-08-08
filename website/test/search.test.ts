import { describe, expect, test } from "bun:test";
import { searchRecords, type SearchRecord } from "../src/lib/search";

describe("searchRecords", () => {
  test("plain substring match, anywhere in a line", () => {
    const records: SearchRecord[] = [
      { id: "part9b", title: "Part IXB", text: "line one\nco-operative societies are governed here\nline three", kind: "constitution" },
    ];
    const hits = searchRecords(records, "co-operative");
    expect(hits).toHaveLength(1);
    expect(hits[0]!).toEqual({
      id: "part9b",
      title: "Part IXB",
      kind: "constitution",
      snippet: "co-operative societies are governed here",
    });
  });

  test("case-insensitive both ways", () => {
    const records: SearchRecord[] = [
      { id: "a", title: "A", text: "Secular State", kind: "constitution" },
      { id: "b", title: "B", text: "plain text", kind: "constitution" },
    ];
    expect(searchRecords(records, "SECULAR")).toHaveLength(1);
    expect(searchRecords(records, "secular")).toHaveLength(1);
    expect(searchRecords(records, "PLAIN")).toHaveLength(1);
    expect(searchRecords(records, "missing")).toHaveLength(0);
  });

  test("sorted by match count descending", () => {
    const records: SearchRecord[] = [
      { id: "once", title: "Once", text: "tax here\ntax there\nnothing else", kind: "constitution" },
      { id: "twice", title: "Twice", text: "tax here\ntax there\ntax everywhere", kind: "constitution" },
    ];
    const hits = searchRecords(records, "tax");
    expect(hits.map(h => h.id)).toEqual(["twice", "once"]);
  });

  test("first matching line becomes the snippet; matches capped at 5", () => {
    const records: SearchRecord[] = [
      { id: "many", title: "Many", text: ["first hit line", "second hit line", "x", "x", "x", "x", "sixth hit line"].join("\n"), kind: "act" },
      { id: "few", title: "Few", text: "one hit line only", kind: "act" },
    ];
    const hits = searchRecords(records, "hit line");
    expect(hits).toHaveLength(2);
    expect(hits[0]!.id).toBe("many"); // capped count 5 still beats 1
    expect(hits[0]!.snippet).toBe("first hit line");
  });

  test("snippet trimmed to ~140 chars with ellipsis", () => {
    const long = "word ".repeat(60).trim(); // 300 chars, all one line
    const hits = searchRecords([{ id: "l", title: "L", text: long, kind: "bill" }], "word");
    expect(hits[0]!.snippet).toBe(`${long.slice(0, 140)}…`);
  });

  test("limit caps the result count", () => {
    const records: SearchRecord[] = ["a", "b", "c"].map(k => ({ id: k, title: k, text: "needle", kind: "constitution" as const }));
    expect(searchRecords(records, "needle", 2)).toHaveLength(2);
    expect(searchRecords(records, "needle")).toHaveLength(3);
  });

  test("empty, whitespace-only, and single-char queries return no hits", () => {
    const records: SearchRecord[] = [{ id: "a", title: "A", text: "needle", kind: "constitution" }];
    expect(searchRecords(records, "")).toEqual([]);
    expect(searchRecords(records, "   ")).toEqual([]);
    expect(searchRecords(records, "n")).toEqual([]);
  });

  test("multi-record search across kinds keeps kind and stable order on ties", () => {
    const records: SearchRecord[] = [
      { id: "09b", title: "Part IXB", text: "co-operative societies", kind: "constitution" },
      { id: "097", title: "Act 097: Ninety-Seventh Amendment", text: "co-operative societies\nco-operative societies", kind: "act" },
      { id: "097", title: "Bill 097: Ninety-Seventh Amendment", text: "co-operative societies", kind: "bill" },
      { id: "01", title: "Act 01: First Amendment", text: "unrelated", kind: "act" },
    ];
    const hits = searchRecords(records, "CO-OPERATIVE");
    expect(hits.map(h => `${h.kind}:${h.id}`)).toEqual(["act:097", "constitution:09b", "bill:097"]);
  });
});

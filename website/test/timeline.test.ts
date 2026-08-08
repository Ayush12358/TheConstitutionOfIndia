import { describe, expect, test } from "bun:test";
import { amendmentTimeline, articleKey } from "../src/lib/timeline";

describe("articleKey", () => {
  test("leading article numbers, including lettered articles", () => {
    expect(articleKey("12. Definition.—In this Part…")).toBe("12");
    expect(articleKey("330A. Reservation of seats for women…")).toBe("330A");
    expect(articleKey("371J. (1) The President may…")).toBe("371J");
  });

  test("non-article lines return null", () => {
    expect(articleKey("PART III FUNDAMENTAL RIGHTS")).toBeNull();
    expect(articleKey("WE, THE PEOPLE OF INDIA…")).toBeNull();
    expect(articleKey("(a) …")).toBeNull();
    expect(articleKey("")).toBeNull();
  });
});

describe("amendmentTimeline", () => {
  test("changed articles map to their amendments", () => {
    // Article 12's line changes at amendment 1 (del + add pair); article 330A
    // is inserted at amendment 7; article 13 never changes.
    const file = [
      { from: 0, text: "PART III\n12. Definition.—original text\n13. Laws inconsistent…" },
      { from: 1, text: "PART III\n12. Definition.—changed text\n13. Laws inconsistent…" },
      { from: 7, text: "PART III\n12. Definition.—changed text\n330A. Reservation of seats for women…\n13. Laws inconsistent…" },
    ];
    expect(amendmentTimeline(file)).toEqual({ "12": [1], "330A": [7] });
  });

  test("an article changed twice accumulates amendments in order", () => {
    const file = [
      { from: 0, text: "12. Definition.—original" },
      { from: 1, text: "12. Definition.—first change" },
      { from: 42, text: "12. Definition.—second change" },
    ];
    expect(amendmentTimeline(file)).toEqual({ "12": [1, 42] });
  });

  test("the first entry (from 0) has no predecessor and is skipped", () => {
    // Single-entry file: nothing to diff against.
    expect(amendmentTimeline([{ from: 0, text: "12. Definition.—original" }])).toEqual({});
  });
});

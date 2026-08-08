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

  test("body edits attribute to the heading of their paragraph", () => {
    // Amendment 1 rewrites article 19's clause (2) — the changed lines are
    // body lines, not the heading line itself, yet belong to article 19.
    const file = [
      { from: 0, text: "19. Protection of certain rights.—(1) All citizens shall have the right to free speech. (2) Old restrictions." },
      { from: 1, text: "19. Protection of certain rights.—(1) All citizens shall have the right to free speech. (2) New restrictions." },
    ];
    expect(amendmentTimeline(file)).toEqual({ "19": [1] });
  });

  test("page-number lines are never attributed", () => {
    // The "1" and "591." lines are archive page numbers, not article edits.
    const file = [
      { from: 0, text: "21. Protection of life.—No person shall be deprived of life.\n\n1\n\n22. Protection against arrest.—(1) No person shall be detained." },
      { from: 1, text: "21. Protection of life.—No person shall be deprived of life.\n\n21A. Right to education.—The State shall provide free education.\n\n22. Protection against arrest.—(1) No person shall be detained." },
    ];
    expect(amendmentTimeline(file)).toEqual({ "21A": [1] });
  });
});

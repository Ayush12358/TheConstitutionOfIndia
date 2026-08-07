import { describe, expect, test } from "bun:test";
import { diffHunks, edgeChars, lineDiff } from "../src/lib/diff";

describe("lineDiff", () => {
  test("identical texts produce only context", () => {
    const out = lineDiff("a\nb\nc", "a\nb\nc");
    expect(out.every(l => l.kind === "ctx")).toBe(true);
    expect(out).toHaveLength(3);
  });

  test("insertion in the middle", () => {
    const out = lineDiff("a\nb", "a\nX\nb");
    expect(out).toEqual([
      { kind: "ctx", text: "a" },
      { kind: "add", text: "X" },
      { kind: "ctx", text: "b" },
    ]);
  });

  test("removal", () => {
    const out = lineDiff("a\nX\nb", "a\nb");
    expect(out).toEqual([
      { kind: "ctx", text: "a" },
      { kind: "del", text: "X" },
      { kind: "ctx", text: "b" },
    ]);
  });

  test("replacement of one line", () => {
    const out = lineDiff("a\nold\nb", "a\nnew\nb");
    const kinds = out.map(l => l.kind);
    expect(kinds).toEqual(["ctx", "del", "add", "ctx"]);
  });

  test("whole-file replace when one side is empty", () => {
    expect(lineDiff("", "x\ny").map(l => l.kind)).toEqual(["add", "add"]);
    expect(lineDiff("x\ny", "").map(l => l.kind)).toEqual(["del", "del"]);
  });

  test("huge inputs fall back to a full replace (no hang)", () => {
    const big = Array.from({ length: 2000 }, (_, i) => `line ${i}`).join("\n");
    const out = lineDiff(big, big + "\nmore");
    expect(out[0]!.kind).toBe("del");
    expect(out.at(-1)?.kind).toBe("add");
  });
});

describe("diffHunks", () => {
  test("groups hunks with context and merges close changes", () => {
    const a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].join("\n");
    const b = ["1", "2", "X", "4", "5", "6", "Y", "8", "9", "10"].join("\n");
    const hunks = diffHunks(a, b, 1);
    // changes at line 3 and 7, gap of 3 > 2*1+1 → two hunks
    expect(hunks).toHaveLength(2);
    expect(hunks[0]!.del.map(l => l.text)).toEqual(["3"]);
    expect(hunks[0]!.add.map(l => l.text)).toEqual(["X"]);
    expect(hunks[1]!.del.map(l => l.text)).toEqual(["7"]);
  });

  test("close changes merge into one hunk", () => {
    const a = ["1", "2", "3", "4", "5", "6", "7"].join("\n");
    const b = ["1", "X", "3", "4", "5", "Y", "7"].join("\n");
    // gap of 3 unchanged lines ≤ 2*context with context=2 → one hunk
    expect(diffHunks(a, b, 2)).toHaveLength(1);
  });

  test("changes farther than 2*context apart split into separate hunks", () => {
    const a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].join("\n");
    const b = ["1", "X", "3", "4", "5", "6", "7", "Y", "9", "10"].join("\n");
    // gap of 5 > 2*context with context=2 → two hunks
    expect(diffHunks(a, b, 2)).toHaveLength(2);
  });

  test("hunk context is capped at the requested amount", () => {
    const a = Array.from({ length: 30 }, (_, i) => `line${i}`).join("\n");
    const b = a.replace("line10", "CHANGED");
    const hunks = diffHunks(a, b, 2);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.ctx.length).toBeLessThanOrEqual(4); // 2 before + 2 after
  });
});

describe("edgeChars", () => {
  test("common prefix and suffix are trimmed, middle kept", () => {
    const { pre, post } = edgeChars("the quick brown fox", "the slow brown fox");
    expect(pre).toBe(4); // "the "
    expect(post).toBe(10); // " brown fox" — the space before "brown" also matches
  });

  test("no common chars", () => {
    expect(edgeChars("abc", "xyz")).toEqual({ pre: 0, post: 0 });
  });

  test("identical strings", () => {
    expect(edgeChars("same", "same")).toEqual({ pre: 4, post: 0 });
  });

  test("prefix and suffix must not overlap", () => {
    const { pre, post } = edgeChars("ab", "ab");
    expect(pre + post).toBeLessThanOrEqual(Math.min(2, 2));
  });
});

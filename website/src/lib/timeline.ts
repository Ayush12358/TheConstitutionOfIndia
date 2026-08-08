import { lineDiff } from "./diff";

// Leading article identifier of a line of history text: "12. Definition.—…" →
// "12", "330A. Reservation of seats for women…" → "330A", "371J. (1) The…" →
// "371J". Lines that don't start an article ("PART III…", blank, "(a) …") → null.
export function articleKey(line: string): string | null {
  const m = /^(\d+[A-Z]*)(?=[.\s])/.exec(line);
  return m?.[1] ?? null;
}

// Page-number lines that survive in the archive texts ("1", "591.", "173") —
// they are not article headings and must never be attributed to one.
const PAGE_NUMBER = /^\d{1,4}\.?\s*$/;

// Article → amendments that changed it, derived from a history file (the
// deduped [{from, text}] versions per content key): diff each version against
// its predecessor and attribute every changed line (del + add) to an article.
// A line that itself starts an article heading owns its key; anything else
// belongs to the heading of the paragraph it sits in (the walk tracks the most
// recent heading line, so body edits — clause rewrites etc. — land on their
// article). Page-number lines are skipped outright. `from` values ascend in
// file order, so the lists come out ascending; the first entry (the original
// text, from 0) has no predecessor and is skipped. A key is recorded once per
// amendment — a changed heading shows up as a del+add pair, not two chips.
export function amendmentTimeline(file: { from: number; text: string }[]): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (let i = 1; i < file.length; i++) {
    const prev = file[i - 1]!;
    const cur = file[i]!;
    const seen = new Set<string>();
    let current: string | null = null;
    for (const line of lineDiff(prev.text, cur.text)) {
      if (PAGE_NUMBER.test(line.text)) continue;
      const key = articleKey(line.text);
      if (line.kind === "ctx") {
        if (key) current = key;
        continue;
      }
      if (key) current = key;
      const k = key ?? current;
      if (k && !seen.has(k)) {
        seen.add(k);
        (out[k] ??= []).push(cur.from);
      }
    }
  }
  return out;
}

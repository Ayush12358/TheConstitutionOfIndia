// Pure, dependency-free client-side search over the /content.json payload:
// the Constitution content files plus act/bill texts. Mirrors the server's
// /api/search semantics (case-insensitive substring, no regex) and the old
// inline runSearch in App.tsx, so results for the constitution scope are
// unchanged. Unit-tested in website/test/search.test.ts.

export type SearchRecord = { id: string; title: string; text: string; kind: "constitution" | "act" | "bill" };
export type SearchHit = { id: string; title: string; kind: "constitution" | "act" | "bill"; snippet: string };

// Case-insensitive substring scan. Up to 5 matching lines per record (first
// 5; snippet = first match trimmed to ~140 chars), sorted by match count
// descending, capped at `limit`. Queries shorter than 2 characters return [].
export function searchRecords(records: SearchRecord[], q: string, limit = 20): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const found: { hit: SearchHit; count: number }[] = [];
  for (const rec of records) {
    let count = 0;
    let snippet = "";
    for (const line of rec.text.split("\n")) {
      if (!line.toLowerCase().includes(needle)) continue;
      count++;
      if (!snippet) snippet = line.length > 140 ? `${line.slice(0, 140)}…` : line;
      if (count === 5) break;
    }
    if (count > 0) {
      found.push({ hit: { id: rec.id, title: rec.title, kind: rec.kind, snippet }, count });
    }
  }
  found.sort((a, b) => b.count - a.count); // stable: ties keep record order
  return found.slice(0, limit).map(f => f.hit);
}

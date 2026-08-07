// Line-based unified diff for the git-format views (amendment diffs and the
// date-browser compare). Pure, dependency-free, unit-tested.
//
// Strategy: LCS over lines (Uint32Array DP, guarded for very large inputs),
// then the edit script is grouped into hunks with context lines. Because the
// historical states are rewrapped to a fixed width, an insertion can shift
// every later line boundary — so the UI pairs each removed/added line and
// highlights only the changed span (see edgeChars below), like
// git's diff-highlight.

export type DiffLine = { kind: "ctx" | "del" | "add"; text: string };

export type Hunk = {
  ctx: DiffLine[];
  del: DiffLine[];
  add: DiffLine[];
};

// Hard cap: beyond this the O(N*M) DP would be slow; emit one replace hunk.
const DP_LINE_LIMIT = 1500;

// Returns the edit script as a flat line list (ctx/del/add).
export function lineDiff(a: string, b: string): DiffLine[] {
  // An empty text is zero lines, not one empty line.
  const A = a === "" ? [] : a.split("\n");
  const B = b === "" ? [] : b.split("\n");
  if (A.length > DP_LINE_LIMIT || B.length > DP_LINE_LIMIT) {
    // Fallback: the whole file as one replace (still honest, just unaligned).
    return [...A.map(text => ({ kind: "del" as const, text })), ...B.map(text => ({ kind: "add" as const, text }))];
  }
  if (A.length === 0 && B.length === 0) return [];

  // LCS lengths: dp[i][j] = LCS of A[i..] and B[j..].
  const dp = new Uint32Array((A.length + 1) * (B.length + 1));
  const W = B.length + 1;
  const at = (i: number, j: number): number => dp[i * W + j] ?? 0;
  for (let i = A.length - 1; i >= 0; i--) {
    for (let j = B.length - 1; j >= 0; j--) {
      dp[i * W + j] = A[i] === B[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) {
      out.push({ kind: "ctx", text: A[i]! });
      i++;
      j++;
    } else if (at(i + 1, j) >= at(i, j + 1)) {
      out.push({ kind: "del", text: A[i]! });
      i++;
    } else {
      out.push({ kind: "add", text: B[j]! });
      j++;
    }
  }
  while (i < A.length) out.push({ kind: "del", text: A[i++]! });
  while (j < B.length) out.push({ kind: "add", text: B[j++]! });
  return out;
}

// Groups an edit script into hunks with `context` unchanged lines on each side.
// Two changes closer than 2*context lines apart share one hunk (git-style).
export function diffHunks(a: string, b: string, context = 3): Hunk[] {
  const script = lineDiff(a, b);
  const hunks: Hunk[] = [];
  let hunk: Hunk | null = null;
  let buf: DiffLine[] = []; // ctx lines since the last change

  for (const line of script) {
    if (line.kind === "ctx") {
      buf.push(line);
      if (buf.length > 2 * context + 1) {
        // gap is definitely too wide: close the open hunk, keep the tail
        if (hunk) {
          hunks.push(hunk);
          hunk = null;
        }
        buf.splice(0, buf.length - context);
      }
      continue;
    }
    if (hunk && buf.length <= 2 * context) {
      hunk.ctx.push(...buf); // gap closes: same hunk, context in between
    } else {
      if (hunk) hunks.push(hunk);
      hunk = { ctx: buf.slice(-context), del: [], add: [] };
    }
    buf = [];
    (line.kind === "del" ? hunk.del : hunk.add).push(line);
  }
  if (hunk) hunks.push(hunk);
  return hunks;
}

// Common leading/trailing char spans of a removed/added pair — the UI renders
// the middle span highlighted (diff-highlight style).
export function edgeChars(del: string, add: string): { pre: number; post: number } {
  let pre = 0;
  const max = Math.min(del.length, add.length);
  while (pre < max && del[pre] === add[pre]) pre++;
  let post = 0;
  while (post < max - pre && del[del.length - 1 - post] === add[add.length - 1 - post]) post++;
  return { pre, post };
}

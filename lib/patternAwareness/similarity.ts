import type { SavedPattern } from "./types";

function normalizeStatement(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalizeStatement(value)
      .split(" ")
      .filter((t) => t.length > 2),
  );
}

/** Jaccard-ish overlap on significant tokens. */
export function patternStatementSimilarity(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let overlap = 0;
  for (const t of A) {
    if (B.has(t)) overlap += 1;
  }
  return overlap / Math.max(A.size, B.size);
}

export function findSimilarSavedPatterns(
  statement: string,
  patterns: SavedPattern[],
  threshold = 0.4,
): SavedPattern[] {
  return patterns
    .filter((p) => p.status !== "retired")
    .filter((p) => patternStatementSimilarity(statement, p.statement) >= threshold)
    .sort(
      (a, b) =>
        patternStatementSimilarity(statement, b.statement) -
        patternStatementSimilarity(statement, a.statement),
    );
}

/** Very rough conflict heuristic for opposing time/energy claims. */
export function patternsLikelyConflict(a: SavedPattern, b: SavedPattern): boolean {
  if (a.status !== "active" || b.status !== "active") return false;
  const A = normalizeStatement(a.statement);
  const B = normalizeStatement(b.statement);
  const morning = /morning|before noon|early in the|work best early/;
  const late =
    /after 10|before 10|afternoon|evening|rarely focus|not .*morning|don'?t focus.*morning/;
  if (
    (morning.test(A) && late.test(B)) ||
    (morning.test(B) && late.test(A))
  ) {
    return true;
  }
  const few = /few(er)? priorit|one main priorit|too many/;
  const many = /many priorit|pack(ed)? day|full plate/;
  if ((few.test(A) && many.test(B)) || (few.test(B) && many.test(A))) {
    return true;
  }
  return false;
}

export function findConflictingSavedPatterns(
  patterns: SavedPattern[],
): Array<[SavedPattern, SavedPattern]> {
  const active = patterns.filter((p) => p.status === "active");
  const pairs: Array<[SavedPattern, SavedPattern]> = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const left = active[i]!;
      const right = active[j]!;
      if (patternsLikelyConflict(left, right)) {
        pairs.push([left, right]);
      }
    }
  }
  return pairs;
}

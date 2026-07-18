/**
 * Package 190 — flexible main pieces for project creation (not fixed three fields).
 */

export function normalizeProjectPieces(
  pieces: readonly string[],
): string[] {
  return pieces.map((p) => p.trim()).filter(Boolean);
}

/** Start with one empty row so the member can type immediately. */
export function emptyProjectPiecesDraft(): string[] {
  return [""];
}

export function addProjectPiece(pieces: readonly string[]): string[] {
  return [...pieces, ""];
}

export function updateProjectPiece(
  pieces: readonly string[],
  index: number,
  value: string,
): string[] {
  const next = [...pieces];
  if (index < 0 || index >= next.length) return next;
  next[index] = value;
  return next;
}

export function removeProjectPiece(
  pieces: readonly string[],
  index: number,
): string[] {
  if (pieces.length <= 1) return [""];
  return pieces.filter((_, i) => i !== index);
}

export function moveProjectPiece(
  pieces: readonly string[],
  from: number,
  to: number,
): string[] {
  if (
    from < 0 ||
    to < 0 ||
    from >= pieces.length ||
    to >= pieces.length ||
    from === to
  ) {
    return [...pieces];
  }
  const next = [...pieces];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved ?? "");
  return next;
}

export const PROJECT_PIECES_PROMPT =
  "What are the first main pieces you can already see?" as const;

export const PROJECT_INTENTION_PROMPT = "What are you working on?" as const;

export const PROJECT_PURPOSE_PROMPT =
  "What would you like this project to accomplish?" as const;

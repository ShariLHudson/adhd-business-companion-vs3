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

export type ProjectCreateFlavor = "general" | "event";

const EVENT_INTENTION_RE =
  /\b(event|workshop|retreat|summit|conference|gathering|webinar|launch party|meetup|masterclass)\b/i;

/** Detect event-planning entry from the member's opening words. */
export function detectProjectCreateFlavor(text: string): ProjectCreateFlavor {
  return EVENT_INTENTION_RE.test(text.trim()) ? "event" : "general";
}

export const EVENT_PROJECT_INTENTION_PROMPT =
  "What event are you planning?" as const;

export const EVENT_PROJECT_PURPOSE_PROMPT =
  "What should guests walk away with?" as const;

export const EVENT_PROJECT_PIECES_PROMPT =
  "What are the first pieces of the event you can already see — date, venue, guests, program?" as const;

export const EVENT_PROJECT_LEAD =
  "We'll open an Event Creation Workspace — not a generic project folder." as const;

/**
 * Events must not use the generic pieces interview.
 * Hand off to Events Intelligence / Event Creation Workspace instead.
 */
export function shouldDivertEventCreateToWorkspace(
  flavor: ProjectCreateFlavor,
): boolean {
  return flavor === "event";
}

export function projectIntentionPromptForFlavor(
  flavor: ProjectCreateFlavor,
): string {
  return flavor === "event"
    ? EVENT_PROJECT_INTENTION_PROMPT
    : PROJECT_INTENTION_PROMPT;
}

export function projectPurposePromptForFlavor(
  flavor: ProjectCreateFlavor,
): string {
  return flavor === "event"
    ? EVENT_PROJECT_PURPOSE_PROMPT
    : PROJECT_PURPOSE_PROMPT;
}

export function projectPiecesPromptForFlavor(
  flavor: ProjectCreateFlavor,
): string {
  return flavor === "event"
    ? EVENT_PROJECT_PIECES_PROMPT
    : PROJECT_PIECES_PROMPT;
}

/**
 * Spec 130 — post-create Undo window.
 * Available briefly after creation until meaningful editing begins.
 */

/** How long Undo remains available if the member has not started editing. */
export const POST_CREATE_UNDO_MS = 45_000;

export type PostCreateUndoInput = {
  createdAt: string | null | undefined;
  /** Draft body, section notes, or rename counts as meaningful. */
  hasMeaningfulEdit: boolean;
  nowMs?: number;
};

export function hasMeaningfulCreateEdit(input: {
  draftContent?: string | null;
  sectionContent?: Record<string, string | null | undefined> | null;
  discoveryAnswers?: Record<string, string | null | undefined> | null;
  /** True when member renamed away from the auto title */
  titleChangedFromAuto?: boolean;
}): boolean {
  if (input.titleChangedFromAuto) return true;
  if (input.draftContent?.trim()) return true;
  const sections = input.sectionContent ?? {};
  for (const v of Object.values(sections)) {
    if (v?.trim()) return true;
  }
  // purpose from the original request alone does not count as editing
  const answers = input.discoveryAnswers ?? {};
  for (const [key, v] of Object.entries(answers)) {
    if (key === "purpose") continue;
    if (v?.trim()) return true;
  }
  return false;
}

export function isPostCreateUndoEligible(input: PostCreateUndoInput): boolean {
  if (input.hasMeaningfulEdit) return false;
  const created = input.createdAt?.trim();
  if (!created) return false;
  const createdMs = Date.parse(created);
  if (Number.isNaN(createdMs)) return false;
  const now = input.nowMs ?? Date.now();
  return now - createdMs <= POST_CREATE_UNDO_MS;
}

export const POST_CREATE_UNDO_LABEL = "Undo create";
export const POST_CREATE_UNDO_HINT =
  "Just created — you can undo this for a short while.";

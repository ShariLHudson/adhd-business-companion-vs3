/**
 * Spec 127 — Quick Start shows today's starting point only.
 * Progressive reveal: never dump every Blueprint section at once.
 */

/** Canonical first-session focus keys (member language, not schema IDs). */
export const QUICK_START_FOCUS_LABELS = [
  "Goal",
  "Audience",
  "Purpose",
  "First Milestone",
  "First Action",
] as const;

export const QUICK_START_MAX_VISIBLE_SECTIONS = 5;

/**
 * From already depth-filtered section ids, show only the next incomplete
 * starting-point slice (max 5). Completed sections stay available for review
 * but do not flood the first screen.
 */
export function progressiveQuickStartSectionIds(input: {
  visibleSectionIds: readonly string[];
  completedSectionIds?: readonly string[];
  maxVisible?: number;
}): string[] {
  const max = input.maxVisible ?? QUICK_START_MAX_VISIBLE_SECTIONS;
  const completed = new Set(input.completedSectionIds ?? []);
  const remaining = input.visibleSectionIds.filter((id) => !completed.has(id));
  if (remaining.length === 0) {
    return input.visibleSectionIds.slice(0, max);
  }
  return remaining.slice(0, max);
}

export function quickStartFocusSummary(
  visibleCount: number,
  totalCount: number,
): string {
  if (totalCount <= visibleCount) {
    return "Here's a calm starting point for today.";
  }
  return `Showing ${visibleCount} of ${totalCount} areas — more appear as you finish these.`;
}

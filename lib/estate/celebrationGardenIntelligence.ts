/**
 * Celebration Garden (249) — moments of progress, not milestones.
 *
 * Distinct from Hall of Accomplishments (major milestones).
 * Feel: peaceful, beautiful, reflective — not an awards ceremony.
 */

export const CELEBRATION_GARDEN_PURPOSE =
  "A peaceful place where members pause to recognize progress." as const;

export const CELEBRATION_GARDEN_VS_HALL =
  "Unlike the Hall of Accomplishments, the Celebration Garden celebrates moments rather than milestones." as const;

export const CELEBRATION_GARDEN_FEEL =
  "peaceful, beautiful, and reflective—not like an awards ceremony" as const;

/** 249 — example moments worth planting */
export const CELEBRATION_GARDEN_MOMENT_EXAMPLES = [
  "Finished a difficult week",
  "Reached a weight goal",
  "Completed a course",
  "Maintained a new habit",
  "Finished a project sprint",
  "Helped someone",
  "Personal breakthroughs",
] as const;

/** Optional capture categories aligned to 249 examples */
export const CELEBRATION_GARDEN_CATEGORIES = [
  { value: "Difficult Week", label: "Finished a difficult week" },
  { value: "Health Goal", label: "Reached a weight / health goal" },
  { value: "Course", label: "Completed a course" },
  { value: "Habit", label: "Maintained a new habit" },
  { value: "Sprint", label: "Finished a project sprint" },
  { value: "Helped Someone", label: "Helped someone" },
  { value: "Breakthrough", label: "Personal breakthrough" },
  { value: "Other Moment", label: "Another moment worth naming" },
] as const;

export const CELEBRATION_GARDEN_INVITE_LINE =
  "Would you like to visit the Celebration Garden to mark this progress?" as const;

const GARDEN_MOMENT_RE =
  /\b(?:finished\s+(?:a\s+)?(?:difficult\s+)?week|hard\s+week|reached\s+(?:my\s+)?(?:weight|health)\s+goal|completed\s+(?:a\s+)?course|maintained\s+(?:a\s+)?(?:new\s+)?habit|finished\s+(?:a\s+)?(?:project\s+)?sprint|helped\s+someone|personal\s+breakthrough|went\s+well\s+this\s+week|something\s+to\s+celebrate|worth\s+celebrating)\b/i;

const HALL_MILESTONE_RE =
  /\b(?:graduated|degree|certification|published\s+(?:a\s+)?book|won\s+(?:an?\s+)?award|launched\s+(?:my\s+)?(?:business|product)|hall\s+of\s+accomplishments)\b/i;

/** Detect progress moments that belong in the garden (not Hall milestones). */
export function detectsCelebrationGardenMoment(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  if (HALL_MILESTONE_RE.test(t)) return false;
  return GARDEN_MOMENT_RE.test(t);
}

/** Soft invite — never force navigation. */
export function shouldInviteCelebrationGarden(text: string): boolean {
  return detectsCelebrationGardenMoment(text);
}

/** ADHD Design Rules — Planning Table never adds pressure */

export const PLANNING_TABLE_ADHD_FORBIDDEN = [
  "visual-clutter",
  "dashboard",
  "dense-statistics",
  "countdown-timer",
  "productivity-pressure",
  "streak-counter",
  "overdue-badge",
  "completion-percentage-hero",
] as const;

export function violatesPlanningTableAdhdRule(patternId: string): boolean {
  const normalized = patternId.trim().toLowerCase().replace(/\s+/g, "-");
  return PLANNING_TABLE_ADHD_FORBIDDEN.some(
    (f) => normalized.includes(f) || f.includes(normalized),
  );
}

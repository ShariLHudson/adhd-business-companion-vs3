/**
 * Wins Timeline (250) — chronological story of growth over months and years.
 *
 * Member-facing surface: My Journey timeline view.
 * Distinct from Celebration Garden (moments) and Hall (milestones).
 */

export const WINS_TIMELINE_PURPOSE =
  "Display a chronological story of the member's growth." as const;

export const WINS_TIMELINE_GUIDING_LINE =
  "See progress over months and years rather than isolated events." as const;

/** 250 — timeline item categories */
export const WINS_TIMELINE_ITEM_TYPES = [
  "Personal wins",
  "Business wins",
  "Family milestones",
  "Education",
  "Health progress",
  "Spiritual milestones",
  "Creative work",
] as const;

/**
 * Journey store categories mapped to Wins Timeline item types (250).
 * Keep existing JourneyCategory values; map for filters / labels.
 */
export const WINS_TIMELINE_CATEGORY_MAP = [
  { timeline: "Personal wins", journey: "Personal Life" },
  { timeline: "Personal wins", journey: "Personal Growth" },
  { timeline: "Business wins", journey: "Businesses Built" },
  { timeline: "Business wins", journey: "Career & Work" },
  { timeline: "Family milestones", journey: "Relationships" },
  { timeline: "Family milestones", journey: "Major Life Events" },
  { timeline: "Education", journey: "Education" },
  { timeline: "Health progress", journey: "Health Journey" },
  { timeline: "Spiritual milestones", journey: "Wisdom" },
  { timeline: "Spiritual milestones", journey: "Legacy" },
  { timeline: "Creative work", journey: "Challenges Overcome" },
  { timeline: "Creative work", journey: "Lessons Learned" },
] as const;

export const WINS_TIMELINE_FEATURES = [
  "Filter by year",
  "Filter by category",
  "Jump to major moments",
  "View supporting evidence",
] as const;

export function journeyCategoryToTimelineType(
  journeyCategory: string,
): (typeof WINS_TIMELINE_ITEM_TYPES)[number] | null {
  const hit = WINS_TIMELINE_CATEGORY_MAP.find(
    (row) => row.journey === journeyCategory,
  );
  return hit?.timeline ?? null;
}

export function extractYearFromIso(iso: string): number | null {
  if (!iso?.trim()) return null;
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? y : null;
}

export function listYearsFromDates(dates: readonly string[]): number[] {
  const years = new Set<number>();
  for (const d of dates) {
    const y = extractYearFromIso(d);
    if (y != null) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

export function filterEntriesByYear<T extends { date?: string; createdAt?: string; ts?: string }>(
  entries: readonly T[],
  year: number | null,
): T[] {
  if (year == null) return [...entries];
  return entries.filter((e) => {
    const iso = e.date || e.ts || e.createdAt || "";
    return extractYearFromIso(iso) === year;
  });
}

/** Major moments — milestones / life events for “jump to major moments”. */
export function isMajorTimelineMoment(category: string): boolean {
  return (
    /major\s+life|milestone|legacy|businesses?\s+built|education/i.test(
      category,
    ) || category === "Major Life Events"
  );
}

const WINS_TIMELINE_ROUTE_RE =
  /\b(?:wins?\s+timeline|my\s+wins?\s+timeline|growth\s+timeline|show\s+(?:me\s+)?(?:my\s+)?(?:wins?\s+)?timeline|open\s+(?:my\s+)?wins?\s+timeline)\b/i;

export function detectsWinsTimelineRequest(text: string): boolean {
  return WINS_TIMELINE_ROUTE_RE.test(text.trim());
}

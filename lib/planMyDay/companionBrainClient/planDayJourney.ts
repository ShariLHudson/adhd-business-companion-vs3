/**
 * Plan My Day journey chapters — one story, consistent title.
 */

export type PlanDayJourneyChapter =
  | "gateway"
  | "flexible-planning"
  | "todays-reality"
  | "todays-plan"
  | "working-together"
  | "todays-progress";

export const PLAN_MY_DAY_TITLE = "Plan My Day";

const CHAPTER_SUBTITLES: Record<PlanDayJourneyChapter, string> = {
  gateway: "Start My Day",
  "flexible-planning": "Choose Your Path",
  "todays-reality": "Today's Reality",
  "todays-plan": "Today's Plan",
  "working-together": "Working Together",
  "todays-progress": "Today's Progress",
};

export function resolvePlanDayChapter(input: {
  orienting: boolean;
  flexiblePlanning?: boolean;
  editingReality?: boolean;
  openItemId: string | null;
  detailMode?: string;
}): PlanDayJourneyChapter {
  if (input.editingReality) return "todays-reality";
  if (input.orienting) return "gateway";
  if (input.flexiblePlanning) return "flexible-planning";
  if (input.openItemId) {
    if (input.detailMode === "mark-done") return "todays-progress";
    return "working-together";
  }
  return "todays-plan";
}

export function planDayChapterSubtitle(chapter: PlanDayJourneyChapter): string {
  return CHAPTER_SUBTITLES[chapter];
}

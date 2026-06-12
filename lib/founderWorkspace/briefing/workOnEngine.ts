import type { FounderDailyBriefing } from "./founderBriefingEngine";

export type WorkOnRecommendation = {
  action: string;
  reason: string;
  navigateTo?: "issue" | "dev_experiment" | "retest" | "project";
  itemId?: string;
};

export function getWorkOnRecommendation(
  briefing: FounderDailyBriefing,
): WorkOnRecommendation {
  const suggested = briefing.suggestedAction;
  return {
    action: suggested.label,
    reason: `${briefing.todaysFocus.title} — ${briefing.todaysFocus.reason}`,
    navigateTo: suggested.navigateTo,
    itemId: suggested.issueId ?? suggested.projectId,
  };
}

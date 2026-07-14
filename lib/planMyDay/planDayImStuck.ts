/**
 * Plan My Day — I'm Stuck
 * Open existing Shari chat with one question. No wizard, no quick replies.
 */

export const PLAN_DAY_IM_STUCK_EVENT = "spark:plan-day-im-stuck";

export const PLAN_DAY_IM_STUCK_QUESTION = "What are you stuck on?";

export const PLAN_DAY_IM_STUCK_BUTTON_LABEL = "I'm Stuck";

export type PlanDayImStuckDetail = {
  itemTitles: string[];
};

export function requestPlanDayImStuck(itemTitles: string[] = []): void {
  if (typeof window === "undefined") return;
  const detail: PlanDayImStuckDetail = {
    itemTitles: itemTitles.map((t) => t.trim()).filter(Boolean),
  };
  window.dispatchEvent(
    new CustomEvent(PLAN_DAY_IM_STUCK_EVENT, { detail }),
  );
}

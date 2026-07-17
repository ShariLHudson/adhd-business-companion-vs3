/**
 * Plan My Day — I'm Stuck
 * Opens contextual help with today's plan context. No wizard, no quick replies.
 */

export const PLAN_DAY_IM_STUCK_EVENT = "spark:plan-day-im-stuck";

/** Fallback when no plan titles are available. */
export const PLAN_DAY_IM_STUCK_QUESTION =
  "You’re in Plan My Day, and it looks like choosing what comes first is the hard part. Is the problem too many tasks, not enough time, low energy, or not knowing what matters most?";

export const PLAN_DAY_IM_STUCK_BUTTON_LABEL = "I'm Stuck";

export type PlanDayImStuckDetail = {
  itemTitles: string[];
  availableTime?: string | null;
  energy?: string | null;
  motivation?: string | null;
  activeStep?: string | null;
};

export function buildPlanDayImStuckQuestion(
  detail: PlanDayImStuckDetail = { itemTitles: [] },
): string {
  const titles = detail.itemTitles.map((t) => t.trim()).filter(Boolean);
  const planLine =
    titles.length > 0
      ? ` Today’s plan includes: ${titles.slice(0, 5).join("; ")}${
          titles.length > 5 ? "…" : ""
        }.`
      : "";
  const capacityBits = [
    detail.availableTime ? `time: ${detail.availableTime}` : null,
    detail.energy ? `energy: ${detail.energy}` : null,
    detail.motivation ? `motivation: ${detail.motivation}` : null,
  ].filter(Boolean);
  const capacityLine =
    capacityBits.length > 0
      ? ` Right now you noted ${capacityBits.join(", ")}.`
      : "";

  const stage = detail.activeStep?.trim().toLowerCase() ?? "";
  if (stage === "planned" || stage === "started") {
    return `You’re looking at today’s plan.${planLine}${capacityLine} Would it help to shrink the list, pick a gentler first step, or move something to later?`;
  }
  if (stage === "constraints") {
    return `You’re shaping today’s plan.${planLine}${capacityLine} Is the hard part estimating time, naming your energy, or deciding what can wait?`;
  }
  if (titles.length > 3) {
    return `Today’s list is getting full.${planLine}${capacityLine} Would it help to choose one main focus, park a few items, or start with a five-minute win?`;
  }

  return `You’re in Plan My Day, and it looks like choosing what comes first is the hard part.${planLine}${capacityLine} Is the problem too many tasks, not enough time, low energy, or not knowing what matters most?`;
}

export function requestPlanDayImStuck(
  itemTitles: string[] = [],
  extras?: Omit<PlanDayImStuckDetail, "itemTitles">,
): void {
  if (typeof window === "undefined") return;
  const detail: PlanDayImStuckDetail = {
    itemTitles: itemTitles.map((t) => t.trim()).filter(Boolean),
    availableTime: extras?.availableTime ?? null,
    energy: extras?.energy ?? null,
    motivation: extras?.motivation ?? null,
    activeStep: extras?.activeStep ?? null,
  };
  window.dispatchEvent(
    new CustomEvent(PLAN_DAY_IM_STUCK_EVENT, { detail }),
  );
}

import type { AppSection } from "./companionUi";

export const PLAN_MY_DAY_SECTION: AppSection = "plan-my-day";

export function isPlanMyDaySection(
  section: AppSection | null | undefined,
): boolean {
  return section === PLAN_MY_DAY_SECTION;
}

/**
 * Plan My Day is its own Morning Room — never beside chat.
 */
export function shouldOpenPlanMyDayStandalone(
  section: AppSection | null | undefined,
): boolean {
  return isPlanMyDaySection(section);
}

/** @deprecated Constitutional rule — Plan My Day never opens beside chat. */
export function shouldOpenPlanMyDayBesideChat(
  _section: AppSection | null | undefined,
): boolean {
  return false;
}

import {
  isPlanItemActive,
  readTodayPlanItems,
} from "@/lib/planMyDay/planDayItems";

/** True when today already has at least one active plan item. */
export function hasActivePlanForToday(): boolean {
  return readTodayPlanItems().some(isPlanItemActive);
}

/**
 * Plan My Day — Planning Center areas.
 * One parent room; related planning responsibilities.
 */

export const PLANNING_CENTER_AREAS = [
  "today",
  "rhythms",
  "calendar",
  "upcoming",
  "parking-lot",
  "history",
] as const;

export type PlanningCenterArea = (typeof PLANNING_CENTER_AREAS)[number];

export const PLANNING_CENTER_AREA_META: Record<
  PlanningCenterArea,
  { label: string; purpose: string }
> = {
  today: {
    label: "Today",
    purpose: "What deserves attention today?",
  },
  rhythms: {
    label: "Rhythms",
    purpose: "What repeats?",
  },
  calendar: {
    label: "Calendar",
    purpose: "When are things happening?",
  },
  upcoming: {
    label: "Upcoming",
    purpose: "What should I think about soon?",
  },
  "parking-lot": {
    label: "Parking Lot",
    purpose: "What am I intentionally setting aside?",
  },
  history: {
    label: "Planning History",
    purpose: "Past plans — for retrieval when you're ready.",
  },
};

export function isPlanningCenterArea(value: string): value is PlanningCenterArea {
  return (PLANNING_CENTER_AREAS as readonly string[]).includes(value);
}

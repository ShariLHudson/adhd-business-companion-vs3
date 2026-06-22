import type { PlanningViewMode } from "./types";

export type PlanViewSectionHelp = {
  title: string;
  bullets: string[];
};

/** Section-level help for Plan My Day views — feature explanation, not workflow. */
export const PLAN_VIEW_SECTION_HELP: Partial<
  Record<PlanningViewMode, PlanViewSectionHelp>
> = {
  kanban: {
    title: "Kanban",
    bullets: [
      "Ready — planned but not started.",
      "Doing — what you're working on now (drag cards between columns).",
      "Done — completed; you get a small celebration.",
      "Parked — not today; stays on the plan without pressure.",
    ],
  },
};

export function planViewSectionHelp(
  view: PlanningViewMode,
): PlanViewSectionHelp | null {
  return PLAN_VIEW_SECTION_HELP[view] ?? null;
}

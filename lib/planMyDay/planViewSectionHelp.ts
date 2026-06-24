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
    title: "Daily workflow",
    bullets: [
      "Add tasks above the board — then decide which column they belong in.",
      "Considering Today — what is on your radar.",
      "Today's Focus — what matters most today.",
      "In Progress — what you are actively doing.",
      "Complete — tap ✓; items archive to progress history and leave the board.",
      "Use Chat Workspace → New Day's Chat when starting a fresh day — this board is intentionally temporary.",
    ],
  },
};

export function planViewSectionHelp(
  view: PlanningViewMode,
): PlanViewSectionHelp | null {
  return PLAN_VIEW_SECTION_HELP[view] ?? null;
}

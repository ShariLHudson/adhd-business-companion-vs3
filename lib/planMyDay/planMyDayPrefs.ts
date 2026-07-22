import { getPrefs, savePrefs, type Prefs } from "@/lib/companionStore";
import { suggestedViewForCapacity } from "./capacityViews";
import type { PlanningViewMode } from "./types";

const VALID_VIEWS: PlanningViewMode[] = [
  "list",
  "timeline",
  "cards",
  "kanban",
];

function isPlanningViewMode(v: unknown): v is PlanningViewMode {
  if (v === "visual-focus") return false;
  return (
    v === "list" ||
    v === "timeline" ||
    v === "cards" ||
    v === "kanban"
  );
}

export function getDefaultPlanningView(): PlanningViewMode | null {
  const v = getPrefs().defaultPlanningView;
  return isPlanningViewMode(v) ? v : null;
}

export function getLastPlanningView(): PlanningViewMode | null {
  const v = getPrefs().lastPlanningView;
  return isPlanningViewMode(v) ? v : null;
}

/** Last-used → Settings default → capacity suggestion. */
export function resolveInitialPlanningView(
  energy?: "low" | "medium" | "high" | null,
): PlanningViewMode {
  return (
    getLastPlanningView() ??
    getDefaultPlanningView() ??
    suggestedViewForCapacity(energy ?? null)
  );
}

/**
 * Settings → Planning default.
 * Also aligns last-used so Plan My Day opens with this layout
 * (last-used otherwise wins over default after in-room switches).
 */
export function setDefaultPlanningView(mode: PlanningViewMode): Prefs {
  if (!VALID_VIEWS.includes(mode)) return getPrefs();
  return savePrefs({
    defaultPlanningView: mode,
    lastPlanningView: mode,
  });
}

export function setLastPlanningView(mode: PlanningViewMode): Prefs {
  if (!VALID_VIEWS.includes(mode)) return getPrefs();
  return savePrefs({ lastPlanningView: mode });
}

export function planningViewLabel(mode: PlanningViewMode): string {
  const labels: Record<PlanningViewMode, string> = {
    list: "List",
    timeline: "Timeline",
    cards: "Cards",
    kanban: "Kanban",
  };
  return labels[mode];
}

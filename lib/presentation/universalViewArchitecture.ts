/**
 * Universal View Architecture — one data source, multiple presentation modes.
 * Plan My Day is the first consumer; Projects, Strategy Library, Evidence Vault,
 * Journal, Spark Cards, Business Estate, and Client Management should reuse this.
 *
 * Do not hard-code Plan My Day as a special case for view mode types.
 */

export type UniversalViewMode =
  | "list"
  | "cards"
  | "timeline"
  | "kanban"
  | "focus"
  | "energy";

export type UniversalViewRecommendation = {
  mode: UniversalViewMode;
  reason: string;
};

export type UniversalViewableRecord = {
  id: string;
  title: string;
  /** Optional presentation hints — engines may ignore. */
  effortBand?: string;
  energyFit?: "high" | "medium" | "low";
  priorityBand?: "highest" | "medium" | "nice";
  column?: string;
  startTime?: string;
  blocked?: boolean;
  done?: boolean;
};

/**
 * Recommend a presentation mode from day shape signals.
 * Member always retains control — this is advisory only.
 */
export function recommendUniversalView(input: {
  appointmentCount?: number;
  taskCount?: number;
  overwhelmed?: boolean;
  projectHeavy?: boolean;
  energy?: "very-low" | "low" | "steady" | "high" | null;
}): UniversalViewRecommendation {
  if (input.overwhelmed || (input.taskCount ?? 0) >= 8) {
    return {
      mode: "focus",
      reason: "When the day feels full, Focus keeps one next step clear.",
    };
  }
  if ((input.appointmentCount ?? 0) >= 3) {
    return {
      mode: "timeline",
      reason: "With several appointments, Timeline helps you see the day in order.",
    };
  }
  if (input.projectHeavy) {
    return {
      mode: "kanban",
      reason: "Project-heavy days often feel clearer in a simple Kanban board.",
    };
  }
  if (input.energy === "very-low" || input.energy === "low") {
    return {
      mode: "energy",
      reason: "On a low-energy day, Energy view puts gentler work first.",
    };
  }
  return {
    mode: "list",
    reason: "List is a calm default when you just want to see what’s next.",
  };
}

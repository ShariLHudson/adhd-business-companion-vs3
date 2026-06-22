import type { DayLevel } from "@/lib/companionStore";
import type { PlanningViewMode } from "./types";

/** Suggest a planning view from today’s capacity — never forced. */
export function suggestedViewForCapacity(
  energy: DayLevel | null | undefined,
): PlanningViewMode {
  if (energy === "low") return "list";
  if (energy === "medium") return "cards";
  return "kanban";
}

export function capacitySuggestionCopy(
  energy: DayLevel | null | undefined,
): string | null {
  if (energy === "low") {
    return "Low capacity — List keeps today simple. Open Visual Focus when you want to think spatially.";
  }
  if (energy === "medium") {
    return "Medium capacity — Card view lets you see a few things without overwhelm.";
  }
  if (energy === "high") {
    return "High capacity — Kanban or Timeline can show the bigger picture.";
  }
  return null;
}

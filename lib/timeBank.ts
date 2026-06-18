/**
 * Time Bank — unscheduled blocks stay visible here even when assigned to a project.
 * Store once, use everywhere.
 */

import type { TimeBlock } from "./companionStore";

export type TimeBankAssignmentFilter = "all" | "unassigned" | "assigned";
export type TimeBankDurationFilter = "all" | "short" | "medium" | "long";

export type TimeBankFilters = {
  assignment: TimeBankAssignmentFilter;
  projectId: string | "all";
  tag: string | "all";
  duration: TimeBankDurationFilter;
};

export const DEFAULT_TIME_BANK_FILTERS: TimeBankFilters = {
  assignment: "all",
  projectId: "all",
  tag: "all",
  duration: "all",
};

/** Unscheduled blocks — the Time Bank pool. */
export function isTimeBankBlock(block: TimeBlock): boolean {
  return !block.date;
}

export function filterTimeBankBlocks(
  blocks: TimeBlock[],
  filters: TimeBankFilters,
): TimeBlock[] {
  return blocks
    .filter((b) => {
      if (!isTimeBankBlock(b)) return false;
      if (b.status === "completed" || b.status === "missed" || b.status === "not-today") return false;
      if (filters.assignment === "unassigned" && b.projectId) return false;
      if (filters.assignment === "assigned" && !b.projectId) return false;
      if (filters.projectId !== "all" && b.projectId !== filters.projectId) {
        return false;
      }
      if (filters.tag !== "all" && b.tag !== filters.tag) return false;
      if (filters.duration === "short" && b.durationMin >= 30) return false;
      if (
        filters.duration === "medium" &&
        (b.durationMin < 30 || b.durationMin > 60)
      ) {
        return false;
      }
      if (filters.duration === "long" && b.durationMin <= 60) return false;
      return true;
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

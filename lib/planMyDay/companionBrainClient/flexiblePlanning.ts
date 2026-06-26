/**
 * Flexible Planning Mode™ — presentation and context (no reasoning).
 */

import type { CompanionJudgmentResult } from "@/lib/companionBrain";
import { getProjects, getTimeBlocks, todayStr } from "@/lib/companionStore";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { readParkingLotPlanItems } from "@/lib/planMyDay/planDayItems";
import { proposalPreviewLabels } from "./presentJudgment";

export const FLEXIBLE_PLANNING_INTRO = [
  "That's completely okay.",
  "These are simply my suggestions.",
  "Let's build today your way.",
] as const;

export const FLEXIBLE_SUGGESTIONS_HINT =
  "You don't have to use these. They're here if they're helpful.";

export type FlexiblePlanningProject = {
  id: string;
  name: string;
  status?: string;
};

export type FlexiblePlanningCalendarEvent = {
  id: string;
  title: string;
  timeLabel: string;
};

export type FlexiblePlanningContext = {
  suggestionLabels: string[];
  suggestionCount: number;
  parkingLot: PlanDayItem[];
  projects: FlexiblePlanningProject[];
  calendarEvents: FlexiblePlanningCalendarEvent[];
  heldItems: PlanDayItem[];
  upcomingItems: PlanDayItem[];
  morePossibilityCount: number;
};

function formatBlockTime(start: string, durationMin: number): string {
  if (!start) return "Anytime";
  const [h, m] = start.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + durationMin;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  return `${start} – ${end}`;
}

export function gatherFlexiblePlanningContext(
  items: PlanDayItem[],
  judgment: CompanionJudgmentResult,
): FlexiblePlanningContext {
  const today = todayStr();
  const suggestionLabels = proposalPreviewLabels(judgment);
  const parkingLot = readParkingLotPlanItems();
  const projects = getProjects()
    .filter((p) => p.status !== "completed")
    .slice(0, 8)
    .map((p) => ({ id: p.id, name: p.name, status: p.status }));

  const calendarEvents = getTimeBlocks()
    .filter((b) => b.date === today)
    .slice(0, 8)
    .map((b) => ({
      id: b.id,
      title: b.title,
      timeLabel: formatBlockTime(b.startTime, b.durationMin),
    }));

  const heldItems = items.filter((i) => !i.done && i.column === "parked");
  const upcomingItems = items.filter(
    (i) =>
      !i.done &&
      i.dueDate &&
      i.dueDate >= today &&
      i.dueDate <= addDays(today, 7),
  );

  return {
    suggestionLabels,
    suggestionCount: suggestionLabels.length,
    parkingLot,
    projects,
    calendarEvents,
    heldItems,
    upcomingItems,
    morePossibilityCount: heldItems.length + upcomingItems.length,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

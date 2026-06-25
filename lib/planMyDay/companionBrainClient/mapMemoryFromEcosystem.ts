/**
 * Map ecosystem memory (Adapt My Day, plan items, captures) → Companion Brain™ input.
 * Experience layer only — brain never imports companionStore or planMyDay internals.
 */

import type { DayState } from "@/lib/companionStore";
import {
  createDefaultCompanionBrainState,
  readCompanionBrainState,
  type CapacitySnapshot,
  type CompanionCandidate,
  type CompanionMemorySnapshot,
  type EnergyLevel,
  type MotivationLevel,
} from "@/lib/companionBrain";
import type { PlanDayItem } from "@/lib/planMyDay/types";

export type EcosystemMemoryInput = {
  dayKey: string;
  dayState: DayState | null;
  planItems?: PlanDayItem[];
  thoughtCount?: number;
  recentCaptures?: string[];
  exclusions?: string[];
  suppressTopics?: string[];
  yesterdaySummary?: string;
  focusAreas?: string[];
  hyperfocusActive?: boolean;
  hyperfocusMinutes?: number;
  userDeclaredSurvival?: boolean;
  activeCooldowns?: Array<"celebration" | "survival">;
};

function mapEnergy(dayState: DayState | null): EnergyLevel {
  const id = dayState?.energyLevel;
  if (id === "off-charts" || id === "full-tank") return "high";
  if (id === "ready-to-roll") return "medium-high";
  if (id === "doing-okay") return "medium";
  if (id === "running-on-fumes") return "low";
  if (id === "need-recharge") return "low";
  const legacy = dayState?.energy;
  if (legacy === "high") return "high";
  if (legacy === "medium") return "medium";
  return "low";
}

function mapMotivation(dayState: DayState | null): MotivationLevel {
  const id = dayState?.motivationLevel;
  if (id === "cant-wait") return "excited";
  if (id === "lets-do-this") return "focused";
  if (id === "get-it-done") return "steady";
  if (id === "need-push") return "scattered";
  if (id === "dragging") return "low";
  if (id === "not-happening") return "overwhelmed";
  const legacy = dayState?.overwhelm;
  if (legacy === "high") return "overwhelmed";
  if (legacy === "medium") return "scattered";
  return "steady";
}

function mapVibe(
  dayState: DayState | null,
): CapacitySnapshot["vibe"] | undefined {
  const vibe = dayState?.vibe;
  if (vibe === "rough-day" || vibe === "struggling") return "foggy";
  if (vibe === "feeling-good" || vibe === "doing-okay") return "focused";
  if (vibe === "mixed-bag") return "scattered";
  return undefined;
}

function priorityToFit(priority?: PlanDayItem["priority"]): number {
  if (priority === "high") return 0.85;
  if (priority === "medium") return 0.65;
  return 0.45;
}

function planItemToCandidate(item: PlanDayItem): CompanionCandidate {
  const themes: string[] = [];
  if (item.category === "health") themes.push("health");
  if (item.category === "relationships") themes.push("courtesy");
  if (item.category === "business") themes.push("unlock");
  if (item.column === "doing") themes.push("active");
  return {
    id: item.id,
    label: item.title,
    source: item.projectId ? "project" : "plan",
    themes,
    estimatedMinutes: item.durationMinutes,
    unlockScore: item.column === "today" ? 0.8 : 0.5,
    fitScore: priorityToFit(item.priority),
  };
}

export function mapEcosystemToCompanionMemory(
  input: EcosystemMemoryInput,
): CompanionMemorySnapshot {
  const { dayState } = input;
  const brain =
    readCompanionBrainState(input.dayKey) ??
    createDefaultCompanionBrainState(input.dayKey);

  const capacity: CapacitySnapshot = {
    energy: mapEnergy(dayState),
    motivation: mapMotivation(dayState),
    vibe: mapVibe(dayState),
    healthNote:
      dayState?.needs?.includes("health") || dayState?.note?.match(/migraine|sick/i)
        ? dayState.note
        : undefined,
    fresh: true,
  };

  const candidates = (input.planItems ?? [])
    .filter((i) => !i.done && i.column !== "parked")
    .map(planItemToCandidate);

  return {
    dayKey: input.dayKey,
    capacity,
    brainState: brain,
    candidates,
    exclusions: input.exclusions ?? [],
    suppressTopics: input.suppressTopics ?? [],
    captureLoad: {
      thoughtCount: input.thoughtCount,
      recentCaptures: input.recentCaptures,
    },
    sessionFlags: {
      hyperfocusActive: input.hyperfocusActive,
      hyperfocusMinutes: input.hyperfocusMinutes,
      userDeclaredSurvival: input.userDeclaredSurvival,
    },
    yesterdaySummary: input.yesterdaySummary,
    focusAreas: input.focusAreas,
    activeCooldowns: input.activeCooldowns,
  };
}

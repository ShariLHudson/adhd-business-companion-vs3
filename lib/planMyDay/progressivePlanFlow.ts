/**
 * Progressive Plan My Day — one decision at a time on the simple paper path.
 * Intelligence stays submerged; the member only sees the next helpful question.
 */

import { getDayState, getPrefs, todayStr } from "@/lib/companionStore";
import type { PlanWorkflowEnergy, PlanWorkflowStyle } from "./completePlanWorkflow";
import {
  buildCompleteDayPlan,
  loadPlanWorkflowState,
  savePlanWorkflowState,
} from "./completePlanWorkflow";
import {
  bringArchivedItemToToday,
  findHeldPreviousDayUnfinished,
} from "./previousDay";
import {
  isMeaningfulPlanItem,
  loadTodayPlanItems,
  saveTodayPlanItems,
  type PlanDayItem,
} from "./planDayItems";
import {
  optimizeDayAroundLocks,
  readPlanSchedulePreferences,
} from "./todaysPlanReorder";

export type ProgressivePlanStage =
  | "mind"
  | "anything-else"
  | "list"
  | "usable-time"
  | "energy"
  | "building"
  | "today";

export type ProgressivePlanState = {
  date: string;
  stage: ProgressivePlanStage;
  /** Member chose "I already know" on mind step. */
  skippedMindCapture?: boolean;
  usableMinutes?: number;
  energy?: PlanWorkflowEnergy;
  energyAnswered?: boolean;
};

export const PROGRESSIVE_USABLE_TIME_OPTIONS = [
  { minutes: 120, label: "2 hours" },
  { minutes: 240, label: "Half day" },
  { minutes: 360, label: "Most of the day" },
] as const;

const STAGE_KEY_PREFIX = "companion-progressive-plan-v1";
const ENERGY_BASELINE_KEY = "companion-plan-energy-baseline-v1";
const STYLE_OBS_KEY = "companion-plan-style-observation-v1";

const STYLE_OBSERVATION_DAYS_BEFORE_DEFAULT = 14;

export type PlanEnergyBaseline = {
  energy: PlanWorkflowEnergy;
  label: string;
  date: string;
};

export type PlanStyleObservation = {
  observationDays: string[];
  preferredStyle: PlanWorkflowStyle;
};

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage != null;
  } catch {
    return false;
  }
}

function stageKey(date = todayStr()): string {
  return `${STAGE_KEY_PREFIX}:${date}`;
}

export function emptyProgressivePlanState(
  date = todayStr(),
): ProgressivePlanState {
  return { date, stage: "mind" };
}

export function loadProgressivePlanState(
  date = todayStr(),
): ProgressivePlanState {
  if (!canUseStorage()) return emptyProgressivePlanState(date);
  try {
    const raw = localStorage.getItem(stageKey(date));
    if (!raw) return emptyProgressivePlanState(date);
    const parsed = JSON.parse(raw) as Partial<ProgressivePlanState>;
    if (parsed.date && parsed.date !== date) {
      return emptyProgressivePlanState(date);
    }
    return {
      ...emptyProgressivePlanState(date),
      ...parsed,
      date,
      stage: parsed.stage ?? "mind",
    };
  } catch {
    return emptyProgressivePlanState(date);
  }
}

export function saveProgressivePlanState(
  state: ProgressivePlanState,
): ProgressivePlanState {
  if (!canUseStorage()) return state;
  try {
    localStorage.setItem(stageKey(state.date), JSON.stringify(state));
  } catch {
    /* ignore */
  }
  return state;
}

export function clearProgressivePlanStateForTests(date = todayStr()): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(stageKey(date));
  localStorage.removeItem(ENERGY_BASELINE_KEY);
  localStorage.removeItem(STYLE_OBS_KEY);
}

export function memberFirstName(): string {
  const prefs = getPrefs();
  const raw =
    prefs.preferredName?.trim() ||
    prefs.name?.trim() ||
    "";
  if (!raw) return "friend";
  return raw.split(/\s+/)[0] ?? "friend";
}

export function morningGreeting(name = memberFirstName()): string {
  return `Good Morning, ${name}`;
}

/** Map day-state / legacy levels into workflow energy. */
export function mapDayLevelToWorkflowEnergy(
  level: string | null | undefined,
): PlanWorkflowEnergy | null {
  if (!level) return null;
  if (level === "very-low" || level === "low" || level === "steady" || level === "high") {
    return level;
  }
  if (level === "medium") return "steady";
  if (
    level === "off-charts" ||
    level === "full-tank" ||
    level === "ready-to-roll"
  ) {
    return "high";
  }
  if (level === "doing-okay") return "steady";
  if (level === "running-on-fumes" || level === "need-recharge") return "low";
  return null;
}

export function energyLabel(energy: PlanWorkflowEnergy): string {
  if (energy === "very-low") return "very low";
  if (energy === "low") return "a bit low";
  if (energy === "high") return "strong";
  return "steady";
}

export function readEnergyBaseline(): PlanEnergyBaseline | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(ENERGY_BASELINE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanEnergyBaseline;
    if (!parsed?.energy || !parsed?.date) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeEnergyBaseline(
  energy: PlanWorkflowEnergy,
  date = todayStr(),
): PlanEnergyBaseline {
  const baseline: PlanEnergyBaseline = {
    energy,
    label: energyLabel(energy),
    date,
  };
  if (canUseStorage()) {
    try {
      localStorage.setItem(ENERGY_BASELINE_KEY, JSON.stringify(baseline));
    } catch {
      /* ignore */
    }
  }
  return baseline;
}

/**
 * Prefer yesterday's (or recent) energy for a soft confirmation.
 * Falls back to today's day-state if present from earlier check-in.
 */
export function resolveEnergyBaselineForAsk(
  today = todayStr(),
): PlanEnergyBaseline | null {
  const stored = readEnergyBaseline();
  if (stored && stored.date !== today) {
    return stored;
  }
  if (stored && stored.date === today) {
    return stored;
  }
  const day = getDayState();
  const fromDay =
    mapDayLevelToWorkflowEnergy(day?.energyLevel) ??
    mapDayLevelToWorkflowEnergy(day?.energy);
  if (fromDay && day?.setAt) {
    const setDay = day.setAt.slice(0, 10);
    if (setDay && setDay !== today) {
      return {
        energy: fromDay,
        label: energyLabel(fromDay),
        date: setDay,
      };
    }
  }
  return stored && stored.date !== today ? stored : null;
}

export function shouldAskFreshEnergy(today = todayStr()): boolean {
  return resolveEnergyBaselineForAsk(today) == null;
}

export function applyEnergyAdjustment(
  baseline: PlanWorkflowEnergy,
  adjustment: "same" | "lower" | "higher",
): PlanWorkflowEnergy {
  const order: PlanWorkflowEnergy[] = ["very-low", "low", "steady", "high"];
  const idx = order.indexOf(baseline);
  if (adjustment === "same" || idx < 0) return baseline;
  if (adjustment === "lower") return order[Math.max(0, idx - 1)]!;
  return order[Math.min(order.length - 1, idx + 1)]!;
}

export function readStyleObservation(): PlanStyleObservation {
  if (!canUseStorage()) {
    return { observationDays: [], preferredStyle: "balanced" };
  }
  try {
    const raw = localStorage.getItem(STYLE_OBS_KEY);
    if (!raw) return { observationDays: [], preferredStyle: "balanced" };
    const parsed = JSON.parse(raw) as Partial<PlanStyleObservation>;
    return {
      observationDays: Array.isArray(parsed.observationDays)
        ? parsed.observationDays
        : [],
      preferredStyle: parsed.preferredStyle ?? "balanced",
    };
  } catch {
    return { observationDays: [], preferredStyle: "balanced" };
  }
}

export function recordPlanningStyleObservation(
  date = todayStr(),
): PlanStyleObservation {
  const current = readStyleObservation();
  const days = new Set(current.observationDays);
  days.add(date);
  const next: PlanStyleObservation = {
    observationDays: [...days].sort().slice(-90),
    preferredStyle: current.preferredStyle || "balanced",
  };
  // After enough quiet observation, lock a calm default.
  if (
    next.observationDays.length >= STYLE_OBSERVATION_DAYS_BEFORE_DEFAULT &&
    !current.preferredStyle
  ) {
    next.preferredStyle = "balanced";
  }
  const schedule = readPlanSchedulePreferences();
  if (schedule.preferredStyle) {
    next.preferredStyle = schedule.preferredStyle;
  }
  if (canUseStorage()) {
    try {
      localStorage.setItem(STYLE_OBS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/** Never ask daily — always resolve quietly. */
export function resolveQuietPlanningStyle(): PlanWorkflowStyle {
  const schedule = readPlanSchedulePreferences();
  if (schedule.preferredStyle) return schedule.preferredStyle;
  const obs = readStyleObservation();
  if (obs.observationDays.length >= STYLE_OBSERVATION_DAYS_BEFORE_DEFAULT) {
    return obs.preferredStyle || "balanced";
  }
  const workflow = loadPlanWorkflowState();
  return workflow.planningStyle ?? "balanced";
}

export function shouldAskPlanningStyleDaily(): boolean {
  return false;
}

/**
 * Silently merge calendar / existing plan / a few unfinished yesterday items.
 * No UI dump — just ensure today's store has them.
 */
export function quietPullInTodayItems(): PlanDayItem[] {
  let items = loadTodayPlanItems();
  const held = findHeldPreviousDayUnfinished();
  if (held) {
    const existingTitles = new Set(
      items.map((i) => i.title.trim().toLowerCase()).filter(Boolean),
    );
    const toBring = held.unfinished
      .filter((i) => !existingTitles.has(i.title.trim().toLowerCase()))
      .slice(0, 5);
    for (const item of toBring) {
      items = bringArchivedItemToToday(held.date, item.id);
    }
  }
  return items.filter((i) => isMeaningfulPlanItem(i) || i.sourceTimeBlockId);
}

export function advanceProgressiveStage(
  state: ProgressivePlanState,
  next: ProgressivePlanStage,
  patch?: Partial<ProgressivePlanState>,
): ProgressivePlanState {
  return saveProgressivePlanState({
    ...state,
    ...patch,
    stage: next,
    date: state.date || todayStr(),
  });
}

/**
 * Build the day quietly using existing plan intelligence + locks preserved.
 * Does not surface AI explanation copy.
 */
export function buildProgressiveTodayPlan(input: {
  items: PlanDayItem[];
  availableMinutes?: number;
  energy?: PlanWorkflowEnergy;
}): { items: PlanDayItem[]; primaryId?: string } {
  const style = resolveQuietPlanningStyle();
  recordPlanningStyleObservation();
  const built = buildCompleteDayPlan({
    items: input.items,
    availableMinutes: input.availableMinutes,
    energy: input.energy,
    planningStyle: style,
  });

  // Persist workflow for Start Next Task / Adapt compatibility — hide AI prose in UI.
  const prior = loadPlanWorkflowState();
  savePlanWorkflowState({
    ...prior,
    ...built,
    date: prior.date || todayStr(),
    sourceInputs: prior.sourceInputs,
    availableMinutes: input.availableMinutes ?? built.availableMinutes,
    energy: input.energy ?? built.energy,
    motivation: undefined,
    fitMessage: null,
    companionNotes: [],
    dependencyNotes: [],
    viewRecommendationReason: null,
    styleRecommendation: null,
    primaryReason: null,
    stage: "planned",
  });

  let nextItems = input.items.map((item) => {
    const mins = built.estimatesById[item.id];
    const isPrimary = item.id === built.primaryOutcomeId;
    const isParked = built.parkedTaskIds.includes(item.id);
    if (!mins && !isParked && !isPrimary) return item;
    return {
      ...item,
      durationMinutes: mins ?? item.durationMinutes,
      priority: isPrimary
        ? ("high" as const)
        : isParked
          ? ("low" as const)
          : item.priority ?? "medium",
      column: isParked
        ? ("parked" as const)
        : item.column === "doing"
          ? item.column
          : ("today" as const),
      // Preserve appointment locks; flexible otherwise.
      flexible: item.sourceTimeBlockId ? false : item.flexible !== false,
    };
  });

  // Order flexible around locks using built order when possible.
  const orderIndex = new Map(built.orderedTaskIds.map((id, i) => [id, i]));
  nextItems = [...nextItems].sort((a, b) => {
    const ai = orderIndex.get(a.id);
    const bi = orderIndex.get(b.id);
    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1;
    if (bi != null) return 1;
    return 0;
  });
  nextItems = optimizeDayAroundLocks(
    nextItems.map((item, index) => ({ ...item, sortOrder: index + 1 })),
  );
  saveTodayPlanItems(nextItems);
  return { items: nextItems, primaryId: built.primaryOutcomeId };
}

export function progressiveStageTestId(stage: ProgressivePlanStage): string {
  return `plan-day-progressive-${stage}`;
}

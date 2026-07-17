/**
 * Complete Plan My Day workflow — turns Today's List into a realistic day plan.
 * Extends capture; does not replace Adapt My Day or the shared window chrome.
 */

import { todayStr } from "@/lib/companionStore";
import type { PlanDayItem } from "./types";

export type PlanWorkflowEnergy = "very-low" | "low" | "steady" | "high";
export type PlanWorkflowMotivation = "very-low" | "low" | "steady" | "high";
export type PlanWorkflowStyle = "gentle" | "balanced" | "focused";
export type PlanWorkflowStage =
  | "capture"
  | "constraints"
  | "planned"
  | "started";

export type PlanMyDayWorkflowState = {
  date: string;
  sourceInputs: string[];
  availableMinutes?: number;
  energy?: PlanWorkflowEnergy;
  motivation?: PlanWorkflowMotivation;
  planningStyle?: PlanWorkflowStyle;
  primaryOutcomeId?: string;
  secondaryOutcomeIds: string[];
  orderedTaskIds: string[];
  parkedTaskIds: string[];
  quickWinIds: string[];
  currentTaskId?: string;
  firstStepText?: string;
  fitMessage?: string | null;
  estimatesById: Record<string, number>;
  tagsById: Record<string, string[]>;
  stage: PlanWorkflowStage;
};

export type BuildDayPlanInput = {
  items: PlanDayItem[];
  availableMinutes?: number;
  energy?: PlanWorkflowEnergy;
  motivation?: PlanWorkflowMotivation;
  planningStyle?: PlanWorkflowStyle;
};

const WORKFLOW_KEY_PREFIX = "companion-plan-my-day-workflow-v1";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage != null;
  } catch {
    return false;
  }
}

function workflowKey(date = todayStr()): string {
  return `${WORKFLOW_KEY_PREFIX}:${date}`;
}

export function emptyPlanWorkflowState(
  date = todayStr(),
): PlanMyDayWorkflowState {
  return {
    date,
    sourceInputs: [],
    secondaryOutcomeIds: [],
    orderedTaskIds: [],
    parkedTaskIds: [],
    quickWinIds: [],
    estimatesById: {},
    tagsById: {},
    stage: "capture",
    fitMessage: null,
  };
}

export function loadPlanWorkflowState(
  date = todayStr(),
): PlanMyDayWorkflowState {
  if (!canUseStorage()) return emptyPlanWorkflowState(date);
  try {
    const raw = localStorage.getItem(workflowKey(date));
    if (!raw) return emptyPlanWorkflowState(date);
    const parsed = JSON.parse(raw) as Partial<PlanMyDayWorkflowState>;
    if (parsed.date && parsed.date !== date) {
      return emptyPlanWorkflowState(date);
    }
    return {
      ...emptyPlanWorkflowState(date),
      ...parsed,
      date,
      secondaryOutcomeIds: parsed.secondaryOutcomeIds ?? [],
      orderedTaskIds: parsed.orderedTaskIds ?? [],
      parkedTaskIds: parsed.parkedTaskIds ?? [],
      quickWinIds: parsed.quickWinIds ?? [],
      estimatesById: parsed.estimatesById ?? {},
      tagsById: parsed.tagsById ?? {},
      sourceInputs: parsed.sourceInputs ?? [],
    };
  } catch {
    return emptyPlanWorkflowState(date);
  }
}

export function savePlanWorkflowState(
  state: PlanMyDayWorkflowState,
): PlanMyDayWorkflowState {
  if (!canUseStorage()) return state;
  try {
    localStorage.setItem(workflowKey(state.date), JSON.stringify(state));
  } catch {
    /* quota */
  }
  return state;
}

export function clearPlanWorkflowStateForTests(date = todayStr()): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(workflowKey(date));
}

/** Errand / leave-the-house signals. */
export function detectErrandTask(title: string): boolean {
  return /\b(pick up|pickup|grocer|meds?|medication|pharmacy|errand|store|shopping|post office|dry ?clean|drop off|drive to|leave the house)\b/i.test(
    title,
  );
}

export function detectFocusWork(title: string): boolean {
  return /\b(work on|project|write|build|app|platform|code|draft|plan|meeting|client|proposal)\b/i.test(
    title,
  );
}

export function detectQuickTask(title: string): boolean {
  return /\b(water|plants?|email|text|quick|tidy|dish|trash|feed|call)\b/i.test(
    title,
  );
}

export function estimateTaskMinutes(title: string): number {
  if (detectQuickTask(title) && !detectFocusWork(title)) return 15;
  if (detectErrandTask(title)) return 45;
  if (detectFocusWork(title)) return 60;
  return 30;
}

export function tagTask(title: string): string[] {
  const tags: string[] = [];
  if (detectErrandTask(title)) tags.push("errand");
  if (detectFocusWork(title)) tags.push("focus work");
  if (detectQuickTask(title)) tags.push("quick task");
  if (tags.length === 0) tags.push("should do today");
  return tags;
}

function defaultStyle(
  energy?: PlanWorkflowEnergy,
  motivation?: PlanWorkflowMotivation,
): PlanWorkflowStyle {
  if (energy === "very-low" || energy === "low") return "gentle";
  if (
    (energy === "high" || energy === "steady") &&
    (motivation === "high" || motivation === "steady")
  ) {
    return "focused";
  }
  return "balanced";
}

function concreteFirstStep(title: string): string {
  if (detectFocusWork(title)) {
    return `Open “${title}” and choose one small piece you can finish in the next 15 minutes.`;
  }
  if (detectErrandTask(title)) {
    return `Gather what you need for “${title}”, then start the trip or the first stop.`;
  }
  if (detectQuickTask(title)) {
    return `Do “${title}” now — it is a short win you can finish quickly.`;
  }
  return `Begin “${title}” with the smallest visible next action.`;
}

/**
 * Build a readable day plan from today's list + capacity inputs.
 */
export function buildCompleteDayPlan(
  input: BuildDayPlanInput,
): Omit<
  PlanMyDayWorkflowState,
  "date" | "sourceInputs" | "stage" | "availableMinutes" | "energy" | "motivation"
> & {
  stage: "planned";
  availableMinutes?: number;
  energy?: PlanWorkflowEnergy;
  motivation?: PlanWorkflowMotivation;
} {
  const active = input.items.filter((item) => !item.done && item.title.trim());
  const style =
    input.planningStyle ?? defaultStyle(input.energy, input.motivation);
  const available =
    input.availableMinutes ??
    (style === "gentle" ? 120 : style === "focused" ? 240 : 180);

  const estimatesById: Record<string, number> = {};
  const tagsById: Record<string, string[]> = {};
  for (const item of active) {
    estimatesById[item.id] =
      item.durationMinutes && item.durationMinutes > 0
        ? item.durationMinutes
        : estimateTaskMinutes(item.title);
    tagsById[item.id] = tagTask(item.title);
  }

  const scored = [...active].sort((a, b) => {
    const aFocus = detectFocusWork(a.title) ? 0 : 1;
    const bFocus = detectFocusWork(b.title) ? 0 : 1;
    const aErrand = detectErrandTask(a.title) ? 0 : 1;
    const bErrand = detectErrandTask(b.title) ? 0 : 1;
    if (style === "focused") return aFocus - bFocus || aErrand - bErrand;
    if (style === "gentle") {
      const aQuick = detectQuickTask(a.title) ? 0 : 1;
      const bQuick = detectQuickTask(b.title) ? 0 : 1;
      return aQuick - bQuick || aErrand - bErrand;
    }
    // balanced: focus, then errands, then quick
    return aFocus - bFocus || aErrand - bErrand;
  });

  const maxToday =
    style === "gentle" ? 3 : style === "focused" ? 4 : scored.length;
  const transitionBuffer = Math.round(available * 0.15);
  let budget = Math.max(30, available - transitionBuffer);

  const ordered: PlanDayItem[] = [];
  const parked: PlanDayItem[] = [];
  const quickWins: PlanDayItem[] = [];

  for (const item of scored) {
    const mins = estimatesById[item.id] ?? 30;
    const isQuick = detectQuickTask(item.title) && !detectFocusWork(item.title);
    if (ordered.length >= maxToday || mins > budget) {
      parked.push(item);
      continue;
    }
    ordered.push(item);
    budget -= mins;
    if (isQuick) quickWins.push(item);
  }

  // Keep at least one item when the list is non-empty.
  if (!ordered.length && scored.length) {
    ordered.push(scored[0]);
    parked.splice(
      parked.findIndex((p) => p.id === scored[0].id),
      1,
    );
  }

  const primary = ordered[0] ?? null;
  const secondaryOutcomeIds = ordered.slice(1, 3).map((item) => item.id);
  const totalEstimate = ordered.reduce(
    (sum, item) => sum + (estimatesById[item.id] ?? 0),
    0,
  );
  const overflow = parked.length > 0 || totalEstimate > available;

  let fitMessage: string | null = null;
  if (overflow && active.length > 0) {
    const hoursTasks = Math.max(1, Math.round(totalEstimate / 60));
    const hoursAvail = Math.max(1, Math.round(available / 60));
    fitMessage = `You have about ${hoursTasks} hour${
      hoursTasks === 1 ? "" : "s"
    } of work in today’s focus and roughly ${hoursAvail} usable hour${
      hoursAvail === 1 ? "" : "s"
    }. Let’s keep what truly needs today and park the rest without treating it as failure.`;
  } else if (active.length > 0) {
    fitMessage =
      "This looks like a realistic fit for the time and energy you described.";
  }

  const firstStepText = primary
    ? concreteFirstStep(primary.title)
    : "Add one thing you want today, then we can shape a plan.";

  return {
    availableMinutes: available,
    energy: input.energy,
    motivation: input.motivation,
    planningStyle: style,
    primaryOutcomeId: primary?.id,
    secondaryOutcomeIds,
    orderedTaskIds: ordered.map((item) => item.id),
    parkedTaskIds: parked.map((item) => item.id),
    quickWinIds: quickWins.map((item) => item.id),
    currentTaskId: primary?.id,
    firstStepText,
    fitMessage,
    estimatesById,
    tagsById,
    stage: "planned",
  };
}

export const AVAILABLE_TIME_OPTIONS = [
  { minutes: 60, label: "About 1 hour" },
  { minutes: 120, label: "About 2 hours" },
  { minutes: 180, label: "About 3 hours" },
  { minutes: 240, label: "About 4 hours" },
  { minutes: 360, label: "Most of the day" },
] as const;

export const ENERGY_OPTIONS: { id: PlanWorkflowEnergy; label: string }[] = [
  { id: "very-low", label: "Very low" },
  { id: "low", label: "Low" },
  { id: "steady", label: "Steady" },
  { id: "high", label: "High" },
];

export const MOTIVATION_OPTIONS: {
  id: PlanWorkflowMotivation;
  label: string;
}[] = [
  { id: "very-low", label: "Very low" },
  { id: "low", label: "Low" },
  { id: "steady", label: "Steady" },
  { id: "high", label: "High" },
];

export const STYLE_OPTIONS: { id: PlanWorkflowStyle; label: string; hint: string }[] =
  [
    {
      id: "gentle",
      label: "Gentle Plan",
      hint: "Fewer priorities, more flexibility",
    },
    {
      id: "balanced",
      label: "Balanced Plan",
      hint: "A realistic mix for a normal day",
    },
    {
      id: "focused",
      label: "Focused Plan",
      hint: "Protect one meaningful work block",
    },
  ];

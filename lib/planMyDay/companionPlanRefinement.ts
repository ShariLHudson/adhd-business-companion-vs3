/**
 * Companion refinements for Plan My Day — recommendations & awareness.
 * Extends the existing complete workflow; does not replace the planning engine.
 * Spec 136: no named-expert attribution in member-facing strings.
 */

import type { PlanDayItem } from "./types";
import {
  detectFocusWork,
  detectQuickTask,
  estimateTaskMinutes,
  type PlanWorkflowEnergy,
  type PlanWorkflowMotivation,
  type PlanWorkflowStyle,
} from "./completePlanWorkflow";
import { buildCompanionPlanObservations } from "./planBehaviorLearning";
import {
  recommendUniversalView,
  type UniversalViewRecommendation,
} from "@/lib/presentation/universalViewArchitecture";

export type EffortBand = "tiny" | "small" | "medium" | "large" | "huge";
export type PriorityBand = "highest" | "medium" | "nice";
export type TaskEnergyFit = "high" | "medium" | "low";

export const EFFORT_OPTIONS: { id: EffortBand; label: string }[] = [
  { id: "tiny", label: "Tiny" },
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
  { id: "huge", label: "Huge" },
];

export function effortBandFromMinutes(minutes: number): EffortBand {
  if (minutes <= 10) return "tiny";
  if (minutes <= 25) return "small";
  if (minutes <= 45) return "medium";
  if (minutes <= 90) return "large";
  return "huge";
}

export function effortLabel(band: EffortBand): string {
  return EFFORT_OPTIONS.find((o) => o.id === band)?.label ?? "Medium";
}

export function recommendPlanningStyle(input: {
  energy?: PlanWorkflowEnergy | null;
  motivation?: PlanWorkflowMotivation | null;
  taskCount: number;
}): { style: PlanWorkflowStyle; reason: string } {
  const energy = input.energy;
  const motivation = input.motivation;
  if (energy === "very-low" || energy === "low") {
    return {
      style: "gentle",
      reason:
        "I think Gentle would work well today — keep the list light and protect your energy.",
    };
  }
  if (
    (energy === "high" || energy === "steady") &&
    (motivation === "high" || motivation === "steady") &&
    input.taskCount >= 2
  ) {
    return {
      style: "focused",
      reason:
        "I think Focused would work well today — protect one meaningful block and let the rest support it.",
    };
  }
  if (!energy && !motivation) {
    return {
      style: "balanced",
      reason:
        "I think Balanced would work well today — a flexible plan you can adjust as the day unfolds.",
    };
  }
  return {
    style: "balanced",
    reason:
      "I think Balanced would work well today — a realistic mix without forcing every item.",
  };
}

export function mitReason(title: string, style: PlanWorkflowStyle): string {
  if (detectFocusWork(title)) {
    return `This looks like the work that moves something real forward — a strong Main Focus for a ${style} day.`;
  }
  if (detectQuickTask(title) && style === "gentle") {
    return "Starting with a small clear win can rebuild momentum without asking for a full deep-work block.";
  }
  return "This is the clearest next move from your list — everything else can support it.";
}

export function priorityBandForTask(input: {
  id: string;
  primaryId?: string;
  secondaryIds: string[];
  parkedIds: string[];
}): PriorityBand {
  if (input.id === input.primaryId) return "highest";
  if (input.parkedIds.includes(input.id)) return "nice";
  if (input.secondaryIds.includes(input.id)) return "medium";
  return "medium";
}

export function priorityBandLabel(band: PriorityBand): string {
  if (band === "highest") return "Highest Impact";
  if (band === "nice") return "Nice if Time";
  return "Medium";
}

export function taskEnergyFit(title: string): TaskEnergyFit {
  if (detectFocusWork(title) && !detectQuickTask(title)) return "high";
  if (
    /\b(call|meeting|plan|review|discuss|client)\b/i.test(title) &&
    !detectQuickTask(title)
  ) {
    return "medium";
  }
  if (
    detectQuickTask(title) ||
    /\b(email|paperwork|admin|file|sort|tidy|invoice)\b/i.test(title)
  ) {
    return "low";
  }
  return "medium";
}

export function energyFitLabel(fit: TaskEnergyFit): string {
  if (fit === "high") return "High energy";
  if (fit === "low") return "Low energy";
  return "Medium energy";
}

/** Lightweight dependency hints from natural language in the title/notes. */
export function detectDependencyHint(
  item: PlanDayItem,
): { kind: "requires" | "waiting" | "blocked"; note: string } | null {
  const text = `${item.title} ${item.notes ?? ""}`;
  const requires = text.match(
    /\b(?:requires?|needs?|after|depends on)\s+(.+)$/i,
  );
  if (requires?.[1]) {
    return {
      kind: "requires",
      note: `Requires: ${requires[1].trim().replace(/[.!?]+$/, "")}`,
    };
  }
  if (/\b(waiting (?:for|on)|blocked by|can't until|cannot until)\b/i.test(text)) {
    return {
      kind: "waiting",
      note: "Waiting on something else — this is not the same as avoidance.",
    };
  }
  return null;
}

export type AvoidanceOffer = {
  title: string;
  message: string;
  choices: string[];
};

/**
 * Soft avoidance recognition from deferred/snoozed behavior themes.
 * Never shame — offer smaller next steps.
 */
export function buildAvoidanceOffer(
  items: PlanDayItem[],
): AvoidanceOffer | null {
  const observations = buildCompanionPlanObservations();
  const moved = observations.find((o) =>
    /moved|pushed|aside several/i.test(o),
  );
  if (!moved) return null;
  const candidate =
    items.find(
      (i) =>
        !i.done &&
        (detectFocusWork(i.title) || /\b(follow.?up|email|call)\b/i.test(i.title)),
    ) ?? items.find((i) => !i.done);
  if (!candidate) return null;
  return {
    title: candidate.title,
    message: `I noticed “${candidate.title}” may have been waiting awhile. Would you like to make it smaller, work on it together, postpone intentionally, replace it, or spend just five minutes?`,
    choices: [
      "Make it smaller",
      "Work on it together",
      "Postpone intentionally",
      "Replace it",
      "Spend just five minutes",
    ],
  };
}

export function companionAwarenessLines(items: PlanDayItem[]): string[] {
  const fromBehavior = buildCompanionPlanObservations();
  const lines = [...fromBehavior];
  const waiting = items.filter((i) => detectDependencyHint(i)?.kind === "waiting");
  if (waiting[0] && lines.length < 2) {
    lines.push(
      `“${waiting[0].title}” looks blocked or waiting — we can keep it visible without treating it as procrastination.`,
    );
  }
  return lines.slice(0, 2);
}

export function gentleCompletionAcknowledgement(title?: string): string {
  const bit = title?.trim()
    ? `“${title.trim().slice(0, 60)}” is done.`
    : "That’s done.";
  return `Nice work. ${bit} That’s one less thing your brain has to carry today.`;
}

export function recommendPlanView(input: {
  energy?: PlanWorkflowEnergy | null;
  taskCount: number;
  hasAppointments?: boolean;
}): UniversalViewRecommendation {
  return recommendUniversalView({
    appointmentCount: input.hasAppointments ? 3 : 0,
    taskCount: input.taskCount,
    overwhelmed: input.taskCount >= 7,
    energy: input.energy ?? null,
  });
}

export function enrichTaskMeta(item: PlanDayItem): {
  minutes: number;
  effort: EffortBand;
  energyFit: TaskEnergyFit;
} {
  const minutes =
    item.durationMinutes && item.durationMinutes > 0
      ? item.durationMinutes
      : estimateTaskMinutes(item.title);
  return {
    minutes,
    effort: effortBandFromMinutes(minutes),
    energyFit: taskEnergyFit(item.title),
  };
}

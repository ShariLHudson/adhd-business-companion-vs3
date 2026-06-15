/**
 * Priority rules for adaptive day planning — explainable, never punitive.
 */

import type { DayDesignerAnswers, DayDesignerContext } from "./types";
import {
  effectiveEnergy,
  hasActiveLoop,
  hasCreativeEnergy,
  isOverloaded,
  isStuckOrFrozen,
} from "./daySignals";

export type DayPlanningRule = {
  id: string;
  label: string;
  applied: boolean;
  reason: string;
};

export function evaluatePlanningRules(
  context: DayDesignerContext,
  answers: DayDesignerAnswers,
): DayPlanningRule[] {
  const energy = effectiveEnergy(context, answers.energy);
  const rules: DayPlanningRule[] = [
    {
      id: "reduce_when_overloaded",
      label: "Reduce the day when overloaded",
      applied: isOverloaded(context),
      reason: isOverloaded(context)
        ? "Load looks heavy — a smaller plan protects bandwidth."
        : "Load looks manageable — a fuller plan may work.",
    },
    {
      id: "avoid_heavy_deep_work_when_tired",
      label: "Avoid heavy deep work first when tired",
      applied: energy === "low",
      reason:
        energy === "low"
          ? "Energy is low — starting light avoids friction."
          : "Energy supports deeper work when ready.",
    },
    {
      id: "tiny_start_when_stuck",
      label: "One tiny start when stuck",
      applied: isStuckOrFrozen(context),
      reason: isStuckOrFrozen(context)
        ? "Stuck/frozen — a 10-minute starter lowers the bar."
        : "Movement looks possible without a micro-start.",
    },
    {
      id: "loop_grounding",
      label: "Loop-closing or grounding step",
      applied: hasActiveLoop(context),
      reason: hasActiveLoop(context)
        ? "A recurring pattern is active — grounding may help."
        : "No active loop signal today.",
    },
    {
      id: "protect_creative",
      label: "Protect creative work when energy is high",
      applied: hasCreativeEnergy(context) && energy !== "low",
      reason: hasCreativeEnergy(context)
        ? "Creative energy looks good — protect it earlier in the day."
        : "Creative work can wait for a better energy window.",
    },
    {
      id: "minimum_viable_day",
      label: "Minimum viable day when energy is low",
      applied: energy === "low",
      reason:
        energy === "low"
          ? "Low energy — one or two enough-for-today items only."
          : "Energy supports a few focused blocks.",
    },
    {
      id: "always_margin",
      label: "Always leave margin",
      applied: true,
      reason: "Open margin reduces pressure when the day shifts.",
    },
    {
      id: "never_overwhelming",
      label: "Never create an overwhelming plan",
      applied: true,
      reason: "Few blocks, clear reasons — no packed schedule.",
    },
  ];
  return rules;
}

export function maxBlocksForContext(
  context: DayDesignerContext,
  answers: DayDesignerAnswers,
): number {
  const energy = effectiveEnergy(context, answers.energy);
  if (isOverloaded(context)) return 2;
  if (energy === "low") return 2;
  if (isStuckOrFrozen(context)) return 3;
  const minutes = answers.availableMinutes ?? 240;
  if (minutes <= 120) return 2;
  if (minutes <= 240) return 3;
  return 4;
}

export function buildReasoningSummary(
  rules: DayPlanningRule[],
  context: DayDesignerContext,
): string {
  const applied = rules.filter((r) => r.applied);
  const lines: string[] = [];

  if (
    applied.some((r) => r.id === "protect_creative") &&
    context.timeOfDay === "morning"
  ) {
    lines.push(
      "I put creative or writing work earlier because it usually needs more energy, and your energy looks best earlier today.",
    );
  } else if (applied.some((r) => r.id === "avoid_heavy_deep_work_when_tired")) {
    lines.push(
      "I kept the first step light because your energy looks lower — deep work can come later if you have room.",
    );
  } else if (applied.some((r) => r.id === "reduce_when_overloaded")) {
    lines.push(
      "I kept today small because you're carrying a lot — fewer decisions, more margin.",
    );
  } else if (applied.some((r) => r.id === "tiny_start_when_stuck")) {
    lines.push(
      "I started with one tiny step because getting moving matters more than a full plan right now.",
    );
  } else {
    lines.push(
      "I ordered things by energy fit and what matters most — you can change any of this.",
    );
  }

  if (applied.some((r) => r.id === "always_margin")) {
    lines.push("I left open margin on purpose — days rarely go exactly as planned.");
  }

  return lines.join(" ");
}

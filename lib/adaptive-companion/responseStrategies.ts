/**
 * Response strategies per companion mode — tone and structure guidance.
 */

import type { CompanionResponseMode } from "./types";

export type ResponseStrategy = {
  mode: CompanionResponseMode;
  label: string;
  purpose: string;
  style: string[];
  avoid: string[];
};

export const RESPONSE_STRATEGIES: Record<CompanionResponseMode, ResponseStrategy> =
  {
    support: {
      mode: "support",
      label: "Support Mode",
      purpose:
        "User is overwhelmed, emotional, discouraged, frustrated, or burned out.",
      style: ["validation", "calming", "relief", "understanding"],
      avoid: ["long plans", "productivity pushes", "stacked advice"],
    },
    sorting: {
      mode: "sorting",
      label: "Sorting Mode",
      purpose: "User is confused, overloaded, or carrying too many ideas.",
      style: ["organize", "categorize", "reduce complexity", "park what waits"],
      avoid: ["big new plans", "adding more items", "dense lists"],
    },
    planning: {
      mode: "planning",
      label: "Planning Mode",
      purpose: "User wants a path forward.",
      style: ["planning", "priorities", "sequencing", "light structure"],
      avoid: ["packed schedules", "overwhelm", "too many options"],
    },
    activation: {
      mode: "activation",
      label: "Activation Mode",
      purpose: "User is stuck or frozen.",
      style: ["tiny next step", "remove friction", "start momentum"],
      avoid: ["motivation lectures", "big goals", "shame"],
    },
    focus: {
      mode: "focus",
      label: "Focus Mode",
      purpose: "User already knows what to do.",
      style: ["maintain focus", "reduce distractions", "brief check-ins"],
      avoid: ["re-planning", "extra questions", "scope creep"],
    },
    celebration: {
      mode: "celebration",
      label: "Celebration Mode",
      purpose: "User achieved something or a milestone is active.",
      style: ["recognize progress", "celebrate effort", "warm acknowledgment"],
      avoid: ["immediately pivoting to next task", "minimizing the win"],
    },
    reflection: {
      mode: "reflection",
      label: "Reflection Mode",
      purpose: "User wants insight or a recurring pattern is active.",
      style: ["patterns", "lessons", "growth", "gentle curiosity"],
      avoid: ["diagnosis", "labels", "over-analysis"],
    },
  };

export function strategyForMode(
  mode: CompanionResponseMode,
): ResponseStrategy {
  return RESPONSE_STRATEGIES[mode];
}

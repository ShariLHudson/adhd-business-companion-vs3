import { hasActivePlanForToday } from "./hasActivePlanToday";
import type { PlanOrAdaptChoiceCard } from "./types";

export function resolvePlanOrAdaptChoices(input?: {
  hasPlanToday?: boolean;
}): PlanOrAdaptChoiceCard[] {
  const hasPlan = input?.hasPlanToday ?? hasActivePlanForToday();

  return [
    {
      id: "plan-my-day",
      title: "Plan My Day",
      explanation:
        "Build today’s plan around priorities, commitments, available time, energy, and motivation.",
      buttonLabel: "Plan My Day",
      recommended: !hasPlan,
    },
    {
      id: "adapt-my-day",
      title: "Adapt My Day",
      explanation:
        "Change today’s existing plan because time, energy, motivation, priorities, or circumstances changed.",
      buttonLabel: "Adapt My Day",
      recommended: hasPlan,
    },
  ];
}

export const PLAN_OR_ADAPT_MESSAGE =
  "Would you like to build today's plan, or adapt the one you already have?";

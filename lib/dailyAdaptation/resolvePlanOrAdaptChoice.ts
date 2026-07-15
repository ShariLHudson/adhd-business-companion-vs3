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
        "Build a plan for today based on your time, commitments, priorities, and preferred level of structure.",
      buttonLabel: "Plan My Day",
      recommended: !hasPlan,
    },
    {
      id: "adapt-my-day",
      title: "Adapt My Day",
      explanation:
        "Tell Shari how your energy and motivation are right now so she can help adjust today's plan.",
      buttonLabel: "Adapt My Day",
      recommended: hasPlan,
    },
  ];
}

export const PLAN_OR_ADAPT_MESSAGE =
  "Would you like to build today's plan, or adapt the one you already have?";

/**
 * Clarification policy — high confidence acts; ambiguous asks ≤4 options.
 */

import type { RoutingConfidence, RoutingIntentFamily } from "./routingTypes";

export type ClarificationPlan = {
  requiresClarification: boolean;
  prompt: string | null;
  options: string[];
  reason: string | null;
};

export function resolveClarification(input: {
  family: RoutingIntentFamily;
  confidence: RoutingConfidence;
  targetId: string | null;
}): ClarificationPlan {
  if (input.confidence === "high") {
    return {
      requiresClarification: false,
      prompt: null,
      options: [],
      reason: null,
    };
  }

  if (input.family === "direct_navigation" && !input.targetId) {
    return {
      requiresClarification: true,
      prompt: "Where would you like to go?",
      options: ["Welcome Home", "Music Room", "Create", "Projects"],
      reason: "navigation_unresolved",
    };
  }

  if (input.family === "ambiguous" || input.confidence === "low") {
    return {
      requiresClarification: true,
      prompt: "What would help most right now?",
      options: ["Talk it through", "Go somewhere", "Continue work", "Something else"],
      reason: "low_confidence",
    };
  }

  // Medium confidence with a target — reversible, act without looping.
  return {
    requiresClarification: false,
    prompt: null,
    options: [],
    reason: null,
  };
}

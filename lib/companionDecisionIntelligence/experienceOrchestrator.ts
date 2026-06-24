/**
 * Companion Experience Orchestrator™ — Discovery → Decision → Action → Completion.
 */

import type { AcceptedIntentResolution } from "./types";
import type { DecisionComplexityScore, ExperienceMode } from "./types";
import type { ResourceCandidate } from "./types";

export function resolveExperienceMode(input: {
  complexity: DecisionComplexityScore;
  topResource: ResourceCandidate | null;
  acceptance: AcceptedIntentResolution | null;
  userJustAccepted: boolean;
}): ExperienceMode {
  if (input.userJustAccepted && input.acceptance?.accepted) {
    return input.acceptance.acceptedResource ? "action" : "decision";
  }

  if (
    input.complexity.discoveryComplete &&
    (input.topResource?.offerReady || input.complexity.level === "high")
  ) {
    return "decision";
  }

  if (
    !input.complexity.discoveryComplete &&
    (input.complexity.level === "medium" || input.complexity.level === "high")
  ) {
    return "discovery";
  }

  if (input.complexity.level === "low") {
    return "action";
  }

  return "discovery";
}

export function experienceModeHintForChat(mode: ExperienceMode): string {
  const hints: Record<ExperienceMode, string> = {
    discovery:
      "EXPERIENCE MODE: Discovery — ONE question this turn only (max 1 simple / 2 moderate / 3 complex before framework). No solutions yet. No workspace offers until framework confidence ≥70%.",
    decision:
      "EXPERIENCE MODE: Decision — enough context exists. Synthesize, compare options, offer Decision Compass if confidence is high. Permission first.",
    action:
      "EXPERIENCE MODE: Action — user accepted or context is sufficient. Execute the next concrete step. No reset.",
    completion:
      "EXPERIENCE MODE: Completion — deliver a clear recommendation and one next step. Confirm outcome achieved.",
  };
  return hints[mode];
}

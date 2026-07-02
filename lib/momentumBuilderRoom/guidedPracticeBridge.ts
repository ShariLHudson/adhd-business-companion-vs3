/**
 * Layer 3 bridge — optional guided practice (T-012).
 * Practice is offered, never listed. Permission required before launch.
 *
 * @see docs/MOMENTUM_BUILDER_FRAMEWORK.md
 * @see docs/MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md
 */

import type {
  GuidedPracticeOffer,
  HiddenStrategySelection,
  MomentumConversationDiscovery,
} from "./types";

export type GuidedPracticeInput = {
  discovery: MomentumConversationDiscovery;
  hiddenStrategy: HiddenStrategySelection;
};

const PRACTICE_BY_APPROACH: Record<
  HiddenStrategySelection["approach"],
  Omit<GuidedPracticeOffer, "permissionPrompt" | "reason"> | null
> = {
  prioritize: {
    builderId: "executive-prioritization",
    domain: "executive_function",
  },
  break_down: {
    builderId: "mental-decluttering",
    domain: "executive_function",
  },
  decide: {
    builderId: "executive-decisions",
    domain: "decision_making",
  },
  recover: {
    builderId: "momentum-restart",
    domain: "executive_function",
  },
  clarify: null,
  celebrate: null,
};

export function proposeGuidedPracticeOffer(
  input: GuidedPracticeInput,
): GuidedPracticeOffer | null {
  const { hiddenStrategy, discovery } = input;
  if (hiddenStrategy.confidence === "low") return null;

  const template = PRACTICE_BY_APPROACH[hiddenStrategy.approach];
  if (!template) return null;

  if (discovery.energy === "low" && hiddenStrategy.approach === "prioritize") {
    return null;
  }

  return {
    ...template,
    permissionPrompt: practicePermissionPrompt(hiddenStrategy.approach),
    reason: `Supports ${hiddenStrategy.approach} without naming a framework.`,
  };
}

function practicePermissionPrompt(
  approach: HiddenStrategySelection["approach"],
): string {
  switch (approach) {
    case "prioritize":
      return "Would you like to practice choosing what matters most right now?";
    case "break_down":
      return "Would you like to practice breaking this into a smaller first step?";
    case "decide":
      return "Would you like to talk through the decision together — with a short practice if it helps?";
    case "recover":
      return "Would a gentle reset practice help you find your footing again?";
    default:
      return "Would you like to practice this together for a few minutes?";
  }
}

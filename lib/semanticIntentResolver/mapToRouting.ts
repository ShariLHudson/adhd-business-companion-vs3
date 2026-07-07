/**
 * Map semantic intent → conversation goals, capabilities, and next steps.
 */

import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";
import type {
  SemanticMemberAction,
  SemanticMemberIntent,
  SemanticNextStep,
  SemanticTarget,
} from "./types";
import {
  detectWhereSignal,
  type DetectedActionSignal,
} from "./intentSignals";
import {
  navigationTargetFromSemantic,
  targetKindSupportsNavigation,
} from "./resolveTarget";

const GOAL_BY_ACTION: Partial<
  Record<SemanticMemberAction, ConversationGoal>
> = {
  navigate: "explicit_navigation",
  open_feature: "help_how_to",
  research: "research",
  create: "create",
  retrieve: "retrieve",
  capture: "capture",
  ask_how_to: "help_how_to",
  ask_knowledge: "help_how_to",
  recommendation: "general_conversation",
  discovery: "discovery_estate",
  continue_session: "continue_session",
};

const CAPABILITY_BY_ACTION: Partial<
  Record<SemanticMemberAction, EstateCapability>
> = {
  navigate: "navigation",
  open_feature: "feature",
  research: "research",
  create: "create",
  retrieve: "retrieval",
  capture: "capture",
  ask_how_to: "feature",
  ask_knowledge: "object",
  recommendation: "experience",
  discovery: "discovery",
  continue_session: "session_continue",
};

export function determineNextStep(
  action: SemanticMemberAction,
  target: SemanticTarget,
  userText: string,
): SemanticNextStep {
  if (action === "continue_session") return "continue_workflow";
  if (action === "research" || action === "create" || action === "retrieve") {
    return "continue_workflow";
  }
  if (action === "capture") return "continue_workflow";

  if (action === "open_feature" && target.kind === "feature") {
    return "open_feature";
  }

  if (action === "ask_how_to" && target.kind === "feature") {
    return target.placeId ? "open_feature" : "answer_from_kb";
  }

  if (action === "discovery") {
    return target.kind === "unknown" ? "offer_choices" : "answer_from_kb";
  }

  if (action === "recommendation" && target.kind === "experience") {
    return "offer_choices";
  }

  if (action === "navigate") {
    const navTarget = navigationTargetFromSemantic(target);
    if (navTarget?.placeId) return "navigate";
    if (target.kind === "experience") return "offer_choices";
    if (target.kind !== "unknown") return "clarify";
    return "conversation_fallback";
  }

  if (action === "ask_knowledge") {
    if (target.kind === "object") {
      return detectWhereSignal(userText) && target.parentLocationId
        ? "answer_from_kb"
        : "answer_from_kb";
    }
    if (target.kind === "room") {
      return detectWhereSignal(userText) ? "answer_from_kb" : "navigate";
    }
    return "conversation_fallback";
  }

  return "conversation_fallback";
}

export function mergeActionWithTarget(
  signal: DetectedActionSignal,
  target: SemanticTarget,
  userText: string,
): SemanticMemberAction {
  let action = signal.action;

  if (
    action === "conversation" &&
    target.kind !== "unknown"
  ) {
    if (target.kind === "feature") return "ask_how_to";
    if (target.kind === "object") return "ask_knowledge";
    if (target.kind === "room") return detectWhereSignal(userText) ? "ask_knowledge" : "navigate";
    if (target.kind === "experience") return "recommendation";
  }

  if (
    action === "navigate" &&
    target.kind === "object" &&
    target.parentLocationId
  ) {
    return "navigate";
  }

  if (
    action === "ask_knowledge" &&
    target.kind === "room" &&
    !detectWhereSignal(userText) &&
    detectNavigateSignalFromMerged(userText)
  ) {
    return "navigate";
  }

  if (action === "open_feature" && target.kind !== "feature") {
    return signal.action;
  }

  return action;
}

function detectNavigateSignalFromMerged(text: string): boolean {
  return /\b(?:see|visit|go|show me)\b/i.test(text);
}

export function enrichSemanticIntent(
  action: SemanticMemberAction,
  target: SemanticTarget,
  nextStep: SemanticNextStep,
  source: SemanticMemberIntent["source"],
  strength: DetectedActionSignal["strength"],
  reason: string,
): SemanticMemberIntent {
  let capability = CAPABILITY_BY_ACTION[action];
  let goal = GOAL_BY_ACTION[action];

  if (action === "ask_knowledge" && target.kind === "object") {
    capability = "object";
    goal = "help_how_to";
  }

  if (action === "navigate") {
    capability = "navigation";
    goal = "explicit_navigation";
  }

  if (action === "ask_knowledge" && target.kind === "room") {
    capability = "room";
    goal = "help_how_to";
  }

  const confidence =
    strength === "strong"
      ? "high"
      : strength === "moderate" && target.kind !== "unknown"
        ? "high"
        : strength === "moderate"
          ? "medium"
          : target.kind !== "unknown"
            ? "medium"
            : "low";

  return {
    action,
    target,
    nextStep,
    confidence,
    source,
    conversationGoal: goal,
    estateCapability: capability,
    reason,
  };
}

export function upgradeGoalFromSemantic(
  regexGoal: ConversationGoal,
  semantic: SemanticMemberIntent | null,
): ConversationGoal {
  if (!semantic || semantic.confidence === "low") return regexGoal;
  if (regexGoal !== "general_conversation") return regexGoal;
  if (semantic.conversationGoal) return semantic.conversationGoal;
  return regexGoal;
}

export function semanticNeedsEstateIntelligence(
  semantic: SemanticMemberIntent | null,
): boolean {
  if (!semantic || semantic.confidence === "low") return false;
  if (semantic.action === "conversation") return false;
  if (
    semantic.action === "research" ||
    semantic.action === "create" ||
    semantic.action === "retrieve" ||
    semantic.action === "capture" ||
    semantic.action === "continue_session"
  ) {
    return false;
  }
  return (
    semantic.target.kind !== "unknown" ||
    semantic.action === "discovery" ||
    semantic.action === "recommendation"
  );
}

export function isSemanticNavigationRequest(
  semantic: SemanticMemberIntent | null,
): boolean {
  if (!semantic) return false;
  return (
    semantic.action === "navigate" &&
    semantic.confidence !== "low" &&
    targetKindSupportsNavigation(semantic.target)
  );
}

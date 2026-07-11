/**
 * Semantic Intent Resolver — meaning-first orchestration.
 *
 * Regex classifiers remain a fast path. When meaning is clear from KB + signals,
 * route by meaning — not exact phrases like “take me to”.
 */

import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import {
  detectOpenFeatureSignal,
  inferActionFromSignals,
  tryRegexFastPathGoal,
} from "./intentSignals";
import {
  enrichSemanticIntent,
  determineNextStep,
  mergeActionWithTarget,
} from "./mapToRouting";
import { resolveSemanticTarget } from "./resolveTarget";
import type {
  SemanticIntentContext,
  SemanticMemberIntent,
} from "./types";

const CONVERSATION_FALLBACK: SemanticMemberIntent = {
  action: "conversation",
  target: { kind: "unknown" },
  nextStep: "conversation_fallback",
  confidence: "low",
  source: "semantic_signal",
  reason: "no_clear_meaning",
};

function goalToSemanticAction(
  goal: ConversationGoal,
): SemanticMemberIntent["action"] | null {
  switch (goal) {
    case "explicit_navigation":
      return "navigate";
    case "research":
      return "research";
    case "create":
      return "create";
    case "retrieve":
      return "retrieve";
    case "capture":
      return "capture";
    case "help_how_to":
      return "ask_how_to";
    case "discovery_estate":
      return "discovery";
    case "continue_session":
      return "continue_session";
    default:
      return null;
  }
}

function fromRegexFastPath(
  goal: ConversationGoal,
  context: SemanticIntentContext,
): SemanticMemberIntent {
  let action = goalToSemanticAction(goal) ?? "conversation";
  if (goal === "help_how_to" && detectOpenFeatureSignal(context.userText)) {
    action = "open_feature";
  }
  const target = resolveSemanticTarget(context.userText);
  const nextStep = determineNextStep(action, target, context.userText);

  return enrichSemanticIntent(
    action,
    target,
    nextStep,
    "regex_fast_path",
    "strong",
    `regex_fast_path:${goal}`,
  );
}

/**
 * Resolve what the member is trying to do, what they're referring to, and what should happen next.
 */
export function resolveSemanticMemberIntent(
  context: SemanticIntentContext,
): SemanticMemberIntent {
  const userText = context.userText.trim();
  if (!userText) return CONVERSATION_FALLBACK;

  const regexGoal = tryRegexFastPathGoal(context);
  if (regexGoal) {
    return fromRegexFastPath(regexGoal, context);
  }

  const target = resolveSemanticTarget(userText);
  const signal = inferActionFromSignals(userText, context);
  const action = mergeActionWithTarget(signal, target, userText);
  const nextStep = determineNextStep(action, target, userText);

  if (action === "conversation" && target.kind === "unknown") {
    return CONVERSATION_FALLBACK;
  }

  return enrichSemanticIntent(
    action,
    target,
    nextStep,
    target.kind !== "unknown" ? "semantic_kb" : "semantic_signal",
    signal.strength,
    `semantic:${action}:${target.kind}`,
  );
}

export function isSemanticIntentResolverEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_SEMANTIC_INTENT_RESOLVER !== "0";
}

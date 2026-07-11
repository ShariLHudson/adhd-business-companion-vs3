/**
 * Intent adapter — Decision Engine is source of truth; primaryTurnClassifier adapts.
 */

import type {
  PrimaryConversationType,
  PrimaryTurnConfidence,
  PrimaryTurnDecision,
} from "@/lib/conversation/primaryTurnClassifier";
import {
  isDiscoveryLanguageNotCreate,
  isExplicitCreateRequestForRecognition,
} from "@/lib/sparkRecognitionEngine";
import type {
  SparkDecisionEngineDecision,
  SparkPrimaryIntent,
} from "./sparkDecisionEngine/types";

export function mapSparkIntentToPrimaryType(
  intent: SparkPrimaryIntent,
): PrimaryConversationType {
  switch (intent) {
    case "CREATE":
    case "THINK":
      return "TASK_REQUEST";
    case "SUPPORT":
      return "EMOTIONAL_SUPPORT";
    case "LEARN":
    case "EXPLORE":
      return "INFORMATION_OR_RESEARCH";
    default:
      return "RELATIONSHIP_CHAT";
  }
}

const PRIMARY_OWNERS: Record<PrimaryConversationType, string> = {
  RELATIONSHIP_CHAT: "chat",
  DIRECT_COMMAND: "kernel",
  IMPLIED_NEED: "frictionless:implied_need",
  TASK_REQUEST: "frictionless:decision_engine",
  EMOTIONAL_SUPPORT: "frictionless:decision_engine",
  INFORMATION_OR_RESEARCH: "chat:decision_engine",
  RECOGNITION: "recognition:lifecycle",
};

function buildAdaptedPrimaryDecision(
  type: PrimaryConversationType,
  confidence: PrimaryTurnConfidence,
  reason: string,
): PrimaryTurnDecision {
  const blockKernel = type !== "DIRECT_COMMAND";
  return {
    type,
    confidence,
    owner: PRIMARY_OWNERS[type],
    reason,
    blockKernelNavigation: blockKernel,
    blockBridgeResponder: true,
    blockCollectionOffer: type !== "DIRECT_COMMAND",
    blockSecondaryResponders: true,
  };
}

/**
 * Map a Decision Engine result to primary-turn taxonomy (adapter layer).
 */
export function primaryTurnFromDecisionEngine(
  decision: SparkDecisionEngineDecision,
  reasonPrefix = "decision engine",
): PrimaryTurnDecision {
  const type = mapSparkIntentToPrimaryType(decision.intent);
  return buildAdaptedPrimaryDecision(
    type,
    decision.intentConfidence,
    `${reasonPrefix}: ${decision.intent} (${decision.reason})`,
  );
}

/**
 * Reconcile legacy primary classification with Decision Engine when engine confidence is high.
 * CREATE + high is terminal — except discovery language (preserve-first, not Create).
 */
export function reconcilePrimaryTurnWithDecisionEngine(
  legacy: PrimaryTurnDecision,
  decision: SparkDecisionEngineDecision,
  userText?: string,
): PrimaryTurnDecision {
  const text = userText?.trim() ?? "";
  const discoveryNotCreate =
    Boolean(text) &&
    isDiscoveryLanguageNotCreate(text) &&
    !isExplicitCreateRequestForRecognition(text);

  // Recognition lifecycle owns the turn — do not let CREATE override discoveries.
  if (legacy.type === "RECOGNITION" || discoveryNotCreate) {
    if (legacy.type === "RECOGNITION") return legacy;
    return {
      type: "RECOGNITION",
      confidence: "high",
      owner: "recognition:lifecycle",
      reason:
        "discovery language — Evidence Vault preserve-first (blocks decision-engine CREATE)",
      blockKernelNavigation: true,
      blockBridgeResponder: true,
      blockCollectionOffer: true,
      blockSecondaryResponders: true,
    };
  }

  if (decision.intent === "CREATE" && decision.intentConfidence === "high") {
    return {
      type: "TASK_REQUEST",
      confidence: "high",
      owner: "frictionless:universal_creation",
      reason: `decision engine CREATE (terminal): ${decision.reason}`,
      blockKernelNavigation: true,
      blockBridgeResponder: true,
      blockCollectionOffer: true,
      blockSecondaryResponders: true,
    };
  }

  if (
    legacy.owner === "frictionless:universal_creation" &&
    legacy.type === "TASK_REQUEST"
  ) {
    return legacy;
  }

  if (
    legacy.type === "DIRECT_COMMAND" ||
    legacy.type === "RELATIONSHIP_CHAT" ||
    legacy.type === "IMPLIED_NEED"
  ) {
    return legacy;
  }

  if (decision.intentConfidence !== "high") {
    return legacy;
  }

  const adapted = primaryTurnFromDecisionEngine(decision, "decision engine override");
  if (legacy.type === adapted.type) {
    return legacy;
  }

  return adapted;
}

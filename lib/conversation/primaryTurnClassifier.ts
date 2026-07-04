/**
 * Primary turn classifier — ONE category owns each member message before any responder runs.
 *
 * Order: DIRECT_COMMAND → RELATIONSHIP_CHAT → INFORMATION_OR_RESEARCH → TASK_REQUEST
 *        → EMOTIONAL_SUPPORT → IMPLIED_NEED → default chat
 */

import { isRegistryArtifactExecution } from "@/lib/artifactRegistry";
import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { shouldEnterDiscoveryMode } from "@/lib/estateBrain/discoveryMode";
import { isResearchIntent } from "@/lib/estateBrain/researchRouting";
import { isKnowledgeQuestion } from "@/lib/knowledgeIntelligence";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import { evaluateImpliedNeed } from "@/lib/intentAwareConversation/impliedNeed";
import { loadImpliedNeedSession } from "@/lib/intentAwareConversation/impliedNeedSession";
import {
  isLikelyMenuSelectionInput,
  loadPendingChoice,
} from "@/lib/pendingChoice";
import { isRelationshipConversation } from "@/lib/intentAwareConversation/routingGate";
import {
  evaluateSparkDecisionEngine,
  reconcilePrimaryTurnWithDecisionEngine,
} from "@/lib/sparkCompanion";

export type PrimaryConversationType =
  | "RELATIONSHIP_CHAT"
  | "DIRECT_COMMAND"
  | "IMPLIED_NEED"
  | "TASK_REQUEST"
  | "EMOTIONAL_SUPPORT"
  | "INFORMATION_OR_RESEARCH";

export type PrimaryTurnConfidence = "high" | "medium" | "low";

export type PrimaryTurnDecision = {
  type: PrimaryConversationType;
  confidence: PrimaryTurnConfidence;
  owner: string;
  reason: string;
  blockKernelNavigation: boolean;
  blockBridgeResponder: boolean;
  blockCollectionOffer: boolean;
  blockSecondaryResponders: boolean;
};

export type ClassifyPrimaryTurnInput = {
  userText: string;
  lastAssistantText?: string | null;
};

const DIRECT_NAV_RE =
  /\b(?:take me(?: to)?|go to|bring me(?: to)?|head to|visit(?: the)?|show me(?: the)?)\b/i;

const DIRECT_OPEN_RE =
  /\bopen\s+(?:the\s+)?(?:coffee house|library|greenhouse|conservatory|create|plan my day|momentum|content generator|decision compass)\b/i;

const TASK_REQUEST_RE =
  /\b(?:help me (?:create|write|draft|build|make|plan|organize)|write (?:a|an|my)|create (?:a|an|my)|draft (?:a|an|my)|build (?:a|an|my)|make (?:a|an|my))\b/i;

const EMOTIONAL_SUPPORT_RE =
  /\b(?:i'?m overwhelmed|i feel overwhelmed|(?:i'?m|i am) discouraged|burned out|burnt out|so anxious|panicking|hopeless|can'?t do this|everything feels (?:heavy|hard|too much)|really struggling|feel(?:ing)? defeated|no motivation left)\b/i;

const INFORMATION_RE =
  /^\s*(?:research|explain|compare|what is|what are|how does|how do|tell me about|describe)\b/i;

function directCommand(text: string, lastAssistantText?: string | null): boolean {
  if (TASK_REQUEST_RE.test(text)) return false;
  if (INFORMATION_RE.test(text) || /\bresearch\b/i.test(text)) return false;
  if (DIRECT_NAV_RE.test(text) || DIRECT_OPEN_RE.test(text)) return true;
  if (detectDirectCommand(text, { lastAssistantText })) return true;
  return false;
}

function taskRequest(text: string): boolean {
  if (shouldEnterDiscoveryMode(text)) return true;
  if (shouldEnterUniversalCreation(text)) return true;
  if (isRegistryArtifactExecution(text)) return true;
  if (TASK_REQUEST_RE.test(text)) return true;
  return false;
}

function informationOrResearch(text: string): boolean {
  if (isResearchIntent(text)) return true;
  if (isKnowledgeQuestion(text)) return true;
  if (INFORMATION_RE.test(text)) return true;
  if (/\bresearch\b/i.test(text) && text.split(/\s+/).length <= 14) return true;
  return false;
}

function emotionalSupport(text: string): boolean {
  return EMOTIONAL_SUPPORT_RE.test(text);
}

function buildDecision(
  type: PrimaryConversationType,
  confidence: PrimaryTurnConfidence,
  reason: string,
): PrimaryTurnDecision {
  const owners: Record<PrimaryConversationType, string> = {
    RELATIONSHIP_CHAT: "chat",
    DIRECT_COMMAND: "kernel",
    IMPLIED_NEED: "frictionless:implied_need",
    TASK_REQUEST: "frictionless:discovery",
    EMOTIONAL_SUPPORT: "frictionless:support",
    INFORMATION_OR_RESEARCH: "chat:research",
  };

  const blockKernel = type !== "DIRECT_COMMAND";
  const blockCollection =
    type !== "DIRECT_COMMAND";

  return {
    type,
    confidence,
    owner: owners[type],
    reason,
    blockKernelNavigation: blockKernel,
    blockBridgeResponder: true,
    blockCollectionOffer: blockCollection,
    blockSecondaryResponders: true,
  };
}

/**
 * Classify member message into exactly one primary conversation type.
 */
export function classifyPrimaryConversationTurn(
  input: ClassifyPrimaryTurnInput,
): PrimaryTurnDecision {
  const legacy = classifyPrimaryConversationTurnLegacy(input);
  const decision = evaluateSparkDecisionEngine({
    userText: input.userText.trim(),
  });
  return reconcilePrimaryTurnWithDecisionEngine(legacy, decision);
}

function classifyPrimaryConversationTurnLegacy(
  input: ClassifyPrimaryTurnInput,
): PrimaryTurnDecision {
  const text = input.userText.trim();
  if (!text) {
    return buildDecision("RELATIONSHIP_CHAT", "low", "empty message");
  }

  if (loadImpliedNeedSession()) {
    return buildDecision("IMPLIED_NEED", "high", "active implied need menu continuation");
  }

  const pendingChoice = loadPendingChoice();
  if (
    pendingChoice?.choices.length &&
    isLikelyMenuSelectionInput(text, pendingChoice.choices.length)
  ) {
    return buildDecision(
      "DIRECT_COMMAND",
      "high",
      "pending numbered menu selection — not a new conversation",
    );
  }

  if (directCommand(text, input.lastAssistantText)) {
    return buildDecision("DIRECT_COMMAND", "high", "explicit navigation or open command");
  }

  if (isRelationshipConversation(text)) {
    return buildDecision("RELATIONSHIP_CHAT", "high", "relationship / small talk");
  }

  if (isEstateGuideQuestion(text)) {
    return buildDecision(
      "INFORMATION_OR_RESEARCH",
      "high",
      "capability / estate guide — answer in conversation",
    );
  }

  if (informationOrResearch(text)) {
    return buildDecision(
      "INFORMATION_OR_RESEARCH",
      "high",
      "information, explain, compare, or research",
    );
  }

  if (taskRequest(text)) {
    const base = buildDecision(
      "TASK_REQUEST",
      "high",
      shouldEnterUniversalCreation(text)
        ? "CREATE fast path — universal creation"
        : "task or creation request — discovery first",
    );
    if (shouldEnterUniversalCreation(text)) {
      return { ...base, owner: "frictionless:universal_creation" };
    }
    return base;
  }

  if (emotionalSupport(text)) {
    return buildDecision("EMOTIONAL_SUPPORT", "high", "emotional support signal");
  }

  const implied = evaluateImpliedNeed(text);
  if (implied) {
    return buildDecision(
      "IMPLIED_NEED",
      "high",
      `implied need: ${implied.matchKey}`,
    );
  }

  if (text.includes("?")) {
    return buildDecision(
      "INFORMATION_OR_RESEARCH",
      "medium",
      "question default — answer in conversation",
    );
  }

  return buildDecision("RELATIONSHIP_CHAT", "low", "general conversation — stay in chat");
}

export function primaryTurnAllowsKernel(decision: PrimaryTurnDecision): boolean {
  return decision.type === "DIRECT_COMMAND";
}

export function primaryTurnAllowsFrictionlessCategory(
  decision: PrimaryTurnDecision,
  category: string,
): boolean {
  switch (decision.type) {
    case "DIRECT_COMMAND":
      return category === "none";
    case "RELATIONSHIP_CHAT":
    case "INFORMATION_OR_RESEARCH":
      return category === "none" || category === "estate_guide";
    case "IMPLIED_NEED":
      return category === "implied_need" || category === "none";
    case "TASK_REQUEST":
      return (
        category === "universal_creation" ||
        category === "estate_discovery" ||
        category === "direct_action" ||
        category === "google_sheet" ||
        category === "none"
      );
    case "EMOTIONAL_SUPPORT":
      return (
        category === "emotional_regulation" ||
        category === "adhd_emotional_friction" ||
        category === "friction_first" ||
        category === "estate_restoration" ||
        category === "estate_concierge" ||
        category === "focus_support" ||
        category === "none"
      );
    default: {
      const _exhaustive: never = decision.type;
      return _exhaustive;
    }
  }
}

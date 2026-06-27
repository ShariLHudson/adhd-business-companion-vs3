/**
 * Product Expansion Uncertainty — validation scenario helpers.
 */

import type { ChatTurn } from "../companionIntelligence";
import { buildCompanionDecisionIntelligence } from "./companionDecisionIntelligence";
import { continuationForWorkflowWithIntent } from "../conversationWorkflowContinuation";
import { createConversationWorkflow } from "../conversationWorkflowContinuation";
import { isForbiddenResetMessage } from "./acceptedIntentLock";

export const PRODUCT_EXPANSION_SCENARIO = {
  id: "product-expansion-uncertainty",
  label: "Product Expansion Uncertainty",
  turns: [
    {
      role: "user" as const,
      content: "I want to add a new product line to my business",
    },
    {
      role: "assistant" as const,
      content:
        "Before we look at options — who buys your current offer today, and what would this new line be?",
    },
    {
      role: "user" as const,
      content:
        "I sell 1:1 coaching to solo entrepreneurs. The new line would be group programs at about half the price.",
    },
    {
      role: "assistant" as const,
      content:
        "That helps. What worries you most — existing clients feeling devalued, pricing, or whether people will buy the group?",
    },
    {
      role: "user" as const,
      content:
        "I'm worried existing clients will feel devalued and I'm not sure about pricing.",
    },
    {
      role: "assistant" as const,
      content:
        "We've got enough to structure this. Would you like to walk through it in **Decision Compass** — comparing keep both, replace, or phasing in the group offer?",
    },
    {
      role: "user" as const,
      content: "Yes",
    },
  ],
};

export type ProductExpansionEvaluation = {
  turnIndex: number;
  experienceMode: string;
  complexityLevel: string;
  decisionType: string;
  discoveryComplete: boolean;
  shouldDeferSolutions: boolean;
  decisionCompassCandidate: boolean;
  decisionCompassOfferReady: boolean;
  acceptanceResolved: boolean;
  continuationForbiddenReset: boolean;
  recommendationReady: boolean;
};

export function evaluateProductExpansionTurn(
  messages: ChatTurn[],
  lastUserMessage: string,
  lastAssistantText = "",
): ProductExpansionEvaluation {
  const intel = buildCompanionDecisionIntelligence({
    messages,
    userText: lastUserMessage,
    lastAssistantText,
  });

  const dc = intel.resources.find((r) => r.id === "decision_compass");
  const workflow = lastAssistantText
    ? createConversationWorkflow(lastAssistantText, messages.length)
    : null;
  const continuation =
    workflow && lastUserMessage.trim().toLowerCase() === "yes"
      ? continuationForWorkflowWithIntent(workflow, {
          pendingDecision: "keep current, replace, or offer both",
          currentProblem: "adding a new product line",
        })
      : null;

  const turnIndex = messages.filter((m) => m.role === "user").length;

  return {
    turnIndex,
    experienceMode: intel.experienceMode,
    complexityLevel: intel.complexity.level,
    decisionType: intel.situation.decisionType,
    discoveryComplete: intel.complexity.discoveryComplete,
    shouldDeferSolutions: intel.shouldDeferSolutions,
    decisionCompassCandidate: Boolean(dc && dc.confidence >= 0.5),
    decisionCompassOfferReady: Boolean(dc?.offerReady),
    acceptanceResolved: Boolean(intel.acceptance?.accepted),
    continuationForbiddenReset: continuation
      ? !isForbiddenResetMessage(continuation.message)
      : true,
    recommendationReady:
      intel.experienceMode === "decision" &&
      intel.complexity.discoveryComplete &&
      intel.situation.decisionType === "business_expansion",
  };
}

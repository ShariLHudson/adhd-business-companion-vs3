/**
 * Gold Standard retrieval adapter for CIE (package 199).
 */

import {
  retrieveGoldStandardGuidance,
  type GscRetrievalResult,
  type GoldStandardConversation,
} from "@/lib/goldStandardConversationLibrary";
import type {
  ConversationPlan,
  ConversationRuntimeState,
  RetrievedExampleReference,
} from "./types";

export function retrieveGoldStandardExamples(input: {
  userText: string;
  state: ConversationRuntimeState;
  phase: string;
  clarificationOrRepair?: boolean;
}): GscRetrievalResult {
  return retrieveGoldStandardGuidance({
    userText: input.userText,
    topicAnchor: input.state.topicAnchor?.primaryTopic,
    conversationPhase: input.phase,
    knownConcerns: input.state.currentFocus
      ? [input.state.currentFocus.label]
      : [],
    rejectedInterpretations: input.state.rejectedInterpretations.map(
      (r) => r.interpretation,
    ),
    clarificationOrRepair: input.clarificationOrRepair,
  });
}

export function toRetrievedExampleReferences(
  result: GscRetrievalResult,
): RetrievedExampleReference[] {
  return result.hits.slice(0, 4).map((hit) => ({
    conversationId: hit.conversation.id,
    similarityReason: hit.matchedTags.join(", ") || "topic/intent match",
    applicableMove: result.suggestedMove ?? "other",
    prohibitedPatterns: hit.conversation.blockedAlternatives.map((b) => b.text),
    confidence: hit.score,
  }));
}

/** Compact guidance block for generators — never inject full conversations. */
export function buildGoldGuidanceBlock(
  plan: ConversationPlan,
  examples: readonly GoldStandardConversation[],
): string {
  const lines = [
    `Move: ${plan.conversationalMove}`,
    `Length: ${plan.desiredResponseLength}`,
    `Topic: ${plan.activeTopic ?? "(emerging)"}`,
    `Blocked: ${plan.blockedFailurePatterns.slice(0, 4).join(" | ") || "none"}`,
  ];
  if (examples[0]?.turns[1]?.whyItWorks) {
    lines.push(`Pattern: ${examples[0].turns[1].whyItWorks}`);
  }
  return lines.join("\n");
}

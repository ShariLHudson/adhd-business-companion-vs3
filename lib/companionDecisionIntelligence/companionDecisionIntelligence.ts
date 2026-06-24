/**
 * Companion Decision Intelligence™ — unified turn evaluation.
 */

import {
  progressiveDiscoveryHintForChat,
  resolveProgressiveDiscoveryStep,
} from "../progressiveDiscoveryIntelligence";
import { scoreDecisionComplexity } from "./decisionComplexityScore";
import { resolveSituationAtlasDecision } from "./situationAtlasDecision";
import {
  evaluateResourceCandidates,
  topResourceCandidate,
} from "./resourceKnowledgeGraph";
import {
  acceptedIntentLockHintForChat,
  resolveAcceptedIntent,
} from "./acceptedIntentLock";
import {
  experienceModeHintForChat,
  resolveExperienceMode,
} from "./experienceOrchestrator";
import { isBareGenericAcceptance } from "../pendingAcceptanceAuthority";
import type { ChatTurn } from "../companionIntelligence";
import type { BuildDecisionIntelligenceInput, CompanionDecisionIntelligence } from "./types";

export function buildCompanionDecisionIntelligence(
  input: BuildDecisionIntelligenceInput,
): CompanionDecisionIntelligence {
  const complexity = scoreDecisionComplexity({
    messages: input.messages,
    userText: input.userText,
  });
  const situation = resolveSituationAtlasDecision({
    messages: input.messages,
    userText: input.userText,
  });
  const resources = evaluateResourceCandidates({ situation, complexity });
  const topResource = topResourceCandidate(resources);
  const acceptance = resolveAcceptedIntent({
    userText: input.userText,
    lastAssistantText: input.lastAssistantText,
    outcomeThread: input.outcomeThread,
  });
  const userJustAccepted = isBareGenericAcceptance(input.userText.trim());
  const experienceMode = resolveExperienceMode({
    complexity,
    topResource,
    acceptance,
    userJustAccepted,
  });

  const shouldDeferSolutions =
    experienceMode === "discovery" &&
    (complexity.level === "medium" || complexity.level === "high");

  const shouldOfferTopResource =
    experienceMode === "decision" &&
    Boolean(topResource?.offerReady) &&
    !userJustAccepted;

  return {
    complexity,
    situation,
    resources,
    topResource,
    experienceMode,
    acceptance,
    shouldDeferSolutions,
    shouldOfferTopResource,
  };
}

export function companionDecisionIntelligenceHintForChat(
  intel: CompanionDecisionIntelligence,
  context?: { userText: string; messages: ChatTurn[] },
): string {
  const parts: string[] = [
    "COMPANION DECISION INTELLIGENCE™ (mandatory):",
    "Sequence: Understand first → Think second → Choose experience third → Follow through fourth → Outcome fifth.",
    `Decision Complexity: ${intel.complexity.level} (max ${intel.complexity.targetDiscoveryQuestions} discovery questions; ${intel.complexity.discoveryQuestionsAsked} asked).`,
    `Surface question: ${intel.situation.surfaceQuestion.slice(0, 120)}`,
    `Actual situation: ${intel.situation.actualSituation}`,
    `Decision type: ${intel.situation.decisionType.replace(/_/g, " ")} | Risk: ${intel.situation.riskLevel}`,
    experienceModeHintForChat(intel.experienceMode),
  ];

  if (intel.shouldDeferSolutions && context) {
    parts.push(
      progressiveDiscoveryHintForChat({
        userText: context.userText,
        messages: context.messages,
        complexityLevel: intel.complexity.level,
      }),
    );
  } else if (intel.shouldDeferSolutions) {
    parts.push(
      "DO NOT offer solutions, options lists, or workspace tools on this turn.",
      "Ask ONE question only — wait for the answer before the next.",
    );
  }

  if (intel.shouldOfferTopResource && intel.topResource) {
    const step = context
      ? resolveProgressiveDiscoveryStep({
          userText: context.userText,
          messages: context.messages,
          complexityLevel: intel.complexity.level,
        })
      : null;
    parts.push(
      `RESOURCE ESCALATION: ${intel.topResource.label} confidence ${Math.round(intel.topResource.confidence * 100)}% — ${intel.topResource.reason}`,
      step?.offerLine
        ? `Suggested offer: "${step.offerLine}"`
        : `Offer ${intel.topResource.label} with permission first.`,
    );
  }

  if (intel.acceptance?.accepted) {
    parts.push(acceptedIntentLockHintForChat(intel.acceptance));
  }

  if (intel.experienceMode === "decision" && intel.situation.decisionType === "business_expansion") {
    parts.push(
      "PRODUCT EXPANSION: Frame as business expansion — not simple product pick.",
      "Variables: customer satisfaction, pricing, adoption, risk, revenue, confidence.",
      "When ready, recommend keep / replace / both / phased — with one clear next step.",
    );
  }

  return parts.join("\n");
}

export { syncOutcomeThreadFromDecisionIntelligence, pendingDecisionLabelForIntelligence } from "./outcomeThreadSync";
export { shouldOfferDecisionCompassForTurn } from "./decisionCompassOfferGate";

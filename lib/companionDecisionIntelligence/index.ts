/**
 * Companion Decision Intelligence — public API.
 *
 * Philosophical framework: docs/COMPANION_DECISION_INTELLIGENCE.md
 * Needs + room judgment: lib/companionNeedsIntelligence/
 */

export type * from "./types";
export {
  buildCompanionDecisionIntelligence,
  companionDecisionIntelligenceHintForChat,
} from "./companionDecisionIntelligence";
export { scoreDecisionComplexity } from "./decisionComplexityScore";
export { resolveSituationAtlasDecision } from "./situationAtlasDecision";
export {
  evaluateResourceCandidates,
  topResourceCandidate,
  RESOURCE_OFFER_CONFIDENCE_THRESHOLD,
} from "./resourceKnowledgeGraph";
export {
  resolveAcceptedIntent,
  acceptedIntentLockHintForChat,
  isForbiddenResetMessage,
} from "./acceptedIntentLock";
export {
  resolveExperienceMode,
  experienceModeHintForChat,
} from "./experienceOrchestrator";
export {
  PRODUCT_EXPANSION_SCENARIO,
  evaluateProductExpansionTurn,
} from "./productExpansionScenario";
export {
  pendingDecisionLabelForIntelligence,
  syncOutcomeThreadFromDecisionIntelligence,
} from "./outcomeThreadSync";
export { shouldOfferDecisionCompassForTurn } from "./decisionCompassOfferGate";

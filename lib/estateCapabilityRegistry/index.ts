/**
 * Estate Capability Registry — unified inventory + concierge + recommendations.
 *
 * Spark consults this before routing. Never guess what exists.
 *
 * @see docs/estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md
 */

export type {
  CapabilityConsultMatch,
  CapabilityRecommendationOption,
  CompletionWorkflowId,
  EstateCapabilityEntry,
  EstateCapabilityKind,
  EstateConciergeDecision,
  SparkConversationState,
} from "./types";

export {
  ESTATE_CAPABILITY_CATALOG,
  capabilityById,
  capabilitiesForRoom,
  relatedCapabilities,
} from "./catalog";

export {
  consultEstateCapabilities,
  consultBestCapability,
  consultCapabilityById,
  consultRelatedCapabilities,
  capabilityMatchesExplicitRequest,
} from "./consult";

export {
  recommendCapabilitiesForGoal,
  formatRecommendationLine,
} from "./goalRecommendations";

export {
  readConversationState,
  writeConversationState,
  clearConversationWorkflow,
  setConversationGoal,
  setActiveCapability,
  setCurrentRoom,
  conversationAlreadyKnows,
  conversationStateHint,
} from "./conversationState";

export {
  resolveEstateConcierge,
  estateConciergeResponseHint,
  capabilityForConciergeChoice,
  resolveCapabilityFromNumberedChoice,
  type EstateConciergeInput,
} from "./estateConcierge";

export {
  completionWorkflowFor,
  formatCompletionOfferLine,
  STANDARD_CREATION_COMPLETION,
  type CompletionActionId,
  type CompletionWorkflowDefinition,
} from "./completionWorkflow";

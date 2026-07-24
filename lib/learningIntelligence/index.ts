/**
 * Learning Intelligence — pilot surface for Visual Thinking integration.
 */

export type {
  LearningKnowledgeLevel,
  LearningStage,
  LearningMode,
  LearningVisualPurpose,
  LearningApprovedKnowledgeItem,
  LearningSessionSnapshot,
  LearningReturnContext,
} from "./types";

export {
  assessLearningVisualThinkingRecommendation,
  createVisualThinkingContextFromLearning,
  detectsExplicitLearningVisualRequest,
  declineLearningVisualRecommendation,
  getLearningVisualSuppression,
  buildLearningReturnFromVisual,
  offerLearningInsightWriteback,
  approveLearningInsightWriteback,
  visualActivityCountsAsLearningEvidence,
  buildLearningVisualFailureRecovery,
  loadReturnContext,
  recordLearningVtEvent,
  listLearningVtObservabilityEvents,
  clearLearningVtPilotSessionState,
  LEARNING_VT_SESSION_KEY,
  LEARNING_VT_RETURN_KEY,
  purposeToPresentation,
  purposeToCapability,
  inferPurpose,
  type LearningVisualThinkingIntegrationRequest,
  type LearningVisualThinkingRecommendation,
  type VisualThinkingLearningReturn,
  type LearningVisualInsightWritebackOffer,
  type LearningVtPilotEvent,
  type LearningVtObservabilityEvent,
  type LearningToVisualThinkingAdapterResult,
} from "./visualThinkingIntegration";

export {
  projectLearningVisualInvitation,
  type LearningVisualInvitationProjection,
} from "./learningVisualInvitation";

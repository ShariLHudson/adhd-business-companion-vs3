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
  projectSupportingWrittenLearningView,
  type LearningToVisualThinkingAdapterResult,
} from "./visualThinkingIntegration";

export {
  projectLearningVisualInvitation,
  type LearningVisualInvitationProjection,
} from "./learningVisualInvitation";

export {
  assessLearningPilotRecommendation,
  buildLearningRecommendationContext,
  buildLearningIntegrationRequestV2,
  buildWorkspaceLearningContext,
  projectSelectedLearningActions,
  createAskInLearningHandoff,
  loadAskInLearningHandoff,
  clearAskInLearningHandoff,
  offerLearningNoteWriteback,
  resolveLearningNoteWriteback,
  buildLearningReturnV2,
  assertLearningProgressPreserved,
  getSupportingWrittenLearningView,
  loadLearningIntegrationRequest,
  loadWorkspaceLearningContext,
  clearLearningPilotV2State,
  learningPilotFailureRecovery,
  inferLearningVisualPurpose,
  LEARNING_VT_INTEGRATION_KEY,
  type LearningVisualThinkingIntegrationRequestV2,
  type WorkspaceLearningContext,
  type VisualThinkingLearningQuestionHandoff,
  type VisualThinkingLearningReturnV2,
  type LearningSelectedObjectAction,
  type LearningNoteWritebackOffer,
} from "./learningVisualThinkingPilot";

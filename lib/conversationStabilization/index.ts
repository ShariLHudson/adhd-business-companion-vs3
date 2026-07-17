export {
  classifyConversationGoal,
  isCaptureIntent,
  isCreationUncertainty,
  isExplicitNavigationIntent,
  isProjectNamingContinuation,
  isRetrieveIntent,
  isTemplateIntent,
  TASK_GOALS_BLOCKING_ESTATE,
  type ConversationGoal,
} from "./goalClassifier";

export {
  arbitrateConversationRouting,
  isConversationStabilizationEnabled,
  shouldBlockEstateSubsystem,
  type ActiveSessionKind,
  type ArbitrationResult,
  type EstateSubsystem,
} from "./arbitration";

export {
  ESTATE_INTELLIGENCE_CAPABILITIES,
  TASK_CAPABILITIES,
  type CapabilityConfidence,
  type CapabilityEvaluation,
  type EstateCapability,
} from "./capabilityTypes";

export { evaluateEstateIntelligenceCandidates } from "./estateIntelligenceCheck";
export { selectWinningCapability } from "./selectWinningCapability";
export {
  runConversationRoutingPipeline,
  type RoutingPipelineInput,
  type RoutingPipelineResult,
} from "./routingPipeline";

export { logConversationRoutingTrace } from "./routingTrace";
export { tryStabilizationFastPath, type StabilizationFastPathResult } from "./fastPath";

export {
  authorizeBreatheAutoOpen,
  authorizeDirectNavigation,
  authorizeScenicPlaceMenu,
  buildConversationDecision,
  computeBreatheAutoOpenAllowed,
  computeScenicPlaceMenuAllowed,
  isConversationDecisionGateEnabled,
  logConversationDecision,
  mayAutoOpenBreathe,
  mayFinishWithScenicMenu,
  mayKernelOfferPlaceMenu,
  type ConversationDecision,
  type ConversationDecisionInput,
  type ConversationDecisionRecord,
  type ConversationPermission,
  type ConversationResponseMode,
} from "./conversationDecision";

export {
  annotateTurnDecision,
  beginTurnDecision,
  buildTurnDecisionLogRecord,
  endTurnDecision,
  getActiveTurnDecision,
  getActiveTurnId,
  getTurnAnnotation,
  getTurnResponseMode,
  restrictTurnPermission,
  turnAllowsBreatheAutoOpen,
  turnAllowsNavigation,
  turnAllowsScenicMenu,
  type TurnDecisionAnnotation,
} from "./turnDecisionStore";

export {
  applyShariVoiceLayer,
  buildShariVoicePromptBlocks,
  loadShariVoiceProfile,
  previewStyledReply,
  type ApplyShariVoiceInput,
  type ApplyShariVoiceResult,
  type ShariVoiceProfile,
  type ShariVoiceRuntimeMetadata,
} from "./shariVoiceLayer";

export {
  type ActiveTopicConfidence,
  type ActiveTopicState,
  type ActiveTopicStatus,
  isActiveTopicUnresolved,
} from "./activeTopicTypes";

export {
  ACTIVE_TOPIC_STORAGE_KEY,
  clearActiveTopic,
  getActiveTopic,
  loadActiveTopic,
  patchActiveTopic,
  resetActiveTopicStoreForTests,
  saveActiveTopic,
  setActiveTopicStatus,
} from "./activeTopicStore";

export {
  acceptClarificationForActiveTopic,
  chamberNavigateGateForText,
  isBlockedGenericFallbackText,
  isExplicitTopicChangeRequest,
  markActiveTopicAnswered,
  markActiveTopicCompleted,
  processActiveTopicOnUserTurn,
  resolveKnowledgeMemberForTopic,
  shouldAllowChamberKernelExemption,
  shouldBlockGenericFallback,
  topicPreservingFallbackLine,
  type ProcessActiveTopicTurnResult,
} from "./activeTopicGate";

export {
  buildChamberNavigateShariLine,
  isChamberSpecialistIntroText,
  isExplicitChamberNavigationRequest,
  mayNavigateToChamberMember,
  type ChamberNavigateGateResult,
} from "./chamberNavigateGate";

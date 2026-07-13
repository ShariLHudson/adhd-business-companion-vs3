/**
 * Conversation Continuity & Workflow Ownership — public API.
 *
 * Slice 1: model + detection + exit rules.
 * Slice 2: continuity gate before primary / Decision Engine classification.
 */

export type {
  ArtifactOwnerPhase,
  ConversationOwner,
  ConversationOwnerKind,
  PersistedConversationOwnerPointer,
  ResolveActiveOwnerInput,
} from "./types";
export { CONVERSATION_OWNER_STORAGE_KEY } from "./types";

export {
  CONVERSATION_ROUTING_PRIORITY,
  compareOwnerKinds,
  isStickyContinuityOwner,
  ownerKindPriority,
  type ConversationRoutingPriorityStep,
} from "./routingPriority";

export {
  CONTENT_NOT_EXIT_TERMS_RE,
  isExplicitOwnerExit,
  isExplicitTaskChange,
  looksLikeWorkflowContentNotExit,
} from "./exitRules";

export {
  clearConversationOwner,
  loadConversationOwnerPointer,
  persistConversationOwner,
  pointerFromOwner,
  setActiveConversationOwner,
} from "./ownerStore";

export {
  getActiveConversationOwner,
  resolveActiveConversationOwner,
} from "./resolveActiveOwner";

export {
  canOwnerHandleTurn,
  shouldRouteToActiveOwner,
} from "./canOwnerHandleTurn";

export {
  describeOwnerForRecovery,
  isGenericRecoveryCopy,
  recoveryMustNotOverrideOwner,
} from "./describeOwnerForRecovery";

export {
  CONTINUITY_REGRESSION_CASES,
  type ContinuityRegressionCase,
  type ContinuityRegressionCaseId,
} from "./fixtures";

export {
  detectStoredContentOrNavigationDestination,
  type StoredContentDestination,
} from "./storedContentNavigation";

export {
  continuityOwnerApiContextFromOwner,
  continuityOwnerHintForChat,
  type ContinuityOwnerApiContext,
} from "./ownerApiContext";

export {
  routeTurnToOwner,
  type OwnerTurnRouteResult,
  type RouteTurnToOwnerInput,
} from "./routeTurnToOwner";

export {
  continuityGateSkipsPrimaryClassification,
  resolveContinuityTurnGate,
  type ContinuityGateDecision,
  type ResolveContinuityGateInput,
} from "./resolveContinuityGate";

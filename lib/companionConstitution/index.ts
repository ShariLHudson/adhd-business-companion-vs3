export {
  COMPANION_CONSTITUTION_VERSION,
  CONSTITUTIONAL_HIERARCHY,
  CONSTITUTIONAL_RULE,
  ORCHESTRATION_RULE,
  SPECIALIZATION_RULE,
} from "./types";
export type { ConstitutionalLayerId } from "./types";

export {
  createCompanionState,
  type CompanionState,
  type CompanionStateInput,
} from "./companionState";

export { resolveConversationIntelligence } from "./conversationIntelligence/resolveConversation";
export type {
  ConversationIntelligenceInput,
  ConversationIntelligenceVerdict,
  ConversationMode,
  ConversationState,
} from "./conversationIntelligence/types";

export { resolveCompanionIntelligence } from "./companionIntelligence/resolveCompanionIntelligence";
export type {
  CompanionIntelligenceInput,
  CompanionOrchestration,
} from "./companionIntelligence/resolveCompanionIntelligence";

export {
  SPECIALIZED_INTELLIGENCE_IDS,
  SPECIALIZED_INTELLIGENCE_REGISTRY,
  specializedIntelligenceById,
  validateSpecializedIntelligenceRegistry,
  type SpecializedIntelligenceEntry,
  type SpecializedIntelligenceId,
} from "./specializedIntelligence/registry";

export {
  resolveEnvironment,
  resolvePlace,
} from "./environmentIntelligence/resolveEnvironment";
export type {
  EnvironmentBackgroundSpec,
  EnvironmentInput,
  EnvironmentMotionProfile,
  EnvironmentState,
  SceneConditionId,
} from "./environmentIntelligence/types";
export {
  allRoomRegistryEntries,
  roomRegistryEntry,
  roomRegistryForWorkspace,
  ROOM_REGISTRY_PLACE_IDS,
  type RoomRegistryEntry,
} from "./environmentIntelligence/roomRegistry";

export { resolvePresence } from "./presenceIntelligence/resolvePresence";
export {
  PRESENCE_STATES,
  type PresenceInput,
  type PresenceState,
  type PresenceStateId,
} from "./presenceIntelligence/types";

export {
  resolveCompanionRenderContext,
  type CompanionRenderContext,
  type CompanionRenderContextInput,
} from "./pipeline";

export {
  assertConstitutionalPlaceAuthority,
  buildCompanionPageRenderContext,
  sceneForContext,
  sectionToSceneWorkspaceId,
  type CompanionPageGlobalBackground,
  type CompanionPageRenderContext,
  type CompanionPageRenderInput,
} from "./companionPageRenderContext";

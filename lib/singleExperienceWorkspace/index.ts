export {
  SINGLE_EXPERIENCE_WORKSPACE_RULE,
  SINGLE_EXPERIENCE_WORKSPACE_STANDARD_ID,
  type CreationLayoutMode,
} from "./types";

export {
  BANNED_SPLIT_EXPERIENCE_PATTERNS,
  BANNED_SPLIT_EXPERIENCE_PHRASES,
  SINGLE_EXPERIENCE_READY_LINES,
  containsBannedSplitExperienceCopy,
  rewriteBannedSplitExperienceCopy,
} from "./bannedCopy";

export {
  SINGLE_EXPERIENCE_CREATION_SECTIONS,
  coerceLayoutForWorkspaceOpen,
  isLegacyCreateSplitLayout,
  isSingleExperienceCreationSection,
  resolveCreationWorkspaceLayoutMode,
  type SingleExperienceCreationSection,
} from "./layout";

export {
  CREATION_DESTINATION_OWNERSHIP,
  INTERACTION_OWNERSHIP_RULE,
  OWNERSHIP_RUNTIME_EVIDENCE,
  computeOwnershipRuntimeGates,
  hasSingleLegalInteractionOwner,
  is066OwnershipArchitectureComplete,
  is066OwnershipRuntimeComplete,
  is066ReadyForBrowserCertification,
  listIllegalInteractionOwners,
  listOwnershipDefects,
  type CreationComponentClassification,
  type CreationComponentRole,
  type CreationDestinationComponentId,
} from "./interactionOwnership";

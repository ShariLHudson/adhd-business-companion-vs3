/**
 * 050 — Creation Ownership and Collaboration
 * One owner. Many contributors. One result.
 */

export type {
  CreationOwnershipDefinition,
  OwnershipResolutionResult,
  CollaborationDecision,
  CollaborationMode,
  ContributorContextPacket,
  ConflictSynthesisResult,
  PlatformCapabilityId,
} from "./types";

export {
  listOwnershipDefinitions,
  getOwnershipById,
  getOwnershipForObject,
  resolveOwnershipAlias,
  assertOwnershipRegistryIntegrity,
  clearOwnershipRegistryCache,
} from "./ownershipRegistry";

export { resolveOwnership } from "./resolveOwnership";

export {
  decideCollaboration,
  boardAdviceCreatesWorkspace,
  contributorMayCreateOrphan,
} from "./collaborationRules";

export {
  buildContributorContextPacket,
  formatContributorContextForPrompt,
} from "./contributorContext";

export {
  synthesizeOwnershipConflict,
  buildUnifiedOwnerResponse,
} from "./conflictResolution";

export { BLUEPRINT_OWNERSHIP_ENRICHMENT } from "./blueprintOwnershipTable";
export { ASSET_OWNERSHIP_ENRICHMENT } from "./assetOwnershipTable";

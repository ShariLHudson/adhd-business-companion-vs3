/**
 * Universal Blueprint Interface — presentation helpers over UWE public APIs.
 * Does not mint Work IDs, access durable repositories, or own Blueprint registries.
 */

export type {
  BlueprintStartPath,
  BlueprintBrowserSourceFilter,
  BlueprintBrowserView,
  BlueprintBrowserQuery,
  BlueprintBrowserItem,
  MemberBlueprintPreview,
  KnownContextProposal,
  KnownContextReuseDecision,
  DepthChangePreview,
  PreviousWorkBrowserItem,
  BlueprintInterfaceSession,
  SaveAsBlueprintUiState,
  UniversalBlueprintInitResult,
} from "./types";

export {
  browseCompatibleBlueprints,
  resolveBrowserBlueprint,
  defaultRecommendedBlueprintIds,
} from "./browseBlueprints";

export {
  buildMemberBlueprintPreview,
  depthModeMemberLabel,
} from "./buildBlueprintPreview";

export {
  proposeKnownContextReuse,
  applyKnownContextReuseDecision,
} from "./knownContextReuse";

export { previewDepthChange } from "./depthChangePreview";

export {
  readBlueprintInterfaceSession,
  writeBlueprintInterfaceSession,
  clearBlueprintInterfaceSession,
  buildBlueprintInterfaceSession,
} from "./sessionContinuity";

export {
  startFromBlueprintPath,
  listCompatiblePreviousWork,
  startFromPreviousWorkPath,
} from "./startFromPaths";

export {
  resolveCompanyBlueprintAuth,
  type CompanyBlueprintAuth,
} from "./companyScope";

export {
  resolveBlueprintCapabilityManifest,
  listEnabledBlueprintCapabilities,
  type BlueprintCapabilityId,
  type BlueprintCapabilityManifest,
} from "./capabilityManifest";

export {
  ESTATE_AWARENESS_HOOKS,
  listEstateAwarenessHooks,
  getEstateAwarenessHook,
  type EstateAwarenessSurfaceId,
  type EstateAwarenessHook,
} from "./estateAwarenessHooks";

export {
  BLUEPRINT_LINK_MODE_EXPLANATIONS,
  proposeExternalLink,
  type BlueprintExternalLinkMode,
  type PendingExternalLinkProposal,
} from "./blueprintLinkModes";

export {
  buildBlueprintCommandCenter,
  type BlueprintCommandCenterModel,
} from "./blueprintCommandCenter";

export {
  buildRelationshipExplorer,
  type RelationshipExplorerModel,
  type RelationshipExplorerItem,
  type RelationshipExplorerBucketId,
} from "./relationshipExplorer";

export {
  writeBuilderSession,
  readBuilderSession,
  clearBuilderSession,
  type BuilderSessionSnapshot,
} from "./builderSessionRecovery";

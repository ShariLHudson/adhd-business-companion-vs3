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

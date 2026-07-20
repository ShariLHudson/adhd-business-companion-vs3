/**
 * Event Asset Registry — canonical definitions for Events Intelligence.
 * Definitions are reusable. Instances belong to one Event Record / Creation Workspace.
 */

export type {
  AssetRecommendationRule,
  BoardMemberRoleId,
  EventAssetCategory,
  EventAssetCreationMode,
  EventAssetDefinition,
  EventAssetDependency,
  EventAssetInstance,
  EventAssetInstantiationLinks,
  EventAssetRecommendation,
  EventAssetRecommendationBand,
  EventAssetTaskTemplate,
  EventContextField,
  EventReadinessContribution,
  EventTypeApplicability,
  ExportFormat,
  RecommendEventAssetsOptions,
} from "./types";

export { EVENT_ASSET_DEFINITIONS } from "./definitions";
export { defineEventAsset, normalizeEventAssetCategory } from "./defineAsset";
export { EVENT_ASSET_CATEGORIES } from "./types";

export {
  listEventAssetDefinitions,
  getEventAssetDefinition,
  resolveEventAssetDefinition,
  isEventTypeApplicable,
  listEventAssetsForEventType,
  listFocusEventAssetsForType,
} from "./query";

export {
  listEventAssetInstances,
  getEventAssetInstance,
  createEventAssetInstance,
  updateEventAssetInstance,
  linksFromEventRecord,
  clearEventAssetInstancesForTests,
} from "./instances";

export {
  assertEventAssetRegistryIntegrity,
  createAssetIdForEventAsset,
  presentationLabelForEvent,
} from "./integrity";

export {
  recommendEventAssets,
  recommendAssetsForSection,
  type RecommendEventAssetsResult,
} from "./recommendEventAssets";

export {
  buildSectionAssetPanel,
  buildWorkspaceFocusedRecommendations,
  registryCapabilitiesForSection,
  searchEventCapabilityRegistry,
  sectionPanelLoadsFromRegistryOnly,
  type SectionAssetPanel,
} from "./sectionCapabilityPanel";

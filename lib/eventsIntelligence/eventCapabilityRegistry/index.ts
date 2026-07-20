/**
 * 053 — Event Capability Registry & Dynamic Section Runtime
 * Capabilities · Asset Types · Templates — workspace stays focused.
 */

export type {
  EventCapabilityId,
  EventCapabilityDefinition,
  EventAssetTemplateDefinition,
  AddAssetConnectionReceipt,
  AddAssetToSectionInput,
  DynamicSectionRuntimePanel,
} from "./types";

export { EVENT_CAPABILITY_DEFINITIONS } from "./capabilities";
export {
  listEventCapabilities,
  getEventCapability,
  capabilitiesForSection,
  capabilitiesForAssetType,
  resolveCapabilityAlias,
  isFormatApplicable,
  assertEventCapabilityRegistryIntegrity,
} from "./capabilityCatalog";

export {
  EVENT_ASSET_TEMPLATES,
  listEventAssetTemplates,
  getEventAssetTemplate,
  templatesForSectionAssetTypes,
} from "./templates";

export {
  addAssetToSection,
  sectionSupportsAddAsset,
} from "./addAssetToSection";

export {
  buildDynamicSectionRuntimePanel,
  buildFocusSectionRuntimePanels,
  dynamicSectionsLoadFromRegistryOnly,
} from "./dynamicSectionRuntime";

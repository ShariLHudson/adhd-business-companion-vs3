/**
 * 053 — Event Capability Registry types
 * Layer 1: Capabilities · Layer 2: Asset Types · Layer 3: Templates
 */

import type {
  EventAssetCategory,
  EventAssetDefinition,
  EventAssetInstance,
  EventAssetRecommendation,
  FormatApplicability,
  EventTypeApplicability,
} from "../eventAssetRegistry/types";
import type {
  EventLifecyclePhase,
  EventSectionId,
  EventTypeId,
} from "../types";

export type EventCapabilityId =
  | "cap_foundation_strategy"
  | "cap_audience_experience"
  | "cap_program_agenda"
  | "cap_speakers_facilitators"
  | "cap_sponsors_partners"
  | "cap_venue_physical"
  | "cap_virtual_hybrid_tech"
  | "cap_registration_ticketing"
  | "cap_marketing_promotion"
  | "cap_communications"
  | "cap_finance_budget"
  | "cap_vendors_procurement"
  | "cap_staff_volunteers"
  | "cap_hospitality_food"
  | "cap_travel_lodging"
  | "cap_accessibility_inclusion"
  | "cap_safety_risk"
  | "cap_supplies_signage_swag"
  | "cap_production_run_of_show"
  | "cap_echo_command_center"
  | "cap_evaluation_feedback"
  | "cap_follow_up_relationship"
  | "cap_debrief_archive_reuse";

/**
 * Layer 1 — What Spark Estate knows how to help with.
 * Source of truth: Event Architect Studio / Events Intelligence library.
 */
export type EventCapabilityDefinition = {
  capabilityId: EventCapabilityId;
  canonicalName: string;
  userFacingName: string;
  description: string;
  /** Maps to asset category band when applicable */
  category: EventAssetCategory | "cross_cutting";
  /** Knowledge docs (EI-K / EVENT-*) — authority references, not UI */
  knowledgeRefs: readonly string[];
  relatedSectionIds: readonly EventSectionId[];
  /** Asset types this capability can produce */
  assetTypeIds: readonly string[];
  formatApplicability: FormatApplicability;
  lifecyclePhases: readonly EventLifecyclePhase[];
  aliases: readonly string[];
  status: "active" | "experimental" | "deprecated";
  version: string;
};

/**
 * Layer 3 — Optional starting content for an asset type.
 */
export type EventAssetTemplateDefinition = {
  templateId: string;
  assetTypeId: string;
  label: string;
  description: string;
  applicableEventTypes: EventTypeApplicability;
  formatApplicability: FormatApplicability;
  /** Lightweight starter structure — never replaces live editing */
  starterOutline: readonly string[];
  status: "active" | "experimental" | "deprecated";
  version: string;
};

/** Connection receipt after + Add Asset */
export type AddAssetConnectionReceipt = {
  connected: boolean;
  duplicated: boolean;
  instance: EventAssetInstance | null;
  assetTypeId: string;
  sectionId: EventSectionId;
  templateId: string | null;
  eventRecordId: string;
  creationWorkspaceId: string;
  relationshipRegistryKey: string | null;
  projectHomeId: string | null;
  readinessPercent: number | null;
  cartographyEligible: boolean;
  reasons: string[];
  /** Event Record after section fill + lifecycle sync (J-001). */
  record: import("../types").EventRecord;
};

/** Enhanced section panel — capabilities + assets + templates (053) */
export type DynamicSectionRuntimePanel = {
  sectionId: EventSectionId;
  sectionTitle: string;
  planningNotes: string;
  /** Layer 1 — capabilities relevant to this section */
  capabilities: EventCapabilityDefinition[];
  /** Layer 2 — asset types available via Add Asset (from registry) */
  assetTypes: EventAssetDefinition[];
  /** Layer 3 — templates for those asset types */
  templates: EventAssetTemplateDefinition[];
  createdAssets: EventAssetInstance[];
  recommendedAssets: EventAssetRecommendation[];
  archivedAssets: EventAssetInstance[];
  /** Always true — every section supports Add Asset */
  supportsAddAsset: true;
};

export type AddAssetToSectionInput = {
  record: import("../types").EventRecord;
  sectionId: EventSectionId;
  assetTypeId: string;
  templateId?: string | null;
  displayName?: string | null;
  allowVariant?: boolean;
};

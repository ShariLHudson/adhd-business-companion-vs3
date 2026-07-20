/**
 * Event Asset Registry — canonical asset definitions for Events Intelligence.
 * Governing: 047 · 048 · 049 · 050 Event Asset Registry Standard
 *
 * Definitions ≠ instances. One canonical definition per asset type.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { BoardDirectorId } from "@/lib/board/types";
import type {
  EventFormat,
  EventLifecyclePhase,
  EventSectionId,
  EventTypeId,
} from "@/lib/eventsIntelligence/types";

export type BoardMemberRoleId = BoardDirectorId | (string & {});

/** Required category coverage (050). */
export type EventAssetCategory =
  | "foundation_strategy"
  | "audience_attendee_experience"
  | "program_agenda"
  | "speakers_facilitators"
  | "sponsors_partners"
  | "venue_physical"
  | "virtual_hybrid_technology"
  | "registration_ticketing"
  | "marketing_promotion"
  | "communications"
  | "finance_budget"
  | "vendors_procurement"
  | "staff_volunteers"
  | "hospitality_food"
  | "travel_lodging_transport"
  | "accessibility_inclusion"
  | "safety_risk_contingencies"
  | "supplies_signage_swag"
  | "production_run_of_show"
  | "evaluation_feedback"
  | "follow_up_relationship"
  | "debrief_archive_reuse";

export const EVENT_ASSET_CATEGORIES: readonly EventAssetCategory[] = [
  "foundation_strategy",
  "audience_attendee_experience",
  "program_agenda",
  "speakers_facilitators",
  "sponsors_partners",
  "venue_physical",
  "virtual_hybrid_technology",
  "registration_ticketing",
  "marketing_promotion",
  "communications",
  "finance_budget",
  "vendors_procurement",
  "staff_volunteers",
  "hospitality_food",
  "travel_lodging_transport",
  "accessibility_inclusion",
  "safety_risk_contingencies",
  "supplies_signage_swag",
  "production_run_of_show",
  "evaluation_feedback",
  "follow_up_relationship",
  "debrief_archive_reuse",
] as const;

export type EventAssetCreationMode =
  | "native_structured_editor"
  | "native_rich_text_editor"
  | "native_table_editor"
  | "native_form_builder"
  | "native_checklist_builder"
  | "native_timeline_builder"
  | "native_presentation_builder"
  | "generated_file_with_native_source"
  | "external_integration_required"
  | "reference_only";

export type ExportFormat =
  | "pdf"
  | "docx"
  | "xlsx"
  | "csv"
  | "pptx"
  | "html"
  | "markdown"
  | "ics"
  | "json";

export type EventContextField =
  | "event_type"
  | "title"
  | "purpose"
  | "audience"
  | "outcomes"
  | "format"
  | "dates"
  | "venue"
  | "budget"
  | "agenda"
  | "speakers"
  | "sponsors"
  | "registration"
  | "marketing"
  | "technology"
  | "volunteers"
  | "staff"
  | "beta_testing";

export type EventTypeApplicability =
  | { mode: "all" }
  | { mode: "include"; eventTypes: readonly EventTypeId[] }
  | { mode: "exclude"; eventTypes: readonly EventTypeId[] };

export type FormatApplicability =
  | { mode: "all" }
  | { mode: "include"; formats: readonly EventFormat[] }
  | { mode: "exclude"; formats: readonly EventFormat[] }
  /** When format unspecified: still show (planning) or hide physical/virtual specifics */
  | { mode: "defer_until_format"; prefer: readonly EventFormat[] };

export type AssetRecommendationRule = {
  id: string;
  description: string;
  afterSignals?: readonly string[];
  requireContext?: readonly EventContextField[];
  /** Match purpose/outcomes/conversation keywords (e.g. beta, testing) */
  outcomeKeywords?: readonly string[];
  stakeholderKeywords?: readonly string[];
  formatApplicability?: FormatApplicability;
  requireMultiDay?: boolean;
  /** Lower = sooner among peers */
  priority?: number;
  /** Bucket hint when rule matches */
  bandHint?: "required_now" | "recommended_now" | "recommended_later";
};

export type EventAssetDependency = {
  assetTypeId: string;
  strength: "required" | "recommended" | "soft";
  note?: string;
};

export type EventAssetTaskTemplate = {
  title: string;
  when: "on_create" | "on_complete" | "on_approve" | "manual";
  sectionId?: EventSectionId;
};

export type EventReadinessContribution = {
  areaId: string;
  areaLabel: string;
  weight: number;
};

export type EventAssetDefinition = {
  assetTypeId: string;
  canonicalName: string;
  userFacingName: string;
  description: string;
  purpose: string;
  category: EventAssetCategory;
  lifecyclePhases: readonly EventLifecyclePhase[];
  eventSections: readonly EventSectionId[];
  applicableEventTypes: EventTypeApplicability;
  formatApplicability: FormatApplicability;
  requiredLevel: "core" | "conditional" | "optional";
  recommendationRules: readonly AssetRecommendationRule[];
  primaryChamberOwner: ChamberMemberId;
  supportingChamberMembers: readonly ChamberMemberId[];
  suggestedBoardAdvisors: readonly BoardMemberRoleId[];
  creationMode: EventAssetCreationMode;
  editableInPlatform: boolean;
  exportFormats: readonly ExportFormat[];
  contextRequirements: readonly EventContextField[];
  optionalContext: readonly EventContextField[];
  dependencies: readonly EventAssetDependency[];
  relatedAssetTypeIds: readonly string[];
  mayGenerateProjectTasks: boolean;
  taskTemplates: readonly EventAssetTaskTemplate[];
  cartographyEligible: boolean;
  cartographyRelationshipTypes: readonly string[];
  readinessContribution: readonly EventReadinessContribution[];
  templateId: string | null;
  createAssetRegistryId: string | null;
  version: string;
  status: "active" | "experimental" | "deprecated";
  aliases: readonly string[];
};

export type EventAssetInstance = {
  instanceId: string;
  assetTypeId: string;
  eventRecordId: string;
  creationWorkspaceId: string;
  eventType: EventTypeId;
  eventSubtype: string | null;
  lifecyclePhase: EventLifecyclePhase;
  planningSectionId: EventSectionId | null;
  primaryChamberOwner: ChamberMemberId;
  sourceBlueprintId: string | null;
  canonicalWorkId: string | null;
  projectHomeId: string | null;
  displayName: string;
  status: "suggested" | "drafting" | "in_review" | "approved" | "archived";
  contentRef: string | null;
  relationshipRegistryKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventAssetInstantiationLinks = {
  eventRecordId: string;
  creationWorkspaceId: string;
  eventType: EventTypeId;
  eventSubtype?: string | null;
  lifecyclePhase: EventLifecyclePhase;
  planningSectionId?: EventSectionId | null;
  sourceBlueprintId?: string | null;
  canonicalWorkId?: string | null;
  projectHomeId?: string | null;
  displayName?: string;
  /** 053 — optional template id stamped as contentRef */
  templateId?: string | null;
};

export type EventAssetRecommendationBand =
  | "required_now"
  | "recommended_now"
  | "recommended_later"
  | "optional"
  | "not_applicable"
  | "already_created";

export type EventAssetRecommendation = {
  assetTypeId: string;
  canonicalName: string;
  userFacingName: string;
  band: EventAssetRecommendationBand;
  category: EventAssetCategory;
  reason: string;
  priority: number;
  primaryChamberOwner: ChamberMemberId;
};

export type RecommendEventAssetsOptions = {
  /** Max items across required_now + recommended_now (default 12) */
  focusLimit?: number;
  /** Include optional / later in full result (default true for tests; UI uses focused) */
  includeLater?: boolean;
  /** Existing instance assetTypeIds */
  existingAssetTypeIds?: readonly string[];
  /** Extra free-text signals (purpose, goals, conversation) */
  contextText?: string;
  multiDay?: boolean;
  scale?: "solo" | "small" | "medium" | "large" | "unspecified";
};

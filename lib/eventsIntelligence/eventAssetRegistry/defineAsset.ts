import type {
  EventAssetCategory,
  EventAssetDefinition,
  FormatApplicability,
} from "./types";

const VERSION = "1.1.0";
const ALL_FORMATS: FormatApplicability = { mode: "all" };

/** Legacy category labels from early registry drafts → 050/052A categories */
const CATEGORY_ALIASES: Record<string, EventAssetCategory> = {
  foundation: "foundation_strategy",
  foundation_strategy: "foundation_strategy",
  program: "program_agenda",
  program_agenda: "program_agenda",
  registration_attendance: "registration_ticketing",
  registration_ticketing: "registration_ticketing",
  marketing_communications: "marketing_promotion",
  marketing_promotion: "marketing_promotion",
  communications: "communications",
  people_speakers: "speakers_facilitators",
  speakers_facilitators: "speakers_facilitators",
  vendors_operations: "vendors_procurement",
  vendors_procurement: "vendors_procurement",
  staffing_volunteers: "staff_volunteers",
  staff_volunteers: "staff_volunteers",
  experience_hospitality: "audience_attendee_experience",
  audience_attendee_experience: "audience_attendee_experience",
  technology_production: "virtual_hybrid_technology",
  virtual_hybrid_technology: "virtual_hybrid_technology",
  finance: "finance_budget",
  finance_budget: "finance_budget",
  risk_safety: "safety_risk_contingencies",
  safety_risk_contingencies: "safety_risk_contingencies",
  delivery_day_of: "production_run_of_show",
  production_run_of_show: "production_run_of_show",
  follow_up_learning: "follow_up_relationship",
  follow_up_relationship: "follow_up_relationship",
  evaluation_feedback: "evaluation_feedback",
  archive_reuse: "debrief_archive_reuse",
  debrief_archive_reuse: "debrief_archive_reuse",
  sponsors_partners: "sponsors_partners",
  venue_physical: "venue_physical",
  hospitality_food: "hospitality_food",
  travel_lodging_transport: "travel_lodging_transport",
  accessibility_inclusion: "accessibility_inclusion",
  supplies_signage_swag: "supplies_signage_swag",
};

export function normalizeEventAssetCategory(
  category: string,
): EventAssetCategory {
  return (
    CATEGORY_ALIASES[category] ??
    (category as EventAssetCategory)
  );
}

export function defineEventAsset(
  partial: Omit<
    EventAssetDefinition,
    | "version"
    | "status"
    | "aliases"
    | "formatApplicability"
    | "suggestedBoardAdvisors"
    | "supportingChamberMembers"
    | "recommendationRules"
    | "dependencies"
    | "relatedAssetTypeIds"
    | "taskTemplates"
    | "cartographyRelationshipTypes"
    | "readinessContribution"
    | "exportFormats"
    | "contextRequirements"
    | "optionalContext"
    | "createAssetRegistryId"
    | "templateId"
    | "category"
  > & {
    category: string;
  } & Partial<
      Pick<
        EventAssetDefinition,
        | "version"
        | "status"
        | "aliases"
        | "formatApplicability"
        | "suggestedBoardAdvisors"
        | "supportingChamberMembers"
        | "recommendationRules"
        | "dependencies"
        | "relatedAssetTypeIds"
        | "taskTemplates"
        | "cartographyRelationshipTypes"
        | "readinessContribution"
        | "exportFormats"
        | "contextRequirements"
        | "optionalContext"
        | "createAssetRegistryId"
        | "templateId"
      >
    >,
): EventAssetDefinition {
  const {
    category: rawCategory,
    ...rest
  } = partial;

  return {
    suggestedBoardAdvisors: [],
    supportingChamberMembers: [],
    recommendationRules: [],
    dependencies: [],
    relatedAssetTypeIds: [],
    taskTemplates: [],
    cartographyRelationshipTypes: [],
    readinessContribution: [],
    exportFormats: ["pdf"],
    contextRequirements: [],
    optionalContext: [],
    createAssetRegistryId: null,
    templateId: null,
    formatApplicability: ALL_FORMATS,
    version: VERSION,
    status: "active",
    aliases: [],
    ...rest,
    category: normalizeEventAssetCategory(rawCategory),
  };
}

/**
 * 241–244 — Field, Home & Property Service Collection (definition data only).
 * Collection: collection.field_home_property
 * Verticals + shared field-ops overlay — distinct from business.service, hospitality, organizing.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const FIELD_HOME_PROPERTY_COLLECTION_ID =
  "collection.field_home_property" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID =
  "business.contractor_construction" as const;
export const HOME_SERVICE_BUSINESS_BLUEPRINT_ID =
  "business.home_service" as const;
export const PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID =
  "business.property_management" as const;
export const MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID =
  "operations.mobile_field_service" as const;

type BusinessBlueprintSeed = Omit<
  BlueprintDefinition,
  "compatibleWorkTypeIds" | "supportedDepthModes" | "category"
> & {
  category?: BlueprintDefinition["category"];
};

function groupsForSections(sectionIds: readonly string[]): BlueprintGroup[] {
  const set = new Set(sectionIds);
  return BUSINESS_PLAN_MAP_GROUPS.map((g) => ({
    ...g,
    sectionIds: g.sectionIds.filter((id) => set.has(id)),
  })).filter((g) => g.sectionIds.length > 0);
}

function businessBlueprint(seed: BusinessBlueprintSeed): BlueprintDefinition {
  const sectionIds = seed.sections.map((s) => s.id);
  return {
    ...seed,
    category: seed.category ?? "spark",
    compatibleWorkTypeIds: BUSINESS_WORK,
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    groups: seed.groups ?? groupsForSections(sectionIds),
  };
}

const SHARED_HIDDEN = {
  id: "system_work_meta",
  title: "System",
  role: "hidden_system" as const,
};

const CERT_RULES = [
  "business_plan.foundation",
  "business_plan.map",
  "business_plan.depth",
] as const;

const depthGuided = {
  role: "optional" as const,
  condition: { kind: "depth_at_least" as const, mode: "guided_build" as const },
};

const depthComplete = {
  role: "optional" as const,
  condition: {
    kind: "depth_at_least" as const,
    mode: "complete_planning" as const,
  },
};

const COLLECTION_META = {
  collectionId: FIELD_HOME_PROPERTY_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Field Home Property Collection",
  notGenericServiceOnly: true,
  notHospitalityLodgingOnly: true,
  notPhysicalOrganizingOnly: true,
} as const;

/** 241 — Contractor & Construction Business Blueprint */
export const BUSINESS_BLUEPRINT_CONTRACTOR_CONSTRUCTION = businessBlueprint({
  blueprintId: CONTRACTOR_CONSTRUCTION_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Contractor & Construction Business",
  description:
    "Create, price, sell, schedule, deliver, and close construction projects — scope, estimates, crews, change orders, quality, and safety together.",
  intendedUse:
    "Contractors and construction businesses — not recurring home-service routes, not property management portfolios, not generic coaching/consulting service.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business and Service Positioning", role: "required" },
    { id: "gc_lead_qualify", title: "Lead Qualification", role: "required" },
    { id: "gc_site_assessment", title: "Site Assessment", ...depthGuided },
    { id: "gc_scope", title: "Scope of Work", role: "required" },
    { id: "pricing", title: "Estimating and Pricing", role: "required" },
    { id: "gc_proposal", title: "Proposal and Agreement", ...depthGuided },
    { id: "gc_project_planning", title: "Project Planning", ...depthGuided },
    { id: "gc_crew_subs", title: "Crew and Subcontractor Coordination", ...depthGuided },
    { id: "gc_change_mgmt", title: "Change Management", ...depthGuided },
    { id: "gc_client_comms", title: "Client Communication", ...depthGuided },
    { id: "gc_quality_safety", title: "Quality, Safety, and Closeout", ...depthComplete },
    { id: "gc_performance", title: "Business Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_position",
      prompt:
        "What construction work do you take — and what is firmly out of scope?",
      lowerFrictionPrompt: "What kind of contractor are you?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_scope",
      prompt: "For your next ideal job, what must be in the scope — and what assumptions protect you?",
      lowerFrictionPrompt: "What's in scope for a typical job?",
      sectionId: "gc_scope",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next contractor-business move?",
      lowerFrictionPrompt: "What's the next small construction step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Clarify ideal project and exclusions", sectionId: "purpose_vision" },
    { id: "t_estimate", title: "Build estimate structure", sectionId: "pricing" },
    { id: "t_change", title: "Draft change-order path", sectionId: "gc_change_mgmt" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Positioning clear" },
    { id: "m_scope", title: "Scope structure usable" },
    {
      id: "m_estimate",
      title: "Estimating path named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not legal, code, or engineering advice",
    "Change orders need a calm path",
    "Permits and professional review flags",
    "Closeout and warranty before the next bid",
  ],
  riskPrompts: [
    "What if scope expands without a change order?",
    "What if one subcontractor delay breaks the whole schedule?",
  ],
  researchPrompts: [
    "Compare estimate structures for small contractors",
    "Find change-order communication patterns that protect relationships",
  ],
  deliverables: [
    "Contractor Business Snapshot",
    "Ideal Project Profile",
    "Scope of Work Template",
    "Estimate and Pricing Model",
    "Proposal Template",
    "Project Plan Template",
    "Change Order Path",
    "Closeout Checklist",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "project-management",
    "finance",
    "sales",
    "client-relationships",
  ],
  boardReviewRecommendations: ["scope boundaries", "margin honesty", "change control"],
  projectBridgeRecommendations: [
    "Bridge when an awarded job needs Project execution tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Can use operations.mobile_field_service for site delivery without merging OS",
    },
  ],
  completionCriteria: [
    "Positioning and scope framed",
    "Estimating considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "contractor_construction",
  },
});

/** 242 — Home Service Business Blueprint */
export const BUSINESS_BLUEPRINT_HOME_SERVICE = businessBlueprint({
  blueprintId: HOME_SERVICE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Home Service Business",
  description:
    "Run a reliable home-service business from inquiry through schedule, delivery, payment, follow-up, and recurring maintenance.",
  intendedUse:
    "Residential home trades and service businesses — not construction project OS, not property management portfolios.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Service Definition", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "hs_inquiry", title: "Inquiry and Qualification", role: "required" },
    { id: "hs_estimate_booking", title: "Estimate and Booking", ...depthGuided },
    { id: "hs_routing", title: "Routing and Scheduling", ...depthGuided },
    { id: "hs_delivery", title: "Service Delivery", role: "required" },
    { id: "hs_comms", title: "Customer Communication", ...depthGuided },
    { id: "hs_recurring", title: "Recurring Service", ...depthGuided },
    { id: "hs_team_field", title: "Team and Field Ops", ...depthComplete },
    { id: "hs_inventory", title: "Inventory and Equipment", ...depthComplete },
    { id: "hs_safety", title: "Safety, Privacy, and Risk", ...depthComplete },
    { id: "hs_performance", title: "Performance and Growth", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_services",
      prompt: "Which home services do you offer — and what is out of area or out of scope?",
      lowerFrictionPrompt: "What home services do you offer?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_pricing",
      prompt: "How do you price — visit minimum, packages, recurring, or by job?",
      lowerFrictionPrompt: "How do you price jobs?",
      sectionId: "pricing",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["pricing"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next home-service move?",
      lowerFrictionPrompt: "What's the next small home-service step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_menu", title: "Write service menu and exclusions", sectionId: "purpose_vision" },
    { id: "t_price", title: "Set visit minimum and packages", sectionId: "pricing" },
    { id: "t_route", title: "Sketch daily routing rules", sectionId: "hs_routing" },
  ],
  suggestedMilestones: [
    { id: "m_menu", title: "Service menu clear" },
    { id: "m_price", title: "Pricing usable" },
    {
      id: "m_book",
      title: "Booking path named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Home-entry and key privacy",
    "Buffers between jobs",
    "Recurring renewals need a simple ask",
    "Field ops overlay (244) can share dispatch without merging business DNA",
  ],
  riskPrompts: [
    "What if routes look efficient until no-shows and travel eat the day?",
    "What if technicians lack a calm escalation path?",
  ],
  researchPrompts: [
    "Compare home-service booking and deposit patterns",
    "Find recurring maintenance plan structures",
  ],
  deliverables: [
    "Home Service Menu",
    "Pricing Model",
    "Inquiry Scorecard",
    "Booking Workflow",
    "Routing Rules",
    "Service Delivery Checklist",
    "Recurring Maintenance Plan",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "sales",
    "client-relationships",
    "finance",
    "systems",
  ],
  boardReviewRecommendations: ["service area", "pricing floors", "route load"],
  projectBridgeRecommendations: [
    "Bridge when seasonal campaigns or tech onboarding need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Business vertical — pairs with operations.mobile_field_service for dispatch",
    },
  ],
  completionCriteria: [
    "Services and pricing framed",
    "Booking considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "home_service" },
});

/** 243 — Property Management Business Blueprint */
export const BUSINESS_BLUEPRINT_PROPERTY_MANAGEMENT = businessBlueprint({
  blueprintId: PROPERTY_MANAGEMENT_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Property Management Business",
  description:
    "Manage owner relationships, property onboarding, resident service, maintenance coordination, vendors, inspections, and portfolio visibility.",
  intendedUse:
    "Property managers — not hotel hospitality OS, not construction delivery, not legal/leasing advice.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Management Model", role: "required" },
    { id: "pm_owner", title: "Owner Acquisition and Onboarding", role: "required" },
    { id: "pm_property", title: "Property Onboarding", role: "required" },
    { id: "pm_resident", title: "Resident and Tenant Journey", ...depthGuided },
    { id: "pm_leasing", title: "Leasing Operations", ...depthGuided },
    { id: "pm_maintenance", title: "Maintenance Coordination", ...depthGuided },
    { id: "pm_vendors", title: "Vendor Management", ...depthGuided },
    { id: "pm_inspections", title: "Inspections and Condition", ...depthComplete },
    { id: "pm_financials", title: "Financial Ops", ...depthGuided },
    { id: "pm_comms", title: "Communication and Issues", ...depthGuided },
    { id: "pm_str", title: "Short-Term Rental Adaptation", ...depthComplete },
    { id: "pm_portfolio", title: "Portfolio Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt:
        "What management model do you run — residential, commercial, STR-adapted, or hybrid — and what is out of scope?",
      lowerFrictionPrompt: "What property management model?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "model"],
      materialChangeNextStep: true,
    },
    {
      id: "q_owners",
      prompt: "Who are your ideal owners — and what must be true before you take a property?",
      lowerFrictionPrompt: "Who are your ideal owners?",
      sectionId: "pm_owner",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["clients", "audience", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next property-management move?",
      lowerFrictionPrompt: "What's the next small PM step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_model", title: "Clarify management fee and scope", sectionId: "purpose_vision" },
    { id: "t_onboard", title: "Draft property onboarding checklist", sectionId: "pm_property" },
    { id: "t_maint", title: "Define maintenance priority rules", sectionId: "pm_maintenance" },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Management model clear" },
    { id: "m_onboard", title: "Onboarding usable" },
    {
      id: "m_maint",
      title: "Maintenance coordination framed",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not legal, fair-housing, tax, or insurance advice",
    "Owner approvals before large spends",
    "Vendor backups for emergencies",
    "STR adaptation is optional — not hospitality hotel OS",
  ],
  riskPrompts: [
    "What if maintenance requests have no priority owner?",
    "What if portfolio growth outruns response capacity?",
  ],
  researchPrompts: [
    "Compare property onboarding checklists for small portfolios",
    "Find calm owner-statement structures",
  ],
  deliverables: [
    "Property Management Snapshot",
    "Owner Onboarding Pack",
    "Property Onboarding Checklist",
    "Maintenance Priority Rules",
    "Vendor Directory Template",
    "Portfolio Dashboard Outline",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "finance",
    "systems",
    "leadership",
  ],
  boardReviewRecommendations: [
    "scope vs legal boundaries",
    "maintenance SLAs",
    "portfolio load",
  ],
  projectBridgeRecommendations: [
    "Bridge when portfolio systems or turnovers need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Coordinates vendors — does not replace contractor or home-service delivery OS",
    },
  ],
  completionCriteria: [
    "Model and onboarding framed",
    "Maintenance path considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "property_management",
  },
});

/** 244 — Mobile & Field Service Operations Blueprint */
export const BUSINESS_BLUEPRINT_MOBILE_FIELD_SERVICE = businessBlueprint({
  blueprintId: MOBILE_FIELD_SERVICE_OPERATIONS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Mobile & Field Service Operations",
  description:
    "Cross-business field delivery — dispatch, routing, prep, execution, documentation, safety, and completion at customer or job sites.",
  intendedUse:
    "Shared field-ops overlay for contractors, home service, and other mobile teams — not a full business positioning/pricing OS by itself.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Field-Service Model", role: "required" },
    { id: "field_job_intake", title: "Job Intake", role: "required" },
    { id: "field_dispatch", title: "Scheduling and Dispatch", role: "required" },
    { id: "field_prep", title: "Pre-Visit Prep", ...depthGuided },
    { id: "field_arrival", title: "Arrival and Check-In", ...depthGuided },
    { id: "field_execution", title: "Field Execution", role: "required" },
    { id: "field_comms", title: "Field Communication", ...depthGuided },
    { id: "field_completion", title: "Completion and Verification", ...depthGuided },
    { id: "field_safety", title: "Safety and Incident", ...depthGuided },
    { id: "field_vehicle_stock", title: "Vehicle, Equipment, and Stock", ...depthComplete },
    { id: "field_team", title: "Team Performance and Training", ...depthComplete },
    { id: "field_analytics", title: "Analytics and Improvement", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_field_model",
      prompt:
        "What field jobs do you dispatch — and what makes a job ready to send a tech?",
      lowerFrictionPrompt: "What field work do you dispatch?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "process", "workflow"],
      materialChangeNextStep: true,
    },
    {
      id: "q_dispatch",
      prompt: "How do you assign routes today — and where do delays pile up?",
      lowerFrictionPrompt: "What's hardest about dispatch?",
      sectionId: "field_dispatch",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["roles", "constraints", "systems"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next field-ops move?",
      lowerFrictionPrompt: "What's the next small field-ops step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_intake", title: "Write job readiness checklist", sectionId: "field_job_intake" },
    { id: "t_dispatch", title: "Sketch dispatch board rules", sectionId: "field_dispatch" },
    { id: "t_safety", title: "Define stop-work ownership", sectionId: "field_safety" },
  ],
  suggestedMilestones: [
    { id: "m_intake", title: "Intake readiness clear" },
    { id: "m_dispatch", title: "Dispatch rules usable" },
    {
      id: "m_close",
      title: "Completion path named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Overlay — not a substitute for contractor or home-service business DNA",
    "Stop-work authority must be explicit",
    "OTW and delay messages reduce anxiety",
    "Vehicle stock before the first call of the day",
  ],
  riskPrompts: [
    "What if jobs launch without access or parts?",
    "What if incidents have no calm reporting path?",
  ],
  researchPrompts: [
    "Compare lightweight dispatch board patterns",
    "Find field completion documentation that stays simple",
  ],
  deliverables: [
    "Field Service Profile",
    "Job Intake Checklist",
    "Dispatch Board Rules",
    "Pre-Visit Prep Pack",
    "Field Execution Checklist",
    "Completion Workflow",
    "Safety and Incident Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "systems",
    "project-management",
    "client-relationships",
  ],
  boardReviewRecommendations: ["dispatch load", "safety ownership", "repeat visits"],
  projectBridgeRecommendations: [
    "Bridge when field-system setup or training needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Shared ops layer for 241/242 and other mobile teams — does not own pricing DNA",
    },
  ],
  completionCriteria: [
    "Field model and intake framed",
    "Dispatch considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "mobile_field_service_operations",
    overlayForBlueprintIds: [
      "business.contractor_construction",
      "business.home_service",
    ],
  },
});

export const FIELD_HOME_PROPERTY_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_CONTRACTOR_CONSTRUCTION,
    BUSINESS_BLUEPRINT_HOME_SERVICE,
    BUSINESS_BLUEPRINT_PROPERTY_MANAGEMENT,
    BUSINESS_BLUEPRINT_MOBILE_FIELD_SERVICE,
  ];

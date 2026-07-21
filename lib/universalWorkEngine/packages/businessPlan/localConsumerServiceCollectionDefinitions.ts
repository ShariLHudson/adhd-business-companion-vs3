/**
 * 269–272 — Local Consumer Service Collection (definition data only).
 * Collection: collection.local_consumer_service
 * Distinct from home_service, creative_agency_studio, venue/hospitality,
 * generic service, field mobile overlay, wellness/beauty/pet/fitness.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const LOCAL_CONSUMER_SERVICE_COLLECTION_ID =
  "collection.local_consumer_service" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID =
  "business.photography_videography" as const;
export const WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID =
  "business.wedding_celebration_professional" as const;
export const CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID =
  "business.cleaning_janitorial" as const;
export const AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID =
  "business.automotive_repair_detailing" as const;

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
  collectionId: LOCAL_CONSUMER_SERVICE_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Local Consumer Service Collection",
  notGenericServiceOnly: true,
  notHomeServiceOnly: true,
  notMobileFieldOpsOnly: true,
  notCreativeAgencyOnly: true,
  notVenueHospitalityOnly: true,
  notRetailOnly: true,
  notRentalOnly: true,
  notWellnessBeautyPetFitnessOnly: true,
  draftsNotLegalCounsel: true,
} as const;

/** 269 — Photography & Videography Business Blueprint */
export const BUSINESS_BLUEPRINT_PHOTOGRAPHY_VIDEOGRAPHY = businessBlueprint({
  blueprintId: PHOTOGRAPHY_VIDEOGRAPHY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Photography & Videography Business",
  description:
    "Operate photography and videography businesses — packages, pricing, booking, pre-production, shoot day, post, rights, delivery, and referrals together.",
  intendedUse:
    "Photographers and videographers — not creative agency retainer OS, not media publishing company OS, not product-photography commerce tool alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business Positioning", role: "required" },
    { id: "pv_offers", title: "Offer and Packages", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "pv_inquiry", title: "Inquiry", role: "required" },
    { id: "pv_booking", title: "Proposal and Booking", ...depthGuided },
    { id: "pv_preprod", title: "Pre-Production", ...depthGuided },
    { id: "pv_shoot", title: "Shoot Day", ...depthGuided },
    { id: "pv_post", title: "Post-Production", ...depthGuided },
    { id: "pv_assets", title: "Asset Management", ...depthGuided },
    { id: "pv_delivery", title: "Review and Delivery", ...depthGuided },
    { id: "pv_marketing", title: "Marketing and Portfolio", ...depthComplete },
    { id: "pv_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_niche",
      prompt: "What do you shoot — weddings, portraits, commercial, events, video, or hybrid?",
      lowerFrictionPrompt: "What kind of photography or video business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_packages",
      prompt: "What packages do you sell — and what is firmly out of scope?",
      lowerFrictionPrompt: "What packages do you offer?",
      sectionId: "pv_offers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next studio move?",
      lowerFrictionPrompt: "What's the next small photography step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_menu", title: "Finalize service menu and packages", sectionId: "pv_offers" },
    { id: "t_rights", title: "Draft rights and release path", sectionId: "pv_delivery" },
    { id: "t_delivery", title: "Define gallery delivery workflow", sectionId: "pv_delivery" },
  ],
  suggestedMilestones: [
    { id: "m_offers", title: "Packages clear" },
    { id: "m_booking", title: "Booking path framed" },
    {
      id: "m_ops",
      title: "Shoot-to-delivery usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not legal/copyright counsel — rights drafts need review",
    "Distinct from creative_agency_studio retainer OS",
    "Revision boundaries before booking volume",
    "Asset provenance before delivery",
  ],
  riskPrompts: [
    "What if usage rights are unclear after delivery?",
    "What if post-production backlog outruns shoot volume?",
  ],
  researchPrompts: [
    "Compare simple photography package menus",
    "Find shoot-day call sheet patterns that stay calm",
  ],
  deliverables: [
    "Service Menu",
    "Package Pricing Model",
    "Creative Brief",
    "Shot List",
    "Call Sheet",
    "Rights and Release Path",
    "Gallery Delivery Workflow",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "client-relationships", "marketing", "finance"],
  boardReviewRecommendations: ["booking load", "delivery lag", "referral rate"],
  projectBridgeRecommendations: [
    "Bridge when studio systems, template libraries, or portfolio rebuilds need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Shoot production OS — distinct from creative_agency_studio and media_publishing",
    },
  ],
  completionCriteria: [
    "Packages and pricing framed",
    "Booking and delivery considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "photography_videography",
  },
});

/** 270 — Wedding & Celebration Professional Blueprint */
export const BUSINESS_BLUEPRINT_WEDDING_CELEBRATION_PROFESSIONAL = businessBlueprint({
  blueprintId: WEDDING_CELEBRATION_PROFESSIONAL_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Wedding & Celebration Professional",
  description:
    "Plan and coordinate weddings and celebrations — clients, budgets, vendors, timelines, logistics, contingency, event-day delivery, and follow-up together.",
  intendedUse:
    "Planners, coordinators, and celebration designers — not venue OS, not hospitality lodging, not photography production OS alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business Positioning", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "wc_inquiry", title: "Inquiry", role: "required" },
    { id: "wc_onboarding", title: "Proposal and Onboarding", ...depthGuided },
    { id: "wc_vision", title: "Vision and Design", ...depthGuided },
    { id: "wc_budget", title: "Budget", role: "required" },
    { id: "wc_vendors", title: "Venue and Vendors", ...depthGuided },
    { id: "wc_guests", title: "Guests", ...depthGuided },
    { id: "wc_timeline", title: "Timeline and Logistics", ...depthGuided },
    { id: "wc_ceremony", title: "Ceremony and Program", ...depthGuided },
    { id: "wc_contingency", title: "Contingency", ...depthGuided },
    { id: "wc_event_day", title: "Event Day", ...depthComplete },
    { id: "wc_post", title: "Post-Event", ...depthComplete },
    { id: "wc_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_role",
      prompt: "Are you full planning, month-of coordination, design-only, or a hybrid?",
      lowerFrictionPrompt: "What kind of celebration work is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_capacity",
      prompt: "How many events can you hold at once without quality slipping?",
      lowerFrictionPrompt: "What's your event capacity?",
      sectionId: "pricing",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next celebration-ops move?",
      lowerFrictionPrompt: "What's the next small planning step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_budget", title: "Draft event budget template", sectionId: "wc_budget" },
    { id: "t_vendors", title: "Build vendor matrix skeleton", sectionId: "wc_vendors" },
    { id: "t_day", title: "Sketch event-day run sheet", sectionId: "wc_event_day" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Positioning and capacity clear" },
    { id: "m_budget", title: "Budget path framed" },
    {
      id: "m_ops",
      title: "Timeline and contingency usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Client and event are separate sources of truth",
    "Not venue, legal, or insurance counsel",
    "Contingency before weather-dependent promises",
    "Distinct from photography production and venue OS",
  ],
  riskPrompts: [
    "What if vendor payments and timelines drift?",
    "What if event-day has no calm contingency owner?",
  ],
  researchPrompts: [
    "Compare simple wedding timeline templates",
    "Find vendor matrix patterns that stay usable under stress",
  ],
  deliverables: [
    "Celebration Snapshot",
    "Event Budget",
    "Vendor Matrix",
    "Master Timeline",
    "Event-Day Run Sheet",
    "Contingency Plan",
    "Post-Event Scorecard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "project-management",
    "finance",
  ],
  boardReviewRecommendations: ["capacity", "vendor reliability", "event-day calm"],
  projectBridgeRecommendations: [
    "Bridge when multi-vendor event builds or template systems need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Celebration planning OS — distinct from venue_experience and hospitality",
    },
  ],
  completionCriteria: [
    "Positioning, capacity, and budget framed",
    "Timeline/vendors considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "wedding_celebration_professional",
  },
});

/** 271 — Cleaning & Janitorial Business Blueprint */
export const BUSINESS_BLUEPRINT_CLEANING_JANITORIAL = businessBlueprint({
  blueprintId: CLEANING_JANITORIAL_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Cleaning & Janitorial Business",
  description:
    "Operate residential, commercial, and specialty cleaning — site assessment, pricing, schedules, teams, supplies, quality, and retention together.",
  intendedUse:
    "Cleaning and janitorial businesses — not home-service trades, not property management portfolio OS, not hazmat authority.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Service Model", role: "required" },
    { id: "cl_site", title: "Site Assessment", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "cl_proposal", title: "Proposal and Onboarding", ...depthGuided },
    { id: "cl_planning", title: "Service Planning", ...depthGuided },
    { id: "cl_delivery", title: "Daily and Recurring Delivery", role: "required" },
    { id: "cl_qc", title: "Quality Control", ...depthGuided },
    { id: "cl_routing", title: "Scheduling and Routing", ...depthGuided },
    { id: "cl_supplies", title: "Supplies, Chemicals, Equipment", ...depthGuided },
    { id: "cl_team", title: "Team and Training", ...depthGuided },
    { id: "cl_comms", title: "Client Communication", ...depthComplete },
    { id: "cl_retention", title: "Contracts and Retention", ...depthComplete },
    { id: "cl_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt: "Is this residential, commercial, specialty, or hybrid cleaning — and what is out of scope?",
      lowerFrictionPrompt: "What kind of cleaning business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_routing",
      prompt: "How do routes and recurring schedules stay reliable without scramble?",
      lowerFrictionPrompt: "How do you schedule routes?",
      sectionId: "cl_routing",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next cleaning-ops move?",
      lowerFrictionPrompt: "What's the next small cleaning step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_site", title: "Draft site walkthrough checklist", sectionId: "cl_site" },
    { id: "t_price", title: "Build recurring pricing model", sectionId: "pricing" },
    { id: "t_qc", title: "Define quality scorecard", sectionId: "cl_qc" },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Service model clear" },
    { id: "m_pricing", title: "Pricing framed" },
    {
      id: "m_ops",
      title: "Delivery and QC usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not home_service trade repair OS",
    "Key/access security needs a calm owner",
    "Chemical/safety flags before volume promises",
    "QC and reclean path before growth",
  ],
  riskPrompts: [
    "What if quality slips across recurring sites?",
    "What if supply or access gaps stop a route mid-day?",
  ],
  researchPrompts: [
    "Compare simple commercial cleaning checklists",
    "Find route capacity models for small cleaning teams",
  ],
  deliverables: [
    "Cleaning Service Snapshot",
    "Site Walkthrough Checklist",
    "Recurring Pricing Model",
    "Zone and Task Map",
    "Quality Scorecard",
    "Route Schedule",
    "Chemical Register",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "systems", "client-relationships", "risk"],
  boardReviewRecommendations: ["route capacity", "QC scores", "retention"],
  projectBridgeRecommendations: [
    "Bridge when route system setup, training, or commercial launches need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Cleaning vertical OS — distinct from home_service and property_management",
    },
  ],
  completionCriteria: [
    "Model, site, and pricing framed",
    "Delivery and QC considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "cleaning_janitorial",
  },
});

/** 272 — Automotive Repair & Detailing Business Blueprint */
export const BUSINESS_BLUEPRINT_AUTOMOTIVE_REPAIR_DETAILING = businessBlueprint({
  blueprintId: AUTOMOTIVE_REPAIR_DETAILING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Automotive Repair & Detailing Business",
  description:
    "Operate repair, detailing, and maintenance shops — intake, inspection, estimates, approvals, work orders, parts, QC, release, and retention together.",
  intendedUse:
    "Auto repair, detailing, and maintenance shops — not licensed mechanic authority, not dealer channel OS, not home-service trades.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Service Model", role: "required" },
    { id: "auto_intake", title: "Intake", role: "required" },
    { id: "auto_inspect", title: "Inspection and Diagnosis", role: "required" },
    { id: "pricing", title: "Estimating and Approval", role: "required" },
    { id: "auto_schedule", title: "Scheduling and Capacity", ...depthGuided },
    { id: "auto_wo", title: "Work Orders", ...depthGuided },
    { id: "auto_parts", title: "Parts and Vendors", ...depthGuided },
    { id: "auto_qc", title: "Quality and Final", ...depthGuided },
    { id: "auto_comms", title: "Customer Communication", ...depthGuided },
    { id: "auto_release", title: "Release and Payment", ...depthGuided },
    { id: "auto_maintenance", title: "Recurring Maintenance", ...depthComplete },
    { id: "auto_safety", title: "Safety, Environment, and Risk", ...depthComplete },
    { id: "auto_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt: "Is this repair, detailing, maintenance, specialty, or hybrid — and what is out of scope?",
      lowerFrictionPrompt: "What kind of automotive shop is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_estimate",
      prompt: "How do estimates get approved before work starts?",
      lowerFrictionPrompt: "How do estimates and approvals work?",
      sectionId: "pricing",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next shop move?",
      lowerFrictionPrompt: "What's the next small shop step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_intake", title: "Draft vehicle intake checklist", sectionId: "auto_intake" },
    { id: "t_estimate", title: "Define estimate approval path", sectionId: "pricing" },
    { id: "t_release", title: "Write final QC and release checklist", sectionId: "auto_qc" },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Service model clear" },
    { id: "m_estimate", title: "Estimate/approval framed" },
    {
      id: "m_ops",
      title: "WO and release usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Safety outweighs schedule and margin pressure",
    "Customer authorization before work expands",
    "Not licensed mechanic or emissions authority",
    "Distinct from dealer_reseller and rental hire",
  ],
  riskPrompts: [
    "What if work expands without fresh customer approval?",
    "What if parts delays freeze bay capacity?",
  ],
  researchPrompts: [
    "Compare simple estimate-approval patterns for small shops",
    "Find detail/repair work-order templates that stay clear",
  ],
  deliverables: [
    "Shop Service Snapshot",
    "Vehicle Intake Record",
    "Inspection Checklist",
    "Estimate and Approval Path",
    "Work Order Template",
    "Parts Path",
    "Final QC and Release Checklist",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "client-relationships", "finance", "risk"],
  boardReviewRecommendations: ["bay utilization", "approval lag", "comeback rate"],
  projectBridgeRecommendations: [
    "Bridge when shop system setup, bay redesign, or training needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Auto shop OS — distinct from home_service, dealer channel, and rental",
    },
  ],
  completionCriteria: [
    "Model, intake, and estimating framed",
    "WO and release considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "automotive_repair_detailing",
  },
});

export const LOCAL_CONSUMER_SERVICE_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_PHOTOGRAPHY_VIDEOGRAPHY,
    BUSINESS_BLUEPRINT_WEDDING_CELEBRATION_PROFESSIONAL,
    BUSINESS_BLUEPRINT_CLEANING_JANITORIAL,
    BUSINESS_BLUEPRINT_AUTOMOTIVE_REPAIR_DETAILING,
  ];

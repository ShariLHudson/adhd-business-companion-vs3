/**
 * 265–268 — Scale, Location & Channel Collection (definition data only).
 * Collection: collection.scale_location_channel
 * Distinct from retail_store, ecommerce, hospitality, franchise vs multi_location,
 * wholesale_distribution, venue_experience, membership, and generic service.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const SCALE_LOCATION_CHANNEL_COLLECTION_ID =
  "collection.scale_location_channel" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const FRANCHISE_BUSINESS_BLUEPRINT_ID = "business.franchise" as const;
export const MULTI_LOCATION_BUSINESS_BLUEPRINT_ID =
  "business.multi_location" as const;
export const RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID =
  "business.rental_equipment_hire" as const;
export const DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID =
  "business.dealer_reseller_channel_partner" as const;

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
  collectionId: SCALE_LOCATION_CHANNEL_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Scale Location Channel Collection",
  notRetailOnly: true,
  notEcommerceOnly: true,
  notHospitalityOnly: true,
  notWholesaleDistributionOnly: true,
  notVenueOnly: true,
  notMembershipOnly: true,
  notGenericServiceOnly: true,
  sharedNetworkLocationChannelFoundations: true,
  draftsNotLegalCounsel: true,
} as const;

/** 265 — Franchise Business Blueprint */
export const BUSINESS_BLUEPRINT_FRANCHISE = businessBlueprint({
  blueprintId: FRANCHISE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Franchise Business",
  description:
    "Design and operate franchise systems — readiness, replicable model, unit economics, territory, onboarding, ops manuals, brand standards, support, and network performance together.",
  intendedUse:
    "Franchisors and franchise system designers — not owned multi-location OS alone, not single-store retail/restaurant OS, not legal FDD counsel.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Franchise Readiness", role: "required" },
    { id: "fr_model", title: "Replicable Business Model", role: "required" },
    { id: "pricing", title: "Unit Economics", role: "required" },
    { id: "fr_territory", title: "Territory and Market", ...depthGuided },
    { id: "fr_site", title: "Site Selection", ...depthGuided },
    { id: "fr_qualify", title: "Franchisee Qualification", ...depthGuided },
    { id: "fr_onboarding", title: "Franchisee Onboarding", ...depthGuided },
    { id: "fr_ops_manual", title: "Operations Manual System", ...depthGuided },
    { id: "fr_training", title: "Training and Certification", ...depthGuided },
    { id: "fr_brand", title: "Brand Standards and Local Marketing", ...depthGuided },
    { id: "fr_support", title: "Franchise Support", ...depthComplete },
    { id: "fr_performance", title: "Performance and Compliance", ...depthComplete },
    { id: "fr_renewal", title: "Renewal, Transfer, and Exit", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_readiness",
      prompt: "Is this a franchisor system build, an existing franchise network, or franchisee-side planning?",
      lowerFrictionPrompt: "What kind of franchise work is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_model",
      prompt: "What must be identical at every unit — and what can adapt locally?",
      lowerFrictionPrompt: "What makes the model replicable?",
      sectionId: "fr_model",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next franchise-system move?",
      lowerFrictionPrompt: "What's the next small franchise step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_ready", title: "Complete franchise readiness gaps", sectionId: "purpose_vision" },
    { id: "t_unit", title: "Draft unit economics model", sectionId: "pricing" },
    { id: "t_onboard", title: "Sketch franchisee onboarding", sectionId: "fr_onboarding" },
  ],
  suggestedMilestones: [
    { id: "m_ready", title: "Readiness framed" },
    { id: "m_model", title: "Replicable model clear" },
    {
      id: "m_ops",
      title: "Onboarding and standards considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not legal FDD or franchise counsel",
    "Distinct from owned multi_location network OS",
    "Unit economics before expansion promises",
    "Ops manuals need revision ownership",
  ],
  riskPrompts: [
    "What if units open before training and support are real?",
    "What if territory rules create cannibalization?",
  ],
  researchPrompts: [
    "Compare simple franchise readiness checklists",
    "Find unit economics patterns for small franchise systems",
  ],
  deliverables: [
    "Franchise Readiness Assessment",
    "Replicable Business Model",
    "Unit Economics Model",
    "Territory Profile",
    "Franchisee Onboarding Plan",
    "Operations Manual Architecture",
    "Network Performance Scorecard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "finance", "systems", "client-relationships"],
  boardReviewRecommendations: ["unit economics", "support capacity", "compliance"],
  projectBridgeRecommendations: [
    "Bridge when manual build, training launch, or territory expansion needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Franchise system OS — distinct from multi_location and dealer channel",
    },
  ],
  completionCriteria: [
    "Readiness and model framed",
    "Unit economics considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "franchise" },
});

/** 266 — Multi-Location Business Blueprint */
export const BUSINESS_BLUEPRINT_MULTI_LOCATION = businessBlueprint({
  blueprintId: MULTI_LOCATION_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Multi-Location Business",
  description:
    "Operate owned multi-location networks — HQ vs local roles, standards, launch, staffing, inventory, scorecards, and portfolio expansion together.",
  intendedUse:
    "Owned multi-site networks (stores, studios, offices, branches) — not franchisee/royalty OS, not single-location retail OS alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Network Operating Model", role: "required" },
    { id: "ml_location_profile", title: "Location Profile", role: "required" },
    { id: "ml_launch", title: "Location Launch", ...depthGuided },
    { id: "ml_standards", title: "Standard Operating Model", role: "required" },
    { id: "ml_leadership", title: "Leadership and Accountability", ...depthGuided },
    { id: "ml_staffing", title: "Staffing and Labor", ...depthGuided },
    { id: "ml_inventory", title: "Inventory and Shared Resources", ...depthGuided },
    { id: "ml_experience", title: "Customer and Market Experience", ...depthGuided },
    { id: "ml_marketing", title: "Marketing and Brand", ...depthGuided },
    { id: "pricing", title: "Financial Planning", role: "required" },
    { id: "ml_performance", title: "Performance Management", ...depthComplete },
    { id: "ml_expansion", title: "Expansion and Portfolio", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_network",
      prompt: "How many locations do you operate — and what does HQ own vs what each location owns?",
      lowerFrictionPrompt: "What kind of multi-location network is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_standards",
      prompt: "What must be identical across locations — and where can local teams adapt?",
      lowerFrictionPrompt: "What are the network standards?",
      sectionId: "ml_standards",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next network move?",
      lowerFrictionPrompt: "What's the next small multi-location step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_register", title: "Build location register", sectionId: "purpose_vision" },
    { id: "t_raci", title: "Clarify HQ vs local RACI", sectionId: "purpose_vision" },
    { id: "t_score", title: "Draft location scorecard", sectionId: "ml_performance" },
  ],
  suggestedMilestones: [
    { id: "m_network", title: "Network model clear" },
    { id: "m_standards", title: "Standards framed" },
    {
      id: "m_ops",
      title: "Launch and performance usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Owned network — not franchisee royalty OS",
    "Shared-cost allocation before location P&L fights",
    "Exception workflow for local adaptation",
    "Expansion readiness before new sites",
  ],
  riskPrompts: [
    "What if locations drift without a calm recovery path?",
    "What if launch capacity outruns leadership coverage?",
  ],
  researchPrompts: [
    "Compare simple multi-location scorecard patterns",
    "Find HQ/local RACI models that stay light",
  ],
  deliverables: [
    "Network Operating Model",
    "Location Register",
    "Location Launch Plan",
    "Network Standards Register",
    "Location KPI Scorecard",
    "Expansion Pipeline",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "finance", "systems", "project-management"],
  boardReviewRecommendations: ["location profitability", "consistency", "expansion readiness"],
  projectBridgeRecommendations: [
    "Bridge when new-site launches, consolidations, or systems rollout need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Owned multi-site OS — distinct from franchise and single-location retail",
    },
  ],
  completionCriteria: [
    "Network model and standards framed",
    "Performance considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "multi_location" },
});

/** 267 — Rental & Equipment Hire Business Blueprint */
export const BUSINESS_BLUEPRINT_RENTAL_EQUIPMENT_HIRE = businessBlueprint({
  blueprintId: RENTAL_EQUIPMENT_HIRE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Rental & Equipment Hire Business",
  description:
    "Operate rental and equipment hire — asset catalog, pricing, reservations, agreements, release/return, maintenance, delivery routes, and utilization together.",
  intendedUse:
    "Equipment, event, vehicle, and tool rental businesses — not retail sell-side, not hospitality lodging, not venue booking as primary OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Rental Business Model", role: "required" },
    { id: "rent_catalog", title: "Asset Catalog", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "rent_reservation", title: "Inquiry and Reservation", role: "required" },
    { id: "rent_agreement", title: "Agreement and Authorization", ...depthGuided },
    { id: "rent_release", title: "Preparation and Release", ...depthGuided },
    { id: "rent_return", title: "Return and Condition", ...depthGuided },
    { id: "rent_maintenance", title: "Maintenance and Availability", ...depthGuided },
    { id: "rent_delivery", title: "Delivery and Route", ...depthGuided },
    { id: "rent_inventory", title: "Inventory and Location Control", ...depthGuided },
    { id: "rent_comms", title: "Customer Communication", ...depthComplete },
    { id: "rent_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_assets",
      prompt: "What do you rent — and what is firmly out of scope for hire?",
      lowerFrictionPrompt: "What kind of rental business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_reservation",
      prompt: "How do availability, deposits, and confirmations work without double-booking?",
      lowerFrictionPrompt: "How do reservations work?",
      sectionId: "rent_reservation",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next rental-ops move?",
      lowerFrictionPrompt: "What's the next small rental step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_catalog", title: "Build asset catalog baseline", sectionId: "rent_catalog" },
    { id: "t_price", title: "Set period pricing and deposits", sectionId: "pricing" },
    { id: "t_return", title: "Draft return/condition checklist", sectionId: "rent_return" },
  ],
  suggestedMilestones: [
    { id: "m_catalog", title: "Asset catalog clear" },
    { id: "m_reservation", title: "Reservation path framed" },
    {
      id: "m_ops",
      title: "Release/return and maintenance usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Hire/reuse assets — not ecommerce sell-side",
    "Agreements and damage deposits need calm ownership",
    "Maintenance downtime before utilization promises",
    "Drafts are not insurance or licensing counsel",
  ],
  riskPrompts: [
    "What if assets go out without return-to-service checks?",
    "What if peak season reservations exceed available fleet?",
  ],
  researchPrompts: [
    "Compare simple rental reservation patterns",
    "Find condition-check workflows that stay shop-floor usable",
  ],
  deliverables: [
    "Rental Business Snapshot",
    "Asset Catalog",
    "Pricing Model",
    "Reservation Path",
    "Agreement Draft",
    "Release and Return Checklists",
    "Maintenance Schedule",
    "Utilization Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "finance", "systems", "risk"],
  boardReviewRecommendations: ["utilization", "downtime", "damage rates"],
  projectBridgeRecommendations: [
    "Bridge when fleet expansion, system setup, or seasonal prep needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Rental/hire OS — distinct from retail, venue booking, and hospitality lodging",
    },
  ],
  completionCriteria: [
    "Catalog, pricing, and reservations framed",
    "Release/return considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "rental_equipment_hire",
  },
});

/** 268 — Dealer, Reseller & Channel Partner Blueprint */
export const BUSINESS_BLUEPRINT_DEALER_RESELLER_CHANNEL_PARTNER = businessBlueprint({
  blueprintId: DEALER_RESELLER_CHANNEL_PARTNER_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Dealer, Reseller & Channel Partner",
  description:
    "Build channel-led go-to-market — partner strategy, tiers, onboarding, catalog/pricing, deal registration, enablement, MDF, incentives, and partner scorecards together.",
  intendedUse:
    "Vendors and brands running dealer/reseller/channel networks — not franchise system OS, not wholesale warehouse OS, not DTC ecommerce alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Channel Strategy", role: "required" },
    { id: "ch_qualify", title: "Partner Qualification", role: "required" },
    { id: "ch_tiers", title: "Partner Tiers and Benefits", role: "required" },
    { id: "ch_onboarding", title: "Agreement and Onboarding", ...depthGuided },
    { id: "pricing", title: "Product and Pricing", role: "required" },
    { id: "ch_leads", title: "Lead and Opportunity", ...depthGuided },
    { id: "ch_enablement", title: "Sales Enablement", ...depthGuided },
    { id: "ch_training", title: "Training and Certification", ...depthGuided },
    { id: "ch_mdf", title: "Marketing Development", ...depthGuided },
    { id: "ch_orders", title: "Ordering, Fulfillment, Support", ...depthGuided },
    { id: "ch_incentives", title: "Incentives and Rebates", ...depthComplete },
    { id: "ch_performance", title: "Performance and Portfolio", ...depthComplete },
    { id: "ch_renewal", title: "Renewal, Transition, Exit", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_channel",
      prompt: "Is this dealer, reseller, VAR, affiliate, or a hybrid channel — and what stays direct?",
      lowerFrictionPrompt: "What kind of channel program is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_tiers",
      prompt: "What partner tiers exist — and what must partners earn to move up?",
      lowerFrictionPrompt: "How do partner tiers work?",
      sectionId: "ch_tiers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next channel move?",
      lowerFrictionPrompt: "What's the next small partner step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_strategy", title: "Draft channel strategy snapshot", sectionId: "purpose_vision" },
    { id: "t_tiers", title: "Define partner tiers", sectionId: "ch_tiers" },
    { id: "t_deal", title: "Sketch deal registration rules", sectionId: "ch_leads" },
  ],
  suggestedMilestones: [
    { id: "m_strategy", title: "Channel strategy clear" },
    { id: "m_tiers", title: "Tiers and pricing framed" },
    {
      id: "m_ops",
      title: "Enablement and scorecards usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not franchise system OS",
    "Not wholesale warehouse distribution OS",
    "Deal registration conflicts need a calm owner",
    "Drafts are not distribution/competition legal advice",
  ],
  riskPrompts: [
    "What if partners compete in the same territory without conflict rules?",
    "What if incentives pay without performance evidence?",
  ],
  researchPrompts: [
    "Compare simple partner tier models for small vendors",
    "Find deal-registration patterns that reduce conflict",
  ],
  deliverables: [
    "Channel Strategy Snapshot",
    "Partner Tier Model",
    "Partner Onboarding Plan",
    "Channel Price List",
    "Deal Registration Path",
    "Enablement Playbook",
    "Partner Scorecard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "client-relationships",
    "operations",
    "marketing",
    "finance",
  ],
  boardReviewRecommendations: ["partner coverage", "deal conflict", "channel mix"],
  projectBridgeRecommendations: [
    "Bridge when portal setup, enablement launches, or partner migrations need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Channel/partner OS — distinct from franchise and wholesale_distribution",
    },
  ],
  completionCriteria: [
    "Strategy, tiers, and pricing framed",
    "Lead/deal path considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "dealer_reseller_channel_partner",
  },
});

export const SCALE_LOCATION_CHANNEL_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_FRANCHISE,
    BUSINESS_BLUEPRINT_MULTI_LOCATION,
    BUSINESS_BLUEPRINT_RENTAL_EQUIPMENT_HIRE,
    BUSINESS_BLUEPRINT_DEALER_RESELLER_CHANNEL_PARTNER,
  ];

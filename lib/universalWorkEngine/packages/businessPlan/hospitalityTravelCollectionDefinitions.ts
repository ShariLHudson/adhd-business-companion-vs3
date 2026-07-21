/**
 * 237–240 — Hospitality & Travel Collection Blueprints (definition data only).
 * Collection: collection.hospitality_travel
 * Distinct from event.retreat facilitation, generic service, and retail F&B alone.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const HOSPITALITY_TRAVEL_COLLECTION_ID =
  "collection.hospitality_travel" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const HOSPITALITY_BUSINESS_BLUEPRINT_ID = "business.hospitality" as const;
export const RESTAURANT_BUSINESS_BLUEPRINT_ID = "business.restaurant" as const;
export const TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID =
  "business.travel_tourism" as const;
export const VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID =
  "business.venue_experience" as const;

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
  collectionId: HOSPITALITY_TRAVEL_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Hospitality & Travel Collection",
  notEventRetreatFacilitation: true,
  notGenericServiceOnly: true,
} as const;

/** 237 — Hospitality Business Blueprint */
export const BUSINESS_BLUEPRINT_HOSPITALITY = businessBlueprint({
  blueprintId: HOSPITALITY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Hospitality Business",
  description:
    "Build and operate hotels, inns, B&Bs, vacation rentals, and hospitality properties — guest journey, reservations, revenue, housekeeping, and recovery together.",
  intendedUse:
    "Lodging and hospitality property operators — not restaurant kitchen OS, tour packaging, or event facilitation alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Brand and Positioning", role: "required" },
    { id: "hosp_guest_personas", title: "Guest Personas", role: "required" },
    { id: "hosp_reservations", title: "Reservations", role: "required" },
    { id: "hosp_guest_journey", title: "Guest Journey", role: "required" },
    { id: "pricing", title: "Pricing and Revenue Management", role: "required" },
    { id: "hosp_housekeeping", title: "Housekeeping and Maintenance", ...depthGuided },
    { id: "hosp_staffing", title: "Staffing", ...depthGuided },
    { id: "hosp_service_partners", title: "Food and Service Partners", ...depthGuided },
    { id: "hosp_guest_recovery", title: "Guest Recovery", ...depthGuided },
    { id: "hosp_kpis", title: "Hospitality KPIs", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_property",
      prompt:
        "What kind of hospitality property are you operating — hotel, inn, B&B, vacation rental, or hybrid?",
      lowerFrictionPrompt: "What hospitality property is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_guests",
      prompt: "Who stays with you — and what does a great stay feel like for them?",
      lowerFrictionPrompt: "Who are your guests?",
      sectionId: "hosp_guest_personas",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "customers", "clients"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next hospitality move?",
      lowerFrictionPrompt: "What's the next small hospitality step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_brand", title: "Draft hospitality positioning", sectionId: "purpose_vision" },
    { id: "t_journey", title: "Map guest journey", sectionId: "hosp_guest_journey" },
    { id: "t_revenue", title: "Set revenue management basics", sectionId: "pricing" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Positioning clear" },
    { id: "m_journey", title: "Guest journey framed" },
    {
      id: "m_ops",
      title: "Reservations and recovery usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not an event retreat Blueprint",
    "Guest recovery needs a calm path",
    "Housekeeping capacity before peak rates",
    "Food partners are not a full restaurant OS",
  ],
  riskPrompts: [
    "What if occupancy looks fine until labor and maintenance land?",
    "What if guest recovery has no owner after hours?",
  ],
  researchPrompts: [
    "Compare small-property revenue management patterns",
    "Find guest recovery playbooks that stay human",
  ],
  deliverables: [
    "Hospitality Operating Plan",
    "Guest Journey Map",
    "SOP Library",
    "Revenue Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "finance",
    "marketing",
    "systems",
  ],
  boardReviewRecommendations: [
    "guest journey friction",
    "revenue vs labor",
    "recovery ownership",
  ],
  projectBridgeRecommendations: [
    "Bridge when renovation, onboarding, or peak-season prep needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Lodging OS — distinct from restaurant, travel packaging, and venue rental Blueprints",
    },
  ],
  completionCriteria: [
    "Property and guests framed",
    "Reservations and journey considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "hospitality_business" },
});

/** 238 — Restaurant & Food Service Blueprint */
export const BUSINESS_BLUEPRINT_RESTAURANT = businessBlueprint({
  blueprintId: RESTAURANT_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Restaurant & Food Service",
  description:
    "Operate restaurants, cafés, bakeries, food trucks, and catering — menu, costing, kitchen, front-of-house, safety, and financial performance.",
  intendedUse:
    "Food service operators — not lodging property OS, not event programming, not generic consulting service alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Concept", role: "required" },
    { id: "rest_menu", title: "Menu Engineering", role: "required" },
    { id: "pricing", title: "Food Costing and Pricing", role: "required" },
    { id: "rest_kitchen", title: "Kitchen Operations", role: "required" },
    { id: "rest_foh", title: "Front of House", ...depthGuided },
    { id: "rest_staffing", title: "Staffing", ...depthGuided },
    { id: "rest_vendors", title: "Vendor Management", ...depthGuided },
    { id: "rest_food_safety", title: "Food Safety Review Flags", ...depthGuided },
    { id: "rest_marketing", title: "Marketing", ...depthGuided },
    { id: "rest_financials", title: "Financial Performance", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_concept",
      prompt: "What food concept are you operating — and who is it for?",
      lowerFrictionPrompt: "What restaurant or food service is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_menu",
      prompt: "What belongs on the menu — and what stays off for costing and kitchen capacity?",
      lowerFrictionPrompt: "What's on the menu?",
      sectionId: "rest_menu",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["products", "offers", "services"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next food-service move?",
      lowerFrictionPrompt: "What's the next small restaurant step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_concept", title: "Clarify concept and guests", sectionId: "purpose_vision" },
    { id: "t_cost", title: "Build food-cost sheet for hero items", sectionId: "pricing" },
    { id: "t_safety", title: "List food-safety review flags", sectionId: "rest_food_safety" },
  ],
  suggestedMilestones: [
    { id: "m_concept", title: "Concept clear" },
    { id: "m_menu", title: "Menu engineered" },
    {
      id: "m_ops",
      title: "Kitchen and FOH framed",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Food safety flags are non-negotiable",
    "Menu engineering before marketing spend",
    "Catering here is food ops — not event design",
    "Vendor reliability affects every service",
  ],
  riskPrompts: [
    "What if food cost looks fine until waste and labor land?",
    "What if the menu outruns kitchen capacity?",
  ],
  researchPrompts: [
    "Compare menu engineering patterns for small kitchens",
    "Find calm food-safety checklist structures",
  ],
  deliverables: [
    "Restaurant Operating Plan",
    "Menu Engineering Sheet",
    "Food Cost Model",
    "Kitchen Workflow",
    "Food Safety Flags",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "finance",
    "marketing",
    "systems",
    "client-relationships",
  ],
  boardReviewRecommendations: ["food cost", "menu load", "safety ownership"],
  projectBridgeRecommendations: [
    "Bridge when build-out, menu launch, or catering ops need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "F&B OS — distinct from lodging hospitality and venue rental",
    },
  ],
  completionCriteria: [
    "Concept and menu framed",
    "Costing considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "restaurant_food_service" },
});

/** 239 — Travel & Tourism Business Blueprint */
export const BUSINESS_BLUEPRINT_TRAVEL_TOURISM = businessBlueprint({
  blueprintId: TRAVEL_TOURISM_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Travel & Tourism Business",
  description:
    "Operate travel agencies, tour operators, and tourism businesses — traveler profiles, itineraries, suppliers, bookings, risk, and seasonal planning.",
  intendedUse:
    "Travel packagers and tour operators — not hotel property OS, not retreat facilitation, not speaker travel logistics alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Travel Business Positioning", role: "required" },
    { id: "travel_profiles", title: "Traveler Profiles", role: "required" },
    { id: "travel_itinerary", title: "Itinerary Design", role: "required" },
    { id: "travel_suppliers", title: "Supplier Management", ...depthGuided },
    { id: "travel_bookings", title: "Bookings", role: "required" },
    { id: "travel_risk", title: "Risk Planning", ...depthGuided },
    { id: "travel_cx", title: "Customer Experience", ...depthGuided },
    { id: "travel_partnerships", title: "Partnerships", ...depthComplete },
    { id: "travel_seasonal", title: "Seasonal Planning", ...depthGuided },
    { id: "travel_operations", title: "Operations", ...depthComplete },
    { id: "travel_kpis", title: "Travel KPIs", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_travel",
      prompt:
        "What travel or tourism business are you building — agency, tours, destination experiences, or hybrid?",
      lowerFrictionPrompt: "What travel business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_travelers",
      prompt: "Who travels with you — and what kind of trip are they really buying?",
      lowerFrictionPrompt: "Who are your travelers?",
      sectionId: "travel_profiles",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "customers", "clients"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next travel-business move?",
      lowerFrictionPrompt: "What's the next small travel step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Clarify travel positioning", sectionId: "purpose_vision" },
    { id: "t_itinerary", title: "Draft one signature itinerary", sectionId: "travel_itinerary" },
    {
      id: "t_risk",
      title: "List trip risk flags",
      sectionId: "travel_risk",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_travelers", title: "Traveler profiles clear" },
    { id: "m_itinerary", title: "Itinerary design usable" },
    {
      id: "m_risk",
      title: "Risk planning framed",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not event.retreat facilitation",
    "Supplier backup before peak season",
    "Risk planning includes traveler communication",
    "Bookings need clear ownership and confirmation path",
  ],
  riskPrompts: [
    "What if one supplier failure breaks the whole itinerary?",
    "What if seasonal demand outruns staffing and confirmations?",
  ],
  researchPrompts: [
    "Compare tour packaging structures for small operators",
    "Find traveler risk-communication patterns",
  ],
  deliverables: [
    "Travel Business Snapshot",
    "Traveler Profile Map",
    "Signature Itinerary",
    "Supplier Map",
    "Booking Workflow",
    "Risk Plan",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "marketing",
    "finance",
    "systems",
  ],
  boardReviewRecommendations: [
    "supplier concentration",
    "risk ownership",
    "seasonal load",
  ],
  projectBridgeRecommendations: [
    "Bridge when a tour launch or destination program needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Travel packaging OS — distinct from lodging, restaurant, venue, and Event retreat",
    },
  ],
  completionCriteria: [
    "Travelers and itinerary framed",
    "Bookings considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "travel_tourism" },
});

/** 240 — Venue & Experience Business Blueprint */
export const BUSINESS_BLUEPRINT_VENUE_EXPERIENCE = businessBlueprint({
  blueprintId: VENUE_EXPERIENCE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Venue & Experience Business",
  description:
    "Manage venues and experience-based businesses — positioning, capacity, bookings, event coordination, vendors, safety, and revenue streams.",
  intendedUse:
    "Venue and experience operators — not lodging nightly stays, not kitchen OS, not member-produced Event Blueprints that merely use a venue.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Venue Positioning", role: "required" },
    { id: "venue_capacity", title: "Capacity Planning", role: "required" },
    { id: "venue_bookings", title: "Bookings", role: "required" },
    { id: "venue_event_coord", title: "Event Coordination", ...depthGuided },
    { id: "venue_vendors", title: "Vendors", ...depthGuided },
    { id: "venue_safety", title: "Safety", ...depthGuided },
    { id: "venue_revenue", title: "Revenue Streams", role: "required" },
    { id: "venue_guest_xp", title: "Guest Experience", ...depthGuided },
    { id: "venue_maintenance", title: "Maintenance", ...depthComplete },
    { id: "venue_growth", title: "Growth", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_venue",
      prompt: "What venue or experience business are you operating — and what is it best for?",
      lowerFrictionPrompt: "What venue or experience is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "space"],
      materialChangeNextStep: true,
    },
    {
      id: "q_capacity",
      prompt: "What is true capacity — guests, turn time, and simultaneous uses?",
      lowerFrictionPrompt: "What's your capacity?",
      sectionId: "venue_capacity",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["constraints", "inventory"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next venue move?",
      lowerFrictionPrompt: "What's the next small venue step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Clarify venue positioning", sectionId: "purpose_vision" },
    { id: "t_capacity", title: "Document capacity rules", sectionId: "venue_capacity" },
    { id: "t_safety", title: "List safety ownership", sectionId: "venue_safety" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Positioning clear" },
    { id: "m_capacity", title: "Capacity rules usable" },
    {
      id: "m_booking",
      title: "Booking path clear",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Distinct from event.retreat content design",
    "Capacity includes turn time and staffing",
    "Safety ownership before growth marketing",
    "Revenue streams beyond single rental type",
  ],
  riskPrompts: [
    "What if double-bookings have no calm recovery path?",
    "What if vendors arrive without clear venue rules?",
  ],
  researchPrompts: [
    "Compare venue booking and deposit structures",
    "Find experience-business capacity planning patterns",
  ],
  deliverables: [
    "Venue Operating Plan",
    "Capacity Plan",
    "Booking Workflow",
    "Vendor Rules",
    "Safety Ownership Map",
    "Revenue Stream Map",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "sales",
    "client-relationships",
    "finance",
    "systems",
  ],
  boardReviewRecommendations: ["capacity honesty", "safety", "booking friction"],
  projectBridgeRecommendations: [
    "Bridge when build-out, seasonal programming, or booking-system setup needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Venue/space ops — Event Blueprints may use the venue without merging OS",
    },
  ],
  completionCriteria: [
    "Venue positioning and capacity framed",
    "Bookings considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "venue_experience" },
});

export const HOSPITALITY_TRAVEL_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_HOSPITALITY,
    BUSINESS_BLUEPRINT_RESTAURANT,
    BUSINESS_BLUEPRINT_TRAVEL_TOURISM,
    BUSINESS_BLUEPRINT_VENUE_EXPERIENCE,
  ];

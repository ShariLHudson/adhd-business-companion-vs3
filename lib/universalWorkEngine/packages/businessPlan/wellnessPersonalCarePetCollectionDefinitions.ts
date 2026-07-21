/**
 * 245–248 — Wellness, Personal Care & Pet Collection (definition data only).
 * Collection: collection.wellness_personal_care_pet
 * Distinct from business.service, business.coaching, hospitality, home_service, membership OS.
 * Safety: non-clinical / non-veterinary business design only — drafts are not professionally approved.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const WELLNESS_PERSONAL_CARE_PET_COLLECTION_ID =
  "collection.wellness_personal_care_pet" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID =
  "business.wellness_practice" as const;
export const BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID =
  "business.beauty_personal_care" as const;
export const FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID =
  "business.fitness_studio_coaching" as const;
export const PET_SERVICE_BUSINESS_BLUEPRINT_ID =
  "business.pet_service" as const;

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
  collectionId: WELLNESS_PERSONAL_CARE_PET_COLLECTION_ID,
  collectionOwner:
    "Business Intelligence / Wellness Personal Care Pet Collection",
  notClinicalHealthcare: true,
  notVeterinaryCare: true,
  notGenericServiceOnly: true,
  notBusinessCoachingOnly: true,
  notHospitalityLodgingOnly: true,
  notHomeServiceOnly: true,
  notMembershipOsOnly: true,
  draftsNotProfessionallyApproved: true,
} as const;

/** 245 — Wellness Practice Business Blueprint */
export const BUSINESS_BLUEPRINT_WELLNESS_PRACTICE = businessBlueprint({
  blueprintId: WELLNESS_PRACTICE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Wellness Practice Business",
  description:
    "Build and operate a non-emergency wellness practice — scope, intake, offers, pricing, scheduling, documentation, follow-up, referrals, and boundaries together.",
  intendedUse:
    "Holistic, massage, mindfulness, breathwork, wellness education, and lawful-scope lifestyle support practices — not clinical care, diagnosis, treatment, or generic business coaching.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Practice Identity and Scope", role: "required" },
    { id: "wp_service_offers", title: "Service and Offer Design", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "wp_inquiry_fit", title: "Inquiry and Fit", role: "required" },
    { id: "wp_intake_consent", title: "Intake and Consent", ...depthGuided },
    { id: "wp_client_journey", title: "Client Journey", ...depthGuided },
    { id: "wp_session_delivery", title: "Session Prep and Delivery", ...depthGuided },
    { id: "wp_education", title: "Education and Resources", ...depthGuided },
    { id: "wp_scheduling", title: "Scheduling and Ops", ...depthGuided },
    { id: "wp_retention", title: "Client Relationship and Retention", ...depthGuided },
    { id: "wp_privacy_risk", title: "Privacy, Records, and Risk", ...depthComplete },
    { id: "wp_performance", title: "Practice Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_scope",
      prompt:
        "What wellness work do you offer — and what is firmly outside your scope?",
      lowerFrictionPrompt: "What kind of wellness practice is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_offers",
      prompt: "What sessions, packages, or group offers do you want to sell?",
      lowerFrictionPrompt: "What services do you offer?",
      sectionId: "wp_service_offers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next practice move?",
      lowerFrictionPrompt: "What's the next small practice step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_scope", title: "Draft scope and referral criteria", sectionId: "purpose_vision" },
    { id: "t_menu", title: "Build service menu", sectionId: "wp_service_offers" },
    { id: "t_intake", title: "Sketch intake and consent path", sectionId: "wp_intake_consent" },
  ],
  suggestedMilestones: [
    { id: "m_scope", title: "Scope and boundaries clear" },
    { id: "m_offers", title: "Offers and pricing framed" },
    {
      id: "m_intake",
      title: "Intake path usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not clinical care — no diagnosis, treatment, or emergency authority",
    "Consent and intake drafts are not professionally approved",
    "Referral criteria protect both client and practitioner",
    "Retention without dependency",
  ],
  riskPrompts: [
    "What if a client needs care outside your lawful scope?",
    "What if privacy or records have no calm owner?",
  ],
  researchPrompts: [
    "Compare simple wellness intake patterns that stay non-clinical",
    "Find package pricing that protects capacity",
  ],
  deliverables: [
    "Wellness Practice Snapshot",
    "Scope of Practice Statement",
    "Service Boundary Guide",
    "Referral and Escalation Criteria",
    "Ideal Client Profile",
    "Service Menu",
    "Wellness Pricing Model",
    "Capacity Plan",
    "Intake and Consent Drafts",
    "Client Journey Map",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "client-relationships",
    "operations",
    "finance",
    "risk",
  ],
  boardReviewRecommendations: [
    "scope boundaries",
    "capacity vs demand",
    "referral readiness",
  ],
  projectBridgeRecommendations: [
    "Bridge when studio setup, onboarding systems, or launch prep needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Wellness practice OS — distinct from business.coaching and clinical care",
    },
  ],
  completionCriteria: [
    "Scope and services framed",
    "Pricing and intake considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "wellness_practice",
  },
});

/** 246 — Beauty & Personal Care Business Blueprint */
export const BUSINESS_BLUEPRINT_BEAUTY_PERSONAL_CARE = businessBlueprint({
  blueprintId: BEAUTY_PERSONAL_CARE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Beauty & Personal Care Business",
  description:
    "Design profitable beauty and personal-care services — menu, booking, intake, sanitation, aftercare, retail, retention, and studio ops together.",
  intendedUse:
    "Salons, stylists, barbers, nails, esthetics, makeup, lash/brow, mobile beauty, and non-medical spas — not medical esthetics, lodging hospitality, or home-service OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business Positioning", role: "required" },
    { id: "bc_service_menu", title: "Service Menu", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "bc_booking", title: "Booking and Scheduling", role: "required" },
    { id: "bc_intake", title: "Client Intake and Consultation", ...depthGuided },
    { id: "bc_delivery", title: "Service Delivery", ...depthGuided },
    { id: "bc_aftercare", title: "Aftercare and Follow-Up", ...depthGuided },
    { id: "bc_retail", title: "Retail Product Sales", ...depthGuided },
    { id: "bc_retention", title: "Client Retention and Loyalty", ...depthGuided },
    { id: "bc_team_ops", title: "Team and Studio Operations", ...depthGuided },
    { id: "bc_marketing", title: "Marketing and Portfolio", ...depthComplete },
    { id: "bc_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_position",
      prompt:
        "What beauty or personal-care work do you specialize in — and what do you not take?",
      lowerFrictionPrompt: "What kind of beauty business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_menu",
      prompt: "What is on your service menu — and how long does each appointment take?",
      lowerFrictionPrompt: "What services do you offer?",
      sectionId: "bc_service_menu",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next beauty-business move?",
      lowerFrictionPrompt: "What's the next small studio step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_menu", title: "Finalize service menu and durations", sectionId: "bc_service_menu" },
    { id: "t_booking", title: "Set booking and deposit rules", sectionId: "bc_booking" },
    { id: "t_sanitation", title: "Write sanitation QC checklist", sectionId: "bc_delivery" },
  ],
  suggestedMilestones: [
    { id: "m_menu", title: "Service menu clear" },
    { id: "m_booking", title: "Booking rules usable" },
    {
      id: "m_ops",
      title: "Delivery and aftercare framed",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not medical esthetics or clinical care",
    "Consent and aftercare drafts are not professionally approved",
    "Chair capacity before promotion volume",
    "Retail stays salon-attached — not a full ecommerce OS",
  ],
  riskPrompts: [
    "What if bookings fill but sanitation and prep cannot keep up?",
    "What if reaction or issue escalation has no calm owner?",
  ],
  researchPrompts: [
    "Compare deposit and no-show patterns for small salons",
    "Find aftercare language that stays warm and clear",
  ],
  deliverables: [
    "Beauty Snapshot",
    "Service Menu",
    "Appointment Duration Standards",
    "Service Pricing Model",
    "Chair or Room Capacity Plan",
    "Booking Rules",
    "Client Intake Form",
    "Sanitation Review Checklist",
    "Aftercare Guide",
    "Retail Product Assortment",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "marketing",
    "finance",
  ],
  boardReviewRecommendations: [
    "rebooking rate",
    "chair capacity",
    "sanitation ownership",
  ],
  projectBridgeRecommendations: [
    "Bridge when studio build-out, team training, or launch campaigns need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Beauty domain OS — distinct from hospitality lodging and home_service",
    },
  ],
  completionCriteria: [
    "Menu and pricing framed",
    "Booking and intake considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "beauty_personal_care",
  },
});

/** 247 — Fitness Studio & Coaching Business Blueprint */
export const BUSINESS_BLUEPRINT_FITNESS_STUDIO_COACHING = businessBlueprint({
  blueprintId: FITNESS_STUDIO_COACHING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Fitness Studio & Coaching Business",
  description:
    "Build fitness programs and studio operations — offers, screening, onboarding, class delivery, progress, retention, equipment, and instructor standards together.",
  intendedUse:
    "Personal trainers, fitness coaches, group/yoga/Pilates studios, S&C, online fitness, and small gyms — not clinical rehab, and not generic business/life coaching OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business and Program Positioning", role: "required" },
    { id: "fit_programs", title: "Program and Offer Design", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "fit_screening", title: "Inquiry, Screening, and Referral", role: "required" },
    { id: "fit_onboarding", title: "Onboarding", ...depthGuided },
    { id: "fit_program_plan", title: "Program Planning", ...depthGuided },
    { id: "fit_delivery", title: "Session and Class Delivery", ...depthGuided },
    { id: "fit_progress", title: "Progress and Review", ...depthGuided },
    { id: "fit_retention", title: "Client Experience and Retention", ...depthGuided },
    { id: "fit_studio_ops", title: "Studio and Equipment Operations", ...depthGuided },
    { id: "fit_team", title: "Team and Instructor Management", ...depthComplete },
    { id: "fit_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_position",
      prompt:
        "What fitness programs or studio work do you run — 1:1, group, online, or hybrid?",
      lowerFrictionPrompt: "What kind of fitness business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_programs",
      prompt: "What programs, classes, or packages should clients choose from?",
      lowerFrictionPrompt: "What programs do you offer?",
      sectionId: "fit_programs",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next fitness-business move?",
      lowerFrictionPrompt: "What's the next small studio step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_programs", title: "Map program and package menu", sectionId: "fit_programs" },
    { id: "t_screen", title: "Draft screening and referral flags", sectionId: "fit_screening" },
    { id: "t_class", title: "Write class run sheet", sectionId: "fit_delivery" },
  ],
  suggestedMilestones: [
    { id: "m_programs", title: "Programs and pricing clear" },
    { id: "m_screen", title: "Screening path framed" },
    {
      id: "m_ops",
      title: "Delivery and studio ops usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not healthcare or rehab — no diagnosis or unsafe prescription",
    "Use business.coaching for general/business/life coaching — this owns physical programs",
    "Membership packages are offer types — not the full membership OS",
    "Incident reporting needs a calm owner",
  ],
  riskPrompts: [
    "What if a client needs medical clearance before training?",
    "What if class capacity and instructor coverage drift apart?",
  ],
  researchPrompts: [
    "Compare simple readiness screening patterns for studios",
    "Find class capacity models that protect coaching quality",
  ],
  deliverables: [
    "Fitness Snapshot",
    "Scope and Referral Statement",
    "Service Menu",
    "One-to-One Program",
    "Group Program",
    "Membership or Package Model",
    "Pricing Model",
    "Readiness Questionnaire",
    "Client Welcome Packet",
    "Class Run Sheet",
    "Progression Framework",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "finance",
    "systems",
  ],
  boardReviewRecommendations: [
    "attendance and retention",
    "trainer capacity",
    "screening ownership",
  ],
  projectBridgeRecommendations: [
    "Bridge when studio launch, curriculum build, or instructor onboarding needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Fitness/studio OS — distinct from business.coaching and membership OS",
    },
  ],
  completionCriteria: [
    "Programs and pricing framed",
    "Screening and delivery considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "fitness_studio_coaching",
  },
});

/** 248 — Pet Service Business Blueprint */
export const BUSINESS_BLUEPRINT_PET_SERVICE = businessBlueprint({
  blueprintId: PET_SERVICE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Pet Service Business",
  description:
    "Operate non-veterinary pet services — inquiry, animal intake, routing, delivery logs, owner communication, incidents, and recurring care together.",
  intendedUse:
    "Sitters, walkers, groomers, daycare, boarding, mobile pet, transport, and enrichment businesses — not veterinary care, and not generic home-service OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business and Service Model", role: "required" },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "pet_inquiry_fit", title: "Inquiry and Animal Fit", role: "required" },
    { id: "pet_consent_access", title: "Consent, Access, and Authorization", ...depthGuided },
    { id: "pet_scheduling", title: "Scheduling and Routing", role: "required" },
    { id: "pet_delivery", title: "Service Delivery", ...depthGuided },
    { id: "pet_owner_comms", title: "Owner Communication", ...depthGuided },
    { id: "pet_safety", title: "Safety and Incident Management", ...depthGuided },
    { id: "pet_supplies", title: "Supplies, Vehicles, and Facilities", ...depthGuided },
    { id: "pet_team", title: "Team and Coverage", ...depthComplete },
    { id: "pet_retention", title: "Retention and Referrals", ...depthGuided },
    { id: "pet_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt:
        "What pet services do you offer — walking, sitting, grooming, daycare, boarding, mobile, or hybrid?",
      lowerFrictionPrompt: "What kind of pet service is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_fit",
      prompt: "How do you decide whether an animal and owner are a good fit?",
      lowerFrictionPrompt: "How do you screen pets and owners?",
      sectionId: "pet_inquiry_fit",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next pet-service move?",
      lowerFrictionPrompt: "What's the next small pet-business step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_profile", title: "Build pet profile and fit checklist", sectionId: "pet_inquiry_fit" },
    { id: "t_route", title: "Sketch daily route rules", sectionId: "pet_scheduling" },
    { id: "t_incident", title: "Define incident and vet contact path", sectionId: "pet_safety" },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Service model clear" },
    { id: "m_intake", title: "Animal intake path framed" },
    {
      id: "m_ops",
      title: "Routing and safety usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not veterinary care — drafts are not professionally approved",
    "Animal-care domain wins over generic home_service",
    "Key/home access needs explicit authorization records",
    "Escape and injury protocols need calm ownership",
  ],
  riskPrompts: [
    "What if medication or emergency authorization is incomplete before a visit?",
    "What if a pet escapes and no protocol owner is named?",
  ],
  researchPrompts: [
    "Compare simple pet intake and meet-and-greet patterns",
    "Find route capacity models for walkers and sitters",
  ],
  deliverables: [
    "Pet Service Snapshot",
    "Service Area",
    "Service Pricing Model",
    "Pet Profile",
    "Veterinary and Emergency Authorization Draft",
    "Key and Home Access Record",
    "Daily Route",
    "Visit Checklist",
    "Escape or Missing-Pet Protocol Draft",
    "Recurring Care Plan",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "risk",
    "systems",
  ],
  boardReviewRecommendations: [
    "route capacity",
    "incident readiness",
    "recurring retention",
  ],
  projectBridgeRecommendations: [
    "Bridge when vehicle/facility setup, team coverage, or launch ops need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Pet-service OS — distinct from home_service and veterinary care",
    },
  ],
  completionCriteria: [
    "Service model and pricing framed",
    "Intake, routing, and safety considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "pet_service",
  },
});

export const WELLNESS_PERSONAL_CARE_PET_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_WELLNESS_PRACTICE,
    BUSINESS_BLUEPRINT_BEAUTY_PERSONAL_CARE,
    BUSINESS_BLUEPRINT_FITNESS_STUDIO_COACHING,
    BUSINESS_BLUEPRINT_PET_SERVICE,
  ];

/**
 * 261–264 — Tech, Media & Creative Collection (definition data only).
 * Collection: collection.tech_media_creative
 * Distinct from content_creator, course_creator, membership, service, consulting, ecommerce.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const TECH_MEDIA_CREATIVE_COLLECTION_ID =
  "collection.tech_media_creative" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID =
  "business.software_saas" as const;
export const MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID =
  "business.media_publishing" as const;
export const CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID =
  "business.creative_agency_studio" as const;
export const RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID =
  "business.research_innovation_lab" as const;

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
  collectionId: TECH_MEDIA_CREATIVE_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Tech Media Creative Collection",
  notContentCreatorOnly: true,
  notCourseCreatorOnly: true,
  notMembershipOnly: true,
  notGenericServiceOnly: true,
  notConsultingOnly: true,
  notEcommerceOnly: true,
  notProductCommerceOnly: true,
} as const;

/** 261 — Software & SaaS Business Blueprint */
export const BUSINESS_BLUEPRINT_SOFTWARE_SAAS = businessBlueprint({
  blueprintId: SOFTWARE_SAAS_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Software & SaaS Business",
  description:
    "Build, launch, operate, and scale software and SaaS — product vision, PRDs, roadmaps, releases, onboarding, support, pricing, and KPIs together.",
  intendedUse:
    "Software and SaaS companies — not physical product commerce, not creator course/membership OS, not generic consulting engagements.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Product Vision", role: "required" },
    { id: "saas_prd", title: "Product Requirements", role: "required" },
    { id: "saas_roadmap", title: "Roadmaps", role: "required" },
    { id: "saas_backlog", title: "Feature Backlog", ...depthGuided },
    { id: "saas_release", title: "Release Plans", ...depthGuided },
    { id: "saas_personas", title: "User Personas", ...depthGuided },
    { id: "pricing", title: "Pricing Model", role: "required" },
    { id: "saas_onboarding", title: "Customer Onboarding", ...depthGuided },
    { id: "saas_support", title: "Support Workflows", ...depthGuided },
    { id: "saas_performance", title: "KPI Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_product",
      prompt: "What product or SaaS are you building — and who is it for?",
      lowerFrictionPrompt: "What software are you building?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_roadmap",
      prompt: "What must ship next — and what can wait?",
      lowerFrictionPrompt: "What's on the roadmap?",
      sectionId: "saas_roadmap",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next product move?",
      lowerFrictionPrompt: "What's the next small SaaS step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_vision", title: "Draft product vision", sectionId: "purpose_vision" },
    { id: "t_prd", title: "Write core PRD outline", sectionId: "saas_prd" },
    { id: "t_onboard", title: "Sketch customer onboarding", sectionId: "saas_onboarding" },
  ],
  suggestedMilestones: [
    { id: "m_vision", title: "Product vision clear" },
    { id: "m_roadmap", title: "Roadmap framed" },
    {
      id: "m_ops",
      title: "Pricing and onboarding considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not ecommerce or physical product commerce OS",
    "Support capacity before launch volume",
    "Pricing must match who the product is for",
    "Release plans need an owner",
  ],
  riskPrompts: [
    "What if the backlog grows faster than release capacity?",
    "What if onboarding cannot absorb new customers calmly?",
  ],
  researchPrompts: [
    "Compare simple SaaS onboarding sequences",
    "Find lightweight PRD patterns for small teams",
  ],
  deliverables: [
    "Product Vision",
    "Product Requirements",
    "Roadmap",
    "Feature Backlog",
    "Release Plan",
    "User Personas",
    "Pricing Model",
    "Customer Onboarding",
    "Support Workflows",
    "KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "systems", "client-relationships", "finance"],
  boardReviewRecommendations: ["roadmap load", "activation", "retention"],
  projectBridgeRecommendations: [
    "Bridge when launch prep, migration, or major release work needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Software/SaaS product OS — distinct from content_creator and product commerce",
    },
  ],
  completionCriteria: [
    "Vision and roadmap framed",
    "Pricing and onboarding considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "software_saas" },
});

/** 262 — Media & Publishing Business Blueprint */
export const BUSINESS_BLUEPRINT_MEDIA_PUBLISHING = businessBlueprint({
  blueprintId: MEDIA_PUBLISHING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Media & Publishing Business",
  description:
    "Operate magazines, newsletters, podcasts, video channels, and media brands — editorial strategy, calendars, pipeline, sponsorship, distribution, and monetization together.",
  intendedUse:
    "Media and publishing companies — not solo content-creator brand OS, not course/membership product OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Editorial Strategy", role: "required" },
    { id: "media_calendar", title: "Publishing Calendar", role: "required" },
    { id: "media_pipeline", title: "Content Pipeline", role: "required" },
    { id: "media_sponsorship", title: "Sponsorship Kit", ...depthGuided },
    { id: "media_distribution", title: "Distribution Plan", ...depthGuided },
    { id: "media_audience", title: "Audience Growth Plan", ...depthGuided },
    { id: "pricing", title: "Monetization Model", role: "required" },
    { id: "media_performance", title: "Performance Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_brand",
      prompt: "What media brand are you operating — newsletter, podcast, magazine, video channel, or hybrid?",
      lowerFrictionPrompt: "What kind of media business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_calendar",
      prompt: "What publishing rhythm can you keep without burning out the team?",
      lowerFrictionPrompt: "What's your publishing cadence?",
      sectionId: "media_calendar",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next media move?",
      lowerFrictionPrompt: "What's the next small publishing step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_strategy", title: "Draft editorial strategy", sectionId: "purpose_vision" },
    { id: "t_calendar", title: "Build publishing calendar skeleton", sectionId: "media_calendar" },
    { id: "t_mono", title: "Name monetization paths", sectionId: "pricing" },
  ],
  suggestedMilestones: [
    { id: "m_strategy", title: "Editorial strategy clear" },
    { id: "m_calendar", title: "Calendar framed" },
    {
      id: "m_ops",
      title: "Pipeline and monetization considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not solo content_creator OS — this is media company ops",
    "Cadence before sponsorship promises",
    "Distribution owns discovery as much as creation",
    "Audience growth needs one primary channel first",
  ],
  riskPrompts: [
    "What if the calendar fills faster than production capacity?",
    "What if sponsorship lands before fulfillment systems exist?",
  ],
  researchPrompts: [
    "Compare simple publishing calendar patterns for small media teams",
    "Find sponsorship kit structures that stay honest",
  ],
  deliverables: [
    "Editorial Strategy",
    "Publishing Calendar",
    "Content Pipeline",
    "Sponsorship Kit",
    "Distribution Plan",
    "Audience Growth Plan",
    "Monetization Model",
    "Performance Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["marketing", "operations", "client-relationships", "finance"],
  boardReviewRecommendations: ["cadence health", "audience growth", "monetization mix"],
  projectBridgeRecommendations: [
    "Bridge when relaunch, channel expansion, or sponsorship campaigns need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Media/publishing OS — distinct from business.content_creator",
    },
  ],
  completionCriteria: [
    "Strategy and calendar framed",
    "Monetization considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "media_publishing" },
});

/** 263 — Creative Agency & Studio Blueprint */
export const BUSINESS_BLUEPRINT_CREATIVE_AGENCY_STUDIO = businessBlueprint({
  blueprintId: CREATIVE_AGENCY_STUDIO_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Creative Agency & Studio",
  description:
    "Run creative agencies and studios — service catalog, proposals, briefs, production schedules, reviews, approvals, assets, billing, and client reporting together.",
  intendedUse:
    "Creative agencies and studios — not generic consulting/service OS, not solo creator brand OS, not SaaS product OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Studio Positioning", role: "required" },
    { id: "agency_catalog", title: "Service Catalog", role: "required" },
    { id: "agency_proposal", title: "Proposal", role: "required" },
    { id: "agency_brief", title: "Creative Brief", ...depthGuided },
    { id: "agency_schedule", title: "Production Schedule", ...depthGuided },
    { id: "agency_review", title: "Review Workflow", ...depthGuided },
    { id: "agency_brand", title: "Brand Guide", ...depthGuided },
    { id: "agency_assets", title: "Asset Registry", ...depthGuided },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "agency_reporting", title: "Client Reporting", ...depthComplete },
    { id: "agency_performance", title: "Studio Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_studio",
      prompt: "What creative work do you sell — brand, design, video, content production, or hybrid?",
      lowerFrictionPrompt: "What kind of studio is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_catalog",
      prompt: "What is on your service catalog — and what is firmly out of scope?",
      lowerFrictionPrompt: "What services do you offer?",
      sectionId: "agency_catalog",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next studio move?",
      lowerFrictionPrompt: "What's the next small agency step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_catalog", title: "Finalize service catalog", sectionId: "agency_catalog" },
    { id: "t_brief", title: "Draft creative brief template", sectionId: "agency_brief" },
    { id: "t_review", title: "Define review and approval path", sectionId: "agency_review" },
  ],
  suggestedMilestones: [
    { id: "m_catalog", title: "Service catalog clear" },
    { id: "m_proposal", title: "Proposal path framed" },
    {
      id: "m_ops",
      title: "Production and review usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not generic consulting OS — creative production owns this Blueprint",
    "Review/approval gates before final delivery",
    "Capacity before proposal volume",
    "Asset registry prevents lost work",
  ],
  riskPrompts: [
    "What if revisions have no boundary?",
    "What if production schedules promise more than the team can hold?",
  ],
  researchPrompts: [
    "Compare simple creative brief templates",
    "Find review workflows that protect both client and studio",
  ],
  deliverables: [
    "Service Catalog",
    "Proposal Template",
    "Creative Brief",
    "Production Schedule",
    "Review Workflow",
    "Brand Guide",
    "Asset Registry",
    "Client Reporting",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "marketing",
    "finance",
  ],
  boardReviewRecommendations: ["utilization", "revision load", "proposal win rate"],
  projectBridgeRecommendations: [
    "Bridge when studio systems, template libraries, or major campaigns need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Creative production OS — distinct from consulting and content_creator",
    },
  ],
  completionCriteria: [
    "Catalog and proposal framed",
    "Production/review considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "creative_agency_studio",
  },
});

/** 264 — Research & Innovation Lab Blueprint */
export const BUSINESS_BLUEPRINT_RESEARCH_INNOVATION_LAB = businessBlueprint({
  blueprintId: RESEARCH_INNOVATION_LAB_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Research & Innovation Lab",
  description:
    "Organize research and innovation — charters, experiments, hypotheses, validation, prototypes, opportunity portfolios, and commercialization handoffs together.",
  intendedUse:
    "Research labs, innovation teams, and discovery portfolios — not shipping SaaS ops alone, not consulting advisory OS, not education course OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Lab Positioning", role: "required" },
    { id: "lab_charter", title: "Research Charter", role: "required" },
    { id: "lab_experiment", title: "Experiment Plan", role: "required" },
    { id: "lab_hypothesis", title: "Hypothesis Tracker", ...depthGuided },
    { id: "lab_validation", title: "Validation Report", ...depthGuided },
    { id: "lab_prototype", title: "Prototype Roadmap", ...depthGuided },
    { id: "lab_portfolio", title: "Opportunity Portfolio", ...depthGuided },
    { id: "lab_scorecard", title: "Innovation Scorecard", ...depthComplete },
    { id: "lab_commercialize", title: "Commercialization Handoff", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_lab",
      prompt: "What is this lab trying to discover, prove, or invent right now?",
      lowerFrictionPrompt: "What is the lab for?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_experiment",
      prompt: "What experiment or validation should run next?",
      lowerFrictionPrompt: "What's the next experiment?",
      sectionId: "lab_experiment",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next research move?",
      lowerFrictionPrompt: "What's the next small lab step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_charter", title: "Write research charter", sectionId: "lab_charter" },
    { id: "t_hyp", title: "List active hypotheses", sectionId: "lab_hypothesis" },
    { id: "t_port", title: "Sketch opportunity portfolio", sectionId: "lab_portfolio" },
  ],
  suggestedMilestones: [
    { id: "m_charter", title: "Charter clear" },
    { id: "m_experiment", title: "Experiment path framed" },
    {
      id: "m_portfolio",
      title: "Portfolio and handoff considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Handoff to software_saas when an opportunity becomes a product",
    "Validation before scale claims",
    "Not a consulting advisory OS",
    "Kill criteria are as important as build criteria",
  ],
  riskPrompts: [
    "What if experiments continue without clear stop rules?",
    "What if promising ideas never get a commercialization owner?",
  ],
  researchPrompts: [
    "Compare simple hypothesis tracker patterns",
    "Find innovation portfolio reviews that stay light",
  ],
  deliverables: [
    "Research Charter",
    "Experiment Plan",
    "Hypothesis Tracker",
    "Validation Report",
    "Prototype Roadmap",
    "Opportunity Portfolio",
    "Innovation Scorecard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "systems",
    "project-management",
    "finance",
  ],
  boardReviewRecommendations: [
    "experiment throughput",
    "validation quality",
    "portfolio balance",
  ],
  projectBridgeRecommendations: [
    "Bridge when prototype builds, pilots, or commercialization prep need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Discovery/innovation OS — handoff to software_saas when shipping begins",
    },
  ],
  completionCriteria: [
    "Charter and experiment framed",
    "Portfolio considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "research_innovation_lab",
  },
});

export const TECH_MEDIA_CREATIVE_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_SOFTWARE_SAAS,
    BUSINESS_BLUEPRINT_MEDIA_PUBLISHING,
    BUSINESS_BLUEPRINT_CREATIVE_AGENCY_STUDIO,
    BUSINESS_BLUEPRINT_RESEARCH_INNOVATION_LAB,
  ];

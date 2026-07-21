/**
 * 279–282 — Financial, Investment & Property Collection (definition data only).
 * Collection: collection.financial_investment_property
 * Distinct from accounting_bookkeeping_tax, insurance_agency,
 * real_estate_brokerage_agent, property_management, contractor_construction.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const FINANCIAL_INVESTMENT_PROPERTY_COLLECTION_ID =
  "collection.financial_investment_property" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID =
  "business.investment_wealth" as const;
export const COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID =
  "business.commercial_real_estate" as const;
export const PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID =
  "business.property_development" as const;
export const INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID =
  "business.investor_holding_company" as const;

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
  collectionId: FINANCIAL_INVESTMENT_PROPERTY_COLLECTION_ID,
  collectionOwner:
    "Business Intelligence / Financial Investment Property Collection",
  notAccountingTaxOnly: true,
  notInsuranceOnly: true,
  notResidentialBrokerageOnly: true,
  notPropertyManagementOnly: true,
  notContractorOnly: true,
  draftsNotFinancialAdvice: true,
  draftsNotLegalCounsel: true,
} as const;

/** 279 — Investment & Wealth Business Blueprint */
export const BUSINESS_BLUEPRINT_INVESTMENT_WEALTH = businessBlueprint({
  blueprintId: INVESTMENT_WEALTH_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Investment & Wealth Business",
  description:
    "Support investment advisory, wealth management, and financial-planning businesses — discovery, planning workflows, review meetings, portfolio governance, and compliance review flags together.",
  intendedUse:
    "Investment advisory, wealth management, and financial-planning practices — not accounting/tax OS, not insurance agency OS; drafts are not licensed financial advice.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Practice Positioning", role: "required" },
    { id: "iw_discovery", title: "Client Discovery", role: "required" },
    { id: "iw_planning", title: "Financial Planning Workflow", role: "required" },
    { id: "iw_review", title: "Review Meetings", ...depthGuided },
    { id: "iw_goals", title: "Goal Tracking", ...depthGuided },
    { id: "iw_policy", title: "Investment Policy", ...depthGuided },
    { id: "iw_calendar", title: "Service Calendar", ...depthGuided },
    { id: "iw_compliance", title: "Compliance Review Flags", ...depthComplete },
    { id: "iw_ops", title: "Practice Operations", ...depthGuided },
    { id: "iw_performance", title: "KPI Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_practice",
      prompt:
        "Is this advisory, wealth management, financial planning, or a hybrid — and what is out of scope?",
      lowerFrictionPrompt: "What kind of investment or wealth practice is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_discovery",
      prompt: "What must you understand about a client before planning begins?",
      lowerFrictionPrompt: "How do you discover client needs?",
      sectionId: "iw_discovery",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "clients", "customers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next practice move?",
      lowerFrictionPrompt: "What's the next small wealth-practice step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    {
      id: "t_discovery",
      title: "Draft client discovery profile",
      sectionId: "iw_discovery",
    },
    {
      id: "t_planning",
      title: "Map financial planning workflow",
      sectionId: "iw_planning",
    },
    {
      id: "t_review",
      title: "Sketch review meeting agenda",
      sectionId: "iw_review",
    },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Practice scope clear" },
    { id: "m_planning", title: "Planning workflow framed" },
    {
      id: "m_ops",
      title: "Review rhythm and compliance flags usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Drafts are not licensed financial advice",
    "Not accounting/tax filing OS",
    "Compliance review flags stay visible",
    "Review cadence before AUM promises",
  ],
  riskPrompts: [
    "What if planning continues without a clear review rhythm?",
    "What if compliance flags have no calm owner?",
  ],
  researchPrompts: [
    "Compare simple client discovery profiles for advisory practices",
    "Find review-meeting agendas that stay human and clear",
  ],
  deliverables: [
    "Client Discovery Profile",
    "Financial Planning Workflow",
    "Review Meeting Agenda",
    "Goal Tracking",
    "Investment Policy Draft",
    "Service Calendar",
    "KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "client-relationships",
    "finance",
    "risk",
    "operations",
  ],
  boardReviewRecommendations: [
    "review cadence",
    "capacity",
    "compliance readiness",
  ],
  projectBridgeRecommendations: [
    "Bridge when CRM/planning system setup or onboarding redesign needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Wealth/advisory OS — distinct from accounting_bookkeeping_tax and insurance_agency",
    },
  ],
  completionCriteria: [
    "Practice and discovery framed",
    "Planning workflow considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "investment_wealth" },
});

/** 280 — Commercial Real Estate Business Blueprint */
export const BUSINESS_BLUEPRINT_COMMERCIAL_REAL_ESTATE = businessBlueprint({
  blueprintId: COMMERCIAL_REAL_ESTATE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Commercial Real Estate Business",
  description:
    "Organize commercial brokerage, leasing, acquisitions, dispositions, development support, and property marketing — opportunity briefs through transaction timelines together.",
  intendedUse:
    "Commercial brokerage and CRE operators — not residential agent OS, not property management portfolio OS alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "CRE Business Positioning", role: "required" },
    { id: "cre_opportunity", title: "Opportunity Brief", role: "required" },
    { id: "cre_property", title: "Property Profile", role: "required" },
    { id: "cre_market", title: "Market Comparison", ...depthGuided },
    { id: "cre_acquisition", title: "Acquisition Workflow", ...depthGuided },
    { id: "cre_leasing", title: "Leasing Workflow", ...depthGuided },
    { id: "cre_dd", title: "Due Diligence", ...depthGuided },
    { id: "cre_timeline", title: "Transaction Timeline", ...depthGuided },
    { id: "cre_marketing", title: "Property Marketing", ...depthGuided },
    { id: "cre_portfolio", title: "Portfolio Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_cre",
      prompt:
        "Is this brokerage, leasing, acquisitions, dispositions, or a hybrid commercial practice?",
      lowerFrictionPrompt: "What kind of commercial real estate work is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_deal",
      prompt: "What deal or property is in focus right now?",
      lowerFrictionPrompt: "What's the current opportunity?",
      sectionId: "cre_opportunity",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next CRE move?",
      lowerFrictionPrompt: "What's the next small commercial RE step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    {
      id: "t_brief",
      title: "Write opportunity brief",
      sectionId: "cre_opportunity",
    },
    {
      id: "t_profile",
      title: "Complete property profile",
      sectionId: "cre_property",
    },
    {
      id: "t_dd",
      title: "Draft due-diligence checklist",
      sectionId: "cre_dd",
    },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "CRE positioning clear" },
    { id: "m_deal", title: "Opportunity framed" },
    {
      id: "m_ops",
      title: "Workflow and DD usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Distinct from residential real_estate_brokerage_agent",
    "Distinct from property_management landlord OS",
    "Due diligence before commitment pressure",
    "Drafts are not legal or appraisal authority",
  ],
  riskPrompts: [
    "What if timelines slip without a deal owner?",
    "What if DD findings have no calm escalation path?",
  ],
  researchPrompts: [
    "Compare simple CRE opportunity brief templates",
    "Find leasing workflow checklists for small brokerages",
  ],
  deliverables: [
    "Opportunity Brief",
    "Property Profile",
    "Market Comparison",
    "Acquisition Workflow",
    "Leasing Workflow",
    "Due-Diligence Checklist",
    "Transaction Timeline",
    "Portfolio Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "finance",
    "client-relationships",
    "project-management",
  ],
  boardReviewRecommendations: ["pipeline", "DD readiness", "timeline risk"],
  projectBridgeRecommendations: [
    "Bridge when acquisitions, marketing launches, or DD workstreams need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Commercial RE OS — distinct from residential brokerage and property_management",
    },
  ],
  completionCriteria: [
    "Positioning and opportunity framed",
    "Workflow/DD considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "commercial_real_estate",
  },
});

/** 281 — Property Development Blueprint */
export const BUSINESS_BLUEPRINT_PROPERTY_DEVELOPMENT = businessBlueprint({
  blueprintId: PROPERTY_DEVELOPMENT_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Property Development",
  description:
    "Support land acquisition, development planning, consultants, budgeting, scheduling, permitting review flags, construction coordination, sales, and closeout together.",
  intendedUse:
    "Property developers and development teams — not contractor construction OS alone, not CRE brokerage OS alone; drafts are not engineering/permit authority.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Development Positioning", role: "required" },
    { id: "pd_charter", title: "Development Charter", role: "required" },
    { id: "pd_feasibility", title: "Feasibility Review", role: "required" },
    { id: "pricing", title: "Budget Model", role: "required" },
    { id: "pd_milestones", title: "Milestone Roadmap", ...depthGuided },
    { id: "pd_consultants", title: "Consultant Tracker", ...depthGuided },
    { id: "pd_permits", title: "Permitting Review Flags", ...depthGuided },
    { id: "pd_construction", title: "Construction Coordination", ...depthGuided },
    { id: "pd_sales", title: "Sales and Closeout", ...depthGuided },
    { id: "pd_risk", title: "Risk Register", ...depthComplete },
    { id: "pd_dashboard", title: "Development Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_dev",
      prompt:
        "What are you developing — and where is the project in acquisition, planning, build, or sales?",
      lowerFrictionPrompt: "What kind of property development is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_feasibility",
      prompt: "What has to prove true for this development to proceed?",
      lowerFrictionPrompt: "What does feasibility depend on?",
      sectionId: "pd_feasibility",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["constraints", "services"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next development move?",
      lowerFrictionPrompt: "What's the next small development step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_charter", title: "Write development charter", sectionId: "pd_charter" },
    {
      id: "t_budget",
      title: "Sketch development budget model",
      sectionId: "pricing",
    },
    {
      id: "t_risk",
      title: "Start risk register",
      sectionId: "pd_risk",
    },
  ],
  suggestedMilestones: [
    { id: "m_charter", title: "Charter clear" },
    { id: "m_feasibility", title: "Feasibility framed" },
    {
      id: "m_ops",
      title: "Budget and milestones usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not contractor_construction OS alone — this owns development lifecycle",
    "Permitting drafts are not authority approvals",
    "Consultant ownership before schedule promises",
    "Risk register before capital commitment",
  ],
  riskPrompts: [
    "What if feasibility assumptions fail after capital is committed?",
    "What if consultants and permits have no single owner?",
  ],
  researchPrompts: [
    "Compare simple development charter templates",
    "Find milestone roadmap patterns for small developers",
  ],
  deliverables: [
    "Development Charter",
    "Feasibility Review",
    "Budget Model",
    "Milestone Roadmap",
    "Consultant Tracker",
    "Risk Register",
    "Development Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "project-management",
    "finance",
    "operations",
    "risk",
  ],
  boardReviewRecommendations: [
    "feasibility",
    "budget variance",
    "permit readiness",
  ],
  projectBridgeRecommendations: [
    "Bridge when phase builds, consultant coordination, or sales launches need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Development lifecycle OS — distinct from contractor_construction and CRE brokerage",
    },
  ],
  completionCriteria: [
    "Charter and feasibility framed",
    "Budget and milestones considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "property_development",
  },
});

/** 282 — Investor & Holding Company Blueprint */
export const BUSINESS_BLUEPRINT_INVESTOR_HOLDING_COMPANY = businessBlueprint({
  blueprintId: INVESTOR_HOLDING_COMPANY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Investor & Holding Company",
  description:
    "Help owners manage multiple businesses, investments, subsidiaries, and strategic portfolios — entity maps, capital allocation, governance, and portfolio KPIs together.",
  intendedUse:
    "Investors, holding companies, and multi-entity owners — not single-business OS, not franchise system OS, not multi-location ops alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Portfolio Positioning", role: "required" },
    { id: "ih_structure", title: "Portfolio Structure", role: "required" },
    { id: "ih_entities", title: "Entity Map", role: "required" },
    { id: "ih_pipeline", title: "Investment Pipeline", ...depthGuided },
    { id: "ih_capital", title: "Capital Allocation", role: "required" },
    { id: "ih_governance", title: "Governance Calendar", ...depthGuided },
    { id: "ih_board", title: "Board Review Packet", ...depthGuided },
    { id: "ih_isolation", title: "Cross-Entity Isolation", ...depthComplete },
    { id: "ih_performance", title: "Portfolio KPI Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_portfolio",
      prompt:
        "What entities and investments sit in this holding structure — and what stays outside?",
      lowerFrictionPrompt: "What does this holding company own?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_capital",
      prompt: "How do you decide where capital goes next across the portfolio?",
      lowerFrictionPrompt: "How do you allocate capital?",
      sectionId: "ih_capital",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["constraints", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next portfolio move?",
      lowerFrictionPrompt: "What's the next small holding-company step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    {
      id: "t_entities",
      title: "Draft entity map",
      sectionId: "ih_entities",
    },
    {
      id: "t_capital",
      title: "Sketch capital allocation plan",
      sectionId: "ih_capital",
    },
    {
      id: "t_gov",
      title: "Set governance calendar rhythm",
      sectionId: "ih_governance",
    },
  ],
  suggestedMilestones: [
    { id: "m_structure", title: "Portfolio structure clear" },
    { id: "m_entities", title: "Entity map framed" },
    {
      id: "m_ops",
      title: "Capital and governance usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Cross-entity isolation is mandatory",
    "Not franchise or multi_location ops OS",
    "Governance rhythm before capital promises",
    "Drafts are not legal/tax entity counsel",
  ],
  riskPrompts: [
    "What if capital moves without governance review?",
    "What if entities bleed context or decisions into each other?",
  ],
  researchPrompts: [
    "Compare simple holding-company entity map patterns",
    "Find light board review packet structures for small portfolios",
  ],
  deliverables: [
    "Portfolio Structure",
    "Entity Map",
    "Investment Pipeline",
    "Capital Allocation Plan",
    "Governance Calendar",
    "Board Review Packet",
    "Portfolio KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "finance",
    "operations",
    "systems",
    "project-management",
  ],
  boardReviewRecommendations: [
    "capital allocation",
    "entity isolation",
    "governance cadence",
  ],
  projectBridgeRecommendations: [
    "Bridge when entity restructure, acquisition diligence, or board prep needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Multi-entity portfolio OS — distinct from franchise and multi_location",
    },
  ],
  completionCriteria: [
    "Structure and entities framed",
    "Capital allocation considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "investor_holding_company",
  },
});

export const FINANCIAL_INVESTMENT_PROPERTY_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_INVESTMENT_WEALTH,
    BUSINESS_BLUEPRINT_COMMERCIAL_REAL_ESTATE,
    BUSINESS_BLUEPRINT_PROPERTY_DEVELOPMENT,
    BUSINESS_BLUEPRINT_INVESTOR_HOLDING_COMPANY,
  ];

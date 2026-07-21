/**
 * 253–256 — Regulated Professional Services Collection (definition data only).
 * Collection: collection.regulated_professional_services
 * Distinct from business.service, consulting, coaching, property_management.
 * Drafts are never professionally approved legal/tax/insurance/real-estate advice.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const REGULATED_PROFESSIONAL_SERVICES_COLLECTION_ID =
  "collection.regulated_professional_services" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID =
  "business.legal_services" as const;
export const ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID =
  "business.accounting_bookkeeping_tax" as const;
export const INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID =
  "business.insurance_agency" as const;
export const REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID =
  "business.real_estate_brokerage_agent" as const;

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
  collectionId: REGULATED_PROFESSIONAL_SERVICES_COLLECTION_ID,
  collectionOwner:
    "Business Intelligence / Regulated Professional Services Collection",
  notGenericServiceOnly: true,
  notConsultingOnly: true,
  notCoachingOnly: true,
  notPropertyManagementOnly: true,
  draftsNotProfessionallyApproved: true,
  regulatedAdviceGates: true,
} as const;

/** 253 — Legal Services Business Blueprint */
export const BUSINESS_BLUEPRINT_LEGAL_SERVICES = businessBlueprint({
  blueprintId: LEGAL_SERVICES_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Legal Services Business",
  description:
    "Organize law firm and legal-support operations — intake, conflicts, matters, billing, knowledge, referrals, and firm capacity without replacing professional judgment.",
  intendedUse:
    "Solo attorneys, small firms, legal consultants, and lawful legal-support businesses — not generic consulting/service OS; drafts are not attorney-approved.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Firm and Practice Positioning", role: "required" },
    { id: "legal_inquiry", title: "Inquiry and Qualification", role: "required" },
    { id: "legal_conflict", title: "Conflict Check", role: "required" },
    { id: "legal_engagement", title: "Engagement", ...depthGuided },
    { id: "legal_matter_plan", title: "Matter Planning", ...depthGuided },
    { id: "legal_matter_exec", title: "Matter Execution", ...depthGuided },
    { id: "legal_client_comms", title: "Client Communication", ...depthGuided },
    { id: "legal_billing", title: "Billing and Collections", role: "required" },
    { id: "legal_knowledge", title: "Knowledge and Precedent", ...depthGuided },
    { id: "legal_referrals", title: "Referral Network", ...depthGuided },
    { id: "legal_firm_ops", title: "Firm Operations", ...depthComplete },
    { id: "legal_performance", title: "Firm Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_practice",
      prompt: "What practice areas and matter types do you take — and what do you decline?",
      lowerFrictionPrompt: "What kind of legal practice is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_intake",
      prompt: "How do inquiries become qualified matters after conflict checks?",
      lowerFrictionPrompt: "How do you intake clients?",
      sectionId: "legal_inquiry",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next firm-ops move?",
      lowerFrictionPrompt: "What's the next small firm step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_scope", title: "Map practice areas and decline boundaries", sectionId: "purpose_vision" },
    { id: "t_conflict", title: "Draft conflict-check checklist", sectionId: "legal_conflict" },
    { id: "t_billing", title: "Sketch billing rhythm", sectionId: "legal_billing" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Practice scope clear" },
    { id: "m_conflict", title: "Conflict path framed" },
    {
      id: "m_ops",
      title: "Matter and billing usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Drafts are not attorney-approved legal documents",
    "Conflict checks are mandatory before engagement",
    "Do not fabricate citations or legal conclusions",
    "Privilege and privacy need calm ownership",
  ],
  riskPrompts: [
    "What if a matter starts before conflict clearance?",
    "What if billing lags until cash pressure hits?",
  ],
  researchPrompts: [
    "Compare simple matter intake patterns for small firms",
    "Find conflict-check workflows that stay thorough and calm",
  ],
  deliverables: [
    "Legal Business Snapshot",
    "Practice Area Map",
    "Conflict-Check Intake Record",
    "Engagement Letter Draft",
    "Matter Plan Template",
    "Billing and Collections Path",
    "Referral Boundary Guide",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "client-relationships", "finance", "risk"],
  boardReviewRecommendations: ["conflict readiness", "capacity", "collections"],
  projectBridgeRecommendations: [
    "Bridge when intake system build, template libraries, or migration needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Legal ops OS — distinct from consulting/service; never replaces licensed judgment",
    },
  ],
  completionCriteria: [
    "Practice scope and intake framed",
    "Conflict and billing considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "legal_services" },
});

/** 254 — Accounting / Bookkeeping / Tax Practice Blueprint */
export const BUSINESS_BLUEPRINT_ACCOUNTING_BOOKKEEPING_TAX = businessBlueprint({
  blueprintId: ACCOUNTING_BOOKKEEPING_TAX_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Accounting, Bookkeeping & Tax Practice",
  description:
    "Operate accounting, bookkeeping, payroll, and tax practices — onboarding, close workflows, QC, reporting, capacity, and records together.",
  intendedUse:
    "Accounting, bookkeeping, payroll, and tax practices — not generic consulting; drafts are not CPA-approved filings.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Practice Model", role: "required" },
    { id: "acct_qualify", title: "Client Qualification", role: "required" },
    { id: "acct_onboarding", title: "Client Onboarding", role: "required" },
    { id: "acct_monthly", title: "Monthly Workflow", role: "required" },
    { id: "acct_qc", title: "Review and QC", ...depthGuided },
    { id: "acct_reporting", title: "Financial Reporting", ...depthGuided },
    { id: "acct_tax", title: "Tax Workflow", ...depthGuided },
    { id: "acct_payroll", title: "Payroll", ...depthGuided },
    { id: "acct_comms", title: "Client Communication", ...depthGuided },
    { id: "pricing", title: "Pricing and Capacity", role: "required" },
    { id: "acct_records", title: "Records and Security", ...depthComplete },
    { id: "acct_performance", title: "Practice Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt: "Is this bookkeeping, full-service accounting, tax-focused, payroll, or a hybrid?",
      lowerFrictionPrompt: "What kind of practice is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_close",
      prompt: "What does a clean monthly close look like for your clients?",
      lowerFrictionPrompt: "How does monthly close work?",
      sectionId: "acct_monthly",
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
    { id: "t_onboard", title: "Draft client onboarding checklist", sectionId: "acct_onboarding" },
    { id: "t_close", title: "Map monthly close workflow", sectionId: "acct_monthly" },
    { id: "t_capacity", title: "Set capacity pricing basics", sectionId: "pricing" },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Practice model clear" },
    { id: "m_close", title: "Monthly workflow framed" },
    {
      id: "m_qc",
      title: "QC and records considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Drafts are not CPA-approved tax filings",
    "QC before client-facing numbers",
    "Privacy and records security are non-negotiable",
    "Capacity before new client promises",
  ],
  riskPrompts: [
    "What if deadline season outruns reviewer capacity?",
    "What if client data access has no clear owner?",
  ],
  researchPrompts: [
    "Compare simple monthly close checklists for small practices",
    "Find onboarding packs that reduce missing documents",
  ],
  deliverables: [
    "Practice Snapshot",
    "Client Onboarding Pack",
    "Monthly Close Workflow",
    "Review and QC Checklist",
    "Tax Workflow Path",
    "Pricing and Capacity Plan",
    "Records and Security Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "finance", "systems", "risk"],
  boardReviewRecommendations: ["close quality", "capacity", "deadline readiness"],
  projectBridgeRecommendations: [
    "Bridge when software migration, template libraries, or seasonal prep needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Accounting practice OS — distinct from consulting; never replaces licensed review",
    },
  ],
  completionCriteria: [
    "Practice model and close framed",
    "Capacity and QC considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "accounting_bookkeeping_tax",
  },
});

/** 255 — Insurance Agency Business Blueprint */
export const BUSINESS_BLUEPRINT_INSURANCE_AGENCY = businessBlueprint({
  blueprintId: INSURANCE_AGENCY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Insurance Agency Business",
  description:
    "Operate agency and producer workflows — prospecting, quoting, binding support, policy service, renewals, claims support, and carrier partners.",
  intendedUse:
    "Insurance agencies, brokers, and producers — does not bind coverage or replace underwriting; recommendations need licensed review.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Agency Positioning", role: "required" },
    { id: "ins_prospect", title: "Prospect Qualification", role: "required" },
    { id: "ins_discovery", title: "Needs Discovery", role: "required" },
    { id: "ins_quoting", title: "Submission and Quoting", ...depthGuided },
    { id: "ins_proposal", title: "Proposal", ...depthGuided },
    { id: "ins_binding", title: "Binding and Onboarding", ...depthGuided },
    { id: "ins_service", title: "Policy Service", ...depthGuided },
    { id: "ins_renewals", title: "Renewals", role: "required" },
    { id: "ins_claims", title: "Claims Support", ...depthGuided },
    { id: "ins_carriers", title: "Carriers and Partners", ...depthGuided },
    { id: "ins_compliance", title: "Compliance and Records", ...depthComplete },
    { id: "ins_performance", title: "Agency Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_lines",
      prompt: "Which lines do you write — personal, commercial, benefits, or specialty — and what is out of scope?",
      lowerFrictionPrompt: "What kind of agency is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_renewals",
      prompt: "How do renewals stay ahead of lapses without last-minute scramble?",
      lowerFrictionPrompt: "How do renewals work?",
      sectionId: "ins_renewals",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next agency move?",
      lowerFrictionPrompt: "What's the next small agency step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_lines", title: "Map lines and carrier partners", sectionId: "purpose_vision" },
    { id: "t_quote", title: "Sketch quote-to-bind path", sectionId: "ins_quoting" },
    { id: "t_renewal", title: "Build renewal calendar rules", sectionId: "ins_renewals" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Agency scope clear" },
    { id: "m_quote", title: "Quoting path framed" },
    {
      id: "m_renewals",
      title: "Renewals usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Does not bind coverage or replace underwriting",
    "Recommendations need licensed review",
    "Renewal rhythm before book growth",
    "Claims support is coordination — not adjusting authority",
  ],
  riskPrompts: [
    "What if renewals slip into lapse risk?",
    "What if E&O exposure has no calm documentation path?",
  ],
  researchPrompts: [
    "Compare simple renewal pipelines for small agencies",
    "Find needs-discovery guides that stay non-advice",
  ],
  deliverables: [
    "Agency Snapshot",
    "Prospect Qualification Guide",
    "Needs Discovery Checklist",
    "Quote-to-Bind Path",
    "Renewal Calendar Rules",
    "Claims Support Path",
    "Compliance and Records Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "finance",
    "risk",
  ],
  boardReviewRecommendations: ["retention", "renewal readiness", "carrier mix"],
  projectBridgeRecommendations: [
    "Bridge when AMS setup, carrier onboarding, or book migration needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Insurance agency OS — distinct from legal/real-estate/service; licensed review required",
    },
  ],
  completionCriteria: [
    "Lines and quoting framed",
    "Renewals considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "insurance_agency" },
});

/** 256 — Real Estate Brokerage & Agent Blueprint */
export const BUSINESS_BLUEPRINT_REAL_ESTATE_BROKERAGE_AGENT = businessBlueprint({
  blueprintId: REAL_ESTATE_BROKERAGE_AGENT_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Real Estate Brokerage & Agent",
  description:
    "Run agent, team, and brokerage operations — leads, listing and buyer journeys, offers, transaction coordination, and post-close care.",
  intendedUse:
    "Agents, teams, brokerages, and transaction coordinators — not property management OS; not legal, lending, title, or appraisal authority.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business Positioning", role: "required" },
    { id: "re_leads", title: "Lead Management", role: "required" },
    { id: "re_seller", title: "Seller Discovery", ...depthGuided },
    { id: "re_listing", title: "Listing Strategy", ...depthGuided },
    { id: "re_buyer", title: "Buyer Discovery", ...depthGuided },
    { id: "re_search", title: "Search and Evaluation", ...depthGuided },
    { id: "re_offer", title: "Offer and Negotiation", ...depthGuided },
    { id: "re_transaction", title: "Transaction Coordination", role: "required" },
    { id: "re_comms", title: "Client Communication", ...depthGuided },
    { id: "re_closing", title: "Closing and Post-Close", ...depthGuided },
    { id: "re_team_ops", title: "Team and Brokerage Ops", ...depthComplete },
    { id: "re_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt: "Are you primarily listing-side, buyer-side, team/brokerage, or a hybrid?",
      lowerFrictionPrompt: "What kind of real estate business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_tx",
      prompt: "How do transactions stay coordinated from offer acceptance to close?",
      lowerFrictionPrompt: "How do you run transactions?",
      sectionId: "re_transaction",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next brokerage move?",
      lowerFrictionPrompt: "What's the next small real-estate step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_leads", title: "Define lead intake path", sectionId: "re_leads" },
    { id: "t_tx", title: "Build transaction checklist", sectionId: "re_transaction" },
    { id: "t_post", title: "Sketch post-close care", sectionId: "re_closing" },
  ],
  suggestedMilestones: [
    { id: "m_position", title: "Business model clear" },
    { id: "m_tx", title: "Transaction path framed" },
    {
      id: "m_ops",
      title: "Listing/buyer journeys usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not property management OS",
    "Not legal, lending, title, or appraisal authority",
    "Fair-housing and licensed-review gates",
    "Transaction coordination before volume promises",
  ],
  riskPrompts: [
    "What if deadlines slip with no transaction owner?",
    "What if lead volume outruns follow-up capacity?",
  ],
  researchPrompts: [
    "Compare simple transaction coordinator checklists",
    "Find listing launch sequences that stay calm",
  ],
  deliverables: [
    "Brokerage Snapshot",
    "Lead Management Path",
    "Listing Strategy Brief",
    "Buyer Journey Map",
    "Transaction Coordination Checklist",
    "Closing and Post-Close Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "client-relationships",
    "marketing",
    "systems",
  ],
  boardReviewRecommendations: [
    "pipeline health",
    "transaction load",
    "post-close retention",
  ],
  projectBridgeRecommendations: [
    "Bridge when CRM setup, TC system build, or team onboarding needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Brokerage/agent OS — distinct from property_management and home_service",
    },
  ],
  completionCriteria: [
    "Positioning and leads framed",
    "Transaction path considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "real_estate_brokerage_agent",
  },
});

export const REGULATED_PROFESSIONAL_SERVICES_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_LEGAL_SERVICES,
    BUSINESS_BLUEPRINT_ACCOUNTING_BOOKKEEPING_TAX,
    BUSINESS_BLUEPRINT_INSURANCE_AGENCY,
    BUSINESS_BLUEPRINT_REAL_ESTATE_BROKERAGE_AGENT,
  ];

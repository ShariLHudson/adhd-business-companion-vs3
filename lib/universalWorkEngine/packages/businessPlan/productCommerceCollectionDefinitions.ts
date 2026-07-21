/**
 * 229–232 — Product & Commerce Collection Blueprints (definition data only).
 * Collection architecture: collection.product_commerce
 * Distinct from handmade Etsy store, brick-and-mortar retail, and membership community OS.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const PRODUCT_COMMERCE_COLLECTION_ID =
  "collection.product_commerce" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const ECOMMERCE_BUSINESS_BLUEPRINT_ID = "business.ecommerce" as const;
export const PRODUCT_BASED_BUSINESS_BLUEPRINT_ID =
  "business.product_based" as const;
export const WHOLESALE_BUSINESS_BLUEPRINT_ID = "business.wholesale" as const;
export const SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID =
  "business.subscription_commerce" as const;

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
  collectionId: PRODUCT_COMMERCE_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Product & Commerce Collection",
  notHandmadeEtsyOnly: true,
  notBrickAndMortarRetailOnly: true,
  notMembershipCommunityOnly: true,
} as const;

/** 229 — Ecommerce Business Blueprint */
export const BUSINESS_BLUEPRINT_ECOMMERCE = businessBlueprint({
  blueprintId: ECOMMERCE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Ecommerce Business",
  description:
    "Design, launch, operate, and grow a profitable online store — assortment, conversion, fulfillment, acquisition, retention, and analytics together.",
  intendedUse:
    "DTC and online retail founders who need a general ecommerce OS — not Etsy-only handmade ops, not brick-and-mortar store management alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Ecommerce Foundation", role: "required" },
    { id: "ecom_customer_journey", title: "Customer and Buying Journey", role: "required" },
    { id: "ecom_assortment", title: "Product and Assortment Strategy", role: "required" },
    { id: "pricing", title: "Pricing and Margin", role: "required" },
    { id: "ecom_storefront", title: "Storefront and Conversion", ...depthGuided },
    { id: "ecom_channels", title: "Channel Strategy", ...depthGuided },
    { id: "ecom_fulfillment", title: "Inventory and Fulfillment", ...depthGuided },
    { id: "ecom_service_returns", title: "Customer Service and Returns", ...depthGuided },
    { id: "ecom_acquisition", title: "Marketing and Acquisition", ...depthGuided },
    { id: "ecom_retention", title: "Retention and Lifetime Value", ...depthComplete },
    { id: "ecom_analytics", title: "Analytics and Optimization", ...depthComplete },
    { id: "ecom_operations_growth", title: "Operations and Growth", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_foundation",
      prompt:
        "What kind of ecommerce business are you building — DTC, marketplace-led, hybrid, or specialty online retail?",
      lowerFrictionPrompt: "What online store are you building?",
      lowEnergyPrompt: "What's one sentence about your online store?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "channels"],
      materialChangeNextStep: true,
    },
    {
      id: "q_customers",
      prompt: "Who buys — and what journey gets them from curiosity to checkout?",
      lowerFrictionPrompt: "Who are your online customers?",
      sectionId: "ecom_customer_journey",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "customers", "clients"],
      materialChangeNextStep: true,
    },
    {
      id: "q_assortment",
      prompt: "What belongs in the online assortment — and what stays out?",
      lowerFrictionPrompt: "What do you sell online?",
      sectionId: "ecom_assortment",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["products", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for the ecommerce business?",
      lowerFrictionPrompt: "What's the next small ecommerce step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Draft ecommerce positioning", sectionId: "purpose_vision" },
    { id: "t_journey", title: "Map buying journey", sectionId: "ecom_customer_journey" },
    { id: "t_margins", title: "Set margin floors", sectionId: "pricing" },
    {
      id: "t_storefront",
      title: "List storefront conversion fixes",
      sectionId: "ecom_storefront",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_foundation", title: "Foundation clear" },
    { id: "m_assortment", title: "Assortment framed" },
    {
      id: "m_fulfillment",
      title: "Fulfillment path named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not an Etsy-only handmade store plan",
    "Returns and service capacity",
    "Fulfillment before ad spend",
    "Channel roles so marketplaces do not own the brand by accident",
  ],
  riskPrompts: [
    "What if acquisition outruns fulfillment?",
    "What if margins ignore returns and shipping?",
    "What if one marketplace becomes the whole business?",
  ],
  researchPrompts: [
    "Compare DTC vs marketplace channel roles",
    "Find lightweight ecommerce KPI dashboards for small teams",
  ],
  deliverables: [
    "Ecommerce Business Snapshot",
    "Customer Journey Map",
    "Assortment Architecture",
    "Pricing Model",
    "Storefront Improvement Plan",
    "Channel Role Map",
    "Inventory and Fulfillment Workflow",
    "Marketing Plan",
    "KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "sales",
    "operations",
    "finance",
    "systems",
    "client-relationships",
  ],
  boardReviewRecommendations: [
    "channel concentration",
    "margin after shipping and returns",
    "fulfillment readiness",
  ],
  projectBridgeRecommendations: [
    "Bridge when storefront rebuild or launch campaign needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Product-based Work can feed ecommerce; subscription and wholesale stay separate OS Blueprints",
    },
  ],
  completionCriteria: [
    "Foundation and customers captured",
    "Assortment and pricing framed",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "ecommerce_business" },
});

/** 230 — Product-Based Business Blueprint */
export const BUSINESS_BLUEPRINT_PRODUCT_BASED = businessBlueprint({
  blueprintId: PRODUCT_BASED_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Product-Based Business",
  description:
    "Turn a product idea or line into a viable, repeatable business — validation, sourcing, costing, quality, packaging, launch, and lifecycle.",
  intendedUse:
    "Makers, inventors, CPG founders, and productized brands — not storefront ops alone and not wholesale account ops alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Product Opportunity", role: "required" },
    { id: "product_validation", title: "Validation", role: "required" },
    { id: "product_architecture", title: "Product Architecture", role: "required" },
    { id: "product_sourcing", title: "Sourcing and Production", ...depthGuided },
    { id: "pricing", title: "Costing and Pricing", role: "required" },
    { id: "product_quality", title: "Quality and Compliance", ...depthGuided },
    { id: "product_packaging", title: "Packaging and Brand Experience", ...depthGuided },
    { id: "product_channels", title: "Channel and Distribution", ...depthGuided },
    { id: "product_launch", title: "Launch", ...depthGuided },
    { id: "product_inventory_cash", title: "Inventory and Cash Flow", ...depthComplete },
    { id: "product_lifecycle", title: "Product Lifecycle", ...depthComplete },
    { id: "product_growth", title: "Growth and Expansion", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_opportunity",
      prompt: "What product opportunity are you building — and for whom?",
      lowerFrictionPrompt: "What product are you building?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "products"],
      materialChangeNextStep: true,
    },
    {
      id: "q_validation",
      prompt: "What evidence would tell you to go, revise, or stop?",
      lowerFrictionPrompt: "How will you validate?",
      sectionId: "product_validation",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["demand", "validation", "audience"],
      materialChangeNextStep: true,
    },
    {
      id: "q_production",
      prompt: "How will it be made — handmade, in-house, contract, POD, or private label?",
      lowerFrictionPrompt: "How will you make or source it?",
      sectionId: "product_sourcing",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["systems", "inventory", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next product move?",
      lowerFrictionPrompt: "What's the next small product step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_brief", title: "Write product opportunity brief", sectionId: "purpose_vision" },
    { id: "t_validate", title: "Draft validation plan", sectionId: "product_validation" },
    { id: "t_cost", title: "Build unit cost sheet", sectionId: "pricing" },
    {
      id: "t_source",
      title: "Choose production model",
      sectionId: "product_sourcing",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_opportunity", title: "Opportunity clear" },
    { id: "m_validation", title: "Validation path named" },
    {
      id: "m_costing",
      title: "Costing usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "No unsupported safety or regulatory claims",
    "Unit economics before scale",
    "Quality standards need owners",
    "Packaging is part of the product",
  ],
  riskPrompts: [
    "What if validation is only compliments?",
    "What if one supplier holds the whole line?",
    "What if cash is trapped in inventory before proof of demand?",
  ],
  researchPrompts: [
    "Compare production models for small product brands",
    "Find go/revise/stop validation patterns",
  ],
  deliverables: [
    "Product Opportunity Brief",
    "Validation Plan",
    "Product Brief",
    "Sourcing Strategy",
    "Cost and Pricing Architecture",
    "Quality Standard",
    "Packaging Brief",
    "Channel Strategy",
    "Launch Plan",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "strategy",
    "operations",
    "finance",
    "marketing",
    "systems",
    "project-management",
  ],
  boardReviewRecommendations: [
    "validation honesty",
    "unit economics",
    "supplier concentration",
  ],
  projectBridgeRecommendations: [
    "Bridge when sampling, tooling, or launch tasks need Project Work",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Natural handoff into ecommerce, wholesale, or subscription commerce without merging OS Blueprints",
    },
  ],
  completionCriteria: [
    "Opportunity and validation framed",
    "Architecture and costing considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "product_based_business" },
});

/** 231 — Wholesale & Retail Partnership Blueprint */
export const BUSINESS_BLUEPRINT_WHOLESALE = businessBlueprint({
  blueprintId: WHOLESALE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Wholesale & Retail Partnership",
  description:
    "Sell through retailers, distributors, and corporate buyers while protecting margin, service, inventory, and brand.",
  intendedUse:
    "Brands selling into stores and accounts — not operating a retail store floor, and not DTC storefront ops alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Wholesale Readiness", role: "required" },
    { id: "wholesale_accounts", title: "Buyer and Account Segments", role: "required" },
    { id: "pricing", title: "Wholesale Pricing and Terms", role: "required" },
    { id: "wholesale_line_sheet", title: "Line Sheet and Sales Materials", role: "required" },
    { id: "wholesale_acquisition", title: "Account Acquisition", ...depthGuided },
    { id: "wholesale_order_ops", title: "Order and Fulfillment Operations", ...depthGuided },
    { id: "wholesale_retailer_support", title: "Retailer Support", ...depthGuided },
    { id: "wholesale_account_mgmt", title: "Account Management", ...depthGuided },
    { id: "wholesale_reps", title: "Distributor and Representative Management", ...depthComplete },
    { id: "wholesale_channel_risk", title: "Risk and Channel Conflict", ...depthComplete },
    { id: "wholesale_analytics", title: "Wholesale Analytics", ...depthComplete },
    { id: "wholesale_growth", title: "Wholesale Growth", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_readiness",
      prompt: "Are you ready for wholesale — capacity, margins, packaging, and service included?",
      lowerFrictionPrompt: "What's your wholesale readiness gap?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "constraints", "stage"],
      materialChangeNextStep: true,
    },
    {
      id: "q_accounts",
      prompt: "Which account types matter most — boutiques, chains, distributors, or corporate?",
      lowerFrictionPrompt: "Who are your wholesale buyers?",
      sectionId: "wholesale_accounts",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "customers", "channels"],
      materialChangeNextStep: true,
    },
    {
      id: "q_terms",
      prompt: "What pricing, MOQs, and terms protect margin without scaring good buyers?",
      lowerFrictionPrompt: "What wholesale terms do you need?",
      sectionId: "pricing",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["pricing", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next wholesale move?",
      lowerFrictionPrompt: "What's the next small wholesale step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_ready", title: "Complete wholesale readiness check", sectionId: "purpose_vision" },
    { id: "t_terms", title: "Draft wholesale price list and terms", sectionId: "pricing" },
    { id: "t_line", title: "Build line sheet outline", sectionId: "wholesale_line_sheet" },
    {
      id: "t_pipeline",
      title: "List target accounts",
      sectionId: "wholesale_acquisition",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_ready", title: "Readiness assessed" },
    { id: "m_terms", title: "Terms usable" },
    {
      id: "m_line",
      title: "Line sheet usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not the same as running a retail store",
    "MAP and channel conflict need explicit rules",
    "Retailer support after the first order",
    "Rep agreements need simple checklists",
  ],
  riskPrompts: [
    "What if one big account owns your cash flow?",
    "What if wholesale discounts train DTC customers to wait?",
    "What if order ops cannot keep promise dates?",
  ],
  researchPrompts: [
    "Compare wholesale terms for small brands",
    "Find line-sheet structures buyers actually use",
  ],
  deliverables: [
    "Wholesale Readiness Assessment",
    "Account Segment Map",
    "Wholesale Price List and Terms",
    "Line Sheet",
    "Sales Plan",
    "Order Workflow",
    "Retail Partner Toolkit",
    "Wholesale KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "sales",
    "operations",
    "finance",
    "client-relationships",
    "strategy",
  ],
  boardReviewRecommendations: [
    "readiness honesty",
    "terms and MOQs",
    "channel conflict",
  ],
  projectBridgeRecommendations: [
    "Bridge when trade-show prep or account onboarding needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Supplier-side wholesale — distinct from retail.inventory_purchasing_vendor buyer-side stock",
    },
  ],
  completionCriteria: [
    "Readiness and accounts framed",
    "Terms and line sheet considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "wholesale_business" },
});

/** 232 — Subscription Commerce Blueprint */
export const BUSINESS_BLUEPRINT_SUBSCRIPTION_COMMERCE = businessBlueprint({
  blueprintId: SUBSCRIPTION_COMMERCE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Subscription Commerce",
  description:
    "Design, launch, operate, and retain a physical or digital subscription with healthy economics, fulfillment rhythm, and ethical cancellation.",
  intendedUse:
    "Subscription boxes, replenishment, curated, and hybrid product subscriptions — not community membership OS alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Subscription Purpose", role: "required" },
    { id: "sub_model", title: "Subscription Model", role: "required" },
    { id: "sub_offer_tiers", title: "Offer and Tier Design", role: "required" },
    { id: "pricing", title: "Unit Economics", role: "required" },
    { id: "sub_demand_inventory", title: "Demand and Inventory Planning", ...depthGuided },
    { id: "sub_acquisition", title: "Customer Acquisition", ...depthGuided },
    { id: "sub_onboarding", title: "Onboarding and Activation", ...depthGuided },
    { id: "sub_fulfillment", title: "Recurring Fulfillment", ...depthGuided },
    { id: "sub_retention", title: "Retention and Churn", ...depthGuided },
    { id: "sub_experience", title: "Customer Experience", ...depthComplete },
    { id: "sub_analytics", title: "Subscription Analytics", ...depthComplete },
    { id: "sub_growth", title: "Growth and Resilience", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_purpose",
      prompt:
        "What recurring value are subscribers really paying for — replenishment, curation, access, or surprise?",
      lowerFrictionPrompt: "What is the subscription for?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_model",
      prompt: "Which model fits — box, replenish, digital, hybrid, or seasonal series?",
      lowerFrictionPrompt: "What subscription model?",
      sectionId: "sub_model",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["model", "membership_model", "delivery"],
      materialChangeNextStep: true,
    },
    {
      id: "q_economics",
      prompt: "Do unit economics work after shipping, product cost, and expected churn?",
      lowerFrictionPrompt: "Do the subscription numbers work?",
      sectionId: "pricing",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["pricing", "constraints"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next subscription move?",
      lowerFrictionPrompt: "What's the next small subscription step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_purpose", title: "Write subscription purpose", sectionId: "purpose_vision" },
    { id: "t_model", title: "Choose subscription model", sectionId: "sub_model" },
    { id: "t_econ", title: "Draft unit economics", sectionId: "pricing" },
    {
      id: "t_cancel",
      title: "Design ethical cancel and pause path",
      sectionId: "sub_retention",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Model chosen" },
    { id: "m_econ", title: "Economics usable" },
    {
      id: "m_fulfill",
      title: "Recurring fulfillment framed",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Distinct from community membership Blueprint",
    "Accessible cancel is non-negotiable",
    "Do not scale before fulfillment is stable",
    "Churn analysis before more acquisition spend",
  ],
  riskPrompts: [
    "What if retention depends on dark patterns?",
    "What if inventory assumes perfect renewals?",
    "What if first delivery delight never becomes habit?",
  ],
  researchPrompts: [
    "Compare replenishment vs curation economics",
    "Find ethical pause/skip/cancel patterns",
  ],
  deliverables: [
    "Subscription Snapshot",
    "Model Decision",
    "Offer Suite",
    "Economics Model",
    "Purchasing Calendar",
    "Acquisition Plan",
    "Onboarding Journey",
    "Recurring Fulfillment Workflow",
    "Retention Journey",
    "KPI Dashboard",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "operations",
    "finance",
    "client-relationships",
    "systems",
  ],
  boardReviewRecommendations: [
    "unit economics honesty",
    "ethical cancel",
    "fulfillment cadence",
  ],
  projectBridgeRecommendations: [
    "Bridge when first-box production or platform setup needs Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Commerce recurring product OS — distinct from business.membership community OS",
    },
  ],
  completionCriteria: [
    "Purpose and model captured",
    "Economics considered",
    "Fulfillment or retention path named",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "subscription_commerce",
    distinctFromBlueprintId: "business.membership",
  },
});

export const PRODUCT_COMMERCE_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_ECOMMERCE,
    BUSINESS_BLUEPRINT_PRODUCT_BASED,
    BUSINESS_BLUEPRINT_WHOLESALE,
    BUSINESS_BLUEPRINT_SUBSCRIPTION_COMMERCE,
  ];

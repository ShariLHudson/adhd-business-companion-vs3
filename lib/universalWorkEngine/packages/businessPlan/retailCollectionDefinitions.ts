/**
 * 225–228 — Retail Collection Blueprints (definition data only).
 * Collection architecture: collection.retail
 * Brick-and-mortar retail OS — distinct from handmade craft-show / inventory-pricing.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const RETAIL_COLLECTION_ID = "collection.retail" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const RETAIL_STORE_BUSINESS_BLUEPRINT_ID =
  "business.retail_store" as const;
export const RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID =
  "retail.store_management" as const;
export const RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID =
  "retail.inventory_purchasing_vendor" as const;
export const RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID =
  "retail.merchandising_promotions_cx" as const;

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
  collectionId: RETAIL_COLLECTION_ID,
  collectionOwner: "Business Intelligence / Retail Collection",
  notHandmadeInventoryPricing: true,
  notCraftShowBooth: true,
} as const;

/** 225 — Retail Store Business Blueprint */
export const BUSINESS_BLUEPRINT_RETAIL_STORE = businessBlueprint({
  blueprintId: RETAIL_STORE_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Retail Store Business",
  description:
    "Build, launch, operate, and grow a profitable brick-and-mortar retail business — assortment, margins, layout, staffing, and store economics together.",
  intendedUse:
    "Retail founders and owners who need a full store business OS — not craft-show booth ops, handmade marketplace pricing, or day-to-day shift runbooks alone.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Business Concept and Positioning", role: "required" },
    { id: "retail_customers", title: "Target Customers and Market", role: "required" },
    { id: "retail_assortment", title: "Product Assortment Strategy", role: "required" },
    { id: "pricing", title: "Pricing and Margin Model", role: "required" },
    { id: "retail_layout_flow", title: "Store Layout and Customer Flow", ...depthGuided },
    { id: "retail_marketing", title: "Marketing and Promotions", ...depthGuided },
    { id: "retail_sales_ops", title: "Sales Operations", ...depthGuided },
    { id: "retail_staffing", title: "Staffing and Culture", ...depthGuided },
    { id: "profitability", title: "Financial Management", role: "required" },
    { id: "retail_loss_prevention", title: "Risk and Loss Prevention", ...depthComplete },
    { id: "retail_growth", title: "Growth Roadmap", ...depthComplete },
    { id: "retail_kpi_dashboard", title: "KPI Dashboard", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_concept",
      prompt:
        "What kind of retail store are you building — and what makes it worth a trip?",
      lowerFrictionPrompt: "What store are you building?",
      lowEnergyPrompt: "What's one sentence about your retail concept?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_customers",
      prompt: "Who shops with you — and what are they trying to get done?",
      lowerFrictionPrompt: "Who are your customers?",
      sectionId: "retail_customers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["audience", "customers", "clients"],
      materialChangeNextStep: true,
    },
    {
      id: "q_assortment",
      prompt: "What belongs in the assortment — and what stays out?",
      lowerFrictionPrompt: "What do you sell?",
      sectionId: "retail_assortment",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["products", "offers", "services"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next move for the store business?",
      lowerFrictionPrompt: "What's the next small step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_position", title: "Draft store positioning", sectionId: "purpose_vision" },
    { id: "t_assortment", title: "Sketch assortment boundaries", sectionId: "retail_assortment" },
    { id: "t_margins", title: "Set margin floors", sectionId: "pricing" },
    {
      id: "t_layout",
      title: "Map customer flow",
      sectionId: "retail_layout_flow",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_concept", title: "Concept clear" },
    { id: "m_assortment", title: "Assortment framed" },
    {
      id: "m_economics",
      title: "Margin model usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not a craft-show booth plan",
    "Not handmade unit-cost pricing alone",
    "Loss prevention and shrink",
    "Staffing capacity before peak seasons",
    "Layout that supports both browse and checkout",
  ],
  riskPrompts: [
    "What if assortment expands faster than cash and space?",
    "What if margins look fine until labor and shrink land?",
    "What if the store depends on one supplier or one season?",
  ],
  researchPrompts: [
    "Compare retail margin structures by category",
    "Find store layout patterns for browse-and-buy flow",
    "Review loss-prevention baselines for small retail",
  ],
  deliverables: [
    "Retail Business Snapshot",
    "Assortment Plan",
    "Financial Model",
    "Launch Roadmap",
    "Operating Calendar",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "strategy",
    "finance",
    "marketing",
    "sales",
    "operations",
    "leadership",
    "systems",
  ],
  boardReviewRecommendations: [
    "positioning",
    "assortment boundaries",
    "margin floors",
    "staffing load",
  ],
  projectBridgeRecommendations: [
    "Bridge when launch or remodel needs Project tasks",
    "Keep Create as source of truth for assortment and financial model",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Management, inventory, and merchandising Blueprints advance store Work without duplicating business SoT",
    },
  ],
  completionCriteria: [
    "Concept and customers captured",
    "Assortment framed",
    "Pricing and margins considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "retail_store_business" },
});

/** 226 — Retail Store Management Blueprint */
export const BUSINESS_BLUEPRINT_RETAIL_STORE_MANAGEMENT = businessBlueprint({
  blueprintId: RETAIL_STORE_MANAGEMENT_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Retail Store Management",
  description:
    "Standardize daily store operations — opening, closing, cash, scheduling, service, incidents, and reviews.",
  intendedUse:
    "Store managers and owners who need a calm operations runbook — not the full retail business OS or buying/vendor system.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Operations Purpose", role: "required" },
    { id: "retail_opening", title: "Opening Procedures", role: "required" },
    { id: "retail_closing", title: "Closing Procedures", role: "required" },
    { id: "retail_cash_handling", title: "Cash Handling", role: "required" },
    { id: "retail_scheduling", title: "Staff Scheduling", ...depthGuided },
    { id: "retail_customer_service", title: "Customer Service Standards", ...depthGuided },
    { id: "retail_visual_standards", title: "Visual Standards", ...depthGuided },
    { id: "retail_daily_tasks", title: "Daily Task Management", role: "required" },
    { id: "retail_incidents", title: "Incident Handling", ...depthComplete },
    { id: "retail_safety", title: "Safety", ...depthComplete },
    { id: "retail_ops_reviews", title: "Daily and Weekly Reviews", ...depthGuided },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_ops_focus",
      prompt: "Which part of daily store ops needs the most calm standardization right now?",
      lowerFrictionPrompt: "What ops need tightening?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "process", "workflow"],
      materialChangeNextStep: true,
    },
    {
      id: "q_roles",
      prompt: "Who opens, who closes, and who owns cash and floor coverage?",
      lowerFrictionPrompt: "Who runs each shift?",
      sectionId: "retail_scheduling",
      requiredInModes: ["guided_build", "complete_planning"],
      knownContextKeys: ["roles", "owners", "handoffs"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next ops move?",
      lowerFrictionPrompt: "What's the next small ops step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_open", title: "Write opening checklist", sectionId: "retail_opening" },
    { id: "t_close", title: "Write closing checklist", sectionId: "retail_closing" },
    { id: "t_cash", title: "Document cash handling", sectionId: "retail_cash_handling" },
    {
      id: "t_review",
      title: "Draft weekly manager review",
      sectionId: "retail_ops_reviews",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_open_close", title: "Open/close usable" },
    { id: "m_cash", title: "Cash handling clear" },
    {
      id: "m_review",
      title: "Review rhythm named",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Shift handoff is not optional",
    "Visual standards drift without daily ownership",
    "Incident notes protect people and inventory",
    "Safety before speed",
  ],
  riskPrompts: [
    "What if only one person knows how to close?",
    "What if cash variance has no calm recovery path?",
    "What if incidents stay oral and disappear?",
  ],
  researchPrompts: [
    "Compare retail opening/closing checklist structures",
    "Find lightweight manager review cadences",
  ],
  deliverables: [
    "Store Operations Manual",
    "Daily Checklist",
    "Weekly Manager Review",
    "Shift Handoff Guide",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "operations",
    "systems",
    "leadership",
    "client-relationships",
  ],
  boardReviewRecommendations: ["open/close reliability", "cash control", "scheduling load"],
  projectBridgeRecommendations: [
    "Bridge when training or remodel tasks need Project Work",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Advances store operations Work under the retail business SoT",
    },
  ],
  completionCriteria: [
    "Opening and closing framed",
    "Cash handling named",
    "Daily tasks clear",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "retail_store_management" },
});

/** 227 — Inventory, Purchasing & Vendor Management Blueprint */
export const BUSINESS_BLUEPRINT_RETAIL_INVENTORY_PURCHASING_VENDOR =
  businessBlueprint({
    blueprintId: RETAIL_INVENTORY_PURCHASING_VENDOR_BLUEPRINT_ID,
    version: "1.0.0",
    title: "Inventory, Purchasing & Vendor Management",
    description:
      "Optimize retail inventory investment and supplier relationships — forecasting, purchasing, receiving, reorder, shrink, and vendor scorecards.",
    intendedUse:
      "Retail buyers and owners managing stock and vendors — not handmade COGS/unit pricing (`business.inventory_pricing`).",
    complexity: "moderate",
    sections: [
      { id: "purpose_vision", title: "Inventory Purpose", role: "required" },
      { id: "retail_demand_forecast", title: "Demand Forecasting", role: "required" },
      { id: "retail_purchasing_workflow", title: "Purchasing Workflow", role: "required" },
      { id: "retail_vendor_selection", title: "Vendor Selection", ...depthGuided },
      { id: "retail_receiving", title: "Receiving", ...depthGuided },
      { id: "retail_inventory_control", title: "Inventory Control", role: "required" },
      { id: "retail_reorder_points", title: "Reorder Points", ...depthGuided },
      { id: "retail_markdown_strategy", title: "Overstock and Markdown Strategy", ...depthGuided },
      { id: "retail_shrink", title: "Shrink Management", ...depthComplete },
      { id: "retail_returns", title: "Returns", ...depthComplete },
      { id: "retail_vendor_scorecards", title: "Supplier Scorecards", ...depthComplete },
      { id: "next_actions", title: "Next Actions", role: "required" },
      SHARED_HIDDEN,
    ],
    adaptiveQuestions: [
      {
        id: "q_inventory_goal",
        prompt:
          "What inventory problem matters most — stockouts, overstock, cash tied up, or unreliable vendors?",
        lowerFrictionPrompt: "What's the inventory pain?",
        sectionId: "purpose_vision",
        requiredInModes: ["quick_start", "guided_build", "complete_planning"],
        knownContextKeys: ["purpose", "inventory", "constraints"],
        materialChangeNextStep: true,
      },
      {
        id: "q_vendors",
        prompt: "Which vendors matter most — and how do you decide who stays?",
        lowerFrictionPrompt: "Who are your key vendors?",
        sectionId: "retail_vendor_selection",
        requiredInModes: ["guided_build", "complete_planning"],
        knownContextKeys: ["channels", "offers", "products"],
        materialChangeNextStep: true,
      },
      {
        id: "q_next",
        prompt: "What is the single next purchasing or stock move?",
        lowerFrictionPrompt: "What's the next small inventory step?",
        sectionId: "next_actions",
        requiredInModes: ["quick_start", "guided_build", "complete_planning"],
        knownContextKeys: ["next_action", "next_step"],
        materialChangeNextStep: true,
      },
    ],
    suggestedTasks: [
      {
        id: "t_policy",
        title: "Draft inventory policy",
        sectionId: "retail_inventory_control",
      },
      {
        id: "t_calendar",
        title: "Sketch purchasing calendar",
        sectionId: "retail_purchasing_workflow",
      },
      {
        id: "t_reorder",
        title: "Set reorder points for top SKUs",
        sectionId: "retail_reorder_points",
        depthModes: ["guided_build", "complete_planning"],
      },
    ],
    suggestedMilestones: [
      { id: "m_policy", title: "Inventory policy named" },
      { id: "m_purchase", title: "Purchasing workflow clear" },
      {
        id: "m_vendors",
        title: "Vendor criteria usable",
        depthModes: ["guided_build", "complete_planning"],
      },
    ],
    commonlyForgottenItems: [
      "Distinct from handmade inventory & pricing",
      "Receiving accuracy before beautiful shelves",
      "Markdown is a plan, not a surprise",
      "Vendor scorecards need simple criteria",
    ],
    riskPrompts: [
      "What if cash is trapped in slow movers?",
      "What if one late vendor breaks peak season?",
      "What if shrink has no owner?",
    ],
    researchPrompts: [
      "Compare retail reorder-point methods for small stores",
      "Find simple vendor scorecard templates",
    ],
    deliverables: [
      "Inventory Policy",
      "Purchasing Calendar",
      "Vendor Scorecards",
      "Stock Dashboard",
      "Next actions list",
    ],
    chamberRoutingRecommendations: [
      "operations",
      "finance",
      "systems",
      "project-management",
    ],
    boardReviewRecommendations: [
      "cash in inventory",
      "vendor concentration",
      "reorder reliability",
    ],
    projectBridgeRecommendations: [
      "Bridge when receiving systems or stock counts need Project tasks",
    ],
    cartographyRelationshipRecommendations: [
      {
        relationship: "supports",
        note: "Retail stock/vendor Work — never a substitute for business.inventory_pricing handmade COGS",
      },
    ],
    completionCriteria: [
      "Inventory purpose captured",
      "Purchasing workflow framed",
      "Control approach named",
      "Next actions clear",
    ],
    certificationRules: [...CERT_RULES],
    domainExtensions: {
      ...COLLECTION_META,
      deliveryKind: "retail_inventory_purchasing_vendor",
      distinctFromBlueprintId: "business.inventory_pricing",
    },
  });

/** 228 — Merchandising, Promotions & Customer Experience Blueprint */
export const BUSINESS_BLUEPRINT_RETAIL_MERCHANDISING_PROMOTIONS_CX =
  businessBlueprint({
    blueprintId: RETAIL_MERCHANDISING_PROMOTIONS_CX_BLUEPRINT_ID,
    version: "1.0.0",
    title: "Merchandising, Promotions & Customer Experience",
    description:
      "Increase sales through visual merchandising, promotions, loyalty, and a memorable in-store customer journey.",
    intendedUse:
      "Retail teams shaping sell-through and experience — not full store P&L (225), shift checklists (226), or purchasing (227).",
    complexity: "moderate",
    sections: [
      { id: "purpose_vision", title: "Experience Purpose", role: "required" },
      { id: "retail_visual_merch", title: "Visual Merchandising", role: "required" },
      { id: "retail_seasonal_planning", title: "Seasonal Planning", ...depthGuided },
      { id: "retail_endcaps_displays", title: "Endcaps and Displays", ...depthGuided },
      { id: "retail_promotions", title: "Promotions", role: "required" },
      { id: "retail_loyalty", title: "Loyalty", ...depthGuided },
      { id: "retail_customer_journey", title: "Customer Journey", role: "required" },
      { id: "retail_store_events", title: "In-Store Events", ...depthComplete },
      { id: "retail_upsell_cross", title: "Upselling and Cross-Selling", ...depthGuided },
      { id: "retail_atmosphere", title: "Store Atmosphere", ...depthComplete },
      { id: "retail_experience_measurement", title: "Performance Measurement", ...depthComplete },
      { id: "next_actions", title: "Next Actions", role: "required" },
      SHARED_HIDDEN,
    ],
    adaptiveQuestions: [
      {
        id: "q_experience",
        prompt:
          "What should customers feel and find easily when they walk in — and what should promotions protect?",
        lowerFrictionPrompt: "What experience are you shaping?",
        sectionId: "purpose_vision",
        requiredInModes: ["quick_start", "guided_build", "complete_planning"],
        knownContextKeys: ["purpose", "vision", "audience"],
        materialChangeNextStep: true,
      },
      {
        id: "q_promo",
        prompt: "Which promotions or displays need a calendar first?",
        lowerFrictionPrompt: "What promo needs planning?",
        sectionId: "retail_promotions",
        requiredInModes: ["guided_build", "complete_planning"],
        knownContextKeys: ["offers", "channels", "calendar"],
        materialChangeNextStep: true,
      },
      {
        id: "q_next",
        prompt: "What is the single next merchandising or experience move?",
        lowerFrictionPrompt: "What's the next small merchandising step?",
        sectionId: "next_actions",
        requiredInModes: ["quick_start", "guided_build", "complete_planning"],
        knownContextKeys: ["next_action", "next_step"],
        materialChangeNextStep: true,
      },
    ],
    suggestedTasks: [
      {
        id: "t_merch_cal",
        title: "Draft merchandising calendar",
        sectionId: "retail_seasonal_planning",
      },
      {
        id: "t_promo",
        title: "Outline one promotion plan",
        sectionId: "retail_promotions",
      },
      {
        id: "t_journey",
        title: "Map the customer journey",
        sectionId: "retail_customer_journey",
      },
    ],
    suggestedMilestones: [
      { id: "m_visual", title: "Visual standards named" },
      { id: "m_promo", title: "Promotion plan usable" },
      {
        id: "m_journey",
        title: "Journey map clear",
        depthModes: ["guided_build", "complete_planning"],
      },
    ],
    commonlyForgottenItems: [
      "In-store events are not craft-show Event Blueprints",
      "Seasonal merchandising is not holiday product planner for makers",
      "Promotions need margin protection",
      "Atmosphere without measurement drifts",
    ],
    riskPrompts: [
      "What if promotions train customers to wait for discounts?",
      "What if displays look beautiful but block flow?",
      "What if loyalty adds complexity without return visits?",
    ],
    researchPrompts: [
      "Compare small-retail visual merchandising calendars",
      "Find loyalty patterns that stay simple",
    ],
    deliverables: [
      "Merchandising Calendar",
      "Promotion Plan",
      "Customer Journey Map",
      "Experience Scorecard",
      "Next actions list",
    ],
    chamberRoutingRecommendations: [
      "marketing",
      "sales",
      "client-relationships",
      "operations",
      "creative",
    ],
    boardReviewRecommendations: [
      "promo margin protection",
      "journey friction",
      "seasonal load",
    ],
    projectBridgeRecommendations: [
      "Bridge when a promo campaign or store event needs Project tasks",
    ],
    cartographyRelationshipRecommendations: [
      {
        relationship: "supports",
        note: "Store experiential Work — distinct from Event craft-show and handmade holiday planner",
      },
    ],
    completionCriteria: [
      "Experience purpose captured",
      "Merchandising and promotions framed",
      "Customer journey named",
      "Next actions clear",
    ],
    certificationRules: [...CERT_RULES],
    domainExtensions: {
      ...COLLECTION_META,
      deliveryKind: "retail_merchandising_promotions_cx",
    },
  });

export const RETAIL_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] = [
  BUSINESS_BLUEPRINT_RETAIL_STORE,
  BUSINESS_BLUEPRINT_RETAIL_STORE_MANAGEMENT,
  BUSINESS_BLUEPRINT_RETAIL_INVENTORY_PURCHASING_VENDOR,
  BUSINESS_BLUEPRINT_RETAIL_MERCHANDISING_PROMOTIONS_CX,
];

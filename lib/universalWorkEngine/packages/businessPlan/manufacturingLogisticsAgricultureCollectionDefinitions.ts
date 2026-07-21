/**
 * 257–260 — Manufacturing, Logistics & Agriculture Collection (definition data only).
 * Collection: collection.manufacturing_logistics_agriculture
 * Distinct from retail, ecommerce, product_commerce wholesale partnership, home_service, hospitality.
 * Shared ops foundations: SKU, cost, supplier, PO, inventory, work order, quality, dispatch, traceability, KPI.
 * Drafts are not compliance/engineering/safety approvals.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

export const MANUFACTURING_LOGISTICS_AGRICULTURE_COLLECTION_ID =
  "collection.manufacturing_logistics_agriculture" as const;

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID =
  "business.small_manufacturing" as const;
export const WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID =
  "business.wholesale_distribution" as const;
export const LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID =
  "business.logistics_transportation" as const;
export const AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID =
  "business.agriculture_farm_rural" as const;

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
  collectionId: MANUFACTURING_LOGISTICS_AGRICULTURE_COLLECTION_ID,
  collectionOwner:
    "Business Intelligence / Manufacturing Logistics Agriculture Collection",
  notRetailOnly: true,
  notEcommerceOnly: true,
  notProductCommerceWholesaleOnly: true,
  notHomeServiceOnly: true,
  notHospitalityOnly: true,
  sharedOpsFoundations: true,
  draftsNotComplianceApproved: true,
} as const;

/** 257 — Small Manufacturing Business Blueprint */
export const BUSINESS_BLUEPRINT_SMALL_MANUFACTURING = businessBlueprint({
  blueprintId: SMALL_MANUFACTURING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Small Manufacturing Business",
  description:
    "Design and run small manufacturing — product definition, BOM, costing, suppliers, work orders, quality, inventory, maintenance, and fulfillment together.",
  intendedUse:
    "Small manufacturers, custom/contract makers, light industrial and assembly — not retail/ecommerce sell-side OS; not engineering or regulated compliance authority.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Manufacturing Business Profile", role: "required" },
    { id: "mfg_product", title: "Product Definition", role: "required" },
    { id: "mfg_bom", title: "BOM and Routing", role: "required" },
    { id: "pricing", title: "Costing and Pricing", role: "required" },
    { id: "mfg_suppliers", title: "Suppliers", ...depthGuided },
    { id: "mfg_planning", title: "Demand and Production Planning", ...depthGuided },
    { id: "mfg_work_orders", title: "Work Orders and Shop Floor", role: "required" },
    { id: "mfg_quality", title: "Quality", ...depthGuided },
    { id: "mfg_inventory", title: "Inventory and Traceability", ...depthGuided },
    { id: "mfg_maintenance", title: "Maintenance", ...depthGuided },
    { id: "mfg_safety", title: "Safety and Compliance Flags", ...depthComplete },
    { id: "mfg_fulfillment", title: "Fulfillment", ...depthGuided },
    { id: "mfg_people", title: "People and Training", ...depthComplete },
    { id: "mfg_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_products",
      prompt: "What do you make — and what production model do you use (make-to-stock, make-to-order, custom)?",
      lowerFrictionPrompt: "What do you manufacture?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_bom",
      prompt: "Can you name the bill of materials and routing for your primary product?",
      lowerFrictionPrompt: "What's in your BOM?",
      sectionId: "mfg_bom",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next manufacturing move?",
      lowerFrictionPrompt: "What's the next small production step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_bom", title: "Draft primary product BOM", sectionId: "mfg_bom" },
    { id: "t_wo", title: "Sketch work-order path", sectionId: "mfg_work_orders" },
    { id: "t_qc", title: "Define quality checkpoints", sectionId: "mfg_quality" },
  ],
  suggestedMilestones: [
    { id: "m_product", title: "Product and BOM clear" },
    { id: "m_wo", title: "Work-order path framed" },
    {
      id: "m_ops",
      title: "Quality and inventory considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not engineering or certification authority",
    "Shared ops foundations: SKU, cost, supplier, inventory, traceability",
    "Quality before volume promises",
    "Drafts are not compliance approvals",
  ],
  riskPrompts: [
    "What if orders land before BOM and capacity are real?",
    "What if quality escapes have no calm stop path?",
  ],
  researchPrompts: [
    "Compare lightweight BOM/routing patterns for small shops",
    "Find work-order templates that stay shop-floor usable",
  ],
  deliverables: [
    "Manufacturing Profile",
    "Product Definition",
    "BOM and Routing",
    "Costing Model",
    "Work Order Path",
    "Quality Checkpoints",
    "Inventory and Traceability Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "systems", "finance", "project-management"],
  boardReviewRecommendations: ["capacity", "quality escapes", "margin vs scrap"],
  projectBridgeRecommendations: [
    "Bridge when shop-floor system setup, tooling, or launch runs need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Make-side OS — distinct from retail/ecommerce and product-commerce wholesale",
    },
  ],
  completionCriteria: [
    "Product, BOM, and costing framed",
    "Work orders and quality considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: { ...COLLECTION_META, deliveryKind: "small_manufacturing" },
});

/** 258 — Wholesale & Distribution Business Blueprint */
export const BUSINESS_BLUEPRINT_WHOLESALE_DISTRIBUTION = businessBlueprint({
  blueprintId: WHOLESALE_DISTRIBUTION_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Wholesale & Distribution Business",
  description:
    "Operate wholesale and distribution — catalog, B2B accounts, purchasing, warehouse, order management, returns, and working capital together.",
  intendedUse:
    "Wholesalers and distributors with warehouse/fulfillment ops — distinct from business.wholesale product-commerce partnership channel; not retail storefront OS.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Distribution Model", role: "required" },
    { id: "wd_catalog", title: "Product and Catalog", role: "required" },
    { id: "pricing", title: "Pricing and Margin", role: "required" },
    { id: "wd_accounts", title: "Account Qualification", role: "required" },
    { id: "wd_sales", title: "Sales and Accounts", ...depthGuided },
    { id: "wd_purchasing", title: "Purchasing and Suppliers", ...depthGuided },
    { id: "wd_inventory", title: "Inventory Planning", role: "required" },
    { id: "wd_warehouse", title: "Warehouse", ...depthGuided },
    { id: "wd_orders", title: "Order Management", ...depthGuided },
    { id: "wd_returns", title: "Returns and Credits", ...depthGuided },
    { id: "wd_cash", title: "Cash and Working Capital", ...depthComplete },
    { id: "wd_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt: "What do you distribute — and is this wholesale, distribution, or hybrid with light retail?",
      lowerFrictionPrompt: "What kind of distribution business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_inventory",
      prompt: "How do you decide what to stock, reorder, and discontinue?",
      lowerFrictionPrompt: "How do you plan inventory?",
      sectionId: "wd_inventory",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next distribution move?",
      lowerFrictionPrompt: "What's the next small wholesale step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_catalog", title: "Define catalog structure", sectionId: "wd_catalog" },
    { id: "t_accounts", title: "Draft account qualification rules", sectionId: "wd_accounts" },
    { id: "t_inventory", title: "Set reorder basics", sectionId: "wd_inventory" },
  ],
  suggestedMilestones: [
    { id: "m_model", title: "Distribution model clear" },
    { id: "m_catalog", title: "Catalog and pricing framed" },
    {
      id: "m_ops",
      title: "Inventory and warehouse usable",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Distinct from business.wholesale product-commerce partnership Blueprint",
    "Working capital before growth volume",
    "Returns path before B2B promises",
    "Shared ops foundations with manufacturing/logistics",
  ],
  riskPrompts: [
    "What if inventory cash freezes while sales look fine?",
    "What if warehouse capacity cannot meet fill rates?",
  ],
  researchPrompts: [
    "Compare simple B2B account qualification patterns",
    "Find inventory planning rhythms for small distributors",
  ],
  deliverables: [
    "Distribution Model Snapshot",
    "Catalog Structure",
    "Pricing and Margin Model",
    "Account Qualification Rules",
    "Purchasing Path",
    "Inventory Planning Rules",
    "Warehouse Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "finance", "client-relationships", "systems"],
  boardReviewRecommendations: ["fill rate", "working capital", "account concentration"],
  projectBridgeRecommendations: [
    "Bridge when WMS/ERP setup, warehouse moves, or catalog rebuilds need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Move/distribute OS — distinct from business.wholesale commerce partnership",
    },
  ],
  completionCriteria: [
    "Model, catalog, and pricing framed",
    "Inventory and accounts considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "wholesale_distribution",
  },
});

/** 259 — Logistics & Transportation Business Blueprint */
export const BUSINESS_BLUEPRINT_LOGISTICS_TRANSPORTATION = businessBlueprint({
  blueprintId: LOGISTICS_TRANSPORTATION_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Logistics & Transportation Business",
  description:
    "Operate delivery, freight, and fleet logistics — intake, quoting, dispatch, pickup/delivery, driver ops, safety, billing, and capacity together.",
  intendedUse:
    "Delivery, freight, courier, and fleet operators — not wholesale warehouse OS, not home-service field OS, not travel tourism.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Transport Profile", role: "required" },
    { id: "log_intake", title: "Customer and Shipment Intake", role: "required" },
    { id: "pricing", title: "Pricing and Quoting", role: "required" },
    { id: "log_dispatch", title: "Dispatch and Routes", role: "required" },
    { id: "log_pickup_delivery", title: "Pickup and Delivery", ...depthGuided },
    { id: "log_drivers", title: "Driver Ops", ...depthGuided },
    { id: "log_fleet", title: "Fleet and Equipment", ...depthGuided },
    { id: "log_safety", title: "Safety and Compliance Flags", ...depthGuided },
    { id: "log_comms", title: "Customer Communication", ...depthGuided },
    { id: "log_billing", title: "Billing and Claims", ...depthGuided },
    { id: "log_capacity", title: "Capacity and Network", ...depthComplete },
    { id: "log_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_model",
      prompt: "What do you move — last-mile, freight, courier, specialized — and what geography?",
      lowerFrictionPrompt: "What kind of logistics business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_dispatch",
      prompt: "How do jobs get dispatched without chaos on a busy day?",
      lowerFrictionPrompt: "How does dispatch work?",
      sectionId: "log_dispatch",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next logistics move?",
      lowerFrictionPrompt: "What's the next small transport step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_intake", title: "Draft shipment intake checklist", sectionId: "log_intake" },
    { id: "t_dispatch", title: "Define dispatch board rules", sectionId: "log_dispatch" },
    { id: "t_safety", title: "Name safety stop ownership", sectionId: "log_safety" },
  ],
  suggestedMilestones: [
    { id: "m_profile", title: "Transport profile clear" },
    { id: "m_dispatch", title: "Dispatch path framed" },
    {
      id: "m_ops",
      title: "Safety and POD considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Safety outweighs schedule and margin pressure",
    "Not HOS/hazmat/licensing authority",
    "Distinct from home_service and wholesale warehouse",
    "Claims path needs a calm owner",
  ],
  riskPrompts: [
    "What if dispatch volume exceeds driver and vehicle capacity?",
    "What if incidents have no clear reporting owner?",
  ],
  researchPrompts: [
    "Compare simple dispatch board patterns for small fleets",
    "Find POD and exception-message templates that stay clear",
  ],
  deliverables: [
    "Transport Profile",
    "Shipment Intake Checklist",
    "Pricing and Quoting Model",
    "Dispatch Board Rules",
    "Pickup and Delivery Path",
    "Safety Stop Path",
    "Billing and Claims Path",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "systems", "risk", "client-relationships"],
  boardReviewRecommendations: ["on-time delivery", "safety incidents", "capacity"],
  projectBridgeRecommendations: [
    "Bridge when fleet setup, dispatch tooling, or lane launches need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Move freight/people OS — distinct from field home_service and wholesale warehouse",
    },
  ],
  completionCriteria: [
    "Profile, intake, and dispatch framed",
    "Safety considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "logistics_transportation",
  },
});

/** 260 — Agriculture, Farm & Rural Business Blueprint */
export const BUSINESS_BLUEPRINT_AGRICULTURE_FARM_RURAL = businessBlueprint({
  blueprintId: AGRICULTURE_FARM_RURAL_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Agriculture, Farm & Rural Business",
  description:
    "Operate farm, ranch, CSA, and rural enterprises — enterprise planning, seasonality, inputs, harvest/inventory, sales channels, risk, and records together.",
  intendedUse:
    "Farms, ranches, CSA, and rural producers — not restaurant/hospitality lodging OS; not veterinary or pesticide authority.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Farm Profile", role: "required" },
    { id: "ag_enterprise", title: "Enterprise Planning", role: "required" },
    { id: "ag_crop", title: "Crop Planning", ...depthGuided },
    { id: "ag_livestock", title: "Livestock Planning", ...depthGuided },
    { id: "pricing", title: "Costing and Finance", role: "required" },
    { id: "ag_inputs", title: "Inputs and Suppliers", ...depthGuided },
    { id: "ag_equipment", title: "Equipment and Facilities", ...depthGuided },
    { id: "ag_labor", title: "Labor", ...depthGuided },
    { id: "ag_harvest", title: "Harvest, Processing, Inventory", ...depthGuided },
    { id: "ag_sales", title: "Sales and Channels", role: "required" },
    { id: "ag_agritourism", title: "Agritourism (when relevant)", ...depthComplete },
    { id: "ag_risk", title: "Risk", ...depthGuided },
    { id: "ag_records", title: "Records and Traceability", ...depthComplete },
    { id: "ag_performance", title: "Performance", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_enterprises",
      prompt: "What enterprises do you run — crops, livestock, CSA, value-add, agritourism, or hybrid?",
      lowerFrictionPrompt: "What kind of farm or rural business is this?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision", "specialty"],
      materialChangeNextStep: true,
    },
    {
      id: "q_channels",
      prompt: "How do you sell — wholesale, CSA, farm stand, markets, or direct?",
      lowerFrictionPrompt: "How do you sell?",
      sectionId: "ag_sales",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["services", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single next farm move?",
      lowerFrictionPrompt: "What's the next small farm step?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_action", "next_step"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_enterprise", title: "Map enterprises for the season", sectionId: "ag_enterprise" },
    { id: "t_cost", title: "Sketch enterprise costing", sectionId: "pricing" },
    { id: "t_sales", title: "List sales channels", sectionId: "ag_sales" },
  ],
  suggestedMilestones: [
    { id: "m_profile", title: "Farm profile clear" },
    { id: "m_enterprise", title: "Enterprises framed" },
    {
      id: "m_ops",
      title: "Sales and risk considered",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  commonlyForgottenItems: [
    "Not restaurant or hospitality lodging OS",
    "Not veterinary/agronomy/pesticide authority",
    "Animal welfare and food-safety flags stay visible",
    "Seasonality before annual revenue promises",
  ],
  riskPrompts: [
    "What if weather or market risk has no calm contingency?",
    "What if labor peaks without coverage plans?",
  ],
  researchPrompts: [
    "Compare simple enterprise planning sheets for diversified farms",
    "Find CSA onboarding patterns that stay calm",
  ],
  deliverables: [
    "Farm Profile",
    "Enterprise Plan",
    "Costing Model",
    "Input and Supplier Path",
    "Harvest and Inventory Path",
    "Sales Channel Plan",
    "Risk Review",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["operations", "finance", "systems", "risk"],
  boardReviewRecommendations: ["seasonal cash", "enterprise mix", "labor coverage"],
  projectBridgeRecommendations: [
    "Bridge when season prep, facility builds, or channel launches need Project tasks",
  ],
  cartographyRelationshipRecommendations: [
    {
      relationship: "supports",
      note: "Farm/rural OS — distinct from restaurant, hospitality, and pet_service",
    },
  ],
  completionCriteria: [
    "Profile and enterprises framed",
    "Sales and costing considered",
    "Next actions clear",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    ...COLLECTION_META,
    deliveryKind: "agriculture_farm_rural",
  },
});

export const MANUFACTURING_LOGISTICS_AGRICULTURE_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_SMALL_MANUFACTURING,
    BUSINESS_BLUEPRINT_WHOLESALE_DISTRIBUTION,
    BUSINESS_BLUEPRINT_LOGISTICS_TRANSPORTATION,
    BUSINESS_BLUEPRINT_AGRICULTURE_FARM_RURAL,
  ];

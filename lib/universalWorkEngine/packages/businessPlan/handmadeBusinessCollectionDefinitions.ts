/**
 * 203–206 — Handmade Business Collection Blueprints (definition data only).
 * Registered on Business Plan Work Type via businessBlueprintDefinitions.
 */

import type { BlueprintDefinition, BlueprintGroup } from "../../blueprints/types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "../../blueprints/types";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { BUSINESS_PLAN_MAP_GROUPS } from "./businessPlanMapGroups";

const BUSINESS_WORK = [BUSINESS_PLAN_WORK_TYPE_ID] as const;

export const ETSY_BUSINESS_BLUEPRINT_ID = "business.etsy" as const;
export const PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID =
  "business.product_photography" as const;
export const INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID =
  "business.inventory_pricing" as const;
export const HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID =
  "business.holiday_planner" as const;

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

/** 203 — Etsy Business Blueprint */
export const BUSINESS_BLUEPRINT_ETSY = businessBlueprint({
  blueprintId: ETSY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Etsy Business",
  description:
    "Operate and grow an Etsy shop from setup through SEO, listings, photography, pricing, shipping, reviews, ads, seasonal planning, and profitability.",
  intendedUse:
    "Makers who want an Etsy-first operating system — not a generic multi-marketplace plan.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Shop Vision", role: "required" },
    { id: "shop_setup", title: "Shop Setup", role: "required" },
    { id: "branding", title: "Branding", ...depthGuided },
    { id: "products_offers", title: "Products", role: "required" },
    { id: "customers_audience", title: "Customers", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "inventory", title: "Inventory", role: "required" },
    { id: "photography", title: "Photography", ...depthGuided },
    { id: "listings_seo", title: "Listings, Keywords, and SEO", ...depthGuided },
    { id: "shipping_packaging", title: "Shipping Profiles", ...depthGuided },
    { id: "customer_service", title: "Customer Messages", ...depthGuided },
    { id: "reviews_reputation", title: "Reviews", ...depthGuided },
    { id: "ads", title: "Etsy Ads", ...depthGuided },
    { id: "seasonal_planning", title: "Seasonal Planning", ...depthGuided },
    { id: "automation", title: "Automation", ...depthComplete },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "analytics", title: "Analytics", ...depthComplete },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What kind of Etsy shop are you building, and what should feel easier?",
      lowerFrictionPrompt: "What Etsy shop are you building?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision"],
      materialChangeNextStep: true,
    },
    {
      id: "q_setup",
      prompt: "Where is the shop today — idea, opening soon, or already live?",
      lowerFrictionPrompt: "Is the shop live yet?",
      sectionId: "shop_setup",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["shop_setup", "status"],
      materialChangeNextStep: true,
    },
    {
      id: "q_products",
      prompt: "What do you sell on Etsy, and which listings matter most right now?",
      lowerFrictionPrompt: "What do you sell on Etsy?",
      sectionId: "products_offers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["products", "offers"],
      materialChangeNextStep: true,
    },
    {
      id: "q_pricing",
      prompt: "How do you price for materials, time, Etsy fees, and profit?",
      lowerFrictionPrompt: "How do you price on Etsy?",
      sectionId: "pricing",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["pricing"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single most helpful next action for the Etsy shop this week?",
      lowerFrictionPrompt: "What is the next helpful action?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_actions"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_setup", title: "Finish or refine shop setup basics", sectionId: "shop_setup" },
    { id: "t_products", title: "Clarify primary product mix", sectionId: "products_offers" },
    { id: "t_pricing", title: "Validate pricing against Etsy fees", sectionId: "pricing" },
    {
      id: "t_seo",
      title: "Improve titles, tags, and SEO on priority listings",
      sectionId: "listings_seo",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_photos",
      title: "Upgrade product photography set",
      sectionId: "photography",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_ads",
      title: "Set a calm Etsy Ads experiment",
      sectionId: "ads",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_setup", title: "Shop setup clear" },
    { id: "m_listings", title: "Core listings strong", depthModes: ["guided_build", "complete_planning"] },
    { id: "m_ops", title: "Shipping and messages ready", depthModes: ["guided_build", "complete_planning"] },
    { id: "m_profit", title: "Profitability framed" },
  ],
  commonlyForgottenItems: [
    "Etsy fees in pricing",
    "Shipping profile accuracy",
    "Keyword research before rewriting titles",
    "Review request path",
    "Seasonal listing refreshes",
    "Ad spend that does not erase margin",
  ],
  riskPrompts: [
    "What if ads spend more than they earn?",
    "What if inventory cannot keep up with a viral listing?",
    "Which listings deserve SEO work before new products?",
  ],
  researchPrompts: [
    "Research Etsy SEO patterns for this niche",
    "Compare shipping profile options",
    "Benchmark handmade pricing on Etsy",
    "Review seasonal search trends for this category",
  ],
  deliverables: [
    "Etsy Business Plan",
    "Shop setup checklist",
    "Listing and SEO checklist",
    "Photography checklist",
    "Shipping profile notes",
    "Pricing and profitability view",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["marketing", "content", "sales", "finance", "systems"],
  boardReviewRecommendations: [
    "shop vision",
    "listing quality",
    "pricing and profitability",
    "seasonal plan",
  ],
  projectBridgeRecommendations: [
    "Bridge when a seasonal collection, ad campaign, or major listing refresh begins",
  ],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Supports Etsy shop growth and revenue goals" },
    {
      relationship: "related_to",
      note: "May connect to photography, inventory, or holiday planner Work",
    },
  ],
  completionCriteria: [
    "Shop vision clear",
    "Setup status known",
    "Products and pricing set",
    "Inventory plan exists",
    "Profitability framed",
    "Next actions clear",
    "Listings and shipping planned (Guided+)",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    platform: "Etsy",
    successModel:
      "The Etsy shop becomes calmer to run — listings, fees, photos, and profit stay visible together.",
  },
});

/** 204 — Product Photography Studio Blueprint */
export const BUSINESS_BLUEPRINT_PRODUCT_PHOTOGRAPHY = businessBlueprint({
  blueprintId: PRODUCT_PHOTOGRAPHY_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Product Photography Studio",
  description:
    "Create consistent, high-converting product photography — shot lists, lighting, styling, lifestyle images, editing, organization, alt text, and marketplace requirements.",
  intendedUse:
    "Makers who need a repeatable photo system for listings, launches, and seasonal collections.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Photo Vision", role: "required" },
    { id: "products_offers", title: "Products to Photograph", role: "required" },
    { id: "shot_lists", title: "Shot Lists", role: "required" },
    { id: "lighting", title: "Lighting", ...depthGuided },
    { id: "backgrounds", title: "Backgrounds", ...depthGuided },
    { id: "styling", title: "Styling", ...depthGuided },
    { id: "lifestyle_images", title: "Lifestyle Images", ...depthGuided },
    { id: "video_clips", title: "Video Clips", ...depthComplete },
    { id: "editing_workflow", title: "Editing Workflow", ...depthGuided },
    { id: "image_organization", title: "Image Organization", ...depthGuided },
    { id: "accessibility_alt_text", title: "Accessibility and Alt Text", ...depthGuided },
    {
      id: "marketplace_image_requirements",
      title: "Marketplace Image Requirements",
      ...depthGuided,
    },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What should your product photos help customers feel and understand?",
      lowerFrictionPrompt: "What should your photos achieve?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision"],
      materialChangeNextStep: true,
    },
    {
      id: "q_products",
      prompt: "Which products need photos first?",
      lowerFrictionPrompt: "Which products need photos?",
      sectionId: "products_offers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["products"],
      materialChangeNextStep: true,
    },
    {
      id: "q_shots",
      prompt: "What shots belong on the priority shot list?",
      lowerFrictionPrompt: "What shots matter most?",
      sectionId: "shot_lists",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["shot_lists"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single most helpful next photography action this week?",
      lowerFrictionPrompt: "What is the next photo action?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_actions"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_shots", title: "Build priority shot list", sectionId: "shot_lists" },
    {
      id: "t_light",
      title: "Set lighting and background standards",
      sectionId: "lighting",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_edit",
      title: "Define editing and naming workflow",
      sectionId: "editing_workflow",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_alt",
      title: "Write alt text patterns for listings",
      sectionId: "accessibility_alt_text",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_shots", title: "Shot list ready" },
    { id: "m_style", title: "Lighting and styling standards set", depthModes: ["guided_build", "complete_planning"] },
    { id: "m_system", title: "Editing and organization system live", depthModes: ["guided_build", "complete_planning"] },
  ],
  commonlyForgottenItems: [
    "Detail shots for texture and scale",
    "Consistent white balance",
    "Alt text for accessibility and SEO",
    "Marketplace crop and size rules",
    "Lifestyle context without clutter",
  ],
  riskPrompts: [
    "What if photos look inconsistent across seasons?",
    "Which marketplace rules could reject images?",
    "How will files stay findable when the catalog grows?",
  ],
  researchPrompts: [
    "Research lighting setups for small handmade products",
    "Compare marketplace image requirements",
    "Find lifestyle photo patterns that convert in this niche",
  ],
  deliverables: [
    "Product Photography Plan",
    "Priority shot list",
    "Lighting and background standards",
    "Editing workflow",
    "Alt text patterns",
    "Marketplace image checklist",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["content", "marketing", "systems"],
  boardReviewRecommendations: ["photo vision", "shot list", "marketplace readiness"],
  projectBridgeRecommendations: [
    "Bridge when a major listing refresh, launch, or holiday collection needs a photo sprint",
  ],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Supports listings, launches, and seasonal campaigns" },
    {
      relationship: "related_to",
      note: "May connect to Etsy, online store, or holiday planner Work",
    },
  ],
  completionCriteria: [
    "Photo vision clear",
    "Priority products chosen",
    "Shot list exists",
    "Next actions clear",
    "Lighting and marketplace rules planned (Guided+)",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    successModel:
      "Photography becomes a calm system — not a scramble before every listing goes live.",
  },
});

/** 205 — Inventory & Pricing Blueprint */
export const BUSINESS_BLUEPRINT_INVENTORY_PRICING = businessBlueprint({
  blueprintId: INVENTORY_PRICING_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Inventory and Pricing",
  description:
    "Manage handmade inventory and pricing — cost of goods, labor, overhead, margins, forecasting, bundles, seasonal stock, reorder points, best sellers, and dead inventory.",
  intendedUse:
    "Makers who need money and stock clarity without a full store or show operating system.",
  complexity: "moderate",
  sections: [
    { id: "purpose_vision", title: "Money and Stock Goals", role: "required" },
    { id: "products_offers", title: "Products", role: "required" },
    { id: "cost_of_goods", title: "Cost of Goods", role: "required" },
    { id: "labor_cost", title: "Labor", role: "required" },
    { id: "overhead", title: "Overhead", ...depthGuided },
    { id: "profit_margin", title: "Profit Margin", role: "required" },
    { id: "pricing", title: "Pricing", role: "required" },
    { id: "inventory", title: "Inventory Snapshot", role: "required" },
    { id: "inventory_forecasting", title: "Inventory Forecasting", ...depthGuided },
    { id: "bundles", title: "Bundles", ...depthGuided },
    { id: "seasonal_stock", title: "Seasonal Stock", ...depthGuided },
    { id: "reorder_points", title: "Reorder Points", ...depthGuided },
    { id: "best_sellers", title: "Best Sellers", ...depthGuided },
    { id: "dead_inventory", title: "Dead Inventory", ...depthGuided },
    { id: "profitability", title: "Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Review Rhythm", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "What should feel clearer — pricing, stock levels, or both?",
      lowerFrictionPrompt: "What should feel clearer about money or stock?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "vision"],
      materialChangeNextStep: true,
    },
    {
      id: "q_products",
      prompt: "Which products need pricing or inventory attention first?",
      lowerFrictionPrompt: "Which products need attention first?",
      sectionId: "products_offers",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["products"],
      materialChangeNextStep: true,
    },
    {
      id: "q_cogs",
      prompt: "What goes into cost of goods for your primary products?",
      lowerFrictionPrompt: "What are your main material costs?",
      sectionId: "cost_of_goods",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["cost_of_goods", "materials"],
      materialChangeNextStep: true,
    },
    {
      id: "q_margin",
      prompt: "What profit margin are you aiming for after fees and labor?",
      lowerFrictionPrompt: "What margin are you aiming for?",
      sectionId: "profit_margin",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["margin", "profit_margin"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single most helpful next action for inventory or pricing?",
      lowerFrictionPrompt: "What is the next helpful action?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_actions"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_cogs", title: "Capture cost of goods for priority products", sectionId: "cost_of_goods" },
    { id: "t_labor", title: "Estimate labor honestly", sectionId: "labor_cost" },
    { id: "t_margin", title: "Set target margins and prices", sectionId: "profit_margin" },
    {
      id: "t_reorder",
      title: "Define reorder points for best sellers",
      sectionId: "reorder_points",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_dead",
      title: "Decide what to do with dead inventory",
      sectionId: "dead_inventory",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_costs", title: "Costs and labor clear" },
    { id: "m_prices", title: "Prices and margins set" },
    { id: "m_stock", title: "Forecast and reorder points set", depthModes: ["guided_build", "complete_planning"] },
  ],
  commonlyForgottenItems: [
    "Labor in every unit",
    "Platform fees in margin math",
    "Packaging and shipping materials",
    "Seasonal stock lead times",
    "Dead inventory taking shelf space and cash",
  ],
  riskPrompts: [
    "What if best sellers stock out during peak season?",
    "What if dead inventory keeps growing quietly?",
    "Are prices covering overhead or only materials?",
  ],
  researchPrompts: [
    "Benchmark handmade margins in this category",
    "Research simple inventory forecasting methods for makers",
    "Compare bundle pricing strategies",
  ],
  deliverables: [
    "Inventory and Pricing Plan",
    "Cost of goods sheet",
    "Margin targets",
    "Pricing sheet",
    "Reorder point notes",
    "Dead inventory decisions",
    "Next actions list",
  ],
  chamberRoutingRecommendations: ["finance", "systems", "sales", "marketing"],
  boardReviewRecommendations: [
    "cost accuracy",
    "margin targets",
    "inventory health",
    "dead inventory plan",
  ],
  projectBridgeRecommendations: [
    "Bridge when a seasonal build, restock project, or pricing overhaul begins",
  ],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Supports profitable selling across channels" },
    {
      relationship: "related_to",
      note: "May connect to Etsy, online store, craft show, or holiday planner Work",
    },
  ],
  completionCriteria: [
    "Goals clear",
    "Priority products chosen",
    "Costs and labor captured",
    "Margins and prices set",
    "Inventory snapshot exists",
    "Next actions clear",
    "Forecast and reorder planned (Guided+)",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    successModel:
      "Pricing and stock decisions feel grounded — not guessed under pressure.",
  },
});

/** 206 — Holiday Product Planner Blueprint */
export const BUSINESS_BLUEPRINT_HOLIDAY_PRODUCT_PLANNER = businessBlueprint({
  blueprintId: HOLIDAY_PRODUCT_PLANNER_BUSINESS_BLUEPRINT_ID,
  version: "1.0.0",
  title: "Holiday Product Planner",
  description:
    "Plan seasonal collections and launch calendars across Valentine’s, Easter, Mother’s Day, Father’s Day, Back to School, Halloween, Thanksgiving, Christmas, and custom campaigns — with production, inventory, marketing, and event integration.",
  intendedUse:
    "Makers who need a seasonal collection calendar without rebuilding their whole business plan each holiday.",
  complexity: "complex",
  sections: [
    { id: "purpose_vision", title: "Season Vision", role: "required" },
    { id: "collection_planning", title: "Collection Planning", role: "required" },
    { id: "products_offers", title: "Seasonal Products", role: "required" },
    { id: "customers_audience", title: "Seasonal Buyers", ...depthGuided },
    { id: "production_schedule", title: "Production Schedule", role: "required" },
    { id: "inventory", title: "Seasonal Inventory", role: "required" },
    { id: "seasonal_stock", title: "Stock Targets", ...depthGuided },
    { id: "launch_timeline", title: "Launch Timeline", role: "required" },
    { id: "seasonal_campaigns", title: "Marketing Campaigns", ...depthGuided },
    { id: "launches_promotions", title: "Promotions", ...depthGuided },
    { id: "photography", title: "Seasonal Photography", ...depthGuided },
    {
      id: "linked_event_work",
      title: "Event Integration",
      ...depthGuided,
    },
    { id: "pricing", title: "Seasonal Pricing", ...depthGuided },
    { id: "profitability", title: "Season Profitability", role: "required" },
    { id: "next_actions", title: "Next Actions", role: "required" },
    { id: "review_rhythm", title: "Post-Season Review", ...depthComplete },
    SHARED_HIDDEN,
  ],
  adaptiveQuestions: [
    {
      id: "q_vision",
      prompt: "Which season or holiday are you planning for first?",
      lowerFrictionPrompt: "Which holiday are you planning first?",
      sectionId: "purpose_vision",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["purpose", "season", "holiday"],
      materialChangeNextStep: true,
    },
    {
      id: "q_collection",
      prompt: "What collection or product story will this season carry?",
      lowerFrictionPrompt: "What is the seasonal collection about?",
      sectionId: "collection_planning",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["collection", "theme"],
      materialChangeNextStep: true,
    },
    {
      id: "q_production",
      prompt: "When does production need to start to hit your launch date?",
      lowerFrictionPrompt: "When must production start?",
      sectionId: "production_schedule",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["production", "schedule"],
      materialChangeNextStep: true,
    },
    {
      id: "q_launch",
      prompt: "What is the launch timeline from teaser to peak selling week?",
      lowerFrictionPrompt: "What is the launch timeline?",
      sectionId: "launch_timeline",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["launch", "timeline"],
      materialChangeNextStep: true,
    },
    {
      id: "q_next",
      prompt: "What is the single most helpful next action for this season?",
      lowerFrictionPrompt: "What is the next seasonal action?",
      sectionId: "next_actions",
      requiredInModes: ["quick_start", "guided_build", "complete_planning"],
      knownContextKeys: ["next_actions"],
      materialChangeNextStep: true,
    },
  ],
  suggestedTasks: [
    { id: "t_collection", title: "Lock collection theme and SKUs", sectionId: "collection_planning" },
    { id: "t_production", title: "Build production schedule backward from launch", sectionId: "production_schedule" },
    { id: "t_launch", title: "Set launch timeline and peak week", sectionId: "launch_timeline" },
    {
      id: "t_campaign",
      title: "Outline seasonal marketing campaign",
      sectionId: "seasonal_campaigns",
      depthModes: ["guided_build", "complete_planning"],
    },
    {
      id: "t_events",
      title: "Decide which shows or events integrate with this season",
      sectionId: "linked_event_work",
      depthModes: ["guided_build", "complete_planning"],
    },
  ],
  suggestedMilestones: [
    { id: "m_collection", title: "Collection planned" },
    { id: "m_production", title: "Production schedule set" },
    { id: "m_launch", title: "Launch timeline locked" },
    { id: "m_campaign", title: "Campaign and event path clear", depthModes: ["guided_build", "complete_planning"] },
  ],
  commonlyForgottenItems: [
    "Production lead time before listing day",
    "Photography before launch week",
    "Inventory buffers for bestsellers",
    "Post-holiday dead stock plan",
    "Event dates that collide with online launch",
  ],
  riskPrompts: [
    "What if production slips two weeks?",
    "What if one SKU sells out early and others stall?",
    "Which holidays deserve a full collection vs a light refresh?",
  ],
  researchPrompts: [
    "Map handmade seasonal search peaks for this niche",
    "Compare Christmas vs Halloween lead times for makers",
    "Research simple launch calendar templates for small shops",
  ],
  deliverables: [
    "Holiday Product Plan",
    "Collection outline",
    "Production schedule",
    "Launch timeline",
    "Seasonal inventory targets",
    "Marketing campaign outline",
    "Event integration notes",
    "Next actions list",
  ],
  chamberRoutingRecommendations: [
    "marketing",
    "events",
    "content",
    "systems",
    "finance",
  ],
  boardReviewRecommendations: [
    "season focus",
    "collection scope",
    "production realism",
    "launch timing",
    "profitability",
  ],
  projectBridgeRecommendations: [
    "Bridge when production starts, launch week begins, or a linked Event Work is needed",
  ],
  cartographyRelationshipRecommendations: [
    { relationship: "supports", note: "Supports seasonal revenue and collection launches" },
    {
      relationship: "informs",
      note: "May inform linked Event plans, Etsy refreshes, or photography sprints",
    },
  ],
  completionCriteria: [
    "Season chosen",
    "Collection planned",
    "Production schedule set",
    "Launch timeline clear",
    "Inventory targets exist",
    "Profitability framed",
    "Next actions clear",
    "Campaign and event path planned (Guided+)",
  ],
  certificationRules: [...CERT_RULES],
  domainExtensions: {
    seasons: [
      "Valentine's",
      "Easter",
      "Mother's Day",
      "Father's Day",
      "Back to School",
      "Halloween",
      "Thanksgiving",
      "Christmas",
      "Custom seasonal campaigns",
    ],
    successModel:
      "Each holiday arrives with a calm plan — collection, production, launch, and review already connected.",
  },
});

export const HANDMADE_BUSINESS_COLLECTION_DEFINITIONS: readonly BlueprintDefinition[] =
  [
    BUSINESS_BLUEPRINT_ETSY,
    BUSINESS_BLUEPRINT_PRODUCT_PHOTOGRAPHY,
    BUSINESS_BLUEPRINT_INVENTORY_PRICING,
    BUSINESS_BLUEPRINT_HOLIDAY_PRODUCT_PLANNER,
  ];

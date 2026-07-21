/**
 * Business Plan map groups — schema config only (201–202).
 */

import type { BlueprintGroup } from "../../blueprints/types";

export const BUSINESS_PLAN_MAP_GROUPS: readonly BlueprintGroup[] = [
  {
    groupId: "foundation",
    title: "Foundation",
    description: "Vision, products, customers, and pricing.",
    order: 0,
    collapsedByDefault: false,
    sectionIds: [
      "purpose_vision",
      "products_offers",
      "customers_audience",
      "positioning",
      "pricing",
      "inventory",
    ],
  },
  {
    groupId: "in_person_shows",
    title: "Shows and Markets",
    description: "Booth, applications, travel, and day-of selling.",
    order: 1,
    collapsedByDefault: true,
    sectionIds: [
      "booth_design",
      "show_discovery",
      "jury_applications",
      "annual_calendar",
      "travel_logistics",
      "packing_loading",
      "pos_checkout",
      "lead_capture",
      "customer_relationships",
      "vendor_documents",
      "restocking_seasonal",
      "post_show_review",
    ],
  },
  {
    groupId: "online_store",
    title: "Online Store",
    description: "Marketplaces, listings, shipping, and digital growth.",
    order: 2,
    collapsedByDefault: true,
    sectionIds: [
      "photography",
      "listings_seo",
      "marketplaces",
      "shipping_packaging",
      "customer_service",
      "reviews_reputation",
      "email_marketing",
      "social_pinterest",
      "launches_promotions",
      "automation",
    ],
  },
  {
    groupId: "stewardship",
    title: "Money and Stewardship",
    description: "Profit, taxes, analytics, linked work, and review.",
    order: 3,
    collapsedByDefault: true,
    sectionIds: [
      "expenses_taxes",
      "profitability",
      "analytics",
      "linked_event_work",
      "next_actions",
      "review_rhythm",
    ],
  },
];

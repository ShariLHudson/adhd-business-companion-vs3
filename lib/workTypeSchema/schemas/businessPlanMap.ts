/**
 * Leaf data only — no imports from Create runtime (avoids circular deps).
 * Business Plan section map (201–202 Crafter Business Blueprints).
 */

import type { WorkTypeMapSectionDef } from "../types";

export const BUSINESS_PLAN_MAP_SECTIONS: readonly WorkTypeMapSectionDef[] = [
  { id: "purpose_vision", title: "Business Vision" },
  { id: "products_offers", title: "Products and Offers" },
  { id: "customers_audience", title: "Customers and Audience" },
  { id: "positioning", title: "Positioning" },
  { id: "pricing", title: "Pricing" },
  { id: "inventory", title: "Inventory" },
  { id: "booth_design", title: "Booth Design" },
  { id: "show_discovery", title: "Show Discovery" },
  { id: "jury_applications", title: "Jury Applications" },
  { id: "annual_calendar", title: "Annual Calendar" },
  { id: "travel_logistics", title: "Travel and Logistics" },
  { id: "packing_loading", title: "Packing and Vehicle Loading" },
  { id: "pos_checkout", title: "POS and Checkout" },
  { id: "lead_capture", title: "Lead Capture and Email Growth" },
  { id: "customer_relationships", title: "Customer Relationships" },
  { id: "vendor_documents", title: "Vendor Documents" },
  { id: "restocking_seasonal", title: "Restocking and Seasonal Planning" },
  { id: "photography", title: "Photography" },
  { id: "listings_seo", title: "Listings, Keywords, and SEO" },
  { id: "marketplaces", title: "Marketplaces and Channels" },
  { id: "shipping_packaging", title: "Shipping and Packaging" },
  { id: "customer_service", title: "Customer Service" },
  { id: "reviews_reputation", title: "Reviews and Reputation" },
  { id: "email_marketing", title: "Email Marketing" },
  { id: "social_pinterest", title: "Social and Pinterest" },
  { id: "launches_promotions", title: "Launches and Promotions" },
  { id: "automation", title: "Automation" },
  { id: "expenses_taxes", title: "Expenses and Taxes" },
  { id: "profitability", title: "Profitability" },
  { id: "analytics", title: "Analytics" },
  { id: "linked_event_work", title: "Linked Event and Campaign Work" },
  { id: "next_actions", title: "Next Actions" },
  { id: "review_rhythm", title: "Review Rhythm" },
  { id: "post_show_review", title: "Post-Show Review" },
];

export const BUSINESS_PLAN_DEFAULT_FOCUS: readonly string[] = [
  "purpose_vision",
  "products_offers",
  "customers_audience",
  "pricing",
  "next_actions",
  "profitability",
];

export const BUSINESS_PLAN_WORK_TYPE_ID = "business_plan" as const;

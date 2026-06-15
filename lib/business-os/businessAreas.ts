/**
 * Business area definitions and labels.
 */

import type { BusinessArea } from "./types";

export const BUSINESS_AREA_LABELS: Record<BusinessArea, string> = {
  offers: "Offers",
  marketing: "Marketing",
  content: "Content",
  sales: "Sales",
  relationships: "Relationships",
  delivery: "Delivery",
  operations: "Operations",
  finances: "Finances",
  projects: "Projects",
  customer_support: "Customer support",
  founder_capacity: "Founder capacity",
};

export const ALL_BUSINESS_AREAS: BusinessArea[] = [
  "offers",
  "marketing",
  "content",
  "sales",
  "relationships",
  "delivery",
  "operations",
  "finances",
  "projects",
  "customer_support",
  "founder_capacity",
];

export function businessAreaLabel(area: BusinessArea): string {
  return BUSINESS_AREA_LABELS[area];
}

export function businessHealthLabel(level: string): string {
  switch (level) {
    case "healthy":
      return "Healthy";
    case "stable":
      return "Stable";
    case "needs_attention":
      return "Needs attention";
    case "overloaded":
      return "Overloaded";
    default:
      return "Unknown";
  }
}

export function founderLoadLabel(level: string): string {
  switch (level) {
    case "low":
      return "Low";
    case "moderate":
      return "Moderate";
    case "high":
      return "High";
    case "critical":
      return "Critical";
    default:
      return "Unknown";
  }
}

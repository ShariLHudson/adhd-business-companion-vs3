import type { OpportunityCategory, OpportunityExecutiveFilter } from "../types";

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  product: "Product Opportunity",
  revenue: "Revenue Opportunity",
  marketing: "Marketing Opportunity",
  workshop: "Workshop Opportunity",
  course: "Course Opportunity",
  feature: "Feature Opportunity",
  automation: "Automation Opportunity",
  ai: "AI Opportunity",
  technology: "Technology Opportunity",
  customer: "Customer Opportunity",
  community: "Community Opportunity",
  partnership: "Partnership Opportunity",
  brand: "Brand Opportunity",
  operational: "Operational Improvement",
};

export const EXECUTIVE_FILTER_LABELS: Record<OpportunityExecutiveFilter, string> = {
  "high-impact": "High Impact",
  "quick-win": "Quick Wins",
  "long-term-bet": "Long-Term Bets",
  "needs-research": "Needs Research",
  watch: "Watch",
  ignore: "Ignore",
};

export function labelForCategory(category: OpportunityCategory): string {
  return OPPORTUNITY_CATEGORY_LABELS[category];
}

export function labelForExecutiveFilter(filter: OpportunityExecutiveFilter): string {
  return EXECUTIVE_FILTER_LABELS[filter];
}

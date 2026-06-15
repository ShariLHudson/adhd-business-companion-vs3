/** Chief of Staff Intelligence — focus on the right work, not more work. */

export type ChiefAssessmentLevel =
  | "calm"
  | "focused"
  | "stretched"
  | "overloaded"
  | "critical";

export type ChiefFounderCapacity = "available" | "limited" | "strained" | "depleted";

export type ChiefRecommendedAction = {
  id: string;
  label: string;
  reason: string;
};

export type ChiefProjectAttention = {
  id: string;
  name: string;
  reason: string;
};

export type ChiefOfStaffSnapshot = {
  overallAssessment: ChiefAssessmentLevel;
  founderCapacity: ChiefFounderCapacity;
  biggestRisk: string;
  biggestOpportunity: string;
  recommendedFocus: string;
  recommendedActions: ChiefRecommendedAction[];
  projectsNeedingAttention: ChiefProjectAttention[];
  projectsToIgnore: string[];
  createdAt: string;
};

export type ChiefOfStaffInput = {
  now?: Date;
  text?: string;
};

export type ChiefOfStaffOffer = {
  snapshot: ChiefOfStaffSnapshot;
  introLine: string;
  createdAt: string;
};

export type FounderChiefReport = {
  generatedAt: string;
  sampleSize: number;
  assessmentDistribution: {
    level: ChiefAssessmentLevel;
    label: string;
    count: number;
  }[];
  overloadedCount: number;
  commonIgnoreItems: { label: string; count: number }[];
  commonActions: { label: string; count: number }[];
  recommendedFounderAction: string;
  notes: string;
};

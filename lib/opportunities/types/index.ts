/** Opportunity Discovery Center — business opportunity types. */

export type OpportunityTypeId =
  | "new-product"
  | "feature-improvement"
  | "automation"
  | "customer-experience"
  | "revenue"
  | "membership"
  | "course"
  | "workshop"
  | "marketing"
  | "research"
  | "technology"
  | "ai"
  | "operations"
  | "community"
  | "education"
  | "strategic-partnership"
  | "future-vision";

export type OpportunityRecommendation =
  | "build"
  | "prototype"
  | "research-further"
  | "watch"
  | "ignore"
  | "delay"
  | "partner"
  | "automate";

export type OpportunityConfidence = "high" | "medium" | "low" | "exploratory";

export type OpportunityImpactLevel = "high" | "medium" | "low";

export type OpportunityEffortLevel = "low" | "medium" | "high";

export type OpportunitySourceKind =
  | "research"
  | "customer-questions"
  | "member-struggles"
  | "analytics"
  | "search-trends"
  | "pinterest"
  | "ai-developments"
  | "competitor-gaps"
  | "executive-board"
  | "institutional-memory"
  | "mission-progress"
  | "executive-questions";

export type OpportunityBoardPerspectiveId =
  | "ceo"
  | "customer"
  | "marketing"
  | "finance"
  | "operations"
  | "innovation"
  | "technology"
  | "adhd";

export type SparkEcosystemTarget =
  | "founder"
  | "companion"
  | "postcraft"
  | "listening-rooms"
  | "team-hub"
  | "customer-experience"
  | "revenue"
  | "founder-experience"
  | "courses"
  | "workshops"
  | "memberships"
  | "operations"
  | "marketing";

export type OpportunityEvidence = {
  id: string;
  kind: OpportunitySourceKind;
  title: string;
  summary: string;
};

export type OpportunityWhyNow = {
  whyNow: string;
  whyNotSixMonthsAgo: string;
  whatChanged: string;
  evidenceSummary: string;
};

export type OpportunitySoWhat = {
  whySparkShouldCare: string;
  whyMembersShouldCare: string;
  ecosystemImpact: { target: SparkEcosystemTarget; summary: string }[];
};

export type OpportunityOutsideTheBox = {
  unexpectedApplications: string[];
  industriesDoingBetter: string[];
  ideasToBorrow: string[];
  futurePossibilities: string[];
  secondOrderEffects: string[];
  potentialRisks: string[];
  questionsWorthExploring: string[];
};

export type OpportunityValueMetrics = {
  revenueOpportunity: OpportunityImpactLevel;
  memberImpact: OpportunityImpactLevel;
  founderTimeSavedHours: number;
  implementationDifficulty: OpportunityEffortLevel;
  strategicValue: OpportunityImpactLevel;
  competitiveAdvantage: OpportunityImpactLevel;
  automationPotential: OpportunityImpactLevel;
  confidence: OpportunityConfidence;
};

export type OpportunityBoardPerspective = {
  id: OpportunityBoardPerspectiveId;
  label: string;
  summary: string;
  stance: string;
};

export type OpportunityPrepKind =
  | "mission"
  | "cursor-prompt"
  | "development-roadmap"
  | "workshop"
  | "course"
  | "marketing-plan"
  | "postcraft-campaign"
  | "ghl-workflow"
  | "executive-brief"
  | "decision-comparison";

export type OpportunityPrepOffer = {
  id: string;
  kind: OpportunityPrepKind;
  label: string;
  description: string;
  status: "draft";
};

export type BusinessOpportunity = {
  id: string;
  name: string;
  typeId: OpportunityTypeId;
  typeLabel: string;
  executiveSummary: string;
  whyExists: string;
  evidence: OpportunityEvidence[];
  confidence: OpportunityConfidence;
  confidenceRationale: string;
  potentialImpact: OpportunityImpactLevel;
  estimatedEffort: OpportunityEffortLevel;
  estimatedTimeWeeks: number;
  estimatedRevenue: string;
  estimatedMemberImpact: OpportunityImpactLevel;
  strategicImportance: OpportunityImpactLevel;
  automationPotential: OpportunityImpactLevel;
  relatedMissions: string[];
  relatedProducts: string[];
  relatedResearch: string[];
  relatedExecutiveQuestions: string[];
  relatedCustomerProblems: string[];
  whyNow: OpportunityWhyNow;
  soWhat: OpportunitySoWhat;
  sources: OpportunitySourceKind[];
  recommendation: OpportunityRecommendation;
  recommendationRationale: string;
  ifIgnored: string;
  boardPerspectives?: OpportunityBoardPerspective[];
  boardRecommendation?: string;
  outsideTheBox: OpportunityOutsideTheBox;
  valueMetrics: OpportunityValueMetrics;
  prepOffers: OpportunityPrepOffer[];
  /** Display bucket */
  bucket:
    | "todays-biggest"
    | "emerging"
    | "quick-win"
    | "long-term"
    | "competitive-threat"
    | "watching";
  rankScore: number;
};

export type OpportunityDiscoveryOverview = {
  product: "founder";
  generatedAt: string;
  todaysBiggest: BusinessOpportunity;
  emerging: BusinessOpportunity[];
  quickWins: BusinessOpportunity[];
  longTerm: BusinessOpportunity[];
  competitiveThreats: BusinessOpportunity[];
  watching: BusinessOpportunity[];
  principle: string;
};

export type OpportunityType = {
  id: OpportunityTypeId;
  label: string;
};

export type OpportunityCategory =
  | "product"
  | "revenue"
  | "marketing"
  | "workshop"
  | "course"
  | "feature"
  | "automation"
  | "ai"
  | "technology"
  | "customer"
  | "community"
  | "partnership"
  | "brand"
  | "operational";

export type OpportunityExecutiveFilter =
  | "high-impact"
  | "quick-win"
  | "long-term-bet"
  | "needs-research"
  | "watch"
  | "ignore";

/** Executive Discovery Engine — continuous executive discovery department. */

export type DiscoveryEngineCategory =
  | "new-business-opportunities"
  | "emerging-customer-needs"
  | "competitive-risks"
  | "product-ideas"
  | "feature-improvements"
  | "research-opportunities"
  | "marketing-opportunities"
  | "automation-opportunities"
  | "partnership-opportunities"
  | "revenue-opportunities"
  | "learning-opportunities"
  | "operational-improvements"
  | "founder-productivity"
  | "adhd-insights"
  | "technology-advances"
  | "future-trends"
  | "unexpected-connections"
  | "executive-warnings";

export type DiscoveryConfidence = "high" | "medium" | "low" | "exploratory";

export type DiscoveryUrgency = "now" | "soon" | "watch" | "low";

export type DiscoveryActionKind =
  | "build"
  | "research"
  | "prototype"
  | "monitor"
  | "ignore"
  | "teach"
  | "archive";

export type DiscoveryPrepKind =
  | "mission"
  | "executive-builder"
  | "simulation"
  | "cursor-prompt"
  | "research-brief"
  | "postcraft-campaign"
  | "marketing-strategy"
  | "workshop"
  | "course"
  | "executive-brief"
  | "decision-comparison";

export type DiscoveryPrepOffer = {
  id: string;
  kind: DiscoveryPrepKind;
  label: string;
  description: string;
  status: "draft";
};

export type DiscoveryPathways = {
  missions: string[];
  products: string[];
  research: string[];
  decisions: string[];
  members: string[];
  marketing: string[];
  automation: string[];
  playbooks: string[];
  lessons: string[];
};

export type DiscoveryBoardPerspective = {
  id: string;
  label: string;
  insight: string;
  opportunity: string;
  concern: string;
};

export type ExecutiveRecommendation = {
  myRecommendation: string;
  alternativeOptions: string[];
  tradeoffs: string;
  implementationIdeas: string;
  preparedNextSteps: string[];
};

export type DiscoveryFinding = {
  id: string;
  category: DiscoveryEngineCategory;
  headline: string;
  summary: string;
  whyImportant: string;
  whyToday: string;
  whyNotSixMonthsAgo: string;
  helpsSpark: string;
  helpsMembers: string;
  helpsShari: string;
  ifIgnored: string;
  confidence: DiscoveryConfidence;
  evidence: string[];
  recommendedAction: DiscoveryActionKind;
  recommendedActionWhy: string;
  pathways: DiscoveryPathways;
  boardPerspectives: DiscoveryBoardPerspective[];
  boardSummary: {
    mostImportantInsight: string;
    strongestOpportunity: string;
    greatestConcern: string;
    recommendedAction: string;
  };
  executiveRecommendation: ExecutiveRecommendation;
  prepOffers: DiscoveryPrepOffer[];
  learningNote: string;
  relatedRelationshipDiscoveryId?: string;
  sources: string[];
};

export type DiscoveryEngineFounderAlert = {
  id: string;
  findingId: string;
  title: string;
  whatWasDiscovered: string;
  whyItMatters: string;
  evidence: string[];
  confidence: DiscoveryConfidence;
  businessImpact: string;
  memberImpact: string;
  revenueImpact: string;
  timeSavings: string;
  recommendedAction: string;
  suggestedImplementation: string;
  urgency: DiscoveryUrgency;
};

export type DailyDiscoveryBrief = {
  product: "founder";
  overnightMessage: string;
  generatedAt: string;
  topDiscovery: DiscoveryFinding;
  importantFindings: DiscoveryFinding[];
  hiddenOpportunity: DiscoveryFinding;
  potentialRisk: DiscoveryFinding;
  questionWorthExploring: string;
  recommendedAction: DiscoveryFinding;
  founderAlert?: DiscoveryEngineFounderAlert;
};

export type WeeklyDiscoveryReport = {
  product: "founder";
  weekLabel: string;
  generatedAt: string;
  mostImportantDiscoveries: DiscoveryFinding[];
  emergingPatterns: string[];
  customerChanges: string[];
  technologyChanges: string[];
  competitiveChanges: string[];
  businessOpportunities: string[];
  recommendedPriorities: string[];
};

export type MonthlyExecutiveDiscoveryReport = {
  product: "founder";
  monthLabel: string;
  generatedAt: string;
  whatChanged: string[];
  whatSurprisedUs: string[];
  opportunitiesEmerging: string[];
  opportunitiesDisappeared: string[];
  whatSparkShouldBuildNext: string[];
  whatToStopDoing: string[];
  whatToLearn: string[];
  whatToAutomate: string[];
};

export type DiscoveryEngineBootstrap = {
  overnightMessage: string;
  dailyBriefReady: boolean;
  weeklyReportReady: boolean;
  monthlyReportReady: boolean;
  findingCount: number;
  founderAlertCount: number;
  categoriesRepresented: DiscoveryEngineCategory[];
};

export type DiscoveryFindingDetailView = {
  product: "founder";
  finding: DiscoveryFinding;
  founderAlert?: DiscoveryEngineFounderAlert;
  generatedAt: string;
};

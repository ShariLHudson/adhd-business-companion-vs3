/** Executive Relationship Intelligence™ — discovery engine that creates new knowledge. */

export type DiscoveryCategory =
  | "hidden-customer-patterns"
  | "product-relationships"
  | "research-relationships"
  | "marketing-relationships"
  | "revenue-relationships"
  | "mission-relationships"
  | "technology-relationships"
  | "learning-relationships"
  | "content-relationships"
  | "operational-relationships"
  | "automation-opportunities"
  | "executive-decision-patterns"
  | "founder-habits"
  | "community-trends"
  | "business-risks"
  | "competitive-weaknesses"
  | "emerging-opportunities"
  | "unexpected-success-factors";

export type DiscoveryConfidence = "high" | "medium" | "low" | "exploratory";

export type DiscoveryUrgency = "now" | "soon" | "watch" | "low";

export type RecommendedActionKind =
  | "build"
  | "research-further"
  | "prototype"
  | "validate"
  | "watch"
  | "ignore"
  | "teach"
  | "automate"
  | "connect"
  | "archive";

export type DiscoveryPrepKind =
  | "mission"
  | "executive-builder"
  | "research-brief"
  | "executive-brief"
  | "cursor-prompt"
  | "postcraft-campaign"
  | "workshop"
  | "course"
  | "marketing-strategy"
  | "decision-comparison"
  | "simulation";

export type DiscoveryPrepOffer = {
  id: string;
  kind: DiscoveryPrepKind;
  label: string;
  description: string;
  status: "draft";
};

export type ButterflyStep = {
  id: string;
  label: string;
  summary: string;
  nodeId?: string;
};

export type DiscoveryBoardPerspective = {
  id: string;
  label: string;
  insight: string;
  opportunity: string;
  concern: string;
};

export type EcosystemImpactItem = {
  area: string;
  summary: string;
  direction: "positive" | "neutral" | "negative" | "mixed";
};

export type ExecutiveDiscovery = {
  id: string;
  category: DiscoveryCategory;
  headline: string;
  nobodyAskedOpener: string;
  summary: string;
  whyShariShouldCare: string;
  whyNow: string;
  opportunity: string;
  risk: string;
  evidence: string[];
  confidence: DiscoveryConfidence;
  patternType?: string;
  remindsMeOf?: string;
  butterflyChain?: ButterflyStep[];
  relatedNodeIds: string[];
  relatedMissionIds: string[];
  relatedProductIds: string[];
  boardPerspectives: DiscoveryBoardPerspective[];
  boardSummary: {
    mostImportantInsight: string;
    strongestOpportunity: string;
    greatestConcern: string;
    recommendedAction: string;
  };
  ecosystemImpact: EcosystemImpactItem[];
  recommendedAction: RecommendedActionKind;
  recommendedActionWhy: string;
  prepOffers: DiscoveryPrepOffer[];
  learningNote: string;
};

export type FounderAlert = {
  id: string;
  discoveryId: string;
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
  relatedMissions: string[];
  relatedProducts: string[];
  relatedResearch: string[];
  urgency: DiscoveryUrgency;
};

export type RelationshipIntelligenceBootstrap = {
  featuredDiscoveryId: string;
  founderAlertIds: string[];
  discoveryCount: number;
  categoriesRepresented: DiscoveryCategory[];
};

export type RelationshipIntelligenceSessionView = {
  product: "founder";
  query: string;
  discoveries: ExecutiveDiscovery[];
  founderAlerts: FounderAlert[];
  generatedAt: string;
};

export type DiscoveryDetailView = {
  product: "founder";
  discovery: ExecutiveDiscovery;
  founderAlert?: FounderAlert;
  generatedAt: string;
};

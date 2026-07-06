/** Opportunity Discovery Engine™ — reusable discovery types (no UI). */

export type OpportunityId = string;

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

export type OpportunityStatus =
  | "emerging"
  | "active"
  | "watch"
  | "ignored"
  | "archived";

export type OpportunityExecutiveFilter =
  | "high-impact"
  | "quick-win"
  | "long-term-bet"
  | "needs-research"
  | "watch"
  | "ignore";

export type OpportunitySourceKind =
  | "spark"
  | "research"
  | "mission"
  | "customer-feedback"
  | "companion"
  | "postcraft"
  | "analytics"
  | "decision-vault"
  | "competitor"
  | "technology"
  | "flame"
  | "fire"
  | "ghl"
  | "team-hub";

export type OpportunityRelationshipKind =
  | "supports"
  | "extends"
  | "feeds"
  | "launches-through"
  | "depends-on"
  | "creates-revenue-for"
  | "informs"
  | "mitigates";

export type OpportunityConfidenceLevel = "high" | "medium" | "low" | "exploratory";

export type OpportunityScoreDimensions = {
  /** 0–100 */
  strategicValue: number;
  /** 0–100 */
  revenuePotential: number;
  /** 0–100 */
  founderAlignment: number;
  /** 0–100 */
  customerNeed: number;
  /** 0–100 */
  innovation: number;
  /** 0–100 — higher = harder */
  difficulty: number;
  /** 0–100 */
  urgency: number;
  /** 0–100 */
  confidence: number;
  /** 0–100 */
  missionAlignment: number;
  /** 0–100 */
  marketingValue: number;
};

export type OpportunityScore = OpportunityScoreDimensions & {
  /** Weighted composite 0–100 */
  composite: number;
};

export type OpportunitySource = {
  id: string;
  kind: OpportunitySourceKind;
  label: string;
  summary?: string;
};

export type OpportunitySignal = {
  id: string;
  opportunityId: OpportunityId;
  title: string;
  summary: string;
  source: OpportunitySource;
  observedAt: string;
  strength: number;
};

export type OpportunityEvidence = {
  id: string;
  opportunityId: OpportunityId;
  title: string;
  summary: string;
  source: OpportunitySource;
  weight?: number;
};

export type OpportunityImpact = {
  summary: string;
  effort: "low" | "medium" | "high";
  effortLabel: string;
  beneficiary: string;
};

export type OpportunityMission = {
  missionId: string;
  name: string;
  role: "primary" | "secondary" | "downstream";
  summary: string;
};

export type OpportunityRisk = {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high";
};

export type OpportunityRecommendation = {
  id: string;
  label: string;
  summary: string;
  href?: string;
};

export type OpportunityConfidence = {
  level: OpportunityConfidenceLevel;
  /** 0–100 */
  score: number;
  rationale: string;
};

export type OpportunityRelationship = {
  id: string;
  fromOpportunityId: OpportunityId;
  toOpportunityId: OpportunityId;
  relationship: OpportunityRelationshipKind;
  summary: string;
};

export type OpportunityExecutiveReasoning = {
  whyItMatters: string;
  whyNow: string;
  whoBenefits: string;
  missionBenefit: string;
  nextStep: string;
  potentialImpact: string;
  potentialEffort: string;
};

export type Opportunity = {
  id: OpportunityId;
  title: string;
  summary: string;
  category: OpportunityCategory;
  status: OpportunityStatus;
  score: OpportunityScore;
  confidence: OpportunityConfidence;
  impact: OpportunityImpact;
  reasoning: OpportunityExecutiveReasoning;
  missionIds: string[];
  missions: OpportunityMission[];
  signalIds: string[];
  evidenceIds: string[];
  recommendationIds: string[];
  riskIds: string[];
  tags: string[];
  discoveredAt: string;
  updatedAt: string;
};

export type DiscoveredOpportunity = Opportunity & {
  signals: OpportunitySignal[];
  evidence: OpportunityEvidence[];
  recommendations: OpportunityRecommendation[];
  risks: OpportunityRisk[];
};

export type OpportunityGroup = {
  id: string;
  label: string;
  filter: OpportunityExecutiveFilter | OpportunityCategory;
  opportunities: DiscoveredOpportunity[];
};

export type OpportunityExecutiveSummary = {
  headline: string;
  narrative: string;
  topOpportunities: DiscoveredOpportunity[];
  emergingCount: number;
  hiddenCount: number;
  quickWinCount: number;
  strategicBetCount: number;
  generatedAt: string;
};

export type OpportunityDiscoveryFilter = {
  category?: OpportunityCategory;
  missionId?: string;
  status?: OpportunityStatus;
  executiveFilter?: OpportunityExecutiveFilter;
  minComposite?: number;
};

/** Executive Judgment Engine — final layer before Founder speaks. */

export type JudgmentScoreDimension =
  | "impact"
  | "urgency"
  | "founder-energy"
  | "customer-value"
  | "revenue-potential"
  | "mission-alignment"
  | "research-confidence"
  | "strategic-value"
  | "long-term-value"
  | "automation-potential"
  | "complexity"
  | "dependencies"
  | "learning-opportunity"
  | "competitive-advantage"
  | "attention-cost";

export type ScorecardDimension =
  | "immediate-value"
  | "future-value"
  | "risk"
  | "difficulty"
  | "time"
  | "money"
  | "founder-energy"
  | "customer-benefit"
  | "innovation"
  | "learning"
  | "reusability"
  | "automation"
  | "confidence";

export type JudgmentConfidence = "high" | "medium" | "low" | "exploratory";

export type WhyNotReasonKind =
  | "not-recommended"
  | "postponed"
  | "rejected"
  | "needs-evidence"
  | "too-early"
  | "no-longer-valuable";

export type DisciplineKind =
  | "stop"
  | "delay"
  | "delegate"
  | "archive"
  | "simplify"
  | "focus";

export type JudgmentPrepKind =
  | "mission"
  | "executive-builder"
  | "simulation"
  | "cursor-prompt"
  | "postcraft-campaign"
  | "ghl-workflow"
  | "executive-brief";

export type JudgmentPrepOffer = {
  id: string;
  kind: JudgmentPrepKind;
  label: string;
  description: string;
  status: "draft";
};

export type JudgmentScore = {
  dimension: JudgmentScoreDimension;
  label: string;
  score: number;
  explanation: string;
};

export type ScorecardEntry = {
  dimension: ScorecardDimension;
  label: string;
  rating: "high" | "medium" | "low";
  summary: string;
};

export type ExecutiveReasoning = {
  evidence: string[];
  assumptions: string[];
  tradeoffs: string;
  alternatives: string[];
  confidence: JudgmentConfidence;
  risks: string[];
};

export type ShariLens = {
  currentEnergy: string;
  currentMission: string;
  currentWorkload: string;
  currentPriorities: string;
  longTermVision: string;
  personalStrengths: string;
  businessSeason: string;
  fitSummary: string;
};

export type WhyNotEntry = {
  id: string;
  kind: WhyNotReasonKind;
  title: string;
  summary: string;
  relatedRecommendationId?: string;
};

export type DisciplineRecommendation = {
  id: string;
  kind: DisciplineKind;
  title: string;
  summary: string;
  why: string;
};

export type NotNowItem = {
  id: string;
  title: string;
  summary: string;
  whyNotNow: string;
  revisitWhen: string;
  relatedIds: string[];
};

export type LearningLoopEntry = {
  id: string;
  recommendation: string;
  decision: string;
  outcome: string;
  lesson: string;
};

export type JudgmentRecommendation = {
  id: string;
  headline: string;
  summary: string;
  whyThis: string;
  whyNow: string;
  whyNotOthers: string;
  ifIgnored: string;
  whatWouldChange: string;
  compositeScore: number;
  scores: JudgmentScore[];
  scorecard: ScorecardEntry[];
  reasoning: ExecutiveReasoning;
  shariLens: ShariLens;
  discipline?: DisciplineRecommendation;
  prepOffers: JudgmentPrepOffer[];
  relatedDiscoveryIds: string[];
  relatedOpportunityIds: string[];
  relatedMissionIds: string[];
  learningNote: string;
};

export type RecommendationPyramid = {
  primary: JudgmentRecommendation;
  supporting: JudgmentRecommendation[];
  canWait: JudgmentRecommendation[];
};

export type ExecutiveJudgmentView = {
  product: "founder";
  generatedAt: string;
  principle: string;
  todaysQuestion: string;
  pyramid: RecommendationPyramid;
  whyNot: WhyNotEntry[];
  notNowLibrary: NotNowItem[];
  learningLoop: LearningLoopEntry[];
};

export type JudgmentDetailView = {
  product: "founder";
  recommendation: JudgmentRecommendation;
  generatedAt: string;
};

export type ExecutiveJudgmentBootstrap = {
  principle: string;
  todaysQuestion: string;
  recommendationCount: number;
  notNowCount: number;
  primaryHeadline: string;
};

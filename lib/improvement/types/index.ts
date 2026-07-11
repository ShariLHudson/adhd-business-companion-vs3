/** Continuous Improvement Engine — evidence-based ecosystem learning (not analytics, not AI). */

export type ImprovementCategory =
  | "founder_experience"
  | "customer_experience"
  | "adhd_experience"
  | "companion"
  | "founder_studio"
  | "postcraft"
  | "team_hub"
  | "marketing"
  | "research"
  | "products"
  | "operations"
  | "automation"
  | "onboarding"
  | "documentation"
  | "content"
  | "courses"
  | "workshops"
  | "estate_experience"
  | "listening_rooms"
  | "revenue"
  | "business_model";

export type ImprovementPriority = "critical" | "high" | "medium" | "low" | "watch";

export type ImprovementAction =
  | "ignore"
  | "monitor"
  | "improve"
  | "redesign"
  | "automate"
  | "delegate"
  | "remove";

export type ImprovementReviewKind =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "mission"
  | "product"
  | "launch"
  | "workshop"
  | "marketing"
  | "founder";

export type ImprovementEvidence = {
  id: string;
  label: string;
  summary: string;
  source: string;
  institutionalMemoryId?: string;
  graphNodeId?: string;
};

export type ImprovementROI = {
  timeSavedHours: number;
  revenueImpact: string;
  founderEnergy: "restores" | "neutral" | "drains";
  customerSatisfaction: "high" | "medium" | "low" | "unknown";
  complexityReduction: number;
  implementationCostHours: number;
  strategicValue: number;
  score: number;
  summary: string;
};

export type ImprovementRelationship = {
  id: string;
  fromId: string;
  toId: string;
  kind: "caused_by" | "supports" | "blocks" | "learned_from" | "experiment_for" | "validates";
  reason: string;
};

export type ImprovementOutcome = {
  id: string;
  improvementId: string;
  whatWorked: string[];
  whatDidNotWork: string[];
  lessons: string[];
  recordedAt: string;
  institutionalMemoryId?: string;
};

export type ImprovementHistory = {
  id: string;
  improvementId: string;
  event: string;
  occurredAt: string;
  actor?: string;
};

export type ImprovementMetric = {
  id: string;
  label: string;
  category: ImprovementCategory;
  baseline: string;
  target: string;
  current?: string;
  unit: string;
};

export type ImprovementObservation = {
  id: string;
  category: ImprovementCategory;
  whatIsHappening: string;
  whyIsHappening: string;
  evidence: ImprovementEvidence[];
  rootCause: string;
  symptoms: string[];
  possibleSolutions: string[];
  recommendedSolution: string;
  suggestedAction: ImprovementAction;
  missionId?: string;
  observedAt: string;
};

export type ImprovementOpportunity = {
  id: string;
  title: string;
  category: ImprovementCategory;
  summary: string;
  whatIsHappening: string;
  whyIsHappening: string;
  rootCause: string;
  evidence: ImprovementEvidence[];
  expectedImpact: string;
  estimatedEffortHours: number;
  roi: ImprovementROI;
  suggestedAction: ImprovementAction;
  priority: ImprovementPriority;
  missionId?: string;
  slowingDown?: string;
  shouldSimplify?: string;
  shouldEliminate?: string;
  shouldAutomate?: string;
  shouldDelegate?: string;
};

export type ImprovementRecommendation = {
  id: string;
  opportunityId: string;
  title: string;
  recommendation: string;
  action: ImprovementAction;
  priority: ImprovementPriority;
  roi: ImprovementROI;
  evidenceIds: string[];
  rationale: string;
};

export type ImprovementExperiment = {
  id: string;
  title: string;
  category: ImprovementCategory;
  hypothesis: string;
  change: string;
  status: "planned" | "running" | "completed" | "cancelled";
  result?: string;
  lessons: string[];
  recommendation?: string;
  startedAt?: string;
  completedAt?: string;
  missionId?: string;
  institutionalMemoryId?: string;
};

export type ImprovementReview = {
  id: string;
  kind: ImprovementReviewKind;
  title: string;
  periodLabel: string;
  generatedAt: string;
  whatWorked: string[];
  whatDidNotWork: string[];
  slowingDown: string[];
  simplify: string[];
  eliminate: string[];
  automate: string[];
  delegate: string[];
  improve: string[];
  opportunityIds: string[];
  experimentIds: string[];
  missionId?: string;
};

export type ImprovementReviewInput = {
  kind: ImprovementReviewKind;
  missionId?: string;
  periodLabel?: string;
};

export type CompareResultsInput = {
  experimentIdA: string;
  experimentIdB?: string;
};

export type CompareResultsOutput = {
  experimentA: ImprovementExperiment;
  experimentB?: ImprovementExperiment;
  sharedLessons: string[];
  recommendation: string;
};

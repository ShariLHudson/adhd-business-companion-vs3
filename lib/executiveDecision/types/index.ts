/** Executive Decision Lifecycle — operating system for executive decisions. */

export type DecisionLifecycleStep =
  | "discover"
  | "understand"
  | "generate_options"
  | "compare"
  | "recommend"
  | "plan"
  | "prepare"
  | "approval"
  | "implement"
  | "monitor"
  | "review"
  | "remember";

export type DecisionPriority = "critical" | "high" | "medium" | "low";

export type DecisionConfidenceLevel = "high" | "medium" | "low" | "exploratory";

export type DecisionConfidence = {
  level: DecisionConfidenceLevel;
  score: number;
  rationale: string;
};

export type RiskLevel = "low" | "medium" | "high";

export type DecisionCriteria = {
  benefits: string;
  risks: string;
  difficulty: number;
  cost: string;
  time: string;
  strategicValue: number;
  revenuePotential: number;
  customerImpact: number;
  missionAlignment: number;
  founderEnergyRequired: number;
  implementationComplexity: number;
};

export type DecisionOption = {
  id: string;
  label: string;
  summary: string;
  pros: string[];
  cons: string[];
  estimatedEffort: string;
  estimatedImpact: string;
  estimatedRevenue: string;
  estimatedCustomerValue: string;
  estimatedImplementationTime: string;
  riskLevel: RiskLevel;
  founderEffort: string;
  confidence: DecisionConfidence;
  criteria: DecisionCriteria;
};

export type DecisionComparison = {
  decisionId: string;
  options: DecisionOption[];
  comparedAt: string;
  summary: string;
};

export type DecisionRecommendation = {
  decisionId: string;
  recommendedOptionId: string;
  headline: string;
  why: string;
  whatHappensIfNothing: string;
  whatToPrepare: string[];
  visualSparkStudiosPerspective: string;
  plainEnglishSummary: string[];
  confidence: DecisionConfidence;
  recommendedAt: string;
};

export type ImplementationTask = {
  id: string;
  title: string;
  owner: string;
  status: "draft" | "ready" | "blocked" | "complete";
  module: "founder" | "postcraft" | "ghl" | "team-hub" | "cursor" | "companion";
  notes: string;
};

export type ImplementationPlan = {
  decisionId: string;
  phases: { id: string; name: string; summary: string; tasks: ImplementationTask[] }[];
  cursorPlan?: string;
  postCraftDrafts?: string[];
  workshopOutline?: string;
  courseOutline?: string;
  status: "draft" | "awaiting_approval" | "approved" | "in_progress" | "complete";
};

export type DecisionPlan = {
  decisionId: string;
  missionUpdates: string[];
  roadmapUpdates: string[];
  developmentPhases: string[];
  researchTasks: string[];
  contentIdeas: string[];
  marketingIdeas: string[];
  automationOpportunities: string[];
  teamWork: string[];
  status: "draft";
};

export type ApprovalStage = {
  id: string;
  label: string;
  status: "pending" | "approved" | "declined" | "deferred";
  requiresExplicitApproval: boolean;
  blockedActions: string[];
  allowedActions: string[];
  notes: string;
};

export type ProgressCheckpoint = {
  id: string;
  label: string;
  dueAt?: string;
  status: "upcoming" | "on_track" | "at_risk" | "blocked" | "complete";
  notes: string;
};

export type SuccessMetric = {
  id: string;
  label: string;
  target: string;
  current?: string;
  source: string;
};

export type MonitoringPlan = {
  decisionId: string;
  checkpoints: ProgressCheckpoint[];
  metrics: SuccessMetric[];
  watchFor: string[];
  recommendationTriggers: string[];
};

export type RiskAssessment = {
  id: string;
  risk: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  mitigation: string;
};

export type FallbackPlan = {
  id: string;
  trigger: string;
  action: string;
  owner: string;
};

export type DecisionOutcome = {
  decisionId: string;
  succeeded: boolean | "partial";
  summary: string;
  surprises: string[];
  wouldDoAgain: boolean | "partial";
  changesNextTime: string[];
  recordedAt: string;
};

export type LessonLearned = {
  id: string;
  decisionId: string;
  lesson: string;
  repeat: boolean;
};

export type ExecutiveReview = {
  decisionId: string;
  worked: boolean | "partial";
  surprised: string[];
  wouldDoAgain: boolean | "partial";
  changeNextTime: string[];
  narrative: string[];
  reviewedAt: string;
};

export type DecisionRelationship = {
  id: string;
  fromDecisionId: string;
  toDecisionId: string;
  kind: "depends_on" | "informed_by" | "supersedes" | "related_to" | "blocks";
  reason: string;
  graphEdgeId?: string;
};

export type ExecutiveDecision = {
  id: string;
  title: string;
  question: string;
  category: "mission" | "product" | "workshop" | "marketing" | "automation" | "executive" | "hiring" | "launch";
  missionId?: string;
  productId?: string;
  opportunity: string;
  whyItMatters: string;
  currentStep: DecisionLifecycleStep;
  completedSteps: DecisionLifecycleStep[];
  priority: DecisionPriority;
  confidence: DecisionConfidence;
  options: DecisionOption[];
  comparison?: DecisionComparison;
  recommendation?: DecisionRecommendation;
  plan?: DecisionPlan;
  implementation?: ImplementationPlan;
  approvalStages: ApprovalStage[];
  monitoring?: MonitoringPlan;
  risks: RiskAssessment[];
  fallbacks: FallbackPlan[];
  outcome?: DecisionOutcome;
  lessons: LessonLearned[];
  review?: ExecutiveReview;
  relationships: DecisionRelationship[];
  institutionalMemoryId?: string;
  graphNodeIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateDecisionInput = {
  title: string;
  question: string;
  category: ExecutiveDecision["category"];
  missionId?: string;
  productId?: string;
  opportunity: string;
  whyItMatters: string;
  priority?: DecisionPriority;
  options?: DecisionOption[];
  graphNodeIds?: string[];
};

export type FounderGuidance = {
  whatHappened: string;
  whyCare: string;
  options: string[];
  recommendation: string;
  why: string;
  ifNothing: string;
  prepare: string[];
  visualSparkStudios: string;
};

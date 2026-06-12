// Founder Ecosystem — Phase 17 Multi-Founder Intelligence types.
// Aggregated, anonymized patterns only. Never expose individual PII.

import type { BusinessStage, FounderFocus } from "../journey/journeyTypes";
import type {
  DecisionStyle,
  FocusStyle,
  PlanningStyle,
  WorkStyle,
} from "../companion/companionTypes";
import type { ID, ISODateString } from "../models";

export type DecisionSpeed = "fast" | "moderate" | "slow";
export type ExecutionStyle = "batch" | "steady" | "sprint" | "reactive";

/** Privacy-safe behavioral snapshot — no names, titles, or raw messages. */
export type AnonymizedFounderSnapshot = {
  anonId: string;
  stage: BusinessStage;
  primaryFocus: FounderFocus | null;
  workStyle: WorkStyle | null;
  decisionStyle: DecisionStyle | null;
  decisionSpeed: DecisionSpeed;
  executionStyle: ExecutionStyle;
  focusStyle: FocusStyle | null;
  planningStyle: PlanningStyle | null;
  momentumDrivers: string[];
  successfulWorkflows: string[];
  tasksCompletedPerWeek: number;
  focusSessionsPerWeek: number;
  projectsAdvancedPerWeek: number;
  timeBlocksCompletedPerWeek: number;
  documentsCreatedPerWeek: number;
  projectsCompleted: number;
  recommendationAcceptanceRate: number;
  recommendationsDismissed: number;
  ignoredRecommendations: number;
  completedActions: number;
  projectStallRate: number;
  documentCompletionRate: number;
  automationExecutionRate: number;
  productivityHabits: string[];
  overwhelmTriggers: string[];
  challengeTags: string[];
  progressScore: number;
};

export type RecurringChallenge = {
  tag: string;
  founderCount: number;
  prevalence: number;
  typicalStage: BusinessStage | null;
};

export type HighImpactBehavior = {
  habit: string;
  correlatedProgressLift: number;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  framing: string;
};

export type RareEffectiveStrategy = {
  strategy: string;
  adoptionRate: number;
  avgProgressAmongAdopters: number;
  framing: string;
};

export type NetworkAggregate = {
  generatedAt: ISODateString;
  cohortSize: number;
  stageDistribution: Partial<Record<BusinessStage, number>>;
  recurringChallenges: RecurringChallenge[];
  highImpactBehaviors: HighImpactBehavior[];
  rareStrategies: RareEffectiveStrategy[];
  commonProductivityHabits: { habit: string; rate: number }[];
  commonOverwhelmTriggers: { trigger: string; rate: number }[];
  commonMomentumDrivers: { driver: string; rate: number }[];
  stageSpecificRisks: { stage: BusinessStage; risk: string; prevalence: number }[];
  stageSpecificOpportunities: { stage: BusinessStage; opportunity: string; prevalence: number }[];
  lowCompletionWarningSigns: { sign: string; rate: number }[];
};

export type StageBenchmark = {
  stage: BusinessStage;
  sampleSize: number;
  tasksCompletedPerWeek: { median: number; average: number; p25: number; p75: number };
  focusSessionsPerWeek: { median: number; average: number; p25: number; p75: number };
  projectsAdvancedPerWeek: { median: number; average: number };
  timeBlocksCompletedPerWeek: { median: number; average: number };
  recommendationAcceptanceRate: { median: number };
  documentCompletionRate: { median: number };
  projectStallRate: { median: number };
  automationExecutionRate: { median: number };
};

export type FounderBenchmarkComparison = {
  stage: BusinessStage;
  metric: string;
  founderValue: number;
  benchmarkMedian: number;
  deviation: "below" | "near" | "above";
  coachingNote: string;
};

export type NetworkInsight = {
  id: ID;
  category:
    | "challenge"
    | "behavior"
    | "strategy"
    | "benchmark"
    | "momentum"
    | "overwhelm"
    | "risk"
    | "opportunity"
    | "warning";
  headline: string;
  body: string;
  probability: number;
  confidence: "low" | "medium" | "high";
};

export type NetworkRecommendation = {
  id: ID;
  strategy: string;
  rationale: string;
  expectedLift: number | null;
  probability: number;
  framing: string;
};

export type OptimizedRecommendation = NetworkRecommendation & {
  whyShown: string;
  supportsDigitalTwin: true;
  doesNotOverrideTwin: true;
};

export type MultiFounderNetwork = {
  aggregate: NetworkAggregate;
  benchmarks: StageBenchmark[];
  cohortReady: boolean;
  /** Internal only — not for UI export. */
  _snapshots: AnonymizedFounderSnapshot[];
};

/** Safe dashboard / API response — no individual founder data. */
export type SafeNetworkSummary = {
  benchmarks: StageBenchmark[] | { message: string };
  networkInsights: NetworkInsight[];
  recommendedExperiments: OptimizedRecommendation[];
  stageSpecificRisks: NetworkAggregate["stageSpecificRisks"];
  stageSpecificOpportunities: NetworkAggregate["stageSpecificOpportunities"];
  cohortReady: boolean;
};

export type NetworkEnrichment = {
  snapshot: AnonymizedFounderSnapshot;
  insights: NetworkInsight[];
  recommendations: OptimizedRecommendation[];
  benchmarks: FounderBenchmarkComparison[];
  guidanceHints: string[];
  benchmarkSummary: string | null;
  cohortReady: boolean;
};

export type NetworkDashboard = {
  cohortReady: boolean;
  benchmarkMessage: string | null;
  networkBenchmarks: { label: string; value: string }[];
  stageTrends: { stage: BusinessStage; trend: string }[];
  commonMomentumDrivers: string[];
  commonOverwhelmTriggers: string[];
  recommendedExperiments: OptimizedRecommendation[];
  stageSpecificRisks: NetworkAggregate["stageSpecificRisks"];
  stageSpecificOpportunities: NetworkAggregate["stageSpecificOpportunities"];
  insights: NetworkInsight[];
};

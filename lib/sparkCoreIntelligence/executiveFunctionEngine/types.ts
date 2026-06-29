/**
 * Spark Executive Function Engine™ — Core types.
 * @see spark-intelligence-foundation/20-spark-executive-function-engine.md
 *
 * Quiet support across every conversation — not a separate ADHD feature.
 */

import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

export const SPARK_EXECUTIVE_FUNCTION_ENGINE_VERSION = "1.0" as const;

export type ExecutiveFunctionSignal =
  | "overwhelm"
  | "avoidance"
  | "uncertainty"
  | "task_paralysis"
  | "decision_fatigue"
  | "low_energy"
  | "interruption_recovery"
  | "returning_after_absence"
  | "ready_to_start"
  | "calm";

export type ExecutiveFunctionState = {
  primary: ExecutiveFunctionSignal;
  secondary: ExecutiveFunctionSignal[];
  capacity: "depleted" | "limited" | "available";
  needsSimplification: boolean;
  needsEmpathyFirst: boolean;
  singleRecommendationOnly: boolean;
};

export type EFCognitiveLoadScore = {
  value: number;
  level: CognitiveLoadLevel;
  drivers: string[];
  reduceBeforeAsking: boolean;
};

export type EffortEstimate = {
  minutes: number;
  phrase: string;
  gentle: true;
};

export type TinyNextStep = {
  action: string;
  effort?: EffortEstimate;
  whyStartHere: string;
};

export type TaskPhase = {
  id: string;
  label: string;
  tinyFirstAction: string;
};

export type TaskBreakdown = {
  projectLabel: string;
  phases: TaskPhase[];
  startWith: string;
};

export type OpenLoop = {
  id: string;
  label: string;
  lastTouchedAt?: string;
  source: "conversation" | "project" | "task" | "guild" | "adventure";
};

export type DecisionOption = {
  id: string;
  label: string;
  pros?: string;
};

export type DecisionReduction = {
  question: string;
  recommendedOptionId: string;
  rationale: string;
  tradeoffNote?: string;
};

export type RestartRecovery = {
  welcomeCopy: string;
  whereWeLeftOff: string;
  suggestedResume: TinyNextStep;
  guiltFree: true;
};

export type EFResponsePattern =
  | "empathy_then_one_step"
  | "phased_project"
  | "starting_point"
  | "welcome_back"
  | "single_recommendation"
  | "gentle_encouragement";

export type WorkspaceIntegrationHint =
  | "conversation"
  | "memory"
  | "momentum"
  | "guild"
  | "create"
  | "strategy"
  | "focus"
  | "greenhouse";

export type ExecutiveFunctionInput = {
  turnId: string;
  threadId: string;
  userId?: string;
  memberMessage: string;
  emotionalState?: string;
  /** Days since last activity — triggers welcome-back flow */
  daysSinceLastActivity?: number | null;
  openLoops?: OpenLoop[];
  lastObjectiveSummary?: string;
  lastSparkMessage?: string;
  activeWorkspace?: WorkspaceIntegrationHint;
  activeRoom?: EstateRoomId;
  externalCognitiveLoad?: CognitiveLoadLevel | null;
};

export type ExecutiveFunctionGuidance = {
  pattern: EFResponsePattern;
  composeGuidance: string;
  memberFacingLead?: string;
  nextStep: TinyNextStep;
  taskBreakdown?: TaskBreakdown;
  decisionReduction?: DecisionReduction;
  restartRecovery?: RestartRecovery;
  effortEstimate?: EffortEstimate;
  avoid: string[];
  integrationHints: WorkspaceIntegrationHint[];
};

export type ExecutiveFunctionResult = {
  state: ExecutiveFunctionState;
  cognitiveLoad: EFCognitiveLoadScore;
  guidance: ExecutiveFunctionGuidance;
  openLoopsRecalled: OpenLoop[];
  engineVersion: typeof SPARK_EXECUTIVE_FUNCTION_ENGINE_VERSION;
};

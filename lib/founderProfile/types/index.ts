/** Executive Digital Twin™ — Founder Profile Intelligence (observation only, no labels). */

export type FounderObservationKind =
  | "working_hours"
  | "creative_energy"
  | "decision_pattern"
  | "research_habit"
  | "writing_habit"
  | "planning_habit"
  | "launch_habit"
  | "restart_habit"
  | "hyperfocus"
  | "context_switching"
  | "meeting_preference"
  | "review_habit"
  | "workflow_preference"
  | "workflow_avoidance"
  | "success_signal"
  | "friction_signal";

export type FounderPatternCategory =
  | "preference"
  | "habit"
  | "success"
  | "friction"
  | "energy"
  | "workflow";

export type FounderPatternTrend = "strengthening" | "stable" | "fading";

export type FounderFrictionKind =
  | "delay"
  | "interruption"
  | "unfinished"
  | "context_switch"
  | "decision_fatigue"
  | "manual_work";

export type FounderSuccessOutcome =
  | "revenue"
  | "momentum"
  | "energy"
  | "finished_projects"
  | "customer_delight"
  | "founder_confidence";

export type FounderAdaptationCategory =
  | "best_work_today"
  | "best_time_to_create"
  | "best_mission"
  | "best_environment"
  | "best_thinking_room"
  | "best_implementation";

export type FounderObservation = {
  id: string;
  kind: FounderObservationKind;
  context: string;
  observation: string;
  evidenceCount: number;
  confidence: number;
  firstNoticedAt: string;
  lastNoticedAt: string;
  decayWeight: number;
  source: string;
  missionId?: string;
  outcome?: "positive" | "neutral" | "negative";
};

export type FounderPattern = {
  id: string;
  title: string;
  noticedPhrase: string;
  summary: string;
  evidence: string[];
  confidence: number;
  trend: FounderPatternTrend;
  category: FounderPatternCategory;
  observationKinds: FounderObservationKind[];
};

export type FounderPreference = {
  id: string;
  area: string;
  noticedPhrase: string;
  detail: string;
  confidence: number;
  evolving: boolean;
};

export type FounderFrictionPattern = {
  id: string;
  kind: FounderFrictionKind;
  noticedPhrase: string;
  occurrences: number;
  reduction: string;
  lastSeenAt: string;
};

export type FounderStrength = {
  id: string;
  title: string;
  noticedPhrase: string;
  outcomes: FounderSuccessOutcome[];
  repeatability: number;
  evidence: string[];
};

export type FounderRecommendation = {
  id: string;
  noticedPhrase: string;
  suggestion: string;
  category: FounderAdaptationCategory;
  confidence: number;
  evidencePatternIds: string[];
  architectureOnly: true;
};

export type FounderProfileObserveInput = {
  event: string;
  kind?: FounderObservationKind;
  context?: string;
  missionId?: string;
  source?: string;
  outcome?: "positive" | "neutral" | "negative";
};

export type FounderProfileLearnInput = {
  kind: FounderObservationKind;
  context: string;
  observation: string;
  source?: string;
  missionId?: string;
  outcome?: "positive" | "neutral" | "negative";
};

export type FounderProfileRecommendContext = {
  missionId?: string;
  date?: string;
};

export type FounderProfileView = {
  product: "founder";
  observationCount: number;
  patternCount: number;
  preferences: FounderPreference[];
  patterns: FounderPattern[];
  friction: FounderFrictionPattern[];
  strengths: FounderStrength[];
  recommendations: FounderRecommendation[];
  principles: string[];
};

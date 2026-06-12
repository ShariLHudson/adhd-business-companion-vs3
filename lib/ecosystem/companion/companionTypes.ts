// Founder Ecosystem — Phase 13 Adaptive Companion types.
//
// Shari learns PATTERNS, not just facts: how the founder works, what creates
// momentum, what causes overwhelm, and what support style fits. All derived
// from the event stream. Observational only — never therapeutic/clinical.

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";

export type { Level };

// ---- Style taxonomies ---------------------------------------------------
export type WorkStyle =
  | "visionary"
  | "builder"
  | "implementer"
  | "creator"
  | "strategist"
  | "teacher"
  | "operator";

export type SupportStyle =
  | "encouragement"
  | "direct-action"
  | "brainstorming"
  | "accountability"
  | "planning"
  | "reflection"
  | "education";

export type CommunicationStyle = "concise" | "detailed" | "warm" | "analytical";
export type PlanningStyle = "planner" | "spontaneous" | "brainstorm-first";
export type MotivationStyle = "progress" | "vision" | "accountability" | "novelty";
export type FocusStyle =
  | "morning"
  | "afternoon"
  | "evening"
  | "deep-blocks"
  | "short-bursts";
export type DecisionStyle = "decisive" | "deliberate" | "avoidant" | "collaborative";

export type ScoredTrait<T> = { value: T; score: number; confidence: Level };

// ---- Relationship memory ------------------------------------------------
export type MentionLite = { label: string; count: number };
export type RelationshipMemory = {
  frequentProjects: MentionLite[];
  frequentGoals: MentionLite[];
  frequentChallenges: MentionLite[];
  frequentWorkspaces: MentionLite[];
  mostSuccessfulActions: MentionLite[];
};

// ---- Momentum patterns --------------------------------------------------
export type MomentumDriver = {
  factor: string;
  direction: "positive" | "negative";
  weight: number;
  evidence: number;
};
export type MomentumPatterns = {
  positive: MomentumDriver[];
  negative: MomentumDriver[];
  bestTimeOfDay: string | null;
  bestProject: { id: ID; label: string } | null;
};

// ---- Overwhelm patterns -------------------------------------------------
export type OverwhelmTrigger = {
  trigger: string;
  frequency: number;
  severity: Level;
  recoveryMethods: string[];
};
export type OverwhelmPatterns = {
  triggers: OverwhelmTrigger[];
};

// ---- Proactive check-ins ------------------------------------------------
export type CheckInKind =
  | "re-engage"
  | "dormant-project"
  | "momentum"
  | "opportunity"
  | "reflection";

// ---- Founder preferences (explicit + inferred) --------------------------
export type CelebrationLevel = "subtle" | "normal" | "enthusiastic";
export type RecommendationDensity = "minimal" | "balanced" | "detailed";

export type FounderPreferences = {
  proactiveCheckIns: boolean;
  celebrationLevel: CelebrationLevel;
  recommendationDensity: RecommendationDensity;
  defaultWorkspaceBias: string | null;
  prefersSplitView: boolean;
  wantsAccountability: boolean;
};

// ---- Check-in behavior (learned over time; placeholders until events) ---
export type CheckInBehavior = {
  preferredTimes: string[];
  responsiveKinds: CheckInKind[];
  pausedKinds: CheckInKind[];
  maxPerDay: number;
  lastEngagedAt: ISODateString | null;
  notes: string[];
};

// ---- Companion profile --------------------------------------------------
export type CompanionProfile = {
  founderId: ID;
  generatedAt: ISODateString;
  workStyles: ScoredTrait<WorkStyle>[];
  supportStyle: ScoredTrait<SupportStyle>;
  supportStyles: ScoredTrait<SupportStyle>[];
  communicationStyle: ScoredTrait<CommunicationStyle>;
  planningStyle: ScoredTrait<PlanningStyle>;
  motivationStyle: ScoredTrait<MotivationStyle>;
  focusStyle: ScoredTrait<FocusStyle>;
  decisionStyle: ScoredTrait<DecisionStyle>;
  preferences: FounderPreferences;
  relationshipMemory: RelationshipMemory;
  observations: string[];
  momentumPatterns: MomentumPatterns | null;
  overwhelmPatterns: OverwhelmPatterns | null;
  checkInBehavior: CheckInBehavior;
};

export const EMPTY_MOMENTUM_PATTERNS: MomentumPatterns = {
  positive: [],
  negative: [],
  bestTimeOfDay: null,
  bestProject: null,
};

export const EMPTY_OVERWHELM_PATTERNS: OverwhelmPatterns = {
  triggers: [],
};

export type CompanionProfileContext = Pick<
  CompanionProfile,
  | "founderId"
  | "supportStyle"
  | "focusStyle"
  | "decisionStyle"
  | "preferences"
  | "momentumPatterns"
  | "overwhelmPatterns"
  | "checkInBehavior"
  | "observations"
>;

// ---- Adaptive response --------------------------------------------------
export type ResponseTone = "warm" | "direct" | "reflective";
export type ResponseAdaptation = {
  supportStyle: SupportStyle;
  tone: ResponseTone;
  askMoreQuestions: boolean;
  giveNextStepFast: boolean;
  followUpMore: boolean;
  guidance: string[];
  exampleOpeners: string[];
};

export type CheckIn = {
  id: ID;
  kind: CheckInKind;
  message: string;
  relatedId?: ID;
  tone: "supportive";
};

// ---- Celebrations -------------------------------------------------------
export type CelebrationKind = "streak" | "completion" | "milestone" | "focus";
export type Celebration = {
  id: ID;
  kind: CelebrationKind;
  message: string;
  ts: ISODateString | null;
};

// ---- Companion (founder support) score — INTERNAL ONLY ------------------
export type FounderSupportScore = {
  engagement: number;
  momentum: number;
  capacity: number;
  progress: number;
  consistency: number;
  overall: number;
  internalOnly: true;
};

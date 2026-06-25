/**
 * Companion Brain™ — page-agnostic reasoning types.
 * Memory remembers. The Brain understands. Pages express.
 */

export type DayMode =
  | "normal"
  | "survival"
  | "family"
  | "health"
  | "celebration"
  | "hyperfocus"
  | "recovery"
  | "creative";

export type CycleState =
  | "reasoning"
  | "orienting"
  | "confirming"
  | "living"
  | "protected";

export type OrientationType =
  | "full"
  | "short"
  | "minimal"
  | "orientationOnly"
  | "none";

export type PermissionDisplay = "full" | "collapsedSummary" | "none";

export type ProposalKind = "action" | "explorationBlock";

export type CooldownKind = "celebration" | "survival";

export type EnergyLevel = "low" | "medium" | "medium-high" | "high";

export type MotivationLevel =
  | "low"
  | "steady"
  | "scattered"
  | "overwhelmed"
  | "focused"
  | "excited";

export type RegisteredPredictionKind =
  | "momentum"
  | "permission-exclusion"
  | "capacity"
  | "confidence";

export type LearningSignalKind =
  | "prediction-accuracy"
  | "momentum-success"
  | "permission-accuracy"
  | "decision-confidence"
  | "planning-confidence"
  | "follow-through-trend"
  | "recovery-speed"
  | "overwhelm-reduction"
  | "capability-growth"
  | "confidence-growth";

export type JudgmentProfile = {
  weights: Record<string, number>;
  evidenceCount: number;
  lastAdjustedAt: string;
};

/** Judgment state only — never user goals or commitments. */
export type CompanionBrainState = {
  version: number;
  lastReflectedDayKey: string;
  updatedAt: string;
  timingJudgment: JudgmentProfile;
  priorityJudgment: JudgmentProfile;
  permissionJudgment: JudgmentProfile;
  momentumJudgment: JudgmentProfile;
  confidenceJudgment: JudgmentProfile;
  relationshipJudgment: JudgmentProfile;
  calibration: {
    predictionAccuracyEwma: number;
    momentumSuccessEwma: number;
    permissionAccuracyEwma: number;
  };
  activeCooldowns?: Partial<Record<CooldownKind, string>>;
};

export type CapacitySnapshot = {
  energy: EnergyLevel;
  motivation: MotivationLevel;
  vibe?: "foggy" | "focused" | "creative" | "scattered";
  healthNote?: string;
  fresh: boolean;
};

/** Generic candidate the brain may propose — not page-specific. */
export type CompanionCandidate = {
  id: string;
  label: string;
  source: string;
  themes: string[];
  estimatedMinutes?: number;
  unlockScore: number;
  fitScore: number;
};

/**
 * Layer 1 input — assembled from memory systems by the experience client.
 * The brain never imports page modules.
 */
export type CompanionMemorySnapshot = {
  dayKey: string;
  capacity: CapacitySnapshot;
  brainState: CompanionBrainState;
  candidates: CompanionCandidate[];
  exclusions: string[];
  suppressTopics: string[];
  captureLoad?: {
    thoughtCount?: number;
    recentCaptures?: string[];
  };
  sessionFlags?: {
    hyperfocusActive?: boolean;
    hyperfocusMinutes?: number;
    userDeclaredSurvival?: boolean;
  };
  yesterdaySummary?: string;
  calendarHighlights?: string[];
  focusAreas?: string[];
  activeCooldowns?: CooldownKind[];
  milestoneEvidence?: string[];
};

export type AssembledContext = {
  dayKey: string;
  dayMode: DayMode;
  cycleState: CycleState;
  capacity: CapacitySnapshot;
  brainState: CompanionBrainState;
  candidates: CompanionCandidate[];
  exclusions: string[];
  suppressTopics: string[];
  orientationType: OrientationType;
  orientationOnly: boolean;
  permissionDisplay: PermissionDisplay;
  overloadDetected: boolean;
  captureLoad?: CompanionMemorySnapshot["captureLoad"];
  milestoneEvidence?: string[];
  focusAreas?: string[];
};

export type MomentumAction = {
  candidateId: string | null;
  label: string | null;
  kind: "action" | "explorationBlock" | "none";
  durationMinutes?: number;
  reason: string;
};

export type ConfidenceOpportunity = {
  candidateId: string | null;
  label: string | null;
  encouragement: string | null;
  evidenceRefs: string[];
  reason: string;
};

export type PermissionDecision = {
  excluded: Array<{ label: string; reason: string }>;
  display: PermissionDisplay;
  summaryCount: number;
};

export type CompanionProposal = {
  id: string;
  kind: ProposalKind;
  label: string;
  reason: string;
  durationMinutes?: number;
};

export type RegisteredPrediction = {
  id: string;
  kind: RegisteredPredictionKind;
  claim: string;
  expiresAt: string;
};

export type OrientationResult = {
  type: OrientationType;
  paragraphs: string[];
  invitation: string | null;
  journeyLine: string | null;
};

export type CompanionJudgmentResult = {
  dayMode: DayMode;
  cycleState: CycleState;
  orientation: OrientationResult;
  momentum: MomentumAction;
  confidence: ConfidenceOpportunity;
  permission: PermissionDecision;
  proposals: CompanionProposal[];
  predictions: RegisteredPrediction[];
  orientationOnly: boolean;
  permissionDisplay: PermissionDisplay;
  materializeAllowed: boolean;
  auditPassed: boolean;
  auditNotes: string[];
};

export type ReflectionInput = {
  dayKey: string;
  memory: CompanionMemorySnapshot;
  judgment: CompanionJudgmentResult;
  outcomes: {
    proposalsOffered: number;
    proposalsConfirmed: number;
    momentumCompleted: boolean;
    userOverrides: number;
    userDeclaredSurvival: boolean;
  };
};

export type JudgmentPatch = {
  target: string;
  path: string;
  delta: number;
  reason: string;
  signalIds: string[];
};

export type LearningSignal = {
  id: string;
  kind: LearningSignalKind;
  dayKey: string;
  at: string;
  direction: "positive" | "neutral" | "negative";
  magnitude: 0 | 1 | 2 | 3;
  summary: string;
};

export type ReflectionResult = {
  dayKey: string;
  reflectedAt: string;
  surprises: string[];
  judgmentPatches: JudgmentPatch[];
  signals: LearningSignal[];
  brainState: CompanionBrainState;
};

export type ReasoningCycleResult = {
  assembled: AssembledContext;
  judgment: CompanionJudgmentResult;
};

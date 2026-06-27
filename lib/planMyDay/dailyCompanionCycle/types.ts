/**
 * Plan My Day — re-exports Companion Brain types for backward compatibility.
 * New code should import from @/lib/companionBrain.
 */

export type {
  DayMode,
  CycleState,
  OrientationType,
  PermissionDisplay,
  CooldownKind,
  LearningSignalKind,
  CompanionBrainState,
  JudgmentProfile,
  RegisteredPrediction,
  JudgmentPatch,
} from "@/lib/companionBrain";

/** @deprecated Use CompanionJudgmentResult from companionBrain via client */
export type DailyReasoningResult = {
  dayKey: string;
  generatedAt: string;
  dayMode: import("@/lib/companionBrain").DayMode;
  cycleState: import("@/lib/companionBrain").CycleState;
  orientationType: import("@/lib/companionBrain").OrientationType;
  orientationOnly: boolean;
  permissionDisplay: import("@/lib/companionBrain").PermissionDisplay;
  brainSnapshotId: string;
  predictions: import("@/lib/companionBrain").RegisteredPrediction[];
  proposalCount: number;
  explorationBlockCount: number;
  materializeAllowed: boolean;
};

export type DailyReflectionRecord = {
  dayKey: string;
  reflectedAt: string;
  judgmentPatches: import("@/lib/companionBrain").JudgmentPatch[];
  signalEmissions: import("@/lib/companionBrain").LearningSignalKind[];
};

export type ExplorationBlockProposal = {
  kind: "explorationBlock";
  id: string;
  label: string;
  durationMinutes: number;
  purpose: string;
};

export type MomentumBehavior =
  | "anchorRequired"
  | "anchorOptional"
  | "anchorNone"
  | "explorationBlock";

export type ConfidenceBehavior =
  | "pairedWithMomentum"
  | "evidenceEncouragement"
  | "orientationOnly"
  | "boundaryHonor"
  | "none";

export type ProposalKind = "task" | "explorationBlock";

export type RegisteredPredictionKind =
  | "momentum"
  | "permission-exclusion"
  | "capacity"
  | "confidence";

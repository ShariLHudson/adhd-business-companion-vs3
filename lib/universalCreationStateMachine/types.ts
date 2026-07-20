/**
 * 061 — Universal Creation State Machine types.
 */

export const UNIVERSAL_CREATION_STATES = [
  "idea",
  "discovery",
  "foundation",
  "planning",
  "building",
  "review",
  "ready",
  "executing",
  "completed",
  "growth",
  "archive",
  "reuse",
] as const;

export type UniversalCreationState =
  (typeof UNIVERSAL_CREATION_STATES)[number];

/** Member-facing labels — never expose internal architecture. */
export const UNIVERSAL_CREATION_STATE_LABEL: Record<
  UniversalCreationState,
  string
> = {
  idea: "Idea",
  discovery: "Discovery",
  foundation: "Foundation",
  planning: "Planning",
  building: "Building",
  review: "Review",
  ready: "Ready",
  executing: "In progress",
  completed: "Completed",
  growth: "Growth",
  archive: "Saved",
  reuse: "Reuse",
};

export type StateTransitionReason =
  | "confidence"
  | "dependencies"
  | "readiness"
  | "completion"
  | "user_decision"
  | "pause"
  | "resume"
  | "reverse"
  | "derived";

export type UniversalCreationStateSnapshot = {
  state: UniversalCreationState;
  label: string;
  previousState: UniversalCreationState | null;
  nextLikelyState: UniversalCreationState | null;
  blocked: boolean;
  blockReason: string | null;
  /** Internal — never show */
  transitionReason: StateTransitionReason;
  /** Recommendation profile key for 060 */
  recommendationProfile: UniversalCreationState;
  paused: boolean;
};

export type CreationStateMemory = {
  state: UniversalCreationState;
  startedAt: string;
  completedAt: string | null;
  pausedAt: string | null;
  history: {
    state: UniversalCreationState;
    at: string;
    reason: StateTransitionReason;
  }[];
};

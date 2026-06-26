import type { RealityEmotionalTone } from "@/lib/arrivalExperience/types";

export type RestraintInteractionKind =
  | "spoken_line"
  | "question"
  | "room_recommendation"
  | "memory_mention"
  | "curiosity_probe"
  | "performance_display"
  | "planning_nudge"
  | "celebration_redirect";

export type RestraintCheckId =
  | "necessary"
  | "kind"
  | "right_time"
  | "not_too_much"
  | "shari_would_say"
  | "reduces_stress"
  | "no_pressure"
  | "silence_better";

export type RestraintCheck = {
  id: RestraintCheckId;
  passed: boolean;
  reason?: string;
};

export type RestraintVerdict = {
  allowed: boolean;
  /** Original content when allowed; null when suppressed. */
  content: string | null;
  checks: RestraintCheck[];
  /** Primary reason when suppressed — hospitality, not failure. */
  reason: string | null;
};

export type RestraintContext = {
  kind: RestraintInteractionKind;
  tone?: RealityEmotionalTone;
  userMessage?: string;
  returnIntervalDays?: number | null;
  reconnectionTurns?: number;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  isFirstMeeting?: boolean;
  presencePreferSilence?: boolean;
  userExpressedNeed?: boolean;
  fromContinueResolution?: boolean;
};

export type RestraintEvaluation = {
  greeting: RestraintVerdict;
  invite: RestraintVerdict;
};

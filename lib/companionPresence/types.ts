/**
 * Companion Presence™ — real photography, context-aware, felt not animated.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import type { CompanionPhotoContext } from "@/lib/companionPhotoLibrary";
import type { AppSection } from "@/lib/companionUi";
import type { CompanionHomeState } from "@/lib/arrivalIntelligence/homeState";
import type { RecognitionMoment } from "@/lib/recognition/types";
import type { RecoveryLevel } from "@/lib/recovery-intelligence/types";
import type { ShariImageState } from "@/lib/shariImageState";
import type { ClearMyMindPresencePhase } from "./clearMyMindPresence";

/** Authentic companion moments — maps to curated real photography over time. */
export type CompanionPresenceExpression =
  | "warm_welcome"
  | "listening"
  | "thoughtful"
  | "curious"
  | "encouraging"
  | "celebrating"
  | "calm_reassurance"
  | "reflecting"
  | "planning_together"
  | "quiet_presence"
  | "focused"
  | "teaching";

/** Subtle motion only — never spinner-like or attention-seeking. */
export type CompanionAnimationState = "still" | "thinking" | "listening";

export type CompanionSpeechBubbleState = "default" | "thinking" | "listening";

export type CompanionPresenceInput = {
  now?: Date;
  compact?: boolean;
  calmHome?: boolean;
  homeState?: CompanionHomeState | null;
  workspacePanel?: AppSection | null;
  workspaceActiveBeside?: boolean;
  emotion?: EmotionalState;
  /** Shari is preparing a response — maintain eye contact, no image rotation. */
  isThinking?: boolean;
  userBirthday?: { month: number; day: number } | null;
  recognitionMoment?: RecognitionMoment | null;
  recoveryLevel?: RecoveryLevel | null;
  focusMode?: boolean;
  recognitionWin?: boolean;
  /** ISO date — app anniversary detection. */
  memberSince?: string | null;
  /** Clear My Mind™ journey phase — overrides workspace mapping when set. */
  clearMyMindPhase?: ClearMyMindPresencePhase | null;
};

export type CompanionPresenceResult = {
  photoContext: CompanionPhotoContext;
  expression: CompanionPresenceExpression;
  animationState: CompanionAnimationState;
  speechBubbleState: CompanionSpeechBubbleState;
  shariImageState: ShariImageState;
  /** Gentle home rotation only — never during thinking. */
  rotate: boolean;
  reason: string;
  thinkingMessage: string | null;
};

export type CompanionPresenceResolved = CompanionPresenceResult & {
  src: string;
};

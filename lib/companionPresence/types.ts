/**
 * Companion Presence™ — real photography, context-aware, felt not animated.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import type { CompanionPhotoContext, CompanionPresenceWorkspace } from "@/lib/companionPhotoLibrary";
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

export type CompanionPresenceSurface =
  | "chat-welcome"
  | "chat-returning"
  | "morning-presence"
  | "flexible-planning"
  | "today-reality"
  | "clear-my-mind"
  | "sign-in"
  | "default";

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
  /** Rotate photo on each entry to Clear My Mind™ or My Thoughts™. */
  presenceWorkspace?: CompanionPresenceWorkspace | null;
  /** Increment when the user enters/re-enters a presence workspace. */
  workspaceEntryKey?: number;
  /** Stable surface id — day-persistent portrait selection without flicker. */
  presenceSurface?: CompanionPresenceSurface;
  /** Approved library image id — overrides rotation when set. */
  presenceImageId?: string | null;
  /** Full welcome photograph instead of circular portrait. */
  welcomePhotograph?: boolean;
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

/**
 * Spark Companion V4 — consolidated runtime types.
 */

import type { SparkPrimaryIntent } from "./sparkDecisionEngine/types";
import type { SparkDecisionEngineDecision } from "./sparkDecisionEngine/types";

/** Single canonical role model — all legacy role systems map here. */
export type SparkCanonicalRole =
  | "BUILD"
  | "THINK"
  | "SUPPORT"
  | "TEACH"
  | "EXPLORE"
  | "LISTEN"
  | "CHALLENGE";

export type SparkRuntimeMode =
  | "stay_chat"
  | "ask_clarify"
  | "route_estate"
  | "build"
  | "teach"
  | "support"
  | "explore"
  | "friction_menu";

export type SparkConversationDepth =
  | "emotional_first"
  | "task_first"
  | "balanced";

export type SparkCompanionSessionContext = {
  isReturning?: boolean;
  trustEstablished?: boolean;
  currentRoom?: string | null;
  activeWorkflow?: string | null;
  activeDocument?: string | null;
  pendingNavigationChoices?: boolean;
  pendingConciergeChoices?: boolean;
};

export type SparkCompanionHintInput = SparkCompanionSessionContext & {
  userText: string;
  memberDislikesConflict?: boolean;
  hasSolutionReady?: boolean;
  taskHelpReady?: boolean;
  overwhelmed?: boolean;
  momentumActive?: boolean;
  currentTurn?: number;
  placeId?: string | null;
};

export type SparkRuntimeAction = {
  decision: SparkDecisionEngineDecision;
  canonicalRole: SparkCanonicalRole;
  primaryIntent: SparkPrimaryIntent;
  runtimeMode: SparkRuntimeMode;
  depth: SparkConversationDepth;
  suppressEmotionalCoaching: boolean;
  suppressTaskLayer: boolean;
  suppressDiscoveryAutoRoute: boolean;
  allowFrictionFirst: boolean;
  constitutionSnippet: string | null;
  /** Compact operational hint for frictionless / kernel layers */
  operationalHint: string;
};

export type MapDecisionToRuntimeActionInput = SparkCompanionSessionContext & {
  userText: string;
  overwhelmed?: boolean;
  momentumActive?: boolean;
  placeId?: string | null;
  /** Pre-computed decision — skips re-evaluation when provided */
  decision?: SparkDecisionEngineDecision;
};

export type SparkCompanionPromptMetrics = {
  systemPromptChars: number;
  systemPromptSections: number;
  consolidatedBlockChars: number;
  perTurnHintChars: number;
  perTurnHintSections: number;
};

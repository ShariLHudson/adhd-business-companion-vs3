/**
 * Momentum Builder™ Estate Room — canonical types (V1 shell).
 * Public room for forward motion; strategies are invisible engine fuel.
 *
 * @see docs/MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md
 */

import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";

/** Five orchestration layers — never merge into one runtime component. */
export type MomentumBuilderLayer =
  | "conversation"
  | "hidden_strategy"
  | "momentum_intelligence"
  | "guided_practice"
  | "todays_path";

/** Member energy — discovered in conversation, not assumed. */
export type MomentumRoomEnergy = "low" | "medium" | "high" | "unknown";

/** Roadblocks™ (formerly obstacles). */
export type MomentumRoadblock = {
  id: string;
  label: string;
  kind?: "internal" | "external" | "unclear";
};

/** First Step™ (formerly next tiny step). */
export type TodaysPathFirstStep = {
  id: string;
  label: string;
  estimatedMinutes?: number;
  rationale?: string;
};

/** Easy Win™ (formerly quick win). */
export type TodaysPathEasyWin = {
  id: string;
  label: string;
  estimatedMinutes?: number;
};

/** Focus Session™ (formerly deep work). */
export type TodaysPathFocusSession = {
  id: string;
  label: string;
  durationMinutes?: number;
};

/** Layer 1 output — conversation discovery only. */
export type MomentumConversationDiscovery = {
  rawMemberText: string;
  emotionalState?: string;
  availableTimeMinutes?: number;
  energy: MomentumRoomEnergy;
  priorities: string[];
  roadblocks: MomentumRoadblock[];
  activeProjectIds: string[];
  discoveredAt: string;
};

/** Layer 2 output — internal only; never render strategy names in UI. */
export type HiddenStrategySelection = {
  strategyId: string | null;
  situationId: string | null;
  confidence: "low" | "medium" | "high";
  approach:
    | "clarify"
    | "prioritize"
    | "break_down"
    | "decide"
    | "recover"
    | "celebrate";
};

/** Layer 3 — optional guided practice offer (permission required). */
export type GuidedPracticeOffer = {
  builderId: string;
  domain: string;
  permissionPrompt: string;
  reason: string;
};

/** Layer 2 + 3 combined orchestration record (persisted in Today's Path hooks). */
export type MomentumRoomOrchestration = {
  hiddenStrategy: HiddenStrategySelection;
  guidedPracticeOffer: GuidedPracticeOffer | null;
  orchestratedAt: string;
};

/** Today's Path™ — member-facing outcome (formerly daily momentum plan). */
export type TodaysPath = IntelligenceReadyHooks & {
  kind: "todays-path";
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Calm headline — not a task list title. */
  headline: string;
  firstStep: TodaysPathFirstStep | null;
  easyWins: TodaysPathEasyWin[];
  focusSessions: TodaysPathFocusSession[];
  roadblocks: MomentumRoadblock[];
  /** Tomorrow Starts Here™ */
  tomorrowStartsHere: string | null;
  discovery: MomentumConversationDiscovery;
  orchestration: MomentumRoomOrchestration;
  status: "draft" | "active" | "completed" | "archived";
};

export type TodaysPathDraftInput = {
  discovery: MomentumConversationDiscovery;
  orchestration: MomentumRoomOrchestration;
  headline?: string;
};

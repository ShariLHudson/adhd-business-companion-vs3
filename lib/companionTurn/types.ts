/**
 * Companion turn pipeline — classify → execute one path → finalize.
 *
 * Member-visible routing kinds (MENU folds into CHAT local delivery).
 */

import type { EstateActionExecutionPlan } from "@/lib/estate/decisionKernel";
import type { PrimaryTurnDecision } from "@/lib/conversation/primaryTurnClassifier";

export type CompanionIntentKind = "CHAT" | "NAVIGATE" | "CAPTURE" | "AUDIO";

export type ClassifiedCompanionIntent = {
  kind: CompanionIntentKind;
  userText: string;
  /** Set when this turn should not call the chat API (menus, corrections, noop). */
  plan: EstateActionExecutionPlan;
};

export type ClassifyCompanionIntentInput = {
  userText: string;
  lastAssistantText?: string | null;
  currentPlaceId?: string | null;
  /** Live AppSection — syncs room awareness before already-here decisions. */
  activeSection?: string | null;
  soundscapeCategoryId?: string | null;
  /** Coaching / SOP / how-to — skip estate kernel, chat API only. */
  forceChat?: boolean;
  /** Primary-turn verdict — Fix A uses this to suppress estate room routing on clear goal/help turns. */
  primaryTurn?: PrimaryTurnDecision | null;
};

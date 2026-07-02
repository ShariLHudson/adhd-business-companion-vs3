/**
 * Companion turn pipeline — classify → execute one path → finalize.
 *
 * Member-visible routing kinds (MENU folds into CHAT local delivery).
 */

import type { EstateActionExecutionPlan } from "@/lib/estate/decisionKernel";

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
  soundscapeCategoryId?: string | null;
  /** Coaching / SOP / how-to — skip estate kernel, chat API only. */
  forceChat?: boolean;
};

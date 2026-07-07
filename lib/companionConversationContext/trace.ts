/**
 * Debug trace for companion turn resolution.
 */

import type { CompanionTurnTrace } from "./types";
import type { CompanionActiveSession } from "@/lib/companionIntelligence/activeSession";
import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";

export function buildCompanionTurnTrace(input: {
  userMessage: string;
  activeSession: CompanionActiveSession;
  currentLocation: string | null;
  pendingAction: CompanionTurnTrace["pendingAction"];
  lastDiscussedEntity: string | null;
  emotionalPivotDetected: boolean;
  detectedPrimaryGoal?: ConversationGoal | null;
  winningCapability?: EstateCapability | null;
  blockedCapabilities?: EstateCapability[];
  finalResponseReason: string;
}): CompanionTurnTrace {
  return {
    userMessage: input.userMessage,
    activeSession: input.activeSession,
    currentLocation: input.currentLocation,
    pendingAction: input.pendingAction,
    lastDiscussedEntity: input.lastDiscussedEntity,
    emotionalPivotDetected: input.emotionalPivotDetected,
    detectedPrimaryGoal: input.detectedPrimaryGoal ?? null,
    winningCapability: input.winningCapability ?? null,
    blockedCapabilities: input.blockedCapabilities ?? [],
    finalResponseReason: input.finalResponseReason,
  };
}

export function logCompanionTurnTrace(trace: CompanionTurnTrace): void {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
    return;
  }
  if (typeof console === "undefined") return;
  console.debug("[companion-context]", trace);
}

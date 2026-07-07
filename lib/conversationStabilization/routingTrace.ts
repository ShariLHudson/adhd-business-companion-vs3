/**
 * Dev-only routing trace for stabilization debugging.
 */

import type { ArbitrationResult } from "./arbitration";
import type { ConversationGoal } from "./goalClassifier";
import type { EstateCapability } from "./capabilityTypes";

export type RoutingTraceCandidate = {
  capability: EstateCapability;
  eligible: boolean;
  confidence: string;
  reason: string;
};

export type RoutingTracePayload = {
  userMessage: string;
  detectedGoal: ConversationGoal;
  activeSession: ArbitrationResult["activeSession"];
  winningCapability: EstateCapability | null;
  winningSubsystem: string | null;
  candidates: RoutingTraceCandidate[];
  blockedSubsystems: string[];
  reason: string;
  fastPath: boolean;
};

declare global {
  interface Window {
    __sparkConversationPipelineLog?: RoutingTracePayload[];
  }
}

export function logConversationRoutingTrace(payload: RoutingTracePayload): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CONVERSATION_ROUTING_TRACE !== "1"
  ) {
    return;
  }
  console.info("[conversation-routing-pipeline]", payload);
  if (typeof window !== "undefined") {
    const log = window.__sparkConversationPipelineLog ?? [];
    log.push(payload);
    window.__sparkConversationPipelineLog = log.slice(-40);
  }
}

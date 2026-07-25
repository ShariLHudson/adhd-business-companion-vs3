/**
 * Development-safe ownership diagnostics — never member-facing.
 */

import type {
  ConversationExperienceOwner,
  OwnershipAction,
  OwnershipCleanupTarget,
  OwnershipTraceEvent,
} from "./types";

export type OwnershipApplyTraceInput = {
  conversationId: string | null;
  ownerBefore: ConversationExperienceOwner;
  claims: Array<{ owner: ConversationExperienceOwner; source: string; priority: number }>;
  selectedOwner: ConversationExperienceOwner;
  rejectedOwners: ConversationExperienceOwner[];
  action: OwnershipAction;
  reason: string;
  cleanup: OwnershipCleanupTarget[];
  ownerAfter: ConversationExperienceOwner;
};

const MAX_TRACE = 40;
const traceBuffer: OwnershipTraceEvent[] = [];

function ownershipTracingEnabled(): boolean {
  if (typeof process === "undefined") return false;
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_OWNERSHIP_TRACE === "1";
  }
  return process.env.NEXT_PUBLIC_OWNERSHIP_TRACE !== "0";
}

export function logOwnershipTrace(input: OwnershipApplyTraceInput): void {
  const event: OwnershipTraceEvent = {
    at: new Date().toISOString(),
    conversationId: input.conversationId,
    ownerBefore: input.ownerBefore,
    claims: input.claims,
    selectedOwner: input.selectedOwner,
    rejectedOwners: input.rejectedOwners,
    action: input.action,
    reason: input.reason,
    cleanup: input.cleanup,
    ownerAfter: input.ownerAfter,
  };

  traceBuffer.push(event);
  if (traceBuffer.length > MAX_TRACE) traceBuffer.shift();

  if (!ownershipTracingEnabled()) return;
  // Identifiers + reason codes only — no message bodies.
  console.info("[conversation-ownership]", {
    conversationId: event.conversationId,
    ownerBefore: event.ownerBefore,
    selectedOwner: event.selectedOwner,
    rejectedOwners: event.rejectedOwners,
    action: event.action,
    reason: event.reason,
    cleanup: event.cleanup,
    ownerAfter: event.ownerAfter,
    claimSources: event.claims.map((c) => `${c.source}:${c.owner}`),
  });
}

export function getOwnershipTraceForTests(): OwnershipTraceEvent[] {
  return [...traceBuffer];
}

export function clearOwnershipTraceForTests(): void {
  traceBuffer.length = 0;
}

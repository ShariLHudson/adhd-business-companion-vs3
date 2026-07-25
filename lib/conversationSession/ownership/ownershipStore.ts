/**
 * Phase 3 — Read/write authoritative ownership on ConversationSession.
 * Prefer claimTurnOwnership for mid-turn writes.
 */

import { getOrCreateConversationSpine, patchConversationSpine } from "../spine";
import type { ConversationOwnership, ConversationExperienceOwner } from "./types";
import { claimTurnOwnership } from "./claimTurnOwnership";

export function getSpineOwnership(): ConversationOwnership | null {
  return getOrCreateConversationSpine().ownership ?? null;
}

export function getSpineOwnerKind(): ConversationExperienceOwner {
  return getSpineOwnership()?.owner ?? "none";
}

/** Low-level write — prefer claimTurnOwnership from feature code. */
export function setSpineOwnership(
  ownership: ConversationOwnership | null,
): ConversationOwnership | null {
  patchConversationSpine({ ownership });
  return ownership;
}

export function clearSpineOwnership(reason = "cleared"): void {
  const prior = getSpineOwnership();
  if (!prior || prior.owner === "none") {
    setSpineOwnership(null);
    return;
  }
  const now = new Date().toISOString();
  setSpineOwnership({
    ...prior,
    owner: "none",
    status: "completed",
    reason,
    updatedAt: now,
    expectedReply: undefined,
    continuation: undefined,
  });
}

/**
 * Compatibility wrapper — routes through claimTurnOwnership when a turn gate exists.
 * Use claimTurnOwnership directly from feature handlers.
 */
export function beginSpineOwnership(input: {
  owner: ConversationExperienceOwner;
  reason: string;
  status?: ConversationOwnership["status"];
  workflowId?: string;
  destinationId?: string;
  expectedReply?: ConversationOwnership["expectedReply"];
  continuation?: ConversationOwnership["continuation"];
  sourceTurnId?: string;
}): ConversationOwnership {
  const result = claimTurnOwnership(
    {
      owner: input.owner,
      reason: input.reason,
      status: input.status,
      workflowId: input.workflowId,
      destinationId: input.destinationId,
      expectedReply: input.expectedReply,
      continuation: input.continuation,
      sourceTurnId: input.sourceTurnId,
      clearIncompatible: false,
    },
    { force: true },
  );
  if (result.ok) return result.ownership;

  const now = new Date().toISOString();
  const record: ConversationOwnership = {
    owner: input.owner,
    reason: input.reason,
    status: input.status ?? "active",
    startedAt: now,
    updatedAt: now,
    workflowId: input.workflowId,
    destinationId: input.destinationId,
    expectedReply: input.expectedReply,
    continuation: input.continuation,
    sourceTurnId: input.sourceTurnId,
    claimSources: ["spine"],
  };
  setSpineOwnership(record);
  return record;
}

/**
 * Phase 3 — Mid-turn ownership claim API.
 * Features must not patch ConversationSession.ownership directly.
 */

import {
  getActiveSpineConversationId,
  getOrCreateConversationSpine,
  patchConversationSpine,
} from "../spine";
import { logOwnershipTrace } from "./ownershipTrace";
import { clearCollectionOfferOwnership } from "@/lib/estate/collectionFramework/collectionOfferRelease";
import { clearFrictionlessPending } from "@/lib/frictionlessActionLayer";
import type {
  ConversationExperienceOwner,
  ConversationOwnership,
  OwnershipContinuation,
  OwnershipExpectedReply,
  OwnershipStatus,
} from "./types";

function readOwnership(): ConversationOwnership | null {
  return getOrCreateConversationSpine().ownership ?? null;
}

function writeOwnership(ownership: ConversationOwnership | null): void {
  patchConversationSpine({ ownership });
}

export type ClaimTurnOwnershipInput = {
  owner: ConversationExperienceOwner;
  reason: string;
  status?: OwnershipStatus;
  sourceTurnId?: string;
  workflowId?: string;
  destinationId?: string;
  expectedReply?: OwnershipExpectedReply;
  continuation?: OwnershipContinuation;
  /** When true, clear Collection/win-save/frictionless that conflict. */
  clearIncompatible?: boolean;
};

export type ClaimTurnOwnershipResult =
  | {
      ok: true;
      ownership: ConversationOwnership;
      superseded: ConversationExperienceOwner | null;
    }
  | {
      ok: false;
      reason: string;
      currentOwner: ConversationExperienceOwner;
    };

type TurnClaimGate = {
  turnKey: string;
  claimedBy: ConversationExperienceOwner;
  reason: string;
};

let turnGate: TurnClaimGate | null = null;

/** Call at the start of each user turn (resolver choke point). */
export function beginOwnershipTurnGate(turnKey: string): void {
  turnGate = { turnKey, claimedBy: "none", reason: "turn_open" };
}

export function resetOwnershipTurnGateForTests(): void {
  turnGate = null;
}

export function getOwnershipTurnGateForTests(): TurnClaimGate | null {
  return turnGate ? { ...turnGate } : null;
}

const INCOMPATIBLE_WITH_CREATE: ConversationExperienceOwner[] = [
  "collection_offer",
  "confirmation",
];

function clearIncompatibleForOwner(owner: ConversationExperienceOwner): void {
  if (owner === "create" || owner === "companion" || owner === "none") {
    clearCollectionOfferOwnership();
    clearFrictionlessPending();
  }
  if (owner === "collection_offer") {
    // Collection claim supersedes bare confirmation UX state via expectedReply.
  }
}

/**
 * Sole supported mid-turn write path for ConversationSession.ownership.
 * One successful claim per turnKey; later claims are rejected with diagnostics.
 */
export function claimTurnOwnership(
  input: ClaimTurnOwnershipInput,
  opts?: { turnKey?: string; force?: boolean },
): ClaimTurnOwnershipResult {
  const turnKey =
    opts?.turnKey ??
    `${getActiveSpineConversationId() ?? "none"}:${input.sourceTurnId ?? "mid"}`;

  if (
    turnGate &&
    turnGate.turnKey === turnKey &&
    turnGate.claimedBy !== "none" &&
    turnGate.claimedBy !== input.owner &&
    !opts?.force
  ) {
    logOwnershipTrace({
      conversationId: getActiveSpineConversationId(),
      ownerBefore: readOwnership()?.owner ?? "none",
      claims: [
        {
          owner: input.owner,
          source: "mid_turn_claim_rejected",
          priority: 0,
        },
      ],
      selectedOwner: turnGate.claimedBy,
      rejectedOwners: [input.owner],
      action: "reject_stale_owner",
      reason: `mid_turn_claim_rejected:${turnGate.reason}`,
      cleanup: [],
      ownerAfter: turnGate.claimedBy,
    });
    return {
      ok: false,
      reason: `mid_turn_already_claimed_by_${turnGate.claimedBy}`,
      currentOwner: turnGate.claimedBy,
    };
  }

  if (input.owner === "none") {
    return {
      ok: false,
      reason: "cannot_claim_none",
      currentOwner: readOwnership()?.owner ?? "none",
    };
  }

  const prior = readOwnership();
  const now = new Date().toISOString();

  if (input.clearIncompatible !== false) {
    if (
      INCOMPATIBLE_WITH_CREATE.includes(prior?.owner ?? "none") ||
      input.owner === "create" ||
      input.owner === "companion"
    ) {
      clearIncompatibleForOwner(input.owner);
    }
  }

  const ownership: ConversationOwnership = {
    owner: input.owner,
    reason: input.reason,
    status: input.status ?? "active",
    startedAt:
      prior?.owner === input.owner && prior.startedAt ? prior.startedAt : now,
    updatedAt: now,
    sourceTurnId: input.sourceTurnId ?? prior?.sourceTurnId,
    workflowId: input.workflowId,
    destinationId: input.destinationId,
    expectedReply: input.expectedReply,
    continuation: input.continuation,
    claimSources: ["spine", "mid_turn_claim"],
  };

  writeOwnership(ownership);
  turnGate = {
    turnKey,
    claimedBy: input.owner,
    reason: input.reason,
  };

  logOwnershipTrace({
    conversationId: getActiveSpineConversationId(),
    ownerBefore: prior?.owner ?? "none",
    claims: [
      {
        owner: input.owner,
        source: "mid_turn_claim",
        priority: 100,
      },
    ],
    selectedOwner: input.owner,
    rejectedOwners: [],
    action:
      prior && prior.owner !== input.owner && prior.owner !== "none"
        ? "transfer_owner"
        : "continue_owner",
    reason: input.reason,
    cleanup: input.clearIncompatible === false ? [] : ["confirmation"],
    ownerAfter: input.owner,
  });

  return {
    ok: true,
    ownership,
    superseded:
      prior && prior.owner !== input.owner && prior.owner !== "none"
        ? prior.owner
        : null,
  };
}

/** Release to Companion through the supported API. */
export function releaseTurnOwnership(reason: string, turnKey?: string): void {
  claimTurnOwnership(
    {
      owner: "companion",
      reason,
      status: "active",
      clearIncompatible: true,
    },
    { turnKey, force: true },
  );
}

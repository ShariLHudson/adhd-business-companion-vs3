/**
 * Phase 3B — Map legacy ownership signals into ranked claims.
 *
 * Semantic rule (Part 2):
 * Collection / win-save is the workflow owner.
 * Confirmation is the expected-reply type on that owner — never a competing owner
 * for the same prompt.
 */

import { loadConversationOwnerPointer } from "@/lib/conversationContinuity/ownerStore";
import type { ConversationOwnerKind } from "@/lib/conversationContinuity/types";
import { loadCollectionPendingOffer } from "@/lib/estate/collectionFramework/collectionPendingOffer";
import { loadWinSavePending } from "@/lib/estate/winSavePending";
import { loadUniversalCreationSession } from "@/lib/universalCreation";
import { peekShariConversationThread } from "@/lib/shariAnswerFirst/conversationContinuity";
import { loadIntentWorkflow } from "@/lib/conversationStabilization/intentWorkflowStore";
import { loadFrictionlessPending } from "@/lib/frictionlessActionLayer";
import type { AwaitingUserConfirmationState } from "@/lib/conversationConfirmationGate";
import { getConversationSpine } from "../spine";
import type {
  ConversationExperienceOwner,
  ConversationOwnership,
  OwnershipClaim,
  OwnershipStatus,
} from "./types";

/**
 * Precedence ladder — one owner family per interaction.
 * confirmation is reserved for non-Collection soft offers only.
 */
export const OWNERSHIP_PRIORITY: Record<ConversationExperienceOwner, number> = {
  create: 90,
  collection_offer: 80,
  /** Soft estate/tool offers without Collection/win-save pending. */
  confirmation: 70,
  chamber: 68,
  board: 66,
  continuity_workflow: 64,
  intent_workflow: 55,
  help_thread: 45,
  destination_experience: 40,
  discovery: 35,
  onboarding: 34,
  reminder_management: 33,
  rhythm_management: 32,
  talk_it_out: 30,
  /** Active Topic is metadata — never selected as turn owner. */
  active_topic: 0,
  companion: 10,
  none: 0,
};

export type LegacyOwnershipSnapshot = {
  awaitingConfirmation: AwaitingUserConfirmationState | null;
  talkItOutActive?: boolean;
};

function continuityKindToOwner(
  kind: ConversationOwnerKind,
): ConversationExperienceOwner {
  switch (kind) {
    case "guided_workflow":
    case "artifact":
      return "create";
    case "chamber_specialist":
      return "chamber";
    case "board_director":
    case "board_intake":
    case "board_discussion":
      return "board";
    case "navigation":
      return "destination_experience";
    case "general_chat":
    default:
      return "companion";
  }
}

function claim(
  owner: ConversationExperienceOwner,
  source: OwnershipClaim["source"],
  reason: string,
  status: OwnershipStatus,
  extra?: Partial<OwnershipClaim>,
): OwnershipClaim {
  return {
    owner,
    source,
    reason,
    status,
    priority: OWNERSHIP_PRIORITY[owner],
    ...extra,
  };
}

/**
 * Collect every legacy signal that currently implies ownership.
 * Spine ownership is included as a claim when present (no artificial +5 bonus).
 */
export function collectOwnershipClaims(
  legacy: LegacyOwnershipSnapshot,
): OwnershipClaim[] {
  const claims: OwnershipClaim[] = [];
  const spine = getConversationSpine();
  const collection = loadCollectionPendingOffer();
  const winSave = loadWinSavePending();
  const hasCollectionFamily = Boolean(collection || winSave);

  if (spine?.ownership && spine.ownership.owner !== "none") {
    // Spine is authoritative for its owner — same priority, preferred on tie by source.
    claims.push(
      claim(
        spine.ownership.owner,
        "spine",
        spine.ownership.reason || "spine_ownership",
        spine.ownership.status,
        {
          workflowId: spine.ownership.workflowId,
          destinationId: spine.ownership.destinationId,
          expectedReply: spine.ownership.expectedReply,
          continuation: spine.ownership.continuation,
        },
      ),
    );
  }

  // Collection / win-save = one workflow owner. Confirmation folds into expectedReply.
  if (collection) {
    claims.push(
      claim(
        "collection_offer",
        "collection_pending",
        "collection_pending_offer",
        "awaiting_user",
        {
          destinationId: collection.suggestedRoomId,
          expectedReply: { kind: "confirmation" },
          continuation: {
            kind: "collection_offer",
            roomId: collection.suggestedRoomId,
            offerLine: collection.offerLine.slice(0, 160),
            sourceTurn: collection.offeredAtTurn,
          },
        },
      ),
    );
  }

  if (winSave) {
    claims.push(
      claim(
        "collection_offer",
        "win_save_pending",
        "win_save_pending",
        "awaiting_user",
        {
          expectedReply: {
            kind: "choice",
            allowedValues: ["1", "2", "3", "4"],
          },
          continuation: {
            kind: "win_save",
            offeredAtTurn: winSave.offeredAtTurn,
          },
        },
      ),
    );
  }

  const uc = loadUniversalCreationSession();
  // Create owns the workflow when present (active or parked). Soft confirmation
  // / frictionless must not claim as a rival owner for content-generator.
  const createPresent = Boolean(
    uc &&
      uc.lifecycle !== "exited" &&
      uc.lifecycle !== "completed" &&
      uc.lifecycle !== "abandoned",
  );

  if (uc && createPresent) {
    const parked = uc.lifecycle === "parked" || Boolean(uc.parkedAt);
    claims.push(
      claim(
        "create",
        "universal_creation",
        parked ? "universal_creation_parked" : "universal_creation_session",
        parked ? "paused" : "active",
        {
          workflowId: uc.documentType,
          continuation: {
            kind: "create",
            documentType: uc.documentType,
            phase: uc.phase,
          },
        },
      ),
    );
  }

  // Bare confirmation only when Collection family is NOT pending AND Create
  // is not active/parked.
  if (
    legacy.awaitingConfirmation?.active &&
    !hasCollectionFamily &&
    !createPresent
  ) {
    const frictionless = loadFrictionlessPending();
    claims.push(
      claim(
        "confirmation",
        "awaiting_confirmation",
        "soft_offer_confirmation",
        "awaiting_user",
        {
          destinationId: frictionless?.target,
          expectedReply: { kind: "confirmation" },
          continuation: {
            kind: "confirmation",
            confirmationKind: legacy.awaitingConfirmation.kind,
            offeredAtTurn: legacy.awaitingConfirmation.offeredAtTurn,
          },
        },
      ),
    );
  }

  // Frictionless without Collection family, awaiting ref, or Create workflow.
  const frictionless = loadFrictionlessPending();
  if (
    frictionless &&
    !hasCollectionFamily &&
    !legacy.awaitingConfirmation?.active &&
    !createPresent
  ) {
    claims.push(
      claim(
        "confirmation",
        "frictionless_pending",
        "frictionless_pending",
        "awaiting_user",
        {
          destinationId: frictionless.target,
          expectedReply: { kind: "confirmation" },
        },
      ),
    );
  }

  const continuity = loadConversationOwnerPointer();
  if (continuity?.kind) {
    const owner = continuityKindToOwner(continuity.kind);
    // Only intentional Continuity owners — general_chat is not a claim.
    if (owner === "chamber" || owner === "board" || owner === "create") {
      claims.push(
        claim(
          owner,
          "continuity_owner",
          `continuity_${continuity.kind}`,
          continuity.awaitingAnswer ? "awaiting_user" : "active",
          { workflowId: continuity.id },
        ),
      );
    } else if (owner === "destination_experience") {
      claims.push(
        claim(
          owner,
          "continuity_owner",
          `continuity_${continuity.kind}`,
          "active",
          { workflowId: continuity.id },
        ),
      );
    }
  }

  const help = peekShariConversationThread();
  if (help?.conversationId && help.originalRequest?.trim()) {
    claims.push(
      claim("help_thread", "help_thread", "shari_help_thread", "active", {
        workflowId: help.conversationId,
      }),
    );
  }

  const intent = loadIntentWorkflow();
  if (intent && intent.status === "active") {
    claims.push(
      claim(
        "intent_workflow",
        "intent_workflow",
        "intent_workflow_active",
        "active",
        { workflowId: intent.workflowType ?? intent.artifactType },
      ),
    );
  }

  // Active Topic intentionally omitted — contextual metadata only (see SPINE_CONTRACT).

  if (legacy.talkItOutActive) {
    claims.push(
      claim("talk_it_out", "talk_it_out", "talk_it_out_active", "active"),
    );
  }

  return dedupeCollectionFamilyClaims(claims);
}

/**
 * One Collection-family claim wins; merge win-save + pending + awaiting into one.
 */
function dedupeCollectionFamilyClaims(claims: OwnershipClaim[]): OwnershipClaim[] {
  const collectionClaims = claims.filter((c) => c.owner === "collection_offer");
  if (collectionClaims.length <= 1) return claims;

  const preferred =
    collectionClaims.find((c) => c.source === "spine") ??
    collectionClaims.find((c) => c.source === "win_save_pending") ??
    collectionClaims.find((c) => c.source === "collection_pending") ??
    collectionClaims[0]!;

  const merged: OwnershipClaim = {
    ...preferred,
    reason: "collection_family_merged",
    expectedReply:
      preferred.expectedReply ??
      collectionClaims.find((c) => c.expectedReply)?.expectedReply,
  };

  return [
    ...claims.filter((c) => c.owner !== "collection_offer"),
    merged,
  ];
}

/**
 * Pick the single strongest claim.
 * Tie-break: spine source > higher priority > source name.
 * active_topic never wins.
 */
export function selectAuthoritativeClaim(
  claims: OwnershipClaim[],
): { selected: OwnershipClaim | null; rejected: OwnershipClaim[] } {
  const eligible = claims.filter(
    (c) => c.owner !== "active_topic" && c.priority > 0,
  );
  if (!eligible.length) return { selected: null, rejected: claims };

  const sorted = [...eligible].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.source === "spine" && b.source !== "spine") return -1;
    if (b.source === "spine" && a.source !== "spine") return 1;
    return a.source.localeCompare(b.source);
  });
  const selected = sorted[0]!;
  return {
    selected,
    rejected: [...claims.filter((c) => c !== selected)],
  };
}

export function claimToOwnership(
  claimIn: OwnershipClaim,
  prior?: ConversationOwnership | null,
): ConversationOwnership {
  const now = new Date().toISOString();
  return {
    owner: claimIn.owner,
    reason: claimIn.reason,
    status: claimIn.status,
    startedAt: prior?.owner === claimIn.owner ? prior.startedAt : now,
    updatedAt: now,
    sourceTurnId: prior?.sourceTurnId,
    workflowId: claimIn.workflowId ?? prior?.workflowId,
    destinationId: claimIn.destinationId ?? prior?.destinationId,
    expectedReply: claimIn.expectedReply,
    continuation: claimIn.continuation,
    claimSources: [claimIn.source],
  };
}

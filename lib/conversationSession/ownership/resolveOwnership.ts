/**
 * Phase 3C — Central ownership resolver.
 * One path for continue / release / transfer / companion fallback.
 */

import {
  isExplicitOwnerExit,
  isExplicitTaskChange,
} from "@/lib/conversationContinuity/exitRules";
import { detectWorkflowCorrection } from "@/lib/conversationContinuity/workflowCorrection";
import { classifyTurnRecovery } from "@/lib/shariAnswerFirst/turnRecovery";
import {
  isActiveQuestionAcceptance,
  isPureConfirmationDecline,
} from "@/lib/conversationConfirmationGate";
import { parseWinSaveChoice } from "@/lib/estate/winSaveOffer";
import {
  isExplicitCreateOrRevisionRequest,
  shouldReleasePendingCollectionOwnership,
} from "@/lib/estate/collectionFramework/collectionOfferRelease";
import {
  claimToOwnership,
  collectOwnershipClaims,
  selectAuthoritativeClaim,
  type LegacyOwnershipSnapshot,
} from "./adaptLegacyOwnership";
import { getSpineOwnership } from "./ownershipStore";
import { beginOwnershipTurnGate } from "./claimTurnOwnership";
import type {
  ConversationExperienceOwner,
  ConversationOwnership,
  OwnershipCleanupTarget,
  OwnershipResolution,
} from "./types";

export type ResolveOwnershipInput = {
  userText: string;
  legacy: LegacyOwnershipSnapshot;
  /** When true, Create session exists and correction should stay with create. */
  createSessionActive?: boolean;
};

/** Owners that await a confirmation/choice reply (Collection is the workflow). */
const AWAITING_REPLY_OWNERS: ConversationExperienceOwner[] = [
  "collection_offer",
  "confirmation",
];

function uniqueCleanup(
  items: OwnershipCleanupTarget[],
): OwnershipCleanupTarget[] {
  return [...new Set(items)];
}

function companionOwnership(reason: string): ConversationOwnership {
  const now = new Date().toISOString();
  return {
    owner: "companion",
    reason,
    status: "active",
    startedAt: now,
    updatedAt: now,
    claimSources: ["spine"],
  };
}

/**
 * Resolve ownership for the current user turn before feature handlers run.
 */
export function resolveConversationOwnership(
  input: ResolveOwnershipInput,
): OwnershipResolution {
  const text = input.userText.trim();
  const ownerBefore = getSpineOwnership();
  beginOwnershipTurnGate(
    `${ownerBefore?.sourceTurnId ?? "turn"}:${text.slice(0, 24)}`,
  );
  const claims = collectOwnershipClaims(input.legacy);
  const { selected, rejected } = selectAuthoritativeClaim(claims);
  const currentOwner: ConversationExperienceOwner =
    selected?.owner ?? ownerBefore?.owner ?? "none";

  const recoveryType = classifyTurnRecovery(text);
  const correction = detectWorkflowCorrection(text);
  const collectionRelease = shouldReleasePendingCollectionOwnership(text);
  const explicitExit = isExplicitOwnerExit(text);
  const explicitTask = isExplicitTaskChange(text);
  const explicitRevise = isExplicitCreateOrRevisionRequest(text);
  const pureDecline = isPureConfirmationDecline(text);
  const winSaveChoice = parseWinSaveChoice(text);

  // --- Most Recent Meaning Wins / interrupts ---
  const interruptRelease =
    explicitExit ||
    explicitTask ||
    explicitRevise ||
    collectionRelease.release ||
    (correction.isCorrection && !input.createSessionActive);

  if (interruptRelease && currentOwner !== "none" && currentOwner !== "companion") {
    // Correction / explicit revise while Create is active — clear stale
    // confirmation family, keep Create as owner.
    if (
      input.createSessionActive &&
      !explicitExit &&
      (correction.isCorrection ||
        explicitRevise ||
        collectionRelease.release ||
        currentOwner === "create" ||
        selected?.owner === "create" ||
        AWAITING_REPLY_OWNERS.includes(currentOwner))
    ) {
      const createClaim =
        claims.find((c) => c.owner === "create") ??
        selected ?? {
          owner: "create" as const,
          source: "universal_creation" as const,
          reason: "create_after_stale_release",
          status: "active" as const,
          priority: 90,
        };
      const next = claimToOwnership(
        createClaim.owner === "create"
          ? createClaim
          : {
              owner: "create",
              source: "universal_creation",
              reason: "create_after_stale_release",
              status: "active",
              priority: 90,
            },
        ownerBefore,
      );
      next.reason = correction.isCorrection
        ? "repair_create_on_correction"
        : "create_after_confirmation_override";
      next.status = "active";
      return {
        currentOwner,
        action: correction.isCorrection ? "repair_owner" : "transfer_owner",
        nextOwner: "create",
        reason: next.reason,
        cleanup: uniqueCleanup([
          "confirmation",
          "collection",
          "win_save",
          "seed",
          "frictionless",
        ]),
        confidence: 0.9,
        selectedClaim: selected ?? undefined,
        rejectedClaims: rejected,
        nextOwnership: next,
      };
    }

    const cleanup: OwnershipCleanupTarget[] = [
      "confirmation",
      "collection",
      "win_save",
      "seed",
      "frictionless",
      "continuation",
      "spine_ownership",
    ];
    if (explicitExit) {
      cleanup.push("create");
    }

    const reason = explicitExit
      ? "explicit_owner_exit"
      : explicitTask
        ? "explicit_task_change"
        : explicitRevise
          ? "explicit_create_or_revision"
          : collectionRelease.reason !== "none"
            ? `collection_release_${collectionRelease.reason}`
            : correction.isCorrection
              ? "workflow_correction_release"
              : `turn_recovery_${recoveryType}`;

    return {
      currentOwner,
      action: "release_owner",
      nextOwner: "companion",
      reason,
      cleanup: uniqueCleanup(cleanup),
      confidence: 0.92,
      selectedClaim: selected ?? undefined,
      rejectedClaims: rejected,
      nextOwnership: companionOwnership(reason),
    };
  }

  // --- Decline releases confirmation family ---
  if (pureDecline && AWAITING_REPLY_OWNERS.includes(currentOwner)) {
    return {
      currentOwner,
      action: "release_owner",
      nextOwner: "companion",
      reason: "confirmation_decline",
      cleanup: uniqueCleanup([
        "confirmation",
        "collection",
        "win_save",
        "seed",
        "frictionless",
        "continuation",
        "spine_ownership",
      ]),
      confidence: 0.95,
      selectedClaim: selected ?? undefined,
      rejectedClaims: rejected,
      nextOwnership: companionOwnership("confirmation_decline"),
    };
  }

  // Win-save numbered "not now" (4)
  if (
    winSaveChoice === "not-now" &&
    (currentOwner === "collection_offer" || currentOwner === "confirmation")
  ) {
    return {
      currentOwner,
      action: "release_owner",
      nextOwner: "companion",
      reason: "win_save_not_now",
      cleanup: uniqueCleanup([
        "confirmation",
        "collection",
        "win_save",
        "seed",
        "frictionless",
        "spine_ownership",
      ]),
      confidence: 0.95,
      selectedClaim: selected ?? undefined,
      rejectedClaims: rejected,
      nextOwnership: companionOwnership("win_save_not_now"),
    };
  }

  // Acceptance of confirmation stays with confirmation/collection until open
  // completes. The wider continuation/selection vocabulary (B2 — "go", "next",
  // "continue", "that one", "the first one") binds ONLY here, gated by an
  // active awaiting-reply owner, so it never becomes a global acceptance rule.
  if (
    isActiveQuestionAcceptance(text) &&
    AWAITING_REPLY_OWNERS.includes(currentOwner)
  ) {
    const next = selected
      ? claimToOwnership(selected, ownerBefore)
      : companionOwnership("confirmation_accept_without_claim");
    next.status = "awaiting_user";
    next.reason = "continue_confirmation_accept";
    return {
      currentOwner,
      action: "continue_owner",
      reason: "confirmation_acceptance",
      cleanup: [],
      confidence: 0.88,
      selectedClaim: selected ?? undefined,
      rejectedClaims: rejected,
      nextOwnership: next,
    };
  }

  // No specialized owner → companion
  if (!selected || currentOwner === "none") {
    return {
      currentOwner: "none",
      action: "handle_by_companion",
      nextOwner: "companion",
      reason: "no_specialized_owner",
      cleanup: [],
      confidence: 0.85,
      selectedClaim: undefined,
      rejectedClaims: rejected,
      nextOwnership: companionOwnership("companion_fallback"),
    };
  }

  // Continue selected owner
  const next = claimToOwnership(selected, ownerBefore);
  return {
    currentOwner: selected.owner,
    action: "continue_owner",
    reason: `continue_${selected.source}`,
    cleanup: [],
    confidence: 0.8,
    selectedClaim: selected,
    rejectedClaims: rejected,
    nextOwnership: next,
  };
}

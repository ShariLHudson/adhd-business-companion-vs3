/**
 * Apply OwnershipResolution cleanup + write next ownership to the spine.
 */

import { clearFrictionlessPending } from "@/lib/frictionlessActionLayer";
import { clearCollectionOfferOwnership } from "@/lib/estate/collectionFramework/collectionOfferRelease";
import { clearUniversalCreationSession } from "@/lib/universalCreation";
import { clearIntentWorkflow } from "@/lib/conversationStabilization/intentWorkflowStore";
import { clearShariConversationThread } from "@/lib/shariAnswerFirst/conversationContinuity";
import type { OwnershipCleanupTarget, OwnershipResolution } from "./types";
import { clearSpineOwnership, setSpineOwnership } from "./ownershipStore";
import { logOwnershipTrace, type OwnershipApplyTraceInput } from "./ownershipTrace";

export type ApplyOwnershipHooks = {
  /** Clear React awaitingUserConfirmation (CPC). */
  clearAwaitingConfirmation?: () => void;
  currentTurn?: number;
  conversationId?: string | null;
};

export type ApplyOwnershipTraceContext = {
  ownerBefore?: OwnershipApplyTraceInput["ownerBefore"];
  claims?: OwnershipApplyTraceInput["claims"];
};

function runCleanup(
  targets: OwnershipCleanupTarget[],
  hooks: ApplyOwnershipHooks,
): OwnershipCleanupTarget[] {
  const performed: OwnershipCleanupTarget[] = [];
  for (const target of targets) {
    switch (target) {
      case "confirmation":
        hooks.clearAwaitingConfirmation?.();
        performed.push("confirmation");
        break;
      case "collection":
      case "win_save":
      case "seed":
        // Bundled — Collection release clears offer, win-save, and prefills.
        if (!performed.includes("collection")) {
          clearCollectionOfferOwnership({ currentTurn: hooks.currentTurn });
          performed.push("collection", "win_save", "seed");
        }
        break;
      case "frictionless":
        clearFrictionlessPending();
        performed.push("frictionless");
        break;
      case "create":
        clearUniversalCreationSession();
        performed.push("create");
        break;
      case "intent_workflow":
        clearIntentWorkflow();
        performed.push("intent_workflow");
        break;
      case "help_thread":
        clearShariConversationThread();
        performed.push("help_thread");
        break;
      case "continuation":
        performed.push("continuation");
        break;
      case "spine_ownership":
        // Written below via nextOwnership / clear.
        performed.push("spine_ownership");
        break;
      default:
        break;
    }
  }
  return [...new Set(performed)];
}

/**
 * Execute cleanup, persist next ownership, emit diagnostics.
 */
export function applyOwnershipResolution(
  resolution: OwnershipResolution,
  hooks: ApplyOwnershipHooks = {},
  trace?: ApplyOwnershipTraceContext,
): OwnershipResolution {
  const cleanupPerformed = runCleanup(resolution.cleanup, hooks);

  if (resolution.nextOwnership) {
    setSpineOwnership(resolution.nextOwnership);
  } else if (resolution.cleanup.includes("spine_ownership")) {
    clearSpineOwnership(resolution.reason);
  }

  const ownerAfter = resolution.nextOwnership?.owner ?? "none";

  logOwnershipTrace({
    conversationId: hooks.conversationId ?? null,
    ownerBefore: trace?.ownerBefore ?? resolution.currentOwner,
    claims: trace?.claims ?? [],
    selectedOwner: resolution.nextOwner ?? resolution.currentOwner,
    rejectedOwners: resolution.rejectedClaims.map((c) => c.owner),
    action: resolution.action,
    reason: resolution.reason,
    cleanup: cleanupPerformed,
    ownerAfter,
  });

  return { ...resolution, cleanup: cleanupPerformed };
}

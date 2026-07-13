/**
 * Continuity turn gate — decide ownership before primary / Decision Engine.
 */

import { canOwnerHandleTurn } from "./canOwnerHandleTurn";
import { isExplicitOwnerExit, isExplicitTaskChange } from "./exitRules";
import { clearConversationOwner } from "./ownerStore";
import { getActiveConversationOwner } from "./resolveActiveOwner";
import { isStickyContinuityOwner } from "./routingPriority";
import {
  detectStoredContentOrNavigationDestination,
  type StoredContentDestination,
} from "./storedContentNavigation";
import type { ConversationOwner, ResolveActiveOwnerInput } from "./types";
import { routeTurnToOwner, type OwnerTurnRouteResult } from "./routeTurnToOwner";
import { clearUniversalCreationSession } from "@/lib/universalCreation";

export type ContinuityGateDecision =
  | {
      action: "route_to_owner";
      owner: ConversationOwner;
      routed: OwnerTurnRouteResult;
    }
  | {
      action: "clear_owner_continue";
      reason: "explicit_exit" | "explicit_task_change";
      /** Clear Universal Creation when exiting a create owner. */
      clearUniversalCreation: boolean;
    }
  | {
      action: "destination";
      destination: StoredContentDestination;
      clearUniversalCreation?: boolean;
    }
  | {
      action: "fall_through";
      owner: ConversationOwner;
    };

export type ResolveContinuityGateInput = ResolveActiveOwnerInput & {
  userText: string;
  lastAssistantText?: string | null;
  /**
   * When true, skip destination openers (used if a stronger in-flight
   * handler already claimed the turn — reserved for future).
   */
  suppressDestination?: boolean;
};

/**
 * Resolve what should own this user message.
 * Call before classifyPrimaryConversationTurn.
 */
export function resolveContinuityTurnGate(
  input: ResolveContinuityGateInput,
): ContinuityGateDecision {
  const userText = input.userText.trim();
  const owner = getActiveConversationOwner(input);

  if (isExplicitOwnerExit(userText)) {
    const clearUc =
      owner.kind === "guided_workflow" || owner.kind === "artifact";
    clearConversationOwner();
    if (clearUc) clearUniversalCreationSession();
    return {
      action: "clear_owner_continue",
      reason: "explicit_exit",
      clearUniversalCreation: clearUc,
    };
  }

  if (isExplicitTaskChange(userText)) {
    const clearUc =
      owner.kind === "guided_workflow" || owner.kind === "artifact";
    clearConversationOwner();
    if (clearUc) clearUniversalCreationSession();
    // After task change, destination may still apply.
    const dest = detectStoredContentOrNavigationDestination(userText);
    if (dest && !input.suppressDestination) {
      return {
        action: "destination",
        destination: dest,
        clearUniversalCreation: clearUc,
      };
    }
    return {
      action: "clear_owner_continue",
      reason: "explicit_task_change",
      clearUniversalCreation: clearUc,
    };
  }

  if (
    isStickyContinuityOwner(owner.kind) &&
    canOwnerHandleTurn(owner, userText)
  ) {
    const routed = routeTurnToOwner({
      owner,
      userText,
      lastAssistantText: input.lastAssistantText,
    });
    if (routed.kind !== "unhandled") {
      return { action: "route_to_owner", owner, routed };
    }
    // Stale domain record — clear pointer and fall through.
    clearConversationOwner();
  }

  if (!input.suppressDestination) {
    const dest = detectStoredContentOrNavigationDestination(userText);
    if (dest) {
      return { action: "destination", destination: dest };
    }
  }

  return { action: "fall_through", owner };
}

/** Test helper — true when gate would skip primary classification. */
export function continuityGateSkipsPrimaryClassification(
  decision: ContinuityGateDecision,
): boolean {
  if (decision.action === "route_to_owner") return true;
  if (decision.action === "destination") return true;
  return false;
}

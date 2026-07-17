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
import { clearUniversalCreationSession, loadUniversalCreationSession } from "@/lib/universalCreation";
import {
  classifyRequestedArtifactType,
} from "@/lib/conversationStabilization/intentClassificationGate";
import { getIntentWorkflow } from "@/lib/conversationStabilization/intentWorkflowStore";
import {
  resolveWorkflowResumeDecision,
} from "@/lib/conversationStabilization/workflowResumeDecision";
import {
  clearRejectedRecoveryReply,
  detectWorkflowCorrection,
  rememberRejectedRecoveryReply,
} from "./workflowCorrection";

export type ContinuityGateDecision =
  | {
      action: "route_to_owner";
      owner: ConversationOwner;
      routed: OwnerTurnRouteResult;
    }
  | {
      action: "clear_owner_continue";
      reason:
        | "explicit_exit"
        | "explicit_task_change"
        | "workflow_correction";
      /** Clear Universal Creation when exiting a create owner. */
      clearUniversalCreation: boolean;
      /** One-time correction acknowledgment when clearing a misunderstood workflow. */
      correctionAck?: string;
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
    clearRejectedRecoveryReply();
    return {
      action: "clear_owner_continue",
      reason: "explicit_exit",
      clearUniversalCreation: clearUc,
    };
  }

  const correction = detectWorkflowCorrection(userText, owner);
  if (correction.isCorrection) {
    const rejectedRecovery =
      owner.kind === "guided_workflow"
        ? `We were creating your ${owner.workflowType}. Let's continue from where we left off.`
        : owner.kind === "artifact"
          ? `We were creating your ${owner.artifactType}. Let's continue from where we left off.`
          : "We were creating your document. Let's continue from where we left off.";
    rememberRejectedRecoveryReply(rejectedRecovery);
    clearConversationOwner();
    clearUniversalCreationSession();
    return {
      action: "clear_owner_continue",
      reason: "workflow_correction",
      clearUniversalCreation: true,
      correctionAck: correction.ack,
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
    // CB-022 addendum — semantic resume gate before sticky UC / artifact.
    const isCreateOwner =
      owner.kind === "guided_workflow" || owner.kind === "artifact";
    if (isCreateOwner) {
      const artifactType = classifyRequestedArtifactType(userText);
      const resume = resolveWorkflowResumeDecision({
        userText,
        activeOwner: owner,
        ucSession: loadUniversalCreationSession(),
        intentState: getIntentWorkflow(),
        currentArtifactType: artifactType,
      });
      if (!resume.shouldResume) {
        clearConversationOwner();
        clearUniversalCreationSession();
        clearRejectedRecoveryReply();
        // Fall through to current intent — do not route stale document.
      } else {
        const routed = routeTurnToOwner({
          owner,
          userText,
          lastAssistantText: input.lastAssistantText,
        });
        if (routed.kind !== "unhandled") {
          return { action: "route_to_owner", owner, routed };
        }
        clearConversationOwner();
      }
    } else {
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

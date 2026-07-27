/**
 * Continuity turn gate — decide ownership before primary / Decision Engine.
 *
 * Authoritative Intent Classification runs first (9 buckets), then this gate
 * maps the bucket to an executable ContinuityGateDecision.
 */

import {
  buildChamberPerspectiveInvite,
  LEGAL_RISK_CHAMBER_INVITE,
} from "@/lib/chamber/chamberPerspectiveInvite";
import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import { classifyMemberIntent } from "@/lib/memberIntent";
import type { MemberIntentBucket } from "@/lib/memberIntent";
import {
  clearUniversalCreationSession,
  loadUniversalCreationSession,
} from "@/lib/universalCreation";
import { parkCreateWorkflow } from "@/lib/universalCreation/createLifecycle";
import { suspendedContextFromParkedCreate } from "@/lib/conversationSuspension";
import { pushSuspendedContext } from "@/lib/conversationStabilization/suspensionStore";
import type { ConversationBoundaryDecision } from "@/lib/conversationBoundary";
import { classifyRequestedArtifactType } from "@/lib/conversationStabilization/intentClassificationGate";
import { getIntentWorkflow } from "@/lib/conversationStabilization/intentWorkflowStore";
import { resolveWorkflowResumeDecision } from "@/lib/conversationStabilization/workflowResumeDecision";
import { canOwnerHandleTurn } from "./canOwnerHandleTurn";
import { LEGAL_RISK_TOPIC_RE } from "./documentContinuityClassifier";
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
import {
  clearRejectedRecoveryReply,
  detectWorkflowCorrection,
  rememberRejectedRecoveryReply,
} from "./workflowCorrection";
import { isDirectNavigationPriorityTurn } from "@/lib/chatScope";
import { suspendBoardIntakeConversation } from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

/** Soft Board invite — ask permission; wait for yes. Peer of Chamber. */
export const BOARD_PERSPECTIVE_INVITE =
  "That sounds like something your Board can help with. Would you like me to bring a director into this conversation?" as const;

export type ContinuityGateDecision =
  | {
      action: "route_to_owner";
      owner: ConversationOwner;
      routed: OwnerTurnRouteResult;
      intentBucket?: MemberIntentBucket;
    }
  | {
      action: "clear_owner_continue";
      reason:
        | "explicit_exit"
        | "explicit_task_change"
        | "workflow_correction"
        | "document_continuity";
      clearUniversalCreation: boolean;
      correctionAck?: string;
      intentBucket?: MemberIntentBucket;
    }
  | {
      action: "destination";
      destination: StoredContentDestination;
      clearUniversalCreation?: boolean;
      intentBucket?: MemberIntentBucket;
    }
  | {
      action: "clarify";
      prompt: string;
      clearUniversalCreation: boolean;
      intentBucket?: MemberIntentBucket;
    }
  | {
      /** Soft Chamber invite — ask permission; wait for yes. Wins over coaching. */
      action: "chamber_invite";
      prompt: string;
      memberId?: ChamberMemberId;
      clearUniversalCreation: boolean;
      intentBucket?: MemberIntentBucket;
    }
  | {
      /** Soft Board invite — ask permission; wait for yes. */
      action: "board_invite";
      prompt: string;
      directorId?: string;
      clearUniversalCreation: boolean;
      intentBucket?: MemberIntentBucket;
    }
  | {
      /**
       * Exit document mode for this turn — clear sticky Create ownership and
       * continue as normal companion conversation (do not facilitate into Focus).
       */
      action: "exit_document_mode";
      owner: ConversationOwner;
      intentBucket?: MemberIntentBucket;
    }
  | {
      action: "fall_through";
      owner: ConversationOwner;
      intentBucket?: MemberIntentBucket;
    };

export type ResolveContinuityGateInput = ResolveActiveOwnerInput & {
  userText: string;
  lastAssistantText?: string | null;
  suppressDestination?: boolean;
  /**
   * Shared Conversation Boundary Decision, computed ONCE early in the turn and
   * threaded in (S3). When present, an ambiguous turn during an active Create
   * PARKS (recoverable) instead of destroying. When ABSENT, the gate keeps its
   * legacy destroy behavior — so every caller that does not thread it is
   * behavior-neutral.
   */
  boundaryDecision?: ConversationBoundaryDecision;
  /** Current turn number — for the parked SuspendedContext. */
  turn?: number;
};

function exitDocumentMode(
  owner: ConversationOwner,
  intentBucket: MemberIntentBucket,
): ContinuityGateDecision {
  clearConversationOwner();
  clearUniversalCreationSession();
  clearRejectedRecoveryReply();
  return { action: "exit_document_mode", owner, intentBucket };
}

/**
 * Soft leave — PARK the Create session (recoverable) instead of destroying it,
 * and record a SuspendedContext for a later return (S5). Reuses the
 * exit_document_mode action so downstream routing continues as conversation
 * exactly as before; the only difference is the session survives, parked.
 */
function parkDocumentMode(
  owner: ConversationOwner,
  intentBucket: MemberIntentBucket,
  turn?: number,
): ContinuityGateDecision {
  const parked = parkCreateWorkflow(`boundary_${intentBucket}`, turn);
  const ctx = parked ? suspendedContextFromParkedCreate(parked) : null;
  if (ctx) pushSuspendedContext(ctx);
  clearConversationOwner();
  clearRejectedRecoveryReply();
  return { action: "exit_document_mode", owner, intentBucket };
}

/**
 * Replaces the destructive default at Create-exit seams. Precedence #1 (the
 * high-confidence continue-in-owner path) runs BEFORE this is reached. Here the
 * shared Boundary Decision maps: cancel → destroy; interrupt/switch → park;
 * unclear/continue/expand/answer/return → keep Create intact; and — absent a
 * decision — legacy destroy (behavior-neutral).
 */
function resolveDocumentDisposition(
  owner: ConversationOwner,
  intentBucket: MemberIntentBucket,
  decision: ConversationBoundaryDecision | undefined,
  turn: number | undefined,
): ContinuityGateDecision {
  if (!decision) return exitDocumentMode(owner, intentBucket);
  switch (decision.decision) {
    case "cancel_current_workflow":
      return exitDocumentMode(owner, intentBucket);
    case "interrupt_and_suspend":
    case "switch_topic":
      return parkDocumentMode(owner, intentBucket, turn);
    case "unclear":
    case "continue_current_topic":
    case "expand_current_topic":
    case "answer_pending_question":
    case "return_to_suspended_topic":
      // Neither destroy nor park — keep the Create session; continue as chat.
      return { action: "fall_through", owner, intentBucket };
    default: {
      const _exhaustive: never = decision.decision;
      void _exhaustive;
      return exitDocumentMode(owner, intentBucket);
    }
  }
}

function tryRouteActiveDocument(
  owner: ConversationOwner,
  userText: string,
  lastAssistantText: string | null | undefined,
  decision: ConversationBoundaryDecision | undefined,
  turn: number | undefined,
): ContinuityGateDecision {
  const artifactType = classifyRequestedArtifactType(userText);
  if (
    !isStickyContinuityOwner(owner.kind) ||
    !canOwnerHandleTurn(owner, userText)
  ) {
    return resolveDocumentDisposition(owner, "conversation", decision, turn);
  }
  // Precedence #1 — the existing high-confidence continue-in-owner path wins.
  const resume = resolveWorkflowResumeDecision({
    userText,
    activeOwner: owner,
    ucSession: loadUniversalCreationSession(),
    intentState: getIntentWorkflow(),
    currentArtifactType: artifactType,
  });
  if (!resume.shouldResume || resume.confidence !== "high") {
    return resolveDocumentDisposition(owner, "conversation", decision, turn);
  }
  const routed = routeTurnToOwner({
    owner,
    userText,
    lastAssistantText,
  });
  if (routed.kind !== "unhandled") {
    return {
      action: "route_to_owner",
      owner,
      routed,
      intentBucket: "active_document",
    };
  }
  return resolveDocumentDisposition(owner, "conversation", decision, turn);
}

/**
 * Resolve what should own this user message.
 * Call before classifyPrimaryConversationTurn.
 */
export function resolveContinuityTurnGate(
  input: ResolveContinuityGateInput,
): ContinuityGateDecision {
  const userText = input.userText.trim();
  const owner = getActiveConversationOwner(input);

  // Ownership control (not content intent) — exit / correction / task change.
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
      intentBucket: "conversation",
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
      intentBucket: "conversation",
    };
  }

  if (isExplicitTaskChange(userText)) {
    const clearUc =
      owner.kind === "guided_workflow" || owner.kind === "artifact";
    clearConversationOwner();
    if (clearUc) clearUniversalCreationSession();
    const dest = detectStoredContentOrNavigationDestination(userText);
    if (dest && !input.suppressDestination) {
      return {
        action: "destination",
        destination: dest,
        clearUniversalCreation: clearUc,
        intentBucket: "navigation",
      };
    }
    return {
      action: "clear_owner_continue",
      reason: "explicit_task_change",
      clearUniversalCreation: clearUc,
      intentBucket: "conversation",
    };
  }

  // Direct Estate / hard-nav commands outrank sticky Board / Create locks.
  if (
    !input.suppressDestination &&
    isDirectNavigationPriorityTurn(userText)
  ) {
    const clearUc =
      owner.kind === "guided_workflow" || owner.kind === "artifact";
    suspendBoardIntakeConversation();
    clearConversationOwner();
    if (clearUc) clearUniversalCreationSession();
    clearRejectedRecoveryReply();
    const dest = detectStoredContentOrNavigationDestination(userText);
    if (dest) {
      return {
        action: "destination",
        destination: dest,
        clearUniversalCreation: clearUc,
        intentBucket: "navigation",
      };
    }
    // Fall through so hard-nav / Estate kernel can navigate immediately.
    return {
      action: "fall_through",
      owner: getActiveConversationOwner(input),
      intentBucket: "navigation",
    };
  }

  const isCreateOwner =
    owner.kind === "guided_workflow" || owner.kind === "artifact";
  const hasStickyDocument =
    isCreateOwner || Boolean(loadUniversalCreationSession());

  // ── Authoritative Intent Classification (9 buckets) ──
  const intent = classifyMemberIntent({
    userText,
    activeOwner: owner,
    hasStickyDocument,
    suppressDestination: input.suppressDestination,
  });

  switch (intent.bucket) {
    case "chamber_member": {
      clearConversationOwner();
      clearUniversalCreationSession();
      clearRejectedRecoveryReply();
      const memberId = intent.refs?.chamberMemberId as
        | ChamberMemberId
        | undefined;
      return {
        action: "chamber_invite",
        prompt: LEGAL_RISK_TOPIC_RE.test(userText)
          ? LEGAL_RISK_CHAMBER_INVITE
          : buildChamberPerspectiveInvite({
              memberId,
              userText,
            }),
        memberId,
        clearUniversalCreation: true,
        intentBucket: "chamber_member",
      };
    }

    case "board_member": {
      // Sticky Board owner — continue only when the turn still belongs to Board.
      if (intent.reason === "sticky_board_owner") {
        if (canOwnerHandleTurn(owner, userText)) {
          const routed = routeTurnToOwner({
            owner,
            userText,
            lastAssistantText: input.lastAssistantText,
          });
          if (routed.kind !== "unhandled") {
            return {
              action: "route_to_owner",
              owner,
              routed,
              intentBucket: "board_member",
            };
          }
        }
        // Off-topic while Board was sticky — leave Board, continue as conversation.
        clearConversationOwner();
        clearRejectedRecoveryReply();
        return {
          action: "fall_through",
          owner: getActiveConversationOwner(input),
          intentBucket: "conversation",
        };
      }
      clearConversationOwner();
      clearUniversalCreationSession();
      clearRejectedRecoveryReply();
      return {
        action: "board_invite",
        prompt: BOARD_PERSPECTIVE_INVITE,
        directorId: intent.refs?.boardDirectorId,
        clearUniversalCreation: true,
        intentBucket: "board_member",
      };
    }

    case "clarification": {
      return {
        action: "clarify",
        prompt:
          intent.refs?.clarifyPrompt ||
          "Are you still working on the current document, or starting something new?",
        clearUniversalCreation: false,
        intentBucket: "clarification",
      };
    }

    case "active_document": {
      return tryRouteActiveDocument(
        owner,
        userText,
        input.lastAssistantText,
        input.boundaryDecision,
        input.turn,
      );
    }

    case "new_document": {
      // Leave sticky Create so force-new / fresh create handlers can own the turn.
      if (hasStickyDocument) {
        clearConversationOwner();
        clearUniversalCreationSession();
        clearRejectedRecoveryReply();
      }
      return {
        action: "fall_through",
        owner: getActiveConversationOwner(input),
        intentBucket: "new_document",
      };
    }

    case "navigation": {
      const dest = detectStoredContentOrNavigationDestination(userText);
      if (dest) {
        if (hasStickyDocument) {
          clearConversationOwner();
          clearUniversalCreationSession();
          clearRejectedRecoveryReply();
        }
        return {
          action: "destination",
          destination: dest,
          clearUniversalCreation: hasStickyDocument,
          intentBucket: "navigation",
        };
      }
      return {
        action: "fall_through",
        owner,
        intentBucket: "navigation",
      };
    }

    case "research": {
      // Research never stays in document mode.
      if (hasStickyDocument) {
        return resolveDocumentDisposition(
          owner,
          "research",
          input.boundaryDecision,
          input.turn,
        );
      }
      return {
        action: "fall_through",
        owner,
        intentBucket: "research",
      };
    }

    case "project": {
      if (hasStickyDocument) {
        clearConversationOwner();
        clearUniversalCreationSession();
        clearRejectedRecoveryReply();
      }
      return {
        action: "fall_through",
        owner: getActiveConversationOwner(input),
        intentBucket: "project",
      };
    }

    case "conversation":
    default: {
      if (hasStickyDocument) {
        return resolveDocumentDisposition(
          owner,
          "conversation",
          input.boundaryDecision,
          input.turn,
        );
      }
      // Non-Create sticky owners (e.g. none) — allow Board/Chamber already handled.
      if (
        isStickyContinuityOwner(owner.kind) &&
        !isCreateOwner &&
        canOwnerHandleTurn(owner, userText)
      ) {
        const routed = routeTurnToOwner({
          owner,
          userText,
          lastAssistantText: input.lastAssistantText,
        });
        if (routed.kind !== "unhandled") {
          return {
            action: "route_to_owner",
            owner,
            routed,
            intentBucket: "conversation",
          };
        }
        clearConversationOwner();
      }
      return {
        action: "fall_through",
        owner,
        intentBucket: "conversation",
      };
    }
  }
}

/** Test helper — true when gate would skip primary classification. */
export function continuityGateSkipsPrimaryClassification(
  decision: ContinuityGateDecision,
): boolean {
  if (decision.action === "route_to_owner") return true;
  if (decision.action === "destination") return true;
  if (decision.action === "clarify") return true;
  if (decision.action === "chamber_invite") return true;
  if (decision.action === "board_invite") return true;
  // exit_document_mode continues into normal conversation — does not skip
  // primary, but Create facilitation must be skipped by the client.
  return false;
}

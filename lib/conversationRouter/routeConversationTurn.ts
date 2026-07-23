/**
 * Authoritative conversation turn arbiter.
 *
 * Every conversational entry path should call this before experience-specific
 * handlers claim a turn. Consolidates Continuity + chatScope + navigation —
 * does not invent a second parallel router.
 */

import {
  getActiveConversationOwner,
  resolveContinuityTurnGate,
} from "@/lib/conversationContinuity";
import { getDaySession } from "@/lib/chatScope";
import { classifyTurnIntent } from "./classifyTurnIntent";
import { resolveClarification } from "./resolveClarification";
import {
  ownerMayClaimTurn,
  resolveActiveScopeOwner,
} from "./resolveScopeOwnership";
import {
  isNonClaimableByAwaitingOwner,
  priorityForIntentFamily,
} from "./resolveTurnPriority";
import { resolveWorkflowEffects } from "./resolveWorkflowAction";
import { recordRoutingTrace } from "./routingTrace";
import type {
  ConversationRouteResult,
  RouteConversationTurnInput,
  RoutingAction,
  RoutingDecision,
} from "./routingTypes";
import { beginRoutedChatRequest } from "./validateResponseEnvelope";

function mapAction(
  continuityAction: ConversationRouteResult["continuityGate"]["action"],
  family: RoutingDecision["intentFamily"],
): RoutingAction {
  if (family === "direct_navigation") return "navigate";
  if (family === "cancel_stop_exit") return "cancel_scope";
  switch (continuityAction) {
    case "route_to_owner":
      return "route_to_owner";
    case "destination":
      return "navigate";
    case "clarify":
    case "chamber_invite":
    case "board_invite":
      return "request_clarification";
    case "fall_through":
      return "fall_through";
    case "clear_owner_continue":
    case "exit_document_mode":
      return "answer_generally";
    default:
      return "fall_through";
  }
}

/**
 * Single entry for turn routing. CPC and other surfaces should call this
 * instead of inventing independent sticky-owner claims.
 */
export function routeConversationTurn(
  input: RouteConversationTurnInput,
): ConversationRouteResult {
  const normalized = input.userText.trim();
  const activeOwner = getActiveConversationOwner({
    activeSection: input.activeSection,
  });
  const scopeOwner = resolveActiveScopeOwner({
    conversationId: input.conversationId,
    destinationId: input.destinationId,
    activeSection: input.activeSection,
  });

  const classified = classifyTurnIntent({
    userText: normalized,
    awaitingAnswer: scopeOwner.awaitingAnswer,
    suppressDestination: input.suppressDestination,
  });

  const priorityStep = priorityForIntentFamily(classified.family);
  const higherPriorityBlocksOwner = isNonClaimableByAwaitingOwner(
    classified.family,
  );

  const rejectedOwners: Array<{ id: string; reason: string }> = [];
  if (
    scopeOwner.awaitingAnswer &&
    higherPriorityBlocksOwner &&
    !ownerMayClaimTurn({
      owner: scopeOwner,
      intentFamily: classified.family,
      conversationId: input.conversationId,
      daySessionId: getDaySession().daySessionId,
      higherPriorityResolved: true,
    })
  ) {
    rejectedOwners.push({
      id: scopeOwner.id,
      reason: `higher_priority:${classified.family}`,
    });
  }

  // Continuity gate remains the executable ownership engine.
  const continuityGate = resolveContinuityTurnGate({
    userText: normalized,
    lastAssistantText: input.lastAssistantText,
    activeSection: input.activeSection,
    suppressDestination: input.suppressDestination,
  });

  const clarification = resolveClarification({
    family: classified.family,
    confidence: classified.confidence,
    targetId: classified.targetId,
  });

  const decision: RoutingDecision = {
    intentFamily: classified.family,
    confidence: classified.confidence,
    targetType: classified.targetType,
    targetId: classified.targetId,
    owningScope:
      continuityGate.action === "route_to_owner" ? scopeOwner : scopeOwner.active
        ? scopeOwner
        : null,
    action: mapAction(continuityGate.action, classified.family),
    requiresClarification: clarification.requiresClarification,
    clarificationOptions: clarification.options,
    reasonCode: classified.reasonCode,
    memberIntentBucket: classified.memberIntentBucket,
    priorityStep,
  };

  // Navigation intent forces navigate action even if continuity fell through.
  if (classified.family === "direct_navigation" && classified.targetId) {
    decision.action = "navigate";
    decision.owningScope = scopeOwner;
  }

  const effects = resolveWorkflowEffects({ decision, continuityGate });
  if (
    clarification.requiresClarification &&
    clarification.prompt &&
    !effects.some((e) => e.type === "request_clarification")
  ) {
    effects.push({
      type: "request_clarification",
      prompt: clarification.prompt,
      options: clarification.options,
    });
  }

  const responsePolicy =
    decision.action === "route_to_owner" ||
    decision.action === "request_clarification" ||
    decision.action === "navigate"
      ? "local_immediate"
      : decision.action === "fall_through" ||
          decision.action === "answer_generally"
        ? "api_allowed"
        : "local_immediate";

  const requestIdentity =
    input.skipIdentity || !input.conversationId
      ? null
      : beginRoutedChatRequest({
          conversationId: input.conversationId,
          destinationId: input.destinationId,
        });

  const trace = {
    normalizedInput: normalized.slice(0, 240),
    candidateIntents: classified.candidates,
    selectedIntent: classified.family,
    candidateOwners: [scopeOwner.id],
    rejectedOwners,
    selectedTarget: classified.targetId,
    priorityApplied: priorityStep,
    effects: effects.map((e) => e.type),
    clarificationReason: clarification.reason,
    continuityAction: continuityGate.action,
    at: new Date().toISOString(),
  };
  recordRoutingTrace(trace);

  return {
    decision,
    effects,
    responsePolicy,
    continuityGate,
    activeOwner,
    requestIdentity,
    trace,
  };
}

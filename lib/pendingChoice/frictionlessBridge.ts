import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import type { FrictionlessActionDecision } from "@/lib/frictionlessActionLayer";
import type { PendingChoiceAction, PendingChoiceResolveResult } from "./types";

export type PendingChoiceExecution = {
  userText: string;
  action: PendingChoiceAction;
  reply: string;
};

export function frictionlessDecisionFromPendingChoice(
  userText: string,
  result: Extract<PendingChoiceResolveResult, { kind: "resolved" }>,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  return {
    category: "pending_choice",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "PENDING CHOICE RESOLVED: Execute the member's menu pick immediately — do not re-offer choices or route home.",
    localReply: result.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    pendingChoiceExecution: {
      userText,
      action: result.action,
      reply: result.reply,
    },
  };
}

export function frictionlessDecisionFromUnrecognizedPendingChoice(
  userText: string,
  result: Extract<PendingChoiceResolveResult, { kind: "unrecognized" }>,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  return {
    category: "pending_choice",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "PENDING CHOICE: Member did not match a menu option — re-show the same numbered choices only.",
    localReply: result.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

export function frictionlessDecisionFromCancelledPendingChoice(
  result: Extract<PendingChoiceResolveResult, { kind: "cancelled" }>,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  return {
    category: "pending_choice",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: null,
    localReply: result.reply ?? "No problem — we can stay right here.",
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

export function frictionlessDecisionFromContinuedPendingChoice(
  result: Extract<
    PendingChoiceResolveResult,
    { kind: "continued" | "expanded" }
  >,
  routing: IntentRoutingDecision,
): FrictionlessActionDecision {
  return {
    category: "pending_choice",
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint:
      "PENDING CHOICE: Keep the same menu active — answer the meta question or show the expanded list.",
    localReply: result.reply,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
  };
}

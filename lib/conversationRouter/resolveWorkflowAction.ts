/**
 * Map routing decisions + Continuity gate into executable effects.
 */

import type { ContinuityGateDecision } from "@/lib/conversationContinuity";
import type { RoutingDecision, RoutingEffect } from "./routingTypes";

function continuityDestinationId(
  gate: Extract<ContinuityGateDecision, { action: "destination" }>,
): string {
  if (gate.destination.kind === "estate") return gate.destination.destination;
  return "plan-my-day";
}

export function resolveWorkflowEffects(input: {
  decision: RoutingDecision;
  continuityGate: ContinuityGateDecision;
}): RoutingEffect[] {
  const effects: RoutingEffect[] = [];
  const { decision, continuityGate } = input;

  if (decision.intentFamily === "direct_navigation" && decision.targetId) {
    effects.push({
      type: "suspend_scope",
      scopeId: decision.owningScope?.id ?? "active",
      reason: "direct_navigation",
    });
    effects.push({
      type: "navigate",
      destinationId: decision.targetId,
    });
    effects.push({ type: "supersede_inflight" });
    return effects;
  }

  if (decision.intentFamily === "cancel_stop_exit") {
    effects.push({
      type: "cancel_scope",
      scopeId: decision.owningScope?.id ?? "active",
      reason: "explicit_cancel",
    });
    effects.push({ type: "clear_owner", reason: "explicit_cancel" });
    return effects;
  }

  switch (continuityGate.action) {
    case "route_to_owner": {
      const routed = continuityGate.routed;
      if (routed.kind === "universal_creation" || routed.kind === "board_intake") {
        effects.push({
          type: "append_assistant",
          content: routed.reply,
        });
      }
      break;
    }
    case "destination":
      effects.push({
        type: "navigate",
        destinationId: continuityDestinationId(continuityGate),
      });
      effects.push({
        type: "suspend_scope",
        scopeId: decision.owningScope?.id ?? "active",
        reason: "continuity_destination",
      });
      break;
    case "clarify":
    case "chamber_invite":
    case "board_invite":
      effects.push({
        type: "request_clarification",
        prompt: continuityGate.prompt,
      });
      break;
    case "clear_owner_continue":
    case "exit_document_mode":
      effects.push({
        type: "clear_owner",
        reason: continuityGate.action,
      });
      break;
    case "fall_through":
      effects.push({ type: "noop" });
      break;
    default:
      break;
  }

  return effects;
}

/**
 * Map intent families onto the authoritative priority ladder.
 */

import type {
  AuthoritativeRoutingPriorityStep,
  RoutingIntentFamily,
} from "./routingTypes";
import { AUTHORITATIVE_ROUTING_PRIORITY } from "./routingTypes";

const FAMILY_TO_PRIORITY: Record<
  RoutingIntentFamily,
  AuthoritativeRoutingPriorityStep
> = {
  safety_or_account: "safety_or_account",
  cancel_stop_exit: "cancel_stop_exit",
  direct_navigation: "direct_navigation",
  workflow_management: "workflow_management",
  create_or_project_action: "create_or_project_action",
  resume_saved_work: "resume_saved_work",
  answer_pending_question: "answer_pending_question",
  modify_current_work: "active_scope_request",
  ask_destination_or_specialist: "active_scope_request",
  general_conversation: "general_conversation",
  reflective_discussion: "general_conversation",
  search_saved_work: "create_or_project_action",
  ambiguous: "suggested_routing",
  unsupported: "suggested_routing",
};

export function priorityForIntentFamily(
  family: RoutingIntentFamily,
): AuthoritativeRoutingPriorityStep {
  return FAMILY_TO_PRIORITY[family];
}

export function priorityRank(
  step: AuthoritativeRoutingPriorityStep,
): number {
  return AUTHORITATIVE_ROUTING_PRIORITY.indexOf(step);
}

/** True when `a` outranks `b` (lower index wins). */
export function outranks(
  a: AuthoritativeRoutingPriorityStep,
  b: AuthoritativeRoutingPriorityStep,
): boolean {
  return priorityRank(a) < priorityRank(b);
}

/**
 * Families that must never be claimed by sticky awaiting-answer owners.
 */
export function isNonClaimableByAwaitingOwner(
  family: RoutingIntentFamily,
): boolean {
  return (
    family === "safety_or_account" ||
    family === "cancel_stop_exit" ||
    family === "direct_navigation" ||
    family === "workflow_management" ||
    family === "create_or_project_action" ||
    family === "resume_saved_work" ||
    family === "search_saved_work"
  );
}

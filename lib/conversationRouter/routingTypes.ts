/**
 * Authoritative Conversation Routing — shared types.
 * Experiences implement ConversationScopeOwner; turns return ConversationRouteResult.
 */

import type { ContinuityGateDecision } from "@/lib/conversationContinuity";
import type { ConversationOwner } from "@/lib/conversationContinuity";
import type { ChatRequestIdentity, ChatScopeKind } from "@/lib/chatScope";
import type { MemberIntentBucket } from "@/lib/memberIntent";

/** Stable intent families — not exact phrases. */
export type RoutingIntentFamily =
  | "safety_or_account"
  | "cancel_stop_exit"
  | "direct_navigation"
  | "workflow_management"
  | "create_or_project_action"
  | "resume_saved_work"
  | "answer_pending_question"
  | "modify_current_work"
  | "ask_destination_or_specialist"
  | "general_conversation"
  | "reflective_discussion"
  | "search_saved_work"
  | "ambiguous"
  | "unsupported";

/**
 * Global priority — highest first.
 * A lower-priority owner cannot capture a higher-priority intent.
 */
export const AUTHORITATIVE_ROUTING_PRIORITY = [
  "safety_or_account",
  "cancel_stop_exit",
  "direct_navigation",
  "workflow_management",
  "create_or_project_action",
  "resume_saved_work",
  "answer_pending_question",
  "active_scope_request",
  "general_conversation",
  "suggested_routing",
] as const;

export type AuthoritativeRoutingPriorityStep =
  (typeof AUTHORITATIVE_ROUTING_PRIORITY)[number];

export type RoutingScopeType =
  | "global_companion"
  | "new_day"
  | "estate_destination"
  | "board_discussion"
  | "chamber_member"
  | "guided_creation"
  | "project"
  | "reflective_experience"
  | "journal"
  | "clear_my_mind"
  | "talk_it_out";

export type ConversationScopeOwner = {
  id: string;
  scopeType: RoutingScopeType;
  sourceId: string | null;
  conversationId: string | null;
  daySessionId: string | null;
  destinationId: string | null;
  active: boolean;
  resumable: boolean;
  awaitingAnswer: boolean;
  pendingQuestionId: string | null;
  claimedIntentFamilies: readonly RoutingIntentFamily[];
  priority: number;
};

export type RoutingConfidence = "high" | "medium" | "low";

export type RoutingTargetType =
  | "destination"
  | "chamber_member"
  | "board"
  | "create"
  | "project"
  | "workflow"
  | "global"
  | "none";

export type RoutingAction =
  | "navigate"
  | "open_record"
  | "start_workflow"
  | "resume_scope"
  | "suspend_scope"
  | "cancel_scope"
  | "route_to_owner"
  | "append_message"
  | "request_clarification"
  | "answer_generally"
  | "fall_through"
  | "noop_explain";

export type RoutingEffect =
  | { type: "navigate"; destinationId: string; label?: string }
  | { type: "suspend_scope"; scopeId: string; reason: string }
  | { type: "release_scope"; scopeId: string; reason: string }
  | { type: "cancel_scope"; scopeId: string; reason: string }
  | { type: "resume_scope"; scopeId: string }
  | { type: "append_assistant"; content: string }
  | { type: "request_clarification"; prompt: string; options?: string[] }
  | { type: "clear_owner"; reason: string }
  | { type: "supersede_inflight" }
  | { type: "noop" };

export type RoutingDecision = {
  intentFamily: RoutingIntentFamily;
  confidence: RoutingConfidence;
  targetType: RoutingTargetType;
  targetId: string | null;
  owningScope: ConversationScopeOwner | null;
  action: RoutingAction;
  requiresClarification: boolean;
  clarificationOptions: string[];
  reasonCode: string;
  /** Continuity bucket when available. */
  memberIntentBucket?: MemberIntentBucket;
  priorityStep: AuthoritativeRoutingPriorityStep;
};

export type ResponsePolicy =
  | "local_immediate"
  | "api_allowed"
  | "clarify_only"
  | "silent";

export type ConversationRouteResult = {
  decision: RoutingDecision;
  effects: RoutingEffect[];
  responsePolicy: ResponsePolicy;
  /** Legacy Continuity gate — CPC still executes this until full migration. */
  continuityGate: ContinuityGateDecision;
  /** Active Continuity owner snapshot. */
  activeOwner: ConversationOwner;
  requestIdentity: ChatRequestIdentity | null;
  trace: RoutingTrace;
};

export type RoutingTrace = {
  normalizedInput: string;
  candidateIntents: RoutingIntentFamily[];
  selectedIntent: RoutingIntentFamily;
  candidateOwners: string[];
  rejectedOwners: Array<{ id: string; reason: string }>;
  selectedTarget: string | null;
  priorityApplied: AuthoritativeRoutingPriorityStep;
  effects: string[];
  clarificationReason: string | null;
  continuityAction: ContinuityGateDecision["action"];
  at: string;
};

export type RouteConversationTurnInput = {
  userText: string;
  lastAssistantText?: string | null;
  activeSection?: string | null;
  conversationId?: string | null;
  destinationId?: string | null;
  suppressDestination?: boolean;
  /** When true, skip creating a request identity (local-only probes). */
  skipIdentity?: boolean;
};

export function chatScopeKindToRoutingScope(
  kind: ChatScopeKind,
): RoutingScopeType {
  switch (kind) {
    case "new_day":
      return "new_day";
    case "estate_destination":
      return "estate_destination";
    case "guided_creation":
      return "guided_creation";
    case "project":
      return "project";
    case "chamber_member":
      return "chamber_member";
    case "board_discussion":
      return "board_discussion";
    case "reflective":
      return "reflective_experience";
    case "global_companion":
    default:
      return "global_companion";
  }
}

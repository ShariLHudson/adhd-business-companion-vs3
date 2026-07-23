/**
 * Intent-family classification — registries + grammar first, not phrase lists.
 */

import { isDirectNavigationPriorityTurn } from "@/lib/chatScope";
import { isExplicitOwnerExit, isExplicitTaskChange } from "@/lib/conversationContinuity";
import { classifyMemberIntent } from "@/lib/memberIntent";
import type { MemberIntentBucket } from "@/lib/memberIntent";
import type {
  RoutingConfidence,
  RoutingIntentFamily,
  RoutingTargetType,
} from "./routingTypes";
import { resolveNavigationTarget } from "./resolveNavigationTarget";

export type ClassifiedTurnIntent = {
  family: RoutingIntentFamily;
  confidence: RoutingConfidence;
  targetType: RoutingTargetType;
  targetId: string | null;
  memberIntentBucket: MemberIntentBucket;
  candidates: RoutingIntentFamily[];
  reasonCode: string;
};

const CANCEL_RE =
  /\b(?:never mind|nevermind|forget (?:it|that|this)|stop asking|let'?s (?:do this|stop) later|cancel(?: that| this)?|i(?:'| a)?m done with (?:this|that))\b/i;

const RESUME_RE =
  /\b(?:continue(?: where i left off)?|pick up where|resume(?: (?:my|the|that))?|go back to (?:my|the) (?:project|discussion|draft|work))\b/i;

const SEARCH_RE =
  /\b(?:find|show me|where is|where'?s|look up|search for)\b.+\b(?:project|creation|discussion|journal|evidence|plan)\b/i;

const CREATE_ACTION_RE =
  /\b(?:create|start|begin|make|draft|build)\b.+\b(?:workshop|event|document|project|email|checklist|plan|flyer|post)\b/i;

const OPEN_PROJECT_RE =
  /\b(?:open|show|go to)\b.+\b(?:project|projects)\b/i;

const REFLECTIVE_RE =
  /\b(?:journal|reflect|how (?:am i|i'?m) feeling|talk (?:this|it) through|clear my mind)\b/i;

/**
 * Classify a turn into a stable intent family.
 * Deterministic high-confidence commands resolve before generative chat.
 */
export function classifyTurnIntent(input: {
  userText: string;
  awaitingAnswer?: boolean;
  suppressDestination?: boolean;
}): ClassifiedTurnIntent {
  const t = input.userText.trim();
  const candidates: RoutingIntentFamily[] = [];

  const member = classifyMemberIntent({
    userText: t,
    suppressDestination: input.suppressDestination,
  });

  if (/^(?:delete my account|export my data|privacy|security)\b/i.test(t)) {
    return {
      family: "safety_or_account",
      confidence: "high",
      targetType: "none",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: ["safety_or_account"],
      reasonCode: "safety_or_account_phrase",
    };
  }

  // Mixed "leave this and take me to music" — navigation destination wins when present.
  if (isDirectNavigationPriorityTurn(t)) {
    const nav = resolveNavigationTarget(t);
    candidates.push("direct_navigation");
    return {
      family: "direct_navigation",
      confidence: nav ? "high" : "medium",
      targetType: nav ? "destination" : "none",
      targetId: nav?.destinationId ?? null,
      memberIntentBucket: member.bucket,
      candidates,
      reasonCode: nav ? "direct_navigation_resolved" : "direct_navigation_unresolved",
    };
  }

  if (isExplicitOwnerExit(t) || CANCEL_RE.test(t)) {
    candidates.push("cancel_stop_exit");
    return {
      family: "cancel_stop_exit",
      confidence: "high",
      targetType: "none",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates,
      reasonCode: "cancel_or_exit",
    };
  }

  if (isExplicitTaskChange(t) || OPEN_PROJECT_RE.test(t)) {
    candidates.push("workflow_management");
  }

  if (
    CREATE_ACTION_RE.test(t) ||
    member.bucket === "new_document" ||
    member.bucket === "project"
  ) {
    candidates.push("create_or_project_action");
    return {
      family: "create_or_project_action",
      confidence: member.confidence === "high" ? "high" : "medium",
      targetType: member.bucket === "project" ? "project" : "create",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: [...candidates, "create_or_project_action"],
      reasonCode: "create_or_project_action",
    };
  }

  if (RESUME_RE.test(t)) {
    return {
      family: "resume_saved_work",
      confidence: "medium",
      targetType: "workflow",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: ["resume_saved_work"],
      reasonCode: "resume_language",
    };
  }

  if (SEARCH_RE.test(t)) {
    return {
      family: "search_saved_work",
      confidence: "medium",
      targetType: "none",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: ["search_saved_work"],
      reasonCode: "search_saved_work",
    };
  }

  if (REFLECTIVE_RE.test(t)) {
    return {
      family: "reflective_discussion",
      confidence: "medium",
      targetType: "none",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: ["reflective_discussion"],
      reasonCode: "reflective",
    };
  }

  if (member.bucket === "chamber_member" || member.bucket === "board_member") {
    return {
      family: "ask_destination_or_specialist",
      confidence: member.confidence === "high" ? "high" : "medium",
      targetType:
        member.bucket === "chamber_member" ? "chamber_member" : "board",
      targetId:
        member.refs?.chamberMemberId ?? member.refs?.boardDirectorId ?? null,
      memberIntentBucket: member.bucket,
      candidates: ["ask_destination_or_specialist"],
      reasonCode: "specialist_invite_bucket",
    };
  }

  if (input.awaitingAnswer && t.length > 0 && t.length < 400) {
    // Short/medium answers while awaiting — may be claimed by owner later.
    candidates.push("answer_pending_question");
  }

  if (member.bucket === "clarification" || t.length < 2) {
    return {
      family: "ambiguous",
      confidence: "low",
      targetType: "none",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: [...candidates, "ambiguous"],
      reasonCode: "ambiguous_or_empty",
    };
  }

  if (candidates.includes("workflow_management")) {
    return {
      family: "workflow_management",
      confidence: "medium",
      targetType: "workflow",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates,
      reasonCode: "workflow_management",
    };
  }

  if (input.awaitingAnswer) {
    return {
      family: "answer_pending_question",
      confidence: "medium",
      targetType: "none",
      targetId: null,
      memberIntentBucket: member.bucket,
      candidates: [...candidates, "general_conversation"],
      reasonCode: "awaiting_answer_candidate",
    };
  }

  return {
    family: "general_conversation",
    confidence: "medium",
    targetType: "global",
    targetId: null,
    memberIntentBucket: member.bucket,
    candidates: [...candidates, "general_conversation"],
    reasonCode: "general_conversation",
  };
}

/**
 * Priority event detection + primary mode selection (packages 195/197).
 */

import { detectsDirectCorrection } from "@/lib/reflectiveConversationIntelligence";
import {
  detectsExplicitTopicChange,
  isClarificationRequest,
} from "@/lib/topicContinuityAnchorIntelligence";
import type { CieMessage, ConversationMode, PriorityEvent } from "./types";

const EXPLICIT_ACTION =
  /\b(?:open |go to |take me to |show me |launch |navigate)\b/i;

const CONVERSATION_MGMT =
  /\b(?:pause|stop talking|end this|save this|start over)\b/i;

export function detectPriorityEvent(
  userText: string,
  messages: readonly CieMessage[],
): PriorityEvent {
  const t = userText.trim();
  if (!t) return "normal";
  // Safety deferred — no medical/crisis classifier here; platform owns that layer
  if (EXPLICIT_ACTION.test(t)) return "explicit_action";
  if (detectsDirectCorrection(t)) return "direct_correction";
  if (isClarificationRequest(t)) return "clarification_request";
  if (detectsExplicitTopicChange(t)) return "topic_change";

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (
    lastAssistant?.content.includes("?") &&
    t.length <= 48 &&
    !isClarificationRequest(t)
  ) {
    return "answer_to_question";
  }
  if (CONVERSATION_MGMT.test(t)) return "conversation_management";
  return "normal";
}

export function selectPrimaryMode(input: {
  experienceId: string;
  priority: PriorityEvent;
  userText: string;
}): ConversationMode {
  if (input.priority === "clarification_request") return "clarification";
  if (input.priority === "direct_correction") return "repair";
  if (input.priority === "explicit_action") return "navigation";

  if (input.experienceId === "create") return "creation_workflow";
  if (input.experienceId === "chamber") return "expert_member_response";
  if (input.experienceId === "board") return "board_deliberation";

  const t = input.userText.toLowerCase();
  if (/\b(?:hire|decid|whether|should i|or not|price|launch)\b/.test(t)) {
    return "decision_exploration";
  }
  if (/\b(?:plan|schedule|this week|priorit)\b/.test(t)) {
    return "practical_planning";
  }
  if (/\b(?:overwhelm|too much|anxious|scared|afraid)\b/.test(t)) {
    return "emotional_support";
  }

  if (input.experienceId === "talk-it-out") return "reflective_thinking";
  return "reflective_thinking";
}

export function selectConversationalMove(input: {
  mode: ConversationMode;
  priority: PriorityEvent;
  turnCount: number;
  hasTopic: boolean;
  goldSuggestedMove?: string | null;
}): string {
  if (input.priority === "clarification_request") {
    return "repair_misunderstanding";
  }
  if (input.priority === "direct_correction") return "return_to_topic";
  if (input.goldSuggestedMove) return input.goldSuggestedMove;
  if (input.turnCount <= 1 || !input.hasTopic) return "clarify_why_now";
  if (input.mode === "decision_exploration") return "identify_concern";
  return "clarify_desired_outcome";
}

/**
 * Response plan builder (package 195/197) — operational facts only.
 */

import { retrieveGoldStandardGuidance } from "@/lib/goldStandardConversationLibrary";
import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import { hasActiveTopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";
import {
  detectPriorityEvent,
  selectConversationalMove,
  selectPrimaryMode,
} from "./priorityAndMode";
import { inferPhase } from "./state";
import type {
  CieMessage,
  CieTurnInput,
  ConversationPlan,
  ConversationRuntimeState,
} from "./types";

export function buildConversationPlan(input: {
  turn: CieTurnInput;
  state: ConversationRuntimeState;
}): ConversationPlan {
  const { turn, state } = input;
  const priority = detectPriorityEvent(turn.userText, turn.messages);
  const primaryMode = selectPrimaryMode({
    experienceId: turn.experienceId,
    priority,
    userText: turn.userText,
  });
  const phase = inferPhase(state, priority);

  const gold = retrieveGoldStandardGuidance({
    userText: turn.userText,
    topicAnchor: state.topicAnchor?.primaryTopic,
    conversationPhase: phase,
    knownConcerns: state.currentFocus ? [state.currentFocus.label] : [],
    rejectedInterpretations: state.rejectedInterpretations.map(
      (r) => r.interpretation,
    ),
    clarificationOrRepair:
      priority === "clarification_request" ||
      priority === "direct_correction" ||
      Boolean(turn.repairActive),
    previousAssistantText: lastAssistant(turn.messages),
  });

  const move = selectConversationalMove({
    mode: primaryMode,
    priority,
    turnCount: state.turnCount,
    hasTopic: hasActiveTopicAnchor(state.topicAnchor),
    goldSuggestedMove: gold.suggestedMove,
  });

  const topic = state.topicAnchor?.primaryTopic ?? null;
  const safeFallback = topic
    ? buildNaturalTopicReturn({
        topic,
        mode: "continue",
        focus: state.currentFocus?.label,
      })
    : "What feels murkiest in what you just shared?";

  return {
    activeTopic: topic,
    userIntent: turn.userText.trim().slice(0, 200),
    conversationPhase: phase,
    primaryMode,
    alreadyKnown: state.knownFacts
      .filter((f) => f.status === "active")
      .map((f) => f.fact)
      .slice(0, 6),
    mustNotAssume: [
      "hidden emotional meaning",
      "that the user wants advice",
      ...state.rejectedInterpretations.map((r) => r.interpretation).slice(0, 3),
    ],
    conversationalMove: move,
    shouldAcknowledge: priority === "normal" && state.turnCount > 1,
    shouldAskQuestion: primaryMode !== "direct_answer",
    questionPurpose:
      move === "clarify_why_now"
        ? "why_now"
        : move === "repair_misunderstanding"
          ? "restore_topic"
          : "deepen_context",
    goldExampleIds: gold.hits.map((h) => h.conversation.id),
    blockedFailurePatterns: gold.blockedFailurePatterns,
    desiredResponseLength: gold.responseLengthGuidance,
    safeFallback,
    priorityEvent: priority,
  };
}

function lastAssistant(messages: readonly CieMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "assistant") return messages[i]!.content;
  }
  return null;
}

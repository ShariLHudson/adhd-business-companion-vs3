/**
 * CIE runtime state — create, migrate, update (package 196).
 */

import {
  extractCurrentFocus,
  hasActiveTopicAnchor,
  isClarificationRequest,
  isIllegalTopicLabel,
  updateTopicAnchor,
} from "@/lib/topicContinuityAnchorIntelligence";
import { detectsDirectCorrection } from "@/lib/reflectiveConversationIntelligence";
import type { ThinkingMap } from "@/lib/reflectiveConversationIntelligence";
import type {
  CieExperienceId,
  CieMessage,
  ConversationPhase,
  ConversationRuntimeState,
  CurrentFocus,
  GroundedFact,
} from "./types";

export function emptyConversationRuntimeState(
  conversationId: string,
  experienceId: CieExperienceId,
): ConversationRuntimeState {
  return {
    conversationId,
    experienceId,
    primaryMode: "reflective_thinking",
    conversationPhase: "opening",
    topicAnchor: null,
    knownFacts: [],
    userCorrections: [],
    rejectedInterpretations: [],
    exploredDimensions: [],
    openQuestions: [],
    resolvedQuestions: [],
    retrievedExamples: [],
    nextRecommendedMoves: [],
    qualityHistory: [],
    turnCount: 0,
  };
}

/** Map existing Talk It Out / RCI Thinking Map into CIE state. */
export function runtimeStateFromThinkingMap(input: {
  conversationId: string;
  experienceId: CieExperienceId;
  thinkingMap?: ThinkingMap | null;
  prior?: ConversationRuntimeState | null;
}): ConversationRuntimeState {
  const base =
    input.prior ??
    emptyConversationRuntimeState(input.conversationId, input.experienceId);
  const map = input.thinkingMap;
  if (!map) return base;

  const topicAnchor = map.topicAnchor ?? null;
  const focusLabel = topicAnchor?.currentFocus;
  const currentFocus: CurrentFocus | undefined = focusLabel
    ? {
        label: focusLabel,
        sourceTurnId: "migrated",
        relationToTopic: "focus",
        confidence: 0.7,
      }
    : base.currentFocus;

  return {
    ...base,
    topicAnchor,
    currentFocus,
    conversationGoal:
      topicAnchor?.conversationGoal ?? map.goal ?? base.conversationGoal,
    rejectedInterpretations: [
      ...base.rejectedInterpretations,
      ...map.rejectedInterpretations.map((interpretation) => ({
        interpretation,
        rejectedByTurnId: "migrated",
      })),
    ],
    userCorrections: [
      ...base.userCorrections,
      ...map.userCorrections.map((correctedItem, i) => ({
        id: `corr-${i}`,
        sourceTurnId: "migrated",
        correctedItem,
        timestamp: new Date().toISOString(),
      })),
    ],
    turnCount: Math.max(base.turnCount, map.turnCount),
    knownFacts: mergeFacts(base.knownFacts, map),
  };
}

function mergeFacts(
  existing: GroundedFact[],
  map: ThinkingMap,
): GroundedFact[] {
  const out = [...existing];
  const push = (fact: string) => {
    if (!fact.trim()) return;
    if (out.some((f) => f.fact === fact && f.status === "active")) return;
    out.push({
      id: `fact-${out.length}`,
      fact: fact.slice(0, 160),
      sourceTurnId: "migrated",
      confidence: 0.8,
      status: "active",
    });
  };
  if (map.situation) push(map.situation);
  for (const c of map.concerns.slice(0, 4)) push(c);
  return out.slice(-20);
}

export function validateRuntimeState(
  state: ConversationRuntimeState,
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (
    state.topicAnchor &&
    isIllegalTopicLabel(state.topicAnchor.primaryTopic)
  ) {
    issues.push("illegal_topic_label");
  }
  if (
    state.currentFocus &&
    state.topicAnchor &&
    isIllegalTopicLabel(state.currentFocus.label) &&
    state.currentFocus.label.length <= 3
  ) {
    issues.push("illegal_focus");
  }
  return { ok: issues.length === 0, issues };
}

/**
 * Apply user turn to state (topic, focus, corrections, clarification).
 */
export function updateRuntimeStateForUserTurn(input: {
  state: ConversationRuntimeState;
  userText: string;
  messages: readonly CieMessage[];
  turnId: string;
}): ConversationRuntimeState {
  const { userText, messages, turnId } = input;
  let state: ConversationRuntimeState = {
    ...input.state,
    knownFacts: [...input.state.knownFacts],
    userCorrections: [...input.state.userCorrections],
    rejectedInterpretations: [...input.state.rejectedInterpretations],
    qualityHistory: [...input.state.qualityHistory],
    retrievedExamples: [...input.state.retrievedExamples],
    turnCount: input.state.turnCount + 1,
  };

  const topicAnchor = updateTopicAnchor({
    previous: state.topicAnchor,
    userText,
    messages,
    turnId,
  });
  state.topicAnchor = hasActiveTopicAnchor(topicAnchor) ? topicAnchor : state.topicAnchor;

  const focus = extractCurrentFocus(userText);
  if (focus) {
    state.currentFocus = {
      label: focus,
      sourceTurnId: turnId,
      relationToTopic: "user_short_reply",
      confidence: 0.75,
    };
  }

  if (detectsDirectCorrection(userText)) {
    state.userCorrections.push({
      id: `corr-${turnId}`,
      sourceTurnId: turnId,
      correctedItem: userText.trim().slice(0, 160),
      timestamp: new Date().toISOString(),
    });
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistant) {
      state.rejectedInterpretations.push({
        interpretation: lastAssistant.content.slice(0, 160),
        rejectedByTurnId: turnId,
        reason: "user_correction",
      });
    }
    state.conversationPhase = "repair";
  }

  if (isClarificationRequest(userText)) {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    state.clarificationState = {
      requested: true,
      targetAssistantTurnId: lastAssistant?.id,
      confusingPhrase: lastAssistant?.content.slice(0, 120),
      repairRequired: true,
    };
    state.conversationPhase = "clarification";
  } else if (state.clarificationState?.repairRequired) {
    state.clarificationState = {
      ...state.clarificationState,
      requested: false,
      repairRequired: false,
    };
  }

  if (
    userText.trim().length > 24 &&
    !isClarificationRequest(userText) &&
    !detectsDirectCorrection(userText)
  ) {
    state.knownFacts.push({
      id: `fact-${turnId}`,
      fact: userText.trim().slice(0, 160),
      sourceTurnId: turnId,
      confidence: 0.85,
      status: "active",
    });
    state.knownFacts = state.knownFacts.slice(-20);
  }

  return state;
}

export function inferPhase(
  state: ConversationRuntimeState,
  priority: string,
): ConversationPhase {
  if (priority === "clarification_request" || priority === "direct_correction") {
    return "repair";
  }
  if (state.turnCount <= 1) return "opening";
  if (state.turnCount <= 3) return "context_gathering";
  if (state.currentFocus?.label.toLowerCase().includes("cost")) {
    return "decision_criteria";
  }
  if (state.turnCount >= 8) return "synthesis";
  return "exploration";
}

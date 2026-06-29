/**
 * Spark Core Intelligence v1.0 — Conversation Engine
 * @see spark-intelligence-foundation/15-spark-core-conversation-engine.md
 */

import {
  buildFollowUpGuidance,
  buildMultiTurnPlan,
  continuityFromHistory,
  evaluateClarification,
  inferObjective,
} from "./conversationLogic";
import { detectEmotionalState, detectIntent } from "./detectors";
import {
  enrichConversationTurn,
  runExecutiveFunction,
} from "../executiveFunctionEngine/executiveFunctionEngine";
import {
  responseGuidance,
  selectResponseDepth,
  streamingForDepth,
  suggestEstate,
} from "./responsePlanning";
import { scoreConversationResponse } from "./qualityScore";
import {
  applyStateTransition,
  handleInterruption,
  handleTopicChange,
  recoverFromMisunderstanding,
  stateForIntent,
} from "./stateMachine";
import type {
  ConversationAction,
  ConversationTurnInput,
  ConversationTurnResult,
  RespondAction,
} from "./types";
import { SPARK_CONVERSATION_ENGINE_VERSION } from "./types";

export type ProcessTurnOptions = {
  draftText?: string;
};

export function processConversationTurn(
  input: ConversationTurnInput,
  options?: ProcessTurnOptions,
): ConversationTurnResult {
  let context = { ...input.context };

  if (context.state === "idle") {
    context = { ...context, state: "understanding" };
  }

  const emotionalState = detectEmotionalState(input.memberMessage);
  const intent = detectIntent(
    input.memberMessage,
    emotionalState,
    context.state,
  );

  if (intent === "interruption") {
    context = handleInterruption(context, input.memberMessage);
  }

  if (intent === "misunderstanding_recovery") {
    context = recoverFromMisunderstanding(context);
    const action: ConversationAction = {
      type: "clarify",
      question: context.pendingClarification!.question,
      reason: "misunderstanding_recovery",
      nextState: "clarifying",
    };
    return buildResult(input, context, action, intent, emotionalState, options);
  }

  if (intent === "topic_change") {
    const { summary, desiredOutcome } = inferObjective(input.memberMessage, intent);
    context = handleTopicChange(context, summary, desiredOutcome);
  }

  if (!context.objective.summary || intent === "topic_change") {
    const { summary, desiredOutcome } = inferObjective(input.memberMessage, intent);
    context = {
      ...context,
      objective: {
        ...context.objective,
        summary,
        desiredOutcome,
      },
    };
  }

  const clarification = evaluateClarification(
    input.memberMessage,
    intent,
    emotionalState,
    context,
  );

  if (clarification.needed && clarification.question) {
    const action: ConversationAction = {
      type: "clarify",
      question: clarification.question,
      reason: clarification.reason ?? "clarification",
      nextState: "clarifying",
    };
    context = applyStateTransition(context, action);
    return buildResult(input, context, action, intent, emotionalState, options);
  }

  if (intent === "room_navigation") {
    const room = /\b(creative|studio)\b/i.test(input.memberMessage)
      ? "creative-studio"
      : /\b(strategy)\b/i.test(input.memberMessage)
        ? "strategy-room"
        : "strategy-room";
    const action: ConversationAction = {
      type: "handoff",
      room,
      inviteCopy: `Opening the ${room.replace("-", " ")} for you.`,
      nextState: "handoff_to_room",
    };
    context = applyStateTransition(context, action);
    return buildResult(input, context, action, intent, emotionalState, options);
  }

  const depth = selectResponseDepth(
    intent,
    emotionalState,
    input.memberMessage.length,
  );
  const estateSuggestion = suggestEstate(intent);
  const streaming = streamingForDepth(depth);
  const continuity = continuityFromHistory(input.history);
  const followUp = buildFollowUpGuidance(context);
  const multiTurn = buildMultiTurnPlan(intent, input.memberMessage);

  if (multiTurn) {
    context = { ...context, multiTurnPlan: multiTurn };
  }

  const guidance = [
    responseGuidance(depth, intent),
    continuity ? `Continuity: ${continuity}` : "",
    followUp,
  ]
    .filter(Boolean)
    .join(" ");

  const respondAction: RespondAction = {
    type: "respond",
    intent,
    depth,
    nextState: stateForIntent(intent),
    estateSuggestion,
    streaming,
    guidance,
  };

  context = applyStateTransition(context, respondAction);

  return buildResult(
    input,
    context,
    respondAction,
    intent,
    emotionalState,
    options,
  );
}

function buildResult(
  input: ConversationTurnInput,
  context: ReturnType<typeof applyStateTransition>,
  action: ConversationAction,
  intent: ConversationTurnResult["intent"],
  emotionalState: ConversationTurnResult["emotionalState"],
  options?: ProcessTurnOptions,
): ConversationTurnResult {
  const quality =
    options?.draftText && action.type === "respond"
      ? scoreConversationResponse(
          options.draftText,
          context.objective.summary,
          action.depth,
        )
      : undefined;

  const base: ConversationTurnResult = {
    turnId: input.turnId,
    context,
    action,
    intent,
    emotionalState,
    quality,
    engineVersion: SPARK_CONVERSATION_ENGINE_VERSION,
  };

  const ef = runExecutiveFunction({
    turnId: input.turnId,
    threadId: input.context.threadId,
    userId: input.userId,
    memberMessage: input.memberMessage,
    emotionalState,
    daysSinceLastActivity: input.daysSinceLastActivity,
    lastObjectiveSummary: context.objective.summary || undefined,
    openLoops: input.openLoops?.map((l) => ({
      id: l.id,
      label: l.label,
      source: (l.source as "conversation" | "project" | "task" | "guild" | "adventure") ?? "conversation",
    })),
  });

  return enrichConversationTurn(base, ef);
}

export {
  createInitialContext,
  type ConversationContext,
  type ConversationQualityScore,
  type ConversationState,
} from "./types";

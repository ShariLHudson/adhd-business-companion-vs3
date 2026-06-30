/**
 * Conversation state machine transitions.
 * Behavioral engine: Spec 107 — docs/SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md
 */

import type {
  ConversationAction,
  ConversationContext,
  ConversationIntent,
  ConversationState,
  EmotionalState,
} from "./types";

export function stateForIntent(intent: ConversationIntent): ConversationState {
  switch (intent) {
    case "creative":
      return "creating";
    case "research":
      return "researching";
    case "planning":
      return "planning";
    case "emotional_support":
      return "supporting";
    case "room_navigation":
      return "handoff_to_room";
    case "execution":
    case "simple_question":
    case "business_guidance":
    case "follow_up":
      return "responding";
    case "misunderstanding_recovery":
    case "interruption":
    case "topic_change":
      return "understanding";
    default:
      return "responding";
  }
}

export function transition(
  context: ConversationContext,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case "clarify":
      return "clarifying";
    case "handoff":
      return "handoff_to_room";
    case "respond":
      return action.nextState;
    default:
      return context.state;
  }
}

export function applyStateTransition(
  context: ConversationContext,
  action: ConversationAction,
): ConversationContext {
  const nextState = transition(context, action);

  const objective = { ...context.objective };
  if (action.type === "respond" && context.objective.summary) {
    objective.locked = true;
  }

  if (action.type === "clarify") {
    return {
      ...context,
      state: nextState,
      pendingClarification: {
        question: action.question,
        field: action.reason,
      },
      turnCount: context.turnCount + 1,
    };
  }

  if (action.type === "handoff") {
    return {
      ...context,
      state: nextState,
      pendingClarification: undefined,
      turnCount: context.turnCount + 1,
    };
  }

  return {
    ...context,
    state: nextState,
    pendingClarification: undefined,
    interrupted: false,
    objective,
    turnCount: context.turnCount + 1,
    lastIntent: action.type === "respond" ? undefined : context.lastIntent,
  };
}

export function handleInterruption(
  context: ConversationContext,
  message: string,
): ConversationContext {
  void message;
  return {
    ...context,
    state: "understanding",
    interrupted: true,
    pendingClarification: undefined,
  };
}

export function handleTopicChange(
  context: ConversationContext,
  newObjective: string,
  newOutcome: string,
): ConversationContext {
  const parked = context.objective.summary
    ? [...(context.multiTurnPlan?.parkedObjectives ?? []), context.objective.summary]
    : (context.multiTurnPlan?.parkedObjectives ?? []);

  return {
    ...context,
    state: "understanding",
    objective: {
      summary: newObjective,
      desiredOutcome: newOutcome,
      locked: false,
      completed: false,
    },
    multiTurnPlan: {
      steps: [],
      currentStepIndex: 0,
      parkedObjectives: parked,
    },
    pendingClarification: undefined,
  };
}

export function recoverFromMisunderstanding(context: ConversationContext): ConversationContext {
  return {
    ...context,
    state: "clarifying",
    pendingClarification: {
      question: "I want to get this right — what did you mean?",
      field: "misunderstanding_recovery",
    },
  };
}

export function resolveClarification(
  context: ConversationContext,
  answer: string,
): ConversationContext {
  void answer;
  return {
    ...context,
    state: "understanding",
    pendingClarification: undefined,
  };
}

export function markObjectiveComplete(context: ConversationContext): ConversationContext {
  return {
    ...context,
    state: "completed",
    objective: { ...context.objective, completed: true },
  };
}

export function emotionalToneHint(emotional: EmotionalState): string {
  switch (emotional) {
    case "overwhelmed":
      return "empathy_first";
    case "frustrated":
      return "steady_direct";
    case "urgent":
      return "brief_actionable";
    case "confused":
      return "clear_simple";
    default:
      return "warm_partner";
  }
}

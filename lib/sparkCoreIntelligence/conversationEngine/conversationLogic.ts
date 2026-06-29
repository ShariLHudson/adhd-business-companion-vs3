/**
 * Clarification, follow-up, continuity, multi-turn planning.
 */

import type {
  ConversationContext,
  ConversationIntent,
  EmotionalState,
  MultiTurnPlan,
} from "./types";

export type ClarificationDecision = {
  needed: boolean;
  question?: string;
  reason?: string;
};

export function evaluateClarification(
  message: string,
  intent: ConversationIntent,
  emotional: EmotionalState,
  context: ConversationContext,
): ClarificationDecision {
  if (context.pendingClarification) {
    return { needed: false };
  }

  const lower = message.toLowerCase();
  const trimmed = message.trim();

  if (intent === "misunderstanding_recovery") {
    return { needed: false };
  }

  if (emotional === "overwhelmed") {
    return {
      needed: true,
      question:
        "Is this more about venting, figuring out what to drop, or calling it a day without guilt?",
      reason: "emotional_objective_ambiguous",
    };
  }

  if (intent === "research" && !/\b(quick|deep|thorough|brief)\b/.test(lower)) {
    return {
      needed: true,
      question: "Do you want a quick take now, or should I do deeper research?",
      reason: "research_depth",
    };
  }

  if (
    intent === "creative" &&
    /\b(campaign|landing|page|offer)\b/.test(lower) &&
    !/\b(audience|sell|promot|offer|for who)\b/.test(lower)
  ) {
    return {
      needed: true,
      question: "What are you creating this for — and who is it for?",
      reason: "creative_audience",
    };
  }

  if (trimmed.length < 8) {
    return {
      needed: true,
      question: "Tell me a bit more about what you're hoping to get done.",
      reason: "insufficient_context",
    };
  }

  if (context.objective.locked && intent !== "topic_change" && intent !== "interruption") {
    return { needed: false };
  }

  return { needed: false };
}

export function buildFollowUpGuidance(context: ConversationContext): string {
  if (context.state === "completed" && context.objective.summary) {
    return `Continue from completed objective: ${context.objective.summary}`;
  }
  if (context.multiTurnPlan && context.multiTurnPlan.steps.length > 0) {
    const step = context.multiTurnPlan.steps[context.multiTurnPlan.currentStepIndex];
    return `Continue multi-turn plan at step: ${step}`;
  }
  return "Maintain thread continuity from prior turns.";
}

export function buildMultiTurnPlan(intent: ConversationIntent, message: string): MultiTurnPlan | undefined {
  const lower = message.toLowerCase();

  if (intent === "planning" && /\b(quarter|roadmap|90 day)\b/.test(lower)) {
    return {
      steps: ["Clarify goal", "Name priorities", "Sequence actions", "Define first step"],
      currentStepIndex: 0,
      parkedObjectives: [],
    };
  }

  if (intent === "creative" && /\b(launch|campaign)\b/.test(lower)) {
    return {
      steps: ["Audience", "Message", "Asset", "Next action"],
      currentStepIndex: 0,
      parkedObjectives: [],
    };
  }

  return undefined;
}

export function inferObjective(message: string, intent: ConversationIntent): {
  summary: string;
  desiredOutcome: string;
} {
  const trimmed = message.trim();
  if (intent === "emotional_support") {
    return {
      summary: "Reduce overwhelm and support the member",
      desiredOutcome: "Member feels lighter with one clear optional next step",
    };
  }
  return {
    summary: trimmed.length > 120 ? `${trimmed.slice(0, 120)}…` : trimmed,
    desiredOutcome: `Move the member forward on: ${trimmed.slice(0, 80)}`,
  };
}

export function continuityFromHistory(
  history: Array<{ role: string; content: string }> | undefined,
): string | undefined {
  if (!history?.length) return undefined;
  const lastSpark = [...history].reverse().find((h) => h.role === "spark");
  return lastSpark ? `Last Spark turn: ${lastSpark.content.slice(0, 120)}` : undefined;
}

/**
 * Ask vs answer decision and best next step.
 */

import type {
  AskVsAnswerDecision,
  ConfidenceLevel,
  MissingInfo,
  ReasoningMode,
} from "./types";

export function decideAskVsAnswer(
  missing: MissingInfo[],
  confidence: ConfidenceLevel,
  mode: ReasoningMode,
): { decision: AskVsAnswerDecision; question?: string } {
  const blocking = missing.filter((m) => m.severity === "blocking");

  if (blocking.length > 0) {
    return {
      decision: "ask",
      question: questionForField(blocking[0].field, mode),
    };
  }

  if (confidence === "low") {
    return {
      decision: "ask",
      question: "I want to get this right — what's the one detail that would change your answer most?",
    };
  }

  if (confidence === "medium" && missing.some((m) => m.severity === "helpful")) {
    return { decision: "answer_with_stated_assumptions" };
  }

  if (mode === "quick_answer" || mode === "coaching") {
    return { decision: "answer" };
  }

  return { decision: "answer" };
}

function questionForField(field: string, mode: ReasoningMode): string {
  switch (field) {
    case "request_detail":
      return "What are you hoping to get done — in a sentence or two?";
    case "audience_or_offer":
      return "What are you creating this for, and who is it for?";
    case "research_depth":
      return "Do you want a quick take now, or deeper research?";
    case "decision_context":
      return "What are you deciding between, and what would make either choice a win?";
    default:
      if (mode === "coaching") {
        return "Is this more about venting, prioritizing, or permission to pause?";
      }
      return "What's the most important thing for me to understand first?";
  }
}

export function inferBestNextStep(
  mode: ReasoningMode,
  decision: AskVsAnswerDecision,
  successLooksLike: string,
): string {
  if (decision === "ask") {
    return "Obtain one clarifying answer before recommending";
  }

  switch (mode) {
    case "quick_answer":
      return "Deliver concise answer";
    case "coaching":
      return "Acknowledge, then one tiny next step";
    case "planning":
      return "Name first priority in the plan";
    case "creative_reasoning":
      return "Start creating the smallest useful draft";
    case "decision_support":
      return "Frame decision and primary recommendation";
    case "research_reasoning":
      return "Scope research or deliver bounded findings";
    case "executive_board_reasoning":
      return "Summarize tradeoffs and recommended path";
    case "teaching_reasoning":
      return "Teach one principle with one example";
    case "reflective_reasoning":
      return "Mirror and invite one reflective prompt";
    default:
      return successLooksLike.slice(0, 80);
  }
}

/**
 * Conversation quality scoring.
 */

import type { ConversationQualityScore, ResponseDepth } from "./types";

const SOFTWARE_VOICE =
  /\b(error|failed|invalid|required|you must|as an ai)\b/i;

export function scoreConversationResponse(
  draftText: string,
  objectiveSummary: string,
  depth: ResponseDepth,
): ConversationQualityScore {
  const text = draftText.trim();
  const words = text.split(/\s+/).length;

  const objectiveAlignment =
    objectiveSummary.length > 0 && text.length > 0 ? (SOFTWARE_VOICE.test(text) ? 0.3 : 0.85) : 0.5;

  const clarity =
    words > 0 && words < 400 ? 0.9 : words >= 400 ? 0.55 : 0.4;

  const speed =
    depth === "simple" && words <= 80
      ? 0.95
      : depth === "empathy_first" && words <= 120
        ? 0.9
        : words <= 200
          ? 0.8
          : 0.6;

  const tone = SOFTWARE_VOICE.test(text) ? 0.2 : 0.88;

  const helpfulness =
    /\b(next|try|start|could|recommend)\b/i.test(text) || depth === "simple" ? 0.85 : 0.7;

  const focus =
    (text.match(/\b(by the way|also|additionally)\b/gi) ?? []).length > 1 ? 0.5 : 0.9;

  const nextStep =
    /\b(next step|first step|start with|try this)\b/i.test(text) ||
    (text.match(/\?/g) ?? []).length === 1
      ? 0.9
      : (text.match(/\?/g) ?? []).length > 1
        ? 0.4
        : 0.65;

  const scores = [
    objectiveAlignment,
    clarity,
    speed,
    tone,
    helpfulness,
    focus,
    nextStep,
  ];
  const overall = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    objectiveAlignment,
    clarity,
    speed,
    tone,
    helpfulness,
    focus,
    nextStep,
    overall,
    pass: overall >= 0.72 && tone >= 0.5 && focus >= 0.5,
  };
}

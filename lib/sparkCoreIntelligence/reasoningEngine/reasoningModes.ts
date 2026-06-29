/**
 * Reasoning mode selection — simplest path that fits.
 */

import type { ProblemNature, ReasoningMode } from "./types";

export function selectReasoningMode(
  message: string,
  problemNature: ProblemNature,
): ReasoningMode {
  const lower = message.toLowerCase();
  const len = message.trim().length;

  if (len < 45 && /\b(what is|define|how much)\b/.test(lower)) {
    return "quick_answer";
  }

  if (/\b(overwhelmed|stressed|can't)\b/.test(lower)) return "coaching";

  if (/\b(research|competitor|verify|market data)\b/.test(lower)) {
    return "research_reasoning";
  }

  if (/\b(raising|price|pricing|prices|margin)\b/.test(lower)) {
    return "decision_support";
  }

  if (/\b(decide|should i|which option|tradeoff)\b/.test(lower)) {
    return "decision_support";
  }

  if (/\b(board|investor|acquisition|pivot|high.?stakes)\b/.test(lower)) {
    return "executive_board_reasoning";
  }

  if (/\b(teach|explain|learn|how does)\b/.test(lower)) return "teaching_reasoning";

  if (/\b(reflect|journal|process)\b/.test(lower)) {
    return "reflective_reasoning";
  }

  if (/\b(campaign|marketing)\b/.test(lower)) {
    return "creative_reasoning";
  }

  if (/\b(plan|roadmap|prioritize|quarter)\b/.test(lower)) return "planning";

  if (/\b(create|write|design|draft|brainstorm)\b/.test(lower)) {
    return "creative_reasoning";
  }

  if (problemNature === "strategic" || /\b(strategy|position|grow)\b/.test(lower)) {
    return "strategic_reasoning";
  }

  if (len < 80) return "quick_answer";
  return "coaching";
}

export function detectProblemNature(message: string): ProblemNature {
  const lower = message.toLowerCase();
  if (/\b(overwhelmed|feel|scared|anxious|stressed)\b/.test(lower)) return "emotional";
  if (/\b(write|design|create|brand|story)\b/.test(lower)) return "creative";
  if (/\b(strategy|position|competitive|long.?term)\b/.test(lower)) return "strategic";
  if (/\b(send|implement|process|workflow|system)\b/.test(lower)) return "operational";
  if (/\b(what is|define|fact|data|stat)\b/.test(lower)) return "fact_based";
  return "strategic";
}

export function shouldOverthinkGuard(mode: ReasoningMode): boolean {
  return mode === "quick_answer" || mode === "coaching" || mode === "reflective_reasoning";
}

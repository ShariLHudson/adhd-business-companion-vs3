/**
 * Lightweight interaction classification for Response Intelligence scaffold.
 * Production should replace with Objective Engine integration.
 */

import type { InteractionClass, MemberNeed, PreComposeAnalysis } from "./types";

export function classifyInteraction(message: string): {
  interactionClass: InteractionClass;
  memberNeed: MemberNeed;
  responseDepth: PreComposeAnalysis["responseDepth"];
} {
  const lower = message.toLowerCase().trim();

  if (
    /\b(overwhelmed|overwhelm|exhausted|burned out|stressed|anxious|can't cope)\b/.test(lower)
  ) {
    return {
      interactionClass: "emotional_support",
      memberNeed: "coaching",
      responseDepth: "empathy_first",
    };
  }

  if (/\b(research|look up|find out|competitor|market data)\b/.test(lower)) {
    return {
      interactionClass: "research",
      memberNeed: "research",
      responseDepth: "evidence",
    };
  }

  if (/\b(write|draft|create|design|landing page|copy)\b/.test(lower)) {
    return {
      interactionClass: "creative_work",
      memberNeed: "creative_deliverable",
      responseDepth: "creative",
    };
  }

  if (/\b(learn|explain|how does|what is|teach me)\b/.test(lower)) {
    return {
      interactionClass: "learning",
      memberNeed: "direct_answer",
      responseDepth: "moderate",
    };
  }

  if (/\b(plan|prioritize|schedule|roadmap|quarter)\b/.test(lower)) {
    return {
      interactionClass: "planning",
      memberNeed: "plan",
      responseDepth: "moderate",
    };
  }

  if (/\b(decide|should i|which option|tradeoff)\b/.test(lower)) {
    return {
      interactionClass: "decision_making",
      memberNeed: "coaching",
      responseDepth: "executive",
    };
  }

  if (/\b(reflect|journal|process|thinking about)\b/.test(lower)) {
    return {
      interactionClass: "reflection",
      memberNeed: "coaching",
      responseDepth: "simple",
    };
  }

  if (/\b(do this|finish|complete|send|implement)\b/.test(lower)) {
    return {
      interactionClass: "execution",
      memberNeed: "direct_answer",
      responseDepth: "simple",
    };
  }

  if (/\b(strategy|grow|position|business model)\b/.test(lower)) {
    return {
      interactionClass: "business_strategy",
      memberNeed: "coaching",
      responseDepth: "executive",
    };
  }

  if (lower.length < 40 && !lower.includes("?")) {
    return {
      interactionClass: "execution",
      memberNeed: "direct_answer",
      responseDepth: "simple",
    };
  }

  return {
    interactionClass: "business_strategy",
    memberNeed: "coaching",
    responseDepth: "moderate",
  };
}

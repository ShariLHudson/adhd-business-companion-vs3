/**
 * Tone selection — match delivery to context; never dramatic.
 */

import type { AiTone } from "@/lib/companionStore";
import type { RciConversationArchetype } from "@/lib/reflectiveConversationIntelligence";
import type { ConversationalGoal, ExpressionToneBand } from "./types";

export function selectExpressionToneBand(input: {
  archetype?: RciConversationArchetype;
  goal: ConversationalGoal;
  userText: string;
}): ExpressionToneBand {
  const t = input.userText.toLowerCase();
  if (/\b(?:celebrat|proud|finally|won|great news)\b/.test(t)) {
    return "celebration";
  }
  if (
    input.archetype === "overwhelm" ||
    input.goal === "untangle-ideas" ||
    /\b(?:overwhelmed|too much|can't)\b/.test(t)
  ) {
    return "overwhelm";
  }
  if (
    input.archetype === "creative-block" ||
    /\b(?:creat|idea|campaign|blank page)\b/.test(t)
  ) {
    return "creative";
  }
  if (
    input.archetype === "business-decision" ||
    input.archetype === "planning" ||
    input.archetype === "opportunity-evaluation" ||
    input.goal === "compare-options" ||
    input.goal === "organize-thoughts"
  ) {
    return "business";
  }
  if (
    input.archetype === "reflection-after-event" ||
    input.goal === "process-experience" ||
    input.goal === "gain-perspective"
  ) {
    return "reflection";
  }
  return "everyday";
}

/** Soft pacing hints for expression — not a second personality. */
export function pacingHint(
  band: ExpressionToneBand,
  aiTone?: AiTone,
): { maxSentences: number; favorShort: boolean } {
  if (band === "overwhelm") return { maxSentences: 2, favorShort: true };
  if (band === "celebration") return { maxSentences: 2, favorShort: true };
  if (aiTone === "direct") {
    return { maxSentences: 2, favorShort: true };
  }
  if (band === "reflection" || band === "creative") {
    return { maxSentences: 3, favorShort: false };
  }
  return { maxSentences: 3, favorShort: false };
}

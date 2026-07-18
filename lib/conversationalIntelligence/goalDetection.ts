/**
 * Conversation goal detection — delivery support, not reasoning.
 */

import type { RciResponseKind } from "@/lib/reflectiveConversationIntelligence";
import type { ConversationalGoal, CuriosityObjective } from "./types";

export function detectConversationalGoal(input: {
  userText: string;
  responseKind: RciResponseKind | "help_offer" | "other";
}): ConversationalGoal {
  const t = input.userText.toLowerCase();

  if (/\b(?:celebrat|proud|finally did|won|excited|great news)\b/.test(t)) {
    return "build-confidence";
  }
  if (
    /\b(?:feel|feeling|hurt|angry|ashamed|anxious|scared)\b/.test(t) &&
    !/\b(?:decid|plan|option)\b/.test(t)
  ) {
    return "understand-emotions";
  }
  if (/\b(?:or|versus|vs\.?|between|option|whether)\b/.test(t)) {
    return "compare-options";
  }
  if (/\b(?:overwhelmed|too much|scattered|spinning|mess in my head)\b/.test(t)) {
    return "untangle-ideas";
  }
  if (/\b(?:happened|after|debrief|looking back|went)\b/.test(t)) {
    return "process-experience";
  }
  if (/\b(?:sort|organize|priorit|plan|list)\b/.test(t)) {
    return "organize-thoughts";
  }
  if (/\b(?:perspective|another way|am i crazy|seeing this wrong)\b/.test(t)) {
    return "gain-perspective";
  }
  if (input.responseKind === "invite-continue" || /\bjust thinking\b/.test(t)) {
    return "think-aloud";
  }
  return "other";
}

export function curiosityObjectiveForKind(
  kind: RciResponseKind | "help_offer" | "other",
): CuriosityObjective | null {
  switch (kind) {
    case "thoughtful-question":
    case "clarification":
      return "clarify";
    case "connection":
      return "connect-ideas";
    case "tentative-pattern":
      return "notice-patterns";
    case "future-feeling":
      return "imagine-outcomes";
    case "summary":
      return "prioritize";
    case "gentle-observation":
      return "examine-assumptions";
    default:
      return null;
  }
}

/**
 * Soft runtime use of gold standards — never copy full conversations.
 */

import { retrieveGoldStandardGuidance } from "./retrieval";
import type { GscRetrievalInput, GscRetrievalResult } from "./types";

/** True if draft matches a known blocked failure pattern. */
export function draftMatchesBlockedPattern(
  draft: string,
  blocked: readonly string[],
): boolean {
  const d = draft.trim().toLowerCase();
  return blocked.some((b) => {
    const needle = b.trim().toLowerCase();
    if (!needle) return false;
    return d === needle || d.includes(needle);
  });
}

/**
 * First grounded assistant question from the top hit (structure borrow only).
 */
export function suggestedGroundedQuestion(
  result: GscRetrievalResult,
): string | null {
  const top = result.hits[0]?.conversation;
  if (!top) return null;
  // Prefer first substantive assistant question after a user turn
  let sawUser = false;
  for (const turn of top.turns) {
    if (turn.role === "user") {
      sawUser = true;
      continue;
    }
    if (sawUser && turn.role === "assistant" && turn.content.includes("?")) {
      if (turn.move === "other") continue;
      return turn.content.trim();
    }
  }
  return null;
}

export function getTalkItOutGoldGuidance(input: GscRetrievalInput): GscRetrievalResult {
  return retrieveGoldStandardGuidance(input);
}

/**
 * If the draft is a known anti-pattern, return a structural replacement hint.
 */
export function replaceBlockedDraft(input: {
  draftText: string;
  userText: string;
  topicAnchor?: string | null;
  clarificationOrRepair?: boolean;
  rejectedInterpretations?: string[];
}): { text: string; replaced: boolean; guidance: GscRetrievalResult } {
  const guidance = retrieveGoldStandardGuidance({
    userText: input.userText,
    topicAnchor: input.topicAnchor,
    clarificationOrRepair: input.clarificationOrRepair,
    rejectedInterpretations: input.rejectedInterpretations,
  });

  if (!draftMatchesBlockedPattern(input.draftText, guidance.blockedFailurePatterns)) {
    return { text: input.draftText, replaced: false, guidance };
  }

  const suggested = suggestedGroundedQuestion(guidance);
  const topic = input.topicAnchor?.trim();
  if (suggested && guidance.confidence >= 0.25) {
    return { text: suggested, replaced: true, guidance };
  }
  if (topic) {
    return {
      text: `What is making you consider ${topic} now?`,
      replaced: true,
      guidance,
    };
  }
  return {
    text: "What part of this decision feels hardest to judge right now?",
    replaced: true,
    guidance,
  };
}

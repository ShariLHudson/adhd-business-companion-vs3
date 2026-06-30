/**
 * Spec 125 — Conversation Synthesis™
 */

import type { ConversationSynthesisCue } from "./types";

const TOPIC_SHIFT =
  /\b(also|another thing|different topic|switch gears|by the way|one more thing)\b/i;

const DECISION_OPEN =
  /\b(we still need|haven't decided|not sure yet|either .+ or)\b/i;

export function recommendSynthesis(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): ConversationSynthesisCue | null {
  if (history.length < 4) return null;

  if (TOPIC_SHIFT.test(message)) {
    return {
      appropriate: true,
      template: "discovered",
      guidance:
        "Before the new topic: briefly summarize what you've discovered together — then bridge.",
    };
  }

  if (DECISION_OPEN.test(message)) {
    return {
      appropriate: true,
      template: "still_decide",
      guidance:
        "Name what you've answered and what still needs deciding — reduce cognitive load.",
    };
  }

  const userTurns = countUserTurns(history);
  if (userTurns >= 4 && userTurns % 4 === 0) {
    return {
      appropriate: true,
      template: "answered",
      guidance:
        "Optional light synthesis — what you've answered so far — before the next question.",
    };
  }

  return null;
}

function countUserTurns(
  history: Array<{ role: "user" | "assistant"; content: string }>,
): number {
  return history.filter((line) => line.role === "user").length;
}

/**
 * Package 204 — Completion, Summary & Next-Step Intelligence.
 */

export type CompletionSignal =
  | "user_clear"
  | "user_done"
  | "asks_summary"
  | "exact_match"
  | "practical_next"
  | "repetition"
  | "none";

const CLEAR =
  /\b(?:that(?:'s| is) (?:exactly )?it|i(?:'m| am) (?:feeling )?clearer|that makes (?:it )?clearer|enough for now|we can stop(?: here)?)\b/i;
const DONE =
  /\b(?:i(?:'m| am) done|stop here|that(?:'s| is) enough|let(?:'s| us) stop)\b/i;
const SUMMARY =
  /\b(?:summarize|summary|sum (?:this|it) up|reflect back|what (?:have we|did we) (?:figure|sort) out)\b/i;
const PRACTICAL =
  /\b(?:next step|make a (?:plan|list)|write (?:the |a )?(?:job description|plan)|let(?:'s| us) (?:build|plan|create))\b/i;

export function detectCompletionSignal(userText: string): CompletionSignal {
  const t = userText.trim();
  if (!t) return "none";
  if (SUMMARY.test(t)) return "asks_summary";
  if (/\bthat(?:'s| is) exactly it\b/i.test(t)) return "exact_match";
  if (DONE.test(t)) return "user_done";
  if (CLEAR.test(t)) return "user_clear";
  if (PRACTICAL.test(t)) return "practical_next";
  return "none";
}

export function shouldStopQuestioning(signal: CompletionSignal): boolean {
  return (
    signal === "user_clear" ||
    signal === "user_done" ||
    signal === "asks_summary" ||
    signal === "exact_match"
  );
}

export function buildTalkItOutSummary(input: {
  topicAnchor?: string | null;
  knownFacts?: readonly string[];
  currentFocus?: string | null;
  concerns?: readonly string[];
}): string {
  const topic =
    input.topicAnchor?.trim() ||
    input.knownFacts?.[0]?.slice(0, 80) ||
    "what you brought in";
  const clearer =
    input.concerns?.slice(0, 2).join(" and ") ||
    input.currentFocus ||
    "what you want to protect in the decision";
  const unresolved =
    input.currentFocus &&
    !String(clearer).toLowerCase().includes(input.currentFocus.toLowerCase())
      ? input.currentFocus
      : "what would make the next step feel sound";

  return `You started with ${topic}. What became clearer is ${clearer}. The part that still needs sorting is ${unresolved}.`;
}

export function buildCompletionResponse(input: {
  signal: CompletionSignal;
  summary: string;
  topicAnchor?: string | null;
}): string {
  switch (input.signal) {
    case "asks_summary":
    case "exact_match":
    case "user_clear":
      return `${input.summary}\n\nWhat's the smallest next move, in your words?`;
    case "user_done":
      return `${input.summary}\n\nWe can stop here. Nothing needs to be finished today.`;
    case "practical_next":
      return `There it is.\n\nWhat's the smallest next move, in your words?`;
    default:
      return input.summary;
  }
}

export const TIO_GENERIC_CLOSING_BANNED = [
  "Is there anything else?",
  "Would you like more help?",
  "I am here if you need me.",
  "What else would you like to discuss?",
  "Great job working through that.",
  "Let me know if there's anything else",
  "Great question",
  "That makes total sense",
] as const;

export function isGenericClosing(text: string): boolean {
  const t = text.trim().toLowerCase();
  return TIO_GENERIC_CLOSING_BANNED.some((b) => t === b.toLowerCase());
}

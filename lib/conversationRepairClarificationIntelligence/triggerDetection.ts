/**
 * Detect when communication has broken down — pause reflective questioning.
 */

import type { CrciMessage, CrciRepairTrigger } from "./types";

const PATTERNS: { trigger: CrciRepairTrigger; re: RegExp }[] = [
  {
    trigger: "what-do-you-mean",
    re: /\b(?:what do you mean|what do(?:es)? that mean|what(?:'s| is) that (?:supposed to )?mean|mean by that)\b/i,
  },
  {
    trigger: "dont-understand",
    re: /\b(?:i (?:do not|don't) understand|not sure (?:i|what you)|lost (?:me|you)|doesn't land)\b/i,
  },
  {
    trigger: "explain",
    re: /\b(?:can you explain|explain (?:that|what you meant)|say that (?:again|differently)|in plain (?:english|words))\b/i,
  },
  {
    trigger: "doesnt-make-sense",
    re: /\b(?:that does(?:n't| not) make sense|doesn't make sense|makes no sense)\b/i,
  },
  {
    trigger: "confused",
    re: /\b(?:i(?:'m| am) confused|this is confusing|confused (?:about|by)|you lost me)\b/i,
  },
];

/** Short non-answers that often mean the last question wasn't understood. */
const NON_ANSWER =
  /^(?:huh|what\??|idk|i don't know|dunno|\?+|…|\.\.\.|hmm+|uh+|um+)\.?$/i;

export function detectRepairTrigger(
  userText: string,
): CrciRepairTrigger | null {
  const t = userText.trim();
  if (!t) return null;
  for (const { trigger, re } of PATTERNS) {
    if (re.test(t)) return trigger;
  }
  if (NON_ANSWER.test(t)) return "ignored-question";
  return null;
}

/**
 * Heuristic: user reply is very short while last assistant asked a specific question,
 * and the reply does not engage the question content.
 */
export function detectMisunderstoodAnswer(
  userText: string,
  messages: readonly CrciMessage[],
): boolean {
  const t = userText.trim();
  if (t.length > 80) return false;
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (!lastAssistant?.content.includes("?")) return false;
  if (detectRepairTrigger(t)) return true;
  // Pure deflection without addressing content
  if (
    /^(?:ok|okay|sure|whatever|i guess|maybe|idk|i don't know)\.?$/i.test(t)
  ) {
    return true;
  }
  return false;
}

export function resolveRepairTrigger(
  userText: string,
  messages: readonly CrciMessage[],
): CrciRepairTrigger | null {
  const direct = detectRepairTrigger(userText);
  if (direct) return direct;
  if (detectMisunderstoodAnswer(userText, messages)) {
    return "misunderstood-answer";
  }
  return null;
}

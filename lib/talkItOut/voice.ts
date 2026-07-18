/**
 * Talk It Out — Shari voice helpers (warm, natural, non-scripted).
 */

/** Natural openings — rotate; never default every turn to the same phrase. */
export const SHARI_VOICE_OPENINGS = [
  "Can I ask you something?",
  "I am curious about one part of that.",
  "What keeps pulling your attention back to this?",
  "Which part feels heaviest right now?",
  "What do you think is making this harder than it looks?",
  "What would you most like to understand before you decide?",
  "Is there a part of this you already know the answer to but do not quite trust yet?",
  "What feels unresolved?",
  "What are you hoping will be different?",
  "What feels hardest to judge about this right now?",
] as const;

/** Soft observation stems — meaning/tension, not paraphrase. */
export const SHARI_OBSERVATIONS = [
  "I wonder if the hard part is not the work itself, but that nothing feels like a safe place to begin.",
  "It may be less about having too much, and more about everything feeling equally urgent.",
  "There might be a tension between what you already know and what feels risky to act on.",
  "Something here seems to be asking for clarity before courage — or maybe the other way around.",
  "I am hearing a pull between protecting yourself and wanting to move forward.",
  "This may be less about the decision, and more about what the decision would say about you.",
  "It sounds like part of you is ready, and another part is still guarding something important.",
  "Maybe the easy part to name is not the part that needs the most clarity.",
] as const;

/** Phrases that must not dominate Talk It Out turns. */
export const SHARI_VOICE_AVOID_DEFAULTS = [
  "It sounds like",
  "I hear you saying",
  "What I am hearing is",
  "Thank you for sharing",
  "That sounds difficult",
  "Let us explore that",
  "How does that make you feel",
] as const;

export type TalkItOutResponseKind =
  | "observation"
  | "question"
  | "observation_then_question"
  | "invite_continue"
  | "future_feeling"
  | "help_offer"
  | "repair";

export function pickRotating<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!;
}

/** Significant tokens for overlap checks (skip tiny / stop words). */
const STOP = new Set([
  "the",
  "and",
  "that",
  "this",
  "with",
  "have",
  "from",
  "your",
  "you",
  "are",
  "was",
  "were",
  "for",
  "not",
  "but",
  "about",
  "just",
  "like",
  "what",
  "when",
  "then",
  "than",
  "they",
  "them",
  "their",
  "there",
  "been",
  "being",
  "will",
  "would",
  "could",
  "should",
  "into",
  "over",
  "more",
  "some",
  "keep",
  "know",
  "need",
  "want",
  "think",
]);

export function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

/**
 * Share of user significant tokens that also appear in the assistant text.
 * High ratio ≈ close paraphrase.
 */
export function userTokenOverlapRatio(
  userText: string,
  assistantText: string,
): number {
  const user = significantTokens(userText);
  if (user.length === 0) return 0;
  const assistant = new Set(significantTokens(assistantText));
  let hit = 0;
  for (const token of user) {
    if (assistant.has(token)) hit += 1;
  }
  return hit / user.length;
}

/** Longest shared contiguous word sequence length (words). */
export function longestSharedPhraseWords(
  userText: string,
  assistantText: string,
): number {
  const a = userText
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const b = assistantText
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (a.length === 0 || b.length === 0) return 0;
  let best = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let k = 0;
      while (
        i + k < a.length &&
        j + k < b.length &&
        a[i + k] === b[j + k]
      ) {
        k += 1;
      }
      if (k > best) best = k;
    }
  }
  return best;
}

export function isTooCloseToUser(
  userText: string,
  assistantText: string,
): boolean {
  if (longestSharedPhraseWords(userText, assistantText) >= 5) return true;
  if (userTokenOverlapRatio(userText, assistantText) >= 0.55) return true;
  return false;
}

export function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

export function usesAvoidedDefaultScript(text: string): boolean {
  const lower = text.toLowerCase();
  return SHARI_VOICE_AVOID_DEFAULTS.some((p) =>
    lower.includes(p.toLowerCase()),
  );
}

/**
 * RCI repetition guard — never echo the user's wording.
 */

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
  "feel",
]);

export function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
}

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

export function ensureSingleQuestion(text: string): string {
  if (countQuestions(text) <= 1) return text;
  const idx = text.indexOf("?");
  if (idx < 0) return text;
  return text.slice(0, idx + 1).trim();
}

/** Scripted therapy / AI defaults that must not dominate. */
const AVOID_DEFAULTS = [
  "it sounds like",
  "i hear you saying",
  "what i am hearing is",
  "thank you for sharing",
  "that sounds difficult",
  "let us explore that",
  "how does that make you feel",
];

export function usesAvoidedDefaultScript(text: string): boolean {
  const lower = text.toLowerCase();
  return AVOID_DEFAULTS.some((p) => lower.includes(p));
}

export function sanitizeAgainstUser(userText: string, draft: string): string {
  if (!isTooCloseToUser(userText, draft) && !usesAvoidedDefaultScript(draft)) {
    return ensureSingleQuestion(draft);
  }
  const fallbacks = [
    "I am curious about one part of that. Which part feels heaviest right now?",
    "Tell me if I am reading this wrong — what feels unresolved?",
    "What do you think is making this harder than it looks?",
    "What would you most like to understand before you decide?",
  ];
  const pick = fallbacks[Math.abs(userText.length + draft.length) % fallbacks.length]!;
  return ensureSingleQuestion(pick);
}

/**
 * Shared, dependency-free text matching used by both the activation
 * composition function (resolveChamberExpertActivation.ts) and the
 * Chamber Intelligence selection layer (lib/chamberIntelligence/). One
 * tokenizer/matcher, not two — extracted here so the selection layer
 * reuses it instead of re-implementing matching logic.
 */

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "for",
  "and",
  "or",
  "my",
  "our",
  "your",
  "is",
  "are",
  "i",
  "we",
  "you",
  "it",
  "this",
  "that",
  "need",
  "want",
  "on",
  "in",
  "with",
  "do",
  "does",
  "help",
  "me",
  "just",
  "please",
  "can",
  "could",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): Set<string> {
  return new Set(normalize(text).split(" ").filter(Boolean));
}

export function significantWords(phrase: string): string[] {
  return normalize(phrase)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
}

/** A phrase matches when every one of its significant words appears in the text. */
export function phraseMatches(phrase: string, textWords: Set<string>): boolean {
  const words = significantWords(phrase);
  if (words.length === 0) return false;
  return words.every((w) => textWords.has(w));
}

/** True if ANY of the given phrases matches the tokenized text. */
export function anyPhraseMatches(phrases: readonly string[], textWords: Set<string>): boolean {
  return phrases.some((phrase) => phraseMatches(phrase, textWords));
}

/** Rough, deterministic token estimate for prompt-budget enforcement (~4 chars/token). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

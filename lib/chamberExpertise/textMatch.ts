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

export type TopicMatchResult = {
  phraseMatch: boolean;
  keywordMatch: boolean;
};

/**
 * Shared by resolveChamberExpertActivation.ts (V1) and
 * resolveChamberExpertActivationV2.ts — a multi-word signal that matches
 * is Tier-1 evidence (`phraseMatch`); a single-word signal that matches is
 * weaker Tier-2 evidence (`keywordMatch`). One tokenizer, one tier
 * definition, used everywhere phrases are scored against user text.
 */
export function computeTopicMatch(
  signals: readonly string[],
  textWords: Set<string>,
): TopicMatchResult {
  let phraseMatch = false;
  let keywordMatch = false;

  for (const signal of signals) {
    const words = significantWords(signal);
    if (words.length === 0) continue;
    if (!phraseMatches(signal, textWords)) continue;
    if (words.length >= 2) {
      phraseMatch = true;
    } else {
      keywordMatch = true;
    }
  }

  return { phraseMatch, keywordMatch };
}

/** Rough, deterministic token estimate for prompt-budget enforcement (~4 chars/token). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * V2-2: splits raw member text on coordinating conjunctions ("and", "but",
 * "or", "as well as", "plus") into independent clauses, so a structurally
 * compound request ("pricing my course AND how to market it", "don't know
 * what to charge OR how to sell it") can be scored clause-by-clause
 * instead of as one bag of words — the only way to reliably detect a
 * genuine co-primary request. Returns null when there's nothing to split
 * (a single clause), so callers can fall back to whole-text scoring
 * without a special case.
 *
 * "or" was added after the founder-language validation set
 * (docs/estate/CHAMBER_ACTIVATION_V2_VALIDATION_SET.md) found it's just
 * as common a way founders phrase two coordinated needs ("I don't know X
 * or Y") as "and"/"but" — the existing false-positive guard (both
 * clauses must clear a real threshold AND resolve to different experts)
 * protects this addition the same way it already protects the others.
 *
 * Deliberately simple string splitting, not NLP — every corpus case this
 * exists for uses a plain, everyday conjunction. See
 * docs/estate/CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §4.
 */
const CONJUNCTION_SPLIT = /\s+(?:and|but|or|as well as|plus)\s+/gi;

export function splitOnConjunctions(text: string): readonly string[] | null {
  const parts = text
    .split(CONJUNCTION_SPLIT)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length < 2) return null;
  return parts;
}

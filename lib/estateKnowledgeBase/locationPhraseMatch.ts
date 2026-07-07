/**
 * Shared location phrase matching — longest phrase wins, word boundaries.
 */

export function normalizeLocationPhrase(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

const NAV_VERB_PREFIX_RE =
  /^(?:take me to|go to|let(?:'s| us) go to|open|show me|visit|head to|bring me to|can we go to)\s+(?:the\s+)?/i;

export function stripNavigationVerbsFromQuery(query: string): string {
  return query
    .trim()
    .replace(NAV_VERB_PREFIX_RE, "")
    .replace(/[™®.!?]+$/g, "")
    .trim();
}

export function phraseContainedInText(
  text: string,
  phrase: string,
): boolean {
  const normalized = normalizeLocationPhrase(text);
  const normalizedPhrase = normalizeLocationPhrase(phrase);
  if (!normalized || !normalizedPhrase) return false;

  if (normalized === normalizedPhrase) return true;

  const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i").test(normalized);
}

export type PhraseMatch<T> = {
  item: T;
  phrase: string;
  length: number;
};

/** Longest matching phrase wins — never use bidirectional includes. */
export function longestPhraseMatch<T>(
  query: string,
  candidates: readonly T[],
  getPhrase: (item: T) => string,
  opts?: { probeText?: string },
): PhraseMatch<T> | null {
  const probe = normalizeLocationPhrase(opts?.probeText ?? query);
  if (!probe) return null;

  let best: PhraseMatch<T> | null = null;

  for (const item of candidates) {
    const phrase = normalizeLocationPhrase(getPhrase(item));
    if (!phrase) continue;
    if (!phraseContainedInText(probe, phrase)) continue;
    if (!best || phrase.length > best.length) {
      best = { item, phrase, length: phrase.length };
    }
  }

  return best;
}

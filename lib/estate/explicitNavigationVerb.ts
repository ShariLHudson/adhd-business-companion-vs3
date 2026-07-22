/**
 * Explicit destination navigation verbs.
 *
 * Rule: if the member's first verb is a navigation verb, resolve destination
 * routing before conversational capability, workflow, or content-generation intent.
 *
 * Verbs: go · take (me) · open · show · enter · bring me to
 */

/** Optional soft opener before the navigation verb. */
const LEADING_POLITE_PREFIX =
  "(?:(?:please|just|now)\\s+|can you\\s+|could you\\s+|would you\\s+|will you\\s+)?";

/**
 * Matches when the utterance begins with an explicit navigation verb
 * (after optional politeness). Bare "take" without "me" is excluded —
 * that catches "Take a Moment" / "Take a breath", not destination routing.
 */
export const LEADING_EXPLICIT_NAVIGATION_VERB_RE = new RegExp(
  `^\\s*${LEADING_POLITE_PREFIX}(?:go(?:\\s+to)?\\b|take\\s+me(?:\\s+to)?\\b|bring\\s+me(?:\\s+to)?\\b|open\\b|show(?:\\s+me)?\\b|enter\\b)`,
  "i",
);

/** True when destination routing must own the turn before create/workflow/chat capability. */
export function hasLeadingExplicitNavigationVerb(userText: string): boolean {
  const trimmed = userText.trim();
  if (!trimmed) return false;
  return LEADING_EXPLICIT_NAVIGATION_VERB_RE.test(trimmed);
}

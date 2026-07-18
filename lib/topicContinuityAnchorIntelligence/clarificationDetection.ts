/** Clarification / confusion requests — never new topics. */

const CLARIFICATION =
  /\b(?:what do(?:es)? that mean|what do you mean|what(?:'s| is) that (?:supposed to )?mean|i (?:do not|don't) understand|can you explain(?: that)?|explain that|that makes no sense|does(?:n't| not) make sense|i(?:'m| am) confused|this is confusing)\b/i;

const SHORT_CLARIFY = /^(?:what\??|huh\??|huh\.?|\?+|explain\.?)$/i;

export function isClarificationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (SHORT_CLARIFY.test(t)) return true;
  return CLARIFICATION.test(t);
}

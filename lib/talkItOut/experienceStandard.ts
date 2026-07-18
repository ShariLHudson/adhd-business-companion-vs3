/**
 * Package 200 — Talk It Out Product & Experience Standard.
 */

export const TIO_PRODUCT_PROMISE =
  "Talk It Out helps a user think more clearly by giving them a calm, grounded place to say what is on their mind and work through it in conversation." as const;

export const TIO_CANONICAL_OPENING =
  "What would you like to talk through?" as const;

/** Member-facing copy that must never appear in Talk It Out openings. */
export const TIO_OPENING_FORBIDDEN = [
  "How are you feeling",
  "Choose a category",
  "Pick a topic",
  "Here are some options",
  "Let's dive in",
] as const;

export function isCanonicalOpening(text: string): boolean {
  return text.trim() === TIO_CANONICAL_OPENING;
}

/** First-response checklist (for tests / QA). */
export function certifyFirstResponse(input: {
  text: string;
  userText: string;
}): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const t = input.text.trim();
  if (!t) issues.push("empty");
  if (/\b(?:quieter question underneath|something underneath)\b/i.test(t)) {
    issues.push("hidden_meaning");
  }
  if (/\blet'?s stay with\b/i.test(t)) issues.push("generic_template");
  if (/\bwhat part feels most useful\b/i.test(t)) issues.push("generic_template");
  if (/\btake your time\b/i.test(t)) issues.push("generic_template");
  if ((t.match(/\?/g) ?? []).length > 1) issues.push("stacked_questions");
  if (t.length > 420) issues.push("too_long");
  if (/^(?:that seems important|i understand|i hear you)\.?$/i.test(t)) {
    issues.push("generic_empathy");
  }
  return { passed: issues.length === 0, issues };
}

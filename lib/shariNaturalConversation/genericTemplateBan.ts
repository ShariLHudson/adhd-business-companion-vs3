/**
 * Package 208 — Rule 3: ban generic conversation templates as default moves.
 *
 * Concrete grounded questions ("What part of the explanation feels hardest…")
 * are allowed. Empty coaching shells are not.
 */

/** Coaching shells that must not ship as default conversation moves. */
export const GENERIC_TEMPLATE_PATTERNS: readonly RegExp[] = [
  /\blet'?s stay with\b/i,
  /\bwhat part feels most useful\b/i,
  /\bwhat part of that(?: decision)? feels hardest\b/i,
  /^what part feels hardest\b/i,
  /^tell me more\.?$/i,
  /\btell me more\.?\s*$/i,
  /\bwhat matters most\b/i,
  /\btake your time(?: with that)?\b/i,
  /\bthere may be something underneath\b/i,
  /\b(?:quieter question|something) underneath\b/i,
];

export function containsGenericConversationTemplate(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return GENERIC_TEMPLATE_PATTERNS.some((re) => re.test(t));
}

/** Soft human-language failures — scripted / template feel. */
export function failsHumanLanguageTest(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (containsGenericConversationTemplate(t)) return true;
  if (
    /\b(?:great question|let'?s dive in|here'?s a breakdown|as an ai|in conclusion)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /^(?:i understand\.?|i hear you\.?|that makes sense\.?|that seems important\.?)$/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

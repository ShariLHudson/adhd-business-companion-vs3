/**
 * Overwrite boundary for answer-first repair.
 *
 * Fallbacks fill absence — they do not replace substance. Once a substantive,
 * displayable answer has streamed and finalized, a LOCAL generic fallback
 * (buildAnswerFirstFailSafeReply / buildFollowUpAdaptedReply) must not overwrite
 * it, even if a soft excellence/style gate flags it. A successful MODEL repair is
 * always allowed to improve the answer, per the existing repair contract.
 */

/** Minimum characters for a finalized answer to count as a real, showable reply. */
export const MIN_DISPLAYABLE_ANSWER_CHARS = 24;
/** Minimum whitespace-separated words for a real, showable reply. */
export const MIN_DISPLAYABLE_ANSWER_WORDS = 4;

/**
 * True when a finalized assistant answer is substantive and displayable — a real
 * reply the user can use, even if imperfect, wordy, or stylistically weak.
 * Empty, whitespace-only, or tiny-fragment results are NOT displayable.
 */
export function isDisplayableAssistantAnswer(
  text: string | null | undefined,
): boolean {
  const t = (text ?? "").trim();
  if (t.length < MIN_DISPLAYABLE_ANSWER_CHARS) return false;
  if (!/[a-z]/i.test(t)) return false;
  return t.split(/\s+/).filter(Boolean).length >= MIN_DISPLAYABLE_ANSWER_WORDS;
}

/**
 * Whether a LOCAL generic fallback may replace the finalized answer.
 *  - never when a successful model repair already produced a replacement, and
 *  - never when the finalized answer is substantive / displayable.
 * It may replace only genuine absence (empty / whitespace / unusable fragment).
 */
export function localFallbackMayReplace(input: {
  finalizedAnswer: string | null | undefined;
  hasModelRepair: boolean;
}): boolean {
  if (input.hasModelRepair) return false;
  return !isDisplayableAssistantAnswer(input.finalizedAnswer);
}

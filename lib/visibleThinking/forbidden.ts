/** Language Visible Thinking must never use. */
export const FORBIDDEN_VISIBLE_THINKING_RE =
  /\b(?:loading(?:\.\.\.)?|processing(?:\.\.\.)?|generating response|analyzing(?:\.\.\.)?|running ai|consulting intelligence|searching database|pipeline|orchestration|reasoning engine|ai module)\b/i;

const EXACT_FORBIDDEN_VISIBLE_THINKING_RE =
  /^(?:thinking|analyzing|loading|processing)(?:\.\.\.)?\.?$/i;

export function isForbiddenVisibleThinkingMessage(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (EXACT_FORBIDDEN_VISIBLE_THINKING_RE.test(t)) return true;
  return FORBIDDEN_VISIBLE_THINKING_RE.test(t);
}

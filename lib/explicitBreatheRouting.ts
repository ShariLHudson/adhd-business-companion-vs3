/**
 * Explicit breathe / breath-reset requests — must not be blocked by stress routing.
 */

const EXPLICIT_BREATHE_RE =
  /\b(?:take a breath|take a moment to breathe|just (?:take a )?breathe|need to breathe|help me breathe|breathing exercise|breathe and reset|open (?:the )?breathe|start breathing|try breathing|breathing reset)\b/i;

export function isExplicitBreatheRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (EXPLICIT_BREATHE_RE.test(t)) return true;
  if (
    /\b(?:calm down|calm myself|calm my body)\b/i.test(t) &&
    /\b(?:breath|breathe|breathing)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

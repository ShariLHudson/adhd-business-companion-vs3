/**
 * Marketing Plan domain detection for Create / Anywhere-Origin (105).
 * Leaves Event gathering language and generic document create alone.
 */

const MARKETING_PLAN_RE =
  /\b(?:simple\s+)?marketing\s+plans?\b|\bmarket(?:ing)?\s+this\s+offer\b|\bturn\s+this\s+project\s+into\s+a\s+marketing\s+plan\b|\bmarketing\s+blueprint\b/i;

/**
 * True when the request should resolve through UWE Marketing Plan Work Type.
 * Does not claim every use of the word "marketing".
 */
export function isMarketingPlanCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return MARKETING_PLAN_RE.test(t);
}

/**
 * Leaf helper — keep free of orchestrator/lifecycle imports to avoid cycles.
 */

const DETOUR_QUESTION_RE = /\?\s*$/;

const REVISION_RE =
  /\b(?:add|include|insert|remove|delete|shorten|lengthen|make (?:it |the (?:tone|subject) )?warmer|make (?:it |the (?:tone|subject) )?shorter|change (?:the )?(?:date|price|tone|subject)|revise|edit|update|free[- ]?delivery|warmer|cooler|open with gratitude|more grateful|friendlier)\b/i;

export function isCreateRevisionInstruction(userText: string): boolean {
  const t = userText.trim();
  if (!t || DETOUR_QUESTION_RE.test(t)) return false;
  return REVISION_RE.test(t) && t.split(/\s+/).length <= 24;
}

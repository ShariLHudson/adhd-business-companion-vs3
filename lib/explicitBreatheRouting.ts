/**
 * Explicit Breathe requests — must not be blocked by stress routing.
 * Defers to Universal Access aliases (#183) — Breathe is not a Focus sub-feature.
 */

import { isBreatheUniversalRequest } from "@/lib/universalAccess/breatheUniversalAccess";

const LEGACY_EXPLICIT_BREATHE_RE =
  /\b(?:take a breath|take a moment to breathe|just (?:take a )?breathe|need to breathe|need a reset|breathing exercise|breathe and reset|try breathing|breathing reset)\b/i;

export function isExplicitBreatheRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isBreatheUniversalRequest(t)) return true;
  if (LEGACY_EXPLICIT_BREATHE_RE.test(t)) return true;
  if (
    /\b(?:calm down|calm myself|calm my body)\b/i.test(t) &&
    /\b(?:breath|breathe|breathing)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

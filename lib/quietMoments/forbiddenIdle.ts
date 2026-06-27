/**
 * Quiet Moments — copy and UI patterns forbidden during silence.
 */

import type { ForbiddenIdleCopyVerdict } from "./types";

export const FORBIDDEN_IDLE_SURVEILLANCE = [
  /\bare you still there\b/i,
  /\bstill (?:here|with me|online)\b/i,
  /\bhaven'?t heard from you\b/i,
  /\bwhere did you go\b/i,
  /\bhello\?\s*$/i,
  /\bwaiting for (?:you|your)\b/i,
  /\bsession (?:expir|timeout)\b/i,
  /\byou'?ve been idle\b/i,
  /\binactiv(?:e|ity)\b/i,
] as const;

export const FORBIDDEN_IDLE_ENTERTAINMENT = [
  /\btip of the day\b/i,
  /\bdid you know\b/i,
  /\bfun fact\b/i,
  /\bproductivity tip\b/i,
  /\bmotivational\b/i,
  /\byou should try\b/i,
  /\bdon'?t forget to\b/i,
  /\bwhile you wait\b/i,
  /\btype here\b/i,
  /\bstart typing\b/i,
  /\bsay something\b/i,
] as const;

export const FORBIDDEN_IDLE_QUOTE_ROTATION = [
  /\binspir(?:ing|ational) quote\b/i,
  /\bquote of the day\b/i,
  /\brotating (?:fact|tip|message)\b/i,
] as const;

const ALL_FORBIDDEN = [
  ...FORBIDDEN_IDLE_SURVEILLANCE,
  ...FORBIDDEN_IDLE_ENTERTAINMENT,
  ...FORBIDDEN_IDLE_QUOTE_ROTATION,
];

export function isForbiddenIdleCopy(text: string): ForbiddenIdleCopyVerdict {
  const t = text.trim();
  if (!t) return { forbidden: false, reason: null };

  for (const pattern of FORBIDDEN_IDLE_SURVEILLANCE) {
    if (pattern.test(t)) {
      return { forbidden: true, reason: "idle surveillance — never punish stillness" };
    }
  }
  for (const pattern of FORBIDDEN_IDLE_ENTERTAINMENT) {
    if (pattern.test(t)) {
      return { forbidden: true, reason: "idle entertainment — Quiet Moments trusts silence" };
    }
  }
  for (const pattern of FORBIDDEN_IDLE_QUOTE_ROTATION) {
    if (pattern.test(t)) {
      return { forbidden: true, reason: "rotating idle content — no quotes or tips while waiting" };
    }
  }

  return { forbidden: false, reason: null };
}

export function assertNotForbiddenIdleCopy(text: string): void {
  const verdict = isForbiddenIdleCopy(text);
  if (verdict.forbidden) {
    throw new Error(`Quiet Moments: ${verdict.reason}: "${text.slice(0, 60)}"`);
  }
}

/** Anchor must never flash, pulse, or demand attention during quiet. */
export const COMMUNICATION_ANCHOR_QUIET_RULES = {
  noFlash: true,
  noPulse: true,
  noTypeHerePlaceholder: true,
  noPlaceholderRotation: true,
  noAutoFocusDuringQuiet: true,
  alwaysReachable: true,
} as const;

export function anyForbiddenIdlePattern(text: string): boolean {
  return ALL_FORBIDDEN.some((p) => p.test(text));
}

/**
 * Wisdom of Restraint — patterns that break trust or add noise.
 */

export const RESTRAINT_PERFORMANCE_PATTERNS = [
  /\blook what i remembered\b/i,
  /\bi'?ve prepared (?:\d+|\w+)\s+suggestions?\b/i,
  /\bi found (?:\d+|\w+)\b/i,
  /\b\d+ suggestions?\b/i,
  /\b\d+ opportunities?\b/i,
  /\b\d+ options?\b/i,
  /\bi'?ve been monitoring\b/i,
  /\bbased on your (?:data|activity|history)\b/i,
] as const;

/** Data-gathering curiosity — not caring conversation. */
export const RESTRAINT_CURIOSITY_PATTERNS = [
  /\bwhat industry are you in\b/i,
  /\bhow many employees\b/i,
  /\bwhat is your revenue\b/i,
  /\bhow much do you (?:make|earn)\b/i,
  /\bwhat tools do you use\b/i,
  /\bwhat platform\b/i,
] as const;

export const RESTRAINT_WHY_ABSENCE_PATTERNS = [
  /\bwhy (?:haven'?t|didn'?t|weren'?t)\b/i,
  /\bwhat kept you\b/i,
  /\bwhere have you been\b/i,
  /\bwhy so long\b/i,
] as const;

/** Quiet Moments — never punish stillness or surveil idle guests. */
export const RESTRAINT_IDLE_SURVEILLANCE_PATTERNS = [
  /\bare you still there\b/i,
  /\bstill (?:here|with me|online)\b/i,
  /\bhaven'?t heard from you\b/i,
  /\bwhere did you go\b/i,
  /\byou'?ve been idle\b/i,
] as const;

export function violatesRestraintVoice(text: string): boolean {
  return (
    RESTRAINT_PERFORMANCE_PATTERNS.some((p) => p.test(text)) ||
    RESTRAINT_CURIOSITY_PATTERNS.some((p) => p.test(text)) ||
    RESTRAINT_IDLE_SURVEILLANCE_PATTERNS.some((p) => p.test(text))
  );
}

export function asksWhyAfterAbsence(
  text: string,
  returnIntervalDays?: number | null,
): boolean {
  if ((returnIntervalDays ?? 0) < 28) return false;
  return RESTRAINT_WHY_ABSENCE_PATTERNS.some((p) => p.test(text));
}

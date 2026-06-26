/**
 * Carry Forward™ — constitutional bans; yesterday never judges today.
 */

export const CARRY_FORWARD_FORBIDDEN_PATTERNS = [
  /\bincomplete tasks?\b/i,
  /\bstill have \d+/i,
  /\byou completed \d+/i,
  /\bmissed tasks?\b/i,
  /\bbroken streak/i,
  /\bfailed\b/i,
  /\bguilt\b/i,
  /\boverdue\b/i,
  /\bproductivity stat/i,
  /\bi noticed\b/i,
  /\bmy records show\b/i,
  /\byou usually\b/i,
  /\bbased on your history\b/i,
  /\bgoals? (?:are )?still\b/i,
  /\bnegative score/i,
  /\byou're behind\b/i,
] as const;

export const CARRY_FORWARD_ALLOWED_CARRIES = [
  "confidence",
  "hope",
  "momentum",
  "permission",
  "peace",
  "curiosity",
  "encouragement",
  "gratitude",
  "accomplishment",
  "progress",
  "warmth",
  "relationship",
] as const;

export function violatesCarryForwardLine(text: string): boolean {
  return CARRY_FORWARD_FORBIDDEN_PATTERNS.some((p) => p.test(text.trim()));
}

export function isValidCarryForwardLine(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return !violatesCarryForwardLine(t);
}

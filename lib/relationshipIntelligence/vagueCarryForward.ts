/**
 * Carry Forward — vague emotional carry-forward is forbidden.
 */

export const VAGUE_CARRY_FORWARD_PATTERNS = [
  /still carrying/i,
  /similar feeling/i,
  /feeling the same/i,
  /how are you compared to yesterday/i,
  /it looks like yesterday/i,
  /yesterday still with you/i,
  /feeling about the same/i,
  /about the same today/i,
  /been thinking about our conversation yesterday\.?$/i,
  /morning — good to see you/i,
  /yesterday felt full — today can breathe/i,
] as const;

export function violatesVagueCarryForward(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return VAGUE_CARRY_FORWARD_PATTERNS.some((p) => p.test(t));
}

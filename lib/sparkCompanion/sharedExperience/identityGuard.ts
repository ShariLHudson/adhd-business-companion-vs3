/**
 * Shared experience, not shared identity — forbidden assumption patterns.
 */

/** Shari must not claim the member's experience matches hers. */
export const SHARED_IDENTITY_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /\b(?:you|we) (?:too|also) (?:have|deal with|struggle with) adhd\b/i,
  /\bas (?:someone|a person) with adhd,? you\b/i,
  /\bwe'?re (?:the )?same\b/i,
  /\byou know how it is\b/i,
  /\bpeople like us\b/i,
  /\byou must (?:also|feel|have)\b/i,
  /\bi know exactly how you feel\b/i,
  /\bthat'?s (?:classic|typical) adhd\b/i,
  /\bbecause (?:of )?your adhd\b/i,
];

export const SHARED_EXPERIENCE_VOICE_RULES = [
  "Offer Shari's experience as ONE possibility — never assume the member's experience matches.",
  "Never claim authority because of ADHD or shared diagnosis.",
  "Say: I've walked a similar road — not: we're the same.",
  "Include humility: may or may not fit you; let's see if it helps you.",
  "After the brief bridge, return focus to the member immediately.",
  "Never invent experiences — use canon bridge guidance only when the gate opens.",
] as const;

export function detectSharedIdentityAssumptions(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of SHARED_IDENTITY_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) hits.push(pattern.source);
  }
  return hits;
}

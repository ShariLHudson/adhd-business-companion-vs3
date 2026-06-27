/**
 * Memory Triggers — story-first rules; never announce the room.
 */

export const MEMORY_TRIGGER_ANNOUNCEMENT_BANS = [
  /\bthe room smells\b/i,
  /\bit smells like\b/i,
  /\byou can smell\b/i,
  /\bthe air smells\b/i,
  /\bit sounds like\b/i,
  /\byou can hear\b/i,
  /\bthe room feels\b/i,
  /\bsensory\b/i,
  /\baromatherapy\b/i,
] as const;

/** Staged perfection — not Shari's homestead */
export const MEMORY_TRIGGER_AUTHENTICITY_BANS = [
  /\bgourmet\b/i,
  /\belaborate (?:feast|spread|dinner)\b/i,
  /\bperfectly clean\b/i,
  /\bspotless\b/i,
  /\bmartha stewart\b/i,
  /\bfive-course\b/i,
  /\bmichelin\b/i,
] as const;

export const MEMORY_TRIGGER_PRINCIPLE =
  "Story creates the sensory experience — guests remember, not read descriptions." as const;

export const MEMORY_TRIGGER_FREQUENCY = {
  /** Many visits have no trigger — silence is acceptable */
  eligibleVisitModulo: 4,
  maxCuesPerVisit: 1,
  defaultCooldownDays: 21,
} as const;

export function violatesMemoryTriggerAnnouncement(text: string): boolean {
  return MEMORY_TRIGGER_ANNOUNCEMENT_BANS.some((p) => p.test(text.trim()));
}

export function violatesMemoryTriggerAuthenticity(text: string): boolean {
  return MEMORY_TRIGGER_AUTHENTICITY_BANS.some((p) => p.test(text.trim()));
}

export function isValidMemoryTriggerStoryLine(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (violatesMemoryTriggerAnnouncement(t)) return false;
  if (violatesMemoryTriggerAuthenticity(t)) return false;
  return true;
}

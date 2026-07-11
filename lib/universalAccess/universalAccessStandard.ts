/**
 * Universal Access Standard — runtime mirror of Architecture Library #183.
 *
 * Rooms provide context and recommendations. They do not restrict functionality.
 * Explicit capability requests always win over current location.
 *
 * @see docs/estate/recognition/library/183_UNIVERSAL_ACCESS_STANDARD.md
 */

export const UNIVERSAL_ACCESS_LAW =
  "Every capability must be available from every room, page, experience, and conversation unless there is a true technical or permission limitation." as const;

/** Routing priority — intent always beats location. */
export const UNIVERSAL_ACCESS_ROUTING_ORDER = [
  "member-intent",
  "explicit-command",
  "current-active-experience",
  "current-room-context",
  "recommended-workspace",
  "default-fallback",
] as const;

export const UNIVERSAL_ACCESS_NEVER_SAY = [
  "You can't do that here.",
  "This feature is not available in this room.",
  "Go to another page first.",
  "That only works in…",
] as const;

export const UNIVERSAL_ACCESS_FULFILL_LINES = [
  "I can do that.",
  "Let's open that.",
  "I'll bring that up.",
  "We can do that right here.",
] as const;

export function pickUniversalAccessFulfillLine(seed = 0): string {
  const i = Math.abs(seed) % UNIVERSAL_ACCESS_FULFILL_LINES.length;
  return UNIVERSAL_ACCESS_FULFILL_LINES[i]!;
}

export function violatesUniversalAccessBlockLanguage(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    /\byou can'?t do that here\b/.test(t) ||
    /\bnot available in this room\b/.test(t) ||
    /\bgo to another (?:page|room|place) first\b/.test(t) ||
    /\bthat only works in\b/.test(t)
  );
}

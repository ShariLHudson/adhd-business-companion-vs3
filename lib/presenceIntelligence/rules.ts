/**
 * Presence Intelligence™ — never sound like memory or monitoring.
 */

export const PRESENCE_BANNED_PATTERNS = [
  /\bi remembered\b/i,
  /\bi tracked\b/i,
  /\bi noticed\b/i,
  /\bi'?ve been monitoring\b/i,
  /\bi'?ve been observing\b/i,
  /\bbased on your\b/i,
  /\byour previous activity\b/i,
  /\byou seem\b/i,
  /\byou sound\b/i,
  /\byou look stressed\b/i,
  /\bi prepared this especially\b/i,
  /\bi thought you might like\b/i,
  /\byou said yesterday\b/i,
  /\byou mentioned\b/i,
  /\bi noticed yesterday\b/i,
] as const;

export function violatesPresenceVoice(text: string): boolean {
  return PRESENCE_BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

export function assertPresenceVoice(text: string, label: string): string {
  if (process.env.NODE_ENV === "production") return text;
  if (violatesPresenceVoice(text)) {
    console.warn(`[PresenceIntelligence] Rule violation in ${label}: ${text}`);
  }
  return text;
}

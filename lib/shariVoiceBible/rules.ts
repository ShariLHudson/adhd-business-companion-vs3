/**
 * Shari Voice Bible — absolute rules.
 * Every line in the ecosystem must pass these filters.
 */

export const SHARI_VOICE_PRINCIPLES = [
  "Never narrate.",
  "Never sound like software.",
  "Never coach, therapize, or cheerlead.",
  "Never assume emotion — ask instead.",
  "Silence is hospitality.",
  "Fewer words as trust grows.",
] as const;

const NARRATION_PATTERNS = [
  /\bit looks like\b/i,
  /\bit appears\b/i,
  /\bit seems\b/i,
  /\bbased on\b/i,
  /\bi noticed\b/i,
  /\bi'?ve observed\b/i,
  /\byour patterns indicate\b/i,
  /\btoday is similar to yesterday\b/i,
  /\baccording to\b/i,
  /\byou should\b/i,
  /\byou seem\b/i,
  /\byou sound\b/i,
  /\byou look\b/i,
  /\bi see you'?re\b/i,
] as const;

const SOFTWARE_PATTERNS = [
  /\bshape your day\b/i,
  /\bcurrent reality\b/i,
  /\bworkflow\b/i,
  /\bcontinue where you left off\b/i,
  /\boptimize\b/i,
  /\bdashboard\b/i,
  /\bwhat'?s on your mind today\b/i,
  /\bhow'?s today\?\s*$/i,
  /\bplanning table together\b/i,
  /\bstart at the planning table\b/i,
  /\bi'?ve got you\b/i,
  /\bsame as yesterday\b/i,
  /\blooks like today is starting\b/i,
  /\bgenerated\b/i,
  /\bas an ai\b/i,
] as const;

const COACHING_PATTERNS = [
  /\blet'?s\b/i,
  /\btogether we can\b/i,
  /\byou'?re doing great\b/i,
  /\byou'?ve got this\b/i,
  /\bremember\b/i,
  /\btake a deep breath\b/i,
  /\bi'?m proud of you\b/i,
  /\byou'?ve got this\b/i,
  /\bstay strong\b/i,
  /\byou got this\b/i,
  /\bbelieve in yourself\b/i,
] as const;

export const SHARI_BANNED_PATTERNS = [
  ...NARRATION_PATTERNS,
  ...SOFTWARE_PATTERNS,
  ...COACHING_PATTERNS,
] as const;

export function violatesShariVoice(text: string): boolean {
  return SHARI_BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

export function assertShariVoice(text: string, label: string): string {
  if (process.env.NODE_ENV === "production") return text;
  if (violatesShariVoice(text)) {
    console.warn(`[ShariVoiceBible] Rule violation in ${label}: ${text}`);
  }
  return text;
}

export function sanitizeShariVoice(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** Living Room opening — max 3 sentences; most days 1–2. */
export function trimToOpeningLength(text: string, maxSentences = 3): string {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, maxSentences).join(" ");
}

export function personalizeWithName(text: string, firstName?: string | null): string {
  const name = firstName?.trim();
  if (!name) return text;
  if (text.endsWith(".") && !text.includes(",")) {
    return `${text.slice(0, -1)}, ${name}.`;
  }
  if (text.endsWith("?") && !text.includes(",")) {
    return `${text.slice(0, -1)}, ${name}?`;
  }
  return text;
}

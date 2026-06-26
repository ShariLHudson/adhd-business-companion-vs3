/**
 * Shari's Life Moments™ — never advice, always invitation.
 */

export const LIFE_MOMENT_ADVICE_PATTERNS = [
  /\byou should\b/i,
  /\byou need to\b/i,
  /\byou could try\b/i,
  /\btry taking\b/i,
  /\bhave you tried\b/i,
  /\bi recommend\b/i,
  /\byou might want to\b/i,
  /\bconsider (?:taking|trying|doing)\b/i,
  /\bwhy don'?t you\b/i,
] as const;

export function violatesLifeMomentVoice(text: string): boolean {
  return LIFE_MOMENT_ADVICE_PATTERNS.some((pattern) => pattern.test(text));
}

export function assertLifeMomentVoice(text: string, label: string): string {
  if (process.env.NODE_ENV === "production") return text;
  if (violatesLifeMomentVoice(text)) {
    console.warn(`[SharisLifeMoments] Advice voice in ${label}: ${text}`);
  }
  if (!/\bI\b/.test(text) && !/\bI'm\b/i.test(text) && !/\bI've\b/i.test(text)) {
    console.warn(`[SharisLifeMoments] Missing first-person in ${label}: ${text}`);
  }
  return text;
}

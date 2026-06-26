/**
 * Shari's Everyday Life™ — environmental storytelling rules.
 * The home tells the story. Shari never narrates the staging.
 */

export const EVERYDAY_LIFE_NARRATION_BANS = [
  /\bi'?ve been (?:crocheting|reading|working|gardening|watering)\b/i,
  /\bi watered\b/i,
  /\bi picked\b/i,
  /\bi made\b/i,
  /\bi'?ve prepared\b/i,
  /\bi left (?:this|that) out for you\b/i,
  /\bfor you\b/i,
  /\bready if you want\b/i,
  /\bwaiting for you\b/i,
] as const;

export function violatesEverydayLifeNarration(text: string): boolean {
  return EVERYDAY_LIFE_NARRATION_BANS.some((pattern) => pattern.test(text));
}

export const EVERYDAY_LIFE_PRINCIPLE =
  "Life happens without explanation — guests notice, never are told." as const;

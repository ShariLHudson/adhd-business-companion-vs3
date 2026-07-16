/**
 * Breathe Universal Access — capability is not a room.
 * Launch as a full-screen destination from anywhere; restore prior workspace on close.
 */

export type BreathePatternHint = "relaxing" | "box" | "relax478" | "equal";

export type BreatheLaunchOptions = {
  /** Pre-select pattern when the member named one (e.g. box breathing). */
  patternId?: BreathePatternHint;
  /** Optional session length in minutes. */
  minutes?: number;
};

/**
 * Phrases that open Breathe without requiring a separate open/start verb.
 * Breathe is a universal capability — not a Focus sub-feature / Wander place.
 *
 * Bare overwhelm ("I'm overwhelmed") is NOT permission to launch Breathe —
 * that stays in conversation / overwhelm need routing.
 */
export const BREATHE_UNIVERSAL_PATTERN =
  /\b(?:help me breathe|let'?s breathe|i need (?:to breathe|a reset)|i need to calm down|calm me down|help me (?:calm down|reset)|start(?:\s+a)?\s+breathing(?:\s+exercise)?|open(?:\s+the)?\s+breathe|take me to breathe|breathe(?:\s+and\s+reset)?|breathing exercise|box breathing|four[\s-]?seven[\s-]?eight|4[\s-]?7[\s-]?8(?:\s+breathing)?)\b/i;

export const BREATHE_UNIVERSAL_ALIASES = [
  "help me breathe",
  "let's breathe",
  "I need to breathe",
  "I need a reset",
  "calm me down",
  "I need to calm down",
  "Help me calm down",
  "help me reset",
  "start breathing",
  "box breathing",
  "4-7-8 breathing",
  "open Breathe",
  "Take me to Breathe",
] as const;

export function detectBreathePatternHint(text: string): BreathePatternHint | undefined {
  const t = text.trim().toLowerCase();
  if (/\bbox breathing\b/.test(t) || /\bbox breath\b/.test(t)) return "box";
  if (
    /\bfour[\s-]?seven[\s-]?eight\b/.test(t) ||
    /\b4[\s-]?7[\s-]?8\b/.test(t)
  ) {
    return "relax478";
  }
  if (/\bequal breath/.test(t)) return "equal";
  if (/\brelaxing breath/.test(t)) return "relaxing";
  return undefined;
}

export function isBreatheUniversalRequest(text: string): boolean {
  return BREATHE_UNIVERSAL_PATTERN.test(text.trim());
}

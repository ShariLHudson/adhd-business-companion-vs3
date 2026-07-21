/**
 * 101 — Warm, grounded recognition language (no cheerleading).
 */

export const RECOGNITION_LANGUAGE = {
  meaningfulProgress: "That was meaningful progress.",
  followedThrough: "You followed through on something that had been difficult.",
  worthRecognizing: "This is worth recognizing.",
  substantial: "You completed something substantial.",
  movedBusiness: "This moved your business forward.",
  celebrateHere: "You did it. This moved your business forward.",
  quietStretch: "A quiet stretch — still belonging here.",
} as const;

const BANNED_SNIPPETS = [
  "amazing!!!",
  "you're crushing it",
  "level up",
  "streak",
  "keep the streak",
  "great job!!!",
] as const;

export function recognitionCopyPassesTone(text: string): boolean {
  const lower = text.toLowerCase();
  if ((text.match(/!/g) || []).length > 1) return false;
  return !BANNED_SNIPPETS.some((b) => lower.includes(b));
}

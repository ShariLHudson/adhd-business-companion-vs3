/**
 * Beginner visual-choice gate for Cartographer's Studio.
 * "I don't know which visual I need" → Recommend One / I'll Choose.
 */

export const VISUAL_BEGINNER_CHOICE_LINE =
  "I can recommend the best visual, or you can explore them yourself." as const;

export const VISUAL_BEGINNER_RECOMMEND_LABEL = "Recommend One" as const;
export const VISUAL_BEGINNER_CHOOSE_LABEL = "I'll Choose" as const;

const BEGINNER_UNSURE_RE =
  /\b(?:i\s+don'?t\s+know\s+which\s+visual(?:\s+i\s+need)?|not\s+sure\s+which\s+visual(?:\s+i\s+need)?|which\s+visual\s+(?:should\s+i|do\s+i\s+need)|help\s+me\s+choose\s+(?:a\s+)?visual|i'?m\s+not\s+sure\s+which\s+(?:map|visual))\b/i;

export function detectsVisualBeginnerUnsure(text: string): boolean {
  return BEGINNER_UNSURE_RE.test(text.trim());
}

export function formatVisualBeginnerChoiceMessage(): string {
  return [
    VISUAL_BEGINNER_CHOICE_LINE,
    "",
    `1. ${VISUAL_BEGINNER_RECOMMEND_LABEL}`,
    `2. ${VISUAL_BEGINNER_CHOOSE_LABEL}`,
    "",
    "Reply with 1 or 2, or the button name.",
  ].join("\n");
}

export type VisualBeginnerChoice = "recommend" | "explore";

export function parseVisualBeginnerChoice(
  text: string,
): VisualBeginnerChoice | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (
    /^(?:1|one|first)$/.test(t) ||
    /\brecommend(?:\s+one)?\b/.test(t) ||
    /\byou\s+choose\b|\bpick\s+for\s+me\b/.test(t)
  ) {
    return "recommend";
  }
  if (
    /^(?:2|two|second)$/.test(t) ||
    /\bi'?ll\s+choose\b|\bi\s+will\s+choose\b|\bexplore\b|\bchoose\s+(?:myself|for\s+myself)\b/.test(
      t,
    )
  ) {
    return "explore";
  }
  return null;
}

export function isVisualBeginnerChoiceMessage(text: string): boolean {
  return (
    text.includes(VISUAL_BEGINNER_CHOICE_LINE) ||
    (/\brecommend one\b/i.test(text) && /\bi'?ll choose\b/i.test(text))
  );
}

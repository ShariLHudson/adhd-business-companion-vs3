/**
 * Emotional-first action second — minimal runtime for frictionless emotional canon flow.
 */

export type EmotionalFirstActionSecondDecision = {
  depth: "emotional_first" | "none";
};

export function evaluateEmotionalFirstActionSecond(input: {
  userText: string;
}): EmotionalFirstActionSecondDecision {
  const t = input.userText.trim();
  if (!t) return { depth: "none" };
  if (
    /\b(?:can'?t seem to relax|panic|anxious|overwhelm(?:ed|ing)?|grief|i miss)\b/i.test(
      t,
    )
  ) {
    return { depth: "emotional_first" };
  }
  return { depth: "none" };
}

export function buildCanonicalEmotionalLocalReply(
  userText: string,
): string | null {
  const decision = evaluateEmotionalFirstActionSecond({ userText });
  if (decision.depth !== "emotional_first") return null;
  return "I'm here with you. What's weighing on you most right now?";
}

export function emotionalFirstActionSecondHintForChat(input: {
  userText: string;
}): string {
  return [
    "EMOTIONAL FIRST: Reflect before solving. One warm question only.",
    `Member said: "${input.userText.trim()}"`,
  ].join("\n");
}

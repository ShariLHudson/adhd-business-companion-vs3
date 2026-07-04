import { planEmotionalFirstResponse } from "@/lib/conversation/emotionalFirstResponseSequence";
import {
  evaluateEmotionalFirstActionSecond,
  matchCanonicalEmotionalOpening,
} from "./evaluateEmotionalFirstActionSecond";
import {
  EMOTIONAL_FIRST_ACTION_SECOND_RULES,
  EMOTIONAL_FIRST_ESTATE_WELCOME,
  EMOTIONAL_FIRST_FINAL_PRINCIPLE,
  ESTATE_EMOTIONAL_PHILOSOPHY,
  PRODUCTIVITY_RUSH_FORBIDDEN,
  SIGNATURE_SPARK_QUESTIONS,
} from "./principles";
import {
  EMOTIONAL_FIRST_GOVERNING_QUESTION,
  EMOTIONAL_FIRST_SUCCESS,
  type EmotionalFirstActionSecondHintInput,
} from "./types";

export function emotionalFirstActionSecondHintForChat(
  input: EmotionalFirstActionSecondHintInput,
): string {
  const decision = evaluateEmotionalFirstActionSecond({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });
  const plan = planEmotionalFirstResponse({ text: input.userText });
  const canonical = matchCanonicalEmotionalOpening(input.userText);

  const lines = [
    "EMOTIONAL FIRST, ACTION SECOND™:",
    `Ask internally: "${EMOTIONAL_FIRST_GOVERNING_QUESTION}"`,
    `Success: ${EMOTIONAL_FIRST_SUCCESS}`,
  ];

  if (decision.depth === "task_first") {
    lines.push(
      "",
      "DEPTH: Task-first — help with the task. Do not therapize or over-emotionalize.",
      "One thoughtful question if needed, then action.",
    );
    return lines.join("\n");
  }

  if (decision.depth === "direct_command") {
    lines.push("", "DEPTH: Direct command — act or navigate. No emotional layering.");
    return lines.join("\n");
  }

  if (decision.depth === "curious") {
    lines.push("", "DEPTH: Curious — explore with them. Match their energy.");
    return lines.join("\n");
  }

  lines.push(
    "",
    "RULES:",
    ...EMOTIONAL_FIRST_ACTION_SECOND_RULES.map((r) => `- ${r}`),
    "",
    `FORBIDDEN rush-to-productivity: ${PRODUCTIVITY_RUSH_FORBIDDEN.join(" · ")}`,
  );

  if (decision.depth === "emotional_first" || plan.requiresEmotionalFirstSequence) {
    lines.push(
      "",
      `Moment may need: ${decision.momentNeeds.join(", ") || "being understood"}.`,
      "Reflect and normalize BEFORE tools, rooms, or strategies.",
    );

    if (canonical) {
      lines.push(
        "",
        `CANON OPENING (adapt naturally): "${canonical.guidance}"`,
        canonical.avoid,
      );
    }

    lines.push(
      "",
      "Signature questions (pick ONE if helpful — not all):",
      ...SIGNATURE_SPARK_QUESTIONS.slice(0, 3).map((q) => `- ${q}`),
    );
  }

  lines.push("", EMOTIONAL_FIRST_FINAL_PRINCIPLE);

  return lines.join("\n");
}

export function estateEmotionalPhilosophyHint(placeId: string): string | null {
  const message = ESTATE_EMOTIONAL_PHILOSOPHY[placeId];
  if (!message) return null;
  return `Estate emotional tone (${placeId}): "${message}" — atmosphere, not feature pitch.`;
}

export { EMOTIONAL_FIRST_PROMPT_BLOCK, EMOTIONAL_FIRST_ESTATE_WELCOME } from "./principles";

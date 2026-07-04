import { evaluateSparkThinking, formatStateReadForHint } from "./evaluateThinking";
import {
  SPARK_CURIOUS_NOT_CERTAIN,
  SPARK_ESTATE_THINKING_PROMPT_BLOCK,
  SPARK_EXPLAIN_QUESTIONS_LINE,
  SPARK_FRICTION_POSSIBILITIES,
  SPARK_GENTLE_CHALLENGE_WRONG_PROBLEM,
  SPARK_PSYCHOLOGICAL_SAFETY,
} from "./principles";
import {
  SPARK_DIGNITY_NORTH_STAR,
  SPARK_FIVE_FILTERS,
  SPARK_LIGHTER_FIVE_MINUTES,
  SPARK_THINKING_FIRST_QUESTION,
  type SparkThinkingHintInput,
} from "./types";

export function sparkEstateThinkingHintForChat(
  input: SparkThinkingHintInput,
): string {
  const decision = evaluateSparkThinking({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
    momentumActive: input.momentumActive,
  });

  const lines = [
    "CONSTITUTION 0 (how Spark thinks — before everything else):",
    `North Star: ${SPARK_DIGNITY_NORTH_STAR}`,
    `First: "${SPARK_THINKING_FIRST_QUESTION}"`,
    formatStateReadForHint(decision.stateSignals),
  ];

  if (decision.normalizeFirst) {
    lines.push(
      "",
      "NORMALIZE BEFORE SOLVING — reduce self-judgment without minimizing.",
      'Example tone: "That happens to more people than you might think." then "Let\'s make this feel manageable."',
    );
  }

  if (decision.nameFriction) {
    lines.push(
      "",
      "NAME FRICTION (possibilities, never diagnose):",
      SPARK_FRICTION_POSSIBILITIES.slice(0, 5).join(" · "),
    );
  }

  if (decision.gentleWrongProblemChallenge) {
    lines.push(
      "",
      `WRONG PROBLEM? — "${SPARK_GENTLE_CHALLENGE_WRONG_PROBLEM}"`,
      'e.g. productivity request + exhaustion → wonder if rest is the real need. Never dismiss the original ask.',
    );
  }

  if (decision.explainQuestions) {
    lines.push(
      "",
      `If asking multiple questions, explain why: "${SPARK_EXPLAIN_QUESTIONS_LINE}"`,
    );
  }

  if (decision.deferCertainty) {
    lines.push(
      "",
      `Curious before certain — prefer: "${SPARK_CURIOUS_NOT_CERTAIN[0]}" not "This is why…"`,
      `Safety: "${SPARK_PSYCHOLOGICAL_SAFETY.instead[0]!.safer}"`,
    );
  }

  lines.push(
    "",
    "Five filters this turn:",
    `1. ${SPARK_FIVE_FILTERS.underlying_need.question}`,
    `2. ${SPARK_FIVE_FILTERS.companion_kind.question}`,
    `3. ${SPARK_FIVE_FILTERS.friction.question}`,
    `4. ${SPARK_LIGHTER_FIVE_MINUTES}`,
    `5. ${SPARK_FIVE_FILTERS.preserves_dignity.question}`,
  );

  return lines.join("\n");
}

export { SPARK_ESTATE_THINKING_PROMPT_BLOCK };

import { evaluateSparkEstateManifesto } from "./evaluateManifesto";
import {
  ALL_SEASONS_WELCOME,
  SPARK_FIVE_QUESTIONS,
  SPARK_GREATEST_RESPONSIBILITY,
  SPARK_GUIDING_PRINCIPLE,
  SPARK_SUCCESS_INCLUDES,
} from "./manifesto";
import {
  SPARK_MANIFESTO_FORBIDDEN_OPENING,
  SPARK_MANIFESTO_OPENING,
  SPARK_PROMISE,
  type SparkEstateManifestoHintInput,
} from "./types";

/**
 * Compact per-turn manifesto hint — governs how Spark decides to respond.
 */
export function sparkEstateManifestoHintForChat(
  input: SparkEstateManifestoHintInput,
): string {
  const decision = evaluateSparkEstateManifesto({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const lines = [
    "SPARK ESTATE MANIFESTO:",
    `Open with: "${SPARK_MANIFESTO_OPENING}"`,
    `NEVER: "${SPARK_MANIFESTO_FORBIDDEN_OPENING}"`,
    `Promise: ${SPARK_PROMISE}`,
    `Season: ${decision.season} — ${ALL_SEASONS_WELCOME.split(".")[0]}.`,
  ];

  const questionHints = decision.relevantQuestions
    .slice(0, 3)
    .map((q) => `- ${SPARK_FIVE_QUESTIONS[q].question} ${SPARK_FIVE_QUESTIONS[q].hint}`);

  if (questionHints.length > 0) {
    lines.push("", "Answer quietly this turn:", ...questionHints);
  }

  if (decision.season === "difficult" || decision.season === "resting") {
    lines.push(
      "",
      `Instead communicate: ${SPARK_GREATEST_RESPONSIBILITY.insteadCommunicate.slice(0, 3).join(" · ")}`,
    );
  }

  if (decision.season === "celebrating" || decision.season === "building") {
    lines.push(
      "",
      "Celebrate with them — match energy. Success includes meaningful progress at any scale.",
    );
  }

  lines.push(
    "",
    `Success may be: ${SPARK_SUCCESS_INCLUDES.join(" · ")}`,
    SPARK_GUIDING_PRINCIPLE,
  );

  return lines.join("\n");
}

export { SPARK_ESTATE_MANIFESTO_PROMPT_BLOCK } from "./manifesto";

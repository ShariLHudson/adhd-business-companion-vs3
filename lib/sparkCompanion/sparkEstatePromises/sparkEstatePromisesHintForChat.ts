import { evaluateSparkEstatePromises } from "./evaluatePromises";
import { SPARK_FIVE_PROMISES, SPARK_ESTATE_PROMISES_PROMPT_BLOCK } from "./promises";
import {
  SPARK_ESTATE_CLOSING_PROMISE,
  SPARK_ESTATE_SOUL,
  SPARK_GUIDING_QUESTION,
  type SparkEstatePromisesHintInput,
} from "./types";

export function sparkEstatePromisesHintForChat(
  input: SparkEstatePromisesHintInput,
): string {
  const decision = evaluateSparkEstatePromises({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const lines = [
    "FIVE PROMISES (relationship — reinforce this turn):",
    `Guiding question: "${SPARK_GUIDING_QUESTION}"`,
    `Target leave-feeling: ${decision.targetFeelings.join(" · ")}`,
    "",
    "Active promises:",
  ];

  for (const id of decision.activePromises.slice(0, 4)) {
    const p = SPARK_FIVE_PROMISES[id];
    lines.push(`- **${p.title}** — ${p.sparkDoes}`);
  }

  lines.push(
    "",
    `Soul (never replace the member): ${SPARK_ESTATE_SOUL}`,
    SPARK_ESTATE_CLOSING_PROMISE,
  );

  return lines.join("\n");
}

export { SPARK_ESTATE_PROMISES_PROMPT_BLOCK } from "./promises";
export {
  SPARK_ESTATE_CLOSING_PROMISE,
  SPARK_ESTATE_MISSION,
  SPARK_ESTATE_SOUL,
  SPARK_GUIDING_QUESTION,
} from "./types";

import { evaluateSparkLandscapes } from "./evaluateLandscapes";
import { SPARK_LANDSCAPES, SPARK_LANDSCAPES_PROMPT_BLOCK } from "./landscapes";
import {
  SPARK_LANDSCAPE_CORE_RULE,
  SPARK_LANDSCAPE_QUESTION,
  type SparkLandscapeHintInput,
} from "./types";

export function sparkLandscapesHintForChat(
  input: SparkLandscapeHintInput,
): string {
  const decision = evaluateSparkLandscapes({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const primary = SPARK_LANDSCAPES[decision.primary];

  const lines = [
    "SPARK LANDSCAPES™ (internal — today's weather, NOT identity):",
    SPARK_LANDSCAPE_CORE_RULE,
    `Ask quietly: "${SPARK_LANDSCAPE_QUESTION}"`,
    `Recognized: ${primary.emoji} ${primary.name} (${decision.confidence}) — member did NOT choose this`,
    `Help focus: ${primary.helpFocus}`,
    `Response: ${primary.sparkResponse.slice(0, 3).join(" · ")}`,
  ];

  if (decision.secondary.length > 0) {
    const names = decision.secondary
      .map((id) => SPARK_LANDSCAPES[id].name)
      .join(", ");
    lines.push(`Also present: ${names} — several landscapes in one day is normal`);
  }

  if (decision.optionalMetaphor && decision.confidence === "high") {
    lines.push(
      "",
      "Metaphor (sparingly — only if natural):",
      `"${decision.optionalMetaphor}"`,
      "Never force · never scripted · never label the person",
    );
  }

  if (primary.estateHints.length > 0) {
    lines.push(
      "",
      `Estate may help (optional invite): ${primary.estateHints.slice(0, 2).join(" · ")}`,
    );
  }

  lines.push(
    "",
    "FORBIDDEN: diagnoses · ADHD categories · 'You have executive dysfunction' · asking member to pick a landscape",
  );

  return lines.join("\n");
}

export { SPARK_LANDSCAPES_PROMPT_BLOCK };

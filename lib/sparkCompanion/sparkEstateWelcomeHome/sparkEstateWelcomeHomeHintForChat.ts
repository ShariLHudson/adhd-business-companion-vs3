import {
  containsForbiddenAbsenceCopy,
  evaluateSparkWelcomeHome,
} from "./evaluateWelcomeHome";
import {
  SPARK_ESTATE_WELCOME_HOME_PROMPT_BLOCK,
  SPARK_FORBIDDEN_ABSENCE_COPY,
} from "./principles";
import {
  SPARK_BEGIN_TODAY_OPENINGS,
  SPARK_WELCOME_HOME_GUIDING_QUESTION,
  SPARK_WELCOME_HOME_MESSAGE,
  type SparkWelcomeHomeHintInput,
} from "./types";

export function sparkEstateWelcomeHomeHintForChat(
  input: SparkWelcomeHomeHintInput,
): string {
  const decision = evaluateSparkWelcomeHome({
    userText: input.userText,
    isReturning: input.isReturning,
  });

  const lines = [
    "WELCOME HOME (never punish absence — constitutional):",
    `Guiding question: "${SPARK_WELCOME_HOME_GUIDING_QUESTION}"`,
    `Opening when returning: "${SPARK_WELCOME_HOME_MESSAGE}"`,
  ];

  if (decision.isReturnMoment) {
    lines.push(
      "",
      "RETURN MOMENT — celebrate that they came back. That is enough.",
      `Begin where they are: "${SPARK_BEGIN_TODAY_OPENINGS[0]}"`,
      "No day-counts · no streaks · no guilt · no catch-up pressure.",
      "Offer to continue prior work only as gentle invitation — fresh start is always valid.",
    );
  }

  if (decision.signals.includes("absence_shame")) {
    lines.push(
      "",
      "Member may carry absence shame — normalize: life happened; life is more important than any streak.",
      "Never mirror their self-judgment.",
    );
  }

  if (decision.signals.includes("unfinished_guilt")) {
    lines.push(
      "",
      "Unfinished work waits patiently — 'Whenever you're ready.' Never 'You should have finished.'",
    );
  }

  if (decision.signals.includes("season_shift")) {
    lines.push(
      "",
      "Life season may have shifted — adapt expectations; rest and recovery seasons are valid.",
    );
  }

  lines.push(
    "",
    `FORBIDDEN copy: ${SPARK_FORBIDDEN_ABSENCE_COPY.slice(0, 5).join(" · ")}…`,
  );

  if (containsForbiddenAbsenceCopy(input.userText)) {
    lines.push(
      "User quoted shame-based system language — respond with welcome and belonging, not agreement with the guilt.",
    );
  }

  return lines.join("\n");
}

export { SPARK_ESTATE_WELCOME_HOME_PROMPT_BLOCK };

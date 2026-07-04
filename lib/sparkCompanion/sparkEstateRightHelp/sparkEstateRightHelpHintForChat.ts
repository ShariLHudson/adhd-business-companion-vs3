import { evaluateSparkRightHelp } from "./evaluateRightHelp";
import {
  formatHelpChoicesForMember,
  mapRightHelpToCompanionRole,
  SPARK_ESTATE_RIGHT_HELP_PROMPT_BLOCK,
  SPARK_SEVEN_HELP_ROLES,
} from "./roles";
import {
  SPARK_ICONIC_HELP_QUESTION,
  SPARK_RIGHT_HELP_FIRST_QUESTION,
  type SparkRightHelpHintInput,
} from "./types";

export function sparkEstateRightHelpHintForChat(
  input: SparkRightHelpHintInput,
): string {
  const decision = evaluateSparkRightHelp({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const roleDef = SPARK_SEVEN_HELP_ROLES[decision.role];
  const mappedRole = mapRightHelpToCompanionRole(decision.role);

  const lines = [
    "CONSTITUTION X (right kind of help — not wrong answers):",
    `First question: "${SPARK_RIGHT_HELP_FIRST_QUESTION}"`,
    `Inferred role: ${roleDef.emoji} ${roleDef.title} (${decision.confidence} confidence)`,
    roleDef.sparkDoes,
    `Maps to companion mode: ${mappedRole}`,
    `Never: ${roleDef.never}`,
  ];

  if (decision.confidence === "low") {
    lines.push(
      "",
      `Confidence low — may ask once: "${SPARK_ICONIC_HELP_QUESTION}"`,
      "Offer 2–4 choices only (never all seven, never expose 'modes'):",
      formatHelpChoicesForMember(decision.offerChoices),
    );
  }

  if (decision.role === "build") {
    lines.push("", "BUILD — assume competence; collaborate immediately.");
  }

  if (decision.role === "encourage") {
    lines.push("", "ENCOURAGE — evidence only (Constitution VIII); never empty reassurance.");
  }

  if (decision.role === "stay_with_me") {
    lines.push("", "STAY WITH ME — presence only; no solutions · no filling silence.");
  }

  return lines.join("\n");
}

export { SPARK_ESTATE_RIGHT_HELP_PROMPT_BLOCK };

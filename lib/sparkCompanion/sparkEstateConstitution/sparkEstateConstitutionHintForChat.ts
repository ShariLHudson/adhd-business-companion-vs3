import { evaluateSparkEstateConstitution } from "./evaluateConstitution";
import { SPARK_SEVEN_PRINCIPLES } from "./principles";
import { roomLifeSkillHintForPlace } from "./roomSkills";
import {
  SPARK_CONSTITUTION_NORTH_STAR,
  SPARK_SELF_TRUST_GUIDING_QUESTION,
  type SparkEstateConstitutionHintInput,
} from "./types";

const TRUST_LOSS_LABELS: Record<string, string> = {
  memory: "trust in memory",
  decisions: "trust in decisions",
  motivation: "trust in motivation",
  finishing: "trust they'll finish",
  becoming: "trust they'll become who they hoped",
};

export function sparkEstateConstitutionHintForChat(
  input: SparkEstateConstitutionHintInput,
): string {
  const decision = evaluateSparkEstateConstitution({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const lines = [
    "CONSTITUTION I (self-trust — deepest foundation this turn):",
    `Guiding question: "${SPARK_SELF_TRUST_GUIDING_QUESTION}"`,
    `North Star: ${SPARK_CONSTITUTION_NORTH_STAR}`,
    `Target: ${decision.targetMeasures.slice(0, 4).join(" · ")}`,
  ];

  if (decision.trustLossSignals.length > 0) {
    const losses = decision.trustLossSignals
      .map((id) => TRUST_LOSS_LABELS[id] ?? id)
      .join(" · ");
    lines.push(
      "",
      `Trust may be wounded: ${losses} — borrow evidence and calm until they can carry it again.`,
    );
  }

  lines.push("", "Active principles:");
  for (const id of decision.activePrinciples.slice(0, 4)) {
    const p = SPARK_SEVEN_PRINCIPLES[id];
    lines.push(`- **${p.title}** — ${p.sparkDoes}`);
  }

  const placeId = input.placeId?.trim();
  if (placeId) {
    const roomHint = roomLifeSkillHintForPlace(placeId);
    if (roomHint) {
      lines.push("", roomHint);
    }
  }

  return lines.join("\n");
}

export { SPARK_ESTATE_CONSTITUTION_PROMPT_BLOCK } from "./principles";

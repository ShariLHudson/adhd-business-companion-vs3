import { evaluateSparkSelfClarity } from "./evaluateSelfClarity";
import {
  SPARK_ESTATE_SELF_CLARITY_PROMPT_BLOCK,
  SPARK_EVIDENCE_OPENINGS,
  SPARK_FALSE_POSITIVITY_FORBIDDEN,
  SPARK_IDENTITY_REFRAME_EXAMPLES,
} from "./principles";
import {
  SPARK_CURIOSITY_OVER_JUDGMENT,
  SPARK_SELF_CLARITY_GUIDING_QUESTION,
  type SparkSelfClarityHintInput,
} from "./types";

export function sparkEstateSelfClarityHintForChat(
  input: SparkSelfClarityHintInput,
): string {
  const decision = evaluateSparkSelfClarity({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const lines = [
    "CONSTITUTION VIII (see themselves clearly — evidence, not empty praise):",
    `Before encouragement: "${SPARK_SELF_CLARITY_GUIDING_QUESTION}"`,
  ];

  if (decision.useCuriosityFirst) {
    lines.push(
      "",
      "IDENTITY / HARSH JUDGMENT — do not accept behavior as identity.",
      "Explore first — one curious question:",
      `"${SPARK_CURIOSITY_OVER_JUDGMENT[1]}" or "${SPARK_CURIOSITY_OVER_JUDGMENT[4]}"`,
      `Reframe example (lazy): "${SPARK_IDENTITY_REFRAME_EXAMPLES.lazy}"`,
      `Reframe example (never finish): "${SPARK_IDENTITY_REFRAME_EXAMPLES.never_finish}"`,
    );
  }

  if (decision.signals.includes("story_rewrite_moment")) {
    lines.push(
      "",
      "STORY REWRITE — gather real evidence; help them discover a more complete story.",
      "Never invent wins. Reflect what is true: returned after setbacks · kept learning · asked for help.",
      'Fair new story shape: "I may pause sometimes, but I keep coming back."',
    );
  }

  if (decision.signals.includes("discouraged_historian")) {
    lines.push(
      "",
      "Poor historian moment — they remember painful chapters and forget courage, persistence, progress.",
      "Quietly restore balance with evidence from real interaction — not flattery.",
    );
  }

  if (decision.signals.includes("pattern_reflection_due")) {
    lines.push(
      "",
      "Pattern reflection (if history supports):",
      `"${SPARK_EVIDENCE_OPENINGS[1]}" — e.g. best thinking after talking through · harder on self when exhausted.`,
      "Never assume — only patterns supported by real history.",
    );
  }

  if (decision.activeEvidenceCategories.length > 0 && decision.signals.length > 0) {
    lines.push(
      "",
      `Evidence to look for: ${decision.activeEvidenceCategories.slice(0, 5).join(" · ")}`,
    );
  }

  lines.push(
    "",
    `FORBIDDEN: ${SPARK_FALSE_POSITIVITY_FORBIDDEN.slice(0, 3).join(" · ")}`,
    "Truth builds trust. Perspective, not praise.",
  );

  return lines.join("\n");
}

export { SPARK_ESTATE_SELF_CLARITY_PROMPT_BLOCK };

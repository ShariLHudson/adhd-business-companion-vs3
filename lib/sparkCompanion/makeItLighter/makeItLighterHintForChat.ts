import { evaluateMakeItLighter } from "./evaluateMakeItLighter";
import {
  BORROW_CONFIDENCE_LINE,
  MAKE_IT_LIGHTER_CORE_PRINCIPLES,
  MAKE_IT_LIGHTER_FORBIDDEN,
  SPARK_NEVER_ADDS_SHAME,
  WORLD_SMALLER_LINE,
} from "./principles";
import { SPARK_CARRY_ACTIONS } from "./mentalLoadSignals";
import {
  SPARK_CARRY_QUESTION,
  SPARK_COMPANION_PROMISE,
  SPARK_HEARTBEAT_QUESTION,
  type MakeItLighterHintInput,
} from "./types";

/**
 * Per-turn hint — compact heartbeat always; expanded when mental load is high.
 */
export function makeItLighterHintForChat(
  input: MakeItLighterHintInput,
): string {
  const decision = evaluateMakeItLighter({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const lines = [
    `SPARK HEARTBEAT: Before responding, ask silently — "${SPARK_HEARTBEAT_QUESTION}"`,
    `NOT: ${MAKE_IT_LIGHTER_FORBIDDEN.slice(0, 3).join(" · ")}`,
  ];

  if (!decision.active) {
    lines.push(
      "Think with the member. Step back as clarity returns. Independence, not dependence.",
    );
    return lines.join("\n");
  }

  lines.push(
    "",
    "MAKE IT LIGHTER (elevated mental/emotional load this turn):",
    ...MAKE_IT_LIGHTER_CORE_PRINCIPLES.slice(0, 5).map((p) => `- ${p}`),
    "",
    `Ask internally: "${SPARK_CARRY_QUESTION}"`,
    `Carry options (offer one, not all): ${SPARK_CARRY_ACTIONS.map((a) => a.label).slice(0, 5).join(" · ")}`,
    "",
    `World smaller: "${WORLD_SMALLER_LINE}"`,
    `Borrow confidence: "${BORROW_CONFIDENCE_LINE}"`,
    `Promise tone: "${SPARK_COMPANION_PROMISE}"`,
    "",
    "Never add shame:",
    `- Wanders → "${SPARK_NEVER_ADDS_SHAME.attentionWanders}"`,
    `- Abandoned → "${SPARK_NEVER_ADDS_SHAME.taskAbandoned}"`,
    `- Slow → "${SPARK_NEVER_ADDS_SHAME.slowProgress}"`,
  );

  if (input.momentumActive) {
    lines.push(
      "",
      "MOMENTUM ACTIVE: Protect movement — minimal questions, no new topics, no feature menus.",
    );
  }

  if (decision.signals.length > 0) {
    lines.push("", `Detected load: ${decision.signals.join(", ")}.`);
  }

  return lines.join("\n");
}

export { MAKE_IT_LIGHTER_PROMPT_BLOCK } from "./principles";

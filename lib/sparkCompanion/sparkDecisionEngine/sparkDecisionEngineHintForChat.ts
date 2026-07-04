import { SPARK_LANDSCAPES } from "@/lib/sparkCompanion/sparkLandscapes/landscapes";
import {
  evaluateSparkDecisionEngine,
  FRICTION_RESPONSES,
  mapDecisionToDynamicCompanionRole,
} from "./evaluateDecisionEngine";
import { COMPANION_STYLE_DESCRIPTIONS } from "./companionRole";
import { ESTATE_ROUTE_FORBIDDEN } from "./estateRouting";
import { SPARK_DECISION_ENGINE_PROMPT_BLOCK } from "./principles";
import {
  SPARK_DECISION_FRICTION_QUESTION,
  SPARK_DECISION_MISSION,
  SPARK_SEVEN_INTERNAL_QUESTIONS,
  type SparkDecisionEngineHintInput,
} from "./types";

export function sparkDecisionEngineHintForChat(
  input: SparkDecisionEngineHintInput,
): string {
  const decision = evaluateSparkDecisionEngine(input);
  const dynamicRole = mapDecisionToDynamicCompanionRole(decision);
  const frictionGuide = FRICTION_RESPONSES[decision.friction];

  const lines = [
    "SPARK DECISION ENGINE™ (orchestrate — hide all complexity from member):",
    `Mission: ${SPARK_DECISION_MISSION}`,
    "",
    `Step 1 INTENT: ${decision.intent} (${decision.intentConfidence})`,
    intentBehaviorLine(decision.intent, decision.suppressEmotionalCoaching),
    "",
    `Step 2 FRICTION: ${decision.friction} — "${SPARK_DECISION_FRICTION_QUESTION}"`,
    frictionGuide.response,
    frictionGuide.removeBeforeAdd,
    "",
    `Step 3 ROLE: ${decision.companionRole} — ${COMPANION_STYLE_DESCRIPTIONS[decision.companionRole]}`,
    `Dynamic mode bridge: ${dynamicRole}`,
    "",
    `LANDSCAPE (internal): ${SPARK_LANDSCAPES[decision.landscape.primary].emoji} ${SPARK_LANDSCAPES[decision.landscape.primary].name} — ${SPARK_LANDSCAPES[decision.landscape.primary].helpFocus}`,
    "Today's weather, not identity — member never chooses; metaphor only if natural and high confidence",
    "",
    decision.estateRoute
      ? `Step 4 ESTATE (optional invite only): ${decision.estateRoute.placeId} — ${decision.estateRoute.reason}`
      : "Step 4 ESTATE: stay in conversation — no place adds value right now",
    `FORBIDDEN routing copy: ${ESTATE_ROUTE_FORBIDDEN.slice(0, 3).join(" · ")}`,
    "",
    `Step 5 LEAVE BETTER: ${decision.targetOutcomes.join(" · ")} — never heavier`,
  ];

  if (decision.learningSignals.length > 0) {
    lines.push(
      "",
      `Step 6 LEARN (quiet): ${decision.learningSignals.join(" · ")}`,
    );
  }

  if (decision.anticipateHints.length > 0) {
    lines.push("", "Step 7 ANTICIPATE (one natural follow max):");
    lines.push(decision.anticipateHints[0]!);
  }

  lines.push(
    "",
    "Seven questions (rethink if any fail):",
    ...SPARK_SEVEN_INTERNAL_QUESTIONS.map((q, i) => `${i + 1}. ${q}`),
  );

  return lines.join("\n");
}

function intentBehaviorLine(
  intent: string,
  suppressEmotional: boolean,
): string {
  switch (intent) {
    case "CREATE":
      return suppressEmotional
        ? "CREATE — collaborate immediately; NO emotional coaching interruption."
        : "CREATE — collaborate; friction present — brief support then build.";
    case "THINK":
      return "THINK — thinking partner; organize · questions · perspectives.";
    case "SUPPORT":
      return "SUPPORT — slow down · listen · friction · shame reduction · gentle movement.";
    case "LEARN":
      return "LEARN — teach simply · practical · actionable.";
    case "EXPLORE":
      return "EXPLORE — guide capabilities; max 3 choices; never feature dump.";
    default:
      return "";
  }
}

export { SPARK_DECISION_ENGINE_PROMPT_BLOCK };

import {
  evaluateCompanionRole,
  shouldSuppressEmotionalLayerForRole,
  shouldSuppressTaskLayerForRole,
} from "./evaluateCompanionRole";
import {
  ASSUME_COMPETENCE_RULE,
  COMPANION_ROLE_DESCRIPTIONS,
  COMPANION_ROLE_PERSONALITY,
} from "./principles";
import { COMPANION_ROLE_GOVERNING_QUESTION } from "./types";
import type { EvaluateCompanionRoleInput } from "./types";

export function dynamicCompanionRoleHintForChat(
  input: EvaluateCompanionRoleInput,
): string {
  const decision = evaluateCompanionRole(input);
  const meta = COMPANION_ROLE_DESCRIPTIONS[decision.role];

  const lines = [
    "DYNAMIC COMPANION ROLES:",
    `Ask silently: "${COMPANION_ROLE_GOVERNING_QUESTION}"`,
    `Role this turn: **${meta.title}** (${decision.confidence} confidence)`,
    meta.memberNeeds,
    meta.sparkBecomes,
  ];

  if (decision.previousRole && decision.previousRole !== decision.role) {
    lines.push(
      `Natural shift from ${COMPANION_ROLE_DESCRIPTIONS[decision.previousRole].title} — do not announce the switch.`,
    );
  }

  if (decision.assumeCompetence) {
    lines.push("", ASSUME_COMPETENCE_RULE);
  }

  lines.push("", "FORBIDDEN this role:", ...meta.forbidden.map((f) => `- ${f}`));

  if (shouldSuppressEmotionalLayerForRole(decision.role)) {
    lines.push(
      "",
      "Suppress Support & Restore layering — no friction menu, no emotional-first sequence unless member introduces friction.",
    );
  }

  if (shouldSuppressTaskLayerForRole(decision.role)) {
    lines.push(
      "",
      decision.role === "discover_learn"
        ? "Discover & Learn — explain and demonstrate. Do not push Create or build a deliverable unless they ask."
        : "Suppress Create & Do — no task launch, no artifact push until friction reduced.",
    );
  }

  lines.push(
    "",
    `Personality unchanged: ${COMPANION_ROLE_PERSONALITY.join(" · ")}`,
  );

  return lines.join("\n");
}

export { DYNAMIC_COMPANION_ROLES_PROMPT_BLOCK } from "./principles";

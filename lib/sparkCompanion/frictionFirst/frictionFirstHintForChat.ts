import { evaluateFrictionFirst } from "./evaluateFrictionFirst";
import {
  FRICTION_FIRST_SHARED_EXPERIENCE_FOCUS,
  buildFrictionFirstOpeningReply,
} from "./composeFrictionFirst";
import {
  FRICTION_FIRST_CORE_BELIEF,
  FRICTION_FIRST_GOVERNING_QUESTION,
} from "./types";
import { FRICTION_FIRST_PREFERRED_PHRASES } from "./gentleLanguage";
import type { FrictionFirstSession } from "./types";

export type FrictionFirstHintInput = {
  userText: string;
  session?: FrictionFirstSession | null;
};

/**
 * LLM hint when Friction First is active — diagnose before prescribe.
 */
export function frictionFirstHintForChat(
  input: FrictionFirstHintInput,
): string | null {
  const decision = evaluateFrictionFirst(input.userText);
  if (!decision.active && !input.session) return null;

  const domain = input.session?.domain ?? decision.domain;
  const focusSituation =
    input.session?.focusSituation ?? decision.focusSituation;

  const lines = [
    "FRICTION FIRST (mandatory — diagnose before prescribe):",
    `Governing question: "${FRICTION_FIRST_GOVERNING_QUESTION}"`,
    ...FRICTION_FIRST_CORE_BELIEF.map((b) => `- ${b}`),
    "",
    "FORBIDDEN: Try harder · You need discipline · Stay focused · Why aren't you doing it · What's wrong?",
    `PREFERRED: ${FRICTION_FIRST_PREFERRED_PHRASES.slice(0, 4).join(" · ")}`,
    "",
    "One barrier → one next step only. Never generic productivity advice.",
    "Never assume you know why they struggle — ask which barrier feels closest.",
    "Always include 'Something else.' Never force a category.",
  ];

  if (domain === "focus") {
    lines.push(
      "",
      focusSituation === "resistance_not_want"
        ? "Focus situation: resistance (not attention) — reduce resistance, not motivation."
        : "Focus situation: wants progress but friction blocks attention — remove the barrier.",
      "",
      "Optional brief shared experience (only if natural — then return to member):",
      FRICTION_FIRST_SHARED_EXPERIENCE_FOCUS,
    );
  }

  if (input.session) {
    lines.push(
      "",
      "Member is choosing a barrier — respond with exactly ONE next step for their choice.",
    );
  } else {
    lines.push(
      "",
      "First turn: present barrier menu. Do NOT offer Estate places, tools, or feature menus yet.",
    );
  }

  return lines.join("\n");
}

export {
  buildFrictionFirstOpeningReply,
  buildFrictionFirstBarrierMenu,
  resolveFrictionBarrierChoice,
} from "./composeFrictionFirst";

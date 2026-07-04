import {
  CREATE_DO_OPENING_EXAMPLES,
} from "./principles";
import {
  detectRoleSwitch,
  EXPLICIT_SUPPORT_ASK_RE,
  hasCreateSignals,
  hasDiscoverSignals,
  hasSupportSignals,
  hasThinkSignals,
  SUPPORT_RESTORE_RE,
} from "./roleSignals";
import type {
  CompanionRole,
  CompanionRoleDecision,
  EvaluateCompanionRoleInput,
} from "./types";

function confidenceFor(
  role: CompanionRole,
  support: boolean,
  create: boolean,
  think: boolean,
  discover: boolean,
): "high" | "medium" | "low" {
  if (role === "create_do" && create && !support) return "high";
  if (role === "support_restore" && support && !create) return "high";
  if (role === "think_decide" && think && !support) return "high";
  if (role === "discover_learn" && discover && !support) return "high";
  if (support && create) return "medium";
  return "low";
}

/**
 * Determine companion role for this turn — assume competence first.
 */
export function evaluateCompanionRole(
  input: EvaluateCompanionRoleInput,
): CompanionRoleDecision {
  const text = input.userText.trim();
  if (!text) {
    return {
      role: "think_decide",
      confidence: "low",
      assumeCompetence: false,
      reason: "empty message",
    };
  }

  const switched = detectRoleSwitch(text, input.previousRole);
  if (switched) {
    return {
      role: switched,
      confidence: "high",
      assumeCompetence: switched === "create_do",
      reason: `role switch from ${input.previousRole}`,
      previousRole: input.previousRole ?? undefined,
    };
  }

  const support = hasSupportSignals(text, input.overwhelmed);
  const create = hasCreateSignals(text);
  const think = hasThinkSignals(text);
  const discover = hasDiscoverSignals(text);
  const explicitSupport = EXPLICIT_SUPPORT_ASK_RE.test(text);
  const strongSupport =
    explicitSupport ||
    SUPPORT_RESTORE_RE.test(text) ||
    Boolean(input.overwhelmed);

  if (discover && !strongSupport && !create) {
    return {
      role: "discover_learn",
      confidence: confidenceFor(
        "discover_learn",
        support,
        create,
        think,
        discover,
      ),
      assumeCompetence: false,
      reason: "teach, explain, or explore — not build or coach emotions",
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (think && !strongSupport) {
    return {
      role: "think_decide",
      confidence: confidenceFor(
        "think_decide",
        support,
        create,
        think,
        discover,
      ),
      assumeCompetence: false,
      reason: "decision or thinking-through signal",
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (explicitSupport || (support && !create)) {
    return {
      role: "support_restore",
      confidence: confidenceFor(
        "support_restore",
        support,
        create,
        think,
        discover,
      ),
      assumeCompetence: false,
      reason: explicitSupport
        ? "explicit support request"
        : "emotional or friction signals",
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (create && !support) {
    const opening = /\bsop\b/i.test(text)
      ? CREATE_DO_OPENING_EXAMPLES.sop
      : CREATE_DO_OPENING_EXAMPLES.default;
    return {
      role: "create_do",
      confidence: "high",
      assumeCompetence: true,
      reason: `clear actionable request — assume competence (${opening})`,
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (think) {
    return {
      role: "think_decide",
      confidence: confidenceFor(
        "think_decide",
        support,
        create,
        think,
        discover,
      ),
      assumeCompetence: false,
      reason: "decision or thinking-through with friction present",
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (support && create) {
    return {
      role: "support_restore",
      confidence: "medium",
      assumeCompetence: false,
      reason: "task request with friction — support before action",
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (create) {
    return {
      role: "create_do",
      confidence: "medium",
      assumeCompetence: true,
      reason: "actionable signal — default to collaborate",
      previousRole: input.previousRole ?? undefined,
    };
  }

  if (discover && !support) {
    return {
      role: "discover_learn",
      confidence: confidenceFor(
        "discover_learn",
        support,
        create,
        think,
        discover,
      ),
      assumeCompetence: false,
      reason: "explore or learn after other signals ruled out",
      previousRole: input.previousRole ?? undefined,
    };
  }

  return {
    role: "think_decide",
    confidence: "low",
    assumeCompetence: false,
    reason: "default thinking partner",
    previousRole: input.previousRole ?? undefined,
  };
}

export function shouldSuppressEmotionalLayerForRole(role: CompanionRole): boolean {
  return role === "create_do" || role === "discover_learn";
}

export function shouldSuppressTaskLayerForRole(role: CompanionRole): boolean {
  return role === "support_restore" || role === "discover_learn";
}

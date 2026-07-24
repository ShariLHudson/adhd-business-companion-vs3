/**
 * Professional role selection — how Shari helps, not where to route.
 */

import type { ShariPrimaryHelpMode } from "./types";

export type ShariProfessionalRole =
  | "advisor"
  | "coach"
  | "encourager"
  | "teacher"
  | "consultant"
  | "strategic_thinking_partner"
  | "planner"
  | "troubleshooter"
  | "creative_collaborator"
  | "execution_partner";

export function selectProfessionalRoles(
  primaryHelpMode: ShariPrimaryHelpMode,
  rawRequest: string,
): {
  primaryProfessionalRole: ShariProfessionalRole;
  supportingProfessionalRoles: ShariProfessionalRole[];
} {
  const t = rawRequest.toLowerCase();

  if (primaryHelpMode === "troubleshooting") {
    return {
      primaryProfessionalRole: "troubleshooter",
      supportingProfessionalRoles: ["teacher"],
    };
  }
  if (primaryHelpMode === "reflective_thinking") {
    return {
      primaryProfessionalRole: "coach",
      supportingProfessionalRoles: ["encourager"],
    };
  }
  if (primaryHelpMode === "advice" || primaryHelpMode === "comparison") {
    return {
      primaryProfessionalRole: "advisor",
      supportingProfessionalRoles: ["consultant", "strategic_thinking_partner"],
    };
  }
  if (
    primaryHelpMode === "formal_creation" ||
    primaryHelpMode === "simple_creation"
  ) {
    return {
      primaryProfessionalRole: "creative_collaborator",
      supportingProfessionalRoles: ["consultant"],
    };
  }
  if (primaryHelpMode === "project_execution") {
    return {
      primaryProfessionalRole: "execution_partner",
      supportingProfessionalRoles: ["planner"],
    };
  }
  if (primaryHelpMode === "simple_planning") {
    return {
      primaryProfessionalRole: "planner",
      supportingProfessionalRoles: ["encourager"],
    };
  }
  if (primaryHelpMode === "brainstorming") {
    return {
      primaryProfessionalRole: "creative_collaborator",
      supportingProfessionalRoles: ["encourager"],
    };
  }
  if (
    primaryHelpMode === "how_to_guidance" ||
    primaryHelpMode === "explanation"
  ) {
    // Situation-applied setup/consulting (booth, offer design) — not pure tool teaching
    if (
      /\b(?:my|our)\b/.test(t) &&
      /\b(?:booth|vendor|craft fair|table display)\b/.test(t)
    ) {
      return {
        primaryProfessionalRole: "consultant",
        supportingProfessionalRoles: ["teacher", "encourager"],
      };
    }
    if (
      /\b(?:my|our)\b/.test(t) &&
      /\b(?:offer|pricing|position(?:ing)?|brand)\b/.test(t) &&
      !/\b(?:facebook|loom|qr|how do i (?:create|find|make|record))\b/.test(t)
    ) {
      return {
        primaryProfessionalRole: "consultant",
        supportingProfessionalRoles: ["teacher", "encourager"],
      };
    }
    return {
      primaryProfessionalRole: "teacher",
      supportingProfessionalRoles: ["encourager"],
    };
  }

  return {
    primaryProfessionalRole: "advisor",
    supportingProfessionalRoles: ["encourager"],
  };
}

export function roleInstructionForChat(
  primary: ShariProfessionalRole,
  supporting: ShariProfessionalRole[],
): string {
  const lines: string[] = [
    `PROFESSIONAL POSTURE (internal): primary=${primary}; support=${supporting.join(",") || "none"}.`,
    "Remain one Shari voice — do not announce roles.",
  ];
  switch (primary) {
    case "teacher":
      lines.push(
        "Teach immediately. Ordered steps when useful. No motivational interviewing before instruction.",
      );
      break;
    case "advisor":
      lines.push(
        "Offer judgment with tradeoffs and reasoning. Avoid generic pros/cons-only lists.",
      );
      break;
    case "coach":
      lines.push(
        "Reflect and reduce load. One thoughtful question. Do not dump a task list.",
      );
      break;
    case "consultant":
      lines.push(
        "Apply expertise to their situation. Give a complete initial recommendation; one high-leverage question after.",
      );
      break;
    case "troubleshooter":
      lines.push(
        "Ordered checks simplest-first. Concrete actions and expected results.",
      );
      break;
    case "creative_collaborator":
      lines.push(
        "Build substantive work. Prefer concrete drafts over vague outlines.",
      );
      break;
    case "execution_partner":
    case "planner":
      lines.push(
        "Plan practically. Projects only if tracking is requested or clearly needed and accepted.",
      );
      break;
    default:
      lines.push("Help substantively before asking anything nonessential.");
  }
  lines.push(
    "Encouragement may support the answer — it must never replace the answer.",
  );
  return lines.join("\n");
}

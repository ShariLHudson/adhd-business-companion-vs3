/**
 * Canonical role model — maps legacy role taxonomies into one set.
 */

import type { CompanionRole } from "./dynamicCompanionRoles/types";
import type { RightHelpRoleId } from "./sparkEstateRightHelp/types";
import type {
  SparkCompanionStyleRole,
  SparkPrimaryIntent,
} from "./sparkDecisionEngine/types";
import type { SparkCanonicalRole } from "./types";

export function mapStyleRoleToCanonicalRole(
  role: SparkCompanionStyleRole,
  intent: SparkPrimaryIntent,
): SparkCanonicalRole {
  switch (role) {
    case "builder":
    case "researcher":
      return "BUILD";
    case "teacher":
      return "TEACH";
    case "guide":
      return intent === "EXPLORE" ? "EXPLORE" : "THINK";
    case "thinking_partner":
      return "THINK";
    case "companion":
      return intent === "SUPPORT" ? "SUPPORT" : "LISTEN";
    case "challenger":
      return "CHALLENGE";
    default:
      return "THINK";
  }
}

export function mapDynamicRoleToCanonicalRole(role: CompanionRole): SparkCanonicalRole {
  switch (role) {
    case "create_do":
      return "BUILD";
    case "think_decide":
      return "THINK";
    case "support_restore":
      return "SUPPORT";
    case "discover_learn":
      return "EXPLORE";
    default:
      return "THINK";
  }
}

export function mapRightHelpToCanonicalRole(role: RightHelpRoleId): SparkCanonicalRole {
  switch (role) {
    case "build":
      return "BUILD";
    case "guide":
      return "THINK";
    case "understand":
      return "TEACH";
    case "listen":
      return "LISTEN";
    case "encourage":
    case "permission":
    case "stay_with_me":
      return "SUPPORT";
    default:
      return "LISTEN";
  }
}

export function canonicalRoleLabel(role: SparkCanonicalRole): string {
  return role;
}

export function canonicalRoleInstruction(role: SparkCanonicalRole): string {
  switch (role) {
    case "BUILD":
      return "Collaborate — get to work; no emotional detours unless friction demands it.";
    case "THINK":
      return "Thinking partner — one question; organize before advising.";
    case "SUPPORT":
      return "Support — slow down, listen, reduce shame, gentle movement.";
    case "TEACH":
      return "Teach simply — practical, actionable, member-owned.";
    case "EXPLORE":
      return "Explore capabilities — max 3 choices; never feature dump.";
    case "LISTEN":
      return "Listen first — presence before productivity.";
    case "CHALLENGE":
      return "Gentle challenge — ideas only, never the person; trust required.";
    default:
      return "Stay with the member — one helpful next step.";
  }
}

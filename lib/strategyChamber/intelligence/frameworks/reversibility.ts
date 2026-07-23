import type { RiskAssessment } from "../types";

export type Reversibility =
  RiskAssessment["reversibility"];

export function assessReversibility(text: string): Reversibility {
  const t = text.toLowerCase();
  if (/\b(pilot|test|trial|new members? only|experiment|30 days)\b/.test(t)) {
    return "easily_reversible";
  }
  if (/\b(grandfather|phase|staged|gradual)\b/.test(t)) {
    return "reversible_with_effort";
  }
  if (/\b(everyone|permanent|rebrand|fire|shut down|public announce)\b/.test(t)) {
    return "difficult";
  }
  return "unknown";
}

export function reversibilityMemberCopy(level: Reversibility): string {
  switch (level) {
    case "easily_reversible":
      return "This looks testable without committing fully.";
    case "reversible_with_effort":
      return "This can be adjusted later, though it may take some care.";
    case "difficult":
    case "effectively_irreversible":
      return "This choice may be difficult to undo, so it may be worth checking two more things first.";
    default:
      return "It is not yet clear how easy this would be to undo.";
  }
}

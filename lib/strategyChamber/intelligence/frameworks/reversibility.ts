import type { Reversibility } from "../../domainModel";
import { REVERSIBILITY_LABEL } from "../../domainModel";

export type { Reversibility } from "../../domainModel";

export function assessReversibility(text: string): Reversibility {
  const t = text.toLowerCase();
  if (/\b(pilot|test|trial|new members? only|experiment|30 days)\b/.test(t)) {
    return "easily_reversible";
  }
  if (/\b(grandfather|phase|staged|gradual)\b/.test(t)) {
    return "moderately_reversible";
  }
  if (
    /\b(everyone|permanent|rebrand|fire|shut down|public announce|contract|lease|clos(e|ing) (my |the )?business)\b/.test(
      t,
    )
  ) {
    return "difficult_to_reverse";
  }
  if (
    /\b(irreversible|cannot undo|no going back|sold|closed permanently)\b/.test(
      t,
    )
  ) {
    return "effectively_irreversible";
  }
  return "unknown";
}

export function reversibilityMemberCopy(level: Reversibility): string {
  switch (level) {
    case "easily_reversible":
      return "This looks testable without committing fully.";
    case "moderately_reversible":
      return "This can be adjusted later, though it may take some care.";
    case "difficult_to_reverse":
      return "This choice may be difficult to undo, so it may be worth checking two more things first.";
    case "effectively_irreversible":
      return "This choice may be effectively irreversible — it deserves extra care before you commit.";
    default:
      return "It is not yet clear how easy this would be to undo.";
  }
}

export function reversibilityLabel(level: Reversibility): string {
  return REVERSIBILITY_LABEL[level];
}

/**
 * Renders a SelectedExpertContribution into the compact text block used
 * inside the Chamber Expertise Hint. Kept separate from selection so the
 * two are independently testable (selection = what; rendering = how it
 * reads).
 */

import { chamberExpertById } from "@/lib/chamberExpertise/chamberExpertRegistry";
import type { SelectedExpertContribution } from "./types";

const ROLE_LABEL: Record<SelectedExpertContribution["role"], string> = {
  primary: "Leading perspective",
  supporting: "Also relevant",
};

export function renderSelectedContribution(selection: SelectedExpertContribution): string {
  const name = chamberExpertById(selection.expertId)?.name ?? selection.expertId;
  const parts: string[] = [`${ROLE_LABEL[selection.role]}: ${name} — notices ${selection.thinkingFacets.join("; ")}.`];

  for (const fw of selection.frameworks) {
    parts.push(`Apply ${fw.name}: ${fw.sparkExplanation} (ADHD: ${fw.adhdApplication})`);
  }

  for (const t of selection.adhdTranslations) {
    parts.push(`Instead of "${t.traditional}" — ${t.sparkAdaptation}`);
  }

  if (selection.question) {
    parts.push(`One question worth asking: "${selection.question.text}"`);
  }

  if (selection.researchSuggested) {
    parts.push("Current information may help here — check before assuming.");
  }

  return parts.join(" ");
}

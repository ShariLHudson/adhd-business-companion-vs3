import type { DynamicCreationBlueprint } from "@/lib/universalRequestOutcome";
import { nowIso } from "./ids";
import type { CreationWorkspace } from "./types";

/**
 * Completeness review from Dynamic Creation Blueprint — suggestions only.
 */
export function reviewMissingPieces(input: {
  workspace: CreationWorkspace;
  blueprint?: DynamicCreationBlueprint | null;
}): CreationWorkspace {
  const joined = input.workspace.items
    .filter((i) => i.status !== "removed")
    .map((i) => `${i.title}\n${i.body}`)
    .join("\n")
    .toLowerCase();
  const title = `${input.workspace.title} ${input.workspace.purpose}`.toLowerCase();
  const suggestions: string[] = [];

  const required = input.blueprint?.requiredSections ?? [];
  for (const section of required) {
    const key = section.toLowerCase();
    if (!joined.includes(key.slice(0, Math.min(12, key.length)))) {
      suggestions.push(`Missing or thin: ${section}`);
    }
  }

  for (const need of input.blueprint?.userInformationRequirements ?? []) {
    suggestions.push(`Needs your input: ${need}`);
  }

  if (/social|content plan|campaign/.test(title)) {
    if (!/audience/.test(joined)) suggestions.push("Missing audience clarity");
    if (!/goal|purpose|objective/.test(joined)) {
      suggestions.push("Missing campaign goal");
    }
    if (!/call to action|cta/.test(joined)) suggestions.push("Missing CTA");
    if (!/progress|sequence|day 5|final/.test(joined)) {
      suggestions.push("Check content progression / final conversion step");
    }
  }

  if (/volunteer|handbook/.test(title)) {
    if (!/conduct|expectation/.test(joined)) {
      suggestions.push("Missing conduct expectations");
    }
    if (!/safety/.test(joined)) suggestions.push("Missing safety guidance");
    if (!/communication/.test(joined)) {
      suggestions.push("Missing communication process");
    }
    if (!/acknowledg|sign/.test(joined)) {
      suggestions.push("Missing acknowledgement");
    }
    if (!/role/.test(joined)) suggestions.push("Missing role clarity");
  }

  if (/mentor|program/.test(title)) {
    if (!/eligib/.test(joined)) suggestions.push("Missing eligibility");
    if (!/match/.test(joined)) suggestions.push("Missing matching process");
    if (!/train/.test(joined)) suggestions.push("Missing training");
    if (!/boundar/.test(joined)) suggestions.push("Missing boundaries");
    if (!/success|evaluat|measure/.test(joined)) {
      suggestions.push("Missing success measures");
    }
    if (!/escalat|issue/.test(joined)) {
      suggestions.push("Missing issue-escalation path");
    }
  }

  const unique = Array.from(new Set(suggestions)).slice(0, 10);
  return {
    ...input.workspace,
    missingPieces: unique,
    suggestionIds: input.workspace.suggestionIds,
    status:
      unique.length > 0 ? "ready_for_review" : input.workspace.status,
    updatedAt: nowIso(),
  };
}

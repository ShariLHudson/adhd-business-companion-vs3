/**
 * Known-context reuse review — approval required before initialize.
 */

import {
  getBlueprint,
  UnknownBlueprintError,
} from "@/lib/universalWorkEngine";
import type {
  KnownContextProposal,
  KnownContextReuseDecision,
} from "./types";

const CONFIDENTIAL_KEY_RE =
  /(?:password|secret|ssn|private|confidential|token|api[_-]?key)/i;

const LABEL_FOR_KEY: Record<string, string> = {
  business_name: "Business name",
  audience: "Audience",
  offers: "Offers",
  brand_preferences: "Brand preferences",
  project_id: "Existing Project",
  prior_decisions: "Prior decisions",
  dates: "Dates",
  people: "People",
  budget: "Budget assumptions",
  has_sponsors: "Sponsors involved",
};

function labelForKey(key: string): string {
  return LABEL_FOR_KEY[key] ?? key.replace(/_/g, " ");
}

/**
 * Propose reusable known information for a Blueprint.
 * Inferred values are marked; confidential keys require explicit approval.
 */
export function proposeKnownContextReuse(input: {
  blueprintId: string;
  knownContext: Readonly<Record<string, string>>;
  inferredKeys?: readonly string[];
  version?: string | null;
}): KnownContextProposal[] {
  const bp = getBlueprint(input.blueprintId, input.version);
  if (!bp) throw new UnknownBlueprintError(input.blueprintId);

  const relevant = new Set<string>();
  for (const q of bp.adaptiveQuestions) {
    for (const k of q.knownContextKeys ?? []) relevant.add(k);
  }
  for (const section of bp.sections) {
    if (input.knownContext[section.id]?.trim()) relevant.add(section.id);
  }
  for (const key of Object.keys(input.knownContext)) {
    if (input.knownContext[key]?.trim()) relevant.add(key);
  }

  const inferred = new Set(input.inferredKeys ?? []);
  const proposals: KnownContextProposal[] = [];

  for (const key of relevant) {
    const value = input.knownContext[key]?.trim();
    if (!value) continue;
    proposals.push({
      key,
      label: labelForKey(key),
      value,
      inferred: inferred.has(key),
      confidential: CONFIDENTIAL_KEY_RE.test(key) || CONFIDENTIAL_KEY_RE.test(value),
    });
  }

  return proposals.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Apply member reuse decisions — declined keys are omitted.
 * Confidential keys require explicit approval (must appear in approvedKeys).
 */
export function applyKnownContextReuseDecision(
  proposals: readonly KnownContextProposal[],
  decision: KnownContextReuseDecision,
): Record<string, string> {
  const approved = new Set(decision.approvedKeys);
  const declined = new Set(decision.declinedKeys);
  const out: Record<string, string> = {};

  for (const p of proposals) {
    if (declined.has(p.key)) continue;
    if (!approved.has(p.key)) continue;
    if (p.confidential && !approved.has(p.key)) continue;
    const edited = decision.editedValues[p.key]?.trim();
    out[p.key] = edited || p.value;
  }

  return out;
}

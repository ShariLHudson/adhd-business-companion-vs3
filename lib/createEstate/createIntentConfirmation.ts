/**
 * Spec 127 — Create Experience Simplification.
 * Intent confirmation before Work creation. Never silently mint the wrong type.
 */

export type CreateIntentConfidence = "high" | "medium" | "low";

export function humanCreateTypeLabel(artifactType: string): string {
  const t = artifactType.trim();
  if (!t) return "plan";
  // Strip internal suffixes; keep member-facing names.
  return t
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\bwork\s*type\b/gi, "")
    .replace(/\bblueprint\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || "plan";
}

/** Shari confirmation — high confidence. */
export function createIntentConfirmMessage(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  return `It sounds like you'd like to create a ${label}. Does that sound right?`;
}

/** Soft confirm when match is plausible but not ironclad. */
export function createIntentSoftConfirmMessage(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  return `I think a ${label} fits what you described — shall we start there?`;
}

export function createOpenPlanLabel(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  if (/plan$/i.test(label)) return `Open My ${label}`;
  return `Open My ${label}`;
}

/** Success without IDs, Blueprint, Work Type, or registry language. */
export function createWorkReadyMessage(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  return `Your ${label} is ready.`;
}

/**
 * Score how sure we are about the inferred create type.
 * High → confirm with Yes / Choose something else.
 * Medium → soft confirm.
 * Low → one clarifying question (never create).
 */
export function scoreCreateIntentConfidence(input: {
  text: string;
  artifactType: string;
  fromCatalog: boolean;
  fromPromptDetect: boolean;
  isMarketingPlanDomain: boolean;
  isEventDomain: boolean;
}): CreateIntentConfidence {
  const text = input.text.trim().toLowerCase();
  const type = input.artifactType.trim().toLowerCase();
  if (!text || !type) return "low";

  const typeWord = type.replace(/[^a-z0-9\s]/g, " ").trim();
  const explicit =
    typeWord.length >= 3 &&
    new RegExp(`\\b${typeWord.replace(/\s+/g, "\\s+")}\\b`, "i").test(text);

  if (
    input.isMarketingPlanDomain ||
    input.isEventDomain ||
    (input.fromCatalog && explicit)
  ) {
    return "high";
  }
  if (input.fromCatalog || (input.fromPromptDetect && explicit)) {
    return "medium";
  }
  if (input.fromPromptDetect) return "medium";
  return "low";
}

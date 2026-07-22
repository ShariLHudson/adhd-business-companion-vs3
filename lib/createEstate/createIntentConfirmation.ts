/**
 * Spec 127 / 130 / 131 — Create Experience Simplification + Intent Constitution.
 * Intent confirmation before Work creation. Never silently mint the wrong type.
 * One Creation Rule™ — every path confirms before Work exists.
 * Spec 131 — intent before artifact; smart alternatives below ~95% confidence.
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

/** Shari confirmation — high confidence (130 wording). */
export function createIntentConfirmMessage(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  return `It looks like you'd like to create ${article} ${label}.`;
}

/** Soft confirm when match is plausible but not ironclad. */
export function createIntentSoftConfirmMessage(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  return `I think ${article} ${label} fits what you described — shall we start there?`;
}

/**
 * Spec 131 Rule 2 / 6 — medium confidence: most likely + also considered.
 * Never implies Work already exists.
 */
export function createIntentAlternativesMessage(
  mostLikely: string,
  alsoConsidered: readonly string[],
): string {
  const primary = humanCreateTypeLabel(mostLikely);
  const article = /^[aeiou]/i.test(primary) ? "an" : "a";
  if (alsoConsidered.length === 0) {
    return createIntentSoftConfirmMessage(mostLikely);
  }
  const also = alsoConsidered
    .map((t) => humanCreateTypeLabel(t))
    .filter(Boolean)
    .slice(0, 3);
  if (also.length === 0) {
    return createIntentSoftConfirmMessage(mostLikely);
  }
  return `I think you meant ${article} ${primary}. I also considered: ${also.join(", ")}.`;
}

/** Primary confirm CTA — Create Blog Post / Create Marketing Plan. */
export function createConfirmPrimaryLabel(artifactType: string): string {
  const label = humanCreateTypeLabel(artifactType);
  return `Create ${label}`;
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
 * Spec 131 Rule 1 — Intent before artifact.
 * Promotional material *for* an event/workshop is a deliverable, not the event plan.
 */
export function detectPromotionalDeliverableIntent(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (
    !/\b(flyer|flier|brochure|handout|one[\s-]?pager|rack\s*card|promotional\s+material)\b/.test(
      t,
    )
  ) {
    return null;
  }
  return "Flyer";
}

/**
 * Score how sure we are about the inferred create type.
 * High → confirm with Yes / Choose something else.
 * Medium → soft confirm + also-considered when available (131).
 * Low → one clarifying question (never create).
 */
export function scoreCreateIntentConfidence(input: {
  text: string;
  artifactType: string;
  fromCatalog: boolean;
  fromPromptDetect: boolean;
  isMarketingPlanDomain: boolean;
  isEventDomain: boolean;
  /** Spec 131 — intent-before-artifact promotional override */
  fromPromotionalIntent?: boolean;
}): CreateIntentConfidence {
  const text = input.text.trim().toLowerCase();
  const type = input.artifactType.trim().toLowerCase();
  if (!text || !type) return "low";

  const typeWord = type.replace(/[^a-z0-9\s]/g, " ").trim();
  const explicit =
    typeWord.length >= 3 &&
    new RegExp(`\\b${typeWord.replace(/\s+/g, "\\s+")}\\b`, "i").test(text);

  // Promo deliverable named explicitly — high when wording is clear.
  if (input.fromPromotionalIntent && explicit) {
    return "high";
  }
  // Flyer for workshop — intent clear enough to recommend, still confirm (130).
  if (input.fromPromotionalIntent) {
    return "medium";
  }

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

/** Cap also-considered options (Rule 2 / 12 — medium: 2–4). */
export function limitAlsoConsidered(
  primary: string,
  candidates: readonly string[],
  max = 3,
): string[] {
  const primaryKey = humanCreateTypeLabel(primary).toLowerCase();
  const out: string[] = [];
  for (const raw of candidates) {
    const label = humanCreateTypeLabel(raw);
    if (!label) continue;
    if (label.toLowerCase() === primaryKey) continue;
    if (out.some((x) => x.toLowerCase() === label.toLowerCase())) continue;
    out.push(label);
    if (out.length >= max) break;
  }
  return out;
}

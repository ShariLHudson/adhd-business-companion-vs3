/**
 * SOP Build Journey Phase 2 (2026-08-05) — the approved 10-field Working
 * Memory model.
 *
 * @see docs/create-experience/SOP_BUILD_JOURNEY_APPROVAL_RECORD.md
 * @see docs/create-experience/SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md#10
 *
 * All fields are optional and additive to RuntimeCreationRecord. This module
 * only derives what is directly answerable from the Build Definition's own
 * section content — the same reuse pattern as canonicalFacts.ts. It does not
 * extract, infer, or interpret free text, and it is Build-Type-agnostic: it
 * reads whatever section ids exist on the record, nothing SOP-specific.
 *
 * Three of the ten fields are wired to real derivation in this phase
 * (desiredResult, primaryUser, nextHelpfulStep) because they map directly
 * onto a single existing section answer or the existing focus computation.
 * The remaining seven (existingAssetsFound, openQuestions, decisions,
 * dependencies, waitingItems, whyItMatters, connectedAssets) persist
 * correctly through save/resume but are not auto-populated here — doing so
 * honestly requires either more conversational surface or genuine language
 * understanding, and SOP_BUILD_JOURNEY_SPECIFICATION.md section 10 ("Gentle
 * intervention") already defers that reasoning layer. Building it now would
 * mean inventing SOP-specific intelligence, which the pilot's non-negotiables
 * forbid. A future Build Definition may progressively fill these the same
 * way — by supplying more sections, not by adding a new engine.
 */

export type WorkingMemoryFields = {
  desiredResult?: string | null;
  primaryUser?: string | null;
  existingAssetsFound?: string[] | null;
  openQuestions?: string[] | null;
  decisions?: string[] | null;
  dependencies?: string[] | null;
  waitingItems?: string[] | null;
  nextHelpfulStep?: string | null;
  whyItMatters?: string | null;
  connectedAssets?: string[] | null;
  /**
   * SOP Reasoning-First Migration Phase 2 (2026-08-06) — discovery question 1
   * ("for your own business, or for a client?"). Kept deliberately separate
   * from primaryUser (who follows the finished SOP, derived from the
   * Intended User section) rather than overloading one field with two
   * different questions.
   */
  ownershipContext?: string | null;
  /** Discovery question 3 ("will one person use this, or multiple?"). */
  intendedAudience?: string | null;
};

export const WORKING_MEMORY_FIELD_KEYS: readonly (keyof WorkingMemoryFields)[] =
  [
    "desiredResult",
    "primaryUser",
    "existingAssetsFound",
    "openQuestions",
    "decisions",
    "dependencies",
    "waitingItems",
    "nextHelpfulStep",
    "whyItMatters",
    "connectedAssets",
    "ownershipContext",
    "intendedAudience",
  ];

/** Section ids treated as directly answering a Working Memory field, when present. */
const DESIRED_RESULT_SECTION_ID = "purpose";
const PRIMARY_USER_SECTION_ID = "intended-user";

/**
 * Progressive derivation — call after any section answer changes. Never
 * clears a field that was already set by a blank/missing answer; only
 * updates a field when the source section has real content, so answering
 * one section never erases context gathered from another.
 */
export function deriveWorkingMemoryFields(input: {
  sectionContent: Record<string, string>;
  /** Human label of the section the conversation would move to next, if any. */
  nextSectionLabel?: string | null;
  existing?: WorkingMemoryFields | null;
}): WorkingMemoryFields {
  const desiredResultAnswer = input.sectionContent[DESIRED_RESULT_SECTION_ID]?.trim();
  const primaryUserAnswer = input.sectionContent[PRIMARY_USER_SECTION_ID]?.trim();

  return {
    ...input.existing,
    desiredResult: desiredResultAnswer || input.existing?.desiredResult || null,
    primaryUser: primaryUserAnswer || input.existing?.primaryUser || null,
    nextHelpfulStep: input.nextSectionLabel
      ? `Continue with ${input.nextSectionLabel}`
      : (input.existing?.nextHelpfulStep ?? null),
  };
}

/** True when every value is empty/null — lets callers skip writing an empty bag. */
export function isWorkingMemoryEmpty(fields: WorkingMemoryFields | null | undefined): boolean {
  if (!fields) return true;
  return WORKING_MEMORY_FIELD_KEYS.every((key) => {
    const value = fields[key];
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    return !value.trim();
  });
}

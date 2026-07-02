import type { StablesInteractiveObjectDefinition } from "./types";

/**
 * Future interactive objects on the Stables™ room plate.
 * Architecture only — hotspots and experiences ship later.
 */
export const STABLES_INTERACTIVE_OBJECTS: readonly StablesInteractiveObjectDefinition[] =
  [
    {
      id: "brass-horseshoe",
      label: "Brass horseshoe",
      metaphor: "Luck meets readiness — what you prepare for.",
      futureExperienceKind: "luck-and-readiness",
      linkedExperienceIds: ["confidence-conversations", "courage-builder"],
      status: "architecture-only",
    },
    {
      id: "saddle",
      label: "Saddle",
      metaphor: "Partnership and weight — who carries what in your business.",
      futureExperienceKind: "partnership-and-weight",
      linkedExperienceIds: ["leadership-lessons", "business-analogies"],
      status: "architecture-only",
    },
    {
      id: "leather-journal",
      label: "Leather journal",
      metaphor: "Private reflection — honest notes before public moves.",
      futureExperienceKind: "private-reflection",
      linkedExperienceIds: ["reflection-moments", "trust-challenges"],
      status: "architecture-only",
    },
    {
      id: "grooming-brush",
      label: "Grooming brush",
      metaphor: "Care and consistency — small daily habits that build trust.",
      futureExperienceKind: "care-and-consistency",
      linkedExperienceIds: ["trust-challenges", "business-analogies"],
      status: "architecture-only",
    },
    {
      id: "stable-gate",
      label: "Stable gate",
      metaphor: "Threshold and choice — what you are ready to walk through.",
      futureExperienceKind: "threshold-and-choice",
      linkedExperienceIds: ["courage-builder", "calm-under-pressure"],
      status: "architecture-only",
    },
    {
      id: "riding-arena",
      label: "Riding arena",
      metaphor: "Practice arena — rehearse presence before the real ride.",
      futureExperienceKind: "practice-arena",
      linkedExperienceIds: ["presence-practice", "calm-under-pressure"],
      status: "architecture-only",
    },
  ] as const;

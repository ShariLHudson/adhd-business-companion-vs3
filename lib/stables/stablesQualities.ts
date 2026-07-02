import type { StablesQualityDefinition } from "./types";

/** Qualities great entrepreneurs share — the horse is metaphor. */
export const STABLES_QUALITIES: readonly StablesQualityDefinition[] = [
  {
    id: "leadership",
    title: "Leadership",
    metaphor: "A steady hand on the reins — direction without force.",
  },
  {
    id: "trust",
    title: "Trust",
    metaphor: "Trust grows one small step at a time.",
  },
  {
    id: "confidence",
    title: "Confidence",
    metaphor: "Built through practice — not waited for.",
  },
  {
    id: "calm-under-pressure",
    title: "Calm Under Pressure",
    metaphor: "Breath before reaction — presence before pace.",
  },
  {
    id: "communication",
    title: "Communication",
    metaphor: "Clear signals the horse — and the team — can follow.",
  },
  {
    id: "presence",
    title: "Presence",
    metaphor: "Your body arrives before your words do.",
  },
  {
    id: "partnership",
    title: "Partnership",
    metaphor: "You and the work move together — neither dragging the other.",
  },
  {
    id: "consistency",
    title: "Consistency",
    metaphor: "Daily grooming beats a dramatic ride.",
  },
  {
    id: "patience",
    title: "Patience",
    metaphor: "There is no rush here.",
  },
  {
    id: "courage",
    title: "Courage",
    metaphor: "Small brave steps at the gate — not a leap from nowhere.",
  },
  {
    id: "emotional-regulation",
    title: "Emotional Regulation",
    metaphor: "Feel the storm; choose the stride.",
  },
] as const;

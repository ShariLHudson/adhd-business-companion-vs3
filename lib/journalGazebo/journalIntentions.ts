/** What this journal is for — shapes page marks and writing questions. */
export type JournalIntentionId =
  | "journey"
  | "prayer"
  | "gratitude"
  | "health"
  | "creative"
  | "business";

/**
 * Topic watermark ids (not Estate places).
 * Assets: /images/journal-gazebo/topic-watermarks/{id}.svg
 */
export type JournalIntentionWatermarkId =
  | "prayer-be-still"
  | "prayer-peace"
  | "prayer-faith"
  | "prayer-light"
  | "gratitude-enough"
  | "gratitude-bloom"
  | "gratitude-sun"
  | "gratitude-heart"
  | "health-leaf"
  | "health-rest"
  | "health-water"
  | "health-breath"
  | "creative-ink"
  | "creative-spark"
  | "creative-brush"
  | "creative-star"
  | "business-compass"
  | "business-clarity"
  | "business-quill"
  | "business-path"
  | "journey-path"
  | "journey-dawn"
  | "journey-open"
  | "journey-page";

export type JournalIntentionOption = {
  id: JournalIntentionId;
  label: string;
  description: string;
  /** Soft topic mark shown on the choice plaque. */
  previewWatermark: JournalIntentionWatermarkId;
};

export const JOURNAL_INTENTION_OPTIONS: readonly JournalIntentionOption[] = [
  {
    id: "journey",
    label: "Everyday journey",
    description: "Open pages for whatever the day brings",
    previewWatermark: "journey-path",
  },
  {
    id: "prayer",
    label: "Prayer",
    description: "Quiet space for prayer, faith, and listening",
    previewWatermark: "prayer-be-still",
  },
  {
    id: "gratitude",
    label: "Gratitude",
    description: "Noticing what is good, soft, and enough",
    previewWatermark: "gratitude-bloom",
  },
  {
    id: "health",
    label: "Health & body",
    description: "Energy, rest, healing, and how you feel",
    previewWatermark: "health-leaf",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Ideas, sketches, stories, and sparks",
    previewWatermark: "creative-brush",
  },
  {
    id: "business",
    label: "Business & work",
    description: "Decisions, clients, plans, and clarity",
    previewWatermark: "business-compass",
  },
] as const;

export const DEFAULT_JOURNAL_INTENTION: JournalIntentionId = "journey";

/** Topic image rotations — mood matches the journal type. */
export const JOURNAL_INTENTION_WATERMARKS: Record<
  JournalIntentionId,
  readonly JournalIntentionWatermarkId[]
> = {
  journey: ["journey-path", "journey-dawn", "journey-open", "journey-page"],
  prayer: ["prayer-be-still", "prayer-peace", "prayer-faith", "prayer-light"],
  gratitude: [
    "gratitude-enough",
    "gratitude-bloom",
    "gratitude-sun",
    "gratitude-heart",
  ],
  health: ["health-leaf", "health-rest", "health-water", "health-breath"],
  creative: ["creative-ink", "creative-spark", "creative-brush", "creative-star"],
  business: [
    "business-compass",
    "business-clarity",
    "business-quill",
    "business-path",
  ],
};

export function resolveJournalIntention(
  intention?: JournalIntentionId | null,
): JournalIntentionId {
  if (intention && intention in JOURNAL_INTENTION_WATERMARKS) {
    return intention;
  }
  return DEFAULT_JOURNAL_INTENTION;
}

export function journalIntentionLabel(intention?: JournalIntentionId | null): string {
  const id = resolveJournalIntention(intention);
  return JOURNAL_INTENTION_OPTIONS.find((option) => option.id === id)?.label ?? "Everyday journey";
}

/** Undefined means topic images on (default). */
export function resolveShowPageWatermarks(show?: boolean | null): boolean {
  return show !== false;
}

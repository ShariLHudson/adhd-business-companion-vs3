/**
 * Your Journey Through the Treehouse™ — footer progression for Possibility House spreads.
 */

export type TreehouseGuideJourneyStep = {
  spreadId: string;
  /** Past-tense line when the reader has reached this chapter */
  completedLabel: string;
  /** Shown on this spread as the next chapter — not a checklist, just narrative continuity */
  nextStopLabel?: string;
};

/** Guidebook journey order — matches the Treehouse as one continuous story. */
export const TREEHOUSE_GUIDE_JOURNEY: readonly TreehouseGuideJourneyStep[] = [
  {
    spreadId: "house-possibility-outside",
    completedLabel: "Arrived at the Treehouse Possibility House",
    nextStopLabel: "The Possibility Staircase",
  },
  {
    spreadId: "house-possibility-staircase",
    completedLabel: "Climbed the Possibility Staircase",
    nextStopLabel: "The Creative Studio",
  },
  {
    spreadId: "house-possibility-studio",
    completedLabel: "Explored the Creative Studio",
    nextStopLabel: "The Reflection Desk",
  },
  {
    spreadId: "house-possibility-reflection-desk",
    completedLabel: "Paused at the Reflection Desk",
    nextStopLabel: "The Observatory",
  },
  {
    spreadId: "house-possibility-observatory",
    completedLabel: "Gained Perspective in the Observatory",
    nextStopLabel: "The Cabinet of Chapters",
  },
  {
    spreadId: "house-possibility-cabinet-of-chapters",
    completedLabel: "Opened the Cabinet of Chapters",
    nextStopLabel: "The Discovery Chest",
  },
  {
    spreadId: "house-possibility-discovery-chest",
    completedLabel: "Discovered the Discovery Chest",
    nextStopLabel: "The Legacy Room",
  },
  {
    spreadId: "house-possibility-legacy-room",
    completedLabel: "Reflected in the Legacy Room",
  },
];

export type TreehouseJourneyFooter = {
  completedSteps: readonly string[];
  nextStop: string | null;
};

export function resolveTreehouseJourneyFooter(
  spreadId: string,
): TreehouseJourneyFooter | null {
  const index = TREEHOUSE_GUIDE_JOURNEY.findIndex(
    (step) => step.spreadId === spreadId,
  );
  if (index < 0) {
    return null;
  }

  const step = TREEHOUSE_GUIDE_JOURNEY[index]!;
  const completedSteps = TREEHOUSE_GUIDE_JOURNEY.slice(0, index + 1).map(
    (s) => s.completedLabel,
  );

  return {
    completedSteps,
    nextStop: step.nextStopLabel ?? null,
  };
}

export function isTreehouseGuideSpread(spreadId: string): boolean {
  return TREEHOUSE_GUIDE_JOURNEY.some((step) => step.spreadId === spreadId);
}

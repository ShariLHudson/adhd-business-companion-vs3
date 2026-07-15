/**
 * Ceremonial journal gift reveal — physical desk object, not a UI panel.
 */

import type { JournalGazeboConfig } from "./types";

/** Physical unwrap beats on the desk gift. */
export type JournalGiftBeat =
  | "wrapped"
  | "ribbon-pull"
  | "bow"
  | "ribbon"
  | "unwrap"
  | "reveal"
  | "admire"
  | "opening";

export type JournalRevealState = JournalGiftBeat;

/** @deprecated Prefer JournalGiftBeat. */
export type JournalUnwrapStep = "ribbon" | "paper" | "lid";

export type JournalRevealCompleteMeta = {
  skipped: boolean;
  opened: boolean;
};

export type JournalRevealFlowProps = {
  journal: JournalGazeboConfig;
  isFirstCreation?: boolean;
  onComplete: (
    journal: JournalGazeboConfig,
    meta: JournalRevealCompleteMeta,
  ) => void;
};

export const JOURNAL_REVEAL_CREATING_MESSAGES = [
  "Preparing your journal...",
  "Binding your pages...",
  "Adding the final touch...",
] as const;

export const JOURNAL_REVEAL_CREATING_MS = 4200;
export const JOURNAL_REVEAL_CREATING_SHORT_MS = 900;
export const JOURNAL_REVEAL_MESSAGE_ROTATE_MS = 1400;
export const JOURNAL_REVEAL_OPENING_MS = 1400;
export const JOURNAL_REVEAL_OPENING_REDUCED_MS = 200;

/**
 * Timing between automatic physical beats after the ribbon is freed.
 * Matched to CSS material transitions (+ short linger) so beats never cut mid-motion.
 */
export const JOURNAL_GIFT_BEAT_MS = {
  bow: 1600,
  ribbon: 1500,
  unwrap: 2400,
  reveal: 2200,
} as const;

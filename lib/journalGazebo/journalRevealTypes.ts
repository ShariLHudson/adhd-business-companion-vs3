/**
 * Ceremonial journal gift reveal — completion moment, not a loader.
 */

import type { JournalGazeboConfig } from "./types";

export type JournalRevealState =
  | "creating"
  | "wrapped"
  | "unwrapping"
  | "revealed"
  | "opening";

/** Interactive unwrap beats inside the unwrapping state. */
export type JournalUnwrapStep = "ribbon" | "paper" | "lid";

export type JournalRevealCompleteMeta = {
  skipped: boolean;
  /** True when the member opened the journal into the Gazebo writing path. */
  opened: boolean;
};

export type JournalRevealFlowProps = {
  journal: JournalGazeboConfig;
  /**
   * First journal creation in this Estate visit lineage.
   * Full wrapping sequence; returning creations start shortened at wrapped.
   */
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

/** Creating / wrapping stage — 3–5 seconds max. */
export const JOURNAL_REVEAL_CREATING_MS = 4200;
export const JOURNAL_REVEAL_CREATING_SHORT_MS = 900;
export const JOURNAL_REVEAL_MESSAGE_ROTATE_MS = 1400;
export const JOURNAL_REVEAL_OPENING_MS = 1600;
export const JOURNAL_REVEAL_OPENING_REDUCED_MS = 200;

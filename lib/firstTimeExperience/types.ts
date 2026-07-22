/**
 * First-Time Experience framework (Prompt 146).
 * Once seen, Spark Estate remembers — never force again unless the member asks.
 */

export const FIRST_TIME_EXPERIENCE_IDS = [
  "welcome-audio",
  "welcome-home-cinematic",
  "estate-tour",
  "how-everything-works-together",
  "room-introduction",
  "feature-introduction",
] as const;

export type FirstTimeExperienceId = (typeof FIRST_TIME_EXPERIENCE_IDS)[number];

export type FirstTimeExperienceDisposition =
  | "completed"
  | "skipped"
  | "dismissed";

export type FirstTimeExperienceRecord = {
  experienceId: FirstTimeExperienceId;
  completedAt: string | null;
  disposition: FirstTimeExperienceDisposition | null;
};

export type MarkFirstTimeExperienceOptions = {
  disposition?: FirstTimeExperienceDisposition;
  at?: string;
  /** Manual replay / reopen must never clear completion. */
  isManualReplay?: boolean;
};

export const FIRST_TIME_EXPERIENCE_PRINCIPLE =
  "Greet once at the door. Remember the introduction. Never introduce yourself again every time they walk through — unless they ask." as const;

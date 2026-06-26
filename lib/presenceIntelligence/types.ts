import type { FavoriteDrink } from "@/lib/companionUniverse/libraries/hospitalityProfileLibrary";
import type { VisitEnergy } from "@/lib/companionHospitalityProfile";

/** Silent environmental preparation — discovered, never announced. */
export type PresencePreparation = {
  drink: FavoriteDrink | null;
  mugOnTable: boolean;
  teaSetReady: boolean;
  blanketFoldedNearby: boolean;
  notebookOpen: boolean;
  chairAngledToWindow: boolean;
  freshFlowers: boolean;
  roomQuieter: boolean;
  hopefulLight: boolean;
  brightMorning: boolean;
  visitEnergy: VisitEnergy;
};

/** How Shari shows up — not what she claims to know. */
export type PresencePosture = {
  /** Skip forced reconnection question — room speaks first. */
  preferSilence: boolean;
  /** Use earned wonder phrasing instead of data-driven prompts. */
  useWonderQuestion: boolean;
  relationshipDepth: "early" | "trusted" | "kin";
};

export type PresenceIntelligence = {
  preparation: PresencePreparation;
  posture: PresencePosture;
};

export type PresenceIntelligenceInput = {
  now?: Date;
  sessionVisitIndex: number;
  returnIntervalHours?: number | null;
  returnIntervalDays?: number | null;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  isFirstMeeting?: boolean;
  recoveryGentle?: boolean;
  lowEnergy?: boolean;
  projectRecentlyCompleted?: boolean;
  previousTopic?: string | null;
  favoriteDrink?: FavoriteDrink;
  chronotype?: "morning" | "afternoon" | "evening" | "night";
  prefersQuiet?: boolean;
  visitEnergy?: VisitEnergy;
};

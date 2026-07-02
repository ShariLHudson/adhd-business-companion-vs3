/** Shared arrival/ambience types — avoids circular imports with estatePlaceMedia. */

/** How present a layer should feel in the mix — never distracting. */
export type EstateAmbienceLayerProminence = "very-subtle" | "subtle" | "present";

/** One hospitality layer in a place's sonic identity (may share one loop today). */
export type EstateAmbienceIntentLayer = {
  id: string;
  label: string;
  prominence: EstateAmbienceLayerProminence;
};

/** Future — alternate loops for gentle per-visit variation. */
export type EstateAmbienceTrackCandidate = {
  src: string;
  weight?: number;
  character?: string;
};

export type EstateArrivalAmbienceProfile = {
  /** Primary loop today — first candidate in trackPool when pool exists. */
  src: string;
  volume: number;
  /** Hospitality intent — documents emotional purpose for QA and future mixing. */
  character: string;
  /** Layered identity from estatePlaceAmbienceIntent — not separate files yet. */
  layers?: readonly EstateAmbienceIntentLayer[];
  /**
   * Future — multiple tracks per place; pick one per visit with gentle randomization.
   * Member should feel they are returning to a real place, not replaying one loop.
   */
  trackPool?: readonly EstateAmbienceTrackCandidate[];
};

export type EstateArrivalExperienceConfig = {
  roomId: string;
  title: string;
  motto: string;
  shariGreeting: string;
  ambience?: EstateArrivalAmbienceProfile;
  invitationAfterArrival?: boolean;
};

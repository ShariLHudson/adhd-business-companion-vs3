/**
 * How Spark Estate Works Together — shared orientation types.
 * One mental model: one business, many helpful perspectives, quietly connected.
 */

export type EstateOrientationPlaceId =
  | "create"
  | "projects"
  | "cartography"
  | "strategies"
  | "chamber"
  | "board"
  | "business-pulse"
  | "evidence"
  | "wins"
  | "hall";

export type EstateOrientationPlace = {
  id: EstateOrientationPlaceId;
  /** Member-facing place name */
  name: string;
  /** 1–2 sentences — what this place is for */
  summary: string;
  /** What is this? */
  whatIsThis: string;
  /** Why would I use it? */
  whyWouldIUseIt: string;
  /**
   * How it relates to the rest of the estate — relationships that emerge from
   * real work (Spec 141). Never invent fake wiring.
   */
  howItConnects: string;
};

export type EstateTourStepId =
  | "project-studio"
  | "cartographers-studio"
  | "board-room"
  | "hall-of-accomplishments";

export type EstateTourStep = {
  id: EstateTourStepId;
  placeName: string;
  /** Shari voice — what this place feels like */
  shariLine: string;
  /** Optional estate place id for soft navigation (never forced) */
  estatePlaceHint?: string;
};

export type HowSparkEstateWorksTogetherContent = {
  featureName: string;
  helpMenuLabel: string;
  fitsTogetherLinkLabel: string;
  intro: string[];
  places: EstateOrientationPlace[];
  close: string[];
  tour: {
    title: string;
    invitation: string;
    walkWithMeLabel: string;
    stayLabel: string;
    notNowLabel: string;
    steps: EstateTourStep[];
    closing: string;
  };
};

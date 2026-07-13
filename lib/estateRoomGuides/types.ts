/**
 * Shared Estate How-to guide content — Chamber & My Business Estate.
 * Presentation only; does not change destination systems.
 */

export type EstateHowToGuideId =
  | "chamber-of-momentum"
  | "my-business-estate";

export type EstateHowToComparisonRow = {
  name: string;
  points: string[];
};

export type EstateHowToNumberedItem = {
  title: string;
  description: string;
};

export type EstateHowToSubsection = {
  title: string;
  bullets: string[];
};

export type EstateHowToSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  numbered?: EstateHowToNumberedItem[];
  subsections?: EstateHowToSubsection[];
  closingLine?: string;
  comparisonRows?: EstateHowToComparisonRow[];
};

export type EstateHowToGuideContent = {
  id: EstateHowToGuideId;
  title: string;
  /** Button / action label on the destination surface */
  openActionLabel: string;
  welcome: string[];
  sections: EstateHowToSection[];
  /** Optional footer primary action */
  primaryActionLabel?: string;
  primaryActionTestId?: string;
  firstVisitInvite: string;
};

export type EstateHowToGuideMatch = {
  guideId: EstateHowToGuideId;
  matchedPhrase: string;
  shariReply: string;
};

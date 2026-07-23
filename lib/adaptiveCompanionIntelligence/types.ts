/**
 * Adaptive Companion Intelligence — presentation preferences and resolved context.
 * Reuses Experience Controls + Support Style; does not diagnose or score.
 */

export type AdaptiveParagraphLength = "short" | "standard";
export type AdaptiveInstructionPacing = "one_at_a_time" | "overview_ok";
export type AdaptiveChoiceLoad = "one" | "two" | "three" | "ask";
export type AdaptiveExamplePreference = "prefer" | "neutral" | "minimize";
export type AdaptiveResumeDepth = "brief" | "standard" | "detailed";
export type AdaptiveComparisonStyle =
  | "side_by_side"
  | "one_criterion"
  | "plain_tradeoffs";
export type AdaptiveStructureLevel = "minimal" | "balanced" | "visible";

/** Explicit Adaptive Companion prefs — only dimensions not owned elsewhere. */
export type AdaptiveCompanionExplicitPrefs = {
  summaryFirst: boolean;
  paragraphLength: AdaptiveParagraphLength;
  instructionPacing: AdaptiveInstructionPacing;
  /** When null, Support Style choiceCount (if any) is used. */
  choiceLoad: AdaptiveChoiceLoad | null;
  examplePreference: AdaptiveExamplePreference;
  resumeSummaryPreference: AdaptiveResumeDepth;
  comparisonStyle: AdaptiveComparisonStyle;
  structureLevel: AdaptiveStructureLevel;
  showProgressPreference: boolean;
  plainLanguagePreference: boolean;
  version: number;
  updatedAt: string;
};

export type AdaptivePresentationContext = {
  summaryFirst: boolean;
  maxVisibleChoices: number;
  oneQuestionAtATime: boolean;
  shortParagraphs: boolean;
  resumeDepth: AdaptiveResumeDepth;
  reduceMotion: boolean;
};

export type AdaptivePresentationResolved = AdaptivePresentationContext & {
  showMoreOptionsControl: boolean;
  preferExamples: boolean;
  sensorySoftened: boolean;
  comparisonStyle: AdaptiveComparisonStyle;
  structureLevel: AdaptiveStructureLevel;
  showProgress: boolean;
  /** Always true — presentation never removes intelligence. */
  fullDetailAvailable: true;
  plainLanguage: boolean;
  textSize: "standard" | "large" | "extra-large";
  audioReady: boolean;
  sources: string[];
};

export type AdaptiveSessionOverride = Partial<{
  summaryFirst: boolean;
  paragraphLength: AdaptiveParagraphLength;
  instructionPacing: AdaptiveInstructionPacing;
  choiceLoad: AdaptiveChoiceLoad;
  examplePreference: AdaptiveExamplePreference;
  resumeSummaryPreference: AdaptiveResumeDepth;
  comparisonStyle: AdaptiveComparisonStyle;
  structureLevel: AdaptiveStructureLevel;
  showProgressPreference: boolean;
}>;

export type AdaptiveConversationalOverride = {
  forceFullDetail?: boolean;
  forceSummaryFirst?: boolean;
  forceFewerChoices?: boolean;
  forceOneStep?: boolean;
  forceMoreExamples?: boolean;
  reason: string;
};

export type ResolveAdaptivePresentationInput = {
  sessionOverride?: AdaptiveSessionOverride | null;
  conversationalText?: string | null;
  destinationHint?: string | null;
};

export const ADAPTIVE_COMPANION_PREFS_KEY =
  "spark:adaptive-companion-prefs:v1" as const;
export const ADAPTIVE_COMPANION_SESSION_KEY =
  "spark:adaptive-companion-session:v1" as const;
export const ADAPTIVE_COMPANION_CHANGE_EVENT =
  "spark:adaptive-companion-prefs-change" as const;

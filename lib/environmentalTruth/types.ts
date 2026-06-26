import type {
  CompanionMotionKind,
  RoomObject,
  RoomObjectKind,
  WelcomeWeather,
} from "@/lib/companionEnvironmentIntelligence/types";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

export type EnvironmentalCause =
  | "fresh-coffee"
  | "fresh-tea"
  | "morning-sun"
  | "rain-outside"
  | "snow-outside"
  | "evening-indoors"
  | "summer-breeze"
  | "wind-outside"
  | "window-open"
  | "summer-iowa"
  | "winter-iowa"
  | "indoor-warmth"
  | "fireflies-evening"
  | "butterflies-day"
  | "holiday-season";

export type EnvironmentalCorrection = {
  field: "motion" | "object" | "atmosphere";
  removed: string;
  reason: string;
  because: string;
};

export type EnvironmentalTruth = {
  causes: EnvironmentalCause[];
  /** Internal — "of course the curtains are moving" grammar, never UI chrome. */
  because: string[];
  coherencePassed: boolean;
  corrections: EnvironmentalCorrection[];
};

export type EnvironmentalTruthInput = {
  timeOfDay: WelcomeTimeOfDay;
  season: WelcomeSeason;
  weather: WelcomeWeather;
  objects: RoomObject[];
  motion: CompanionMotionKind[];
  recoveryGentle?: boolean;
};

export const ENVIRONMENTAL_TRUTH_RULE =
  "Every visible detail must have a believable cause — nothing moves merely because animation is available.";

export const WARM_DRINK_KINDS: RoomObjectKind[] = [
  "coffee",
  "tea",
  "tea-set",
  "cider",
];

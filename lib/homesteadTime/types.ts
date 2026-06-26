import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

export type HomesteadTimePeriod =
  | "dawn"
  | "morning"
  | "midday"
  | "afternoon"
  | "golden-hour"
  | "evening"
  | "night";

export type HomesteadDayPace =
  | "hope"
  | "awake"
  | "energetic"
  | "steady"
  | "warm"
  | "cozy"
  | "resting";

export type HomesteadContinuousTime = {
  /** 0 at 5:00 AM, approaches 1 just before next 5:00 AM. */
  dayProgress: number;
  /** Cool dawn → bright midday → amber golden hour → dim night. */
  sunWarmth: number;
  /** Short at midday, long at golden hour. */
  shadowLength: number;
  /** Interior lamps and candles — rises through evening. */
  interiorGlow: number;
  /** Light through windows — peaks at midday. */
  exteriorBrightness: number;
  /** Color temperature bias — lower is cooler, higher is warmer amber. */
  colorTemperature: number;
};

export type HomesteadRoomTimeProfile = {
  placeId: CompanionPlaceId;
  openWindows: boolean;
  primaryDrink: "coffee" | "tea" | "none";
  lampEmphasis: boolean;
  candleEmphasis: boolean;
  fireplaceEmphasis: boolean;
  aquariumGlow: boolean;
  movementLevel: "minimal" | "gentle" | "active";
  note: string;
};

export type HomesteadConversationRhythm = {
  pace: "gentle" | "steady" | "encouraging" | "quiet";
  tone: "hope" | "momentum" | "reflection" | "gentleness";
  hints: string[];
};

export type HomesteadTime = {
  now: string;
  period: HomesteadTimePeriod;
  periodLabel: string;
  hour: number;
  minute: number;
  legacyTimeOfDay: WelcomeTimeOfDay;
  continuous: HomesteadContinuousTime;
  dayPace: HomesteadDayPace;
  conversation: HomesteadConversationRhythm;
  roomDefaults: HomesteadRoomTimeProfile;
};

export const HOMESTEAD_TIME_RULE =
  "The Homestead has days, not themes — the house lives in the same day as the guest.";

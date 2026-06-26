import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import type { SafeCompositionEntry } from "./safeCompositionRegistry";

export type LightingPhase =
  | "early-morning"
  | "morning"
  | "afternoon"
  | "golden-hour"
  | "evening"
  | "night";

export type AmbientAudioId =
  | "birds"
  | "rain"
  | "wind"
  | "fireplace"
  | "wind-chimes"
  | "clock"
  | "thunder";

export type HospitalityMotionId =
  | "candle"
  | "steam"
  | "rain"
  | "snow"
  | "foliage"
  | "sunlight"
  | "lamplight"
  | "curtains"
  | "birds"
  | "cardinal"
  | "leaves"
  | "butterflies"
  | "fireflies"
  | "fireplace"
  | "clouds"
  | "shimmer"
  | "thunder";

export type HospitalityObjectId =
  | "coffee"
  | "tea-set"
  | "cookies"
  | "flowers"
  | "journal"
  | "travel-guide"
  | "suitcase"
  | "cake"
  | "birthday-card"
  | "puzzle"
  | "holiday-decor"
  | "blanket"
  | "cider"
  | "tulips";

export type HospitalityScenePreset = {
  id: string;
  label: string;
  description: string;
  season: WelcomeSeason;
  weather: WelcomeWeather;
  lighting: LightingPhase;
  timeOfDay: WelcomeTimeOfDay;
  atmosphere: string;
  greeting: string;
  invite: string;
  companionImageId: string;
  hospitality: HospitalityObjectId[];
  motion: HospitalityMotionId[];
  books: string[];
  audio: AmbientAudioId[];
  warmth: number;
};

export type DirectorSceneState = {
  presetId: string | null;
  season: WelcomeSeason;
  weather: WelcomeWeather;
  lighting: LightingPhase;
  timeOfDay: WelcomeTimeOfDay;
  atmosphere: string;
  hospitality: HospitalityObjectId[];
  books: string[];
  motion: HospitalityMotionId[];
  audio: AmbientAudioId[];
  greeting: string;
  invite: string;
  companionImageId: string;
  reduceMotion: boolean;
  warmth: number;
  audioEnabled: boolean;
};

export type SceneLifeEvent =
  | "everyday"
  | "birthday"
  | "vacation"
  | "recovery"
  | "friday"
  | "holiday";

export type SceneCorrection = {
  field: string;
  requested: string;
  resolved: string;
  reason: string;
};

export type SceneDisabledItem<T extends string> = {
  id: T;
  reason: string;
};

/** Resolved output — one believable room, never raw control fragments. */
export type ResolvedHospitalityScene = {
  presetId: string | null;
  lifeEvent: SceneLifeEvent;
  atmosphere: string;
  season: WelcomeSeason;
  weather: WelcomeWeather;
  lighting: LightingPhase;
  timeOfDay: WelcomeTimeOfDay;
  companionImageId: string;
  hospitality: HospitalityObjectId[];
  books: string[];
  motion: HospitalityMotionId[];
  audio: AmbientAudioId[];
  greeting: string;
  invite: string;
  warmth: number;
  reduceMotion: boolean;
  audioEnabled: boolean;
  composition: SafeCompositionEntry;
  showLogo: boolean;
  corrections: SceneCorrection[];
  disabledMotion: SceneDisabledItem<HospitalityMotionId>[];
  disabledObjects: SceneDisabledItem<HospitalityObjectId>[];
  disabledAudio: SceneDisabledItem<AmbientAudioId>[];
};

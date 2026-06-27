/**
 * Living Home — constitutional types.
 * One home. Always familiar. Always alive.
 */

import type { RegionCode } from "@/lib/companionLanguage";
import type { HomesteadTime } from "@/lib/homesteadTime";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

export const LIVING_HOME_PRINCIPLE =
  "One Home. Always Familiar. Always Alive." as const;

export const LIVING_HOME_PHILOSOPHY =
  "The Companion is not changing backgrounds — Shari is taking care of her home." as const;

/** Permanent identity — the home never changes. */
export const LIVING_HOME_PERMANENT_ELEMENTS = [
  "Iowa-inspired white farmhouse",
  "Front porch extending across the page",
  "Porch swing",
  "Open front door",
  "Warm welcoming entrance",
  "Flower beds",
  "Comfortable furniture",
  "Shari standing just inside the doorway",
  "Overall architecture",
] as const;

export type LivingHomeSurface =
  | "login"
  | "today"
  | "plan-my-day"
  | "clear-my-mind"
  | "focus"
  | "create"
  | "learning"
  | "decision-compass"
  | "library"
  | "garden"
  | "workspace";

/** User-facing time profiles (maps from Homestead Time Engine). */
export type LivingHomeTimeProfile =
  | "early-morning"
  | "morning"
  | "afternoon"
  | "golden-hour"
  | "evening"
  | "night";

export type LivingHomeSeason = "spring" | "summer" | "autumn" | "winter";

export type LivingHomeWeather =
  | "sunny"
  | "cloudy"
  | "rain"
  | "snow"
  | "fog"
  | "wind"
  | "thunderstorm";

export type LivingHomeLifeEvent =
  | "christmas"
  | "halloween"
  | "thanksgiving"
  | "fourth-of-july"
  | "valentines"
  | "birthday"
  | "anniversary"
  | "one-year-together";

export type LivingHomeMotionProfile = {
  swing: boolean;
  plants: boolean;
  lanternFlicker: boolean;
  doorGlow: boolean;
  /** 0–1 subtle motion multiplier */
  strength: number;
};

export type LivingHomeShariPresence = {
  /** Shari stays inside the doorway — never outdoors in weather. */
  placement: "inside-doorway";
  sheltered: true;
};

export type LivingHomeEvaluation = {
  surface: LivingHomeSurface;
  region: RegionCode;
  homesteadTime: HomesteadTime;
  timeProfile: LivingHomeTimeProfile;
  season: LivingHomeSeason;
  welcomeSeason: WelcomeSeason;
  weather: LivingHomeWeather;
  lifeEvents: LivingHomeLifeEvent[];
  motion: LivingHomeMotionProfile;
  shariPresence: LivingHomeShariPresence;
  openingDoor: boolean;
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

import type {
  LivingHomeEvaluation,
  LivingHomeLifeEvent,
  LivingHomeSeason,
} from "./types";
import type { HomesteadTime } from "@/lib/homesteadTime";
import { homesteadTimeCssVars } from "@/lib/homesteadTime";
import { primaryLivingHomeLifeEvent } from "./lifeEvents";

type SeasonTone = {
  gardenVibrancy: number;
  skyTint: number;
  porchAccent: number;
};

const SEASON_TONE: Record<LivingHomeSeason, SeasonTone> = {
  spring: { gardenVibrancy: 0.12, skyTint: 0.1, porchAccent: 0.04 },
  summer: { gardenVibrancy: 0.16, skyTint: 0.08, porchAccent: 0.05 },
  autumn: { gardenVibrancy: 0.1, skyTint: 0.14, porchAccent: 0.08 },
  winter: { gardenVibrancy: 0.04, skyTint: 0.12, porchAccent: 0.06 },
};

const LIFE_EVENT_PORCH_BOOST: Partial<Record<LivingHomeLifeEvent, number>> = {
  christmas: 0.1,
  halloween: 0.06,
  thanksgiving: 0.05,
  "fourth-of-july": 0.04,
  valentines: 0.04,
};

export function livingHomeCssVars(
  homesteadTime: HomesteadTime,
  season: LivingHomeSeason,
  motionStrength: number,
  lifeEvents: readonly LivingHomeLifeEvent[],
  openingDoor: boolean,
): Record<string, string> {
  const tone = SEASON_TONE[season];
  const { continuous } = homesteadTime;
  const eventBoost = lifeEvents.reduce(
    (max, event) =>
      Math.max(max, LIFE_EVENT_PORCH_BOOST[event] ?? 0),
    0,
  );

  const porchLight =
    continuous.interiorGlow * 0.85 +
    tone.porchAccent +
    eventBoost +
    (openingDoor ? 0.14 : 0);

  return {
    ...homesteadTimeCssVars(homesteadTime),
    "--lh-brightness": String(0.9 + continuous.exteriorBrightness * 0.14),
    "--lh-warmth": String(continuous.colorTemperature),
    "--lh-shadow-depth": String(continuous.shadowLength * 0.38),
    "--lh-porch-light": String(Math.min(1, porchLight)),
    "--lh-indoor-glow": String(
      Math.min(1, continuous.interiorGlow + (openingDoor ? 0.12 : 0)),
    ),
    "--lh-sky-tint": String(tone.skyTint),
    "--lh-garden-vibrancy": String(tone.gardenVibrancy),
    "--lh-motion-strength": String(motionStrength),
  };
}

export function livingHomeDataAttributes(
  state: Pick<
    LivingHomeEvaluation,
    | "timeProfile"
    | "season"
    | "weather"
    | "lifeEvents"
    | "surface"
    | "openingDoor"
    | "motion"
  >,
): Record<string, string> {
  const primaryEvent = primaryLivingHomeLifeEvent(state.lifeEvents);

  return {
    "data-living-home-surface": state.surface,
    "data-living-home-time": state.timeProfile,
    "data-living-home-season": state.season,
    "data-living-home-weather": state.weather,
    ...(primaryEvent ? { "data-living-home-event": primaryEvent } : {}),
    ...(state.openingDoor ? { "data-living-home-opening": "true" } : {}),
    ...(state.motion.strength === 0
      ? { "data-living-home-reduced-motion": "true" }
      : {}),
  };
}

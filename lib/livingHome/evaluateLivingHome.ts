import type { RegionCode } from "@/lib/companionLanguage";
import { resolveHomesteadTime } from "@/lib/homesteadTime";
import { primaryLivingHomeLifeEvent, resolveLivingHomeLifeEvents } from "./lifeEvents";
import { resolveLivingHomeMotion } from "./livingMotion";
import { livingHomeCssVars, livingHomeDataAttributes } from "./render";
import { resolveLivingHomeSeason } from "./season";
import { resolveLivingHomeShariPresence } from "./shariPresence";
import { livingHomeTimeProfileFromPeriod } from "./timeOfDay";
import type {
  LivingHomeEvaluation,
  LivingHomeSurface,
  LivingHomeWeather,
} from "./types";
import { resolveLivingHomeWeather } from "./weather";

export type EvaluateLivingHomeInput = {
  now?: Date;
  region?: RegionCode;
  surface?: LivingHomeSurface;
  weather?: LivingHomeWeather | string | null;
  openingDoor?: boolean;
  reducedMotion?: boolean;
};

/**
 * Living Home — determines how Shari's home looks and feels today.
 * Modular layers: time → season → weather → life events → motion.
 */
export function evaluateLivingHome(
  input: EvaluateLivingHomeInput = {},
): LivingHomeEvaluation {
  const now = input.now ?? new Date();
  const region = input.region ?? "US";
  const surface = input.surface ?? "login";
  const openingDoor = Boolean(input.openingDoor);
  const reducedMotion = Boolean(input.reducedMotion);

  const homesteadTime = resolveHomesteadTime({ now });
  const { season, welcomeSeason } = resolveLivingHomeSeason(region, now);
  const weather = resolveLivingHomeWeather({ weather: input.weather });
  const lifeEvents = resolveLivingHomeLifeEvents(now);
  const primaryEvent = primaryLivingHomeLifeEvent(lifeEvents);
  const orderedLifeEvents = primaryEvent
    ? [primaryEvent, ...lifeEvents.filter((e) => e !== primaryEvent)]
    : lifeEvents;

  const motion = resolveLivingHomeMotion({ weather, reducedMotion });
  const shariPresence = resolveLivingHomeShariPresence();
  const timeProfile = livingHomeTimeProfileFromPeriod(homesteadTime.period);

  const cssVars = livingHomeCssVars(
    homesteadTime,
    season,
    motion.strength,
    orderedLifeEvents,
    openingDoor,
  );

  const evaluation: LivingHomeEvaluation = {
    surface,
    region,
    homesteadTime,
    timeProfile,
    season,
    welcomeSeason,
    weather,
    lifeEvents: orderedLifeEvents,
    motion,
    shariPresence,
    openingDoor,
    cssVars,
    dataAttributes: {},
  };

  evaluation.dataAttributes = livingHomeDataAttributes(evaluation);
  return evaluation;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

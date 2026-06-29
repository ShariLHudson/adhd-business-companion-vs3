import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import { timeOfDayBucket } from "@/lib/arrivalIntelligence/livingIntelligenceGraph";
import { evaluateLivingHome } from "@/lib/livingHome";
import type { LivingHomeLifeEvent, LivingHomeWeather, LivingHomeSurface } from "@/lib/livingHome/types";
import type { HomesteadTimePeriod } from "@/lib/homesteadTime";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

export type HomesteadSceneSurface = "home" | "login" | "chat" | "app";

function livingHomeSurface(
  surface?: HomesteadSceneSurface,
): "login" | "today" {
  return surface === "login" ? "login" : "today";
}

export type HomesteadSceneState = {
  now: Date;
  homesteadPeriod: HomesteadTimePeriod;
  timeOfDay: ReturnType<typeof timeOfDayBucket>;
  season: WelcomeSeason;
  weather: WelcomeWeather;
  holiday?: LivingHomeLifeEvent;
  heroMotion?: "rain" | "snow";
  cssVars: Record<string, string>;
};

function welcomeWeatherFromLivingHome(
  weather: LivingHomeWeather,
): WelcomeWeather {
  switch (weather) {
    case "cloudy":
    case "fog":
      return "cloudy";
    case "rain":
    case "thunderstorm":
      return "rain";
    case "snow":
      return "snow";
    default:
      return "clear";
  }
}

function primaryHoliday(
  lifeEvents: readonly LivingHomeLifeEvent[],
  welcomeSeason: WelcomeSeason,
): LivingHomeLifeEvent | undefined {
  if (welcomeSeason === "holiday") {
    return lifeEvents.find((e) => e === "christmas") ?? lifeEvents[0] ?? "christmas";
  }
  return lifeEvents[0];
}

function heroMotionForWeather(weather: WelcomeWeather): "rain" | "snow" | undefined {
  if (weather === "rain") return "rain";
  if (weather === "snow") return "snow";
  return undefined;
}

/** Shared homestead scene state — same clock as the welcome living room. */
export function resolveHomesteadSceneState(input?: {
  now?: Date;
  surface?: HomesteadSceneSurface;
  weather?: LivingHomeWeather | string | null;
  openingDoor?: boolean;
}): HomesteadSceneState {
  const now = input?.now ?? new Date();
  const living = evaluateLivingHome({
    now,
    surface: livingHomeSurface(input?.surface),
    weather: input?.weather,
    openingDoor: input?.openingDoor,
  });

  const timeOfDay = timeOfDayBucket(now);
  const weather = welcomeWeatherFromLivingHome(living.weather);
  const holiday = primaryHoliday(living.lifeEvents, living.welcomeSeason);

  return {
    now,
    homesteadPeriod: living.homesteadTime.period,
    timeOfDay,
    season: living.welcomeSeason,
    weather,
    holiday,
    heroMotion: heroMotionForWeather(weather),
    cssVars: living.cssVars,
  };
}

export function homesteadSceneDataAttributes(
  state: HomesteadSceneState,
): Record<string, string | undefined> {
  return {
    "data-homestead-scene": "",
    "data-homestead-period": state.homesteadPeriod,
    "data-time-of-day": state.timeOfDay,
    "data-season": state.season,
    "data-weather": state.weather,
    ...(state.holiday ? { "data-holiday": state.holiday } : {}),
    ...(state.heroMotion ? { "data-hero-motion": state.heroMotion } : {}),
  };
}

export const HOMESTEAD_SCENE_REFRESH_MS = 15 * 60 * 1000;

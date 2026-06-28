import { resolveHomesteadTimePeriod } from "@/lib/homesteadTime";
import type { HomesteadTimePeriod } from "@/lib/homesteadTime/types";

/** Same garden photograph — light and weather shift with the day and season. */
export type GardenLightMood =
  | "sunrise"
  | "bright-morning"
  | "afternoon"
  | "golden-hour"
  | "blue-hour"
  | "moonlight";

export type GardenSeasonAccent =
  | "clear"
  | "rain"
  | "snow"
  | "autumn-leaves"
  | "spring-blossoms";

export type PeacefulPlacesGardenAtmosphere = {
  light: GardenLightMood;
  season: GardenSeasonAccent;
  lanternGlow: boolean;
};

function lightMoodFromPeriod(period: HomesteadTimePeriod): GardenLightMood {
  switch (period) {
    case "dawn":
      return "sunrise";
    case "morning":
      return "bright-morning";
    case "midday":
    case "afternoon":
      return "afternoon";
    case "golden-hour":
      return "golden-hour";
    case "evening":
      return "blue-hour";
    case "night":
    default:
      return "moonlight";
  }
}

function seasonAccentFromDate(now: Date): GardenSeasonAccent {
  const month = now.getMonth();
  if (month >= 2 && month <= 4) return "spring-blossoms";
  if (month >= 8 && month <= 10) return "autumn-leaves";
  if (month === 11 || month <= 1) return "snow";
  return "clear";
}

export function resolvePeacefulPlacesGardenAtmosphere(
  now = new Date(),
): PeacefulPlacesGardenAtmosphere {
  const period = resolveHomesteadTimePeriod(now);
  const light = lightMoodFromPeriod(period);
  const season = seasonAccentFromDate(now);
  const lanternGlow =
    light === "blue-hour" || light === "moonlight" || period === "evening";

  return { light, season, lanternGlow };
}

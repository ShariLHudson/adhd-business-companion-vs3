/**
 * Environmental Experience Intelligence — organic estate variation per visit.
 * V1: deterministic seed from date; V2+: full weather/season engine.
 */

import type { GalleryEnvironmentState, GallerySeason } from "./types";

function monthToSeason(month: number): GallerySeason {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

function hourToTimeOfDay(hour: number): GalleryEnvironmentState["timeOfDay"] {
  if (hour < 10) return "morning";
  if (hour < 15) return "afternoon";
  if (hour < 18) return "golden-hour";
  if (hour < 21) return "evening";
  return "night";
}

/** Resolve believable environment for this visit — never random chaos. */
export function resolveGalleryEnvironment(
  now = new Date(),
): GalleryEnvironmentState {
  const month = now.getMonth();
  const hour = now.getHours();
  const day = now.getDate();

  const season = monthToSeason(month);
  const timeOfDay = hourToTimeOfDay(hour);

  const weatherRoll = (day + month * 31) % 10;
  const weather =
    weatherRoll === 0
      ? "rain"
      : weatherRoll === 1 && (season === "winter" || season === "autumn")
        ? "snow"
        : weatherRoll === 2
          ? "clouds"
          : weatherRoll === 3
            ? "wind"
            : "clear";

  return {
    timeOfDay,
    season,
    weather,
    sunAngle: hour / 24,
  };
}

export function galleryEnvironmentClass(state: GalleryEnvironmentState): string {
  return `gallery--${state.season} gallery--${state.timeOfDay} gallery--${state.weather}`;
}

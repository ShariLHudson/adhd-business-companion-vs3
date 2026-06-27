import type { LivingHomeWeather } from "./types";

const WEATHER_VALUES: readonly LivingHomeWeather[] = [
  "sunny",
  "cloudy",
  "rain",
  "snow",
  "fog",
  "wind",
  "thunderstorm",
];

export function isLivingHomeWeather(value: string): value is LivingHomeWeather {
  return (WEATHER_VALUES as readonly string[]).includes(value);
}

/**
 * Weather layer — future-ready.
 * Today defaults to sunny until a weather provider is wired.
 */
export function resolveLivingHomeWeather(input?: {
  weather?: LivingHomeWeather | string | null;
}): LivingHomeWeather {
  const candidate = input?.weather;
  if (candidate && isLivingHomeWeather(candidate)) return candidate;
  return "sunny";
}

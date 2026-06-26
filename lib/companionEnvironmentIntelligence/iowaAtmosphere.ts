import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "./types";

function stablePick<T>(items: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return items[Math.abs(hash) % items.length]!;
}

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Iowa seasons — honest Midwest rhythm, not decorative labels.
 */
export function resolveIowaWeather(input: {
  season: WelcomeSeason;
  now?: Date;
}): WelcomeWeather {
  const now = input.now ?? new Date();
  const seed = dayKey(now);

  if (input.season === "winter" || input.season === "holiday") {
    return stablePick(["snow", "snow", "cloudy", "clear"] as const, seed);
  }

  if (input.season === "spring") {
    return stablePick(["rain", "rain", "cloudy", "clear"] as const, seed);
  }

  if (input.season === "autumn") {
    return stablePick(["cloudy", "clear", "rain", "clear"] as const, seed);
  }

  return stablePick(["clear", "clear", "cloudy"] as const, seed);
}

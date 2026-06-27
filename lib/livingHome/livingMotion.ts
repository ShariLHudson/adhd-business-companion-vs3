import type { LivingHomeMotionProfile, LivingHomeWeather } from "./types";

/**
 * Living Motion — subtle porch life; never competes with UI.
 */
export function resolveLivingHomeMotion(input: {
  weather: LivingHomeWeather;
  reducedMotion?: boolean;
}): LivingHomeMotionProfile {
  if (input.reducedMotion) {
    return {
      swing: false,
      plants: false,
      lanternFlicker: false,
      doorGlow: true,
      strength: 0,
    };
  }

  const windy =
    input.weather === "wind" || input.weather === "thunderstorm";
  const calm =
    input.weather === "fog" || input.weather === "snow";

  return {
    swing: true,
    plants: true,
    lanternFlicker: true,
    doorGlow: true,
    strength: windy ? 1 : calm ? 0.55 : 0.75,
  };
}

import type { HomesteadContinuousTime, HomesteadTimePeriod } from "./types";
import { HOMESTEAD_TIME_PERIODS, minuteOfDay } from "./timePeriods";

const DAY_START = 5 * 60;
const DAY_LENGTH = 24 * 60;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

function progressWithinPeriod(
  minute: number,
  startMinute: number,
  endMinute: number,
): number {
  if (startMinute <= endMinute) {
    return (minute - startMinute) / Math.max(1, endMinute - startMinute);
  }
  const length = DAY_LENGTH - startMinute + endMinute;
  const offset =
    minute >= startMinute ? minute - startMinute : DAY_LENGTH - startMinute + minute;
  return offset / Math.max(1, length);
}

/**
 * Continuous interpolation — sunlight shifts gradually, never preset jumps.
 */
export function resolveContinuousHomesteadTime(
  now = new Date(),
  period: HomesteadTimePeriod,
): HomesteadContinuousTime {
  const minute = minuteOfDay(now);
  const dayMinute =
    minute >= DAY_START ? minute - DAY_START : DAY_LENGTH - DAY_START + minute;
  const dayProgress = dayMinute / (DAY_LENGTH - DAY_START);

  const definition = HOMESTEAD_TIME_PERIODS.find((entry) => entry.period === period);
  const within = definition
    ? progressWithinPeriod(minute, definition.startMinute, definition.endMinute)
    : 0;

  let sunWarmth = 0.35;
  let shadowLength = 0.35;
  let interiorGlow = 0.15;
  let exteriorBrightness = 0.45;
  let colorTemperature = 0.45;

  switch (period) {
    case "dawn":
      sunWarmth = lerp(0.2, 0.42, within);
      shadowLength = lerp(0.7, 0.55, within);
      exteriorBrightness = lerp(0.25, 0.5, within);
      colorTemperature = lerp(0.25, 0.4, within);
      break;
    case "morning":
      sunWarmth = lerp(0.45, 0.62, within);
      shadowLength = lerp(0.45, 0.35, within);
      exteriorBrightness = lerp(0.55, 0.78, within);
      colorTemperature = lerp(0.42, 0.55, within);
      break;
    case "midday":
      sunWarmth = lerp(0.62, 0.7, within);
      shadowLength = lerp(0.2, 0.15, within);
      exteriorBrightness = lerp(0.82, 0.95, within);
      colorTemperature = lerp(0.55, 0.62, within);
      break;
    case "afternoon":
      sunWarmth = lerp(0.58, 0.52, within);
      shadowLength = lerp(0.28, 0.42, within);
      exteriorBrightness = lerp(0.72, 0.62, within);
      colorTemperature = lerp(0.52, 0.58, within);
      break;
    case "golden-hour":
      sunWarmth = lerp(0.68, 0.88, within);
      shadowLength = lerp(0.55, 0.82, within);
      exteriorBrightness = lerp(0.58, 0.45, within);
      colorTemperature = lerp(0.72, 0.92, within);
      interiorGlow = lerp(0.22, 0.38, within);
      break;
    case "evening":
      sunWarmth = lerp(0.42, 0.3, within);
      shadowLength = lerp(0.75, 0.85, within);
      exteriorBrightness = lerp(0.28, 0.12, within);
      interiorGlow = lerp(0.45, 0.72, within);
      colorTemperature = lerp(0.62, 0.78, within);
      break;
    case "night":
      sunWarmth = lerp(0.18, 0.12, within);
      shadowLength = 0.9;
      exteriorBrightness = lerp(0.08, 0.05, within);
      interiorGlow = lerp(0.68, 0.55, within);
      colorTemperature = lerp(0.75, 0.7, within);
      break;
  }

  return {
    dayProgress: clamp01(dayProgress),
    sunWarmth: clamp01(sunWarmth),
    shadowLength: clamp01(shadowLength),
    interiorGlow: clamp01(interiorGlow),
    exteriorBrightness: clamp01(exteriorBrightness),
    colorTemperature: clamp01(colorTemperature),
  };
}

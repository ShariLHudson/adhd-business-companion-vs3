import type { CompanionMotionKind } from "@/lib/companionEnvironmentIntelligence/types";
import type { EnvironmentalCause } from "./types";

/**
 * Cause → Effect library™
 * Motion is an effect. If the cause is not present, the effect does not render.
 */
export const MOTION_CAUSE_MAP: Record<
  CompanionMotionKind,
  EnvironmentalCause[]
> = {
  steam: ["fresh-coffee", "fresh-tea"],
  sunlight: ["morning-sun"],
  rain: ["rain-outside"],
  snow: ["snow-outside"],
  lamplight: ["evening-indoors", "rain-outside"],
  curtains: ["window-open", "summer-breeze", "wind-outside"],
  foliage: ["summer-iowa", "summer-breeze", "wind-outside"],
  butterflies: ["butterflies-day", "summer-iowa"],
  fireflies: ["fireflies-evening"],
  candle: ["indoor-warmth", "summer-breeze"],
  "holiday-lights": ["holiday-season"],
};

export const CAUSE_NARRATIVE: Record<EnvironmentalCause, string> = {
  "fresh-coffee": "Of course there is steam — fresh coffee is waiting.",
  "fresh-tea": "Of course there is steam — tea was just poured.",
  "morning-sun": "Of course the light is warm — morning sun through the window.",
  "rain-outside": "Of course the room is softer — rain outside.",
  "snow-outside": "Of course the world is quiet — Iowa frost at the glass.",
  "evening-indoors": "Of course the lamp is on — evening arrived indoors.",
  "summer-breeze": "Of course the curtains move — a summer breeze through an open window.",
  "wind-outside": "Of course the branches sway — wind outside.",
  "window-open": "Of course the curtains stir — the window is open.",
  "summer-iowa": "Of course it feels lush — summer in Iowa.",
  "winter-iowa": "Of course it feels still — winter closed the windows.",
  "indoor-warmth": "Of course the candle is alive — a warm room on a real day.",
  "fireflies-evening": "Of course there is a glow outside — fireflies at dusk.",
  "butterflies-day": "Of course something drifts past — butterflies in summer light.",
  "holiday-season": "Of course the room feels gathered — holiday season indoors.",
};

/** Causes that mandate an effect even if not previously requested. */
export const CAUSE_REQUIRED_MOTION: Partial<
  Record<EnvironmentalCause, CompanionMotionKind[]>
> = {
  "rain-outside": ["rain", "lamplight"],
  "snow-outside": ["snow"],
  "morning-sun": ["sunlight"],
  "fresh-coffee": ["steam"],
  "fresh-tea": ["steam"],
  "evening-indoors": ["lamplight"],
  "summer-breeze": ["curtains"],
  "window-open": ["curtains"],
};

export const CAUSE_FORBIDDEN_MOTION: Partial<
  Record<EnvironmentalCause, CompanionMotionKind[]>
> = {
  "rain-outside": ["sunlight"],
  "snow-outside": ["butterflies", "fireflies"],
  "winter-iowa": ["butterflies", "fireflies", "foliage"],
};

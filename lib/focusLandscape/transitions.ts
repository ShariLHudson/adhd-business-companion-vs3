import type {
  FocusLandscapeSpaceId,
  FocusLandscapeTransition,
} from "./types";
import { FOCUS_LANDSCAPE_CONNECTIONS } from "./spaceCatalog";

export function transitionBetweenSpaces(
  from: FocusLandscapeSpaceId,
  to: FocusLandscapeSpaceId,
): FocusLandscapeTransition {
  if (from === to) return "path-shift";
  if (from === "garden-path" && to === "meadow-lake") return "walk-forward";
  if (to === "deep-forest" || from === "deep-forest") return "weather-shift";
  if (to === "forest-pavilion" || from === "forest-pavilion") {
    return "weather-shift";
  }
  if (to === "horizon-trail") return "walk-forward";
  return "terrain-change";
}

export function canTransition(
  from: FocusLandscapeSpaceId,
  to: FocusLandscapeSpaceId,
): boolean {
  if (from === to) return true;
  return FOCUS_LANDSCAPE_CONNECTIONS[from]?.includes(to) ?? false;
}

export function resolveFocusTransition(input: {
  from?: FocusLandscapeSpaceId;
  to: FocusLandscapeSpaceId;
}): FocusLandscapeTransition {
  if (input.to === "horizon-trail") return "walk-forward";
  if (input.to === "deep-forest") return "weather-shift";
  if (input.to === "forest-pavilion") return "weather-shift";
  if (!input.from) return "path-shift";
  return transitionBetweenSpaces(input.from, input.to);
}

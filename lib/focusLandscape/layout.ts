import type { FocusLandscapeSpaceId } from "./types";

export function cssVarsForFocusSpace(
  spaceId: FocusLandscapeSpaceId,
): Record<string, string> {
  const base = {
    "--focus-landscape-space": spaceId,
  };
  switch (spaceId) {
    case "garden-path":
      return {
        ...base,
        "--scene-image-position": "50% 55%",
        "--scene-panel-frosted-opacity": "0.48",
        "--room-protected-zone-expand": "0.52",
        "--focus-landscape-wash": "rgba(232, 240, 228, 0.24)",
        "--focus-landscape-light": "morning-fog",
      };
    case "meadow-lake":
      return {
        ...base,
        "--scene-image-position": "50% 68%",
        "--scene-panel-frosted-opacity": "0.42",
        "--room-protected-zone-expand": "0.48",
        "--focus-landscape-wash": "rgba(248, 252, 246, 0.18)",
        "--focus-landscape-light": "meadow-lake",
      };
    case "meadow-stretch":
      return {
        ...base,
        "--scene-image-position": "48% 58%",
        "--scene-panel-frosted-opacity": "0.44",
        "--focus-landscape-wash": "rgba(240, 248, 236, 0.2)",
        "--focus-landscape-light": "forest-clearing",
      };
    case "forest-pavilion":
      return {
        ...base,
        "--scene-image-position": "42% 52%",
        "--scene-panel-frosted-opacity": "0.5",
        "--focus-landscape-wash": "rgba(228, 236, 232, 0.28)",
        "--focus-landscape-light": "rain-shelter",
      };
    case "meadow-object-field":
      return {
        ...base,
        "--scene-image-position": "52% 60%",
        "--scene-panel-frosted-opacity": "0.4",
        "--focus-landscape-wash": "rgba(252, 248, 236, 0.16)",
        "--focus-landscape-light": "playful-meadow",
      };
    case "horizon-trail":
      return {
        ...base,
        "--scene-image-position": "50% 42%",
        "--scene-panel-frosted-opacity": "0.38",
        "--focus-landscape-wash": "rgba(255, 252, 240, 0.14)",
        "--focus-landscape-light": "horizon-sun",
      };
    case "deep-forest":
      return {
        ...base,
        "--scene-image-position": "45% 58%",
        "--scene-panel-frosted-opacity": "0.52",
        "--room-protected-zone-expand": "0.54",
        "--focus-landscape-wash": "rgba(220, 228, 220, 0.32)",
        "--focus-landscape-light": "deep-fog",
        "--focus-landscape-saturation": "0.72",
      };
    default:
      return base;
  }
}

export function subtitleForSpace(spaceId: FocusLandscapeSpaceId): string {
  switch (spaceId) {
    case "garden-path":
      return "One visible next step — the path forward is enough.";
    case "meadow-lake":
      return "My mind slows down here without trying.";
    case "meadow-stretch":
      return "Let your body release what your mind has been holding.";
    case "forest-pavilion":
      return "Sound carries the calm — rain outside, quiet inside.";
    case "meadow-object-field":
      return "Gentle play — no pressure, no score.";
    case "horizon-trail":
      return "Go move your body. The trail will wait.";
    case "deep-forest":
      return "Nothing to decide. Just breathe with the trees.";
    default:
      return "";
  }
}

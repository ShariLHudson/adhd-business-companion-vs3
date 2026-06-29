import type { CinematicFraming, CinematicPresetId } from "./types";

/** Default cinematic crop — minimal scale to clear embedded watermarks. */
export const CINEMATIC_DEFAULT_FRAMING: CinematicFraming = {
  scale: 1.05,
  position: "center center",
  gradientStrength: 1,
};

/**
 * Per-workspace framing registry — override scale/position here as the video
 * library grows (seasonal, weather, room-specific scenes).
 */
export const CINEMATIC_PRESETS: Record<CinematicPresetId, CinematicFraming> = {
  home: {
    scale: 1.05,
    position: "center center",
    gradientStrength: 1,
  },
  "clear-my-mind": {
    scale: 1.06,
    position: "center 45%",
    gradientStrength: 1,
  },
  "clear-my-mind-thoughts": {
    scale: 1.06,
    position: "center 45%",
    gradientStrength: 1,
  },
  "plan-my-day": {
    scale: 1.05,
    position: "center 45%",
    gradientStrength: 1,
  },
  "todays-reality": {
    scale: 1.05,
    position: "center 45%",
    gradientStrength: 1,
  },
  "peaceful-places": {
    scale: 1.05,
    position: "center center",
    gradientStrength: 0.85,
  },
  "peaceful-place-session": {
    scale: 1.05,
    position: "center center",
    gradientStrength: 0.75,
  },
  "focus-my-brain": {
    scale: 1.05,
    position: "center center",
    gradientStrength: 1,
  },
  growth: {
    scale: 1.05,
    position: "center 45%",
    gradientStrength: 1,
  },
  journal: {
    scale: 1.05,
    position: "center 45%",
    gradientStrength: 1,
  },
  "life-evidence": {
    scale: 1.05,
    position: "center center",
    gradientStrength: 1,
  },
  "evidence-vault": {
    scale: 1,
    position: "center center",
    gradientStrength: 0,
  },
  "creative-studio": {
    scale: 1,
    position: "center center",
    gradientStrength: 0,
  },
  "celebration-garden": {
    scale: 1,
    position: "center center",
    gradientStrength: 0,
  },
  "story-library": {
    scale: 1.05,
    position: "center center",
    gradientStrength: 0.85,
  },
  "capture-moment": {
    scale: 1.05,
    position: "center 45%",
    gradientStrength: 0.85,
  },
  "momentum-games": {
    scale: 1.05,
    position: "center 45%",
    gradientStrength: 0.85,
  },
  default: CINEMATIC_DEFAULT_FRAMING,
};

export function resolveCinematicPreset(
  presetId?: CinematicPresetId | string | null,
): CinematicFraming {
  if (!presetId) return CINEMATIC_DEFAULT_FRAMING;
  return (
    CINEMATIC_PRESETS[presetId as CinematicPresetId] ?? CINEMATIC_DEFAULT_FRAMING
  );
}

export function cinematicFramingToCssVars(
  framing: CinematicFraming,
): Record<string, string> {
  return {
    "--video-scale": String(framing.scale),
    "--video-position": framing.position,
    "--cinematic-fade-strength": String(framing.gradientStrength),
    "--scene-image-scale": String(framing.scale),
    "--scene-image-position": framing.position,
  };
}

/** Per-scene cinematic framing — scale, position, and bottom fade strength. */
export type CinematicFraming = {
  scale: number;
  position: string;
  gradientStrength: number;
};

export const CINEMATIC_PRESET_IDS = [
  "home",
  "clear-my-mind",
  "clear-my-mind-thoughts",
  "plan-my-day",
  "todays-reality",
  "peaceful-places",
  "peaceful-place-session",
  "focus-my-brain",
  "growth",
  "journal",
  "life-evidence",
  "evidence-vault",
  "creative-studio",
  "celebration-garden",
  "story-library",
  "capture-moment",
  "momentum-games",
  "default",
] as const;

export type CinematicPresetId = (typeof CINEMATIC_PRESET_IDS)[number];

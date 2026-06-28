/**
 * The Gallery™ — permanent conservatory hallway architecture.
 * Uses gallery-background as the base plate; do not redesign the hallway.
 */

// TODO: Replace gallery-background.png with clean hallway plate:
// no title, no top controls, no bottom navigation, no UI baked into image.
//
// FREEZE: Once the clean master plate is approved, treat it as the permanent
// environment. Only dynamic layers change after that (walk, memories, lighting,
// seasons, weather, ambient sound, user content).
// - Entrance: 40–50% fewer frames — negative space, one beautiful frame, windows, bench
// - Plaques: smaller, lower, subtle — discover on approach, not readable from afar
// - Beginning walls: welcome quote + empty frame "Still Being Written" — NOT first client/sale
// - Side table: tea, glasses, journal — no candle
// - Rugs only at sitting areas, not traffic lane
// - Grandfather clock: keep (iconic)
// - Windows: larger — estate continuity with gardens, library trees, conservatory, barn

export const GALLERY_BACKGROUND_SRC =
  "/backgrounds/gallery-background.png" as const;

/** Foyer arrival before the hallway walk begins. */
export const GALLERY_FOYER_FADE_MS = 1400 as const;

/**
 * Temporary framing — crop baked mockup chrome until clean plate ships.
 * Prefer zoom/crop over visible overlay patches.
 */
export const GALLERY_PLATE_FRAME = {
  /** Crop baked title, bottom nav, and entrance dated frames at the viewport. */
  hallwayScale: 1.65,
  entranceObjectY: 50,
  advancedObjectY: 44,
} as const;

/**
 * Long hallway plate — camera travels along it so wall items scroll into view.
 * widthRatio: plate width relative to viewport (2.4 = 240vw hall length).
 */
export const GALLERY_HALLWAY_PLATE = {
  widthRatio: 2.4,
  transformOrigin: "14% 56%",
} as const;

/** Time to stroll from entrance to the far end — forward only, no reverse. */
export const GALLERY_WALK_CYCLE_MS = 72_000 as const;

/** Fade-in when Growth opens The Gallery — no splash screen. */
export const GALLERY_ENTER_FADE_MS = 1200 as const;

/** Start framing — away from dated mockup frames at the entrance. */
export const GALLERY_WALK_ENTRANCE = {
  objectXPercent: 54,
  objectYPercent: 50,
} as const;

/** @deprecated Pan constants — walk now travels the hallway plate. */
export const GALLERY_WALK_PAN = {
  startXPercent: 0,
  startYPercent: 0,
  endXPercent: -18,
  endYPercent: -3.5,
} as const;

export const GALLERY_HALLWAY_OBJECT_POSITION = "54% 50%" as const;

export const GALLERY_WALK_TRANSFORM_ORIGIN = "50% 55%" as const;

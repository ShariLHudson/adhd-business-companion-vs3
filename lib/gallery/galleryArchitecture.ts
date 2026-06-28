/**
 * The Gallery™ — estate spine architecture & emotional walk order.
 * Visible hallway art follows this arc when memories populate the walls.
 */

export const GALLERY_EMOTIONAL_ARC = [
  "arrival",
  "beginning",
  "discovery",
  "growth",
  "confidence",
  "legacy",
  "reflection",
] as const;

export type GalleryEmotionalArcPhase = (typeof GALLERY_EMOTIONAL_ARC)[number];

/** Walk-position bands (0–1 along hallway) — future memory placement engine. */
export const GALLERY_WALK_ZONES: Record<
  GalleryEmotionalArcPhase,
  { start: number; end: number; notes: string }
> = {
  arrival: {
    start: 0,
    end: 0.08,
    notes: "Foyer — brass sign, flowers, one painting. No accomplishments yet.",
  },
  beginning: {
    start: 0.08,
    end: 0.22,
    notes:
      "Hope & possibility — welcome quote, empty frame “Still Being Written”, negative space.",
  },
  discovery: {
    start: 0.22,
    end: 0.4,
    notes: "Small early memories — one beautiful frame, window, bench, breathing room.",
  },
  growth: {
    start: 0.4,
    end: 0.58,
    notes: "Business milestones — first client, first launch, farther down the hall.",
  },
  confidence: {
    start: 0.58,
    end: 0.74,
    notes: "Evidence, proof, testimonials — subtle plaques, discover on approach.",
  },
  legacy: {
    start: 0.74,
    end: 0.88,
    notes: "Portfolio — finished work, published content, completed projects.",
  },
  reflection: {
    start: 0.88,
    end: 1,
    notes: "Journal branch — quiet reflection room off the spine.",
  },
};

/** Entrance copy — beginning zone, not accomplishments. */
export const GALLERY_BEGINNING_WALL_COPY = {
  welcomeQuote: "Every story begins with one step.",
  emptyFramePlaque: "Still Being Written",
  journeyWelcome: "Welcome to your journey.",
} as const;

/** Companion whisper when sunlight catches a memory (V1 — rare, gentle). */
export const GALLERY_MEMORY_WHISPER =
  "I'd forgotten about this one." as const;

export const GALLERY_MEMORY_GLOW_MIN_MS = 48_000;
export const GALLERY_MEMORY_GLOW_MAX_MS = 96_000;

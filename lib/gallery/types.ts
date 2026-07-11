import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";
import type { AppSection } from "@/lib/companionUi";

/**
 * V1 hallway wall frames — runtime implementation.
 * Preservation philosophy and categories: T-015 @see docs/GALLERY_FRAMEWORK.md
 * Framework types: lib/sparkGallery/types.ts
 */
/** Wall memory kinds — rotate naturally; never clutter a wall. Map to GalleryCategory (T-015) when curating. */
export type GalleryMemoryKind =
  | "journal-entry"
  | "testimonial"
  | "published-work"
  | "product-launch"
  | "personal-photo"
  | "milestone"
  | "quote"
  | "project-complete"
  | "breakthrough"
  | "voice-note"
  | "achievement";

/** A single framed memory on the hallway wall. */
export type GalleryMemory = IntelligenceReadyHooks & {
  kind: GalleryMemoryKind;
  title: string;
  subtitle?: string;
  body?: string;
  plaque?: string;
  occurredAt?: string;
  wallSide?: "left" | "right";
  /** 0–1 approximate position along the walk path when frame is centered. */
  walkPosition?: number;
  importance?: number;
  lastShownAt?: string;
};

export type GalleryTimeOfDay =
  | "morning"
  | "afternoon"
  | "golden-hour"
  | "evening"
  | "night";

export type GallerySeason = "spring" | "summer" | "autumn" | "winter";

export type GalleryWeather =
  | "clear"
  | "clouds"
  | "rain"
  | "snow"
  | "wind";

/** Environmental Experience Intelligence — believable, organic estate state. */
export type GalleryEnvironmentState = {
  timeOfDay: GalleryTimeOfDay;
  season: GallerySeason;
  weather: GalleryWeather;
  /** Skylight / window light angle — future lighting engine. */
  sunAngle?: number;
};

export type GalleryDestinationId =
  | "continue-walking"
  | "journal"
  | "portfolio"
  | "evidence-bank"
  | "highlights";

/** Bottom-nav destinations — room entry is a walk transition, never a cut (V2). */
export const GALLERY_DESTINATION_SECTION: Partial<
  Record<GalleryDestinationId, AppSection>
> = {
  "evidence-bank": "evidence-bank",
  highlights: "confidence-vault",
  journal: "my-journey",
  portfolio: "saved-work",
};

export type GalleryWalkFrame = {
  /** 0–1 progress along the hall. */
  walkProgress: number;
  objectPosition: string;
};

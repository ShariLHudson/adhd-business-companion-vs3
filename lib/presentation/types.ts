/**
 * Presentation Modes — types only.
 *
 * Feature logic and data are presentation-agnostic.
 * Presentation mode selects how a feature appears, not what it does.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

import type { AppSection } from "@/lib/companionUi";

/** User-facing presentation preference (Settings → Workspace Experience). */
export type PresentationModeId = "spark-estate" | "focus-workspace" | "adaptive";

/** How a feature is rendered — not what it does. */
export type PresentationSurfaceKind =
  | "estate-room"
  | "workspace-panel"
  | "mobile-compact"
  | "voice-only";

/**
 * Stable feature identity — independent of estate place names and room art.
 * Distinct from AppFeatureId (chat how-to navigation hints).
 */
export type SparkFeatureId =
  | "evidence-vault"
  | "hall-of-accomplishments"
  | "discovery-engine"
  | "cartographer"
  | "breathe"
  | "journal"
  | "chamber"
  | "personal-library"
  | "clear-my-mind"
  | "plan-my-day"
  | "projects"
  | "observatory";

/** Canonical navigation target for a feature — shared across presentation modes. */
export type SparkFeatureRoute = {
  /** Estate place id when the feature maps to a room; optional for section-only tools. */
  placeId?: string;
  /** Primary AppSection shell — same data and logic in every mode. */
  section: AppSection;
};

/** One presentation binding for a feature in a given mode. */
export type FeaturePresentationSurface = {
  kind: PresentationSurfaceKind;
  section: AppSection;
  /** Estate place for immersive shell; omitted for workspace-only surfaces. */
  estatePlaceId?: string;
};

export type SparkFeatureDefinition = {
  id: SparkFeatureId;
  displayName: string;
  route: SparkFeatureRoute;
  /**
   * Per-mode presentation. `null` = not built yet — resolver falls back to spark-estate.
   */
  surfaces: Record<PresentationModeId, FeaturePresentationSurface | null>;
};

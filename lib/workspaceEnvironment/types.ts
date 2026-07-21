/**
 * Workspace Environment Personalization (091) — contracts only.
 * Does not own Estate place identity or Work persistence.
 */

export type WorkspaceEnvironmentKind =
  | "estate_place"
  | "professional_extension";

export type WorkspaceEnvironmentId =
  | "creative-marketing-studio"
  | "executive-strategy-office"
  | "modern-project-studio"
  | "authors-library"
  | "teaching-studio"
  | "recording-studio"
  | "executive-financial-office"
  | "innovation-lab"
  | "university-reading-room"
  | "event-planning-studio"
  | "professional-meeting-suite"
  | "executive-planning-office"
  | "modern-office"
  | "mountain-cabin"
  | "beach-house"
  | "coffee-shop"
  | "library"
  | "creative-loft"
  | "garden-studio"
  | "minimal-workspace"
  | "executive-office"
  | "glass-conservatory";

export type WorkspaceThemeId =
  | "morning-light"
  | "golden-hour"
  | "rainy-day"
  | "snowfall"
  | "autumn"
  | "spring"
  | "night"
  | "fireplace"
  | "ocean-view"
  | "christmas"
  | "default";

export type WorkspaceEnvironmentDefinition = {
  id: WorkspaceEnvironmentId;
  title: string;
  kind: WorkspaceEnvironmentKind;
  /** When the environment is (or maps to) a Canonical Estate place. */
  estatePlaceId?: string;
  description: string;
};

export type WorkspaceThemeDefinition = {
  id: WorkspaceThemeId;
  title: string;
  description: string;
};

export type WorkspaceEnvironmentAccessibilityPrefs = {
  /** When true, show calm solid/gradient instead of photograph. */
  disableImagery: boolean;
  reduceVisualComplexity: boolean;
  /** 0–1 additional blur on the environment plate. */
  backgroundBlur: number;
  /** 0–1 opacity of the frosted work surface (higher = more opaque). */
  workSurfaceOpacity: number;
  reduceMotion: boolean;
  highContrast: boolean;
};

export type WorkTypeWorkspacePreference = {
  workTypeId: string;
  environmentId: WorkspaceEnvironmentId;
  themeId: WorkspaceThemeId;
};

export type ResolvedWorkspaceEnvironment = {
  workTypeId: string;
  environment: WorkspaceEnvironmentDefinition;
  themeId: WorkspaceThemeId;
  /** True when resolved from member preference rather than Work Type default. */
  fromPreference: boolean;
  accessibility: WorkspaceEnvironmentAccessibilityPrefs;
};

/**
 * Spark Feature Registry — feature logic routes, presentation surfaces per mode.
 *
 * Routes open features. Presentation determines how they appear.
 * Focus Workspace surfaces are registered as null until built.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

import type {
  FeaturePresentationSurface,
  PresentationModeId,
  SparkFeatureDefinition,
  SparkFeatureId,
} from "./types";

const estate = (
  section: FeaturePresentationSurface["section"],
  estatePlaceId: string,
): FeaturePresentationSurface => ({
  kind: "estate-room",
  section,
  estatePlaceId,
});

const focusWorkspaceStub = (
  section: FeaturePresentationSurface["section"],
): FeaturePresentationSurface => ({
  kind: "workspace-panel",
  section,
});

function surfaces(
  estateSurface: FeaturePresentationSurface,
  workspaceSection: FeaturePresentationSurface["section"],
): Record<PresentationModeId, FeaturePresentationSurface | null> {
  return {
    "spark-estate": estateSurface,
    "focus-workspace": null,
    adaptive: null,
    // Future: "focus-workspace": focusWorkspaceStub(workspaceSection),
  };
}

export const SPARK_FEATURES: readonly SparkFeatureDefinition[] = [
  {
    id: "evidence-vault",
    displayName: "Evidence Vault",
    route: { placeId: "evidence-vault", section: "evidence-bank" },
    surfaces: surfaces(
      estate("evidence-bank", "evidence-vault"),
      "evidence-bank",
    ),
  },
  {
    id: "hall-of-accomplishments",
    displayName: "Hall of Accomplishments",
    route: { placeId: "portfolio", section: "growth-portfolio" },
    surfaces: surfaces(
      estate("growth-portfolio", "portfolio"),
      "growth-portfolio",
    ),
  },
  {
    id: "discovery-engine",
    displayName: "Discovery Engine",
    route: { placeId: "discovery-room", section: "home" },
    surfaces: surfaces(estate("home", "discovery-room"), "home"),
  },
  {
    id: "cartographer",
    displayName: "Visual Thinking Studio",
    route: { placeId: "cartographers-studio", section: "visual-focus" },
    surfaces: surfaces(
      estate("visual-focus", "cartographers-studio"),
      "visual-focus",
    ),
  },
  {
    id: "breathe",
    displayName: "Breathe",
    route: { section: "breathe" },
    surfaces: {
      "spark-estate": {
        kind: "estate-room",
        section: "breathe",
        estatePlaceId: "butterfly-house",
      },
      "focus-workspace": null,
      adaptive: null,
    },
  },
  {
    id: "journal",
    displayName: "Journal",
    route: { placeId: "journal", section: "growth-journal" },
    surfaces: surfaces(estate("growth-journal", "journal"), "growth-journal"),
  },
  {
    id: "chamber",
    displayName: "Chamber of Momentum",
    route: { placeId: "chamber-of-momentum", section: "chamber-of-momentum" },
    surfaces: surfaces(
      estate("chamber-of-momentum", "chamber-of-momentum"),
      "chamber-of-momentum",
    ),
  },
  {
    id: "personal-library",
    displayName: "Personal Library",
    route: { placeId: "personal-library", section: "growth-library" },
    surfaces: surfaces(
      estate("growth-library", "personal-library"),
      "growth-library",
    ),
  },
  {
    id: "clear-my-mind",
    displayName: "Clear My Mind",
    route: { placeId: "clear-my-mind", section: "brain-dump" },
    surfaces: surfaces(estate("brain-dump", "clear-my-mind"), "brain-dump"),
  },
  {
    id: "plan-my-day",
    displayName: "Plan My Day",
    route: { section: "plan-my-day" },
    surfaces: {
      "spark-estate": {
        kind: "estate-room",
        section: "plan-my-day",
        estatePlaceId: "conservatory",
      },
      "focus-workspace": null,
      adaptive: null,
    },
  },
  {
    id: "projects",
    displayName: "Goals & Projects",
    route: { placeId: "goals-projects", section: "projects" },
    surfaces: surfaces(estate("projects", "goals-projects"), "projects"),
  },
  {
    id: "observatory",
    displayName: "Observatory",
    route: { placeId: "observatory", section: "grow-observatory" },
    surfaces: surfaces(
      estate("grow-observatory", "observatory"),
      "grow-observatory",
    ),
  },
] as const;

const FEATURE_BY_ID: ReadonlyMap<SparkFeatureId, SparkFeatureDefinition> =
  new Map(SPARK_FEATURES.map((f) => [f.id, f]));

export function getSparkFeature(
  featureId: SparkFeatureId,
): SparkFeatureDefinition {
  const feature = FEATURE_BY_ID.get(featureId);
  if (!feature) {
    throw new Error(`Unknown Spark feature: ${featureId}`);
  }
  return feature;
}

export function listSparkFeatures(): readonly SparkFeatureDefinition[] {
  return SPARK_FEATURES;
}

/** Place id used for estate navigation — prefers explicit route, then estate surface. */
export function resolveFeaturePlaceId(featureId: SparkFeatureId): string | null {
  const feature = getSparkFeature(featureId);
  if (feature.route.placeId) return feature.route.placeId;
  const estateSurface = feature.surfaces["spark-estate"];
  return estateSurface?.estatePlaceId ?? null;
}

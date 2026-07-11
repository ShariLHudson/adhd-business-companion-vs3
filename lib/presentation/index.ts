/**
 * Presentation Modes — public API.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

export type {
  FeaturePresentationSurface,
  PresentationModeId,
  PresentationSurfaceKind,
  SparkFeatureDefinition,
  SparkFeatureId,
  SparkFeatureRoute,
} from "./types";

export {
  DEFAULT_PRESENTATION_MODE,
  readPresentationModePreference,
  writePresentationModePreference,
} from "./presentationModePreference";

export {
  getSparkFeature,
  listSparkFeatures,
  resolveFeaturePlaceId,
  SPARK_FEATURES,
} from "./sparkFeatureRegistry";

export {
  resolveActivePresentationMode,
  resolveEffectivePresentationMode,
  resolveFeaturePresentation,
} from "./resolvePresentation";

export { openSparkFeature, type OpenSparkFeatureInput } from "./openSparkFeature";

export { PRESENTATION_COUPLING_RULES } from "./couplingRules";

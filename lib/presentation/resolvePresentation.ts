/**
 * Resolve active presentation mode and per-feature surfaces.
 *
 * Focus Workspace and Adaptive are stubbed — always fall back to Spark Estate
 * until those shells ship.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

import { getSparkFeature } from "./sparkFeatureRegistry";
import {
  DEFAULT_PRESENTATION_MODE,
  readPresentationModePreference,
} from "./presentationModePreference";
import type {
  FeaturePresentationSurface,
  PresentationModeId,
  SparkFeatureId,
} from "./types";

export function resolveActivePresentationMode(): PresentationModeId {
  return readPresentationModePreference();
}

/**
 * Adaptive mode is not implemented — returns spark-estate until scheduling
 * and suggestion logic exist.
 */
export function resolveEffectivePresentationMode(
  requested: PresentationModeId = resolveActivePresentationMode(),
): Exclude<PresentationModeId, "adaptive"> | "spark-estate" {
  if (requested === "adaptive") return DEFAULT_PRESENTATION_MODE;
  if (requested === "focus-workspace") {
    // Shell not built — estate remains canonical until workspace ships.
    return DEFAULT_PRESENTATION_MODE;
  }
  return requested;
}

export function resolveFeaturePresentation(
  featureId: SparkFeatureId,
  mode: PresentationModeId = resolveActivePresentationMode(),
): FeaturePresentationSurface {
  const feature = getSparkFeature(featureId);
  const effective = resolveEffectivePresentationMode(mode);
  const surface =
    feature.surfaces[effective] ?? feature.surfaces[DEFAULT_PRESENTATION_MODE];
  if (!surface) {
    throw new Error(
      `No presentation surface for feature ${featureId} in mode ${effective}`,
    );
  }
  return surface;
}

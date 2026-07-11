/**
 * Open a Spark feature by stable id — presentation-agnostic navigation.
 *
 * Uses canonical feature route (place + section). Presentation mode selects
 * the shell around the same logic; today that is always Spark Estate.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

import {
  goToPlace,
  type GoToPlaceInput,
  type GoToPlaceOutcome,
} from "@/lib/estate/goToPlace";
import { resolveFeaturePlaceId } from "./sparkFeatureRegistry";
import type { SparkFeatureId } from "./types";

export type OpenSparkFeatureInput = Omit<GoToPlaceInput, "placeId"> & {
  featureId: SparkFeatureId;
};

/**
 * Navigate to a feature. Requires a resolvable estate place for goToPlace.
 * Section-only features must gain a place mapping before using this helper.
 */
export function openSparkFeature(
  input: OpenSparkFeatureInput,
): GoToPlaceOutcome {
  const placeId = resolveFeaturePlaceId(input.featureId);
  if (!placeId) {
    return {
      ok: false,
      placeId: "",
      reason: "no-place",
      message: `Feature ${input.featureId} has no estate place for goToPlace — open via section shell instead`,
    };
  }
  const { featureId: _featureId, ...rest } = input;
  return goToPlace({ placeId, ...rest });
}

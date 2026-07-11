import { describe, expect, it } from "vitest";
import {
  getSparkFeature,
  openSparkFeature,
  resolveFeaturePlaceId,
  resolveFeaturePresentation,
  resolveEffectivePresentationMode,
  SPARK_FEATURES,
} from "./index";

describe("presentation modes architecture", () => {
  it("registers all named foundational features", () => {
    const ids = SPARK_FEATURES.map((f) => f.id);
    expect(ids).toContain("evidence-vault");
    expect(ids).toContain("chamber");
    expect(ids).toContain("cartographer");
    expect(ids).toContain("journal");
    expect(ids.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps feature route stable regardless of presentation mode", () => {
    const vault = getSparkFeature("evidence-vault");
    expect(vault.route.section).toBe("evidence-bank");
    expect(vault.route.placeId).toBe("evidence-vault");

    const estate = resolveFeaturePresentation("evidence-vault", "spark-estate");
    expect(estate.kind).toBe("estate-room");
    expect(estate.estatePlaceId).toBe("evidence-vault");
    expect(estate.section).toBe("evidence-bank");
  });

  it("falls back to spark-estate when focus-workspace is not built", () => {
    const effective = resolveEffectivePresentationMode("focus-workspace");
    expect(effective).toBe("spark-estate");

    const surface = resolveFeaturePresentation("chamber", "focus-workspace");
    expect(surface.kind).toBe("estate-room");
    expect(surface.estatePlaceId).toBe("chamber-of-momentum");
  });

  it("falls back to spark-estate for adaptive mode", () => {
    expect(resolveEffectivePresentationMode("adaptive")).toBe("spark-estate");
  });

  it("resolves chamber place id for navigation", () => {
    expect(resolveFeaturePlaceId("chamber")).toBe("chamber-of-momentum");
  });

  it("openSparkFeature delegates to goToPlace with canonical place", () => {
    const result = openSparkFeature({
      featureId: "evidence-vault",
      userIntent: "test-evidence-vault",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.placeId).toBe("evidence-vault");
      expect(result.section).toBe("evidence-bank");
    }
  });
});

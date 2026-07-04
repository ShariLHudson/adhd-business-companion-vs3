import { describe, expect, it } from "vitest";
import {
  SPARK_ESTATE_GUIDE_COVER_ALT,
  SPARK_ESTATE_GUIDE_COVER_SRC,
} from "./sparkEstateGuide";
import { resolveEstateChromePolicy } from "./estateChromePolicy";

describe("sparkEstateGuide", () => {
  it("uses the title cover art, not an interior room photograph", () => {
    expect(SPARK_ESTATE_GUIDE_COVER_SRC).toBe(
      "/images/spark-estate-guide-cover.png",
    );
    expect(SPARK_ESTATE_GUIDE_COVER_SRC).not.toMatch(/backgrounds\//);
    expect(SPARK_ESTATE_GUIDE_COVER_ALT).toMatch(/Spark Estate Guide/i);
  });
});

describe("estateChromePolicy guidebook", () => {
  it("allows guidebook on generic home layout", () => {
    const policy = resolveEstateChromePolicy({
      estateImmersiveActive: false,
      showDirectEstateOverlay: false,
    });
    expect(policy.showGuidebook).toBe(true);
  });
});

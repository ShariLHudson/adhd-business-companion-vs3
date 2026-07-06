import { describe, expect, it } from "vitest";

import { getFounderDigitalTwinBundle, prepareFounderAdaptationHints } from "./founderProfileBridge";

describe("Founder Executive Digital Twin bridge", () => {
  it("getFounderDigitalTwinBundle composes profile intelligence", () => {
    const bundle = getFounderDigitalTwinBundle("listening-rooms");
    expect(bundle.product).toBe("founder");
    expect(bundle.patterns.length).toBeGreaterThan(0);
    expect(bundle.profile.principles.length).toBeGreaterThan(0);
    expect(bundle.topRecommendation?.architectureOnly).toBe(true);
  });

  it("prepareFounderAdaptationHints returns architecture-only hints", () => {
    const hints = prepareFounderAdaptationHints("listening-rooms");
    expect(hints.architectureOnly).toBe(true);
    expect(hints.hints.length).toBeLessThanOrEqual(3);
    expect(hints.hints.every((h) => h.noticedPhrase.startsWith("I've noticed"))).toBe(true);
  });
});

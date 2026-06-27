import { describe, expect, it } from "vitest";
import {
  resolveEnvironmentalCauses,
  resolveEnvironmentalTruth,
  MOTION_CAUSE_MAP,
  ENVIRONMENTAL_TRUTH_RULE,
} from "@/lib/environmentalTruth";
import { evaluateCompanionEnvironmentIntelligence } from "@/lib/companionEnvironmentIntelligence";

describe("Environmental Truth", () => {
  it("requires fresh coffee before steam appears", () => {
    const without = resolveEnvironmentalTruth({
      timeOfDay: "morning",
      season: "autumn",
      weather: "clear",
      objects: [],
      motion: ["steam", "candle"],
    });
    expect(without.motion).not.toContain("steam");

    const withCoffee = resolveEnvironmentalTruth({
      timeOfDay: "morning",
      season: "autumn",
      weather: "clear",
      objects: [{ kind: "coffee", placement: "table" }],
      motion: ["steam", "candle"],
    });
    expect(withCoffee.causes).toContain("fresh-coffee");
    expect(withCoffee.motion).toContain("steam");
    expect(withCoffee.because.some((line) => /steam|coffee/i.test(line))).toBe(
      true,
    );
  });

  it("removes harsh sun during rain", () => {
    const truth = resolveEnvironmentalTruth({
      timeOfDay: "afternoon",
      season: "spring",
      weather: "rain",
      objects: [],
      motion: ["sunlight", "rain", "foliage"],
    });
    expect(truth.motion).not.toContain("sunlight");
    expect(truth.motion).toContain("rain");
    expect(truth.motion).toContain("lamplight");
  });

  it("does not show rain on a clear spring morning without cause", () => {
    const truth = resolveEnvironmentalTruth({
      timeOfDay: "morning",
      season: "spring",
      weather: "clear",
      objects: [{ kind: "tulips", placement: "window" }],
      motion: ["rain", "sunlight", "foliage", "candle"],
    });
    expect(truth.motion).not.toContain("rain");
  });

  it("tells a coherent summer Iowa story", () => {
    const causes = resolveEnvironmentalCauses({
      timeOfDay: "afternoon",
      season: "summer",
      weather: "clear",
      objects: [{ kind: "flowers", placement: "table" }],
      motion: [],
    });
    expect(causes).toContain("summer-iowa");
    expect(causes).toContain("window-open");
    expect(causes).toContain("butterflies-day");
  });

  it("quiets wildlife motion in winter", () => {
    const truth = resolveEnvironmentalTruth({
      timeOfDay: "morning",
      season: "winter",
      weather: "snow",
      objects: [{ kind: "blanket", placement: "floor" }],
      motion: ["butterflies", "fireflies", "snow", "foliage"],
    });
    expect(truth.motion).not.toContain("butterflies");
    expect(truth.motion).not.toContain("fireflies");
    expect(truth.motion).not.toContain("foliage");
    expect(truth.motion).toContain("snow");
  });

  it("maps every motion kind to at least one cause", () => {
    for (const motion of Object.keys(MOTION_CAUSE_MAP)) {
      expect(MOTION_CAUSE_MAP[motion as keyof typeof MOTION_CAUSE_MAP].length).toBeGreaterThan(0);
    }
  });

  it("integrates with environment intelligence before render", () => {
    const intel = evaluateCompanionEnvironmentIntelligence({
      timeOfDay: "afternoon",
      season: "spring",
      weather: "clear",
      sessionVisitIndex: 12,
      isFirstMeeting: false,
    });
    expect(intel.environmentalTruth).toBeTruthy();
    expect(intel.environmentalTruth?.causes.length).toBeGreaterThan(0);
    expect(intel.motion.enabled).not.toContain("rain");
    expect(ENVIRONMENTAL_TRUTH_RULE).toMatch(/believable cause/);
  });

  it("narratives read as cause not decoration", () => {
    const truth = resolveEnvironmentalTruth({
      timeOfDay: "afternoon",
      season: "summer",
      weather: "clear",
      objects: [],
      motion: ["curtains", "candle"],
    });
    for (const line of truth.because) {
      expect(line.toLowerCase()).not.toMatch(/nice animation|effect|random/);
      expect(line.startsWith("Of course")).toBe(true);
    }
  });
});

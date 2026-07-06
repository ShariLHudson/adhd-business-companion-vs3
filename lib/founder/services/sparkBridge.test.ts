import { describe, expect, it } from "vitest";
import { getFounderSparkOverview } from "./sparkBridge";

describe("Founder SPARK bridge", () => {
  it("returns founder-scoped overview without UI wiring", () => {
    const overview = getFounderSparkOverview({ limit: 3 });
    expect(overview.product).toBe("founder");
    expect(overview.patternCount).toBeGreaterThan(0);
    expect(overview.founderRecommendations.every((r) => r.preparedFor === "founder")).toBe(
      true,
    );
    expect(overview.topPatterns.length).toBeGreaterThan(0);
  });
});

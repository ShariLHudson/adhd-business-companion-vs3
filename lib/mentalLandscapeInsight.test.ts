import { describe, expect, it } from "vitest";
import type { ThoughtCluster } from "./brainDumpClusterModel";
import { generateMentalLandscapeInsight } from "./mentalLandscapeInsight";

function cluster(
  partial: Partial<ThoughtCluster> & { id: string; label: string; count: number },
): ThoughtCluster {
  return {
    icon: "💼",
    tone: "fact",
    overwhelm: false,
    subClusters: [],
    collapsed: false,
    ...partial,
  };
}

describe("generateMentalLandscapeInsight", () => {
  it("returns safe held copy for one thought", () => {
    expect(
      generateMentalLandscapeInsight(
        [cluster({ id: "business", label: "Business", count: 1 })],
        1,
      ),
    ).toBe("Everything you captured is safely held.");
  });

  it("returns connected copy for a single cluster with multiple thoughts", () => {
    expect(
      generateMentalLandscapeInsight(
        [cluster({ id: "business", label: "Business", count: 4 })],
        4,
      ),
    ).toBe("Most of what you captured seems connected.");
  });

  it("returns few-things copy for 2–3 thoughts across themes", () => {
    expect(
      generateMentalLandscapeInsight(
        [
          cluster({ id: "business", label: "Business", count: 1 }),
          cluster({ id: "health", label: "Health", count: 1 }),
        ],
        2,
      ),
    ).toBe("A few things are safely held here now.");
  });

  it("reflects business-heavy capture when dominant", () => {
    expect(
      generateMentalLandscapeInsight(
        [
          cluster({ id: "business", label: "Business", count: 4 }),
          cluster({ id: "health", label: "Health", count: 1 }),
        ],
        5,
      ),
    ).toBe("Looks like your mind is carrying a lot around Business right now.");
  });

  it("reflects health-heavy capture when dominant", () => {
    expect(
      generateMentalLandscapeInsight(
        [
          cluster({ id: "health", label: "Health", count: 3 }),
          cluster({ id: "family", label: "Family", count: 1 }),
        ],
        4,
      ),
    ).toBe("Looks like your mind is carrying a lot around Health right now.");
  });

  it("reflects mixed themes when no cluster is dominant", () => {
    expect(
      generateMentalLandscapeInsight(
        [
          cluster({ id: "business", label: "Business", count: 2 }),
          cluster({ id: "health", label: "Health", count: 2 }),
          cluster({ id: "family", label: "Family", count: 2 }),
        ],
        6,
      ),
    ).toBe("You seem to be carrying a few different things at once today.");
  });

  it("falls back safely when empty", () => {
    expect(generateMentalLandscapeInsight([], 0)).toBe(
      "Everything you captured is safely held.",
    );
  });
});

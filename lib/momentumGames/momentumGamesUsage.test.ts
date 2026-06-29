import { describe, expect, it } from "vitest";
import { composeMomentumGamesWelcome } from "./momentumGamesUsage";

describe("composeMomentumGamesWelcome", () => {
  it("welcomes returning visitors", () => {
    expect(
      composeMomentumGamesWelcome({ visitCount: 3, lastVisitAt: new Date().toISOString() }),
    ).toContain("Welcome back");
  });

  it("suggests yesterday's category", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(
      composeMomentumGamesWelcome({
        visitCount: 2,
        lastNeed: "creative-spark",
        lastNeedAt: yesterday,
      }),
    ).toContain("Creative Spark");
  });

  it("returns null for first-time visitors", () => {
    expect(composeMomentumGamesWelcome({ visitCount: 1 })).toBeNull();
  });
});

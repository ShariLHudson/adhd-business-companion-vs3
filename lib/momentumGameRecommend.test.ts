import { describe, expect, it, vi } from "vitest";
import { recommendMomentumGame } from "./momentumGameRecommend";

describe("recommendMomentumGame", () => {
  it("returns null when no day state exists", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => null } });
    expect(recommendMomentumGame()).toBeNull();
    vi.unstubAllGlobals();
  });
});

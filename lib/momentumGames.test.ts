import { describe, expect, it } from "vitest";
import { MOMENTUM_GAMES, getMomentumGame } from "./momentumGames";

describe("momentumGames", () => {
  it("lists fifteen ADHD-friendly games", () => {
    expect(MOMENTUM_GAMES).toHaveLength(15);
    const ids = new Set(MOMENTUM_GAMES.map((g) => g.id));
    expect(ids.size).toBe(15);
  });

  it("includes requested game types", () => {
    const labels = MOMENTUM_GAMES.map((g) => g.label);
    expect(labels).toContain("Pattern Match");
    expect(labels).toContain("Memory Match");
    expect(labels).toContain("This Or That");
    expect(labels).toContain("Word Search Mini");
  });

  it("resolves games by id", () => {
    expect(getMomentumGame("treasure-hunt")?.emoji).toBe("🗺️");
  });
});

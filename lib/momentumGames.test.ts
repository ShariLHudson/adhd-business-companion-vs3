import { describe, expect, it } from "vitest";
import {
  gamesForNeed,
  LEGACY_MOMENTUM_GAME_IDS,
  MOMENTUM_GAMES,
  MOMENTUM_NEED_CATEGORIES,
  getMomentumGame,
  playableMomentumGames,
} from "./momentumGames";

describe("momentumGames", () => {
  it("preserves all original mini-game ids", () => {
    for (const id of LEGACY_MOMENTUM_GAME_IDS) {
      expect(getMomentumGame(id)).toBeDefined();
    }
  });

  it("organizes games into five need-based categories", () => {
    expect(MOMENTUM_NEED_CATEGORIES).toHaveLength(5);
    for (const cat of MOMENTUM_NEED_CATEGORIES) {
      expect(gamesForNeed(cat.id).length).toBeGreaterThan(0);
    }
  });

  it("lists games alphabetically within a category", () => {
    const focus = gamesForNeed("focus-attention").map((g) => g.label);
    expect(focus).toEqual([...focus].sort((a, b) => a.localeCompare(b)));
  });

  it("includes requested game types", () => {
    const labels = MOMENTUM_GAMES.map((g) => g.label);
    expect(labels).toContain("Pattern Match");
    expect(labels).toContain("Memory Match");
    expect(labels).toContain("This Or That");
    expect(labels).toContain("Focus Sprint");
    expect(labels).toContain("Spin The Wheel");
  });

  it("marks spin wheel as external tool", () => {
    expect(getMomentumGame("spin-the-wheel")?.externalTool).toBe("spin-wheel");
    expect(playableMomentumGames().some((g) => g.id === "spin-the-wheel")).toBe(
      false,
    );
  });

  it("resolves games by id", () => {
    expect(getMomentumGame("treasure-hunt")?.emoji).toBe("🗺️");
  });
});

import { describe, expect, it } from "vitest";
import {
  MOMENTUM_CATEGORY_ART,
  categoryArtForNeed,
} from "./categoryArt";
import { MOMENTUM_NEED_CATEGORIES } from "../momentumGames";

describe("momentumGames categoryArt", () => {
  it("maps every need category to a public image path", () => {
    for (const cat of MOMENTUM_NEED_CATEGORIES) {
      const url = categoryArtForNeed(cat.id);
      expect(url).toMatch(/^\/backgrounds\/momentum-games\/.+\.png$/);
      expect(MOMENTUM_CATEGORY_ART[cat.id]).toBe(url);
    }
  });
});

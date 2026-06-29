import { describe, expect, it } from "vitest";
import {
  GARDEN_FLAG_DEPTH_SCALE,
  GARDEN_FLAG_PLAQUE,
  gardenFlagPlaqueFor,
} from "./gardenFlagMarkers";

describe("garden flag markers", () => {
  it("defines carved plaque copy for every destination", () => {
    expect(GARDEN_FLAG_PLAQUE.focus).toBe("Sharpen your attention");
    expect(GARDEN_FLAG_PLAQUE.calming).toBe("Quiet your thoughts");
    expect(GARDEN_FLAG_PLAQUE.energize).toBe("Restore your energy");
    expect(GARDEN_FLAG_PLAQUE.unwind).toBe("Release the day");
    expect(GARDEN_FLAG_PLAQUE["my-places"]).toBe("Return to places you love");
    expect(gardenFlagPlaqueFor("focus")).toBe(GARDEN_FLAG_PLAQUE.focus);
  });

  it("keeps flags at uniform scale — depth from path position only", () => {
    for (const scale of Object.values(GARDEN_FLAG_DEPTH_SCALE)) {
      expect(scale).toBe(1);
    }
  });
});

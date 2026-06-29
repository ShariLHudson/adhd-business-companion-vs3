import { describe, expect, it } from "vitest";
import {
  ESTATE_LEFT_SIGNS,
  ESTATE_RIGHT_SIGNS,
  GARDEN_FLAG_CLASS,
  PATHWAY_GARDEN_STAKES,
} from "./signpostLayout";
import { PATHWAY_SIGN_ANCHORS } from "./pathwaySignAnchors";
import { GARDEN_FLAG_PHOTOS } from "./gardenFlagPhotos";

describe("peaceful places estate signpost layout", () => {
  it("hangs slow down and focus from the left lamppost", () => {
    expect(ESTATE_LEFT_SIGNS.map((sign) => sign.label)).toEqual([
      "Slow Down",
      "Focus",
    ]);
  });

  it("hangs recharge, unwind, and my places from the right lamppost", () => {
    expect(ESTATE_RIGHT_SIGNS.map((sign) => sign.label)).toEqual([
      "Recharge",
      "Unwind",
      "My Places",
    ]);
  });

  it("assigns each garden flag a perspective CSS class along the path curb", () => {
    expect(PATHWAY_GARDEN_STAKES).toHaveLength(5);

    expect(GARDEN_FLAG_CLASS).toEqual({
      focus: "flag--focus",
      calming: "flag--slow-down",
      energize: "flag--recharge",
      unwind: "flag--unwind",
      "my-places": "flag--my-places",
    });

    for (const stake of PATHWAY_GARDEN_STAKES) {
      expect(stake.flagClass).toBe(GARDEN_FLAG_CLASS[stake.id]);
      expect(GARDEN_FLAG_PHOTOS[stake.id]?.src).toBeTruthy();
    }

    const left = PATHWAY_GARDEN_STAKES.filter((stake) => stake.side === "left");
    expect(left.map((stake) => stake.id)).toEqual(["focus", "calming"]);

    const right = PATHWAY_GARDEN_STAKES.filter((stake) => stake.side === "right");
    expect(right.map((stake) => stake.id)).toEqual(["energize", "unwind", "my-places"]);
  });

  it("anchors every sign on the pathway photograph", () => {
    const allSigns = [...ESTATE_LEFT_SIGNS, ...ESTATE_RIGHT_SIGNS];
    for (const sign of allSigns) {
      const anchor = PATHWAY_SIGN_ANCHORS[sign.id];
      expect(anchor).toBeDefined();
      expect(anchor.centerX).toBeGreaterThan(0);
      expect(anchor.centerY).toBeGreaterThan(0);
      expect(anchor.width).toBeGreaterThan(0);
      expect(anchor.height).toBeGreaterThan(0);
    }
  });
});

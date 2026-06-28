import { describe, expect, it } from "vitest";
import { ESTATE_LEFT_SIGNS, ESTATE_RIGHT_SIGNS } from "./signpostLayout";
import { PATHWAY_SIGN_ANCHORS } from "./pathwaySignAnchors";

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

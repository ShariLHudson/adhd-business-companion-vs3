import { describe, expect, it } from "vitest";
import { computeGardenBannerDropdownPosition } from "./gardenBannerDropdownPosition";

describe("computeGardenBannerDropdownPosition", () => {
  const anchor = { top: 200, left: 100, right: 160, bottom: 320, width: 60, height: 120 } as DOMRect;
  const menu = { width: 180, height: 240 };

  it("opens right of left-side banners toward the pathway center", () => {
    const pos = computeGardenBannerDropdownPosition(anchor, menu, "left", 1200, 900);
    expect(pos.left).toBe(anchor.right + 14);
  });

  it("opens left of right-side banners toward the pathway center", () => {
    const rightAnchor = { top: 200, left: 900, right: 960, bottom: 320, width: 60, height: 120 } as DOMRect;
    const pos = computeGardenBannerDropdownPosition(rightAnchor, menu, "right", 1200, 900);
    expect(pos.left).toBe(rightAnchor.left - menu.width - 14);
  });

  it("flips horizontally when the menu would leave the viewport", () => {
    const rightEdge = { ...anchor, left: 1100, right: 1160 } as DOMRect;
    const pos = computeGardenBannerDropdownPosition(rightEdge, menu, "left", 1200, 900);
    expect(pos.left).toBeLessThan(rightEdge.left);
  });
});

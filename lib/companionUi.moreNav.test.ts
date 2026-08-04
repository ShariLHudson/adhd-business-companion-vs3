import { describe, expect, it } from "vitest";
import { MORE_NAV, SIDEBAR_NAV } from "./companionUi";

describe("sidebar navigation P0.43", () => {
  it("lists seven primary sidebar items in P0.43 order", () => {
    const labels = SIDEBAR_NAV.map((item) => item.label);
    expect(labels).toEqual([
      "Today",
      "Chat",
      "Focus",
      "Visual Thinking",
      "Growth",
      "Other",
      "How Do I...?",
    ]);
    expect(SIDEBAR_NAV[0]?.id).toBe("today");
    expect(SIDEBAR_NAV[SIDEBAR_NAV.length - 1]?.id).toBe("how-do-i");
  });

  it("exposes Visual Thinking as a top-level door", () => {
    expect(MORE_NAV).toEqual([]);
    expect(SIDEBAR_NAV.some((item) => item.id === "visual-thinking")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "other")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "growth")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "create")).toBe(false);
  });
});

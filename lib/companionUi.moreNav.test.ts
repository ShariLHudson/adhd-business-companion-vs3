import { describe, expect, it } from "vitest";
import { MORE_NAV } from "./companionUi";

describe("MORE_NAV", () => {
  it("lists Projects first among alpha items with How Do I last", () => {
    const labels = MORE_NAV.map((item) => item.label);
    expect(labels).toEqual([
      "Projects",
      "Saved Work",
      "Snippets",
      "Strategies",
      "Templates",
      "Wins This Week",
      "How Do I",
    ]);
    expect(MORE_NAV[MORE_NAV.length - 1]?.id).toBe("how-do-i");
  });

  it("includes projects and snippets navigation", () => {
    expect(MORE_NAV.some((item) => item.id === "projects")).toBe(true);
    expect(MORE_NAV.some((item) => item.id === "snippets")).toBe(true);
    expect(MORE_NAV.some((item) => item.id === "client-avatars")).toBe(false);
    expect(MORE_NAV.some((item) => item.id === "settings")).toBe(false);
  });
});

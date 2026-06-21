import { describe, expect, it } from "vitest";
import { MORE_NAV, SIDEBAR_NAV } from "./companionUi";

describe("sidebar navigation", () => {
  it("lists six primary sidebar items with How Do I last", () => {
    const labels = SIDEBAR_NAV.map((item) => item.label);
    expect(labels).toEqual([
      "Chat",
      "Focus",
      "Create",
      "Growth",
      "My Work",
      "How Do I",
    ]);
    expect(SIDEBAR_NAV[SIDEBAR_NAV.length - 1]?.id).toBe("how-do-i");
  });

  it("does not expose library sections in deprecated MORE_NAV", () => {
    expect(MORE_NAV).toEqual([]);
    expect(SIDEBAR_NAV.some((item) => item.id === "my-work")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "how-do-i")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "projects")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "snippets")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "templates")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "playbook")).toBe(false);
  });
});

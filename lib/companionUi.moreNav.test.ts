import { describe, expect, it } from "vitest";
import { MORE_NAV, SIDEBAR_NAV } from "./companionUi";

describe("sidebar navigation", () => {
  it("lists seven primary sidebar items with Welcome Room last", () => {
    const labels = SIDEBAR_NAV.map((item) => item.label);
    expect(labels).toEqual([
      "Chat",
      "Focus My Brain",
      "Visual Thinking",
      "Growth",
      "Other",
      "How Do I...?",
      "Welcome Room",
    ]);
    expect(SIDEBAR_NAV[SIDEBAR_NAV.length - 1]?.id).toBe("welcome-room");
  });

  it("does not expose More menu or Settings in the sidebar", () => {
    expect(MORE_NAV).toEqual([]);
    expect(SIDEBAR_NAV.some((item) => item.id === "settings")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "other")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "visual-thinking")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "how-do-i")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "welcome-room")).toBe(true);
    expect(SIDEBAR_NAV.some((item) => item.id === "create")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "projects")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "snippets")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "templates")).toBe(false);
    expect(SIDEBAR_NAV.some((item) => item.id === "playbook")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  GROWTH_MENU,
  SIDEBAR_NAV,
  resolveGrowthDestination,
  sidebarNavForSection,
} from "./companionUi";

describe("navigation architecture P0.43 / P0.50", () => {
  it("maps growth destinations without a Growth Center landing page", () => {
    expect(resolveGrowthDestination("growth")).toBe("growth-vault");
    expect(sidebarNavForSection("growth-vault")).toBe("growth-vault");
    expect(sidebarNavForSection("outcome-goals")).toBe("outcome-goals");
    expect(sidebarNavForSection("wins-this-week")).toBe("growth");
    expect(sidebarNavForSection("evidence-bank")).toBe("growth");
  });

  it("keeps P0.50 sidebar door order with Growth flyout destinations", () => {
    expect(SIDEBAR_NAV.map((item) => item.id)).toEqual([
      "today",
      "chat",
      "focus",
      "visual-thinking",
      "growth",
      "other",
      "how-do-i",
    ]);
    expect(SIDEBAR_NAV.map((item) => item.label)).toEqual([
      "Today",
      "Chat",
      "Focus",
      "Visual Thinking",
      "Growth",
      "Other",
      "How Do I...?",
    ]);
    expect(GROWTH_MENU.map((item) => item.id)).toEqual([
      "growth-vault",
      "outcome-goals",
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { SAVE_DESTINATION_OPTIONS, suggestSaveDestination } from "./saveDestinations";
import { SIDEBAR_NAV, sidebarNavForSection } from "./companionUi";

describe("navigation architecture", () => {
  it("maps user intents to single sidebar destinations", () => {
    expect(sidebarNavForSection("brain-dump")).toBeNull();
    expect(sidebarNavForSection("plan-my-day")).toBeNull();
    expect(sidebarNavForSection("home")).toBe("chat");
    expect(sidebarNavForSection("focus")).toBe("focus");
    expect(sidebarNavForSection("visual-focus")).toBe("visual-thinking");
    expect(sidebarNavForSection("growth")).toBe("growth");
    expect(sidebarNavForSection("my-work")).toBe("other");
    expect(sidebarNavForSection("how-do-i")).toBe("how-do-i");
    expect(sidebarNavForSection("welcome-room")).toBe("welcome-room");
  });

  it("keeps sidebar doors in companion-first order", () => {
    expect(SIDEBAR_NAV.map((item) => item.id)).toEqual([
      "chat",
      "focus",
      "visual-thinking",
      "growth",
      "other",
      "how-do-i",
      "welcome-room",
    ]);
  });

  it("offers save destinations for Keep For Later / Save flows", () => {
    expect(SAVE_DESTINATION_OPTIONS.map((o) => o.id)).toEqual([
      "visual-thinking",
      "projects",
      "strategies",
      "templates",
      "documents",
      "decision-compass",
      "sops",
      "snippets",
    ]);
    expect(suggestSaveDestination({ artifactType: "SOP draft" })).toBe("sops");
    expect(
      suggestSaveDestination({ sourceWorkspace: "visual-focus" }),
    ).toBe("visual-thinking");
  });
});

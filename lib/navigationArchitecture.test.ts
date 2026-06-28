import { describe, expect, it } from "vitest";
import { SAVE_DESTINATION_OPTIONS, suggestSaveDestination } from "./saveDestinations";
import { sidebarNavForSection } from "./companionUi";

describe("navigation architecture", () => {
  it("maps user intents to sidebar destinations", () => {
    expect(sidebarNavForSection("brain-dump")).toBe("clear-my-mind");
    expect(sidebarNavForSection("plan-my-day")).toBe("plan-my-day");
    expect(sidebarNavForSection("home")).toBe("chat");
    expect(sidebarNavForSection("focus")).toBe("focus");
    expect(sidebarNavForSection("visual-focus")).toBe("visual-thinking");
    expect(sidebarNavForSection("the-gallery")).toBe("growth");
    expect(sidebarNavForSection("evidence-bank")).toBe("evidence-bank");
    expect(sidebarNavForSection("confidence-vault")).toBe("confidence-vault");
    expect(sidebarNavForSection("my-work")).toBe("other");
    expect(sidebarNavForSection("how-do-i")).toBe("how-do-i");
    expect(sidebarNavForSection("welcome-room")).toBe("welcome-room");
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

import { describe, expect, it } from "vitest";
import { COMPANION_PROPERTY_NAV } from "./companionPropertyNav";
import { MORE_NAV, SIDEBAR_NAV } from "./companionUi";

describe("sidebar navigation", () => {
  it("uses grouped property navigation instead of flat SIDEBAR_NAV", () => {
    expect(SIDEBAR_NAV).toEqual([]);
    const groupLabels = COMPANION_PROPERTY_NAV.map((group) => group.label);
    expect(groupLabels).toEqual([
      "Core",
      "Create + Think",
      "Grow",
      "Peaceful Places",
    ]);
    const growIds = COMPANION_PROPERTY_NAV.find((g) => g.id === "grow")?.items.map(
      (item) => item.id,
    );
    expect(growIds).toEqual([
      "growth",
      "journal",
      "portfolio",
      "evidence-bank",
      "confidence-vault",
    ]);
    const peacefulIds = COMPANION_PROPERTY_NAV.find(
      (g) => g.id === "peaceful",
    )?.items.map((item) => item.id);
    expect(peacefulIds?.[0]).toBe("welcome-room");
  });

  it("does not expose More menu or Settings in the sidebar", () => {
    expect(MORE_NAV).toEqual([]);
    const allIds = COMPANION_PROPERTY_NAV.flatMap((group) =>
      group.items.map((item) => item.id),
    );
    expect(allIds.some((id) => id === "settings")).toBe(false);
    expect(allIds.some((id) => id === "welcome-room")).toBe(true);
    expect(allIds.some((id) => id === "growth")).toBe(true);
    expect(allIds.some((id) => id === "create")).toBe(true);
    expect(allIds.some((id) => id === "playbook")).toBe(true);
  });
});

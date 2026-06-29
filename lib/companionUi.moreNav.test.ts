import { describe, expect, it } from "vitest";
import { COMPANION_PROPERTY_NAV } from "./companionPropertyNav";
import {
  HOMESTEAD_OTHER_DROPDOWN_ITEMS,
  HOMESTEAD_SIGNPOST_DESTINATIONS,
} from "./homesteadSignpost";
import { MORE_NAV, SIDEBAR_NAV } from "./companionUi";

describe("sidebar navigation", () => {
  it("uses five homestead signpost destinations only in the sidebar", () => {
    expect(SIDEBAR_NAV).toEqual([]);
    expect(HOMESTEAD_SIGNPOST_DESTINATIONS.map((item) => item.label)).toEqual([
      "Home",
      "Focus My Brain",
      "Create",
      "Growth",
      "Other",
    ]);
    expect(HOMESTEAD_OTHER_DROPDOWN_ITEMS.map((item) => item.label)).toEqual([
      "Welcome Room",
      "How Do I?",
      "Strategies",
      "Visual Thinking",
    ]);
    const allItems = COMPANION_PROPERTY_NAV.flatMap((group) => group.items);
    expect(allItems).toHaveLength(5);
  });

  it("does not expose More menu or Settings in the sidebar", () => {
    expect(MORE_NAV).toEqual([]);
    const allIds = COMPANION_PROPERTY_NAV.flatMap((group) =>
      group.items.map((item) => item.id),
    );
    expect(allIds.some((id) => id === "settings")).toBe(false);
    expect(allIds).toEqual(["chat", "focus", "create", "growth", "other"]);
    expect(allIds.some((id) => id === "clear-my-mind")).toBe(false);
    expect(allIds.some((id) => id === "welcome-room")).toBe(false);
    expect(allIds.some((id) => id === "how-do-i")).toBe(false);
  });
});

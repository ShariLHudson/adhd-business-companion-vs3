import { describe, expect, it } from "vitest";
import {
  ESTATE_MENU_ACTION_IDS,
  ESTATE_MENU_DROPDOWN_ITEMS,
} from "./menuConfig";

describe("Global Estate Menu™", () => {
  it("keeps routing action ids for programmatic navigation", () => {
    expect(ESTATE_MENU_ACTION_IDS).toContain("memory-library");
    expect(ESTATE_MENU_ACTION_IDS).toContain("journal");
    expect(ESTATE_MENU_ACTION_IDS).toContain("notifications");
    expect(ESTATE_MENU_ACTION_IDS).toContain("my-profile");
    expect(ESTATE_MENU_ACTION_IDS).toContain("start-new-conversation");
    expect(ESTATE_MENU_ACTION_IDS).toContain("log-out");
  });

  it("shows five profile dropdown choices per navigation correction spec", () => {
    expect(ESTATE_MENU_DROPDOWN_ITEMS).toHaveLength(5);
    const ids = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.id);
    expect(ids).toEqual([
      "my-profile",
      "settings",
      "memory-library",
      "growth-profile",
      "estate-profile",
    ]);
  });

  it("uses spec-aligned profile menu labels", () => {
    const labels = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.label);
    expect(labels).toEqual([
      "Profile",
      "Settings",
      "Conversations",
      "Personalization",
      "Account",
    ]);
  });
});

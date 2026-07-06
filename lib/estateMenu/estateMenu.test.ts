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
  });

  it("shows only five calm dropdown choices", () => {
    expect(ESTATE_MENU_DROPDOWN_ITEMS).toHaveLength(5);
    const ids = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.id);
    expect(ids).toEqual([
      "start-new-day-conversation",
      "start-new-conversation",
      "settings",
      "my-profile",
      "log-out",
    ]);
  });

  it("uses estate-friendly labels", () => {
    const labels = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.label);
    expect(labels).toContain("Start a New Day");
    expect(labels).toContain("Start a New Conversation");
    expect(labels).toContain("My Profile");
    expect(labels).toContain("Log Out");
  });
});

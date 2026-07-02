import { describe, expect, it } from "vitest";
import {
  ESTATE_MENU_ACTION_IDS,
  ESTATE_MENU_ITEMS,
  ESTATE_MENU_SECTION_IDS,
} from "./menuConfig";

describe("Global Estate Menu™", () => {
  it("lists all required menu actions", () => {
    expect(ESTATE_MENU_ACTION_IDS).toHaveLength(16);
    expect(ESTATE_MENU_ITEMS).toHaveLength(16);
    expect(ESTATE_MENU_SECTION_IDS).toEqual([
      "personal",
      "conversation",
      "settings",
    ]);
  });

  it("includes conversation and logout controls", () => {
    const ids = ESTATE_MENU_ITEMS.map((item) => item.id);
    expect(ids).toContain("start-new-conversation");
    expect(ids).toContain("start-new-day-conversation");
    expect(ids).toContain("log-out");
    expect(ids).toContain("estate-profile");
    expect(ids).toContain("journal");
  });
});

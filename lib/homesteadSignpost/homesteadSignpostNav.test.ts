import { describe, expect, it } from "vitest";
import {
  HOMESTEAD_OTHER_DROPDOWN_ITEMS,
  HOMESTEAD_SIGNPOST_ALL,
  HOMESTEAD_SIGNPOST_DESTINATIONS,
  isHomesteadOtherNavActive,
} from "./homesteadSignpostNav";

describe("homesteadSignpostNav", () => {
  it("lists five destinations and four Other dropdown items", () => {
    expect(HOMESTEAD_SIGNPOST_DESTINATIONS).toHaveLength(5);
    expect(HOMESTEAD_OTHER_DROPDOWN_ITEMS).toHaveLength(4);
    expect(HOMESTEAD_SIGNPOST_ALL).toHaveLength(9);
  });

  it("keeps knowledge items under Other only", () => {
    expect(
      HOMESTEAD_SIGNPOST_DESTINATIONS.every((item) => item.tier === "destination"),
    ).toBe(true);
    expect(
      HOMESTEAD_OTHER_DROPDOWN_ITEMS.every((item) => item.tier === "knowledge"),
    ).toBe(true);
    expect(HOMESTEAD_OTHER_DROPDOWN_ITEMS.map((item) => item.label)).toEqual([
      "Welcome Room",
      "How Do I?",
      "Strategies",
      "Visual Thinking",
    ]);
  });

  it("lights Other for child workspaces", () => {
    expect(isHomesteadOtherNavActive("how-do-i", "how-do-i")).toBe(true);
    expect(isHomesteadOtherNavActive("playbook", "playbook")).toBe(true);
    expect(isHomesteadOtherNavActive("visual-thinking", "visual-focus")).toBe(true);
    expect(isHomesteadOtherNavActive("welcome-room", "welcome-room")).toBe(true);
    expect(isHomesteadOtherNavActive("chat", "home")).toBe(false);
  });
});

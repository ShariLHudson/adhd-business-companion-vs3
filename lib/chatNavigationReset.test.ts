import { describe, expect, it } from "vitest";
import {
  chatNavClearsFullPageSection,
  chatNavClearsStandaloneSection,
  chatNavigationResetTarget,
} from "./chatNavigationReset";

describe("chatNavigationReset (P0.27)", () => {
  it("defines chat home as the reset target", () => {
    expect(chatNavigationResetTarget()).toEqual({
      activeSection: "home",
      activeNav: "chat",
      overlay: null,
      workspacePanel: null,
      companionStandaloneSection: null,
      workspaceFirstSplit: false,
      chatLayoutMode: "split",
    });
  });

  it("clears standalone panels when returning to chat from Focus", () => {
    expect(chatNavClearsStandaloneSection("focus")).toBe(true);
  });

  it("clears standalone panels when returning to chat from Settings split", () => {
    expect(chatNavClearsStandaloneSection("content-generator")).toBe(true);
  });

  it("clears full-page Focus when opening chat", () => {
    expect(chatNavClearsFullPageSection("focus")).toBe(true);
    expect(chatNavClearsFullPageSection("focus-audio")).toBe(true);
    expect(chatNavClearsFullPageSection("home")).toBe(false);
  });
});

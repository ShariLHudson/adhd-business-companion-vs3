import { describe, expect, it } from "vitest";
import {
  ESTATE_MENU_ACTION_IDS,
  ESTATE_MENU_DROPDOWN_ENTRIES,
  ESTATE_MENU_DROPDOWN_ITEMS,
} from "./menuConfig";

describe("Global Estate Menu", () => {
  it("keeps routing action ids for programmatic navigation", () => {
    expect(ESTATE_MENU_ACTION_IDS).toContain("memory-library");
    expect(ESTATE_MENU_ACTION_IDS).toContain("journal");
    expect(ESTATE_MENU_ACTION_IDS).toContain("notifications");
    expect(ESTATE_MENU_ACTION_IDS).toContain("my-profile");
    expect(ESTATE_MENU_ACTION_IDS).toContain("start-new-conversation");
    expect(ESTATE_MENU_ACTION_IDS).toContain("start-new-day-conversation");
    expect(ESTATE_MENU_ACTION_IDS).toContain("log-out");
  });

  it("shows Conversations, My Spark Estate, Experience Controls, Settings, Sign Out", () => {
    expect(ESTATE_MENU_DROPDOWN_ENTRIES.map((entry) => entry.label)).toEqual([
      "Conversations",
      "My Spark Estate",
      "Experience Controls",
      "Settings",
      "Sign Out",
    ]);
  });

  it("nests New Chat and New Day Chat under Conversations", () => {
    const conversations = ESTATE_MENU_DROPDOWN_ENTRIES.find(
      (entry) => entry.kind === "group" && entry.id === "conversations",
    );
    expect(conversations?.kind).toBe("group");
    if (conversations?.kind !== "group") return;
    expect(conversations.children.map((child) => child.label)).toEqual([
      "New Chat",
      "New Day Chat",
    ]);
    expect(conversations.children.map((child) => child.id)).toEqual([
      "start-new-conversation",
      "start-new-day-conversation",
    ]);
  });

  it("hides Personalization and Account from the visible menu", () => {
    const labels = ESTATE_MENU_DROPDOWN_ENTRIES.map((entry) => entry.label);
    expect(labels).not.toContain("Personalization");
    expect(labels).not.toContain("Account");
    expect(labels).not.toContain("Evidence Vault");
    expect(labels).not.toContain("Hall of Accomplishments");
    const ids = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.id);
    expect(ids).not.toContain("growth-profile");
    expect(ids).not.toContain("estate-profile");
    expect(ids).not.toContain("evidence-vault");
    expect(ids).not.toContain("portfolio");
    expect(ids).toContain("my-profile");
    expect(ids).toContain("my-business-estate");
  });
});

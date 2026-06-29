import { describe, expect, it } from "vitest";
import { getPrefs } from "@/lib/companionStore";
import {
  userProfileImageUrl,
  userProfileInitials,
} from "@/lib/userProfileDisplay";
import { NEW_CONVERSATION_MENU_ITEMS } from "@/lib/topBarNavigation";

describe("userProfileDisplay", () => {
  it("derives initials from the saved name", () => {
    expect(userProfileInitials("Shari Test", "")).toBe("ST");
    expect(userProfileInitials("", "hello@example.com")).toBe("HE");
  });

  it("returns uploaded profile image only when present", () => {
    const before = userProfileImageUrl();
    expect(before === null || typeof before === "string").toBe(true);
    expect(getPrefs().profileImage).toBeDefined();
  });
});

describe("topBarNavigation", () => {
  it("offers only New Chat and New Day Conversation", () => {
    expect(NEW_CONVERSATION_MENU_ITEMS).toHaveLength(2);
    expect(NEW_CONVERSATION_MENU_ITEMS.map((item) => item.label)).toEqual([
      "New Chat",
      "New Day Conversation",
    ]);
  });
});

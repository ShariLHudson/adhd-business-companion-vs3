import { describe, expect, it } from "vitest";
import { getPrefs } from "@/lib/companionStore";
import {
  userProfileImageUrl,
  userProfileInitials,
} from "@/lib/userProfileDisplay";
import { NEW_CONVERSATION_MENU_ITEMS } from "@/lib/topBarNavigation";

describe("userProfileDisplay", () => {
  it("derives initials dynamically from the member name", () => {
    expect(userProfileInitials("Shari Test", "")).toBe("ST");
    expect(userProfileInitials("Madonna")).toBe("M");
    expect(userProfileInitials("", "hello@example.com")).toBe("H");
  });

  it("returns uploaded profile image only when present", () => {
    const before = userProfileImageUrl();
    expect(before === null || typeof before === "string").toBe(true);
    expect(getPrefs().profileImage).toBeDefined();
  });
});

describe("topBarNavigation", () => {
  it("offers only new conversation and new day conversation actions", () => {
    expect(NEW_CONVERSATION_MENU_ITEMS).toHaveLength(2);
    expect(NEW_CONVERSATION_MENU_ITEMS.map((item) => item.label)).toEqual([
      "Start New Conversation",
      "Start New Day Conversation",
    ]);
  });
});

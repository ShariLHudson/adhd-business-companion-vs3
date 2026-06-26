import { describe, expect, it } from "vitest";
import {
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
  COMPANION_PRESENCE_LIBRARY,
  companionPresenceWelcomeImageUrl,
  resolveCompanionPresenceLibraryImage,
  WELCOME_PRESENCE_GREETING,
  WELCOME_PRESENCE_INVITE,
} from "@/lib/companionPresenceLibrary";

describe("companionPresenceLibrary", () => {
  it("defines the fixed welcome greeting", () => {
    expect(WELCOME_PRESENCE_GREETING).toBe("I'm here for you.");
    expect(WELCOME_PRESENCE_INVITE).toBe("What's on your mind today?");
  });

  it("resolves shari-i-am-here-2 for chat welcome", () => {
    const url = resolveCompanionPresenceLibraryImage("chat-welcome");
    expect(url).toContain("shari-i-am-here-2");
    expect(url).toBe(companionPresenceWelcomeImageUrl());
  });

  it("resolves by canonical image id", () => {
    const url = resolveCompanionPresenceLibraryImage(
      null,
      COMPANION_PRESENCE_WELCOME_IMAGE_ID,
    );
    expect(url).toBeTruthy();
  });

  it("exposes the full approved scene catalog", () => {
    expect(COMPANION_PRESENCE_LIBRARY.length).toBeGreaterThan(20);
  });
});

import { describe, expect, it } from "vitest";
import { CHAT_NAVIGATION_INTENT, CHAT_NAV_PRIORITY } from "./chatDestination";

describe("chatDestination", () => {
  it("treats Chat as highest navigation priority", () => {
    expect(CHAT_NAV_PRIORITY).toBe("highest");
  });

  it("requires closing workspace and restoring split layout", () => {
    expect(CHAT_NAVIGATION_INTENT).toMatchObject({
      closeWorkspacePanel: true,
      restoreSplitLayout: true,
      clearStandaloneSection: true,
      clearGuideBeside: true,
      clearWelcomeRoom: true,
      dismissOverlay: true,
      activeSection: "home",
      activeNav: "chat",
    });
  });

  it("Back to Chat never reuses Welcome Home or room-restore fallbacks", () => {
    expect(CHAT_NAVIGATION_INTENT.preferEverydayConversation).toBe(true);
    expect(CHAT_NAVIGATION_INTENT.suppressWelcomeHomePlaceSync).toBe(true);
    expect(CHAT_NAVIGATION_INTENT.skipSectionRestore).toBe(true);
    expect(CHAT_NAVIGATION_INTENT.preserveClearMyMindSession).toBe(true);
  });
});

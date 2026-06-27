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
});

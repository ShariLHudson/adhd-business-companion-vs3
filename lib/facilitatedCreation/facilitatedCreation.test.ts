import { describe, expect, it } from "vitest";
import {
  evaluateFacilitatedCreateOpen,
  hasStructuredBuildIntent,
  isSoftCreateExploration,
  shouldStayInChatForCreation,
  userGrantedWorkspaceOpen,
} from "./index";

describe("Facilitated Creation Flow", () => {
  const baseCtx = {
    createPanelOpen: false,
    lockedType: null,
    currentDraftType: null,
    currentDraftContent: "",
    storedSessionType: null,
    userText: "",
    lastAssistantText: "",
  };

  it("stays in chat for soft exploration", () => {
    expect(
      isSoftCreateExploration("I might want to create a workshop."),
    ).toBe(true);
    expect(shouldStayInChatForCreation("I might want to create a workshop.")).toBe(
      true,
    );
  });

  it("detects structured build intent for offers", () => {
    expect(hasStructuredBuildIntent("I want to create a 4-part offer.")).toBe(
      true,
    );
  });

  it("blocks auto workspace open for exploration", () => {
    const decision = evaluateFacilitatedCreateOpen(
      {
        source: "ensure_live_create",
        section: "content-generator",
        input: { itemType: "Workshop", title: "Workshop", source: "generated" },
        userText: "I might want to create a workshop.",
      },
      baseCtx,
    );
    expect(decision?.action).toBe("blocked");
  });

  it("offers workspace consent for clear build intent", () => {
    const decision = evaluateFacilitatedCreateOpen(
      {
        source: "chat",
        section: "content-generator",
        input: { itemType: "Offer", title: "Offer", source: "generated" },
        userText: "I want to create a 4-part offer.",
      },
      baseCtx,
    );
    expect(decision?.action).toBe("offer");
    expect(decision && "message" in decision && decision.message).toContain(
      "workspace",
    );
  });

  it("allows open when member grants workspace consent", () => {
    expect(
      userGrantedWorkspaceOpen(
        "yes",
        "Would you like me to open the workspace so we can build it together?",
      ),
    ).toBe(true);
    const decision = evaluateFacilitatedCreateOpen(
      {
        source: "chat",
        section: "content-generator",
        input: { itemType: "Offer", title: "Offer", source: "generated" },
        userText: "yes",
        lastAssistantText:
          "Would you like me to open the workspace so we can build it together?",
      },
      baseCtx,
    );
    expect(decision).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  detectOpenSectionRequest,
  matchesPendingAcceptance,
  resolvePendingAction,
} from "./pendingAction";

describe("pendingAction", () => {
  it("prioritizes workspace offer over tool suggestion", () => {
    const pending = resolvePendingAction({
      workspaceOffer: {
        section: "time-block",
        buttonLabel: "Open Time Block",
        line: "Want to schedule it together?",
      },
      assistedActionOffer: null,
      doItNowOffer: null,
      toolSuggestion: {
        kind: "focus-session",
        line: "Focus?",
        toolLabel: "Focus Session",
        toolEmoji: "🎯",
        keepTalkingLabel: "Keep Talking",
        action: { type: "tool", tool: "focus-timer" },
      },
      actionBridge: null,
      bridge: null,
      artifactExportOffer: null,
    });
    expect(pending?.kind).toBe("workspace");
  });

  it("accepts open time block for pending workspace offer", () => {
    const pending = resolvePendingAction({
      workspaceOffer: {
        section: "time-block",
        buttonLabel: "Open Time Block",
        line: "",
      },
      assistedActionOffer: null,
      doItNowOffer: null,
      toolSuggestion: null,
      actionBridge: null,
      bridge: null,
      artifactExportOffer: null,
    })!;
    expect(matchesPendingAcceptance("open time block", pending)).toBe(true);
    expect(matchesPendingAcceptance("schedule it", pending)).toBe(true);
    expect(matchesPendingAcceptance("yes", pending, { allowGenericAcceptance: true })).toBe(true);
  });

  it("detects direct open section requests", () => {
    expect(detectOpenSectionRequest("open time block")).toBe("time-block");
    expect(detectOpenSectionRequest("open the planning")).toBe("time-block");
    expect(detectOpenSectionRequest("open focus audio")).toBe("focus-audio");
    expect(detectOpenSectionRequest("open breathe")).toBe("breathe");
  });

  it("accepts breathe tool suggestion without saying open", () => {
    const pending = resolvePendingAction({
      workspaceOffer: null,
      artifactExportOffer: null,
      assistedActionOffer: null,
      doItNowOffer: null,
      toolSuggestion: {
        kind: "breathe",
        line: "Would a reset help?",
        toolLabel: "Breathe",
        toolEmoji: "🌿",
        keepTalkingLabel: "Keep Talking",
        action: { type: "tool", tool: "breathe" },
      },
      actionBridge: null,
      bridge: null,
    })!;
    expect(matchesPendingAcceptance("let me try the breathing then", pending)).toBe(
      true,
    );
  });
});

import { describe, expect, it } from "vitest";
import { detectUniversalCapabilityRequest } from "./detectUniversalCapabilityRequest";
import { resolveHardNavigationCommand } from "@/lib/hardNavigationCommands";
import { hasLeadingExplicitNavigationVerb } from "@/lib/estate/explicitNavigationVerb";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";

describe("Talk It Out + Peaceful Moments conversational navigation", () => {
  it.each([
    "take me to talk it out",
    "Take me to Talk It Out",
    "open talk it out",
    "go to talk it out",
  ])("universal + hard nav open Talk It Out — %s", (text) => {
    expect(hasLeadingExplicitNavigationVerb(text)).toBe(true);
    expect(classifyPrimaryConversationTurn({ userText: text }).type).toBe(
      "DIRECT_COMMAND",
    );
    expect(detectUniversalCapabilityRequest(text)?.capabilityId).toBe(
      "talk-it-out",
    );
    expect(resolveHardNavigationCommand(text)?.target.kind).toBe("talk-it-out");
  });

  it.each([
    "take me to peaceful moments",
    "Take me to Peaceful Moments",
    "open peaceful moments",
    "go to peaceful places",
  ])("universal + hard nav open Peaceful Moments — %s", (text) => {
    expect(hasLeadingExplicitNavigationVerb(text)).toBe(true);
    expect(classifyPrimaryConversationTurn({ userText: text }).type).toBe(
      "DIRECT_COMMAND",
    );
    expect(detectUniversalCapabilityRequest(text)?.capabilityId).toBe(
      "peaceful-places",
    );
    expect(resolveHardNavigationCommand(text)?.target.kind).toBe("focus-audio");
  });

  it("does not treat create/write language as Talk It Out", () => {
    expect(
      detectUniversalCapabilityRequest("help me talk through this SOP"),
    ).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { detectAudioRequest } from "./audioSuggestions";
import { detectDoingIntent } from "./workspaceMode";
import { detectStandaloneToolRequest } from "./standaloneToolRouting";
import {
  buildStressCauseRecommendation,
  detectStressCauseChoice,
  detectStressReliefToolChoice,
  isExplicitStressToolRequest,
  isStressRoutingSignal,
  recommendForStressCause,
  shouldBlockStressAutoToolRouting,
  shouldOfferStressRelief,
} from "./stressRouting";

describe("stressRouting", () => {
  it("detects common stress phrases", () => {
    expect(isStressRoutingSignal("I'm stressed")).toBe(true);
    expect(isStressRoutingSignal("I need to calm down")).toBe(true);
    expect(isStressRoutingSignal("I'm overwhelmed")).toBe(true);
    expect(isStressRoutingSignal("My brain is spinning")).toBe(true);
    expect(isStressRoutingSignal("I feel anxious")).toBe(true);
    expect(isStressRoutingSignal("Everything feels like too much")).toBe(true);
    expect(isStressRoutingSignal("I can't think")).toBe(true);
    expect(isStressRoutingSignal("I'm losing it")).toBe(true);
    expect(isStressRoutingSignal("I'm frazzled")).toBe(true);
    expect(isStressRoutingSignal("I'm mentally exhausted")).toBe(true);
  });

  it("does not treat calm down as an audio request", () => {
    expect(detectAudioRequest("I need to calm down").isAudio).toBe(false);
    expect(shouldBlockStressAutoToolRouting("I need to calm down")).toBe(true);
    expect(detectDoingIntent("I need to calm down")).toBeNull();
    expect(detectStandaloneToolRequest("I need to calm down")).toBeNull();
  });

  it("still allows explicit calm audio requests", () => {
    expect(detectAudioRequest("play calming music").isAudio).toBe(true);
    expect(shouldBlockStressAutoToolRouting("play calming music")).toBe(false);
    expect(isExplicitStressToolRequest("open focus audio")).toBe(true);
  });

  it("opens tools only after the user chooses in chat", () => {
    expect(detectStressReliefToolChoice("I'll try Clear My Mind")).toBe(
      "clear-mind",
    );
    expect(detectStressReliefToolChoice("Let's do breathing")).toBe("breathe");
    expect(detectStressReliefToolChoice("Play calming audio")).toBe(
      "calm-audio",
    );
    expect(detectStressReliefToolChoice("I'm overwhelmed")).toBeNull();
  });

  it("offers stress relief instead of auto-routing", () => {
    expect(shouldOfferStressRelief("I'm stressed")).toBe(true);
    expect(shouldOfferStressRelief("open focus audio")).toBe(false);
    expect(shouldOfferStressRelief("open clear my mind")).toBe(false);
  });

  it("maps stress causes to recommended tools", () => {
    expect(recommendForStressCause("too-many-thoughts").primary.id).toBe(
      "clear-mind",
    );
    expect(recommendForStressCause("anxiety-worry").primary.id).toBe("breathe");
    expect(recommendForStressCause("anxiety-worry").secondary?.id).toBe(
      "calm-audio",
    );
    expect(recommendForStressCause("calm-body").primary.id).toBe("breathe");
    expect(recommendForStressCause("too-much-to-do").primary.label).toBe(
      "Adjust My Day",
    );
  });

  it("detects cause choices from follow-up text", () => {
    expect(detectStressCauseChoice("too much to do")).toBe("too-much-to-do");
    expect(buildStressCauseRecommendation("too-much-to-do").kind).toBe(
      "recommendation",
    );
  });
});

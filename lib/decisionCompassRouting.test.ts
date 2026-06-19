import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  buildDecisionCompassOffer,
  dismissDecisionCompassOfferForSession,
  extractDecisionCompassPrefill,
  isDecisionCompassOfferDismissedForSession,
  isDecisionCompassOfferSignal,
  isExplicitDecisionCompassRequest,
  shouldOfferDecisionCompass,
} from "./decisionCompassRouting";
import { detectDoingIntent } from "./workspaceMode";

describe("decisionCompassRouting", () => {
  beforeEach(() => {
    const sessionMem = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => sessionMem.get(k) ?? null,
      setItem: (k: string, v: string) => sessionMem.set(k, v),
      removeItem: (k: string) => sessionMem.delete(k),
      clear: () => sessionMem.clear(),
    });
  });

  it("detects decision compass offer phrases", () => {
    expect(isDecisionCompassOfferSignal("I need to make a decision")).toBe(true);
    expect(isDecisionCompassOfferSignal("help me decide")).toBe(true);
    expect(
      isDecisionCompassOfferSignal(
        "I don't know where to start with this decision",
      ),
    ).toBe(true);
    expect(isDecisionCompassOfferSignal("should I hire a VA or wait?")).toBe(
      true,
    );
    expect(isDecisionCompassOfferSignal("compare two options")).toBe(true);
    expect(isDecisionCompassOfferSignal("I need help choosing")).toBe(true);
    expect(isDecisionCompassOfferSignal("I need help deciding")).toBe(true);
    expect(isDecisionCompassOfferSignal("help me choose between these")).toBe(
      true,
    );
  });

  it("does not treat generic where-to-start as a decision offer", () => {
    expect(isDecisionCompassOfferSignal("I don't know where to start")).toBe(
      false,
    );
  });

  it("extracts two options from should-I-or phrasing", () => {
    expect(
      extractDecisionCompassPrefill("should I launch now or wait six months?"),
    ).toEqual({
      decision: "should I launch now or wait six months?",
      optionA: "launch now",
      optionB: "wait six months",
    });
  });

  it("builds offer copy", () => {
    const offer = buildDecisionCompassOffer("help me decide");
    expect(offer.companionLine).toMatch(/ADHD Decision Compass/i);
    expect(offer.prefill.decision).toBe("help me decide");
  });

  it("respects session dismiss for not now", () => {
    expect(shouldOfferDecisionCompass("help me decide")).toBe(true);
    dismissDecisionCompassOfferForSession();
    expect(isDecisionCompassOfferDismissedForSession()).toBe(true);
    expect(shouldOfferDecisionCompass("help me decide")).toBe(false);
  });

  it("detects explicit open requests", () => {
    expect(isExplicitDecisionCompassRequest("open decision compass")).toBe(true);
    expect(isExplicitDecisionCompassRequest("help me decide")).toBe(false);
  });

  it("does not route decision phrases to Create workspace", () => {
    expect(detectDoingIntent("I need to make a decision")).toBeNull();
    expect(detectDoingIntent("help me decide between two offers")).toBeNull();
  });
});

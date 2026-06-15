import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  acceptRelationshipRemember,
  dismissRelationshipOffer,
  evaluateRelationshipOffer,
  getRelationships,
  shouldSurfaceRelationshipOffer,
} from "./relationshipEngine";
import { detectRelationshipSignals, hasRelationshipSignal } from "./relationshipSignals";
import { buildFounderRelationshipReport } from "./founderRelationshipReporting";
import { saveRelationshipStore } from "./relationshipStore";

describe("relationship intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveRelationshipStore({
      relationships: [],
      mentionCounts: {},
      founderSamples: [],
      offerDismissedOn: null,
      dismissedNames: {},
    });
  });

  it("detects follow-up and call signals", () => {
    expect(hasRelationshipSignal("I need to follow up with Sam tomorrow")).toBe(
      true,
    );
    const hits = detectRelationshipSignals("I should call Maria about the contract");
    expect(hits[0]?.kind).toBe("should_call");
    expect(hits[0]?.extractedName).toBe("Maria");
  });

  it("detects promise and referral language", () => {
    const hits = detectRelationshipSignals(
      "Someone referred me to Alex from the networking group",
    );
    expect(hits.some((h) => h.kind === "referral")).toBe(true);
    expect(hits[0]?.extractedName).toMatch(/Alex/i);
  });

  it("offers to remember with gentle non-CRM language", () => {
    const offer = evaluateRelationshipOffer({
      text: "I need to email Jordan about the proposal",
      now: new Date("2026-06-12"),
    });
    expect(offer).not.toBeNull();
    expect(shouldSurfaceRelationshipOffer(offer)).toBe(true);
    expect(offer?.companionOffer).toMatch(/remember/i);
    expect(offer?.companionOffer).not.toMatch(/CRM|pipeline|deal/i);
  });

  it("stores relationship when user accepts", () => {
    const offer = evaluateRelationshipOffer({
      text: "I promised Taylor I'd send the draft",
      now: new Date("2026-06-12"),
    });
    expect(offer).not.toBeNull();
    const { relationship, message } = acceptRelationshipRemember(offer!);
    expect(relationship.name).toBe("Taylor");
    expect(relationship.lastContext.length).toBeGreaterThan(5);
    expect(relationship.nextSuggestedTouchpoint).not.toBeNull();
    expect(message).toMatch(/remember Taylor/i);
    expect(getRelationships()).toHaveLength(1);
  });

  it("does not pressure after dismiss", () => {
    const text = "I need to follow up with Sam";
    const now = new Date("2026-06-12");
    evaluateRelationshipOffer({ text, now });
    dismissRelationshipOffer("Sam", now);
    const again = evaluateRelationshipOffer({ text, now });
    expect(again).toBeNull();
  });

  it("suggests repeated mention offer", () => {
    const now = new Date("2026-06-12");
    evaluateRelationshipOffer({
      text: "I should call Riley",
      now: new Date("2026-06-10"),
    });
    evaluateRelationshipOffer({
      text: "need to follow up with Riley",
      now: new Date("2026-06-11"),
    });
    const offer = evaluateRelationshipOffer({
      text: "I haven't talked to Riley in weeks",
      now,
    });
    expect(offer).not.toBeNull();
    expect(offer?.companionOffer).toMatch(/several times|Riley/i);
    expect(offer?.mentionCount).toBeGreaterThanOrEqual(1);
  });

  it("founder report includes opportunities", () => {
    const offer = evaluateRelationshipOffer({
      text: "Someone referred me to Pat",
      now: new Date("2026-06-12"),
    });
    acceptRelationshipRemember(offer!);
    const report = buildFounderRelationshipReport(new Date("2026-06-12"));
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
    expect(report.sampleSize).toBeGreaterThan(0);
  });
});

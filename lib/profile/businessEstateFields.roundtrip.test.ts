/**
 * @vitest-environment jsdom
 *
 * Regression: identity and work-style fields that the field registry declares
 * must round-trip through the estate envelope. They were previously absent from
 * the canonical type/defaults, so mergeSection dropped them on read and the
 * rooms silently lost data. These assertions lock in that they persist.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getBusinessEstateSections,
  saveBusinessEstateSection,
} from "./businessEstateProfile";

describe("Business Estate field persistence (Phase C round-trip fix)", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("round-trips the previously-dropped Identity story/purpose fields", () => {
    saveBusinessEstateSection("identity", {
      whatInspiredYou: "A gap I kept hitting.",
      whatHelpsYouContinue: "The people I help.",
      whyBusinessMatters: "So founders feel less alone.",
      hopedImpact: "Calmer, clearer businesses.",
      coreValueNotes: "Kindness first.",
    });
    const identity = getBusinessEstateSections().identity;
    expect(identity.whatInspiredYou).toBe("A gap I kept hitting.");
    expect(identity.whatHelpsYouContinue).toBe("The people I help.");
    expect(identity.whyBusinessMatters).toBe("So founders feel less alone.");
    expect(identity.hopedImpact).toBe("Calmer, clearer businesses.");
    expect(identity.coreValueNotes).toBe("Kindness first.");
  });

  it("round-trips the previously-dropped Working Style Study fields", () => {
    saveBusinessEstateSection("work-style", {
      preferredTimeOfDay: "Morning",
      preferredSessionLength: "25 minutes",
      soundPreference: "Quiet",
      structurePreference: "Light structure",
      thinkingOrderPreference: "Big picture first",
      collaborationPreference: "Mostly solo",
      decisionStyle: "Sleep on it",
      returnSupportTone: "Gentle",
      shariShouldAvoid: "Long checklists",
      returnOfferPreferences: "One small next step",
    });
    const ws = getBusinessEstateSections().workStyle;
    expect(ws.preferredTimeOfDay).toBe("Morning");
    expect(ws.preferredSessionLength).toBe("25 minutes");
    expect(ws.soundPreference).toBe("Quiet");
    expect(ws.structurePreference).toBe("Light structure");
    expect(ws.thinkingOrderPreference).toBe("Big picture first");
    expect(ws.collaborationPreference).toBe("Mostly solo");
    expect(ws.decisionStyle).toBe("Sleep on it");
    expect(ws.returnSupportTone).toBe("Gentle");
    expect(ws.shariShouldAvoid).toBe("Long checklists");
    expect(ws.returnOfferPreferences).toBe("One small next step");
  });

  it("does not wipe a sibling section when saving another", () => {
    saveBusinessEstateSection("identity", { whatInspiredYou: "Keep me" });
    saveBusinessEstateSection("work-style", { preferredTimeOfDay: "Morning" });
    const s = getBusinessEstateSections();
    expect(s.identity.whatInspiredYou).toBe("Keep me");
    expect(s.workStyle.preferredTimeOfDay).toBe("Morning");
  });
});

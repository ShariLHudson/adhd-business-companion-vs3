import { describe, expect, it } from "vitest";
import {
  FUTURE_CAPABILITIES,
  FUTURE_CAPABILITY_CATEGORIES,
  evaluateFutureCapabilityPortfolio,
  formatFutureCapabilityReviewText,
  getCapabilitiesByCategory,
  runVision2029Test,
  validateCapabilityDesign,
  validateFutureFirstCapability,
} from "./futureCapabilityArchitecture";

describe("futureCapabilityArchitecture", () => {
  it("tracks all seven future capability categories", () => {
    expect(Object.keys(FUTURE_CAPABILITY_CATEGORIES).length).toBe(7);
    for (const cat of Object.keys(FUTURE_CAPABILITY_CATEGORIES)) {
      expect(getCapabilitiesByCategory(cat as keyof typeof FUTURE_CAPABILITY_CATEGORIES).length).toBeGreaterThan(0);
    }
  });

  it("maps companion intelligence capabilities", () => {
    const companion = getCapabilitiesByCategory("companion_intelligence");
    expect(companion.length).toBe(7);
    const ids = companion.map((c) => c.id);
    expect(ids).toContain("trust_engine");
    expect(ids).toContain("founder_intelligence");
  });

  it("architecture rule rejects disconnected designs", () => {
    const rejected = validateCapabilityDesign({
      observable: true,
      learnable: true,
      personalizable: true,
      predictable: true,
      companionConnected: false,
    });
    expect(rejected.passesArchitectureRule).toBe(false);
    expect(rejected.blockers[0]).toMatch(/Companion Intelligence/);
  });

  it("2029 vision test requires registration and companion center", () => {
    const rejected = runVision2029Test({
      scalesTenX: true,
      usesRegistrationNotHardcoding: false,
      companionRemainsCenter: true,
    });
    expect(rejected.approved).toBe(false);

    const approved = runVision2029Test({
      scalesTenX: true,
      usesRegistrationNotHardcoding: true,
      companionRemainsCenter: true,
    });
    expect(approved.approved).toBe(true);
  });

  it("portfolio review is observable", () => {
    const portfolio = evaluateFutureCapabilityPortfolio();
    expect(portfolio.totalCapabilities).toBe(FUTURE_CAPABILITIES.length);
    expect(portfolio.totalCapabilities).toBeGreaterThanOrEqual(40);
    expect(portfolio.byCategory.analytics_ecosystem).toBeGreaterThanOrEqual(5);

    const text = formatFutureCapabilityReviewText(portfolio);
    expect(text).toMatch(/Future Capability Architecture Review/);
    expect(text).toMatch(/Companion Intelligence/);
  });

  it("validateFutureFirstCapability combines three-layer and design gates", () => {
    const aligned = validateFutureFirstCapability({
      userValue: "Helps users understand their business",
      intelligenceCaptures: ["Audience patterns"],
      futureEnables: ["Living Canvas™"],
      observable: true,
      learnable: true,
      personalizable: true,
      predictable: true,
      companionConnected: true,
    });
    expect(aligned.aligned).toBe(true);
    expect(aligned.blockers).toHaveLength(0);

    const rejected = validateFutureFirstCapability({
      userValue: "",
      intelligenceCaptures: [],
      futureEnables: [],
      observable: true,
      learnable: true,
      personalizable: true,
      predictable: true,
      companionConnected: true,
    });
    expect(rejected.aligned).toBe(false);
    expect(rejected.blockers.length).toBeGreaterThan(0);
  });
});

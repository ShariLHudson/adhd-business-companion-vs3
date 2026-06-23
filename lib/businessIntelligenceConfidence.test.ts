import { describe, expect, it } from "vitest";
import type { BusinessProfile, IdealClientAvatar } from "./companionStore";
import { evaluateBusinessIntelligenceConfidence } from "./businessIntelligenceConfidence";
import { buildBusinessConfidenceOffer } from "./businessIntelligenceConfidenceOffer";

const fullBusiness: BusinessProfile = {
  role: "Coach",
  goals: ["Get more clients"],
  sells: "ADHD business coaching program",
  idealClient: "Overwhelmed entrepreneurs",
  traits: ["Overwhelmed easily"],
  tone: "Warm",
  audienceResearch: "",
  updatedAt: new Date().toISOString(),
};

const fullAvatar: IdealClientAvatar = {
  id: "a1",
  name: "Busy Founder",
  tagline: "Stuck in overwhelm",
  who: "Solo entrepreneur",
  painPoints: "Too many ideas",
  goals: "Consistent revenue",
  currentBehavior: "Starts then stops",
  solution: "Simple weekly plan",
  objections: "No time",
  messagingAngle: "Permission to go slower",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPrimary: true,
};

describe("businessIntelligenceConfidence", () => {
  it("returns low confidence when profiles are empty", () => {
    const result = evaluateBusinessIntelligenceConfidence({
      businessProfile: null,
      avatars: [],
    });
    expect(result.level).toBe("low");
    expect(result.primaryGap).toBe("business");
  });

  it("returns high confidence when profiles are complete and fresh", () => {
    const result = evaluateBusinessIntelligenceConfidence({
      businessProfile: fullBusiness,
      avatars: [fullAvatar],
    });
    expect(result.level).toBe("high");
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });

  it("flags stale profiles", () => {
    const stale: BusinessProfile = {
      ...fullBusiness,
      updatedAt: new Date("2024-01-01").toISOString(),
    };
    const result = evaluateBusinessIntelligenceConfidence({
      businessProfile: stale,
      avatars: [{ ...fullAvatar, updatedAt: new Date("2024-01-01").toISOString() }],
      now: new Date("2026-06-01"),
      staleAfterMonths: 6,
    });
    expect(result.isStale).toBe(true);
    expect(result.freshnessMonths).toBeGreaterThanOrEqual(6);
  });

  it("builds low-context offer copy", () => {
    const confidence = evaluateBusinessIntelligenceConfidence({
      businessProfile: null,
      avatars: [],
    });
    const offer = buildBusinessConfidenceOffer(confidence, "marketing");
    expect(offer.message).toMatch(/don't know enough about your business/i);
    expect(offer.updateLabel).toBe("Update Business Profile");
  });

  it("builds stale profile offer copy", () => {
    const staleAt = new Date("2024-10-01").toISOString();
    const confidence = evaluateBusinessIntelligenceConfidence({
      businessProfile: {
        ...fullBusiness,
        updatedAt: staleAt,
      },
      avatars: [{ ...fullAvatar, updatedAt: staleAt }],
      now: new Date("2026-06-01"),
      staleAfterMonths: 6,
    });
    const offer = buildBusinessConfidenceOffer(confidence, "revenue");
    expect(offer.message).toMatch(/hasn't been updated/i);
  });
});

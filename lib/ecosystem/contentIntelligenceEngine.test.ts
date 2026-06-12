import { describe, expect, it } from "vitest";

import {
  calculateOpportunityScore,
  ContentIntelligenceEngine,
  MemoryContentOpportunitySink,
} from "./contentIntelligenceEngine";

describe("calculateOpportunityScore", () => {
  it("scores higher for more mentions and diverse sources", () => {
    const low = calculateOpportunityScore({
      frequency: 5,
      sourceSignals: [
        { type: "user_struggle", key: "overwhelm", count: 5 },
      ],
    });
    const high = calculateOpportunityScore({
      frequency: 427,
      sourceSignals: [
        { type: "user_struggle", key: "overwhelm", count: 200, lastSeen: new Date().toISOString() },
        { type: "user_question", key: "im_overwhelmed", count: 127 },
        { type: "user_language", key: "overwhelm", count: 80 },
        { type: "product_feedback", key: "overwhelm", count: 20 },
      ],
    });
    expect(high).toBeGreaterThan(low);
    expect(high).toBeGreaterThanOrEqual(90);
    expect(high).toBeLessThanOrEqual(100);
  });
});

describe("ContentIntelligenceEngine", () => {
  it("creates opportunities from categorized inputs", () => {
    const engine = new ContentIntelligenceEngine(new MemoryContentOpportunitySink());
    const opportunities = engine.ingest({
      struggles: [{ key: "overwhelm", count: 200 }],
      questions: [{ key: "im_overwhelmed", count: 127 }],
      userLanguage: [{ key: "overwhelm", count: 80 }],
      productFeedback: [{ key: "overwhelm", count: 20 }],
    });

    expect(opportunities.length).toBeGreaterThan(0);
    const overwhelm = engine.getOpportunityByTopic("Overwhelm");
    expect(overwhelm).toBeDefined();
    expect(overwhelm!.frequency).toBe(220);
    expect(overwhelm!.sourceSignals.some((s) => s.type === "user_struggle")).toBe(true);
    expect(overwhelm!.sourceSignals.some((s) => s.type === "product_feedback")).toBe(true);
    expect(engine.storageIsOpportunityOnly()).toBe(true);
  });

  it("ranks topics by opportunity score", () => {
    const engine = new ContentIntelligenceEngine(new MemoryContentOpportunitySink());
    engine.ingest({
      struggles: [{ key: "focus", count: 12 }],
      questions: [{ key: "help_me_prioritize", count: 80 }],
      featureRequests: [{ key: "calendar_integration", count: 45 }],
    });

    const ranked = engine.getRankedOpportunities();
    expect(ranked.length).toBeGreaterThan(1);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].opportunityScore).toBeGreaterThanOrEqual(
        ranked[i].opportunityScore,
      );
    }
  });

  it("suggests asset categories without generating content", () => {
    const engine = new ContentIntelligenceEngine(new MemoryContentOpportunitySink());
    engine.ingest({
      struggles: [{ key: "overwhelm", count: 427 }],
      questions: [{ key: "im_overwhelmed", count: 50 }],
      userLanguage: [{ key: "overwhelm", count: 30 }],
    });

    const opp = engine.getOpportunityByTopic("Overwhelm");
    expect(opp).toBeDefined();
    expect(opp!.suggestedAssets).toContain("blogs");
    expect(opp!.suggestedAssets).toContain("newsletters");
    expect(opp!.suggestedAssets).toContain("workshops");
    expect(opp!.suggestedAssets).toContain("social_posts");
    expect(opp).not.toHaveProperty("body");
    expect(opp).not.toHaveProperty("draft");
  });

  it("exports PostCraft-ready payload", () => {
    const engine = new ContentIntelligenceEngine(new MemoryContentOpportunitySink());
    engine.ingest({
      struggles: [{ key: "marketing", count: 40 }],
      featureRequests: [{ key: "templates", count: 15 }],
    });

    const payload = engine.toPostCraftPayload();
    expect(payload.generatedAt).toBeTruthy();
    expect(payload.opportunities.length).toBeGreaterThan(0);
    const first = payload.opportunities[0];
    expect(first).toHaveProperty("topic");
    expect(first).toHaveProperty("mentions");
    expect(first).toHaveProperty("opportunityScore");
    expect(first).toHaveProperty("suggestedAssets");
    expect(first).toHaveProperty("sourceSignals");
    expect(first).not.toHaveProperty("content");
  });
});

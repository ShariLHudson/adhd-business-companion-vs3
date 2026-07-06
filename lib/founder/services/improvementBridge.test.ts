import { describe, expect, it } from "vitest";

import {
  prepareFounderReview,
  prepareImprovementPlan,
  prepareMissionReview,
  prepareProductReview,
  prepareQuarterlyReview,
} from "./improvementBridge";

describe("Founder Continuous Improvement bridge", () => {
  it("prepareImprovementPlan assembles prioritized plan", () => {
    const plan = prepareImprovementPlan("listening-rooms");
    expect(plan.product).toBe("founder");
    expect(plan.architectureOnly).toBe(true);
    expect(plan.opportunities.length).toBeGreaterThan(0);
    expect(plan.recommendations.length).toBeGreaterThan(0);
  });

  it("prepareQuarterlyReview composes review cycle", () => {
    const bundle = prepareQuarterlyReview("listening-rooms");
    expect(bundle.review.kind).toBe("quarterly");
    expect(bundle.prioritized.length).toBeGreaterThan(0);
  });

  it("prepareMissionReview scopes to mission", () => {
    const bundle = prepareMissionReview("listening-rooms");
    expect(bundle.review.kind).toBe("mission");
    expect(bundle.missionId).toBe("listening-rooms");
  });

  it("prepareFounderReview surfaces top improvement", () => {
    const bundle = prepareFounderReview();
    expect(bundle.review.kind).toBe("founder");
    expect(bundle.topImprovement).toBeTruthy();
  });

  it("prepareProductReview filters product opportunities", () => {
    const bundle = prepareProductReview("listening-rooms");
    expect(bundle.review.kind).toBe("product");
  });
});

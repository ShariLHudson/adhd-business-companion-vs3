import { describe, expect, it } from "vitest";

import {
  composeExecutiveJudgmentView,
  composeJudgmentDetail,
  composeRecommendationPyramid,
  getExecutiveJudgmentBootstrap,
  JUDGMENT_ENGINE_PRINCIPLE,
} from "./index";

describe("Executive Judgment Engine™", () => {
  it("exposes judgment principle", () => {
    expect(JUDGMENT_ENGINE_PRINCIPLE).toContain("judgment");
  });

  it("composeRecommendationPyramid presents one primary and supporting tiers", () => {
    const pyramid = composeRecommendationPyramid();
    expect(pyramid.primary.compositeScore).toBeGreaterThan(85);
    expect(pyramid.supporting).toHaveLength(2);
    expect(pyramid.canWait).toHaveLength(3);
  });

  it("composeExecutiveJudgmentView includes why-not and not-now library", () => {
    const view = composeExecutiveJudgmentView();
    expect(view.whyNot.length).toBeGreaterThan(3);
    expect(view.notNowLibrary.length).toBeGreaterThan(2);
    expect(view.learningLoop.length).toBeGreaterThan(1);
    expect(view.todaysQuestion).toContain("recommend today");
  });

  it("composeJudgmentDetail includes scores and shari lens", () => {
    const detail = composeJudgmentDetail("judgment-unified-restart");
    expect(detail).not.toBeNull();
    expect(detail!.recommendation.scores.length).toBeGreaterThan(5);
    expect(detail!.recommendation.shariLens.fitSummary).toBeTruthy();
    expect(detail!.recommendation.reasoning.evidence.length).toBeGreaterThan(0);
  });

  it("getExecutiveJudgmentBootstrap surfaces primary headline", () => {
    const bootstrap = getExecutiveJudgmentBootstrap();
    expect(bootstrap.primaryHeadline).toContain("restart");
    expect(bootstrap.recommendationCount).toBeGreaterThan(5);
  });
});

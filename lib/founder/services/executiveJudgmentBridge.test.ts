import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveJudgmentEngine,
  prepareFounderJudgmentDetail,
} from "./executiveJudgmentBridge";

describe("Founder Executive Judgment bridge", () => {
  it("prepareFounderExecutiveJudgmentEngine returns pyramid view", () => {
    const result = prepareFounderExecutiveJudgmentEngine();
    expect(result.view.pyramid.primary.headline).toBeTruthy();
    expect(result.principle).toContain("judgment");
  });

  it("prepareFounderJudgmentDetail returns recommendation detail", () => {
    const result = prepareFounderJudgmentDetail("judgment-unified-restart");
    expect(result.detail?.recommendation.whyThis).toBeTruthy();
  });
});

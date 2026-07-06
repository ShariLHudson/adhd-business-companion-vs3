import { describe, expect, it } from "vitest";

import { getJudgmentEngineCenterBootstrap } from "./index";

describe("Judgment Engine Center", () => {
  it("returns bootstrap with primary recommendation", () => {
    const bootstrap = getJudgmentEngineCenterBootstrap();
    expect(bootstrap.primaryHeadline).toBeTruthy();
    expect(bootstrap.recommendationCount).toBeGreaterThan(5);
  });
});

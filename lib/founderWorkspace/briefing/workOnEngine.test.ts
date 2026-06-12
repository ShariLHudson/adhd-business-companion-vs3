import { describe, expect, it } from "vitest";

import { generateFounderDailyBriefing } from "./founderBriefingEngine";
import { getWorkOnRecommendation } from "./workOnEngine";

describe("workOnEngine", () => {
  it("returns one clear recommendation from briefing", () => {
    const briefing = generateFounderDailyBriefing({
      workspace: { projects: [], experiments: [], notes: [] },
      analyses: [],
      dashboard: {
        needingAttention: [],
        stalled: [],
        highMomentum: [],
        opportunities: [],
        openIssues: [],
      },
      tracking: {
        issues: [
          {
            id: "fi-1",
            title: "Time Block not saving",
            description: "Context lost",
            severity: "critical",
            status: "active",
            source: "testing",
            screenshots: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        experiments: [],
      },
    });

    const rec = getWorkOnRecommendation(briefing);
    expect(rec.action.length).toBeGreaterThan(5);
    expect(rec.reason).toContain("Time Block");
  });
});

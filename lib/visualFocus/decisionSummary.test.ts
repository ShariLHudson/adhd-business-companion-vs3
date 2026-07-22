import { describe, expect, it } from "vitest";
import { buildDecisionSummary, canBuildDecisionSummary } from "./decisionSummary";
import type { VisualFocusAnalysis, VisualFocusMap } from "./types";

const analysis: VisualFocusAnalysis = {
  summary: "A decision about hiring a VA.",
  keyRelationships: ["Delegation depends on documented process"],
  patterns: ["Overwhelm rises at month end"],
  risks: ["Cash is tight this quarter"],
  opportunities: ["A VA frees ten hours a week"],
  recommendations: ["Start with a five-hour trial"],
  nextSteps: ["Write the trial task list"],
  generatedAt: new Date().toISOString(),
};

function makeMap(overrides: Partial<VisualFocusMap> = {}): VisualFocusMap {
  return {
    id: "m1",
    title: "Should I hire a VA?",
    mode: "decision-tree",
    root: { id: "r", label: "root", children: [] },
    analysis,
    workflowStage: "generated",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("decision summary", () => {
  it("synthesizes the five calm lines from analysis", () => {
    const summary = buildDecisionSummary(makeMap());
    expect(summary.deciding).toBe("Should I hire a VA?");
    expect(summary.mattersMost).toBe("Overwhelm rises at month end");
    expect(summary.strongestOpportunity).toBe("A VA frees ten hours a week");
    expect(summary.biggestRisk).toBe("Cash is tight this quarter");
    expect(summary.nextStep).toBe("Write the trial task list");
  });

  it("falls back gracefully when a section is empty", () => {
    const summary = buildDecisionSummary(
      makeMap({
        analysis: { ...analysis, patterns: [], keyRelationships: [] },
      }),
    );
    // mattersMost falls back to the summary text.
    expect(summary.mattersMost).toBe("A decision about hiring a VA.");
  });

  it("uses recommendations when nextSteps are missing", () => {
    const summary = buildDecisionSummary(
      makeMap({ analysis: { ...analysis, nextSteps: [] } }),
    );
    expect(summary.nextStep).toBe("Start with a five-hour trial");
  });

  it("is unavailable until an analysis exists", () => {
    expect(canBuildDecisionSummary(makeMap())).toBe(true);
    expect(
      canBuildDecisionSummary(makeMap({ analysis: undefined })),
    ).toBe(false);
  });
});

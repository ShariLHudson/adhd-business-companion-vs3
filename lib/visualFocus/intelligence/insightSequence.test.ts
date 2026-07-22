import { describe, expect, it } from "vitest";
import type { VisualFocusAnalysis } from "../types";
import {
  countIntelligenceInsights,
  insightInviteLine,
  sequenceIntelligenceInsights,
} from "./insightSequence";

const analysis: VisualFocusAnalysis = {
  summary: "This maps a hiring decision.",
  keyRelationships: ["Hiring depends on cash flow"],
  patterns: ["You keep returning to workload"],
  risks: ["Revenue depends on one client"],
  opportunities: ["A retainer could stabilize income"],
  recommendations: ["Draft a retainer offer"],
  nextSteps: ["Talk to your top client this week"],
  boardObservations: [],
  whatIfNotes: [],
  generatedAt: new Date().toISOString(),
};

describe("intelligence insight sequencing", () => {
  it("flattens analysis into an ordered walkthrough (summary first)", () => {
    const sequence = sequenceIntelligenceInsights(analysis);
    expect(sequence[0].categoryId).toBe("summary");
    // Order follows the category order — risks appear before opportunities.
    const risk = sequence.findIndex((s) => s.categoryId === "risks");
    const opp = sequence.findIndex((s) => s.categoryId === "opportunities");
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(opp).toBeGreaterThan(risk);
  });

  it("counts only real insights", () => {
    // 1 summary + 1 rel + 1 pattern + 1 risk + 1 opp + 1 rec + 1 next = 7
    expect(countIntelligenceInsights(analysis)).toBe(7);
  });

  it("ignores blank entries when counting", () => {
    const sparse: VisualFocusAnalysis = {
      ...analysis,
      keyRelationships: ["", "  "],
      patterns: [],
      recommendations: [],
      nextSteps: [],
      risks: [],
      opportunities: [],
    };
    // Only the summary remains.
    expect(countIntelligenceInsights(sparse)).toBe(1);
  });

  it("phrases the invite in Shari's plain voice", () => {
    expect(insightInviteLine(0)).toMatch(/nothing urgent/i);
    expect(insightInviteLine(1)).toBe("I've found one thing that might help.");
    expect(insightInviteLine(4)).toBe("I've found 4 things that might help.");
  });
});

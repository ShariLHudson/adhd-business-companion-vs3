import { describe, expect, it } from "vitest";
import {
  actionFromRecommendation,
  generateFounderActions,
} from "./founderActionEngine";
import type { FounderRecommendation } from "../intelligence/intelligenceTypes";

describe("founderActionEngine", () => {
  it("builds an action from a recommendation with workspace", () => {
    const rec: FounderRecommendation = {
      id: "rec-1",
      text: "Draft an SOP for client onboarding",
      reason: "You mentioned onboarding twice this week.",
      confidence: "high",
      relatedObjectIds: ["proj-1"],
      sourceEventIds: ["evt-1"],
    };
    const action = actionFromRecommendation(rec, [
      {
        id: "evt-p",
        founderId: "founder-001",
        type: "project.created",
        ts: "2026-06-01T10:00:00.000Z",
        refs: { projectId: "proj-1" },
        data: { title: "ADHD Ecosystem" },
      },
    ]);
    expect(action.workspace.section).toBe("content-generator");
    expect(action.relatedProject?.title).toBe("ADHD Ecosystem");
    expect(action.actionType).toBe("open-create");
  });

  it("deduplicates actions from multiple sources", () => {
    const actions = generateFounderActions({
      intelligence: {
        patterns: [],
        insights: [],
        risks: [],
        opportunities: [],
        wins: [],
        recommendations: [
          {
            id: "r1",
            text: "Work on sales funnel",
            reason: "Launch stage needs funnel clarity.",
            confidence: "high",
            relatedObjectIds: [],
            sourceEventIds: [],
          },
        ],
        memory: {
          frequentProjects: [],
          frequentGoals: [],
          frequentStruggles: [],
          frequentOpportunities: [],
          frequentPeople: [],
        },
      },
      journeyRecommendations: [
        {
          text: "Work on sales funnel",
          focus: "marketing",
          reason: "Funnel is the bottleneck.",
        },
      ],
      limit: 5,
    });
    expect(actions).toHaveLength(1);
  });
});

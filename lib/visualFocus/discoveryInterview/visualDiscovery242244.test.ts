import { describe, expect, it } from "vitest";
import {
  VISUAL_DISCOVERY_INTERVIEW_LIBRARY,
  getVisualDiscoveryInterviewSpec,
} from "./visualDiscoveryLibrary";
import {
  SPARK_FIRST_DRAFT_MEMBER_LINE,
  SPARK_FIRST_DRAFT_THINKING_ORDER,
  evaluateFirstDraftRequirements,
  formatFirstDraftReviewMessage,
} from "./firstDraftIntelligence";
import {
  buildMindMapDraftFromDiscovery,
  hasEnoughForMindMapFirstDraft,
  MIND_MAP_DISCOVERY_QUESTIONS,
} from "./mindMapDiscovery";

describe("242 Visual Discovery Interview Library", () => {
  it("defines map-specific interviews (Mind Map live; others reserved)", () => {
    expect(Object.keys(VISUAL_DISCOVERY_INTERVIEW_LIBRARY)).toEqual(
      expect.arrayContaining([
        "mind-map",
        "decision-map",
        "strategy-map",
        "timeline",
        "relationship-map",
      ]),
    );
    const mind = getVisualDiscoveryInterviewSpec("mind-map");
    expect(mind.discover).toContain("Main topic");
    expect(mind.discover).toContain("Desired outcome");
    expect(mind.exampleQuestions[0]).toMatch(/mapping/i);
  });

  it("Mind Map live questions follow 242 examples", () => {
    expect(MIND_MAP_DISCOVERY_QUESTIONS.map((q) => q.prompt)).toEqual([
      "What would you like to create a mind map about?",
      "What ideas immediately come to mind?",
      "Is there an end goal?",
    ]);
  });
});

describe("243 / 244 Discovery patterns + First Draft Intelligence", () => {
  it("knows when enough exists for a first draft (Pattern 5)", () => {
    expect(
      hasEnoughForMindMapFirstDraft({
        topic: "Launch",
        everything: "Audience\nOffer\nChannels",
      }),
    ).toBe(true);
    expect(
      hasEnoughForMindMapFirstDraft({ topic: "X", everything: "one" }),
    ).toBe(false);
  });

  it("builds a draft with grouping, gaps, and the 244 member line", () => {
    const draft = buildMindMapDraftFromDiscovery({
      topic: "Product launch",
      everything: "Audience\nPricing\nMarketing\nEmail list\nAudience again",
      desiredOutcome: "A clear launch plan",
    });
    expect(draft.root.label).toBe("Product launch");
    expect(draft.root.children.some((c) => c.label === "Desired outcome")).toBe(
      true,
    );
    expect(draft.explanation).toContain(SPARK_FIRST_DRAFT_MEMBER_LINE);
    expect(draft.duplicates.length).toBeGreaterThanOrEqual(0);

    const req = evaluateFirstDraftRequirements({
      explanation: draft.explanation,
      duplicates: draft.duplicates,
      suggestedGaps: draft.suggestedGaps,
      suggestedBranches: draft.suggestedBranches,
      branchCount: draft.root.children.length,
    });
    expect(req.logicallyGrouped).toBe(true);
    expect(req.groupingExplained).toBe(true);
  });

  it("exposes Spark thinking order from 244", () => {
    expect(SPARK_FIRST_DRAFT_THINKING_ORDER[0]).toBe("Purpose");
    expect(SPARK_FIRST_DRAFT_THINKING_ORDER).toContain("Suggested next steps");
    expect(formatFirstDraftReviewMessage("Grouped by theme.")).toContain(
      SPARK_FIRST_DRAFT_MEMBER_LINE,
    );
  });
});

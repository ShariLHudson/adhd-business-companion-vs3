/**
 * Research-Assisted Map Building — detection, mode selection, and per-type
 * draft building. Guards the core promise: a member can start without knowing
 * the steps, Spark detects uncertainty and offers help, and the researched
 * draft adapts to the map type + detail level while preserving sources and
 * confidence.
 */

import { describe, expect, it } from "vitest";
import {
  buildResearchAssistedDraft,
  detectResearchEntry,
  describeDetailedYieldForMap,
  extractTopic,
  researchModesForMap,
  resolveDetailLevel,
} from "./index";
import type { VisualFocusMode, VisualFocusNode } from "../types";

function countNodes(node: VisualFocusNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}

function maxDepth(node: VisualFocusNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(maxDepth));
}

describe("detectResearchEntry — reading uncertainty in plain language", () => {
  it("offers research when the member says they don't know the steps", () => {
    const d = detectResearchEntry(
      "I want to create a process map for how to make a Loom video, but I do not know the steps.",
    );
    expect(d.knowledgeState).toBe("research");
    expect(d.shouldOfferResearch).toBe(true);
    expect(d.suggestedChoice).toBe("research-it");
    expect(d.matchedSignals.length).toBeGreaterThan(0);
  });

  it.each([
    "Can you figure this out for me?",
    "I know the outcome but not the process",
    "I need help researching this",
    "Build the map for me",
    "How do I run an online event?",
  ])("treats %s as a research signal", (phrase) => {
    const d = detectResearchEntry(phrase);
    expect(d.shouldOfferResearch).toBe(true);
    expect(d.suggestedChoice).toBe("research-it");
  });

  it("recognizes partial knowledge", () => {
    const d = detectResearchEntry("I only know part of it");
    expect(d.knowledgeState).toBe("partial");
    expect(d.shouldOfferResearch).toBe(true);
  });

  it("recognizes a member who already knows the content", () => {
    const d = detectResearchEntry(
      "I already know all the steps, just capture what I say",
    );
    expect(d.knowledgeState).toBe("known");
    expect(d.shouldOfferResearch).toBe(false);
    expect(d.suggestedChoice).toBe("build-from-known");
  });

  it("routes 'help me think it through' to the think-it-through choice", () => {
    const d = detectResearchEntry("I'm not sure how to structure this, help me think it through");
    expect(d.knowledgeState).toBe("unsure");
    expect(d.suggestedChoice).toBe("think-it-through");
  });

  it("still offers help for a bare topic with no strong signal", () => {
    const d = detectResearchEntry("marketing my coaching business");
    expect(d.shouldOfferResearch).toBe(true);
  });
});

describe("extractTopic — clean map title from a messy sentence", () => {
  it("strips the intent and uncertainty framing", () => {
    expect(
      extractTopic(
        "I want to create a process map for how to make a Loom video, but I do not know the steps.",
      ).toLowerCase(),
    ).toContain("loom video");
  });

  it("keeps a plain topic intact", () => {
    expect(extractTopic("starting a podcast").toLowerCase()).toBe(
      "starting a podcast",
    );
  });
});

describe("resolveDetailLevel — natural language to a detail level", () => {
  it.each([
    ["give me a simple overview", "overview"],
    ["a practical step-by-step version", "working"],
    ["make it detailed for my VA to follow", "detailed"],
    ["turn this into an expert-level SOP", "detailed"],
  ] as const)("maps %s -> %s", (input, level) => {
    expect(resolveDetailLevel(input)).toBe(level);
  });

  it("falls back to working when unclear", () => {
    expect(resolveDetailLevel("hmm")).toBe("working");
  });
});

describe("researchModesForMap — three levels, specialized per type", () => {
  it("always returns overview, working, detailed", () => {
    const modes = researchModesForMap("process-map");
    expect(modes.map((m) => m.level)).toEqual([
      "overview",
      "working",
      "detailed",
    ]);
  });

  it("specializes the detailed yield per map type", () => {
    expect(describeDetailedYieldForMap("decision-tree")).not.toBe(
      describeDetailedYieldForMap("process-map"),
    );
    expect(researchModesForMap("journey-map")[2]!.yields).toContain("emotions");
  });
});

const ALL_MAP_TYPES: VisualFocusMode[] = [
  "mind-map",
  "decision-tree",
  "relationship-map",
  "process-map",
  "journey-map",
  "timeline-map",
  "strategy-map",
  "opportunity-map",
  "system-map",
  "priority-map",
];

describe("buildResearchAssistedDraft — adapts to map type + detail", () => {
  it("builds a usable Loom process map at working detail with ordered steps", () => {
    const draft = buildResearchAssistedDraft({
      mapType: "process-map",
      topic: "how to make a Loom video",
      detailLevel: "working",
    });
    expect(draft.title.toLowerCase()).toContain("loom");
    // Ordered, no placeholder/empty branches.
    const labels = draft.root.children.map((c) => c.label);
    expect(labels[0]).toMatch(/^1\./);
    expect(labels.some((l) => /record/i.test(l))).toBe(true);
    // Working detail carries substeps.
    expect(draft.root.children.some((c) => c.children.length > 0)).toBe(true);
    // Research preserved.
    expect(draft.research.researchAssisted).toBe(true);
    expect(draft.research.sources.length).toBeGreaterThan(0);
    expect(draft.research.nodeResearch.length).toBe(draft.root.children.length);
    // Honest uncertainty — Loom permissions depend on plan.
    expect(
      draft.research.nodeResearch.some((n) => n.confidence === "needs-confirmation"),
    ).toBe(true);
    expect(draft.research.freshness).toBe("time-sensitive");
  });

  it("overview mode is simpler than detailed mode for the same topic", () => {
    const overview = buildResearchAssistedDraft({
      mapType: "process-map",
      topic: "client onboarding",
      detailLevel: "overview",
    });
    const detailed = buildResearchAssistedDraft({
      mapType: "process-map",
      topic: "client onboarding",
      detailLevel: "detailed",
    });
    expect(countNodes(detailed.root)).toBeGreaterThan(countNodes(overview.root));
    // Overview keeps depth shallow (no substeps).
    expect(maxDepth(overview.root)).toBeLessThanOrEqual(2);
    expect(maxDepth(detailed.root)).toBeGreaterThanOrEqual(3);
  });

  it("does not reuse one structure — decision vs journey differ", () => {
    const decision = buildResearchAssistedDraft({
      mapType: "decision-tree",
      topic: "Zoom vs Teams vs Meet",
      detailLevel: "working",
    });
    const journey = buildResearchAssistedDraft({
      mapType: "journey-map",
      topic: "joining a coaching program",
      detailLevel: "working",
    });
    const decisionLabels = decision.root.children.map((c) => c.label).join(" ");
    const journeyLabels = journey.root.children.map((c) => c.label).join(" ");
    expect(decisionLabels).toMatch(/option|criteria|tradeoff/i);
    expect(journeyLabels).toMatch(/awareness|consideration|onboarding/i);
    expect(decisionLabels).not.toEqual(journeyLabels);
  });

  it.each(ALL_MAP_TYPES)(
    "produces a non-empty, source-bearing draft for %s",
    (mapType) => {
      const draft = buildResearchAssistedDraft({
        mapType,
        topic: `test topic for ${mapType}`,
        detailLevel: "working",
      });
      expect(draft.root.children.length).toBeGreaterThan(0);
      // No empty labels anywhere.
      const hasEmpty = (n: VisualFocusNode): boolean =>
        n.label.trim().length === 0 ||
        n.children.some((c) => hasEmpty(c));
      expect(hasEmpty(draft.root)).toBe(false);
      expect(draft.research.sources.length).toBeGreaterThan(0);
      expect(draft.research.detailLevel).toBe("working");
      // Assumptions and facts are kept separate.
      expect(Array.isArray(draft.research.assumptions)).toBe(true);
      expect(Array.isArray(draft.research.researchedFacts)).toBe(true);
    },
  );

  it("keeps the member's known facts separate from researched facts", () => {
    const draft = buildResearchAssistedDraft({
      mapType: "strategy-map",
      topic: "launch a local workshop series",
      detailLevel: "working",
      knownFacts: ["Budget is $2000", "Venue already booked"],
    });
    expect(draft.research.userKnownFacts).toEqual([
      "Budget is $2000",
      "Venue already booked",
    ]);
    expect(draft.research.researchedFacts).not.toContain("Budget is $2000");
  });
});

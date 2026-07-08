import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { shouldBlockVisualThinking } from "./visualThinkingOverreach";
import {
  buildVisualRecommendationReply,
  detectVisualRecommendationIntent,
  recommendVisualStructures,
  resolveVisualRecommendationSelection,
  shouldOfferVisualRecommendation,
  visualRecommendationPendingFromReply,
} from "./visualRecommendationEngine";
import {
  buildVisualThinkingMenuPendingAction,
  isVisualThinkingMenuOfferMessage,
  resolveVisualMenuSelection,
} from "./visualThinkingContinuation";

describe("visualRecommendationEngine (P0.20)", () => {
  describe("Path A — direct visual request", () => {
    it.each([
      ["create a mind map", "mind-map"],
      ["create a decision tree", "decision-tree"],
    ])('"%s" opens immediately', (input, viewId) => {
      expect(detectVisualRecommendationIntent(input)).toBe("immediate");
      const decision = resolveFrictionlessAction({ userText: input, currentTurn: 1 });
      expect(decision.immediateVisualOpen?.viewId).toBe(viewId);
    });

    it("create a flowchart opens Process Flow immediately", () => {
      expect(detectVisualRecommendationIntent("create a flowchart")).toBe(
        "immediate",
      );
      const decision = resolveFrictionlessAction({
        userText: "create a flowchart",
        currentTurn: 1,
      });
      expect(decision.immediateVisualOpen?.viewId).toBe("process-flow");
    });
  });

  describe("Path B — recommendation request", () => {
    it("book writing recommends available types only", () => {
      const input = "I want to write a book about ADHD";
      const rec = recommendVisualStructures(input);
      expect(rec.recommendations.map((r) => r.visualType)).toEqual([
        "hierarchy-tree",
        "mind-map",
        "customer-journey-map",
      ]);
    });

    it("course launch recommends available types only", () => {
      const rec = recommendVisualStructures("I want to launch a course");
      expect(rec.recommendations.map((r) => r.visualType)).toEqual([
        "hierarchy-tree",
        "project-map",
        "timeline",
      ]);
    });

    it("sales funnel recommends flow and timeline", () => {
      const rec = recommendVisualStructures("I need a sales funnel");
      expect(rec.recommendations.map((r) => r.visualType)).toEqual([
        "process-flow",
        "timeline",
      ]);
    });

    it("turn this into something visual recommends options", () => {
      const input = "Turn this into something visual";
      expect(shouldOfferVisualRecommendation(input)).toBe(true);
      const decision = resolveFrictionlessAction({ userText: input, currentTurn: 1 });
      expect(decision.pendingAction?.type).toBe("visual_recommendation");
      expect(decision.localReply).toMatch(/Which one would help most\?/);
    });

    it("help me organize this visually recommends options", () => {
      expect(shouldOfferVisualRecommendation("Help me organize this visually")).toBe(
        true,
      );
    });
  });

  describe("selection continuation", () => {
    const pending = visualRecommendationPendingFromReply({
      userText: "I want to write a book",
      offeredAtTurn: 1,
    });

    it("user says 1 → first available recommendation", () => {
      const pick = resolveVisualRecommendationSelection("1", pending);
      expect(pick?.viewId).toBe("hierarchy-tree");
    });

    it("user says mind map → mind map", () => {
      const pick = resolveVisualRecommendationSelection("mind map", pending);
      expect(pick?.viewId).toBe("mind-map");
    });

    it("user says flowchart → blocked at open layer", () => {
      const pick = resolveVisualRecommendationSelection("flowchart", pending);
      expect(pick?.viewId).toBe("process-flow");
    });

    it("resolveVisualMenuSelection wraps engine selection", () => {
      const menuPending = buildVisualThinkingMenuPendingAction({
        initialPrompt: "I want to launch a course",
        offeredAtTurn: 1,
      });
      expect(resolveVisualMenuSelection("1", menuPending)?.viewId).toBe(
        "hierarchy-tree",
      );
    });
  });

  describe("negative cases — ADHD support", () => {
    it.each([
      "I keep putting off my sales calls",
      "I am overwhelmed",
    ])('"%s" does not recommend visuals', (input) => {
      expect(detectVisualRecommendationIntent(input)).toBe("none");
      expect(shouldOfferVisualRecommendation(input)).toBe(false);
      const decision = resolveFrictionlessAction({ userText: input, currentTurn: 1 });
      expect(decision.pendingAction?.type).not.toBe("visual_recommendation");
    });

    it("overwhelmed user can still ask to map it out", () => {
      const input = "I'm overwhelmed — map this out visually";
      expect(shouldBlockVisualThinking(input)).toBe(false);
      expect(detectVisualRecommendationIntent(input)).toBe("immediate");
    });
  });

  describe("offer message detection", () => {
    it("detects napkin-style assistant offer", () => {
      const reply = buildVisualRecommendationReply(
        recommendVisualStructures("I want to launch a course"),
      );
      expect(isVisualThinkingMenuOfferMessage(reply)).toBe(true);
    });
  });
});
import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import {
  isLearnAboutVisualType,
  shouldSuppressVisualThinkingForLearn,
} from "./visualLearnBoundary";
import {
  detectVisualTypeInText,
  isVisualTypeAvailable,
  resolveUnavailableVisualTypeReply,
  VISUAL_TYPES,
} from "./visualTypeAvailability";
import {
  isVisualStructureExecution,
  resolveVisualStructureRoute,
} from "./visualStructureRouting";
import { recommendVisualStructures } from "./visualRecommendationEngine";

describe("visualLearnBoundary (P0.20.1)", () => {
  describe("Learn — no Visual Thinking", () => {
    const learnCases = [
      "What is a flowchart?",
      "What is a flowchart and how is it used?",
      "How is a flowchart used?",
      "Explain diagrams",
      "Tell me about concept maps",
      "What is a mind map?",
      "Explain decision trees",
    ];

    it.each(learnCases)('"%s"', (input) => {
      expect(isLearnAboutVisualType(input)).toBe(true);
      expect(shouldSuppressVisualThinkingForLearn(input)).toBe(true);
      expect(isKnowledgeQuestion(input)).toBe(true);
      expect(isVisualStructureExecution(input)).toBe(false);
      expect(resolveVisualStructureRoute(input)).toBeNull();

      const routing = resolveIntentRouting({ userText: input });
      expect(routing.category).toBe("learn");
      expect(routing.learnFastPath).toBe(true);

      const frictionless = resolveFrictionlessAction({
        userText: input,
        currentTurn: 1,
      });
      expect(frictionless.immediateVisualOpen).toBeUndefined();
      expect(frictionless.pendingAction?.type).not.toBe("visual_recommendation");
      expect(frictionless.workspaceOffer?.section).not.toBe("visual-focus");
    });
  });

  describe("Create — available vs planned", () => {
    it("create a mind map opens Visual Thinking", () => {
      expect(isVisualTypeAvailable("mind_map")).toBe(true);
      const decision = resolveFrictionlessAction({
        userText: "Create a mind map",
        currentTurn: 1,
      });
      expect(decision.immediateVisualOpen?.viewId).toBe("mind-map");
    });

    it("create a flowchart does not open — planned type message", () => {
      expect(isVisualTypeAvailable("flowchart")).toBe(false);
      expect(detectVisualTypeInText("create a flowchart")).toBe("flowchart");
      expect(resolveUnavailableVisualTypeReply("create a flowchart")).toMatch(
        /aren't fully built into Visual Thinking yet/i,
      );
      const decision = resolveFrictionlessAction({
        userText: "create a flowchart",
        currentTurn: 1,
      });
      expect(decision.immediateVisualOpen).toBeUndefined();
      expect(decision.localReply).toMatch(/What are the steps you want included\?/);
    });

    it("create a decision tree opens when available", () => {
      expect(isVisualTypeAvailable("decision_tree")).toBe(true);
      const decision = resolveFrictionlessAction({
        userText: "create a decision tree",
        currentTurn: 1,
      });
      expect(decision.immediateVisualOpen?.viewId).toBe("decision-tree");
    });
  });

  describe("recommendations filter planned types", () => {
    it("book writing omits planned hierarchy tree", () => {
      const rec = recommendVisualStructures("I want to write a book");
      const types = rec.recommendations.map((r) => r.visualType);
      expect(types).not.toContain("hierarchy-tree");
      expect(types.length).toBeGreaterThan(0);
      expect(types.every((id) => id === "mind-map" || id === "customer-journey-map")).toBe(
        true,
      );
    });
  });
});

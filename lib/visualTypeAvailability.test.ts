import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { matchCatalogFromText } from "./createCatalog";
import {
  buildPlannedVisualTypeFallbackReply,
  extractFlowStepsFromContent,
  formatFlowOutline,
  resolveUnavailableVisualTypeReply,
} from "./visualTypeAvailability";

function plannedDecision(input: string, lastAssistant?: string) {
  return resolveFrictionlessAction({
    userText: input,
    currentTurn: 2,
    lastAssistantText: lastAssistant,
  });
}

describe("visualTypeAvailability (P0.20.4 planned fallbacks)", () => {
  describe("flowchart (available — Cartography Process Flow)", () => {
    it("create request is not treated as planned/unavailable", () => {
      expect(resolveUnavailableVisualTypeReply("create a flowchart")).toBeNull();
    });

    it("extracts comma-separated steps after a label", () => {
      expect(extractFlowStepsFromContent("Onboarding: signup, email, kickoff call.")).toEqual(
        ["signup", "email", "kickoff call"],
      );
      expect(formatFlowOutline(["signup", "email", "kickoff call"])).toBe(
        "signup → email → kickoff call",
      );
    });
  });

  describe("diagram", () => {
    it("asks what the diagram should show", () => {
      const reply = buildPlannedVisualTypeFallbackReply("diagram");
      expect(reply).toMatch(/Diagrams aren't fully built into Visual Thinking yet/i);
      expect(reply).toMatch(/What are you trying to show\?/);
    });
  });

  describe("hierarchy tree", () => {
    it("asks for the top-level topic", () => {
      const reply = buildPlannedVisualTypeFallbackReply("hierarchy_tree");
      expect(reply).toMatch(/Hierarchy trees aren't fully built yet/i);
      expect(reply).toMatch(/What is the top-level topic\?/);
    });
  });

  describe("funnel map", () => {
    it("asks for funnel purpose", () => {
      const reply = buildPlannedVisualTypeFallbackReply("funnel_map");
      expect(reply).toMatch(/Funnel maps aren't fully built into Visual Thinking yet/i);
      expect(reply).toMatch(/What is the funnel for\?/);
    });
  });

  describe("frictionless routing guards", () => {
    it("create a flowchart opens Process Flow (not Create / Crystal Actions)", () => {
      const decision = plannedDecision("create a flowchart");
      expect(decision.immediateVisualOpen?.viewId).toBe("process-flow");
      expect(decision.category).toBe("direct_action");
      expect(decision.workspaceOffer?.section).not.toBe("content-generator");
      expect(matchCatalogFromText("create a flowchart")?.route).not.toBe(
        "content-generator",
      );
      expect(decision.suppressRelationship).toBe(true);
    });

    const plannedCases = ["create a diagram", "create a funnel map"];

    it.each(plannedCases)('"%s" does not open Visual Thinking or Create', (input) => {
      const decision = plannedDecision(input);
      expect(decision.immediateVisualOpen).toBeUndefined();
      expect(decision.workspaceOffer?.section).not.toBe("visual-focus");
      expect(decision.workspaceOffer?.section).not.toBe("content-generator");
      expect(decision.pendingAction?.type).not.toBe("create_pending");
      expect(matchCatalogFromText(input)?.route).not.toBe("content-generator");
      expect(decision.localReply).toMatch(/aren't fully built/i);
      expect(decision.suppressRelationship).toBe(true);
    });

    it("turn into flowchart with prior content opens Process Flow", () => {
      const prior = "Steps: research, outline, draft, publish.";
      const decision = plannedDecision("Turn this into a flowchart", prior);
      expect(decision.immediateVisualOpen?.viewId).toBe("process-flow");
      expect(decision.category).toBe("direct_action");
    });
  });
});

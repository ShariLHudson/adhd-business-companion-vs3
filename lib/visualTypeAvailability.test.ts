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
  describe("flowchart", () => {
    it("with no prior content asks for steps", () => {
      const reply = resolveUnavailableVisualTypeReply("create a flowchart");
      expect(reply).toMatch(/aren't fully built into Visual Thinking yet/i);
      expect(reply).toMatch(/What are the steps you want included\?/);
      expect(reply).toMatch(/Mind Map/);
    });

    it("with prior content drafts flow outline", () => {
      const prior = "Onboarding: signup, email, kickoff call.";
      const reply = resolveUnavailableVisualTypeReply("create a flowchart", {
        priorContent: prior,
      });
      expect(reply).toMatch(/turn those steps into a draft flow here/i);
      expect(reply).toContain("signup → email → kickoff call");
    });

    it("with unrelated prior question asks for steps instead of drafting", () => {
      const reply = resolveUnavailableVisualTypeReply("create a flowchart", {
        priorContent: "What process would you like the flowchart to show?",
      });
      expect(reply).toMatch(/What are the steps you want included\?/);
      expect(reply).not.toMatch(/→/);
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
    const cases = [
      "create a flowchart",
      "create a diagram",
      "create a hierarchy tree",
      "create a funnel map",
    ];

    it.each(cases)('"%s" does not open Visual Thinking or Create', (input) => {
      const decision = plannedDecision(input);
      expect(decision.immediateVisualOpen).toBeUndefined();
      expect(decision.workspaceOffer?.section).not.toBe("visual-focus");
      expect(decision.workspaceOffer?.section).not.toBe("content-generator");
      expect(decision.pendingAction?.type).not.toBe("create_pending");
      expect(matchCatalogFromText(input)?.route).not.toBe("content-generator");
      expect(decision.localReply).toMatch(/aren't fully built/i);
      expect(decision.suppressRelationship).toBe(true);
    });

    it("turn into flowchart with prior content drafts outline in chat", () => {
      const prior = "Steps: research, outline, draft, publish.";
      const decision = plannedDecision("Turn this into a flowchart", prior);
      expect(decision.immediateVisualOpen).toBeUndefined();
      expect(decision.localReply).toMatch(/research → outline → draft → publish/);
    });
  });
});

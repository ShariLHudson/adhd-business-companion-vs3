import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import {
  detectExplicitVisualView,
  isExplicitVisualStructureRequest,
  isVisualConversionRequest,
  needsVisualStructureRecommendation,
  VISUAL_THINKING_VIEW_LIBRARY,
} from "./visualThinkingStudio";
import { recommendVisualStructures } from "./visualRecommendationEngine";
import {
  isVisualStructureExecution,
  resolveVisualStructureRoute,
  resolveVisualStructureWorkspaceOffer,
} from "./visualStructureRouting";
import { getStudioCardByMode } from "./visualFocus/studioCards";
import { createVisualFocusMap } from "./visualFocus/templates";
import { buildVisualLayout } from "./visualFocus/visualLayout";

function routeAudit(input: string, lastAssistant?: string) {
  const routing = resolveIntentRouting({ userText: input });
  const frictionless = resolveFrictionlessAction({
    userText: input,
    currentTurn: 1,
    lastAssistantText: lastAssistant,
  });
  return { routing, frictionless };
}

describe("P0.20.2 Visual Thinking Reality Audit", () => {
  describe("Part 2 — Learn must NOT open Visual Thinking", () => {
    const learnCases = [
      "What is a flowchart?",
      "What is a flowchart and how is it used?",
      "How is a flowchart used?",
      "How are mind maps used?",
      "Why is a decision tree useful?",
      "When should I use a flowchart?",
      "What is a mind map?",
      "Explain decision trees.",
      "What is a hierarchy tree?",
      "What is a funnel map?",
    ];

    it.each(learnCases)('learn case: "%s"', (input) => {
      const { routing, frictionless } = routeAudit(input);
      expect(frictionless.immediateVisualOpen, `${input}: immediate open`).toBeUndefined();
      expect(
        frictionless.pendingAction?.type,
        `${input}: visual menu pending`,
      ).not.toBe("visual_thinking_menu");
      expect(
        frictionless.workspaceOffer?.section,
        `${input}: workspace offer`,
      ).not.toBe("visual-focus");
      expect(
        isVisualStructureExecution(input),
        `${input}: visual structure execution`,
      ).toBe(false);
      expect(
        resolveVisualStructureWorkspaceOffer(input),
        `${input}: visual workspace offer`,
      ).toBeNull();
    });
  });

  describe("Part 2b — knowledge classification", () => {
    it('"How is a flowchart used?" routes to learn, not visual', () => {
      const input = "How is a flowchart used?";
      expect(isKnowledgeQuestion(input)).toBe(true);
      expect(needsVisualStructureRecommendation(input)).toBe(false);
      expect(isExplicitVisualStructureRequest(input)).toBe(false);
    });

    it('"What is a flowchart?" is knowledge', () => {
      expect(isKnowledgeQuestion("What is a flowchart?")).toBe(true);
    });
  });

  describe("Part 3 — Available types open immediately", () => {
    const directCases: [string, string][] = [
      ["Create a mind map", "mind-map"],
      ["Open a mind map", "mind-map"],
      ["Build a decision tree", "decision-tree"],
    ];

    it.each(directCases)('"%s" → %s', (input, viewId) => {
      const { frictionless } = routeAudit(input);
      expect(frictionless.immediateVisualOpen?.viewId).toBe(viewId);
      expect(frictionless.localReply).toMatch(/Opening/i);
    });
  });

  describe("Part 3b — Planned types do not open", () => {
    const plannedCases = [
      "Create a flowchart",
      "Create a hierarchy tree",
      "Create a funnel map",
    ];

    it.each(plannedCases)('"%s" → planned message, no open', (input) => {
      const { frictionless } = routeAudit(input);
      expect(frictionless.immediateVisualOpen).toBeUndefined();
      expect(frictionless.localReply).toMatch(/aren't fully built/i);
    });
  });

  describe("Part 4 — Recommendation menu", () => {
    it("course launch offers menu not immediate", () => {
      const { frictionless } = routeAudit("I want to launch a course");
      expect(frictionless.immediateVisualOpen).toBeUndefined();
      expect(frictionless.pendingAction?.type).toBe("visual_recommendation");
      expect(frictionless.localReply).toMatch(/Recommended/i);
      expect(recommendVisualStructures("I want to launch a course").recommendations.map(
        (r) => r.visualType,
      )).toContain("project-map");
    });

    it("book writing offers menu", () => {
      const { frictionless } = routeAudit("I want to write a book");
      expect(frictionless.pendingAction?.type).toBe("visual_recommendation");
    });

    it("organize ideas offers menu", () => {
      const { frictionless } = routeAudit("Help me organize my ideas");
      expect(frictionless.pendingAction?.type).toBe("visual_recommendation");
    });
  });

  describe("Part 5 — Conversion uses prior content", () => {
    it("turn into flowchart is blocked when planned", () => {
      const prior = "Onboarding: signup, email, kickoff call.";
      const { frictionless } = routeAudit("Turn this into a flowchart", prior);
      expect(frictionless.immediateVisualOpen).toBeUndefined();
      expect(frictionless.localReply).toMatch(/aren't fully built/i);
    });

    it("turn into hierarchy is blocked when planned", () => {
      const { frictionless } = routeAudit(
        "Turn this into a hierarchy",
        "Book parts: intro, chapters, appendix.",
      );
      expect(frictionless.immediateVisualOpen).toBeUndefined();
    });

    it('visualize this defaults to mind-map', () => {
      const { frictionless } = routeAudit("Visualize this", "Ideas: A, B, C.");
      expect(frictionless.immediateVisualOpen?.viewId).toBe("mind-map");
    });
  });

  describe("Part 6 — ADHD boundaries not visual", () => {
    const adhdCases = [
      "I keep putting off my sales calls",
      "I keep procrastinating",
      "I'm overwhelmed",
      "I can't get started",
      "I need motivation",
      "I avoid follow-up",
      "I know what to do but won't do it",
      "I have too many ideas",
      "I don't know where to begin",
      "Why do I avoid sales calls?",
    ];

    it.each(adhdCases)('"%s"', (input) => {
      const { frictionless } = routeAudit(input);
      expect(frictionless.immediateVisualOpen).toBeUndefined();
      expect(frictionless.pendingAction?.type).not.toBe("visual_recommendation");
      expect(frictionless.pendingAction?.type).not.toBe("visual_thinking_menu");
      expect(frictionless.workspaceOffer?.section).not.toBe("visual-focus");
    });
  });

  describe("Part 1 — View implementation reality", () => {
    const availableViews = [
      { label: "Mind Map", viewId: "mind-map", phrase: "create a mind map", mode: "mind-map" },
      { label: "Decision Tree", viewId: "decision-tree", phrase: "create a decision tree", mode: "decision-tree" },
    ];

    it.each(availableViews)(
      "$label opens from chat",
      ({ viewId, phrase, mode }) => {
        const def = VISUAL_THINKING_VIEW_LIBRARY.find((v) => v.id === viewId);
        expect(def?.mode).toBe(mode);
        const { frictionless } = routeAudit(phrase);
        expect(frictionless.immediateVisualOpen).toBeTruthy();
      },
    );

    const plannedViews = [
      { label: "Flowchart", viewId: "process-flow", phrase: "create a flowchart" },
      { label: "Hierarchy Tree", viewId: "hierarchy-tree", phrase: "create a hierarchy tree" },
      { label: "Funnel Map", viewId: "funnel-map", phrase: "create a funnel map" },
    ];

    it.each(plannedViews)("$label is in library but blocked from chat open", ({ viewId, phrase }) => {
      expect(VISUAL_THINKING_VIEW_LIBRARY.find((v) => v.id === viewId)).toBeTruthy();
      const { frictionless } = routeAudit(phrase);
      expect(frictionless.immediateVisualOpen).toBeUndefined();
    });

    const aliasViews: { label: string; viewId: string; phrase: string; mode: string }[] = [
      { label: "Process Flow", viewId: "process-flow", phrase: "create a process flow", mode: "decision-tree" },
      { label: "Concept Map", viewId: "concept-map", phrase: "create a concept map", mode: "mind-map" },
      { label: "Customer Journey", viewId: "customer-journey-map", phrase: "create a customer journey map", mode: "relationship-map" },
      { label: "Timeline", viewId: "timeline", phrase: "create a timeline", mode: "project-map" },
      { label: "Roadmap", viewId: "roadmap", phrase: "create a roadmap", mode: "project-map" },
      { label: "Priority Matrix", viewId: "priority-matrix", phrase: "create a priority matrix", mode: "visual-kanban" },
      { label: "Overwhelm Map", viewId: "overwhelm-map", phrase: "create an overwhelm map", mode: "visual-kanban" },
    ];

    it.each(aliasViews)(
      "$label exists and maps to mode $mode",
      ({ viewId, mode }) => {
        const def = VISUAL_THINKING_VIEW_LIBRARY.find((v) => v.id === viewId);
        expect(def?.mode).toBe(mode);
        const map = createVisualFocusMap(mode as import("./visualFocus/types").VisualFocusMode);
        expect(buildVisualLayout(map).layoutKind).toBeTruthy();
      },
    );

    it("flowchart and process flow share decision-tree renderer (no dedicated flowchart mode)", () => {
      expect(detectExplicitVisualView("flowchart")?.mode).toBe("decision-tree");
      expect(getStudioCardByMode("decision-tree")?.title).toMatch(/Decision Tree/);
    });
  });
});

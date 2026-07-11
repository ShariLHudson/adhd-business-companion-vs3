import { beforeEach, describe, expect, it, vi } from "vitest";
import { inferCreateItemTypeFromText } from "./createPendingAction";
import { matchCatalogFromText } from "./createCatalog";
import { isRegistryArtifactExecution } from "./artifactRegistry";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import {
  buildVisualThinkingMenuOffer,
  detectExplicitVisualView,
  detectConversionTargetView,
  isExplicitVisualStructureRequest,
  isVisualConversionRequest,
  mapMenuSelectionToViewId,
  needsVisualStructureRecommendation,
  recommendVisualStructures,
  shouldRouteBusinessStrategyToCreate,
  studioModeForViewId,
} from "./visualThinkingStudio";
import {
  buildVisualThinkingMenuPendingAction,
  isVisualThinkingMenuOfferMessage,
  resolveVisualMenuSelection,
} from "./visualThinkingContinuation";
import {
  detectVisualStructureKind,
  isVisualStructureExecution,
  resolveVisualStructureRoute,
  resolveDecisionStructureWorkspaceOffer,
} from "./visualStructureRouting";

describe("visualThinkingStudio (P0.20)", () => {
  it("maps flowchart to process flow / decision-tree mode", () => {
    const view = detectExplicitVisualView("create a flowchart");
    expect(view?.id).toBe("process-flow");
    expect(studioModeForViewId("process-flow")).toBe("decision-tree");
  });

  it("Path B opens immediately for explicit structure requests", () => {
    const decision = resolveFrictionlessAction({
      userText: "open a mind map",
      currentTurn: 1,
    });
    expect(decision.immediateVisualOpen?.viewId).toBe("mind-map");
    expect(decision.localReply).toMatch(/Mind Map Discovery/i);
    expect(decision.pendingAction).toBeNull();
  });

  it("Path B recommends structures for course launch", () => {
    expect(needsVisualStructureRecommendation("I want to launch a course")).toBe(
      true,
    );
    const rec = recommendVisualStructures("I want to launch a course");
    expect(rec.recommended).toEqual(["project-map", "timeline"]);
    const offer = buildVisualThinkingMenuOffer("I want to launch a course");
    expect(offer.numberedOptions).toHaveLength(2);
    const decision = resolveFrictionlessAction({
      userText: "I want to launch a course",
      currentTurn: 1,
    });
    expect(decision.pendingAction?.type).toBe("visual_recommendation");
    expect(decision.localReply).toMatch(/I can visualize this a few ways/);
  });

  it("menu selection resolves numbered pick to view", () => {
    const pending = buildVisualThinkingMenuPendingAction({
      initialPrompt: "I want to launch a course",
      offeredAtTurn: 1,
    });
    const pick = resolveVisualMenuSelection("1", pending);
    expect(pick?.viewId).toBe("project-map");
    expect(mapMenuSelectionToViewId("Funnel Map", pending.menuOffer!)).toBe(
      "funnel-map",
    );
  });

  it("content conversion for planned flowchart is blocked", () => {
    expect(isVisualConversionRequest("turn this into a flowchart")).toBe(true);
    const decision = resolveFrictionlessAction({
      userText: "turn this into a flowchart",
      lastAssistantText:
        "Here is the onboarding sequence: signup, welcome email, kickoff call.",
      currentTurn: 3,
    });
    expect(decision.immediateVisualOpen).toBeUndefined();
    expect(decision.localReply).toMatch(/aren't fully built/i);
  });

  it("hierarchy conversion maps to hierarchy tree", () => {
    const view = detectConversionTargetView("make this a hierarchy");
    expect(view?.id).toBe("hierarchy-tree");
  });

  it("marketing strategy document still routes to Create not Visual Thinking", () => {
    const text = "help me create a marketing strategy";
    expect(shouldRouteBusinessStrategyToCreate(text)).toBe(true);
    expect(isExplicitVisualStructureRequest(text)).toBe(false);
    expect(resolveVisualStructureRoute(text)).toBeNull();
    const routing = resolveIntentRouting({ userText: text });
    expect(routing.workspaceOffer?.section).not.toBe("visual-focus");
  });

  it("decision comparison stays on Decision Compass", () => {
    const userText = "Should I launch the course or the membership?";
    expect(needsVisualStructureRecommendation(userText)).toBe(false);
    expect(resolveVisualStructureRoute(userText)).toBeNull();
    const offer = resolveDecisionStructureWorkspaceOffer(userText);
    expect(offer?.section).toBe("decision-compass");
  });

  it("visual structures never offer Create", () => {
    const cases = [
      "create a decision tree",
      "create a mind map",
    ] as const;
    for (const userText of cases) {
      expect(isRegistryArtifactExecution(userText)).toBe(false);
      expect(matchCatalogFromText(userText)).toBeNull();
      expect(inferCreateItemTypeFromText(userText)).toBeUndefined();
      const frictionless = resolveFrictionlessAction({ userText, currentTurn: 1 });
      expect(frictionless.workspaceOffer?.section).toBe("visual-focus");
      expect(frictionless.localReply).not.toMatch(/open Create/i);
    }
  });

  it("registers assistant visual menu offers", () => {
    const assistant =
      "I can visualize this a few ways.\n\nRecommended:\n1. Project Map — best for launch workstreams\n\nWhich one would help most?";
    expect(isVisualThinkingMenuOfferMessage(assistant)).toBe(true);
  });

  it("detects expanded view kinds", () => {
    expect(detectVisualStructureKind("create a funnel map")).toBe("funnel-map");
    expect(detectVisualStructureKind("build a hierarchy tree")).toBe(
      "hierarchy-tree",
    );
    expect(isVisualStructureExecution("open a timeline")).toBe(true);
  });
});

describe("visualThinkingContinuation storage", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), sessionStorage: storage });
    vi.stubGlobal("localStorage", storage);
  });

  it("saves visual thinking menu pending action", async () => {
    const { saveVisualThinkingMenuPending, loadVisualThinkingMenuPending } =
      await import("./visualThinkingContinuation");
    const pending = buildVisualThinkingMenuPendingAction({
      initialPrompt: "brain dump everything",
      offeredAtTurn: 2,
    });
    saveVisualThinkingMenuPending(pending);
    const loaded = loadVisualThinkingMenuPending();
    expect(loaded?.type).toBe("visual_recommendation");
    expect(loaded?.initialPrompt).toBe("brain dump everything");
  });
});

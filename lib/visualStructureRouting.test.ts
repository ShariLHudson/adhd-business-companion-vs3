import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";
import {
  detectVisualStructureKind,
  isVisualStructureExecution,
  resolveVisualStructureRoute,
  resolveDecisionStructureWorkspaceOffer,
} from "./visualStructureRouting";

describe("visualStructureRouting (P0.17.2 / P0.20.1)", () => {
  const availableCases = [
    ["create a decision tree", "decision-tree", "visual-focus"],
    ["build a decision tree", "decision-tree", "visual-focus"],
    ["create a mind map", "mind-map", "visual-focus"],
    ["help me make a mind map", "mind-map", "visual-focus"],
    ["visual map", "mind-map", "visual-focus"],
  ] as const;

  it.each(availableCases)(
    "routes %s to %s (%s)",
    (userText, kind, section) => {
      expect(detectVisualStructureKind(userText)).toBe(kind);
      expect(isVisualStructureExecution(userText)).toBe(true);
      expect(resolveVisualStructureRoute(userText)?.section).toBe(section);
      const frictionless = resolveFrictionlessAction({
        userText,
        currentTurn: 1,
      });
      expect(frictionless.immediateVisualOpen?.viewId).toBe(kind);
    },
  );

  const plannedCases = [
    "create a flowchart",
    "create a hierarchy tree",
    "create a funnel map",
  ] as const;

  it.each(plannedCases)('planned type "%s" does not execute', (userText) => {
    expect(isVisualStructureExecution(userText)).toBe(false);
    expect(resolveVisualStructureRoute(userText)).toBeNull();
    const frictionless = resolveFrictionlessAction({ userText, currentTurn: 1 });
    expect(frictionless.immediateVisualOpen).toBeUndefined();
    expect(frictionless.localReply).toMatch(/aren't fully built/i);
  });

  it("concept map and project map still route when not in planned registry", () => {
    for (const userText of ["concept map", "project map"]) {
      expect(isVisualStructureExecution(userText)).toBe(true);
    }
  });

  it("routes decision comparison to Decision Compass", () => {
    const userText = "Should I launch the course or the membership?";
    expect(resolveVisualStructureRoute(userText)).toBeNull();
    const offer = resolveDecisionStructureWorkspaceOffer(userText);
    expect(offer?.section).toBe("decision-compass");
    const routing = resolveIntentRouting({ userText });
    expect(routing.workspaceOffer?.section).toBe("decision-compass");
  });

  it("never offers Create for decision tree execution", () => {
    const decision = resolveFrictionlessAction({
      userText: "I need to create a decision tree",
      currentTurn: 2,
    });
    expect(decision.workspaceOffer?.section).toBe("visual-focus");
    expect(decision.immediateVisualOpen?.viewId).toBe("decision-tree");
    expect(decision.localReply).not.toMatch(/open Create/i);
  });
});

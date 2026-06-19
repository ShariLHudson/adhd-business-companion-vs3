import { describe, expect, it } from "vitest";
import {
  advanceDecisionCompass,
  buildDecisionMindMap,
  computeDecisionResult,
  emptyDecisionCompassState,
  setDecisionType,
  stateFromDecisionCompassPrefill,
  suggestDecisionType,
} from "./decisionCompass";

describe("decisionCompass", () => {
  it("suggests strategic type for hire decisions", () => {
    expect(
      suggestDecisionType("Should I hire a VA or keep doing it myself?"),
    ).toBe("strategic");
  });

  it("suggests emotional type for client boundaries", () => {
    expect(suggestDecisionType("Should I leave this client?")).toBe("emotional");
  });

  it("walks action path to result", () => {
    let state = emptyDecisionCompassState();
    state = advanceDecisionCompass(state, { decision: "Marketing or sales?" });
    state = advanceDecisionCompass(state, {
      options: "Marketing\n---\nSales",
    });
    state = setDecisionType(state, "action");
    state = advanceDecisionCompass(state);
    state = advanceDecisionCompass(state, { "first-hour-a": "Write one email" });
    state = advanceDecisionCompass(state, { "first-hour-b": "Call one lead" });
    state = advanceDecisionCompass(state, { clearer: "A" });
    state = advanceDecisionCompass(state, { momentum: "A" });
    const result = computeDecisionResult(state);
    expect(result?.headline).toBe("Best Next Action");
    expect(result?.choice).toBe("Marketing");
  });

  it("seeds state from chat prefill with two options", () => {
    const seeded = stateFromDecisionCompassPrefill({
      decision: "should I hire or wait?",
      optionA: "hire now",
      optionB: "wait six months",
    });
    expect(seeded.state.stepIndex).toBe(2);
    expect(seeded.optionA).toBe("hire now");
    expect(seeded.optionB).toBe("wait six months");
    expect(seeded.state.answers.decision).toBe("should I hire or wait?");
  });

  it("builds mind map with Reason and Concern under each option", () => {
    let state = emptyDecisionCompassState();
    state = {
      ...state,
      decisionType: "strategic",
      answers: {
        decision: "Hire or wait?",
        options: "Hire a VA\n---\nWait six months",
        "why-a": "More capacity",
        "why-b": "Save cash",
        "concern-a": "Cost",
        "concern-b": "Falling behind",
      },
      complete: false,
    };
    const map = buildDecisionMindMap(state);
    const strategic = map.children?.[0];
    const branchA = strategic?.children?.find((c) => c.id === "opt-a");
    const branchB = strategic?.children?.find((c) => c.id === "opt-b");
    expect(branchA?.label).toBe("Hire a VA");
    expect(branchB?.label).toBe("Wait six months");
    expect(branchA?.children?.map((c) => c.label)).toEqual([
      "Reason: More capacity",
      "Concern: Cost",
    ]);
    expect(branchB?.children?.map((c) => c.label)).toEqual([
      "Reason: Save cash",
      "Concern: Falling behind",
    ]);
  });
});

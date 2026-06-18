import { describe, expect, it } from "vitest";
import {
  advanceDecisionCompass,
  buildDecisionMindMap,
  computeDecisionResult,
  emptyDecisionCompassState,
  setDecisionType,
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

  it("builds mind map with answered nodes", () => {
    let state = emptyDecisionCompassState();
    state = {
      ...state,
      decisionType: "action",
      answers: {
        decision: "Pick a focus",
        options: "Write\n---\nRecord",
        "first-hour-a": "Outline post",
        clearer: "A",
      },
      complete: false,
    };
    const map = buildDecisionMindMap(state);
    expect(map.label).toBe("Pick a focus");
    expect(map.children?.some((c) => c.id === "action")).toBe(true);
  });
});

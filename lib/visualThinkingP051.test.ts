import { describe, expect, it } from "vitest";
import {
  createPriorityMatrixKanban,
  quadrantForScores,
} from "./visualFocus/priorityMatrix";
import { createVisualFocusMap } from "./visualFocus/templates";
import { homeTypeIdForViewId } from "./visualThinkingHome";

describe("priorityMatrix P0.51", () => {
  it("places high impact low effort in quick wins", () => {
    expect(quadrantForScores(5, 1)).toBe("quick-wins");
    expect(quadrantForScores(3, 2)).toBe("quick-wins");
  });

  it("places low impact high effort in avoid", () => {
    expect(quadrantForScores(1, 5)).toBe("avoid");
  });

  it("creates four quadrant columns", () => {
    const { columns } = createPriorityMatrixKanban("vf-test");
    expect(columns).toHaveLength(4);
    expect(columns.map((c) => c.label)).toEqual([
      "Quick Wins",
      "Major Projects",
      "Fill-In Tasks",
      "Avoid",
    ]);
  });

  it("seeds priority matrix maps with quadrant columns", () => {
    const map = createVisualFocusMap("visual-kanban", undefined, "priority-matrix");
    expect(map.homeTypeId).toBe("priority-matrix");
    expect(map.kanban?.columns).toHaveLength(4);
    expect(map.title).toBe("Priority Matrix");
  });
});

describe("visualThinkingHome view alignment P0.51", () => {
  it("maps priority-matrix view to priority-matrix home type", () => {
    expect(homeTypeIdForViewId("priority-matrix")).toBe("priority-matrix");
  });

  it("maps funnel-map view to sales-funnel home type", () => {
    expect(homeTypeIdForViewId("funnel-map")).toBe("sales-funnel");
  });
});

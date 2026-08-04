import { describe, expect, it } from "vitest";
import {
  goalPickerCategory,
  groupGoalsForPicker,
  filterGoalPickerGroups,
} from "./goalPickerGroups";
import type { OutcomeGoal } from "./outcomeGoals";

function mockGoal(
  overrides: Partial<OutcomeGoal> & { id: string; statement: string },
): OutcomeGoal {
  return {
    metric: "Revenue",
    metricKind: "revenue",
    trackingTypeId: "revenue",
    targetValue: 10000,
    deadline: "2026-12-31",
    definitionOfDone: "Done",
    supportingActivities: [],
    manualProgress: 0,
    progressLogs: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("goalPickerGroups P0.50", () => {
  it("groups goals by category label", () => {
    const groups = groupGoalsForPicker([
      mockGoal({ id: "g1", statement: "Hit $10k", trackingTypeId: "revenue" }),
      mockGoal({ id: "g2", statement: "100 members", trackingTypeId: "members" }),
    ]);
    expect(groups.some((g) => g.category === "Revenue Goals")).toBe(true);
    expect(groups.some((g) => g.category === "Membership Goals")).toBe(true);
  });

  it("filters groups by search query", () => {
    const groups = groupGoalsForPicker([
      mockGoal({ id: "g1", statement: "Launch podcast", trackingTypeId: "content_pieces" }),
      mockGoal({ id: "g2", statement: "Revenue goal", trackingTypeId: "revenue" }),
    ]);
    const filtered = filterGoalPickerGroups(groups, "podcast");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.goals[0]?.id).toBe("g1");
  });

  it("maps tracking types to readable categories", () => {
    expect(
      goalPickerCategory(
        mockGoal({ id: "g1", statement: "x", trackingTypeId: "weight" }),
      ),
    ).toBe("Health Goals");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildActionHistory,
  computeActionHistoryStats,
  reconcileActionStatuses,
} from "./actionHistory";
import type { FounderAction } from "./actionTypes";

describe("actionHistory", () => {
  const events = [
    {
      id: "e1",
      founderId: "founder-001",
      type: "action.offered" as const,
      ts: "2026-06-09T10:00:00.000Z",
      data: { actionId: "a1", title: "Draft SOP", actionType: "open-create" },
    },
    {
      id: "e2",
      founderId: "founder-001",
      type: "action.completed" as const,
      ts: "2026-06-09T11:00:00.000Z",
      data: { actionId: "a1", title: "Draft SOP" },
    },
    {
      id: "e3",
      founderId: "founder-001",
      type: "action.dismissed" as const,
      ts: "2026-06-08T11:00:00.000Z",
      data: { actionId: "a2", title: "Schedule focus" },
    },
  ];

  it("builds history from action events", () => {
    const history = buildActionHistory(events);
    expect(history).toHaveLength(3);
    expect(history.find((h) => h.status === "completed")?.actionId).toBe("a1");
  });

  it("reconciles action statuses from events", () => {
    const actions: FounderAction[] = [
      {
        id: "a1",
        title: "Draft SOP",
        description: "",
        actionType: "open-create",
        priority: "high",
        workspace: {
          section: "content-generator",
          ecosystemKind: "create",
        },
        prefill: {},
        status: "offered",
        sourceEventIds: [],
        createdAt: "2026-06-09T09:00:00.000Z",
      },
    ];
    const merged = reconcileActionStatuses(actions, events);
    expect(merged[0]?.status).toBe("completed");
  });

  it("computes history stats", () => {
    const stats = computeActionHistoryStats(events);
    expect(stats.completed).toBe(1);
    expect(stats.dismissed).toBe(1);
  });
});

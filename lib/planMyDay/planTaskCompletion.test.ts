import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  completePlanItem,
  getPlanCompletionHistory,
  resetPlanCompletionForTests,
  shouldElevateToEvidenceBank,
  PLAN_COMPLETION_TOAST,
} from "./planTaskCompletion";
import type { PlanDayItem } from "./types";

const lsStore: Record<string, string> = {};

describe("planTaskCompletion", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => lsStore[k] ?? null,
      setItem: (k: string, v: string) => {
        lsStore[k] = v;
      },
      removeItem: (k: string) => {
        delete lsStore[k];
      },
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: globalThis.localStorage });
    resetPlanCompletionForTests();
    Object.keys(lsStore).forEach((k) => delete lsStore[k]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const item: PlanDayItem = {
    id: "task-1",
    title: "Finish newsletter",
    column: "doing",
    done: false,
    category: "business",
  };

  it("removes completed task from active list and records history", () => {
    const result = completePlanItem([item], "task-1", { sourceWorkspace: "kanban" });
    expect(result).not.toBeNull();
    expect(result!.items).toHaveLength(0);
    expect(result!.toast).toContain("Nice work");
    expect(result!.toast).toContain("Finish newsletter");
    expect(PLAN_COMPLETION_TOAST).toContain("Nice work");
    expect(getPlanCompletionHistory()).toHaveLength(1);
    expect(getPlanCompletionHistory()[0]?.taskName).toBe("Finish newsletter");
  });

  it("does not auto-elevate routine tasks to evidence bank", () => {
    const routine: PlanDayItem = {
      id: "r1",
      title: "Water plants",
      column: "ready",
      done: false,
      category: "personal",
    };
    expect(shouldElevateToEvidenceBank(routine)).toBe(false);
  });

  it("elevates significant business and project tasks", () => {
    expect(shouldElevateToEvidenceBank({ ...item, projectId: "proj-1" })).toBe(true);
    expect(
      shouldElevateToEvidenceBank({
        ...item,
        title: "Publish launch announcement",
        category: "business",
      }),
    ).toBe(true);
  });
});

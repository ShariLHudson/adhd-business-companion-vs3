/**
 * PlanMyDayCompleteWorkflow — "Adjust This Plan" must stay inside Plan My Day.
 * It must never share a handler with "Adapt My Day" (regression for the
 * duplicate-button bug where both actions opened Adapt My Day).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => memory.clear(),
});

import { PlanMyDayCompleteWorkflow } from "./PlanMyDayCompleteWorkflow";
import {
  clearPlanWorkflowStateForTests,
  emptyPlanWorkflowState,
  savePlanWorkflowState,
} from "@/lib/planMyDay/completePlanWorkflow";
import { todayStr } from "@/lib/companionStore";
import type { PlanDayItem } from "@/lib/planMyDay/types";

const sample: PlanDayItem[] = [
  { id: "1", title: "Write proposal", column: "today", done: false },
];

function seedPlannedWorkflow() {
  savePlanWorkflowState({
    ...emptyPlanWorkflowState(todayStr()),
    stage: "planned",
    primaryOutcomeId: "1",
    orderedTaskIds: ["1"],
  });
}

describe("PlanMyDayCompleteWorkflow — Adjust This Plan stays in Plan My Day", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    memory.clear();
    clearPlanWorkflowStateForTests();
    seedPlannedWorkflow();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("does not open Adapt My Day when Adjust This Plan is clicked", () => {
    const onOpenAdapt = vi.fn();
    act(() => {
      root.render(
        <PlanMyDayCompleteWorkflow
          items={sample}
          onItemsChange={() => undefined}
          onOpenAdapt={onOpenAdapt}
          onImStuck={() => undefined}
        />,
      );
    });

    const adjustBtn = container.querySelector(
      "[data-testid='plan-day-adjust-plan']",
    ) as HTMLButtonElement;
    expect(adjustBtn).toBeTruthy();
    expect(adjustBtn.textContent).toContain("Adjust This Plan");

    act(() => {
      adjustBtn.click();
    });

    expect(onOpenAdapt).not.toHaveBeenCalled();
  });

  it("reveals the in-place Time and Energy Fit adjuster on the same screen", () => {
    act(() => {
      root.render(
        <PlanMyDayCompleteWorkflow
          items={sample}
          onItemsChange={() => undefined}
          onOpenAdapt={() => undefined}
          onImStuck={() => undefined}
        />,
      );
    });

    expect(
      container.querySelector("[data-testid='plan-day-section-constraints']"),
    ).toBeNull();

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-adjust-plan']",
        ) as HTMLButtonElement
      ).click();
    });

    expect(
      container.querySelector("[data-testid='plan-day-section-constraints']"),
    ).toBeTruthy();
  });

  it("keeps a distinct Adapt My Day action that still opens Adapt My Day", () => {
    const onOpenAdapt = vi.fn();
    act(() => {
      root.render(
        <PlanMyDayCompleteWorkflow
          items={sample}
          onItemsChange={() => undefined}
          onOpenAdapt={onOpenAdapt}
          onImStuck={() => undefined}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-adapt-my-day']",
        ) as HTMLButtonElement
      ).click();
    });

    expect(onOpenAdapt).toHaveBeenCalledTimes(1);
  });
});

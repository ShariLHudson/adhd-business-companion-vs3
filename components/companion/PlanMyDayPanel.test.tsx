/**
 * Plan My Day panel — the active member-facing path.
 *
 * `PlanMyDayPanel` is always mounted with `standalone` from
 * `CompanionPageClient`, so the `standalone` branch (which renders
 * `ProgressivePlanMyDay`) is the only path members ever see. This guards:
 *  - that the active path stays `ProgressivePlanMyDay` (not the legacy
 *    `PlanDayLivingBoard` / `PlanMyDayCompleteWorkflow` non-standalone body)
 *  - that "Adapt Today" is reachable and wired to `onOpenAdaptMyDay` —
 *    a separate entry point from in-place plan adjustments, never a
 *    silent no-op.
 *
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanMyDayPanel } from "@/components/companion/PlanMyDayPanel";
import { saveTodayPlanItems } from "@/lib/planMyDay";
import { saveProgressivePlanState } from "@/lib/planMyDay/progressivePlanFlow";
import { todayStr } from "@/lib/companionStore";

describe("PlanMyDayPanel — standalone (active path)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
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

  it("renders the progressive flow, not the legacy living board", () => {
    act(() => {
      root.render(<PlanMyDayPanel standalone />);
    });
    expect(
      container.querySelector("[data-testid='plan-day-progressive']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-my-day-complete-workflow']"),
    ).toBeNull();
  });

  it("wires Adapt Today to onOpenAdaptMyDay as a separate entry from in-place adjustments", () => {
    saveTodayPlanItems([
      {
        id: "1",
        title: "Write proposal",
        column: "today",
        done: false,
        flexible: true,
      },
    ]);
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });

    const onOpenAdaptMyDay = vi.fn();
    act(() => {
      root.render(
        <PlanMyDayPanel standalone onOpenAdaptMyDay={onOpenAdaptMyDay} />,
      );
    });

    expect(
      container.querySelector("[data-testid='plan-day-progressive-today']"),
    ).toBeTruthy();

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-more-menu-toggle']",
        ) as HTMLButtonElement
      ).click();
    });

    const adaptButton = container.querySelector(
      "[data-testid='plan-day-more-adapt']",
    ) as HTMLButtonElement | null;
    expect(adaptButton).toBeTruthy();
    expect(adaptButton?.textContent).toBe("Adapt Today");

    act(() => {
      adaptButton?.click();
    });

    expect(onOpenAdaptMyDay).toHaveBeenCalledTimes(1);
  });

  it("without onOpenAdaptMyDay, More menu never silently claims an Adapt option", () => {
    saveTodayPlanItems([
      {
        id: "1",
        title: "Write proposal",
        column: "today",
        done: false,
        flexible: true,
      },
    ]);
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });

    act(() => {
      root.render(<PlanMyDayPanel standalone />);
    });

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-more-menu-toggle']",
        ) as HTMLButtonElement
      ).click();
    });

    expect(
      container.querySelector("[data-testid='plan-day-more-adapt']"),
    ).toBeNull();
  });
});

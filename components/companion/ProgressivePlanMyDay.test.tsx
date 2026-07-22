/**
 * Progressive Plan My Day stage journey.
 * @vitest-environment jsdom
 */
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProgressivePlanMyDay } from "@/components/companion/ProgressivePlanMyDay";
import {
  clearProgressivePlanStateForTests,
  saveProgressivePlanState,
  writeEnergyBaseline,
} from "@/lib/planMyDay/progressivePlanFlow";
import { todayStr } from "@/lib/companionStore";
import { saveTodayPlanItems, type PlanDayItem } from "@/lib/planMyDay";

const sample: PlanDayItem[] = [
  {
    id: "1",
    title: "Write Proposal",
    column: "today",
    done: false,
    flexible: true,
  },
];

function setInputValue(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
) {
  if (!el) return;
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value",
  )?.set;
  act(() => {
    setter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/**
 * Mirrors how a real host (PlanMyDayPanel) wires ProgressivePlanMyDay —
 * items live in the parent and flow back down as a fresh prop, so an
 * added item is visible on the very next render (no extra "build" step).
 */
function ProgressiveHarness({
  initialItems,
}: {
  initialItems: PlanDayItem[];
}) {
  const [items, setItems] = useState<PlanDayItem[]>(initialItems);
  return <ProgressivePlanMyDay items={items} onItemsChange={setItems} />;
}

describe("ProgressivePlanMyDay", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    clearProgressivePlanStateForTests();
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

  it("step 1 shows greeting and mind capture only", () => {
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={[]}
          onItemsChange={() => undefined}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='plan-day-progressive-mind']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-good-morning']"),
    ).toBeTruthy();
    expect(container.textContent).toContain("What's on your mind today?");
    expect(
      container.querySelector("[data-testid='plan-day-already-know']"),
    ).toBeTruthy();
    expect(container.textContent).not.toMatch(/Motivation|Planning style/i);
  });

  it("I already know advances to anything-else", () => {
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={[]}
          onItemsChange={() => undefined}
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-already-know']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector(
        "[data-testid='plan-day-progressive-anything-else']",
      ),
    ).toBeTruthy();
    expect(container.textContent).toContain(
      "Does anything else need to happen today?",
    );
    expect(
      container.querySelector("[data-testid='plan-day-add-something']"),
    ).toBeTruthy();
  });

  it("list stage has no always-visible edit/trash", () => {
    saveProgressivePlanState({
      date: todayStr(),
      stage: "list",
    });
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={sample}
          onItemsChange={() => undefined}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='plan-day-progressive-list']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-drag-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-simple-edit-1']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-simple-delete-1']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-add-item']"),
    ).toBeTruthy();
  });

  it("energy step offers still-the-same when baseline exists", () => {
    writeEnergyBaseline("steady", "2026-07-20");
    saveProgressivePlanState({
      date: todayStr(),
      stage: "energy",
      usableMinutes: 120,
    });
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={sample}
          onItemsChange={() => undefined}
        />,
      );
    });
    expect(
      container.querySelector(
        "[data-testid='plan-day-energy-same-question']",
      )?.textContent,
    ).toMatch(/Still about the same/);
    expect(
      container.querySelector("[data-testid='plan-day-no-motivation-screen']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-no-style-ask']"),
    ).toBeTruthy();
    expect(container.textContent).not.toMatch(/Motivation/);
  });

  it("today stage is a single TODAY timeline with More menu", () => {
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={sample}
          onItemsChange={() => undefined}
          onOpenAdapt={() => undefined}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='plan-day-progressive-today']"),
    ).toBeTruthy();
    expect(container.textContent).toContain("TODAY");
    expect(
      container.querySelector("[data-testid='plan-day-start-next']"),
    ).toBeTruthy();
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-more-menu-toggle']",
        ) as HTMLButtonElement
      ).click();
    });
    const menu = container.querySelector(
      "[data-testid='plan-day-secondary-more-menu']",
    );
    expect(menu?.textContent).toContain("Adapt Today");
    expect(menu?.textContent).toContain("Optimize My Day");
    expect(menu?.textContent).toContain("I'm Stuck");
    expect(container.textContent).not.toMatch(
      /Matched to Energy|Suggested Order|Waiting/,
    );
  });

  it("Adjust This Plan never calls onOpenAdapt (Adjust ≠ Adapt My Day)", () => {
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    const onOpenAdapt = () => {
      throw new Error(
        "Adjust This Plan must never route to Adapt My Day",
      );
    };
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={sample}
          onItemsChange={() => undefined}
          onOpenAdapt={onOpenAdapt}
        />,
      );
    });

    const adjustButton = container.querySelector(
      "[data-testid='plan-day-adjust-plan']",
    ) as HTMLButtonElement | null;
    expect(adjustButton).toBeTruthy();
    expect(adjustButton?.textContent).toBe("Adjust This Plan");

    // Clicking Adjust This Plan must not throw (i.e. must not call onOpenAdapt)
    // and must produce visible, in-place feedback — never a silent no-op.
    expect(() => {
      act(() => {
        adjustButton?.click();
      });
    }).not.toThrow();

    expect(
      container.querySelector("[data-testid='plan-day-adjust-plan-active']"),
    ).toBeTruthy();
    expect(adjustButton?.textContent).toBe("Done Adjusting");

    // The More menu's separate Adapt Today entry is untouched — a distinct,
    // optional path with a different label than Adjust This Plan.
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-more-menu-toggle']",
        ) as HTMLButtonElement
      ).click();
    });
    const adaptButton = container.querySelector(
      "[data-testid='plan-day-more-adapt']",
    );
    expect(adaptButton?.textContent).toBe("Adapt Today");
  });

  it("Adjust This Plan reveals per-item edit/delete actions in place, on the visible list", () => {
    const twoItems: PlanDayItem[] = [
      { id: "1", title: "Write Proposal", column: "today", done: false, flexible: true },
      { id: "2", title: "Call client", column: "today", done: false, flexible: true },
    ];
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={twoItems}
          onItemsChange={() => undefined}
        />,
      );
    });

    // Before Adjust This Plan is opened, per-item action rows aren't forced open.
    expect(
      container.querySelector("[data-testid='plan-day-card-actions-1']"),
    ).toBeNull();

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-adjust-plan']",
        ) as HTMLButtonElement
      ).click();
    });

    // Adjust This Plan opens the same list the member sees — no navigation —
    // and reveals edit/delete for every item in place.
    expect(
      container.querySelector("[data-testid='plan-day-card-actions-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-action-edit-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-move-up-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-move-down-1']"),
    ).toBeTruthy();
  });

  it("move up/down on the today timeline reorders items and persists", () => {
    const twoItems: PlanDayItem[] = [
      { id: "1", title: "Write Proposal", column: "today", done: false, flexible: true, sortOrder: 1 },
      { id: "2", title: "Call client", column: "today", done: false, flexible: true, sortOrder: 2 },
    ];
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    let latest: PlanDayItem[] = twoItems;
    act(() => {
      root.render(
        <ProgressivePlanMyDay
          items={twoItems}
          onItemsChange={(next) => {
            latest = next;
          }}
        />,
      );
    });

    // Move Up / Move Down are visible directly on the item — no menu needed.
    const moveDownFirst = container.querySelector(
      "[data-testid='plan-day-move-down-1']",
    ) as HTMLButtonElement | null;
    expect(moveDownFirst).toBeTruthy();

    act(() => {
      moveDownFirst?.click();
    });

    expect(latest.find((i) => i.id === "1")?.sortOrder).toBe(2);
    expect(latest.find((i) => i.id === "2")?.sortOrder).toBe(1);
  });

  it("anything-else stage shows items already captured immediately — no waiting for the list step", () => {
    // Matches production: the host loads/persists today's items before this
    // component mounts, so storage and the `items` prop already agree.
    saveTodayPlanItems(sample);
    act(() => {
      root.render(<ProgressiveHarness initialItems={sample} />);
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-already-know']",
        ) as HTMLButtonElement
      ).click();
    });

    // The item captured before this step is already visible — not hidden
    // until the member reaches the "list" stage.
    expect(container.textContent).toContain("Write Proposal");

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-add-something']",
        ) as HTMLButtonElement
      ).click();
    });
    setInputValue(
      container.querySelector(
        "[data-testid='plan-day-simple-input']",
      ) as HTMLInputElement,
      "Call the vet",
    );
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-simple-add-button']",
        ) as HTMLButtonElement
      ).click();
    });

    // Added item appears right away, on this same screen.
    expect(container.textContent).toContain("Call the vet");
  });

  it("today stage lets members add another item and see it immediately — no Archive/rebuild required", () => {
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    act(() => {
      root.render(<ProgressiveHarness initialItems={sample} />);
    });

    expect(container.textContent).not.toContain("Call the vet");
    expect(
      container.querySelector("[data-testid='plan-day-today-add-item']"),
    ).toBeTruthy();

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-today-add-item']",
        ) as HTMLButtonElement
      ).click();
    });
    setInputValue(
      container.querySelector(
        "[data-testid='plan-day-simple-input']",
      ) as HTMLInputElement,
      "Call the vet",
    );
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-simple-add-button']",
        ) as HTMLButtonElement
      ).click();
    });

    // Visible immediately in the TODAY list — no Archive / Start Fresh,
    // no re-answering usable time or energy, no rebuild.
    expect(container.textContent).toContain("Call the vet");
    expect(
      container.querySelector("[data-testid='plan-day-progressive-today']"),
    ).toBeTruthy();
    // Add form collapses back to the calm control, ready for the next add.
    expect(
      container.querySelector("[data-testid='plan-day-today-add-item']"),
    ).toBeTruthy();
  });

  it("Optimize My Day always gives visible feedback — never a silent no-op", () => {
    const locked: PlanDayItem = {
      id: "lock-1",
      title: "9am doctor appointment",
      column: "today",
      done: false,
      startTime: "09:00",
      flexible: false,
      sourceTimeBlockId: "tb-1",
    };
    const flexA: PlanDayItem = {
      id: "flex-a",
      title: "Reply to emails",
      column: "today",
      done: false,
      flexible: true,
      priority: "low",
      sortOrder: 2,
    };
    const flexB: PlanDayItem = {
      id: "flex-b",
      title: "Draft the quarterly report",
      column: "today",
      done: false,
      flexible: true,
      priority: "high",
      sortOrder: 3,
    };
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    act(() => {
      root.render(
        <ProgressiveHarness initialItems={[locked, flexA, flexB]} />,
      );
    });

    const optimizeButton = container.querySelector(
      "[data-testid='plan-day-optimize-inline']",
    ) as HTMLButtonElement | null;
    expect(optimizeButton).toBeTruthy();

    act(() => {
      optimizeButton?.click();
    });

    // Every click produces an honest, visible message — never nothing.
    const notice = container.querySelector(
      "[data-testid='plan-day-optimize-notice']",
    );
    expect(notice).toBeTruthy();
    expect(notice?.textContent).toBeTruthy();

    // Clicking again once already optimized still gives feedback, honestly
    // saying nothing needed to change (not a repeat of the first message).
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-optimize-inline']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector("[data-testid='plan-day-optimize-notice']")
        ?.textContent,
    ).toMatch(/already in a good order/i);
  });

  it("Optimize My Day is explained in plain language near the control and in the More menu", () => {
    saveProgressivePlanState({
      date: todayStr(),
      stage: "today",
      usableMinutes: 240,
      energy: "steady",
    });
    act(() => {
      root.render(<ProgressiveHarness initialItems={[...sample]} />);
    });

    expect(container.textContent).toMatch(
      /Reorders your flexible tasks around fixed times/i,
    );

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-more-menu-toggle']",
        ) as HTMLButtonElement
      ).click();
    });
    const optimizeMenuItem = container.querySelector(
      "[data-testid='plan-day-more-optimize']",
    );
    expect(optimizeMenuItem?.textContent).toMatch(
      /Reorder flexible tasks around your fixed times/i,
    );
  });
});

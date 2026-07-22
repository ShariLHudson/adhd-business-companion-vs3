/**
 * PlanDaySimpleList calm list — drag handle + more menu, no always-visible edit/trash.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanDaySimpleList } from "@/components/companion/PlanDaySimpleList";
import type { PlanDayItem } from "@/lib/planMyDay";

const items: PlanDayItem[] = [
  {
    id: "1",
    title: "Write Proposal",
    column: "today",
    done: false,
    flexible: true,
    sortOrder: 1,
  },
  {
    id: "lock",
    title: "Team standup",
    column: "today",
    done: false,
    sourceTimeBlockId: "tb-1",
    startTime: "10:00",
    flexible: false,
    sortOrder: 2,
  },
];

describe("PlanDaySimpleList reorder calm path", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it("shows drag handle for flexible and lock for appointments", () => {
    act(() => {
      root.render(
        <PlanDaySimpleList
          mode="calm-list"
          items={items}
          onReorder={() => undefined}
          onComplete={() => undefined}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='plan-day-drag-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-lock-lock']"),
    ).toBeTruthy();
    // No always-visible pencil/trash icons
    expect(
      container.querySelector("[data-testid='plan-day-simple-edit-1']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-simple-delete-1']"),
    ).toBeNull();
  });

  it("more menu exposes Move Up without drag", () => {
    const onMoveUp = vi.fn();
    act(() => {
      root.render(
        <PlanDaySimpleList
          mode="calm-list"
          items={items}
          onMoveUp={onMoveUp}
          onMoveDown={() => undefined}
          onComplete={() => undefined}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-more-1']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector("[data-testid='plan-day-more-menu-1']"),
    ).toBeTruthy();
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-menu-move-up-1']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(onMoveUp).toHaveBeenCalledWith("1");
  });

  it("shows Move Up/Move Down directly on the item — visible affordance, not buried only in the ⋯ menu", () => {
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();
    act(() => {
      root.render(
        <PlanDaySimpleList
          mode="calm-list"
          items={items}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onComplete={() => undefined}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });

    // Visible directly on the row — no need to open the "⋯" menu first.
    const moveUp = container.querySelector(
      "[data-testid='plan-day-move-up-1']",
    ) as HTMLButtonElement | null;
    const moveDown = container.querySelector(
      "[data-testid='plan-day-move-down-1']",
    ) as HTMLButtonElement | null;
    expect(moveUp).toBeTruthy();
    expect(moveDown).toBeTruthy();

    // First item can't move up further.
    expect(moveUp?.disabled).toBe(true);
    expect(moveDown?.disabled).toBe(false);

    act(() => {
      moveDown?.click();
    });
    expect(onMoveDown).toHaveBeenCalledWith("1");

    // Locked (appointment) items never get move controls.
    expect(
      container.querySelector("[data-testid='plan-day-move-up-lock']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-move-down-lock']"),
    ).toBeNull();
  });

  it("forceExpandActions reveals every item's action row without per-item tapping (Adjust This Plan)", () => {
    act(() => {
      root.render(
        <PlanDaySimpleList
          mode="timeline"
          title="TODAY"
          items={items}
          forceExpandActions
          onEdit={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='plan-day-card-actions-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-action-edit-1']"),
    ).toBeTruthy();
  });

  it("timeline mode titles TODAY and expands actions on tap", () => {
    act(() => {
      root.render(
        <PlanDaySimpleList
          mode="timeline"
          title="TODAY"
          items={items}
          onEdit={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });
    expect(container.textContent).toContain("TODAY");
    expect(
      container.querySelector("[data-testid='plan-day-card-actions-1']"),
    ).toBeNull();
    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-card-1']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container.querySelector("[data-testid='plan-day-card-actions-1']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-action-edit-1']"),
    ).toBeTruthy();
  });
});

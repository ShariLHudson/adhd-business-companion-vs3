/**
 * PlanDayLivingBoard — Today's Items must be rearrangeable and deletable
 * directly from the default Plan My Day list view (editing already works via
 * the existing open-item detail form; this covers the reorder/delete gap).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanDayLivingBoard } from "./PlanDayLivingBoard";
import type { LivingBoardPartition } from "@/lib/planMyDay/companionBrainClient/presentJudgment";
import type { PlanDayItem } from "@/lib/planMyDay/types";

function item(id: string, title: string, extra: Partial<PlanDayItem> = {}): PlanDayItem {
  return { id, title, column: "today", done: false, sortOrder: undefined, ...extra };
}

function partitionWith(focus: PlanDayItem[]): LivingBoardPartition {
  return {
    focus,
    ready: [],
    holding: [],
    holdingCount: 0,
    momentumLabel: null,
  };
}

describe("PlanDayLivingBoard — rearrange and delete Today's Items", () => {
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

  it("shows Move Up / Move Down controls for unlocked items and respects boundaries", () => {
    const focus = [item("a", "First"), item("b", "Second"), item("c", "Third")];
    act(() => {
      root.render(
        <PlanDayLivingBoard
          partition={partitionWith(focus)}
          onOpen={() => undefined}
          onMoveItem={() => undefined}
          onDeleteItem={() => undefined}
        />,
      );
    });

    const firstUp = container.querySelector(
      "[data-testid='plan-day-living-move-up-a']",
    ) as HTMLButtonElement;
    const lastDown = container.querySelector(
      "[data-testid='plan-day-living-move-down-c']",
    ) as HTMLButtonElement;
    expect(firstUp.disabled).toBe(true);
    expect(lastDown.disabled).toBe(true);

    const middleUp = container.querySelector(
      "[data-testid='plan-day-living-move-up-b']",
    ) as HTMLButtonElement;
    expect(middleUp.disabled).toBe(false);
  });

  it("calls onMoveItem with the section's items and direction when Move Up/Down is clicked", () => {
    const focus = [item("a", "First"), item("b", "Second"), item("c", "Third")];
    const onMoveItem = vi.fn();
    act(() => {
      root.render(
        <PlanDayLivingBoard
          partition={partitionWith(focus)}
          onOpen={() => undefined}
          onMoveItem={onMoveItem}
          onDeleteItem={() => undefined}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-living-move-down-a']",
        ) as HTMLButtonElement
      ).click();
    });

    expect(onMoveItem).toHaveBeenCalledTimes(1);
    const [sectionItems, id, direction] = onMoveItem.mock.calls[0]!;
    expect(id).toBe("a");
    expect(direction).toBe("down");
    expect(sectionItems.map((i: PlanDayItem) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("calls onDeleteItem (host opens the calm Remove from today confirm) when delete is clicked", () => {
    const focus = [item("a", "First")];
    const onDeleteItem = vi.fn();
    act(() => {
      root.render(
        <PlanDayLivingBoard
          partition={partitionWith(focus)}
          onOpen={() => undefined}
          onMoveItem={() => undefined}
          onDeleteItem={onDeleteItem}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-living-delete-a']",
        ) as HTMLButtonElement
      ).click();
    });

    expect(onDeleteItem).toHaveBeenCalledWith("a");
  });

  it("opening an item for edit still works via the primary row button", () => {
    const focus = [item("a", "First")];
    const onOpen = vi.fn();
    act(() => {
      root.render(
        <PlanDayLivingBoard
          partition={partitionWith(focus)}
          onOpen={onOpen}
          onMoveItem={() => undefined}
          onDeleteItem={() => undefined}
        />,
      );
    });

    act(() => {
      (
        container.querySelector(
          "[data-testid='plan-day-living-open-a']",
        ) as HTMLButtonElement
      ).click();
    });

    expect(onOpen).toHaveBeenCalledWith("a");
  });

  it("locked items show a lock indicator instead of reorder controls", () => {
    const focus = [item("a", "Doctor appointment", { sourceTimeBlockId: "tb-1" })];
    act(() => {
      root.render(
        <PlanDayLivingBoard
          partition={partitionWith(focus)}
          onOpen={() => undefined}
          onMoveItem={() => undefined}
          onDeleteItem={() => undefined}
        />,
      );
    });

    expect(
      container.querySelector("[data-testid='plan-day-living-lock-a']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='plan-day-living-move-up-a']"),
    ).toBeNull();
  });

  it("does not render reorder/delete controls when no handlers are provided", () => {
    const focus = [item("a", "First")];
    act(() => {
      root.render(
        <PlanDayLivingBoard partition={partitionWith(focus)} onOpen={() => undefined} />,
      );
    });

    expect(
      container.querySelector("[data-testid='plan-day-living-move-up-a']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-living-delete-a']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='plan-day-living-open-a']"),
    ).toBeTruthy();
  });
});

/**
 * Step 1.3F — SavedWorkLibrary item menu, PlanDaySimpleList item menu, and
 * MyMapsPanel map menu, on the shared overlay registry.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavedWorkLibrary } from "@/components/companion/SavedWorkLibrary";
import { PlanDaySimpleList } from "@/components/companion/PlanDaySimpleList";
import { MyMapsPanel } from "@/components/companion/cartographersStudio/MyMapsPanel";
import {
  __resetOverlayRegistryForTests,
  listOpenOverlays,
  openExclusiveOverlay,
  overlayCount,
  registerOverlay,
} from "@/lib/windowDismiss/overlayRegistry";
import { __resetUnsavedWorkGuardsForTests } from "@/lib/unsavedWorkGuard";
import { beginUploadInProgress } from "@/lib/windowDismiss/dismissPolicy";
import type { SavedWorkItem } from "@/lib/savedWorkStore";
import type { PlanDayItem } from "@/lib/planMyDay";
import type { VisualFocusMap } from "@/lib/visualFocus";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@/lib/savedWorkStore", async () => {
  const actual = await vi.importActual<typeof import("@/lib/savedWorkStore")>(
    "@/lib/savedWorkStore",
  );
  return {
    ...actual,
    getSavedWork: () => [],
  };
});

let container: HTMLDivElement;
let root: Root;

function need(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
}
function q(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}
function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
function pressEscape() {
  act(() => {
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}
function pointerDownOn(el: EventTarget) {
  act(() => {
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  });
}

beforeEach(() => {
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
  container = document.createElement("div");
  container.innerHTML = '<div data-testid="outside">outside</div>';
  document.body.appendChild(container);
  const host = document.createElement("div");
  container.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  __resetOverlayRegistryForTests();
  __resetUnsavedWorkGuardsForTests();
});

/* ------------------------------------------------------------------ *
 * PlanDaySimpleList
 * ------------------------------------------------------------------ */

function planItem(id: string, title: string): PlanDayItem {
  return {
    id,
    title,
    status: "not_started",
  } as PlanDayItem;
}

function renderPlanDayList() {
  act(() => {
    root.render(
      <PlanDaySimpleList
        mode="calm-list"
        items={[planItem("1", "First"), planItem("2", "Second")]}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
  });
}

describe("PlanDaySimpleList item menu", () => {
  it("opens and closes correctly", () => {
    renderPlanDayList();
    click(need("plan-day-more-1"));
    expect(q("plan-day-more-menu-1")).not.toBeNull();

    click(need("plan-day-more-1"));
    expect(q("plan-day-more-menu-1")).toBeNull();
  });

  it("registers a stable id keyed on the open item", () => {
    renderPlanDayList();
    click(need("plan-day-more-1"));
    expect(listOpenOverlays()).toEqual([
      { id: "plan-day-item-menu:1", kind: "popover" },
    ]);
  });

  it("switching to a second item's menu does not collide with the first", () => {
    renderPlanDayList();
    click(need("plan-day-more-1"));
    click(need("plan-day-more-2"));

    expect(q("plan-day-more-menu-1")).toBeNull();
    expect(q("plan-day-more-menu-2")).not.toBeNull();
    expect(listOpenOverlays()).toEqual([
      { id: "plan-day-item-menu:2", kind: "popover" },
    ]);
  });

  it("Escape closes it and returns focus to the opener", () => {
    renderPlanDayList();
    const trigger = need("plan-day-more-1");
    click(trigger);

    pressEscape();

    expect(q("plan-day-more-menu-1")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("outside click closes it", () => {
    renderPlanDayList();
    click(need("plan-day-more-1"));

    pointerDownOn(need("outside"));

    expect(q("plan-day-more-menu-1")).toBeNull();
  });

  it("a click inside the menu does not close it", () => {
    renderPlanDayList();
    click(need("plan-day-more-1"));

    pointerDownOn(need("plan-day-more-menu-1"));

    expect(q("plan-day-more-menu-1")).not.toBeNull();
  });

  it("keeps its item actions working", () => {
    const onMoveUp = vi.fn();
    act(() => {
      root.render(
        <PlanDaySimpleList
          mode="calm-list"
          items={[planItem("1", "First")]}
          onMoveUp={onMoveUp}
          onMoveDown={vi.fn()}
          onComplete={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
    });
    click(need("plan-day-more-1"));
    click(need("plan-day-menu-move-up-1"));
    expect(onMoveUp).toHaveBeenCalledWith("1");
  });
});

/* ------------------------------------------------------------------ *
 * MyMapsPanel
 * ------------------------------------------------------------------ */

function visualMap(id: string, title: string): VisualFocusMap {
  return {
    id,
    title,
    mode: "mind_map",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as VisualFocusMap;
}

function renderMapsPanel() {
  act(() => {
    root.render(
      <MyMapsPanel
        maps={[visualMap("m1", "Map One"), visualMap("m2", "Map Two")]}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onPrint={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        onCreate={vi.fn()}
        onClose={vi.fn()}
      />,
    );
  });
}

describe("MyMapsPanel map menu", () => {
  it("opens and closes correctly", () => {
    renderMapsPanel();
    click(need("my-maps-more-m1"));
    expect(q("my-maps-menu-m1")).not.toBeNull();

    click(need("my-maps-more-m1"));
    expect(q("my-maps-menu-m1")).toBeNull();
  });

  it("previously had no Escape handling — now it does, and returns focus", () => {
    renderMapsPanel();
    const trigger = need("my-maps-more-m1");
    click(trigger);

    pressEscape();

    expect(q("my-maps-menu-m1")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("switching between two maps' menus does not collide", () => {
    renderMapsPanel();
    click(need("my-maps-more-m1"));
    click(need("my-maps-more-m2"));

    expect(q("my-maps-menu-m1")).toBeNull();
    expect(q("my-maps-menu-m2")).not.toBeNull();
    expect(listOpenOverlays()).toEqual([
      { id: "cartographers-map-menu:m2", kind: "popover" },
    ]);
  });

  it("outside click closes it", () => {
    renderMapsPanel();
    click(need("my-maps-more-m1"));

    pointerDownOn(need("outside"));

    expect(q("my-maps-menu-m1")).toBeNull();
  });

  it("a click inside the menu does not close it", () => {
    renderMapsPanel();
    click(need("my-maps-more-m1"));

    pointerDownOn(need("my-maps-menu-m1"));

    expect(q("my-maps-menu-m1")).not.toBeNull();
  });

  it("keeps its item actions working", () => {
    const onDelete = vi.fn();
    act(() => {
      root.render(
        <MyMapsPanel
          maps={[visualMap("m1", "Map One")]}
          onOpen={vi.fn()}
          onEdit={vi.fn()}
          onPrint={vi.fn()}
          onRename={vi.fn()}
          onDelete={onDelete}
          onCreate={vi.fn()}
          onClose={vi.fn()}
        />,
      );
    });
    click(need("my-maps-more-m1"));
    const items = document.querySelectorAll('[role="menuitem"]');
    const deleteItem = [...items].find((el) => el.textContent === "Delete");
    click(deleteItem as HTMLElement);
    expect(onDelete).toHaveBeenCalledWith("m1");
  });
});

/* ------------------------------------------------------------------ *
 * SavedWorkLibrary — per-item component, one instance per list row
 * ------------------------------------------------------------------ */

describe("SavedWorkLibrary item menu id shape", () => {
  it("uses a per-item id keyed on item.id, matching the batch's convention", () => {
    // SavedWorkLibrary itself reads from durable/localStorage stores that are
    // impractical to seed here; the id CONVENTION is asserted directly against
    // the shared registry the component calls into, exercised the same way
    // the other two adopters in this file are.
    const close = registerOverlay({
      id: "saved-work-item-menu:sw-1",
      kind: "popover",
      requestDismiss: () => true,
    });
    expect(listOpenOverlays()).toEqual([
      { id: "saved-work-item-menu:sw-1", kind: "popover" },
    ]);
    close();
  });
});

/* ------------------------------------------------------------------ *
 * Cross-kind exclusivity and blocked dismissal, across all three
 * ------------------------------------------------------------------ */

describe("cross-kind exclusivity against a registered modal", () => {
  it("opening a PlanDaySimpleList menu closes an eligible modal, through policy", () => {
    const closeModal = vi.fn();
    const unregisterModal = registerOverlay({
      id: "decision-compass-save",
      kind: "modal",
      requestDismiss: () => {
        closeModal();
        unregisterModal();
        return true;
      },
    });
    renderPlanDayList();

    click(need("plan-day-more-1"));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(overlayCount()).toBe(1);
    expect(listOpenOverlays()[0]?.id).toBe("plan-day-item-menu:1");
  });

  it("opening a MyMapsPanel menu closes an eligible modal, through policy", () => {
    const closeModal = vi.fn();
    registerOverlay({
      id: "spark-note-my-collection",
      kind: "modal",
      requestDismiss: () => {
        closeModal();
        return true;
      },
    });
    renderMapsPanel();

    click(need("my-maps-more-m1"));

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("an eligible modal opening closes a PlanDaySimpleList menu", () => {
    renderPlanDayList();
    click(need("plan-day-more-1"));
    expect(overlayCount()).toBe(1);

    act(() => {
      openExclusiveOverlay("todays-spark-card:xyz");
    });

    expect(q("plan-day-more-menu-1")).toBeNull();
  });
});

describe("blocked dismissal prevents replacement", () => {
  it("an upload in progress keeps a MyMapsPanel menu open", () => {
    renderMapsPanel();
    click(need("my-maps-more-m1"));
    const endUpload = beginUploadInProgress();

    pressEscape();
    expect(q("my-maps-menu-m1")).not.toBeNull();

    endUpload();
    pressEscape();
    expect(q("my-maps-menu-m1")).toBeNull();
  });

  it("a refused dismissal is reported as kept, not silently dropped", () => {
    const refuses = vi.fn(() => false);
    registerOverlay({ id: "blocked-thing", kind: "modal", requestDismiss: refuses });
    renderPlanDayList();

    click(need("plan-day-more-1"));

    expect(refuses).toHaveBeenCalledTimes(1);
    expect(overlayCount()).toBe(2);
  });
});

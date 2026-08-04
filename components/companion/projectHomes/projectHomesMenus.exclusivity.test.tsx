/**
 * Step 1.3C — Project Homes card menus on the shared overlay registry.
 * Real cross-adopter exclusivity: two different components, one screen.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectHomeCard } from "@/components/companion/projectHomes/ProjectHomeCard";
import { ActiveWorkCard } from "@/components/companion/projectHomes/ActiveWorkCard";
import {
  __resetOverlayRegistryForTests,
  listOpenOverlays,
  overlayCount,
} from "@/lib/windowDismiss/overlayRegistry";
import { __resetUnsavedWorkGuardsForTests } from "@/lib/unsavedWorkGuard";
import { beginUploadInProgress } from "@/lib/windowDismiss/dismissPolicy";
import type { ProjectHomeRecord } from "@/lib/projectHomes";
import type { ActiveWorkCardModel } from "@/lib/projects/activeWork/types";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function project(id: string): ProjectHomeRecord {
  return {
    id,
    projectHomeId: "creative-studio",
    name: `Project ${id}`,
    purpose: "A purpose",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as ProjectHomeRecord;
}

function work(id: string): ActiveWorkCardModel {
  return {
    id,
    name: `Work ${id}`,
    creationType: "document",
    statusLabel: "In progress",
    phaseLabel: "Drafting",
    currentFocus: "A focus",
    progressPercent: 40,
    nextRecommendedStep: "Keep going",
    lastWorkedAt: "2026-01-01T00:00:00.000Z",
    waitingItems: [],
    sourceKind: "event",
    eventRecordId: null,
    projectHomeRecordId: null,
    companionProjectId: null,
  } as ActiveWorkCardModel;
}

let container: HTMLDivElement;
let root: Root;

function q(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}
function need(id: string): HTMLElement {
  const el = q(id);
  if (!el) throw new Error(`missing [data-testid="${id}"]`);
  return el;
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

/** Two project cards plus one active-work card — the Project Homes screen. */
function renderScreen() {
  act(() => {
    root.render(
      <>
        <ProjectHomeCard project={project("p1")} onOpen={() => {}} onAction={() => {}} />
        <ProjectHomeCard project={project("p2")} onOpen={() => {}} onAction={() => {}} />
        <ActiveWorkCard work={work("w1")} onContinue={() => {}} onRename={() => {}} onArchive={() => {}} />
      </>,
    );
  });
}

describe("ProjectHomeCard menu", () => {
  it("opens and closes from its trigger", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    expect(q("project-home-menu-p1")).not.toBeNull();

    click(need("project-home-options-p1"));
    expect(q("project-home-menu-p1")).toBeNull();
  });

  it("registers under a per-instance overlay id", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    expect(listOpenOverlays()).toEqual([
      { id: "project-home-card-menu:p1", kind: "popover" },
    ]);
  });

  it("keeps its item actions working", () => {
    const onAction = vi.fn();
    act(() => {
      root.render(
        <ProjectHomeCard project={project("p1")} onOpen={() => {}} onAction={onAction} />,
      );
    });
    click(need("project-home-options-p1"));
    click(need("project-home-rename-p1"));
    expect(onAction).toHaveBeenCalledWith("rename", "p1");
  });
});

describe("ActiveWorkCard menu", () => {
  it("opens and closes from its trigger", () => {
    renderScreen();
    click(need("active-work-menu-w1"));
    expect(q("active-work-menu-panel-w1")).not.toBeNull();

    click(need("active-work-menu-w1"));
    expect(q("active-work-menu-panel-w1")).toBeNull();
  });

  it("registers under a per-instance overlay id", () => {
    renderScreen();
    click(need("active-work-menu-w1"));
    expect(listOpenOverlays()).toEqual([
      { id: "active-work-card-menu:w1", kind: "popover" },
    ]);
  });
});

describe("cross-adopter exclusivity", () => {
  it("opening the second project card menu closes the first", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    expect(q("project-home-menu-p1")).not.toBeNull();

    click(need("project-home-options-p2"));

    expect(q("project-home-menu-p1")).toBeNull();
    expect(q("project-home-menu-p2")).not.toBeNull();
    expect(listOpenOverlays().map((o) => o.id)).toEqual([
      "project-home-card-menu:p2",
    ]);
  });

  it("opening an ActiveWorkCard menu closes a ProjectHomeCard menu", () => {
    renderScreen();
    click(need("project-home-options-p1"));

    click(need("active-work-menu-w1"));

    expect(q("project-home-menu-p1")).toBeNull();
    expect(q("active-work-menu-panel-w1")).not.toBeNull();
    expect(overlayCount()).toBe(1);
  });

  it("opening a ProjectHomeCard menu closes an ActiveWorkCard menu", () => {
    renderScreen();
    click(need("active-work-menu-w1"));

    click(need("project-home-options-p2"));

    expect(q("active-work-menu-panel-w1")).toBeNull();
    expect(q("project-home-menu-p2")).not.toBeNull();
  });

  it("per-instance ids do not collide across repeated cards", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    const first = listOpenOverlays()[0]?.id;
    click(need("project-home-options-p2"));
    const second = listOpenOverlays()[0]?.id;

    expect(first).toBe("project-home-card-menu:p1");
    expect(second).toBe("project-home-card-menu:p2");
    expect(first).not.toBe(second);
  });
});

describe("Escape and outside click", () => {
  it("Escape closes only the active menu", () => {
    renderScreen();
    click(need("project-home-options-p1"));

    pressEscape();

    expect(q("project-home-menu-p1")).toBeNull();
    expect(q("project-home-menu-p2")).toBeNull();
    expect(overlayCount()).toBe(0);
  });

  it("outside click closes the active menu", () => {
    renderScreen();
    click(need("active-work-menu-w1"));

    pointerDownOn(need("outside"));

    expect(q("active-work-menu-panel-w1")).toBeNull();
  });

  it("clicking inside the panel does not close it", () => {
    renderScreen();
    click(need("project-home-options-p1"));

    pointerDownOn(need("project-home-menu-p1"));

    expect(q("project-home-menu-p1")).not.toBeNull();
  });
});

describe("focus restoration", () => {
  it("returns focus to the ProjectHomeCard trigger that opened it", () => {
    renderScreen();
    const trigger = need("project-home-options-p2");
    click(trigger);

    pressEscape();

    expect(document.activeElement).toBe(trigger);
  });

  it("returns focus to the ActiveWorkCard trigger, not a project card", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    const workTrigger = need("active-work-menu-w1");
    click(workTrigger);

    pressEscape();

    expect(document.activeElement).toBe(workTrigger);
  });
});

describe("existing protections still apply", () => {
  it("an upload in progress keeps the menu open", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    const endUpload = beginUploadInProgress();

    pressEscape();
    expect(q("project-home-menu-p1")).not.toBeNull();

    endUpload();
    pressEscape();
    expect(q("project-home-menu-p1")).toBeNull();
  });

  it("a blocked menu is not closed by another opening either", () => {
    renderScreen();
    click(need("project-home-options-p1"));
    const endUpload = beginUploadInProgress();

    click(need("project-home-options-p2"));

    expect(q("project-home-menu-p1")).not.toBeNull();
    endUpload();
  });
});

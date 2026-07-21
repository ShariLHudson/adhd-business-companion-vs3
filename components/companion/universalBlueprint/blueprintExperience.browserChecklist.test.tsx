/**
 * 106 — Browser certification checklist (jsdom).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlueprintExperienceShell } from "./BlueprintExperienceShell";
import {
  MARKETING_PLAN_SIMPLE_BLUEPRINT_ID,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  ensureMarketingPlanBlueprintsRegistered,
  ensureMarketingPlanWorkTypeRegistered,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
} from "@/lib/universalWorkEngine";

function click(el: Element | null) {
  expect(el).toBeTruthy();
  act(() => {
    (el as HTMLElement).click();
  });
}

describe("106 Blueprint Experience browser checklist", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    resetWorkBlueprintStateForTests();
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
    ensureMarketingPlanWorkTypeRegistered();
    ensureMarketingPlanBlueprintsRegistered();

    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <BlueprintExperienceShell
          blueprintId={MARKETING_PLAN_SIMPLE_BLUEPRINT_ID}
        />,
      );
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  it("walks Home, Builder, Capabilities, Calendar, VT, Relationships, Command Center", () => {
    expect(
      container.querySelector("[data-testid='blueprint-experience-shell']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='spark-blueprint-home']"),
    ).toBeTruthy();

    click(container.querySelector("[data-testid='bp-exp-nav-command']"));
    expect(
      container.querySelector("[data-testid='blueprint-command-center']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='bp-cc-next']")?.textContent,
    ).toBeTruthy();

    click(container.querySelector("[data-testid='bp-exp-nav-builder']"));
    expect(
      container.querySelector("[data-testid='blueprint-builder-mode']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='builder-add-group']"));
    expect(
      container.querySelector("[data-testid='builder-status']")?.textContent,
    ).toMatch(/group/i);

    click(container.querySelector("[data-testid='bp-exp-nav-capabilities']"));
    expect(
      container.querySelector("[data-testid='blueprint-capability-manifest']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='capability-builderMode']")
        ?.getAttribute("data-enabled"),
    ).toBe("true");

    click(container.querySelector("[data-testid='bp-exp-nav-calendar']"));
    expect(
      container.querySelector("[data-testid='blueprint-calendar-panel']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='calendar-propose']"));
    expect(
      container.querySelector("[data-testid='calendar-approval']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='calendar-approve']"));

    click(container.querySelector("[data-testid='bp-exp-nav-visual']"));
    expect(
      container.querySelector("[data-testid='blueprint-visual-thinking-panel']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='vt-propose']"));
    expect(container.querySelector("[data-testid='vt-approval']")).toBeTruthy();

    click(container.querySelector("[data-testid='bp-exp-nav-relationships']"));
    expect(
      container.querySelector("[data-testid='blueprint-relationship-explorer']"),
    ).toBeTruthy();

    click(container.querySelector("[data-testid='bp-exp-nav-estate_hooks']"));
    expect(
      container.querySelector("[data-testid='estate-hook-evidence_vault']"),
    ).toBeTruthy();

    // Accessibility: nav buttons expose current page
    click(container.querySelector("[data-testid='bp-exp-nav-home']"));
    expect(
      container
        .querySelector("[data-testid='bp-exp-nav-home']")
        ?.getAttribute("aria-current"),
    ).toBe("page");
  });
});

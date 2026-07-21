/**
 * 136 — Browser checklist for Fundraiser / Gala Event Blueprint (jsdom).
 * @vitest-environment jsdom
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UniversalBlueprintInterface } from "@/components/companion/universalBlueprint";
import { clearBlueprintInterfaceSession } from "@/lib/universalBlueprintInterface";
import {
  FUNDRAISER_GALA_EVENT_BLUEPRINT_ID,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  getWorkBlueprintState,
  mergeKnownContext,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
} from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/eventPlanMap";

function click(el: Element | null) {
  expect(el).toBeTruthy();
  act(() => {
    (el as HTMLElement).click();
  });
}

describe("136 Fundraiser / Gala Event browser checklist", () => {
  let container: HTMLDivElement;
  let root: Root;
  let readyWorkIds: string[];

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    clearBlueprintRegistryForTests();
    clearWorkTypePackageRegistryForTests();
    resetWorkBlueprintStateForTests();
    resetWorkIdentityStoreForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureEventBlueprintsRegistered();
    clearBlueprintInterfaceSession();
    readyWorkIds = [];

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
        <UniversalBlueprintInterface
          workTypeId={EVENT_PLAN_WORK_TYPE_ID}
          knownContext={{
            purpose: "Advance the scholarship mission and deepen donor relationships",
            audience: "Major donors and community champions",
          }}
          onWorkReady={(state) => {
            readyWorkIds.push(state.workId);
          }}
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

  it("starts Fundraiser / Gala Quick Start, preserves Work ID on Guided Build, auction context sticks", () => {
    click(
      container.querySelector("[data-testid='ubi-path-start_from_blueprint']"),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-browser']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='ubi-source-spark']"));
    click(
      container.querySelector(
        `[data-testid='ubi-blueprint-${FUNDRAISER_GALA_EVENT_BLUEPRINT_ID}']`,
      ),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-preview']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='universal-blueprint-preview']")
        ?.textContent,
    ).toMatch(/Fundraiser|Gala/i);

    click(container.querySelector("[data-testid='ubi-depth-quick_start']"));
    click(container.querySelector("[data-testid='ubi-preview-continue']"));

    const continueEmpty = container.querySelector(
      "[data-testid='ubi-known-context-continue-empty']",
    );
    const confirmReuse = container.querySelector(
      "[data-testid='ubi-reuse-confirm']",
    );
    if (confirmReuse) {
      click(confirmReuse);
    } else if (continueEmpty) {
      click(continueEmpty);
    }

    expect(container.querySelector("[data-testid='ubi-active-work']")).toBeTruthy();
    expect(readyWorkIds.length).toBeGreaterThanOrEqual(1);
    const workId = readyWorkIds[0]!;
    const state = getWorkBlueprintState(workId);
    expect(state?.blueprintId).toBe(FUNDRAISER_GALA_EVENT_BLUEPRINT_ID);
    expect(state?.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(state?.depthMode).toBe("quick_start");

    const guided = changeBlueprintDepthMode(workId, "guided_build");
    expect(guided.workId).toBe(workId);
    expect(guided.depthMode).toBe("guided_build");

    mergeKnownContext(workId, { has_auction: "true" });
    expect(getWorkBlueprintState(workId)?.knownContext.has_auction).toBe("true");
  });
});

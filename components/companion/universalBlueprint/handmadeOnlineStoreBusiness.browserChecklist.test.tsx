/**
 * 202 — Browser checklist for Handmade Online Store Business Blueprint (jsdom).
 * @vitest-environment jsdom
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UniversalBlueprintInterface } from "@/components/companion/universalBlueprint";
import { clearBlueprintInterfaceSession } from "@/lib/universalBlueprintInterface";
import {
  HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
  changeBlueprintDepthMode,
  clearBlueprintRegistryForTests,
  clearWorkTypePackageRegistryForTests,
  ensureBusinessPlanBlueprintsRegistered,
  ensureBusinessPlanWorkTypeRegistered,
  ensureEventBlueprintsRegistered,
  ensureEventPlanWorkTypeRegistered,
  getWorkBlueprintState,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
} from "@/lib/universalWorkEngine";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";

function click(el: Element | null) {
  expect(el).toBeTruthy();
  act(() => {
    (el as HTMLElement).click();
  });
}

describe("202 Handmade Online Store Business browser checklist", () => {
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
    ensureBusinessPlanWorkTypeRegistered();
    ensureBusinessPlanBlueprintsRegistered();
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
          workTypeId={BUSINESS_PLAN_WORK_TYPE_ID}
          knownContext={{
            purpose: "Grow a calm Etsy and Shopify jewelry shop",
            products: "Handmade earrings and necklaces",
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

  it("starts Handmade Online Store Quick Start and preserves Work ID on Guided Build", () => {
    click(
      container.querySelector("[data-testid='ubi-path-start_from_blueprint']"),
    );
    click(container.querySelector("[data-testid='ubi-source-spark']"));
    click(
      container.querySelector(
        `[data-testid='ubi-blueprint-${HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID}']`,
      ),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-preview']")
        ?.textContent,
    ).toMatch(/Handmade Online Store/i);

    click(container.querySelector("[data-testid='ubi-depth-quick_start']"));
    click(container.querySelector("[data-testid='ubi-preview-continue']"));

    const continueEmpty = container.querySelector(
      "[data-testid='ubi-known-context-continue-empty']",
    );
    const confirmReuse = container.querySelector(
      "[data-testid='ubi-reuse-confirm']",
    );
    if (confirmReuse) click(confirmReuse);
    else if (continueEmpty) click(continueEmpty);

    expect(container.querySelector("[data-testid='ubi-active-work']")).toBeTruthy();
    const workId = readyWorkIds[0]!;
    expect(getWorkBlueprintState(workId)?.blueprintId).toBe(
      HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT_ID,
    );
    expect(getWorkBlueprintState(workId)?.workTypeId).toBe(
      BUSINESS_PLAN_WORK_TYPE_ID,
    );
    const guided = changeBlueprintDepthMode(workId, "guided_build");
    expect(guided.workId).toBe(workId);
  });
});

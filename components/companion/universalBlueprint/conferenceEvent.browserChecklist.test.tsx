/**
 * 130 — Browser checklist for Conference Event Blueprint (jsdom).
 * @vitest-environment jsdom
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UniversalBlueprintInterface } from "@/components/companion/universalBlueprint";
import { clearBlueprintInterfaceSession } from "@/lib/universalBlueprintInterface";
import {
  CONFERENCE_EVENT_BLUEPRINT_ID,
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

describe("130 Conference Event browser checklist", () => {
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
            purpose: "Help members leave with practical growth",
            audience: "Association members",
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

  it("starts Conference Quick Start, preserves Work ID on Guided Build, sponsor context sticks", () => {
    click(
      container.querySelector("[data-testid='ubi-path-start_from_blueprint']"),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-browser']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='ubi-source-spark']"));
    click(
      container.querySelector(
        `[data-testid='ubi-blueprint-${CONFERENCE_EVENT_BLUEPRINT_ID}']`,
      ),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-preview']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='universal-blueprint-preview']")
        ?.textContent,
    ).toMatch(/\bConference\b/i);

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
    expect(state?.blueprintId).toBe(CONFERENCE_EVENT_BLUEPRINT_ID);
    expect(state?.workTypeId).toBe(EVENT_PLAN_WORK_TYPE_ID);
    expect(state?.depthMode).toBe("quick_start");

    const guided = changeBlueprintDepthMode(workId, "guided_build");
    expect(guided.workId).toBe(workId);
    expect(guided.depthMode).toBe("guided_build");

    mergeKnownContext(workId, { has_sponsors: "true" });
    expect(getWorkBlueprintState(workId)?.knownContext.has_sponsors).toBe(
      "true",
    );
  });
});

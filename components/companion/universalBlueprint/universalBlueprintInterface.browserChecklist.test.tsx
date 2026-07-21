/**
 * 102 Founder browser checklist — interactive jsdom walkthrough.
 * @vitest-environment jsdom
 */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UniversalBlueprintInterface } from "@/components/companion/universalBlueprint";
import {
  clearBlueprintInterfaceSession,
  readBlueprintInterfaceSession,
} from "@/lib/universalBlueprintInterface";
import {
  clearBlueprintRegistryForTests,
  ensureEventBlueprintsRegistered,
  getWorkBlueprintState,
  listBlueprints,
  listWorkBlueprintStates,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
} from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";

function click(el: Element | null) {
  expect(el).toBeTruthy();
  act(() => {
    (el as HTMLElement).click();
  });
}

function text(container: HTMLElement, testId: string): string {
  return container.querySelector(`[data-testid="${testId}"]`)?.textContent ?? "";
}

describe("102 founder browser checklist", () => {
  let container: HTMLDivElement;
  let root: Root;
  let scratchCalls: number;
  let readyWorkIds: string[];

  beforeEach(() => {
    // React 19 act() support in Vitest jsdom
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    clearBlueprintRegistryForTests();
    resetWorkBlueprintStateForTests();
    resetWorkIdentityStoreForTests();
    ensureEventBlueprintsRegistered();
    clearBlueprintInterfaceSession();
    scratchCalls = 0;
    readyWorkIds = [];

    // sessionStorage for continuity
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
            business_name: "Harbor Studio",
            audience: "Local owners",
            purpose: "Client lunch",
          }}
          inferredKeys={["audience"]}
          onStartFromScratch={() => {
            scratchCalls += 1;
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

  it("walks founder checklist items 1–8 without duplicates", () => {
    // 1. Start From Scratch
    expect(
      container.querySelector("[data-testid='universal-blueprint-entry']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='ubi-path-start_from_scratch']"));
    expect(scratchCalls).toBe(1);

    // Re-render entry after scratch (host would close; we stay for remaining checks)
    act(() => {
      root.render(
        <UniversalBlueprintInterface
          workTypeId={EVENT_PLAN_WORK_TYPE_ID}
          knownContext={{
            business_name: "Harbor Studio",
            audience: "Local owners",
            purpose: "Client lunch",
          }}
          inferredKeys={["audience"]}
          onStartFromScratch={() => {
            scratchCalls += 1;
          }}
          onWorkReady={(state) => {
            readyWorkIds.push(state.workId);
          }}
        />,
      );
    });

    // 2. Start From Blueprint → Business Luncheon → preview
    click(
      container.querySelector("[data-testid='ubi-path-start_from_blueprint']"),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-browser']"),
    ).toBeTruthy();
    click(container.querySelector("[data-testid='ubi-source-spark']"));
    click(
      container.querySelector(
        "[data-testid='ubi-blueprint-bp-event-business-luncheon']",
      ),
    );
    expect(
      container.querySelector("[data-testid='universal-blueprint-preview']"),
    ).toBeTruthy();
    expect(text(container, "universal-blueprint-preview")).toContain(
      "Business Luncheon",
    );

    // 3. Quick Start selected, then continue into known-context
    click(container.querySelector("[data-testid='ubi-depth-quick_start']"));
    click(container.querySelector("[data-testid='ubi-preview-continue']"));
    expect(
      container.querySelector("[data-testid='ubi-known-context-review']"),
    ).toBeTruthy();

    // 4. Approve business_name; decline audience
    const audienceBox = container.querySelector(
      "[data-testid='ubi-reuse-approve-audience']",
    ) as HTMLInputElement | null;
    const businessBox = container.querySelector(
      "[data-testid='ubi-reuse-approve-business_name']",
    ) as HTMLInputElement | null;
    const purposeBox = container.querySelector(
      "[data-testid='ubi-reuse-approve-purpose']",
    ) as HTMLInputElement | null;

    expect(businessBox || purposeBox).toBeTruthy();

    if (audienceBox?.checked) {
      act(() => {
        audienceBox.click();
      });
    }
    if (businessBox && !businessBox.checked) {
      act(() => {
        businessBox.click();
      });
    }
    if (purposeBox && !purposeBox.checked) {
      act(() => {
        purposeBox.click();
      });
    }

    click(container.querySelector("[data-testid='ubi-reuse-confirm']"));
    expect(container.querySelector("[data-testid='ubi-active-work']")).toBeTruthy();
    expect(readyWorkIds.length).toBe(1);
    const workId1 = readyWorkIds[0]!;
    // Spec 127 — member-facing success; Work IDs stay off-screen
    expect(text(container, "ubi-work-ready-message")).toMatch(/ready/i);
    expect(container.querySelector("[data-testid='ubi-active-work-id']")).toBeNull();

    const stateAfterInit = getWorkBlueprintState(workId1)!;
    expect(stateAfterInit.depthMode).toBe("quick_start");
    expect(stateAfterInit.knownContext.audience).toBeUndefined();
    if (businessBox) {
      expect(stateAfterInit.knownContext.business_name).toBe("Harbor Studio");
    }

    // 3 continued: Quick Start → Guided Build, same Work ID
    click(container.querySelector("[data-testid='ubi-depth-control-guided_build']"));
    expect(container.querySelector("[data-testid='ubi-depth-preview']")).toBeTruthy();
    click(container.querySelector("[data-testid='ubi-depth-confirm']"));
    const afterDepth = getWorkBlueprintState(workId1)!;
    expect(afterDepth.workId).toBe(workId1);
    expect(afterDepth.depthMode).toBe("guided_build");
    expect(text(container, "ubi-depth-note")).toContain(workId1);

    // 6. Save as Personal Blueprint with review strip
    click(container.querySelector("[data-testid='ubi-open-save-as']"));
    expect(container.querySelector("[data-testid='ubi-save-as-blueprint']")).toBeTruthy();
    click(container.querySelector("[data-testid='ubi-save-category-personal']"));
    const titleInput = container.querySelector(
      "[data-testid='ubi-save-title']",
    ) as HTMLInputElement;
    act(() => {
      titleInput.value = "My Luncheon Pattern";
      titleInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(container.querySelector("[data-testid='ubi-save-prepare']"));
    expect(container.querySelector("[data-testid='ubi-save-review']")).toBeTruthy();
    const blueprintsBefore = listBlueprints({ category: "personal" }).length;
    click(container.querySelector("[data-testid='ubi-save-confirm']"));
    expect(listBlueprints({ category: "personal" }).length).toBe(
      blueprintsBefore + 1,
    );
    expect(getWorkBlueprintState(workId1)?.workId).toBe(workId1);

    // 7. Refresh / reopen continuity
    const session = readBlueprintInterfaceSession(workId1);
    expect(session?.workId).toBe(workId1);
    expect(session?.blueprintId).toBe("bp-event-business-luncheon");

    act(() => {
      root.unmount();
    });
    root = createRoot(container);
    act(() => {
      root.render(
        <UniversalBlueprintInterface
          workTypeId={EVENT_PLAN_WORK_TYPE_ID}
          resumeWorkId={workId1}
          onWorkReady={(state) => {
            readyWorkIds.push(state.workId);
          }}
        />,
      );
    });
    expect(text(container, "ubi-status")).toMatch(/picking up where you left off/i);

    // Resume should restore the active Work surface (not an empty active step)
    expect(container.querySelector("[data-testid='ubi-active-work']")).toBeTruthy();
    expect(text(container, "ubi-work-ready-message")).toMatch(/ready/i);

    // 5. Build From Previous Work (after Event exists)
    act(() => {
      root.unmount();
    });
    root = createRoot(container);
    act(() => {
      root.render(
        <UniversalBlueprintInterface
          workTypeId={EVENT_PLAN_WORK_TYPE_ID}
          onWorkReady={(state) => {
            readyWorkIds.push(state.workId);
          }}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='universal-blueprint-entry']"),
    ).toBeTruthy();
    click(
      container.querySelector(
        "[data-testid='ubi-path-build_from_previous_work']",
      ),
    );
    expect(
      container.querySelector("[data-testid='ubi-build-from-previous']"),
    ).toBeTruthy();
    const previousBtn = container.querySelector(
      `[data-testid="ubi-previous-${workId1}"]`,
    );
    expect(
      previousBtn,
      `expected previous work button for ${workId1}; html=${container.innerHTML.slice(0, 500)}`,
    ).toBeTruthy();
    click(previousBtn);
    expect(
      container.querySelector("[data-testid='ubi-previous-sections']"),
    ).toBeTruthy();
    const worksBefore = listWorkBlueprintStates().length;
    click(container.querySelector("[data-testid='ubi-previous-confirm']"));
    expect(listWorkBlueprintStates().length).toBe(worksBefore + 1);
    expect(readyWorkIds.length).toBeGreaterThanOrEqual(2);
    const workId2 = readyWorkIds[readyWorkIds.length - 1]!;
    expect(workId2).not.toBe(workId1);
    expect(getWorkBlueprintState(workId1)?.workId).toBe(workId1);

    // 8. No duplicate of original Work; two distinct Work IDs
    const allIds = listWorkBlueprintStates().map((s) => s.workId);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds).toContain(workId1);
    expect(allIds).toContain(workId2);
  });
});

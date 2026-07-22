/**
 * Cartographer's Studio — end-to-end wall map click → open builder flow.
 *
 * Regression guard for the reported bug: map names/labels were correct,
 * but clicking a wall map (frame or label) did nothing. Root cause was
 * that `onSelectWallMap` was never wired from `VisualFocusWorkspacePanel`
 * to `CartographersStudioRoom`, so `openWallMap()` had no handler for any
 * wall map except Mind Map — every other click was a silent no-op.
 *
 * This test renders the real, production `VisualFocusWorkspacePanel` (the
 * component actually mounted by `CompanionPageClient` for the
 * `visual-focus` section) and clicks through the full member-visible path:
 * wall frame → entry panel ("Begin My Map") → guided builder → generated
 * map — proving every click produces real, visible feedback and never a
 * dead end.
 *
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VisualFocusWorkspacePanel } from "@/components/companion/VisualFocusWorkspacePanel";
import { cartographyWallMaps } from "@/lib/cartographersStudio/wallMaps";

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

describe("Cartographer's Studio — wall map click opens the matching builder (full flow)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  function click(testId: string) {
    const el = container.querySelector(
      `[data-testid="${testId}"]`,
    ) as HTMLButtonElement | null;
    expect(el, `expected to find [data-testid="${testId}"]`).toBeTruthy();
    act(() => {
      el?.click();
    });
    return el;
  }

  it("clicking the Decision Map wall frame opens the entry panel — not a silent no-op", () => {
    act(() => {
      root.render(<VisualFocusWorkspacePanel />);
    });

    expect(
      container.querySelector('[data-testid="cartographers-frame-decision-map"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="cartography-map-entry"]'),
    ).toBeNull();

    click("cartographers-frame-decision-map");

    const entry = container.querySelector(
      '[data-testid="cartography-map-entry"]',
    );
    expect(entry, "Map Entry panel never opened — click was a silent no-op").toBeTruthy();
    expect(entry?.textContent).toContain("Decision Map");
  });

  it("Begin My Map opens the real guided builder for Decision Map (not a dead end)", () => {
    act(() => {
      root.render(<VisualFocusWorkspacePanel />);
    });

    click("cartographers-frame-decision-map");
    click("cartography-begin-my-map");

    const builder = container.querySelector(
      '[data-testid="cartography-guided-builder"]',
    );
    expect(builder).toBeTruthy();
    expect(builder?.getAttribute("data-map-id")).toBe("decision-map");
  });

  it("completing the guided builder creates and opens a real Decision Map (full round trip)", () => {
    act(() => {
      root.render(<VisualFocusWorkspacePanel />);
    });

    click("cartographers-frame-decision-map");
    click("cartography-begin-my-map");

    // Step 1: decision (required)
    setInputValue(
      container.querySelector(".cartographers-guided__input"),
      "Hire a VA this quarter?",
    );
    click("cartography-guided-continue");

    // Step 2: options (required)
    setInputValue(
      container.querySelector(".cartographers-guided__input"),
      "Hire now, Wait, Outsource",
    );
    click("cartography-guided-continue");

    // Steps 3–5 are optional — continue through with the Continue/Create button.
    for (let i = 0; i < 5; i++) {
      const continueBtn = container.querySelector(
        '[data-testid="cartography-guided-continue"]',
      ) as HTMLButtonElement | null;
      if (!continueBtn) break;
      act(() => {
        continueBtn.click();
      });
      if (
        !container.querySelector('[data-testid="cartography-guided-builder"]')
      ) {
        break;
      }
    }

    // The builder is gone and a real generated map view is showing.
    expect(
      container.querySelector('[data-testid="cartography-guided-builder"]'),
    ).toBeNull();
    const workspaceRoot = container.querySelector(
      '[data-visual-focus-view="workspace"]',
    );
    expect(
      workspaceRoot,
      "completing the builder never opened the map workspace",
    ).toBeTruthy();
    expect(
      container.querySelector(".cartographers-discovery-table"),
    ).toBeTruthy();
  });

  it("every one of the 10 wall maps opens a distinct, correctly-named entry panel", () => {
    for (const wall of cartographyWallMaps) {
      act(() => {
        root.render(<VisualFocusWorkspacePanel />);
      });

      click(`cartographers-frame-${wall.id}`);

      const entry = container.querySelector(
        '[data-testid="cartography-map-entry"]',
      );
      expect(
        entry,
        `${wall.name} click did not open its entry panel`,
      ).toBeTruthy();
      expect(entry?.textContent).toContain(wall.name);

      act(() => {
        root.unmount();
      });
      root = createRoot(container);
    }
  });
});

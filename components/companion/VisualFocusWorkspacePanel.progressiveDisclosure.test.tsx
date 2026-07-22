/**
 * Cartographer's Studio — progressive-disclosure redesign.
 *
 * Founder feedback: the generated map "screamed" — a nine-section
 * intelligence panel plus a seven-button toolbar appeared all at once.
 * This test drives the real production panel to a generated Decision Map
 * and proves the calm behavior:
 *   - intelligence is HIDDEN on arrival (invite only, no full panel)
 *   - the toolbar is simplified to Canvas · Analyze · More
 *   - Analyze offers the three layouts and reveals insights on opt-in
 *   - insights reveal one at a time, then "all together"
 *   - the left side is a collapsed "Nodes (N)" summary until editing
 *   - Decision Summary asks permission before generating
 *
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VisualFocusWorkspacePanel } from "@/components/companion/VisualFocusWorkspacePanel";

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

describe("Cartographer's Studio — progressive disclosure on the generated map", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const q = (id: string) =>
    container.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  const click = (id: string) => {
    const el = q(id) as HTMLButtonElement | null;
    expect(el, `expected [data-testid="${id}"]`).toBeTruthy();
    act(() => el?.click());
  };

  /** Build a real generated Decision Map through the member-visible flow. */
  function reachGeneratedMap() {
    act(() => root.render(<VisualFocusWorkspacePanel />));
    click("cartographers-frame-decision-map");
    click("cartography-begin-my-map");
    setInputValue(
      container.querySelector(".cartographers-guided__input"),
      "Hire a VA this quarter?",
    );
    click("cartography-guided-continue");
    setInputValue(
      container.querySelector(".cartographers-guided__input"),
      "Hire now, Wait, Outsource",
    );
    click("cartography-guided-continue");
    for (let i = 0; i < 5; i++) {
      const cont = container.querySelector(
        '[data-testid="cartography-guided-continue"]',
      ) as HTMLButtonElement | null;
      if (!cont) break;
      act(() => cont.click());
      if (!container.querySelector('[data-testid="cartography-guided-builder"]')) {
        break;
      }
    }
    expect(
      container.querySelector('[data-visual-focus-view="workspace"]'),
    ).toBeTruthy();
  }

  it("hides the intelligence panel on arrival — invite only", () => {
    reachGeneratedMap();
    expect(q("companion-insights-invite")).toBeTruthy();
    expect(q("visual-focus-intelligence")).toBeNull();
    expect(q("companion-insights-sequence")).toBeNull();
  });

  it("simplifies the toolbar to Canvas · Analyze · More", () => {
    reachGeneratedMap();
    expect(q("cartographers-view-canvas")).toBeTruthy();
    expect(q("cartographers-analyze")).toBeTruthy();
    expect(q("cartographers-map-more")).toBeTruthy();
    // Old always-on toolbar controls are gone.
    expect(q("cartographers-edit-map")).toBeNull();
    expect(q("cartographers-print-map")).toBeNull();
    expect(q("cartographers-update-map")).toBeNull();
    expect(q("intelligence-view-mode")).toBeNull();
  });

  it("Analyze offers the three layouts and reveals insights on opt-in", () => {
    reachGeneratedMap();
    click("cartographers-analyze");
    expect(q("cartographers-analyze-menu")).toBeTruthy();
    expect(q("cartographers-analyze-canvas-intelligence")).toBeTruthy();
    expect(q("cartographers-analyze-canvas-only")).toBeTruthy();
    expect(q("cartographers-analyze-intelligence-only")).toBeTruthy();

    click("cartographers-analyze-canvas-intelligence");
    // Insights now reveal sequentially — still not the full nine-section dump.
    expect(q("companion-insights-sequence")).toBeTruthy();
    expect(q("visual-focus-intelligence")).toBeNull();
  });

  it("reveals insights one at a time after 'Yes', then all together", () => {
    reachGeneratedMap();
    click("companion-insights-yes");
    expect(q("companion-insights-sequence")).toBeTruthy();
    const firstCount = container.querySelectorAll(
      '[data-testid^="companion-insight-card-"]',
    ).length;
    expect(firstCount).toBe(1);

    if (q("companion-insights-next")) {
      click("companion-insights-next");
      expect(
        container.querySelectorAll('[data-testid^="companion-insight-card-"]')
          .length,
      ).toBeGreaterThan(firstCount);
    }

    if (q("companion-insights-show-all")) {
      click("companion-insights-show-all");
      expect(q("visual-focus-intelligence")).toBeTruthy();
    }
  });

  it("Canvas button hides intelligence entirely", () => {
    reachGeneratedMap();
    click("cartographers-view-canvas");
    expect(q("companion-insights-invite")).toBeNull();
    expect(q("companion-insights-sequence")).toBeNull();
    expect(q("visual-focus-intelligence")).toBeNull();
    expect(q("visual-focus-canvas")).toBeTruthy();
  });

  it("collapses the left side to a Nodes summary until editing", () => {
    reachGeneratedMap();
    expect(q("visual-focus-structure")).toBeTruthy();
    expect(q("visual-focus-structure-summary")).toBeTruthy();
    // Full editable tree is hidden until Edit.
    expect(q("visual-focus-tree")).toBeNull();
    click("visual-focus-structure-edit");
    expect(q("visual-focus-tree")).toBeTruthy();
  });

  it("Decision Summary asks permission before generating", () => {
    reachGeneratedMap();
    click("cartographers-decision-summary");
    expect(q("decision-summary-sheet")).toBeTruthy();
    // Nothing generated until the member says yes.
    expect(q("decision-summary-content")).toBeNull();
    click("decision-summary-generate");
    expect(q("decision-summary-content")).toBeTruthy();
  });
});

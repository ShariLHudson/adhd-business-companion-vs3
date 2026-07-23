/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createElement, act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { composeTodayFirePortfolio } from "@/lib/founder/briefs/composeTodayFirePortfolio";
import type { FireExecutivePortfolio } from "@/lib/founder/types/fireBrief";
import {
  FIRE_READING_BODY_PX,
  FIRE_READING_SIZE_STORAGE_KEY,
  readFireReadingSize,
} from "@/lib/founder/briefs/fireReadingSize";
import { FIRE_BRIEF_SECTION_ORDER } from "@/lib/founder/types/fireBriefDetail";
import { FireExecutiveBriefReadingExperience } from "./FireExecutiveBriefReadingExperience";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let container: HTMLDivElement;
let root: Root;

function BriefHarness({ portfolio }: { portfolio: FireExecutivePortfolio }) {
  const [readingMode, setReadingMode] = useState(false);
  return createElement(FireExecutiveBriefReadingExperience, {
    portfolio,
    variant: "today",
    readingMode,
    onReadingModeChange: setReadingMode,
  });
}

function renderBrief() {
  const portfolio = composeTodayFirePortfolio({ dateKey: "2026-07-23" });
  act(() => {
    root.render(createElement(BriefHarness, { portfolio }));
  });
  return portfolio;
}

function clickButton(label: string | RegExp) {
  const buttons = Array.from(container.querySelectorAll("button"));
  const match = buttons.find((b) =>
    typeof label === "string"
      ? b.textContent?.trim() === label
      : label.test(b.textContent ?? ""),
  );
  expect(match, `button ${String(label)}`).toBeTruthy();
  act(() => {
    match!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("FireExecutiveBriefReadingExperience", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    window.localStorage.clear();
    window.scrollTo = () => {};
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.localStorage.clear();
  });

  it("shows full-date report title and gentle provenance", () => {
    const portfolio = renderBrief();
    const text = container.textContent ?? "";
    expect(text).toContain("Spark Estate Executive Intelligence Brief");
    expect(text).toContain(portfolio.dateDisplay);
    expect(text).toMatch(
      /Prepared from the intelligence currently available in your Founder Workspace/i,
    );
    expect(text).not.toMatch(/sample adapter/i);
  });

  it("renders Executive Overview with priority and opportunity", () => {
    renderBrief();
    const overview = container.querySelector('[data-testid="fire-brief-overview"]');
    expect(overview?.textContent).toMatch(/Three most important developments/i);
    expect(overview?.textContent).toMatch(/Top founder priority/i);
    expect(overview?.textContent).toMatch(/Highest-value opportunity/i);
    expect(overview?.textContent).toMatch(/Izna/i);
  });

  it("renders all supported report sections in Full Brief", () => {
    renderBrief();
    clickButton("Read Full Executive Brief");
    for (const id of FIRE_BRIEF_SECTION_ORDER) {
      expect(
        container.querySelector(`[data-section-id="${id}"]`),
        id,
      ).toBeTruthy();
    }
  });

  it("supports Expand All and Collapse All", () => {
    renderBrief();
    clickButton("Read Full Executive Brief");
    clickButton("Expand All");
    expect(container.querySelectorAll('[data-expanded="true"]').length).toBe(
      FIRE_BRIEF_SECTION_ORDER.length,
    );
    clickButton("Collapse All");
    expect(container.querySelectorAll('[data-expanded="true"]').length).toBe(0);
  });

  it("opens sections with actions", () => {
    renderBrief();
    clickButton(/Open Sections With Actions/);
    const open = container.querySelectorAll('[data-expanded="true"]');
    expect(open.length).toBeGreaterThan(0);
  });

  it("persists text-size control and keeps smaller at/above body floor", () => {
    renderBrief();
    clickButton("Larger");
    expect(
      container
        .querySelector('[data-testid="fire-executive-brief"]')
        ?.getAttribute("data-reading-size"),
    ).toBe("larger");
    expect(readFireReadingSize()).toBe("larger");
    expect(FIRE_READING_BODY_PX.smaller).toBeGreaterThanOrEqual(22);
    expect(FIRE_READING_BODY_PX.default).toBeGreaterThanOrEqual(22);
    clickButton("Smaller");
    expect(window.localStorage.getItem(FIRE_READING_SIZE_STORAGE_KEY)).toBe(
      "smaller",
    );
  });

  it("enters and exits Reading Mode", () => {
    renderBrief();
    clickButton("Reading Mode");
    expect(
      container
        .querySelector('[data-testid="fire-executive-brief"]')
        ?.getAttribute("data-reading-mode"),
    ).toBe("true");
    clickButton("Exit Reading Mode");
    expect(
      container
        .querySelector('[data-testid="fire-executive-brief"]')
        ?.getAttribute("data-reading-mode"),
    ).toBe("false");
  });

  it("shows Founder Alert levels when alerts section is open", () => {
    renderBrief();
    clickButton("Read Full Executive Brief");
    clickButton("Expand All");
    expect(container.querySelectorAll("[data-alert-level]").length).toBeGreaterThan(
      0,
    );
    expect(container.textContent).toMatch(
      /Needs Attention Today|Watch Closely|Worth Knowing/,
    );
  });

  it("keeps complete Izna instructions visible when expanded", () => {
    renderBrief();
    clickButton("Open Izna Work Package");
    const izna = container.querySelector('[data-testid="fire-izna-assignment"]');
    expect(izna?.textContent).toMatch(/Definition of done/i);
    expect(izna?.textContent).toMatch(/Step-by-step guidance/i);
    expect(izna?.textContent).toMatch(/Expected deliverables/i);
    expect(izna?.textContent).toMatch(/returned to the founder/i);
  });

  it("groups action plan by Today / This Week / Watch", () => {
    renderBrief();
    clickButton("Open Founder Actions");
    const groups = container.querySelector(
      '[data-testid="fire-action-plan-groups"]',
    );
    expect(groups?.querySelector('[data-horizon-group="today"]')).toBeTruthy();
  });

  it("supports keyboard operation on accordion toggles", () => {
    renderBrief();
    clickButton("Read Full Executive Brief");
    const toggle = container.querySelector(
      ".fire-brief-section__toggle",
    ) as HTMLButtonElement | null;
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      toggle!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
    act(() => {
      toggle!.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true }),
      );
    });
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not use fixed-height truncation on section bodies", () => {
    renderBrief();
    clickButton("Expand All");
    const bodies = Array.from(
      container.querySelectorAll(".fire-brief-section__body"),
    ) as HTMLElement[];
    for (const body of bodies) {
      const style = window.getComputedStyle(body);
      expect(style.maxHeight === "none" || style.maxHeight === "").toBe(true);
      expect(style.overflow).not.toBe("hidden");
    }
  });

  it("hides Listen and Print controls when capabilities are absent", () => {
    renderBrief();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\bListen\b/);
    expect(text).not.toMatch(/Print\s*\/\s*Save/);
    expect(text).not.toMatch(/\bExport\b/);
  });

  it("uses semantic heading structure", () => {
    renderBrief();
    clickButton("Read Full Executive Brief");
    expect(container.querySelector("h2.fire-brief__title")).toBeTruthy();
    expect(container.querySelector("h3.fire-brief__overview-title")).toBeTruthy();
    expect(container.querySelectorAll("h3.fire-brief-section__title").length).toBe(
      FIRE_BRIEF_SECTION_ORDER.length,
    );
  });
});

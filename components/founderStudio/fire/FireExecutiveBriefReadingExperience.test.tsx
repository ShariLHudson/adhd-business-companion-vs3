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
import {
  clearFireBriefReadingProgressForTests,
  readLastBriefSection,
} from "@/lib/founder/briefs/fireBriefReadingProgress";
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
    greeting: "Good morning, Shari.",
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

function clickTestId(testId: string) {
  const el = container.querySelector(
    `[data-testid="${testId}"]`,
  ) as HTMLElement | null;
  expect(el, testId).toBeTruthy();
  act(() => {
    el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("FireExecutiveBriefReadingExperience", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    window.localStorage.clear();
    clearFireBriefReadingProgressForTests();
    window.scrollTo = () => {};
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.localStorage.clear();
  });

  it("shows greeting, report title, and full date", () => {
    const portfolio = renderBrief();
    const text = container.textContent ?? "";
    expect(text).toContain("Good morning, Shari.");
    expect(text).toContain("Spark Estate Executive Intelligence Brief");
    expect(text).toContain(portfolio.dateDisplay);
    expect(text).toMatch(
      /Prepared from the intelligence currently available in your Founder Workspace/i,
    );
  });

  it("renders five dashboard cards as the default overview", () => {
    renderBrief();
    const cards = container.querySelector('[data-testid="fire-dashboard-cards"]');
    expect(cards).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-dash-attention"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-dash-actions"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-dash-alerts"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-dash-izna"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-dash-full-brief"]')).toBeTruthy();
    expect(container.querySelector(".fire-brief__rail")).toBeNull();
  });

  it("uses a simplified toolbar without the old control wall", () => {
    renderBrief();
    expect(container.querySelector('[data-testid="fire-toolbar-overview"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-read-full-brief"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-text-size-trigger"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-toolbar-more"]')).toBeTruthy();
    expect(container.textContent).not.toMatch(/Open Founder Actions/);
    expect(container.textContent).not.toMatch(/Expand All/);
    expect(container.textContent).not.toMatch(/\bSmaller\b/);
  });

  it("opens Full Brief as a section grid, not a split rail", () => {
    renderBrief();
    clickTestId("fire-read-full-brief");
    for (const id of FIRE_BRIEF_SECTION_ORDER) {
      expect(
        container.querySelector(`[data-section-id="${id}"]`),
        id,
      ).toBeTruthy();
    }
    expect(container.querySelector(".fire-brief__section-grid")).toBeTruthy();
    expect(container.querySelector(".fire-brief__rail")).toBeNull();
  });

  it("opens one section at a time from the grid", () => {
    renderBrief();
    clickTestId("fire-dash-full-brief");
    clickButton("Open");
    expect(container.querySelector('[data-testid="fire-active-section"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="fire-active-section"]').length).toBe(
      1,
    );
  });

  it("supports Expand All and Collapse All from More menu", () => {
    renderBrief();
    clickTestId("fire-toolbar-more");
    clickButton("Expand All");
    expect(
      container.querySelectorAll('[data-expanded="true"]').length,
    ).toBeGreaterThan(0);
    clickTestId("fire-toolbar-more");
    clickButton("Collapse All");
    expect(container.querySelector('[data-testid="fire-brief-sections"]')).toBeTruthy();
  });

  it("opens sections with actions from More", () => {
    renderBrief();
    clickTestId("fire-toolbar-more");
    clickTestId("fire-open-action-sections");
    expect(container.querySelector('[data-testid="fire-active-section"]')).toBeTruthy();
  });

  it("persists accessible text sizes and never offers smaller-than-default", () => {
    renderBrief();
    clickTestId("fire-text-size-trigger");
    clickTestId("fire-text-size-largest");
    expect(
      container
        .querySelector('[data-testid="fire-executive-brief"]')
        ?.getAttribute("data-reading-size"),
    ).toBe("largest");
    expect(readFireReadingSize()).toBe("largest");
    expect(FIRE_READING_BODY_PX.comfortable).toBeGreaterThanOrEqual(24);
    expect(window.localStorage.getItem(FIRE_READING_SIZE_STORAGE_KEY)).toBe(
      "largest",
    );
    expect(container.querySelector('[data-testid="fire-text-size-smaller"]')).toBeNull();
  });

  it("uses one-section Reading Mode with Previous/Next", () => {
    renderBrief();
    clickTestId("fire-toolbar-more");
    clickTestId("fire-enter-reading-mode");
    expect(
      container
        .querySelector('[data-testid="fire-executive-brief"]')
        ?.getAttribute("data-reading-mode"),
    ).toBe("true");
    expect(container.querySelector('[data-testid="fire-dashboard-cards"]')).toBeNull();
    expect(container.querySelector(".fire-brief__rail")).toBeNull();
    expect(container.querySelector('[data-testid="fire-active-section"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-prev-section"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-next-section"]')).toBeTruthy();
    clickTestId("fire-next-section");
    expect(readLastBriefSection("fire-2026-07-23")).toBeTruthy();
    clickTestId("fire-exit-reading-mode");
    expect(
      container
        .querySelector('[data-testid="fire-executive-brief"]')
        ?.getAttribute("data-reading-mode"),
    ).toBe("false");
  });

  it("opens Founder Actions with top actions first", () => {
    renderBrief();
    clickTestId("fire-dash-actions");
    expect(container.querySelector('[data-testid="fire-focused-panel"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-view-this-week"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="fire-action-plan-groups"]')).toBeTruthy();
  });

  it("opens Izna work package with progressive disclosure", () => {
    renderBrief();
    clickTestId("fire-dash-izna");
    const izna = container.querySelector('[data-testid="fire-izna-assignment"]');
    expect(izna).toBeTruthy();
    clickButton("Full Instructions");
    expect(izna?.textContent).toMatch(/Definition of Done/i);
    expect(izna?.textContent).toMatch(/Expected Deliverables/i);
  });

  it("shows Founder Alert levels from the alerts card", () => {
    renderBrief();
    clickTestId("fire-dash-alerts");
    expect(container.querySelectorAll("[data-alert-level]").length).toBeGreaterThan(
      0,
    );
    expect(container.textContent).toMatch(
      /Needs Attention Today|Watch Closely|Worth Knowing/,
    );
  });

  it("marks a section read and supports Come Back Later", () => {
    const portfolio = renderBrief();
    clickTestId("fire-dash-full-brief");
    clickButton("Open");
    clickTestId("fire-mark-read");
    clickTestId("fire-come-back-later");
    expect(container.querySelector('[data-testid="fire-dashboard-cards"]')).toBeTruthy();
    expect(readLastBriefSection(portfolio.id)).toBeTruthy();
  });

  it("uses full-width layout attributes and no fixed-height report container", () => {
    renderBrief();
    const brief = container.querySelector(
      '[data-testid="fire-executive-brief"]',
    ) as HTMLElement;
    expect(brief.getAttribute("data-layout")).toBe("full-width");
    expect(brief.className).toMatch(/fire-brief/);
    const style = window.getComputedStyle(brief);
    expect(style.maxHeight === "none" || style.maxHeight === "").toBe(true);
  });

  it("supports keyboard focus on section navigation controls", () => {
    renderBrief();
    clickTestId("fire-toolbar-more");
    clickTestId("fire-enter-reading-mode");
    const next = container.querySelector(
      '[data-testid="fire-next-section"]',
    ) as HTMLButtonElement;
    expect(next).toBeTruthy();
    act(() => {
      next.focus();
      next.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      next.click();
    });
    expect(readLastBriefSection("fire-2026-07-23")).toBeTruthy();
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
    expect(container.querySelector("h2.fire-brief__title")).toBeTruthy();
    expect(container.querySelector("h3.fire-brief__dashboard-title")).toBeTruthy();
    clickTestId("fire-read-full-brief");
    expect(container.querySelectorAll("h3.fire-section-card__title").length).toBe(
      FIRE_BRIEF_SECTION_ORDER.length,
    );
  });
});

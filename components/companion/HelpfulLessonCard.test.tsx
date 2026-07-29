/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HelpfulLesson } from "@/lib/dailyOpening/helpfulLessons/types";

import { TodaysWelcomeCard } from "./GlobalDailyCompanionOpening";

const richLesson: HelpfulLesson = {
  id: "people-i-help",
  title: "People I Help",
  shortExplanation: "Short fallback label.",
  destinationId: "people-i-help",
  actionLabel: "Show Me",
  category: "client-profile",
  explanation:
    "This is where you describe who your business serves. When Spark understands your audience, ideas and writing fit the right people.",
  whyNow: "Even a rough first pass gives later conversations something to build on.",
  primaryActionLabel: "Open People I Help",
  tellMeMore: {
    whatItDoes: "Holds a simple picture of your ideal clients.",
    howItHelps: "Spark uses it quietly in the background.",
    whatToExpect: "Add as little or as much as you like.",
    optional: true,
    timeEstimate: "5 minutes",
  },
};

const thinLesson: HelpfulLesson = {
  id: "park-it",
  title: "Park It",
  shortExplanation: "Park one thing here so you can stop carrying it.",
  actionLabel: "Park This",
};

describe("Show Me Something Helpful — rich helpful lesson card", () => {
  let container: HTMLDivElement;
  let root: Root;
  const handlers = {
    onShowMe: vi.fn(),
    onSomethingElse: vi.fn(),
    onMaybeLater: vi.fn(),
  };

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.clearAllMocks();
  });

  function render(lesson: HelpfulLesson) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <TodaysWelcomeCard
          mode="show-something-helpful"
          lesson={lesson}
          onShowMe={handlers.onShowMe}
          onSomethingElse={handlers.onSomethingElse}
          onMaybeLater={handlers.onMaybeLater}
        />,
      );
    });
  }

  function q(testid: string) {
    return container.querySelector(
      `[data-testid='${testid}']`,
    ) as HTMLElement | null;
  }

  function click(el: HTMLElement | null) {
    act(() => {
      el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  it("renders title, multi-sentence explanation, why-now, and a primary action", () => {
    render(richLesson);
    expect(q("helpful-lesson-title")?.textContent).toContain("People I Help");
    const explanation = q("helpful-lesson-explanation")?.textContent ?? "";
    expect(explanation).toContain("who your business serves");
    // Multi-sentence — not a one-liner.
    expect(explanation.split(/[.!?]/).filter((s) => s.trim()).length).toBeGreaterThanOrEqual(2);
    expect(q("helpful-lesson-why-now")?.textContent).toContain("rough first pass");
    expect(q("helpful-lesson-show-me")?.textContent).toContain(
      "Open People I Help",
    );
    // Explanation replaces the short fallback when present.
    expect(container.textContent).not.toContain("Short fallback label.");
  });

  it("Tell me more expands in place and does not navigate or fire actions", () => {
    render(richLesson);
    expect(q("helpful-lesson-tell-me-more")).toBeFalsy();
    const toggle = q("helpful-lesson-tell-me-more-toggle");
    expect(toggle?.textContent).toContain("Tell me more");
    click(toggle);
    const panel = q("helpful-lesson-tell-me-more");
    expect(panel).toBeTruthy();
    expect(panel?.textContent).toContain("ideal clients");
    expect(panel?.textContent).toContain("optional");
    expect(panel?.textContent).toContain("5 minutes");
    // Expanding must not save or navigate.
    expect(handlers.onShowMe).not.toHaveBeenCalled();
    expect(handlers.onSomethingElse).not.toHaveBeenCalled();
    // Collapses again.
    click(q("helpful-lesson-tell-me-more-toggle"));
    expect(q("helpful-lesson-tell-me-more")).toBeFalsy();
  });

  it("wires primary action, Something else, and Maybe later distinctly", () => {
    render(richLesson);
    click(q("helpful-lesson-show-me"));
    expect(handlers.onShowMe).toHaveBeenCalledTimes(1);
    click(q("helpful-lesson-something-else"));
    expect(handlers.onSomethingElse).toHaveBeenCalledTimes(1);
    click(q("helpful-lesson-maybe-later"));
    expect(handlers.onMaybeLater).toHaveBeenCalledTimes(1);
  });

  it("stays backward-compatible with a thin lesson (no rich fields)", () => {
    render(thinLesson);
    expect(q("helpful-lesson-title")?.textContent).toContain("Park It");
    expect(q("helpful-lesson-explanation")?.textContent).toContain(
      "Park one thing here",
    );
    // No rich extras → no why-now line and no Tell me more toggle.
    expect(q("helpful-lesson-why-now")).toBeFalsy();
    expect(q("helpful-lesson-tell-me-more-toggle")).toBeFalsy();
    // Primary label falls back to actionLabel.
    expect(q("helpful-lesson-show-me")?.textContent).toContain("Park This");
  });
});

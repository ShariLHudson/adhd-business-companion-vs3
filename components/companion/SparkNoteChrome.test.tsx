/**
 * @vitest-environment jsdom
 * Welcome Home Today's Spark teaser — home-only, once/day, click navigates to
 * Personal Library (does NOT expand the legacy card in place).
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "@/lib/sparkNote/persistence";
import { SparkNoteChrome } from "./SparkNoteChrome";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const q = (sel: string) => document.querySelector<HTMLElement>(sel);
const qa = (sel: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(sel));

function render(props: Parameters<typeof SparkNoteChrome>[0]) {
  act(() => root.render(<SparkNoteChrome {...props} />));
}
function click(el: Element | null) {
  if (!el) throw new Error("missing element to click");
  act(() => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  resetSparkNoteStoreForTests();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("SparkNoteChrome — Welcome Home teaser", () => {
  it("renders exactly one small image teaser on Welcome Home", () => {
    render({ visible: true, isWelcomeHome: true, onOpenTodaysSpark: vi.fn() });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    expect(q(".spark-note-teaser__image")).not.toBeNull();
  });

  it("does not render outside Welcome Home", () => {
    render({ visible: true, isWelcomeHome: false, onOpenTodaysSpark: vi.fn() });
    expect(q('[data-testid="spark-note-anchor"]')).toBeNull();
  });

  it("does not render when chrome is hidden", () => {
    render({ visible: false, isWelcomeHome: true, onOpenTodaysSpark: vi.fn() });
    expect(q('[data-testid="spark-note-anchor"]')).toBeNull();
  });

  it("click navigates via onOpenTodaysSpark, never expands the legacy card, and defers dismissal until the room opens", () => {
    const onOpenTodaysSpark = vi.fn();
    render({ visible: true, isWelcomeHome: true, onOpenTodaysSpark });
    click(q(".spark-note-teaser__button"));
    expect(onOpenTodaysSpark).toHaveBeenCalledTimes(1);
    // No legacy expanded card is opened by the chrome itself.
    expect(q('[data-testid="spark-note-expanded"]')).toBeNull();
    // NOT dismissed by the click alone — the room marks it opened on arrival.
    expect(isHomeTeaserDismissedToday()).toBe(false);
  });
});

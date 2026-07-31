/**
 * @vitest-environment jsdom
 * Today's Spark teaser — size/placement slice: one small Estate-wide teaser,
 * never dismissed this slice, click does not route to the old Spark Card.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  dismissHomeTeaserToday,
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

describe("SparkNoteChrome — small Estate-wide teaser", () => {
  it("renders exactly one teaser when visible", () => {
    render({ visible: true });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    expect(q(".spark-note-teaser__image")).not.toBeNull();
  });

  it("renders across Estate screens, not only Welcome Home", () => {
    render({ visible: true, isWelcomeHome: false });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
  });

  it("does not render when the chrome is hidden", () => {
    render({ visible: false });
    expect(q('[data-testid="spark-note-anchor"]')).toBeNull();
  });

  it("does not dismiss during navigation or after a dismiss call", () => {
    render({ visible: true });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    // Simulate navigation re-render + an unrelated dismiss write.
    dismissHomeTeaserToday();
    render({ visible: true, isWelcomeHome: false });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
  });

  it("click does not route (no legacy Spark Card, no onOpenTodaysSpark)", () => {
    const onOpenTodaysSpark = vi.fn();
    render({ visible: true, onOpenTodaysSpark });
    click(q(".spark-note-teaser__button"));
    expect(q('[data-testid="spark-note-expanded"]')).toBeNull();
    expect(onOpenTodaysSpark).not.toHaveBeenCalled();
    // Teaser stays (not dismissed by the click).
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
  });

  it("anchors placement above the composer by publishing --spark-teaser-bottom", () => {
    document.documentElement.style.removeProperty("--spark-teaser-bottom");
    render({ visible: true });
    expect(
      document.documentElement.style.getPropertyValue("--spark-teaser-bottom"),
    ).not.toBe("");
  });

  it("CSS anchors the teaser bottom to the composer variable (not the viewport bottom)", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/spark-note.css"),
      "utf8",
    );
    const block = css.slice(
      css.indexOf(".spark-note-teaser {"),
      css.indexOf(".spark-note-teaser__button"),
    );
    expect(block).toContain("var(--spark-teaser-bottom");
  });

  it("constrains the teaser to the approved small-card size in CSS", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/spark-note.css"),
      "utf8",
    );
    const block = css.slice(
      css.indexOf(".spark-note-teaser {"),
      css.indexOf(".spark-note-teaser__button"),
    );
    expect(block).toContain("width: 88px");
    expect(block).toContain("max-width: 15vw");
    expect(block).not.toContain("15rem");
    expect(block).not.toContain("18rem");
  });
});

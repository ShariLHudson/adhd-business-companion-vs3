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

  it("teaser click opens the gift room — not the old Spark Card, not the dashboard Personal Library", () => {
    const onOpenTodaysSpark = vi.fn();
    render({ visible: true, onOpenTodaysSpark });
    expect(q('[data-testid="todays-spark-gift-room"]')).toBeNull();
    click(q(".spark-note-teaser__button"));
    expect(q('[data-testid="todays-spark-gift-room"]')).not.toBeNull();
    // Old Spark Card and dashboard Personal Library must NOT open.
    expect(q('[data-testid="spark-note-expanded"]')).toBeNull();
    expect(q('[data-testid="personal-library-room"]')).toBeNull();
    expect(q('[data-testid="spark-note-my-collection"]')).toBeNull();
    // Legacy routing prop is not used.
    expect(onOpenTodaysSpark).not.toHaveBeenCalled();
  });

  it("gift room shows the wrapped gift and the click instruction", () => {
    render({ visible: true });
    click(q(".spark-note-teaser__button"));
    expect(q('[data-testid="tsg-gift"]')).not.toBeNull();
    expect(q('[data-testid="tsg-callout"]')?.textContent).toContain(
      "Click the gift",
    );
  });

  it("keeps the teaser present while the gift room is open (not dismissed)", () => {
    render({ visible: true });
    click(q(".spark-note-teaser__button"));
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
  });

  it("Welcome Home / back closes the gift room and returns to the previous screen", () => {
    render({ visible: true });
    click(q(".spark-note-teaser__button"));
    expect(q('[data-testid="todays-spark-gift-room"]')).not.toBeNull();
    click(q('[data-testid="tsg-welcome-home"]'));
    expect(q('[data-testid="todays-spark-gift-room"]')).toBeNull();
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

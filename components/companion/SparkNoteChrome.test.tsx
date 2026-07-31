/**
 * @vitest-environment jsdom
 * Today's Spark: teaser (Estate-wide) -> gift room -> full pinned Spark Card.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "@/lib/sparkNote/persistence";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
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
function openGift() {
  click(q(".spark-note-teaser__button")); // teaser -> gift room
  click(q('[data-testid="tsg-gift"]')); // gift -> full card
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  resetSparkNoteStoreForTests();
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() =>
    Promise.resolve(),
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("SparkNoteChrome — teaser → gift room → full Spark Card", () => {
  it("renders exactly one small teaser Estate-wide when visible", () => {
    render({ visible: true, isWelcomeHome: false });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    expect(q(".spark-note-teaser__image")).not.toBeNull();
  });

  it("does not render when the chrome is hidden", () => {
    render({ visible: false });
    expect(q('[data-testid="spark-note-anchor"]')).toBeNull();
  });

  it("teaser click opens the gift room (not the card, not the dashboard library)", () => {
    render({ visible: true });
    click(q(".spark-note-teaser__button"));
    expect(q('[data-testid="todays-spark-gift-room"]')).not.toBeNull();
    expect(q('[data-testid="spark-note-expanded"]')).toBeNull(); // card not yet
    expect(q('[data-testid="personal-library-room"]')).toBeNull();
    // Uses the exact extracted prototype room (not a substitute image).
    expect(q(".tsg-room__bg")?.style.backgroundImage).toContain(
      "todays-spark-gift-room-background",
    );
  });

  it("keeps the teaser visible before the gift is clicked", () => {
    render({ visible: true });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    click(q(".spark-note-teaser__button")); // gift room open, gift not clicked
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    expect(isHomeTeaserDismissedToday()).toBe(false);
  });

  it("gift click opens the exact pinned daily Spark (not a different one)", () => {
    const expected = resolveDailySparkCard({}).card; // pins today's Spark
    render({ visible: true });
    openGift();
    const card = q('[data-testid="spark-note-expanded"]');
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain(expected.title);
  });

  it("full card renders complete content, image, and durable Save", () => {
    render({ visible: true });
    openGift();
    const card = q('[data-testid="spark-note-expanded"]');
    expect(card?.textContent).toContain("The Story");
    expect(card?.querySelector("img")).not.toBeNull(); // topic image
    // Durable Save This Spark control is present (same SparkNoteExpanded flow).
    const hasSave = qa('[data-testid="spark-note-expanded"] button').some(
      (b) => b.textContent?.trim() === "Save",
    );
    expect(hasSave).toBe(true);
  });

  it("hides the teaser only after the full card opens successfully", () => {
    render({ visible: true });
    click(q(".spark-note-teaser__button"));
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1); // still there
    click(q('[data-testid="tsg-gift"]')); // full card opens
    expect(q('[data-testid="spark-note-anchor"]')).toBeNull(); // now hidden
    expect(isHomeTeaserDismissedToday()).toBe(true);
  });

  it("closing the full card returns to the gift room", () => {
    render({ visible: true });
    openGift();
    expect(q('[data-testid="spark-note-expanded"]')).not.toBeNull();
    click(q('[aria-label="Close Spark Card"]'));
    expect(q('[data-testid="spark-note-expanded"]')).toBeNull();
    expect(q('[data-testid="todays-spark-gift-room"]')).not.toBeNull();
  });

  it("anchors placement above the composer by publishing --spark-teaser-bottom", () => {
    document.documentElement.style.removeProperty("--spark-teaser-bottom");
    render({ visible: true });
    expect(
      document.documentElement.style.getPropertyValue("--spark-teaser-bottom"),
    ).not.toBe("");
  });

  it("CSS constrains the teaser to the approved small-card size", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/spark-note.css"),
      "utf8",
    );
    const block = css.slice(
      css.indexOf(".spark-note-teaser {"),
      css.indexOf(".spark-note-teaser__button"),
    );
    expect(block).toContain("width: 88px");
    expect(block).toContain("var(--spark-teaser-bottom");
  });
});

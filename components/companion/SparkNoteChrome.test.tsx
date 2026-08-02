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
  getStoredDailySparkId,
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "@/lib/sparkNote/persistence";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import { resolvePinnedDailySparkCard } from "@/lib/sparkNote/evaluateDailySparkNote";
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
    expect(q('[data-testid="todays-spark-card"]')).toBeNull(); // card not yet
    expect(q('[data-testid="personal-library-room"]')).toBeNull();
    // Uses the one approved Personal Library image (not a substitute image).
    expect(q(".tsg-room__bg")?.style.backgroundImage).toContain(
      "personal-library-background",
    );
  });

  it("keeps the teaser visible before the gift is clicked", () => {
    render({ visible: true });
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    click(q(".spark-note-teaser__button")); // gift room open, gift not clicked
    expect(qa('[data-testid="spark-note-anchor"]')).toHaveLength(1);
    expect(isHomeTeaserDismissedToday()).toBe(false);
  });

  it("gift click opens the exact pinned daily Spark id (not a different/fallback one)", () => {
    const expected = resolveDailySparkCard({}).card; // establishes today's pin
    render({ visible: true });
    openGift();
    const card = q('[data-testid="todays-spark-card"]');
    expect(card).not.toBeNull();
    // The opened card is the exact stored pin, resolved by id.
    const pinnedId = getStoredDailySparkId();
    expect(pinnedId).toBe(expected.id);
    const pinned = resolvePinnedDailySparkCard({});
    expect(pinned?.id).toBe(pinnedId);
    expect(card?.textContent).toContain(expected.title);
  });

  it("full card renders in the card-shell style with content and durable Save", () => {
    render({ visible: true });
    openGift();
    const card = q('[data-testid="todays-spark-card"]');
    // Prototype card-shell structure (not the legacy keepsake card).
    expect(card?.querySelector(".tsc-card")).not.toBeNull();
    expect(card?.querySelector(".tsc-eyebrow")?.textContent).toContain(
      "Today's Spark",
    );
    expect(card?.textContent).toContain("The Story");
    // Durable "Save This Spark" control is present.
    const hasSave = qa('[data-testid="todays-spark-card"] button').some(
      (b) => b.textContent?.trim() === "Save This Spark",
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
    expect(q('[data-testid="todays-spark-card"]')).not.toBeNull();
    click(q('[aria-label="Close Today\'s Spark"]'));
    expect(q('[data-testid="todays-spark-card"]')).toBeNull();
    expect(q('[data-testid="todays-spark-gift-room"]')).not.toBeNull();
  });

  it("CSS pins the teaser to the lower-right safe area at the approved size", () => {
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/spark-note.css"),
      "utf8",
    );
    const block = css.slice(
      css.indexOf(".spark-note-teaser {"),
      css.indexOf(".spark-note-teaser__button"),
    );
    expect(block).toContain("position: fixed");
    expect(block).toContain("right: 20px");
    expect(block).toContain("bottom: calc(env(safe-area-inset-bottom, 0px) + 20px)");
    expect(block).toContain("width: 88px");
    // Never centered/floating inward, and no composer-height variable.
    expect(block).not.toContain("var(--spark-teaser-bottom");
    expect(block).not.toContain("translateX");
    expect(block).not.toContain("left: 50%");
  });
});

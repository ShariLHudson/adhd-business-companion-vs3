/**
 * @vitest-environment jsdom
 * My Personal Library room — the approved flat room image plus transparent,
 * accessible hotspots: the gift opens the real Today's Spark, "My Spark
 * Collection / View all" opens the real saved-card collection, and the drawn
 * "Welcome Home" pill goes back. react-dom/client + act; memory backend for
 * Supabase. `resolveDailySparkCard` is mocked so the gift opens a deterministic
 * card (its own selection logic is covered in evaluateDailySparkNote.test.ts).
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDurableRecordAuthForTests,
  createMemoryDurableRecordBackend,
  setDurableRecordAuthForTests,
  setDurableRecordBackendForTests,
} from "@/lib/durableRecords/repository";
import { clearMemberRecordDurableMarksForTests } from "@/lib/durableRecords/verifiedRegistry";
import { setSavedSparkDurableEnabledForTests } from "@/lib/durableRecords/flags";
import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";
import { resolveSparkCardImage } from "@/lib/sparkNote/resolveSparkCardImage";
import {
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "@/lib/sparkNote/persistence";
import { resolveDailySparkCard } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import { PersonalLibraryRoom } from "./PersonalLibraryRoom";

// The gift must open exactly the resolved daily card. Mock the resolver so the
// test is deterministic; its selection logic has dedicated coverage elsewhere.
vi.mock("@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration", () => ({
  resolveDailySparkCard: vi.fn(),
}));
const mockResolveDaily = vi.mocked(resolveDailySparkCard);

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const CARD = SPARK_NOTE_CATALOG[0]!;

let container: HTMLDivElement;
let root: Root;
const onBack = vi.fn();

const q = (sel: string) => document.querySelector<HTMLElement>(sel);

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
async function render(props: Partial<Parameters<typeof PersonalLibraryRoom>[0]> = {}) {
  await act(async () => {
    root.render(
      <PersonalLibraryRoom onBack={onBack} backLabel="Welcome Home" {...props} />,
    );
  });
  await flush();
}
function click(el: Element | null) {
  if (!el) throw new Error("missing element to click");
  act(() => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onBack.mockClear();
  mockResolveDaily.mockReset();
  mockResolveDaily.mockReturnValue({ card: CARD });
  localStorage.clear();
  resetSparkNoteStoreForTests();
  clearMemberRecordDurableMarksForTests();
  clearDurableRecordAuthForTests();
  setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
  setDurableRecordAuthForTests("user-a");
  setSavedSparkDurableEnabledForTests(true);
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() =>
    Promise.resolve(),
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setSavedSparkDurableEnabledForTests(null);
  clearDurableRecordAuthForTests();
  setDurableRecordBackendForTests(null);
  vi.restoreAllMocks();
});

describe("PersonalLibraryRoom", () => {
  it("renders the approved room image and a working back control", async () => {
    await render();
    expect(q('[data-testid="personal-library-room"]')).not.toBeNull();
    const img = q('[data-testid="personal-library-image"]') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe(
      "/backgrounds/personal-library-background.png",
    );
    expect((img?.getAttribute("alt") ?? "").length).toBeGreaterThan(0);

    const back = q('[data-testid="personal-library-back"]');
    expect(back?.tagName).toBe("BUTTON");
    expect(back?.getAttribute("aria-label")).toBe("Welcome Home");
    click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("never renders the artwork's baked-in example content as member data", async () => {
    await render();
    const text = document.body.textContent ?? "";
    expect(text).not.toContain("Atomic Habits");
    expect(text).not.toContain("View all (87)");
    expect(text).not.toContain("Designing a Life");
  });

  it("gives the gift an accessible name and opens the real Today's Spark on it", async () => {
    await render();
    const gift = q('[data-testid="pl-todays-spark-open"]');
    expect(gift?.tagName).toBe("BUTTON");
    expect(gift?.getAttribute("aria-label")).toBe("Open Today's Spark");
    expect(q('[data-testid="todays-spark-card"]')).toBeNull();

    click(gift);
    await flush();
    const opened = q('[data-testid="todays-spark-card"]');
    expect(opened).not.toBeNull();
    // Opens exactly the resolved daily card — with its Story / Spark / Action.
    expect(opened?.textContent).toContain(CARD.title);
    expect(opened?.textContent).toContain("The Story");
  });

  it("returns to the room when the opened Spark is closed", async () => {
    await render();
    click(q('[data-testid="pl-todays-spark-open"]'));
    await flush();
    expect(q('[data-testid="todays-spark-card"]')).not.toBeNull();

    click(q(".tsc-back"));
    await flush();
    expect(q('[data-testid="todays-spark-card"]')).toBeNull();
    expect(q('[data-testid="personal-library-room"]')).not.toBeNull();
  });

  it("opens the real saved-card collection from the collection hotspot", async () => {
    await render();
    const viewAll = q('[data-testid="pl-spark-collection-viewall"]');
    expect(viewAll?.getAttribute("aria-label")).toBe("Open My Spark Collection");
    click(viewAll);
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
  });

  it("shows an honest state — never fake content — when no card is available", async () => {
    mockResolveDaily.mockReturnValue({ card: null });
    await render();
    // No gift button to open a non-existent card…
    expect(q('[data-testid="pl-todays-spark-open"]')).toBeNull();
    // …and a truthful, quiet unavailable state instead.
    const unavailable = q('[data-testid="pl-todays-spark-unavailable"]');
    expect(unavailable).not.toBeNull();
    expect(unavailable?.getAttribute("role")).toBe("status");
    expect(q('[data-testid="todays-spark-card"]')).toBeNull();
  });

  it("on teaser arrival, lands in the room with the gift focused and does not auto-open the card", async () => {
    const onArrivalConsumed = vi.fn();
    await render({ arrivalMode: true, onArrivalConsumed });
    expect(q('[data-testid="personal-library-room"]')).not.toBeNull();
    expect(q('[data-testid="pl-todays-spark-open"]')).not.toBeNull();
    // The full-card overlay is NOT auto-opened…
    expect(q('[data-testid="todays-spark-card"]')).toBeNull();
    // …the gift is focused for keyboard members…
    expect(document.activeElement).toBe(q('[data-testid="pl-todays-spark-open"]'));
    expect(onArrivalConsumed).toHaveBeenCalled();
    // …and the Welcome Home teaser is marked opened for the day.
    expect(isHomeTeaserDismissedToday()).toBe(true);
  });

  it("does not wire the branded edition covers as individual card hero images", async () => {
    // The card-image system is untouched: resolving a real card must never
    // return one of the /spark-card-images edition covers.
    const image = resolveSparkCardImage(CARD);
    expect(image.src ?? "").not.toContain("/spark-card-images/");
  });
});

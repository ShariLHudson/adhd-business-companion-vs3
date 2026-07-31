/**
 * @vitest-environment jsdom
 * My Personal Library room (Slice 3a) — durable My Spark Collection, click-to-open,
 * View all, honest empties. react-dom/client + act; memory backend for Supabase.
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
import { upsertSavedSparkDurable } from "@/lib/durableRecords/domains/savedSpark";
import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";
import {
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "@/lib/sparkNote/persistence";
import { PersonalLibraryRoom } from "./PersonalLibraryRoom";

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
async function render() {
  await act(async () => {
    root.render(<PersonalLibraryRoom onBack={onBack} backLabel="Welcome Home" />);
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

async function seed() {
  await upsertSavedSparkDurable({
    sparkId: CARD.id,
    savedAtIso: "2026-07-31T12:00:00.000Z",
    title: CARD.title,
    category: CARD.category,
    categoryLabel: CARD.categoryLabel,
  });
}

describe("PersonalLibraryRoom (Slice 3a)", () => {
  it("renders the room shell with background and a working back control", async () => {
    await render();
    expect(q('[data-testid="personal-library-room"]')).not.toBeNull();
    expect(q(".personal-library-room__bg")).not.toBeNull();
    click(q('[data-testid="personal-library-back"]'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows honest empty states, never the artwork's illustrative content", async () => {
    await render();
    const text = document.body.textContent ?? "";
    expect(text).toContain("Available soon"); // My Journey upcoming sections
    expect(text).toContain("Discovery collections are coming soon"); // The World
    // None of the baked-in illustrative names are rendered as member data.
    expect(text).not.toContain("Atomic Habits");
    expect(text).not.toContain("View all (87)");
  });

  it("renders My Spark Collection from real durable data with a real count", async () => {
    await seed();
    await render();
    expect(document.body.textContent).toContain(CARD.title);
    expect(q('[data-testid="pl-spark-collection-viewall"]')?.textContent).toContain(
      "View all (1)",
    );
  });

  it("opens the correct full Spark Card when a saved card is clicked", async () => {
    await seed();
    await render();
    click(q(`[data-testid="pl-spark-open-${CARD.id}"]`));
    await flush();
    const opened = q('[data-testid="spark-note-expanded"]');
    expect(opened).not.toBeNull();
    expect(opened?.textContent).toContain(CARD.title);
  });

  it("View all opens the full My Spark Collection", async () => {
    await seed();
    await render();
    click(q('[data-testid="pl-spark-collection-viewall"]'));
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
  });

  it("shows a truthful empty collection state when nothing is saved", async () => {
    await render();
    expect(document.body.textContent).toContain("Sparks you save will appear here");
  });

  it("offers Today's Spark in the room and opens it on click", async () => {
    await render();
    expect(q('[data-testid="pl-todays-spark"]')).not.toBeNull();
    click(q('[data-testid="pl-todays-spark-open"]'));
    await flush();
    expect(q('[data-testid="spark-note-expanded"]')).not.toBeNull();
  });

  it("on teaser arrival, lands in the room with Today's Spark available and does NOT auto-open the legacy card", async () => {
    const onArrivalConsumed = vi.fn();
    await act(async () => {
      root.render(
        <PersonalLibraryRoom
          onBack={onBack}
          backLabel="Welcome Home"
          arrivalMode
          onArrivalConsumed={onArrivalConsumed}
        />,
      );
    });
    await flush();
    // The room (My Personal Library) is what opens, with Today's Spark available…
    expect(q('[data-testid="personal-library-room"]')).not.toBeNull();
    expect(q('[data-testid="pl-todays-spark-open"]')).not.toBeNull();
    // …and the legacy full-card overlay is NOT auto-opened.
    expect(q('[data-testid="spark-note-expanded"]')).toBeNull();
    expect(onArrivalConsumed).toHaveBeenCalled();
    // Teaser is marked opened for the day only now that the room has opened.
    expect(isHomeTeaserDismissedToday()).toBe(true);
  });
});

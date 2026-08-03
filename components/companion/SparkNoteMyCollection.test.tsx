/**
 * @vitest-environment jsdom
 * My Spark Collection — Item Type · Alphabet Range · Date filters, gated results,
 * durable retrieval, click-to-open (full card with saved note), remove, and
 * honest empty states. react-dom/client + act; memory backend stands in for Supabase.
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
import {
  listSavedSparkDurable,
  upsertSavedSparkDurable,
} from "@/lib/durableRecords/domains/savedSpark";
import { SPARK_NOTE_CATALOG } from "@/lib/sparkNote/catalog";
import { alphabetRangeOf } from "@/lib/sparkNote/personalLibraryFilters";
import { resetSparkNoteStoreForTests } from "@/lib/sparkNote/persistence";
import { SparkNoteMyCollection } from "./SparkNoteMyCollection";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const CARD = SPARK_NOTE_CATALOG[0]!;
const CARD_RANGE = alphabetRangeOf(CARD.title)!;

let container: HTMLDivElement;
let root: Root;

const q = (sel: string) => document.querySelector<HTMLElement>(sel);

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function render() {
  await act(async () => {
    root.render(<SparkNoteMyCollection onClose={vi.fn()} onBack={vi.fn()} />);
  });
  await flush();
}

function click(el: Element | null) {
  if (!el) throw new Error("missing element to click");
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

/** Set a controlled <select> value and fire React's onChange. */
function selectValue(testid: string, value: string) {
  const el = q(`[data-testid="${testid}"]`) as HTMLSelectElement | null;
  if (!el) throw new Error(`missing select ${testid}`);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function chooseSparkCards(range = CARD_RANGE) {
  selectValue("spark-note-collection-item-type", "spark-cards");
  selectValue("spark-note-collection-alphabet-range", range);
  await flush();
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
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

async function seedSavedSpark(note?: string) {
  await upsertSavedSparkDurable({
    sparkId: CARD.id,
    savedAtIso: new Date().toISOString(),
    title: CARD.title,
    category: CARD.category,
    categoryLabel: CARD.categoryLabel,
    ...(note ? { note } : {}),
  });
}

describe("SparkNoteMyCollection — filters, gating, records", () => {
  it("offers exactly the five approved Item Types", async () => {
    await render();
    const options = Array.from(
      (q('[data-testid="spark-note-collection-item-type"]') as HTMLSelectElement)
        .options,
    )
      .map((o) => o.textContent)
      .slice(1); // drop the "Choose a type…" placeholder
    expect(options).toEqual([
      "Spark Cards",
      "My Ideas & Notes",
      "Actions I Tried",
      "What I’ve Learned",
      "Questions to Revisit",
    ]);
  });

  it("offers exactly A–F, G–L, M–R, S–Z ranges", async () => {
    await render();
    const options = Array.from(
      (
        q(
          '[data-testid="spark-note-collection-alphabet-range"]',
        ) as HTMLSelectElement
      ).options,
    )
      .map((o) => o.textContent)
      .slice(1);
    expect(options).toEqual(["A–F", "G–L", "M–R", "S–Z"]);
  });

  it("shows NO records before Item Type AND Alphabet Range are selected", async () => {
    await seedSavedSpark();
    await render();
    expect(
      q('[data-testid="spark-note-collection-choose-filters"]'),
    ).not.toBeNull();
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).toBeNull();
    // Selecting only the Item Type still shows nothing.
    selectValue("spark-note-collection-item-type", "spark-cards");
    await flush();
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).toBeNull();
  });

  it("Spark Cards + matching range reveals the saved Spark", async () => {
    await seedSavedSpark();
    await render();
    await chooseSparkCards();
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).not.toBeNull();
    expect(document.body.textContent).toContain(CARD.title);
  });

  it("opens the full Spark Card, reopening the saved note", async () => {
    await seedSavedSpark("Remember to try this at the shop");
    await render();
    await chooseSparkCards();
    click(q(`[data-testid="spark-note-collection-open-${CARD.id}"]`));
    await flush();
    const opened = q('[data-testid="todays-spark-card"]');
    expect(opened).not.toBeNull();
    expect(opened?.textContent).toContain(CARD.title);
    const note = q(`#tsc-note-${CARD.id}`) as HTMLTextAreaElement | null;
    expect(note?.value).toBe("Remember to try this at the shop");
  });

  it("My Ideas & Notes lists only saved Sparks that have a note", async () => {
    await seedSavedSpark(); // no note
    await render();
    selectValue("spark-note-collection-item-type", "ideas-notes");
    selectValue("spark-note-collection-alphabet-range", CARD_RANGE);
    await flush();
    // No note on the seeded Spark → honest empty state, not the card.
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).toBeNull();
    expect(
      q('[data-testid="spark-note-collection-empty-state"]'),
    ).not.toBeNull();
  });

  it("shows an honest empty state for types with no records yet", async () => {
    await render();
    selectValue("spark-note-collection-item-type", "questions");
    selectValue("spark-note-collection-alphabet-range", "a-f");
    await flush();
    const empty = q('[data-testid="spark-note-collection-empty-state"]');
    expect(empty).not.toBeNull();
    expect(empty?.getAttribute("data-item-type")).toBe("questions");
    expect(
      q('[data-testid="spark-note-collection-empty-heading"]')?.textContent,
    ).toContain("questions");
  });

  it("removes a saved Spark durably; it does not reappear", async () => {
    await seedSavedSpark();
    await render();
    await chooseSparkCards();
    click(q(`[data-testid="spark-note-collection-remove-${CARD.id}"]`));
    await flush();
    await flush();
    expect(await listSavedSparkDurable()).toHaveLength(0);
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).toBeNull();
  });
});

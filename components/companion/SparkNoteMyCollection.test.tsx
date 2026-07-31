/**
 * @vitest-environment jsdom
 * My Spark Collection — durable retrieval + click-to-open + remove (Slice 2).
 * react-dom/client + act (repo convention); memory backend stands in for Supabase.
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
import { resetSparkNoteStoreForTests } from "@/lib/sparkNote/persistence";
import { SparkNoteMyCollection } from "./SparkNoteMyCollection";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const CARD = SPARK_NOTE_CATALOG[0]!;

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
    root.render(
      <SparkNoteMyCollection onClose={vi.fn()} onBack={vi.fn()} />,
    );
  });
  await flush();
}

function click(el: Element | null) {
  if (!el) throw new Error("missing element to click");
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
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

async function seedSavedSpark() {
  await upsertSavedSparkDurable({
    sparkId: CARD.id,
    savedAtIso: "2026-07-31T12:00:00.000Z",
    title: CARD.title,
    category: CARD.category,
    categoryLabel: CARD.categoryLabel,
  });
}

describe("SparkNoteMyCollection — durable retrieval (Slice 2)", () => {
  it("loads durable saved Sparks and shows the title", async () => {
    await seedSavedSpark();
    await render();
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).not.toBeNull();
    expect(document.body.textContent).toContain(CARD.title);
  });

  it("opens the correct full Spark Card when a saved Spark is clicked", async () => {
    await seedSavedSpark();
    await render();
    click(q(`[data-testid="spark-note-collection-open-${CARD.id}"]`));
    await flush();
    const opened = q('[data-testid="todays-spark-card"]');
    expect(opened).not.toBeNull();
    expect(opened?.textContent).toContain(CARD.title);
  });

  it("removes a saved Spark durably and it does not reappear after refresh", async () => {
    await seedSavedSpark();
    await render();
    click(q(`[data-testid="spark-note-collection-remove-${CARD.id}"]`));
    await flush();
    await flush();
    // Gone from the durable store...
    expect(await listSavedSparkDurable()).toHaveLength(0);
    // ...and gone from the rendered collection.
    expect(
      q(`[data-testid="spark-note-collection-open-${CARD.id}"]`),
    ).toBeNull();
  });

  it("shows an empty state with a calm path back to Today's Spark", async () => {
    await render();
    expect(
      q('[data-testid="spark-note-collection-back-to-today"]'),
    ).not.toBeNull();
    expect(document.body.textContent).toContain("Sparks you keep will appear");
  });
});

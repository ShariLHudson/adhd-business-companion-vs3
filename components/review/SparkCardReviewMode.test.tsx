/**
 * @vitest-environment jsdom
 * Private Spark Card Review Mode — shows all 112 runtime cards, opens the REAL
 * full Spark Card, marks review status + notes (persisted, separate from the
 * member note), and navigates Previous/Next. react-dom/client + act; memory
 * durable backend for the real card's save behavior.
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
import { resetSparkNoteStoreForTests } from "@/lib/sparkNote/persistence";
import {
  getSparkReview,
  resetSparkReviewStoreForTests,
} from "@/lib/sparkReview/reviewStore";
import { buildReviewList } from "@/lib/sparkReview/reviewList";
import { SparkCardReviewMode } from "./SparkCardReviewMode";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
const q = (sel: string) => document.querySelector<HTMLElement>(sel);
const qa = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel));

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
async function render() {
  await act(async () => {
    root.render(<SparkCardReviewMode />);
  });
  await flush();
}
function click(el: Element | null) {
  if (!el) throw new Error("missing element to click");
  act(() => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}
function typeInto(el: HTMLElement | null, value: string) {
  if (!el) throw new Error("missing input");
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function selectOption(el: HTMLElement | null, value: string) {
  if (!el) throw new Error("missing select");
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  resetSparkNoteStoreForTests();
  resetSparkReviewStoreForTests();
  clearMemberRecordDurableMarksForTests();
  clearDurableRecordAuthForTests();
  setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
  setDurableRecordAuthForTests("reviewer");
  setSavedSparkDurableEnabledForTests(true);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setSavedSparkDurableEnabledForTests(null);
  clearDurableRecordAuthForTests();
  setDurableRecordBackendForTests(null);
  vi.restoreAllMocks();
});

const byId = buildReviewList(SPARK_NOTE_CATALOG, { sort: "id" }, () => ({
  status: "needs_review",
  note: "",
  updatedAtIso: null,
}));

describe("SparkCardReviewMode", () => {
  it("lists exactly 112 distinct runtime cards with their fields", async () => {
    await render();
    const rows = qa('[data-testid^="scr-row-"]');
    expect(rows.length).toBe(112);
    expect(q('[data-testid="scr-count"]')?.textContent).toContain("112 shown");
    // A known card shows id, category, label, type.
    const row = q('[data-testid="scr-row-SPARK-INV-001"]');
    expect(row?.textContent).toContain("SPARK-INV-001");
    expect(row?.textContent).toContain("011"); // Innovation
  });

  it("opens the REAL full Spark Card with hero, Story, Spark, and Action", async () => {
    await render();
    click(q('[data-testid="scr-open-SPARK-INV-001"]'));
    await flush();
    expect(q('[data-testid="todays-spark-card"]')).not.toBeNull();
    expect(q('[data-testid="todays-spark-hero"]')).not.toBeNull();
    const text = document.body.textContent ?? "";
    expect(text).toContain("The Story");
    expect(text).toContain("Spark In Action");
    expect(q(".tsc-notes-input")).not.toBeNull(); // member note field
  });

  it("Previous/Next open the correct adjacent cards; Back returns to the list", async () => {
    await render();
    const first = byId[0]!;
    const second = byId[1]!;
    click(q(`[data-testid="scr-open-${first.id}"]`));
    await flush();
    expect(q('[data-testid="scr-position"]')?.textContent).toContain("1 / 112");

    click(q('[data-testid="scr-next"]'));
    await flush();
    expect(q('[data-testid="scr-position"]')?.textContent).toContain("2 / 112");
    expect(q('[data-testid="todays-spark-card"]')?.textContent).toContain(second.title);

    click(q('[data-testid="scr-prev"]'));
    await flush();
    expect(q('[data-testid="todays-spark-card"]')?.textContent).toContain(first.title);

    click(q('[data-testid="scr-back"]'));
    await flush();
    expect(q('[data-testid="scr-list"]')).not.toBeNull();
  });

  it("marks review status and saves a review note, persisted and separate from the member note", async () => {
    await render();
    click(q('[data-testid="scr-open-SPARK-INV-001"]'));
    await flush();

    click(q('[data-testid="scr-mark-wrong_image"]'));
    await flush();
    expect(getSparkReview("SPARK-INV-001").status).toBe("wrong_image");

    typeInto(q('[data-testid="scr-review-note"]'), "Hero cover doesn't match topic.");
    await flush();
    expect(getSparkReview("SPARK-INV-001").note).toBe("Hero cover doesn't match topic.");

    // The member note field is a different control and stays empty.
    const memberNote = q(".tsc-notes-input") as HTMLTextAreaElement | null;
    expect(memberNote?.value ?? "").toBe("");
  });

  it("updates progress and filters the list", async () => {
    await render();
    click(q('[data-testid="scr-open-SPARK-INV-001"]'));
    await flush();
    click(q('[data-testid="scr-mark-approved"]'));
    await flush();
    click(q('[data-testid="scr-back"]'));
    await flush();
    expect(q('[data-testid="scr-progress-approved"]')?.textContent).toBe("1");

    // Filter to only Approved → just the one card.
    selectOption(q('[data-testid="scr-filter"]'), "approved");
    await flush();
    expect(qa('[data-testid^="scr-row-"]').length).toBe(1);

    // Search finds a specific card by title.
    selectOption(q('[data-testid="scr-filter"]'), "all");
    typeInto(q('[data-testid="scr-search"]'), "Post-it");
    await flush();
    expect(q('[data-testid="scr-row-SPARK-INV-001"]')).not.toBeNull();
  });
});

/**
 * @vitest-environment jsdom
 * Today's Spark full card — the hero image is the card's numbered Spark Edition
 * cover, the whole card is a scrollable dialog (Story/Spark/Action/note/actions
 * all reachable), and closing returns. react-dom/client + act; memory backend.
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
import { sparkEditionForCategory } from "@/lib/sparkNote/sparkEditions";
import { resetSparkNoteStoreForTests } from "@/lib/sparkNote/persistence";
import { TodaysSparkCardShell } from "./TodaysSparkCardShell";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const CARD = SPARK_NOTE_CATALOG[0]!;

let container: HTMLDivElement;
let root: Root;
const onClose = vi.fn();
const q = (sel: string) => document.querySelector<HTMLElement>(sel);

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
async function render(card = CARD, extra: { onGoToPersonalLibrary?: () => void } = {}) {
  await act(async () => {
    root.render(
      <TodaysSparkCardShell card={card} onClose={onClose} {...extra} />,
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
  onClose.mockClear();
  localStorage.clear();
  resetSparkNoteStoreForTests();
  clearMemberRecordDurableMarksForTests();
  clearDurableRecordAuthForTests();
  setDurableRecordBackendForTests(createMemoryDurableRecordBackend());
  setDurableRecordAuthForTests("user-a");
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

describe("TodaysSparkCardShell", () => {
  it("uses the card's category edition cover as the hero image", async () => {
    await render();
    const hero = q('[data-testid="todays-spark-hero"]') as HTMLImageElement | null;
    expect(hero).not.toBeNull();
    const edition = sparkEditionForCategory(CARD.category);
    expect(edition).toBeTruthy();
    expect(hero?.getAttribute("src")).toBe(edition!.imageSrc);
    expect(hero?.getAttribute("src")).toContain("/spark-card-images/");
  });

  it("renders the whole card in one scrollable dialog with every control reachable", async () => {
    await render();
    const shell = q('[data-testid="todays-spark-card"]');
    expect(shell?.getAttribute("role")).toBe("dialog");
    // Scroll container is focusable so Page Up/Down + arrows scroll it.
    expect(shell?.getAttribute("tabindex")).toBe("-1");
    const text = document.body.textContent ?? "";
    expect(text).toContain("The Story");
    expect(text).toContain("Today's Spark");
    expect(text).toContain("Spark In Action");
    expect(q(".tsc-notes-input")).not.toBeNull(); // My Note field
    expect(text).toContain("Save This Spark");
    expect(text).toContain("Save My Note");
    expect(text).toContain("Back to My Personal Library");
  });

  it("shows a Go to Personal Library action only when wired, and invokes it", async () => {
    await render();
    expect(q('[data-testid="todays-spark-go-to-library"]')).toBeNull();

    const onGo = vi.fn();
    await render(CARD, { onGoToPersonalLibrary: onGo });
    const btn = q('[data-testid="todays-spark-go-to-library"]');
    expect(btn?.textContent).toContain("Go to Personal Library");
    click(btn);
    expect(onGo).toHaveBeenCalledTimes(1);
  });

  it("closes and returns when Back is pressed", async () => {
    await render();
    click(q(".tsc-back"));
    await flush();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the different edition cover when another card opens", async () => {
    // Pick a card in a different category to prove the hero tracks category.
    const other = SPARK_NOTE_CATALOG.find((c) => c.category !== CARD.category)!;
    await render(other);
    const hero = q('[data-testid="todays-spark-hero"]') as HTMLImageElement | null;
    expect(hero?.getAttribute("src")).toBe(
      sparkEditionForCategory(other.category)!.imageSrc,
    );
  });
});

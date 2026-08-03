/**
 * @vitest-environment jsdom
 * My Personal Library - the BROWSE room (chat "go to my personal library" +
 * Wander). The approved search-recent image plus transparent, accessible
 * hotspots: Find/Search and Recent and "My Spark Collection / View all" all open
 * the real saved-Spark collection (Find focuses Search). No Today's Spark gift -
 * that lives in the main-page teaser flow. react-dom/client + act; memory backend.
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
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "@/lib/sparkNote/persistence";
import { PersonalLibraryRoom } from "./PersonalLibraryRoom";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
    root.render(<PersonalLibraryRoom onBack={onBack} backLabel="Welcome Home" {...props} />);
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
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setSavedSparkDurableEnabledForTests(null);
  clearDurableRecordAuthForTests();
  setDurableRecordBackendForTests(null);
  vi.restoreAllMocks();
});

describe("PersonalLibraryRoom (browse room)", () => {
  it("renders the approved search-recent room image and a working back control", async () => {
    await render();
    const img = q('[data-testid="personal-library-image"]') as HTMLImageElement | null;
    expect(img?.getAttribute("src")).toBe(
      "/backgrounds/personal-library-search-recent-background.png",
    );
    const back = q('[data-testid="personal-library-back"]');
    expect(back?.tagName).toBe("BUTTON");
    click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows the browse room by default - Find / Recent / Collection, no gift", async () => {
    await render();
    expect(q('[data-testid="pl-find-open"]')).not.toBeNull();
    expect(q('[data-testid="pl-recent-open"]')).not.toBeNull();
    expect(q('[data-testid="pl-spark-collection-viewall"]')).not.toBeNull();
    // Today's Spark gift is not part of this room.
    expect(q('[data-testid="pl-todays-spark-open"]')).toBeNull();
    // Collection is closed until a control is used.
    expect(q('[data-testid="spark-note-my-collection"]')).toBeNull();
  });

  it("Find/Search and Recent are real, enabled, clickable buttons (not covered)", async () => {
    await render();
    const find = q('[data-testid="pl-find-open"]') as HTMLButtonElement | null;
    const recent = q('[data-testid="pl-recent-open"]') as HTMLButtonElement | null;
    expect(find?.tagName).toBe("BUTTON");
    expect(recent?.tagName).toBe("BUTTON");
    expect(find?.disabled).toBe(false);
    expect(recent?.disabled).toBe(false);
    // Each opens the collection when clicked — proves the click reaches them.
    click(find);
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
  });

  it("Find / Search opens the real collection focused on the Item Type filter", async () => {
    await render();
    click(q('[data-testid="pl-find-open"]'));
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
    expect(document.activeElement).toBe(
      q('[data-testid="spark-note-collection-item-type"]'),
    );
  });

  it("Recent opens the real collection", async () => {
    await render();
    click(q('[data-testid="pl-recent-open"]'));
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
  });

  it("My Spark Collection opens the real collection", async () => {
    await render();
    click(q('[data-testid="pl-spark-collection-viewall"]'));
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
  });

  it("initialView find/recent/collection lands directly in the collection", async () => {
    await render({ initialView: "find" });
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
    expect(document.activeElement).toBe(
      q('[data-testid="spark-note-collection-item-type"]'),
    );
  });

  it("closing the collection returns to the browse room", async () => {
    await render({ initialView: "collection" });
    expect(q('[data-testid="spark-note-my-collection"]')).not.toBeNull();
    click(q('[data-testid="spark-note-my-collection-back"]') ?? q(".spark-note-collection__back"));
    await flush();
    expect(q('[data-testid="spark-note-my-collection"]')).toBeNull();
    expect(q('[data-testid="pl-find-open"]')).not.toBeNull();
  });

  it("on arrival, focuses Find and marks the Welcome Home teaser opened", async () => {
    const onArrivalConsumed = vi.fn();
    await render({ arrivalMode: true, onArrivalConsumed });
    expect(document.activeElement).toBe(q('[data-testid="pl-find-open"]'));
    expect(onArrivalConsumed).toHaveBeenCalled();
    expect(isHomeTeaserDismissedToday()).toBe(true);
  });
});

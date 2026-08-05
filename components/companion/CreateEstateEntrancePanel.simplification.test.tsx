/**
 * Create Simplification & Category Evaluation — Parts 1–3 acceptance.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CreateEstateEntrancePanel } from "@/components/companion/CreateEstateEntrancePanel";
import { clearCreateDraftLibraryForTests } from "@/lib/createDraftLibrary";

describe("Create Simplification — default screen (Parts 1–3)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    clearCreateDraftLibraryForTests();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderPanel() {
    act(() => {
      root.render(
        <CreateEstateEntrancePanel
          onBack={() => undefined}
          onBeginCreate={() => undefined}
          onSelectCreationType={() => undefined}
          onResumeCreationWorkspace={() => undefined}
          onStartSomethingNew={() => undefined}
          onOpenSavedDraft={() => undefined}
          onRenameDraft={() => undefined}
          onDuplicateDraft={() => undefined}
          onDeleteDraft={() => undefined}
        />,
      );
    });
  }

  it("Part 1 — shows one description field with the required placeholder and ≤4 suggested choices", () => {
    renderPanel();
    const input = container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-nl-input']",
    );
    expect(input).toBeTruthy();
    // Start Freely empty-state UX follow-up — conversational placeholder.
    expect(input?.placeholder).toBe(
      "Tell me what you're thinking about, even if it's not fully formed yet...",
    );

    const choices = container.querySelectorAll(
      "[data-testid='create-estate-suggested-choice']",
    );
    expect(choices.length).toBeGreaterThan(0);
    expect(choices.length).toBeLessThanOrEqual(4);

    // Phase 0 (Create Entrance Copy and Path Relabel) — Start Freely /
    // Start With Guidance primary action labels; same underlying handlers.
    expect(
      container.querySelector("[data-testid='create-estate-start-creating']")
        ?.textContent,
    ).toContain("I know where I want to begin");
    expect(
      container.querySelector("[data-testid='create-estate-help-me-choose']")
        ?.textContent,
    ).toContain("Help me figure this out");
  });

  it("Part 3 — never shows source filter chips on the default screen", () => {
    renderPanel();
    const text = container.textContent ?? "";
    // These labels only belong in Browse More / search / advanced filters.
    expect(text).not.toMatch(/Spark Recommended/);
    expect(container.querySelector("[data-testid*='source-chip']")).toBeNull();
    expect(container.querySelector("button[aria-label='Clear']")).toBeNull();
  });

  it("Part 10 — typing narrows to matching ideas instead of a filtered catalog grid", () => {
    renderPanel();
    const input = container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-nl-input']",
    )!;

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "email");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Suggested chips step aside while actively searching.
    expect(
      container.querySelector("[data-testid='create-estate-suggested-choices']"),
    ).toBeNull();
    const results = container.querySelectorAll(
      "[data-testid='create-estate-search-result']",
    );
    expect(results.length).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/Email/);
  });

  it("Part 11 — no match still offers a way forward instead of a dead end", () => {
    renderPanel();
    const input = container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-nl-input']",
    )!;

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "zzzznonexistentxyz");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(
      container.querySelector("[data-testid='create-estate-search-empty']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='create-estate-create-from-scratch']"),
    ).toBeTruthy();
  });

  it("Part 2 — Find Previous Work and Browse More are separate, collapsed by default", () => {
    renderPanel();
    const findPrevious = container.querySelector(
      "[data-testid='create-estate-find-previous-work']",
    ) as HTMLDetailsElement | null;
    const browseMore = container.querySelector(
      "[data-testid='create-estate-browse-more']",
    ) as HTMLDetailsElement | null;
    expect(findPrevious).toBeTruthy();
    expect(browseMore).toBeTruthy();
    expect(findPrevious?.open).toBe(false);
    expect(browseMore?.open).toBe(false);
    expect(findPrevious?.textContent).toContain("Find Previous Work");
    expect(browseMore?.textContent).toContain("Browse More");
  });

  it("Help Me Choose opens one guided question at a time, then closes on selection", () => {
    renderPanel();
    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-help-me-choose']",
    )!;
    act(() => {
      button.click();
    });
    expect(
      container.querySelector("[data-testid='create-browse-category-cards']"),
    ).toBeTruthy();

    const category = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-browse-category-card']",
    )!;
    act(() => {
      category.click();
    });
    expect(
      container.querySelector("[data-testid='create-browse-parent-cards']"),
    ).toBeTruthy();
  });

  it("Start Freely with an empty text area focuses the input and offers encouragement, not a silent no-op", () => {
    renderPanel();
    const input = container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-nl-input']",
    )!;
    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-start-creating']",
    )!;

    expect(document.activeElement).not.toBe(input);

    act(() => {
      button.click();
    });

    expect(document.activeElement).toBe(input);
    expect(
      container.querySelector("[data-testid='create-estate-begin-feedback']")
        ?.textContent,
    ).toContain(
      "Start wherever you are. Tell me what you're working on — even if it's just a rough idea.",
    );
  });
});

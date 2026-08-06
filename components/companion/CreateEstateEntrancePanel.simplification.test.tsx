/**
 * Create Simplification & Category Evaluation — Parts 1–3 acceptance.
 *
 * Conversational Create Entrance (2026-08-06) — Start Freely / Start With
 * Guidance / Browse Categories were replaced with a single conversation.
 * The invariants this file certifies that are still true (no artifact
 * chips, no source filter chips, Find Previous Work collapsed by default)
 * are preserved as-is; assertions tied to the removed three-way UI and
 * live search-as-you-type are updated to match the new entrance — see
 * components/companion/CreateEntryConversationPanel.test.tsx for the new
 * conversation's own acceptance coverage.
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

  function entryInput(): HTMLTextAreaElement {
    return container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-entry-input']",
    )!;
  }

  function typeAndSend(text: string) {
    act(() => {
      const el = entryInput();
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      nativeSetter.call(el, text);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          "[data-testid='create-estate-entry-send']",
        )!
        .click();
    });
  }

  it("Part 1 — shows the single conversational entrance, not a description field with Begin buttons", () => {
    renderPanel();
    expect(container.textContent).toContain("What are you working on?");
    expect(entryInput()).toBeTruthy();
    // Phase 0's Start Freely / Start With Guidance labels no longer exist —
    // replaced entirely by the conversation.
    expect(
      container.querySelector("[data-testid='create-estate-start-creating']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='create-estate-help-me-choose']"),
    ).toBeNull();
  });

  it("Entrance Cleanup (2026-08) — never shows artifact-specific quick-choice chips", () => {
    renderPanel();
    // The default/personalized suggested-choice chips (Email, Social Post,
    // Client Onboarding, Workshop, etc.) were removed — they made Create
    // feel like a template catalog instead of a thinking conversation.
    expect(
      container.querySelector("[data-testid='create-estate-suggested-choices']"),
    ).toBeNull();
    expect(
      container.querySelectorAll("[data-testid='create-estate-suggested-choice']")
        .length,
    ).toBe(0);
  });

  it("Part 3 — never shows source filter chips on the default screen", () => {
    renderPanel();
    const text = container.textContent ?? "";
    // These labels only belong in Browse More / search / advanced filters.
    expect(text).not.toMatch(/Spark Recommended/);
    expect(container.querySelector("[data-testid*='source-chip']")).toBeNull();
    expect(container.querySelector("button[aria-label='Clear']")).toBeNull();
  });

  it("no categories, templates, or search results appear before the conversation earns them", () => {
    renderPanel();
    typeAndSend("email");
    // The acceptance test for the new entrance: no categories, templates,
    // or search results — only the one topic-aware acknowledgment turn.
    expect(
      container.querySelector("[data-testid='create-estate-search-results']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='create-estate-browse-categories']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='create-estate-suggested-choices']"),
    ).toBeNull();
  });

  it("an unresolvable second turn still offers a way forward instead of a dead end", () => {
    renderPanel();
    typeAndSend("zzzznonexistentxyz");
    typeAndSend("zzzzstillnonexistentxyz");
    // resolveCreateBeginOutcome's own ambiguous-clarify message — unchanged
    // — surfaces as feedback instead of a silent no-op.
    expect(
      container.querySelector("[data-testid='create-estate-begin-feedback']")
        ?.getAttribute("data-begin-feedback"),
    ).toBe("clarify");
  });

  it("Part 2 — Find Previous Work is collapsed by default; Browse Categories no longer exists on this screen", () => {
    renderPanel();
    const findPrevious = container.querySelector(
      "[data-testid='create-estate-find-previous-work']",
    ) as HTMLDetailsElement | null;
    expect(findPrevious).toBeTruthy();
    expect(findPrevious?.open).toBe(false);
    expect(findPrevious?.textContent).toContain("Find Previous Work");

    // Conversational Create Entrance (2026-08-06) — Browse Categories was
    // fully removed, not merely de-duplicated. No category picker mounts
    // anywhere on this screen, before or after engagement.
    expect(
      container.querySelector("[data-testid='create-estate-browse-more']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='create-estate-browse-categories']"),
    ).toBeNull();
  });

  it("Conversational Create Entrance (2026-08-06) — engagement narrows to a focused conversation, hiding Find Previous Work / Start New", () => {
    renderPanel();

    // Before engagement — Find Previous Work visible.
    expect(
      container.querySelector("[data-testid='create-estate-find-previous-work']"),
    ).toBeTruthy();

    typeAndSend("a checklist for onboarding");

    // Engaged — the secondary navigation steps aside; the conversation
    // (with its own input) remains.
    expect(
      container.querySelector("[data-testid='create-estate-find-previous-work']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='create-estate-entry-conversation']"),
    ).toBeTruthy();
  });

  it("the Send button is disabled for empty input, instead of a silent no-op", () => {
    renderPanel();
    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-entry-send']",
    )!;
    expect(button.disabled).toBe(true);

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      nativeSetter.call(entryInput(), "something");
      entryInput().dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(button.disabled).toBe(false);
  });
});

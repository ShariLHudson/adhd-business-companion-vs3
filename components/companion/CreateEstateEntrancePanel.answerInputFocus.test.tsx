/**
 * Bug fix (2026-08-06) — "Create Understanding Journey loses answer input."
 * Every understanding question needs a visible, ready-to-use answer path
 * the moment it appears: an existing scrollIntoView + focus effect already
 * did this for the confirm step; the understanding-question state had no
 * equivalent, so a question could render below the fold with nothing
 * focused — the member knew what to do, but the next action wasn't in
 * view, and momentum stopped.
 *
 * UI state only. This file does not touch discovery questions, the
 * reasoning flow, recognition logic, routing, or Chamber behavior — none
 * of those are exercised or asserted on here.
 *
 * Acceptance rule this test enforces: every Spark question must answer
 * "Where does the member respond?" — a question without a visible response
 * path is an incomplete experience.
 *
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateEstateEntrancePanel } from "@/components/companion/CreateEstateEntrancePanel";
import { clearCreateDraftLibraryForTests } from "@/lib/createDraftLibrary";
import {
  clearForceNewCreateSession,
  resetForceNewCreateSessionForTests,
} from "@/lib/createEstate/forceNewCreateSession";
import { clearActiveWorkspaceRegistryForTests } from "@/lib/activeWorkspaceRegistry";
import { resetEntranceUnderstandingForTests } from "@/lib/createEstate/entranceUnderstanding";

describe("CreateEstateEntrancePanel — every understanding question has a visible, focused answer path", () => {
  let container: HTMLDivElement;
  let root: Root;
  let scrollIntoViewSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    clearCreateDraftLibraryForTests();
    clearActiveWorkspaceRegistryForTests();
    resetForceNewCreateSessionForTests();
    clearForceNewCreateSession();
    resetEntranceUnderstandingForTests();
    // jsdom does not implement scrollIntoView.
    scrollIntoViewSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewSpy;
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

  function input(): HTMLTextAreaElement {
    return container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-nl-input']",
    )!;
  }

  function beginButton(): HTMLButtonElement {
    return container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-start-creating']",
    )!;
  }

  function setValueAndSubmit(text: string) {
    const el = input();
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(el, text);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      beginButton().click();
    });
  }

  function feedbackText(): string | null | undefined {
    return container.querySelector("[data-testid='create-estate-begin-feedback']")
      ?.textContent;
  }

  it("Given the member enters a work request, When Spark asks discovery question 1, Then an answer input is visible and interactive", () => {
    renderPanel();
    setValueAndSubmit("I need to create a travel checklist and itinerary");

    expect(feedbackText()).toContain(
      "What would you like this to accomplish",
    );
    const el = input();
    expect(el).toBeTruthy();
    expect(el.disabled).toBe(false);
    // The answer path is not just present — it's the active element.
    expect(document.activeElement).toBe(el);
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("regression: the SECOND discovery question also has a visible, focused answer input (the reported bug)", () => {
    renderPanel();
    setValueAndSubmit("I need to create a travel checklist and itinerary");
    const question1Text = feedbackText();

    scrollIntoViewSpy.mockClear();
    setValueAndSubmit("Never forget something important when traveling");
    const question2Text = feedbackText();

    // A genuinely new question was asked (never the same one repeated).
    expect(question2Text).not.toBe(question1Text);
    expect(question2Text).toContain("Why does this matter right now");

    const el = input();
    expect(el).toBeTruthy();
    expect(el.disabled).toBe(false);
    // This is the actual bug: before the fix, nothing scrolled the new
    // question into view or focused the answer box on the SECOND question
    // onward — the member had no visible next action.
    expect(document.activeElement).toBe(el);
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("regression: a third question in the same conversation keeps focus behavior working (not a one-time effect)", () => {
    renderPanel();
    setValueAndSubmit("I need to create a travel checklist and itinerary");
    setValueAndSubmit("Never forget something important when traveling");
    const question2Text = feedbackText();

    scrollIntoViewSpy.mockClear();
    setValueAndSubmit("Planning a two-week trip with my family");
    const question3Text = feedbackText();

    expect(question3Text).not.toBe(question2Text);
    const el = input();
    expect(el.disabled).toBe(false);
    expect(document.activeElement).toBe(el);
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("skipping a question also leaves a visible, focused answer input for the next one", () => {
    renderPanel();
    setValueAndSubmit("I need to create a travel checklist and itinerary");
    const question1Text = feedbackText();

    scrollIntoViewSpy.mockClear();
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          "[data-testid='create-estate-understanding-skip']",
        )!
        .click();
    });

    const question2Text = feedbackText();
    expect(question2Text).not.toBe(question1Text);
    const el = input();
    expect(el.disabled).toBe(false);
    expect(document.activeElement).toBe(el);
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });
});

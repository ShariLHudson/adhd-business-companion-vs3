/**
 * @vitest-environment jsdom
 * Browser-style: submit one answer then immediately type into the next field.
 * New answer must never contain characters from the previous answer.
 */
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CurrentFocusInteraction } from "./CurrentFocusInteraction";
import type { CanonicalCurrentFocus } from "@/lib/currentFocus";

function makeFocus(
  focusId: string,
  prompt: string,
): CanonicalCurrentFocus {
  return {
    focusId,
    creationId: "ws-race-1",
    title: prompt,
    purpose: "answer",
    prompt,
    responseType: "multiline",
    knownContext: [],
    availableGuidance: [],
    completionCriteria: "Continue",
    nextTransition: null,
    contextVersion: 1,
    sectionId: focusId.replace("section:", ""),
    introductoryGuidance: null,
  };
}

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe("Current Focus textarea race", () => {
  it("clears atomically so fast typing never splices the prior answer", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const onSubmit = vi.fn();
    let focus = makeFocus("section:outcomes", "What outcomes?");

    act(() => {
      root.render(
        <CurrentFocusInteraction
          key={focus.focusId}
          focus={focus}
          guidance={null}
          failureMessage={null}
          submitting={false}
          onSubmit={onSubmit}
          onIdeas={() => {}}
          onUnsure={() => {}}
        />,
      );
    });

    const box = () =>
      container.querySelector(
        "[data-testid='current-focus-response']",
      ) as HTMLTextAreaElement;
    const submit = () =>
      container.querySelector(
        "[data-testid='current-focus-submit']",
      ) as HTMLButtonElement;

    act(() => {
      const ta = box();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(
        ta,
        "Leave with a written weekly plan they will actually stick to.",
      );
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    });

    act(() => {
      submit().click();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      "Leave with a written weekly plan they will actually stick to.",
    );
    expect(box().value).toBe("");

    focus = makeFocus("section:format", "What format?");
    act(() => {
      root.render(
        <CurrentFocusInteraction
          key={focus.focusId}
          focus={focus}
          guidance={null}
          failureMessage={null}
          submitting={false}
          onSubmit={onSubmit}
          onIdeas={() => {}}
          onUnsure={() => {}}
        />,
      );
    });

    expect(box().value).toBe("");
    expect(box().getAttribute("data-initial-empty")).toBe("true");

    act(() => {
      const ta = box();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(
        ta,
        "Half-day, in-person, small group of about 12 people.",
      );
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(box().value).toBe(
      "Half-day, in-person, small group of about 12 people.",
    );
    expect(box().value).not.toMatch(/weekly plan|actually stick/i);
    expect(box().value).not.toMatch(/wilHalf/i);
  });

  it("does not restore a prior failed answer onto the next focus", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const focusA = makeFocus("section:outcomes", "Outcomes?");
    const focusB = makeFocus("section:format", "Format?");

    act(() => {
      root.render(
        <CurrentFocusInteraction
          key={focusA.focusId}
          focus={focusA}
          guidance={null}
          failureMessage="I couldn't finish saving that on this device yet."
          initialResponse="Old outcomes answer"
          failedFocusId={focusA.focusId}
          submitting={false}
          onSubmit={() => {}}
          onIdeas={() => {}}
          onUnsure={() => {}}
        />,
      );
    });

    expect(
      (
        container.querySelector(
          "[data-testid='current-focus-response']",
        ) as HTMLTextAreaElement
      ).value,
    ).toBe("Old outcomes answer");

    act(() => {
      root.render(
        <CurrentFocusInteraction
          key={focusB.focusId}
          focus={focusB}
          guidance={null}
          failureMessage="I couldn't finish saving that on this device yet."
          initialResponse="Old outcomes answer"
          failedFocusId={focusA.focusId}
          submitting={false}
          onSubmit={() => {}}
          onIdeas={() => {}}
          onUnsure={() => {}}
        />,
      );
    });

    expect(
      (
        container.querySelector(
          "[data-testid='current-focus-response']",
        ) as HTMLTextAreaElement
      ).value,
    ).toBe("");
  });
});

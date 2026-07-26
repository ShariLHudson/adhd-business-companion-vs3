/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  IdealClientBuilder,
  formSignature,
  EMPTY,
} from "./IdealClientBuilder";
import { getAvatars } from "@/lib/companionStore";

/**
 * Phase 1 verification for Save Progress. We do NOT rewrite the handler — these
 * tests prove the existing dirty-state + persistence behavior is correct.
 */

describe("Save Progress dirty-state coverage (formSignature)", () => {
  it("enables after editing any field type, and ignores id", () => {
    const base = formSignature(EMPTY);
    // A standard answer.
    expect(formSignature({ ...EMPTY, name: "Burned Out Coach" })).not.toBe(base);
    expect(formSignature({ ...EMPTY, painPoints: "Too many tabs" })).not.toBe(
      base,
    );
    // A Step 10 research area.
    expect(
      formSignature({ ...EMPTY, research: { behavioral: "Procrastinates" } }),
    ).not.toBe(base);
    // A custom research field (label and value).
    expect(
      formSignature({
        ...EMPTY,
        research: { custom: [{ label: "Test idea", value: "A/B subject" }] },
      }),
    ).not.toBe(base);
    // The id is not content: minting it on first save must NOT keep the button
    // enabled, so a form with the same content but an id has the same signature.
    expect(formSignature({ ...EMPTY, name: "X", id: "abc" })).toBe(
      formSignature({ ...EMPTY, name: "X" }),
    );
  });
});

describe("Save Progress button behavior", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  async function flush() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  function typeInput(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const proto =
      el instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const saveBtn = () =>
    container.querySelector(
      '[data-testid="save-progress"]',
    ) as HTMLButtonElement;

  it("is disabled until an edit, saves without advancing, then re-enables after another edit", async () => {
    // coachKickoff opens the builder at step 1 (the "who" question).
    await act(async () => {
      root.render(<IdealClientBuilder coachKickoff={1} />);
    });
    await flush();

    // Nothing entered yet → disabled.
    expect(saveBtn().disabled).toBe(true);
    expect(container.textContent).toContain("Step 1 of 11");

    // Editing the name marks the draft dirty → enabled.
    const name = container.querySelector("#avatar-name") as HTMLInputElement;
    await act(async () => typeInput(name, "Burned Out Coach"));
    expect(saveBtn().disabled).toBe(false);

    // Save Progress persists and stays put (does not advance the step).
    await act(async () => saveBtn().click());
    await flush();
    expect(container.textContent).toContain("Step 1 of 11"); // still step 1
    expect(container.textContent).toContain("Progress saved.");
    expect(saveBtn().disabled).toBe(true); // disabled again after save

    // The draft persisted with its current-step pointer.
    const saved = getAvatars();
    expect(saved.length).toBe(1);
    expect(saved[0]!.name).toBe("Burned Out Coach");
    expect(saved[0]!.draftStepKey).toBe("who");

    // Another edit re-enables Save Progress.
    await act(async () => typeInput(name, "Burned Out Coach & Co"));
    expect(saveBtn().disabled).toBe(false);
  });
});

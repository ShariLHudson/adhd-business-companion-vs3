/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IdealClientBuilder } from "./IdealClientBuilder";

const AVATARS_KEY = "companion-ideal-clients-v1";

describe("IdealClientBuilder — Back saves and forward restores answers", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function click(label: string) {
    const btn = [...container.querySelectorAll("button")].find(
      (b) => (b.textContent ?? "").trim() === label,
    ) as HTMLButtonElement | undefined;
    if (!btn) throw new Error(`button not found: ${label}`);
    act(() => btn.click());
  }

  function typeInto(placeholderPart: string, value: string) {
    const field = [...container.querySelectorAll("textarea, input")].find((f) =>
      (f as HTMLInputElement).placeholder?.includes(placeholderPart),
    ) as HTMLTextAreaElement | HTMLInputElement | undefined;
    if (!field) throw new Error(`field not found: ${placeholderPart}`);
    const proto =
      field.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
    act(() => {
      setter.call(field, value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function storedAvatar() {
    return JSON.parse(localStorage.getItem(AVATARS_KEY) ?? "[]")[0];
  }

  it("saves the current answer when moving Back, and restores it moving forward", () => {
    act(() => root.render(<IdealClientBuilder />));

    // Enter the builder (step 1: who).
    click("+ New Avatar");
    typeInto("Describe who they are", "Solo founders");
    click("Save and Continue"); // who -> identity
    click("Save and Continue"); // identity -> painPoints (Step 3)

    // Answer the painPoints question, then move Back without an explicit save.
    typeInto("a sentence or two is plenty", "Too many tabs open");
    click("Back"); // painPoints -> identity, persisting the current answer

    // Back saved the current answer, and earlier answers are intact.
    const saved = storedAvatar();
    expect(saved.painPoints).toBe("Too many tabs open");
    expect(saved.who).toBe("Solo founders");

    // Returning forward restores the painPoints answer.
    click("Save and Continue"); // identity -> painPoints
    const painField = [...container.querySelectorAll("textarea")].find((f) =>
      f.placeholder?.includes("a sentence or two is plenty"),
    ) as HTMLTextAreaElement;
    expect(painField.value).toBe("Too many tabs open");
  });
});

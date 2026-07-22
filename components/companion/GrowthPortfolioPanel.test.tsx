/**
 * Hall of Accomplishments — "Something else" custom type acceptance.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GrowthPortfolioPanel } from "@/components/companion/GrowthPortfolioPanel";
import { getPortfolioEntries } from "@/lib/growthPortfolioStore";

function setNativeValue(
  el: HTMLInputElement | HTMLSelectElement,
  value: string,
) {
  const proto =
    el instanceof HTMLSelectElement
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(el, value);
  const eventName = el instanceof HTMLSelectElement ? "change" : "input";
  el.dispatchEvent(new Event(eventName, { bubbles: true }));
}

describe("GrowthPortfolioPanel — Other / Something else accomplishment type", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    window.localStorage.clear();
  });

  function render() {
    act(() => {
      root.render(
        <GrowthPortfolioPanel
          nav={{
            current: "growth-portfolio",
            onBack: () => undefined,
            onOpenSection: () => undefined,
          }}
        />,
      );
    });
  }

  function openAddForm() {
    const addButton = container.querySelector<HTMLButtonElement>(
      "[data-testid='hall-add-achievement']",
    )!;
    act(() => {
      addButton.click();
    });
  }

  function typeSelect() {
    return container.querySelector<HTMLSelectElement>(
      "[data-testid='hall-add-form'] select",
    )!;
  }

  function titleInput() {
    return container.querySelector<HTMLInputElement>(
      "[data-testid='hall-add-form'] input[placeholder='What did you accomplish?']",
    )!;
  }

  function saveButton() {
    return container.querySelector<HTMLButtonElement>(
      "[data-testid='hall-save-to-hall']",
    )!;
  }

  it("preserves the existing preset types in the Type picker and adds 'Other'", () => {
    render();
    openAddForm();
    const optionValues = Array.from(typeSelect().options).map((o) => o.value);
    expect(optionValues).toContain("Degree");
    expect(optionValues).toContain("Certification");
    expect(optionValues).toContain("Personal Victory");
    // "Other" is always present so members are never limited to the preset list.
    expect(optionValues).toContain("Other");
  });

  it("does not show a custom-type question until 'Something else' is chosen", () => {
    render();
    openAddForm();
    expect(
      container.querySelector("[data-testid='hall-custom-type-input']"),
    ).toBeNull();

    act(() => setNativeValue(typeSelect(), "Other"));

    expect(
      container.querySelector("[data-testid='hall-custom-type-input']"),
    ).not.toBeNull();
  });

  it("blocks Save until a custom label is entered for 'Something else'", () => {
    render();
    openAddForm();

    act(() => setNativeValue(typeSelect(), "Other"));
    act(() => setNativeValue(titleInput(), "Finished my first marathon"));

    expect(saveButton().disabled).toBe(true);

    const customInput = container.querySelector<HTMLInputElement>(
      "[data-testid='hall-custom-type-input']",
    )!;
    act(() => setNativeValue(customInput, "Marathon"));

    expect(saveButton().disabled).toBe(false);
  });

  it("saves the custom label as the entry's type, gives feedback, and keeps it visible later", () => {
    render();
    openAddForm();

    act(() => setNativeValue(typeSelect(), "Other"));
    act(() => setNativeValue(titleInput(), "Finished my first marathon"));

    const customInput = container.querySelector<HTMLInputElement>(
      "[data-testid='hall-custom-type-input']",
    )!;
    act(() => setNativeValue(customInput, "Marathon"));

    act(() => saveButton().click());

    // Primary Action Feedback™ — visible confirmation after the click.
    const confirmation = container.querySelector(
      "[data-testid='hall-save-confirmation']",
    );
    expect(confirmation?.textContent ?? "").toContain(
      "Finished my first marathon",
    );

    // Persisted with the custom label as its type — never the literal word "Other".
    const saved = getPortfolioEntries();
    expect(saved).toHaveLength(1);
    expect(saved[0]!.achievementType).toBe("Marathon");
    expect(saved[0]!.title).toBe("Finished my first marathon");

    // Shows on the card when looking back.
    expect(container.textContent).toContain("Marathon");
  });

  it("preserves existing preset saves untouched (default preset type still saves as-is)", () => {
    render();
    openAddForm();

    act(() => setNativeValue(titleInput(), "Earned my certification"));
    act(() => saveButton().click());

    const saved = getPortfolioEntries();
    expect(saved).toHaveLength(1);
    // Default Type selection is the first preset ("Degree") — untouched by the Other feature.
    expect(saved[0]!.achievementType).toBe("Degree");
  });

  it("offers previously saved custom types in the filter dropdown for looking back", () => {
    render();
    openAddForm();

    act(() => setNativeValue(typeSelect(), "Other"));
    act(() => setNativeValue(titleInput(), "Finished my first marathon"));
    const customInput = container.querySelector<HTMLInputElement>(
      "[data-testid='hall-custom-type-input']",
    )!;
    act(() => setNativeValue(customInput, "Marathon"));
    act(() => saveButton().click());

    const filterSelect = container.querySelector<HTMLSelectElement>(
      "select[aria-label='Filter by type']",
    )!;
    const filterOptionValues = Array.from(filterSelect.options).map(
      (o) => o.value,
    );
    expect(filterOptionValues).toContain("Marathon");
    expect(filterOptionValues).toContain("Certification");
  });
});

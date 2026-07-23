/**
 * Create Simplification & Category Evaluation — Part 4 / 9 acceptance.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateBrowseCategoriesPanel } from "@/components/companion/CreateBrowseCategoriesPanel";
import type { CreateCatalogItem } from "@/lib/createCatalog";

describe("CreateBrowseCategoriesPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  function render(mode: "guided" | "browse", onRequestCreate: (item: CreateCatalogItem) => void) {
    act(() => {
      root.render(
        <CreateBrowseCategoriesPanel mode={mode} onRequestCreate={onRequestCreate} />,
      );
    });
  }

  it("Part 4 — browse mode opens with exactly the seven top-level categories", () => {
    render("browse", () => undefined);
    const cards = container.querySelectorAll(
      "[data-testid='create-browse-category-card']",
    );
    expect(cards.length).toBe(7);
    expect(container.textContent).toContain("Write & Communicate");
    expect(container.textContent).toContain("Personal");
  });

  it("guided mode asks the Help Me Choose question instead of 'Browse a category'", () => {
    render("guided", () => undefined);
    expect(container.textContent).toContain("What are you hoping to create?");
    expect(container.textContent).not.toContain("Browse a category");
  });

  it("category → curated parent list, not the full catalog", () => {
    render("browse", () => undefined);
    const clientsCategory = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-testid='create-browse-category-card']",
      ),
    ).find((el) => el.dataset.category === "work_with_clients")!;

    act(() => {
      clientsCategory.click();
    });

    const parentCards = container.querySelectorAll(
      "[data-testid='create-browse-parent-card']",
    );
    expect(parentCards.length).toBeGreaterThan(0);
    expect(parentCards.length).toBeLessThan(10);
    expect(container.textContent).toContain("Client Onboarding");
  });

  it("Back to categories returns from the parent step", () => {
    render("browse", () => undefined);
    const category = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-browse-category-card']",
    )!;
    act(() => category.click());
    expect(
      container.querySelector("[data-testid='create-browse-parent-step']"),
    ).toBeTruthy();

    const back = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-browse-back-to-categories']",
    )!;
    act(() => back.click());
    expect(
      container.querySelector("[data-testid='create-browse-category-step']"),
    ).toBeTruthy();
  });

  it("Part 9 — a parent type with subtypes asks one guided question before creating", () => {
    const onRequestCreate = vi.fn();
    render("browse", onRequestCreate);

    const writeCategory = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-testid='create-browse-category-card']",
      ),
    ).find((el) => el.dataset.category === "write_communicate")!;
    act(() => writeCategory.click());

    const emailParent = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-testid='create-browse-parent-card']",
      ),
    ).find((el) => el.dataset.parentType === "email")!;
    act(() => emailParent.click());

    expect(
      container.querySelector("[data-testid='create-browse-subtype-step']"),
    ).toBeTruthy();
    expect(container.textContent).toContain("What kind of email are you creating?");
    expect(onRequestCreate).not.toHaveBeenCalled();

    const subtype = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-browse-subtype-option']",
    )!;
    act(() => subtype.click());
    expect(onRequestCreate).toHaveBeenCalledTimes(1);
  });

  it("a parent type without subtypes creates directly (one click, not two)", () => {
    const onRequestCreate = vi.fn();
    render("browse", onRequestCreate);

    const clientsCategory = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-testid='create-browse-category-card']",
      ),
    ).find((el) => el.dataset.category === "work_with_clients")!;
    act(() => clientsCategory.click());

    const onboarding = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-testid='create-browse-parent-card']",
      ),
    ).find((el) => el.dataset.parentType === "client-onboarding")!;
    act(() => onboarding.click());

    expect(onRequestCreate).toHaveBeenCalledTimes(1);
    expect(onRequestCreate.mock.calls[0]![0]!.label).toBe("Client Onboarding");
  });

  it("Personal category is honest — no fabricated cards", () => {
    render("browse", () => undefined);
    const personal = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "[data-testid='create-browse-category-card']",
      ),
    ).find((el) => el.dataset.category === "personal")!;
    act(() => personal.click());
    expect(
      container.querySelector("[data-testid='create-browse-parent-empty']"),
    ).toBeTruthy();
  });
});

/**
 * @vitest-environment jsdom
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";

import { SparkNoteExpanded } from "./SparkNoteExpanded";

const card: SparkNoteDailyCard = {
  id: "SOMETHING-ELSE-TEST",
  category: "invention",
  categoryLabel: "History of Inventions",
  sparkType: "story",
  title: "A Rich Discovery",
  shortTitle: "A Rich Discovery",
  teaser: "There is more here than one line.",
  whatHappened: "Several sentences of real context and story.",
  whyItMatters: "Because context and application matter.",
  sparkApplication: "How could this apply to your business today?",
  source: "library",
};

describe("SparkNoteExpanded — Show me another (Something Else)", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  function render(node: ReactNode) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(node);
    });
  }

  it("shows a 'Show me another' control and keeps Save/Favorite separate when onSomethingElse is provided", () => {
    const onSomethingElse = vi.fn();
    render(
      <SparkNoteExpanded
        card={card}
        onClose={vi.fn()}
        onOpenCollection={vi.fn()}
        onSomethingElse={onSomethingElse}
      />,
    );
    const another = container.querySelector(
      "[data-testid='spark-note-something-else']",
    ) as HTMLButtonElement | null;
    expect(another).toBeTruthy();

    // Save/Favorite remain as distinct controls (save is not "another").
    const text = container.textContent ?? "";
    expect(text).toContain("Save");
    expect(text).toContain("Favorite");

    act(() => {
      another!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onSomethingElse).toHaveBeenCalledTimes(1);
  });

  it("omits the 'Show me another' control for the always-on daily card (no onSomethingElse)", () => {
    render(
      <SparkNoteExpanded
        card={card}
        onClose={vi.fn()}
        onOpenCollection={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid='spark-note-something-else']"),
    ).toBeFalsy();
  });

  it("renders rich context and application, not just a title and one line", () => {
    render(
      <SparkNoteExpanded
        card={card}
        onClose={vi.fn()}
        onOpenCollection={vi.fn()}
        onSomethingElse={vi.fn()}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain(card.title);
    // Spark-in-Action (application) is surfaced alongside the story.
    expect(text.length).toBeGreaterThan(card.title.length + 40);
    expect(
      container.querySelector("[data-testid='spark-note-expanded']"),
    ).toBeTruthy();
  });
});

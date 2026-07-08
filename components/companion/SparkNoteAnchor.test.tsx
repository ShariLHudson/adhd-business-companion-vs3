/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";

import { SparkNoteAnchor } from "./SparkNoteAnchor";

const sampleCard: SparkNoteDailyCard = {
  id: "SPARK-INV-001",
  category: "invention",
  categoryLabel: "History of Inventions",
  sparkType: "story",
  title: "The Post-it® Note",
  shortTitle: "The Post-it® Note",
  teaser: "A failed experiment became a worldwide productivity tool.",
  whatHappened: "A scientist accidentally created a reusable adhesive.",
  whyItMatters: "The mistake became a beloved tool for capturing ideas.",
  sparkApplication: "What idea deserves another chance?",
  source: "library",
};

describe("SparkNoteAnchor", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  function render(card = sampleCard) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<SparkNoteAnchor card={card} onExpand={vi.fn()} />);
    });
  }

  it("renders collapsed companion placement per daily intelligence protocol", () => {
    render();
    const anchor = container.querySelector("[data-testid='spark-note-anchor']");
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute("data-estate-chrome-position")).toBe(
      "bottom-right",
    );
    expect(container.textContent).toContain("Today's Spark");
    expect(container.textContent).toContain(sampleCard.shortTitle);
    expect(container.textContent).toContain(sampleCard.teaser);
  });

  it("uses the Spark flame mark instead of notification badges", () => {
    render();
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
    expect(container.querySelector("[class*='badge']")).toBeFalsy();
    expect(container.querySelector("[aria-label*='notification']")).toBeFalsy();
  });
});

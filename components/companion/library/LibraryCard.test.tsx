/**
 * Create Reasoning-First Migration — Phase 1C (resume narrative, render layer).
 *
 * LibraryCard already computed a next-step value for creation items
 * (item.description = currentFocusTitle, sourced from
 * RuntimeCreationRecord.workingMemory.nextHelpfulStep) but never rendered
 * it — the "Next: {label}" line existed only for kind === "project". This
 * proves the creation-kind line now renders, and that the project-kind
 * line is unchanged.
 *
 * @vitest-environment jsdom
 * @see docs/create-experience/CREATE_REASONING_FIRST_MIGRATION_IMPLEMENTATION_PLAN.md#1c
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LibraryCard } from "./LibraryCard";
import { EMPTY_CAPABILITIES } from "@/lib/sparkLibraryCollection/capabilities";
import type { LibraryItem } from "@/lib/sparkLibraryCollection/types";

function creationItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: "sop-1",
    kind: "creation",
    title: "Client Onboarding SOP",
    description: null,
    typeLabel: "SOP",
    statusId: "active",
    statusLabel: "Getting Started",
    favorite: false,
    archived: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-05T00:00:00.000Z",
    capabilities: EMPTY_CAPABILITIES,
    primaryAction: "continue",
    ...overrides,
  } as LibraryItem;
}

describe("LibraryCard renders the creation next-step line", () => {
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

  it("shows Next: <description> for a creation item with Working Memory's next step", () => {
    act(() => {
      root.render(
        <LibraryCard
          item={creationItem({
            description: "Continue with Intended User",
          })}
          view="comfortable"
          onPrimary={() => undefined}
          onAction={() => undefined}
        />,
      );
    });
    expect(container.textContent).toContain(
      "Next: Continue with Intended User",
    );
  });

  it("shows nothing extra for a creation item with no description yet", () => {
    act(() => {
      root.render(
        <LibraryCard
          item={creationItem({ description: null })}
          view="comfortable"
          onPrimary={() => undefined}
          onAction={() => undefined}
        />,
      );
    });
    expect(container.textContent).not.toContain("Next:");
  });

  it("does not affect the existing project nextMilestoneLabel line", () => {
    act(() => {
      root.render(
        <LibraryCard
          item={creationItem({
            kind: "project",
            description: null,
            nextMilestoneLabel: "Kickoff call",
          })}
          view="comfortable"
          onPrimary={() => undefined}
          onAction={() => undefined}
        />,
      );
    });
    expect(container.textContent).toContain("Next: Kickoff call");
    // Exactly one "Next:" line — the creation-kind branch does not also fire.
    expect(container.textContent?.match(/Next:/g)?.length).toBe(1);
  });
});

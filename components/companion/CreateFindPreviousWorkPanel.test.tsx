/**
 * Create Simplification & Category Evaluation — Part 2 acceptance.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CreateFindPreviousWorkPanel } from "@/components/companion/CreateFindPreviousWorkPanel";
import {
  CREATE_DRAFT_LIBRARY_KEY,
  clearCreateDraftLibraryForTests,
  type CreateDraftLibraryEntry,
} from "@/lib/createDraftLibrary";

function seedDraft(
  id: string,
  title: string,
  updatedAt: string,
): CreateDraftLibraryEntry {
  return {
    id,
    title,
    itemType: "Email",
    record: {
      workflowId: id,
      itemType: "Email",
      collectedAnswers: {},
      draftContent: `Draft content for ${title}`,
      workflowState: {},
      lastUpdated: updatedAt,
    } as unknown as CreateDraftLibraryEntry["record"],
    savedAt: updatedAt,
    updatedAt,
  };
}

function seedLibrary(entries: CreateDraftLibraryEntry[]): void {
  localStorage.setItem(CREATE_DRAFT_LIBRARY_KEY, JSON.stringify(entries));
}

describe("CreateFindPreviousWorkPanel", () => {
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

  function render() {
    act(() => {
      root.render(
        <CreateFindPreviousWorkPanel
          onOpen={() => undefined}
          onRename={() => undefined}
          onDuplicate={() => undefined}
          onDelete={() => undefined}
        />,
      );
    });
  }

  it("Part 2 — shows the calm empty state when there are no saved creations", () => {
    render();
    const empty = container.querySelector(
      "[data-testid='create-find-previous-work-empty']",
    );
    expect(empty?.textContent).toBe("Your saved creations will appear here.");
  });

  it("Part 2 — shows only Recent when nothing is older than 7 days", () => {
    seedLibrary([seedDraft("recent-1", "Client Welcome Email", new Date().toISOString())]);
    render();
    expect(
      container.querySelector("[data-testid='create-previous-work-recent']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='create-previous-work-older']"),
    ).toBeNull();
    expect(container.textContent).toContain("Client Welcome Email");
  });

  it("Part 2 — shows only Older Work when nothing is recent", () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    seedLibrary([seedDraft("old-1", "Spring Newsletter Draft", old)]);
    render();
    expect(
      container.querySelector("[data-testid='create-previous-work-recent']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='create-previous-work-older']"),
    ).toBeTruthy();
    expect(container.textContent).toContain("Spring Newsletter Draft");
  });

  it("Part 2 — shows both sections split correctly when mixed", () => {
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    seedLibrary([
      seedDraft("recent-1", "This Week's Follow-Up", new Date().toISOString()),
      seedDraft("old-1", "Last Quarter Proposal", old),
    ]);
    render();
    expect(
      container.querySelector("[data-testid='create-previous-work-recent']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='create-previous-work-older']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='create-find-previous-work-empty']"),
    ).toBeNull();
  });
});

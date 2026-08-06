/**
 * Spec 133 → Create Simplification & Category Evaluation.
 * Explore Ideas (single collapsed discovery surface) was superseded by two
 * clearly separate optional sections: Find Previous Work and Browse More.
 * This certifies the entrance no longer offers a single dense discovery
 * surface and instead keeps the default screen calm (Parts 1–4).
 *
 * Conversational Create Entrance (2026-08-06) — Browse Categories /
 * CreateBrowseCategoriesPanel is no longer wired into the entrance at all
 * (superseded by the single conversation); CreateBrowseCategoriesPanel.tsx
 * itself is untouched and still certified independently below. The
 * confirm gate and hierarchy assertions are updated to the new entrance
 * shape; every other invariant here is unchanged.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING } from "./copy";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Create Simplification — Find Previous Work + Browse More replace Explore Ideas", () => {
  it("entrance no longer wires the old single Explore Ideas surface, or Browse Categories", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).not.toContain("CreateExploreIdeasPanel");
    expect(panel).not.toContain('data-testid="create-estate-explore-ideas"');
    expect(panel).toContain("create-estate-find-previous-work");
    // Conversational Create Entrance (2026-08-06) — Browse Categories was
    // removed entirely, not nested elsewhere.
    expect(panel).not.toContain("CreateBrowseCategoriesPanel");
    expect(panel).not.toContain("create-estate-browse-categories");
    expect(panel).not.toContain("create-estate-guided-frameworks");
    expect(panel).not.toContain("UniversalBlueprintInterface");
    expect(panel).not.toContain("CreateCatalogPicker");
    expect(panel).not.toContain("create-estate-blueprint-marketing");
    expect(panel).not.toMatch(/aria-pressed=\{blueprintWorkTypeId/);
    expect(CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING).toBe(
      "Find Previous Work",
    );
  });

  it("Browse Categories (standalone component, not entrance-wired) opens curated categories, not a full catalog dump", () => {
    const browse = read(
      "components/companion/CreateBrowseCategoriesPanel.tsx",
    );
    expect(browse).toContain("create-browse-category-cards");
    expect(browse).toContain("create-browse-parent-cards");
    expect(browse).toContain("create-browse-subtypes");
    expect(browse).toContain("onRequestCreate");
  });

  it("Find Previous Work is collapsed by default, a distinct section from the conversation", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const composerAt = panel.indexOf('data-testid="create-estate-composer"');
    const prevAt = panel.indexOf('data-testid="create-estate-find-previous-work"');
    expect(composerAt).toBeGreaterThan(-1);
    expect(prevAt).toBeGreaterThan(composerAt);
    const findPrevious = read(
      "components/companion/CreateFindPreviousWorkPanel.tsx",
    );
    expect(findPrevious).toContain("CreateDraftResumeList");
  });

  it("preserves 130/131 confirm gate — now reached through the conversation, not a catalog click", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).toContain("resolveCreateBeginOutcome");
    expect(panel).toContain("confirmCreateBeginToOpen");
  });

  it("hierarchy on entrance: Continue → composer (conversation) → Find Previous Work", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const continueAt = panel.indexOf('data-testid="create-estate-continue"');
    const startAt = panel.indexOf('data-testid="create-estate-composer"');
    // lastIndexOf — the import statement mentions the component name too;
    // the JSX usage (what actually renders) is what hierarchy is about.
    const conversationAt = panel.lastIndexOf("CreateEntryConversationPanel");
    const prevAt = panel.indexOf('data-testid="create-estate-find-previous-work"');
    expect(continueAt).toBeGreaterThan(-1);
    expect(startAt).toBeGreaterThan(continueAt);
    expect(conversationAt).toBeGreaterThan(startAt);
    expect(prevAt).toBeGreaterThan(conversationAt);
  });
});

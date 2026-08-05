/**
 * Spec 133 → Create Simplification & Category Evaluation.
 * Explore Ideas (single collapsed discovery surface) was superseded by two
 * clearly separate optional sections: Find Previous Work and Browse More.
 * This certifies the entrance no longer offers a single dense discovery
 * surface and instead keeps the default screen calm (Parts 1–4).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CREATE_ESTATE_BROWSE_CATEGORIES_HEADING,
  CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING,
} from "./copy";
import { SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS } from "@/lib/sparkCreateIntentConstitution/types";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Create Simplification — Find Previous Work + Browse More replace Explore Ideas", () => {
  it("entrance no longer wires the old single Explore Ideas surface", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).not.toContain("CreateExploreIdeasPanel");
    expect(panel).not.toContain('data-testid="create-estate-explore-ideas"');
    expect(panel).toContain("create-estate-find-previous-work");
    // Entrance Cleanup (2026-08) — renamed from "Browse More", now the
    // single category-picker mount nested in Start With Guidance.
    expect(panel).toContain("create-estate-browse-categories");
    expect(panel).not.toContain("create-estate-guided-frameworks");
    expect(panel).not.toContain("UniversalBlueprintInterface");
    expect(panel).not.toContain("CreateCatalogPicker");
    expect(panel).not.toContain("create-estate-blueprint-marketing");
    expect(panel).not.toMatch(/aria-pressed=\{blueprintWorkTypeId/);
    expect(CREATE_ESTATE_BROWSE_CATEGORIES_HEADING).toBe("Browse Categories");
    expect(CREATE_ESTATE_FIND_PREVIOUS_WORK_HEADING).toBe(
      "Find Previous Work",
    );
  });

  it("Browse More opens curated categories, not a full catalog dump", () => {
    const browse = read(
      "components/companion/CreateBrowseCategoriesPanel.tsx",
    );
    expect(browse).toContain("create-browse-category-cards");
    expect(browse).toContain("create-browse-parent-cards");
    expect(browse).toContain("create-browse-subtypes");
    expect(browse).toContain("onRequestCreate");
  });

  it("Find Previous Work is a distinct section from Browse Categories", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const prevAt = panel.indexOf('data-testid="create-estate-find-previous-work"');
    // Entrance Cleanup (2026-08) — Browse Categories now nests inside the
    // composer section (under Start With Guidance), ahead of Find Previous
    // Work, instead of following it as a separate page section.
    const browseAt = panel.indexOf(
      'data-testid="create-estate-browse-categories"',
    );
    expect(prevAt).toBeGreaterThan(-1);
    expect(browseAt).toBeGreaterThan(-1);
    expect(prevAt).toBeGreaterThan(browseAt);
    const findPrevious = read(
      "components/companion/CreateFindPreviousWorkPanel.tsx",
    );
    expect(findPrevious).toContain("CreateDraftResumeList");
  });

  it("preserves 130/131 confirm gate from every discovery path", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).toContain("requestCatalogConfirm");
    expect(panel).toContain("onRequestCreate={requestCatalogConfirm}");
    expect(panel).toContain("resolveCatalogCreateConfirm");
    expect(panel).toContain("confirmCreateBeginToOpen");
    expect(panel).toContain("data-max-decision-layers=");
    expect(SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS).toBe(3);
  });

  it("hierarchy on entrance: Continue → composer (with nested Browse Categories) → Find Previous Work", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const continueAt = panel.indexOf('data-testid="create-estate-continue"');
    const startAt = panel.indexOf('data-testid="create-estate-composer"');
    const browseAt = panel.indexOf(
      'data-testid="create-estate-browse-categories"',
    );
    const prevAt = panel.indexOf('data-testid="create-estate-find-previous-work"');
    expect(continueAt).toBeGreaterThan(-1);
    expect(startAt).toBeGreaterThan(continueAt);
    expect(browseAt).toBeGreaterThan(startAt);
    expect(prevAt).toBeGreaterThan(browseAt);
  });
});

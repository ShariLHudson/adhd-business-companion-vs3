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
  CREATE_ESTATE_BROWSE_MORE_HEADING,
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
    expect(panel).toContain("create-estate-browse-more");
    expect(panel).not.toContain("create-estate-guided-frameworks");
    expect(panel).not.toContain("UniversalBlueprintInterface");
    expect(panel).not.toContain("CreateCatalogPicker");
    expect(panel).not.toContain("create-estate-blueprint-marketing");
    expect(panel).not.toMatch(/aria-pressed=\{blueprintWorkTypeId/);
    expect(CREATE_ESTATE_BROWSE_MORE_HEADING).toBe("Browse More");
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

  it("Find Previous Work is a distinct section from Browse More", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const prevAt = panel.indexOf('data-testid="create-estate-find-previous-work"');
    const browseAt = panel.indexOf('data-testid="create-estate-browse-more"');
    expect(prevAt).toBeGreaterThan(-1);
    expect(browseAt).toBeGreaterThan(prevAt);
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

  it("hierarchy on entrance: Continue → composer → Find Previous Work → Browse More", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const continueAt = panel.indexOf('data-testid="create-estate-continue"');
    const startAt = panel.indexOf('data-testid="create-estate-composer"');
    const prevAt = panel.indexOf('data-testid="create-estate-find-previous-work"');
    const browseAt = panel.indexOf('data-testid="create-estate-browse-more"');
    expect(continueAt).toBeGreaterThan(-1);
    expect(startAt).toBeGreaterThan(continueAt);
    expect(prevAt).toBeGreaterThan(startAt);
    expect(browseAt).toBeGreaterThan(prevAt);
  });
});

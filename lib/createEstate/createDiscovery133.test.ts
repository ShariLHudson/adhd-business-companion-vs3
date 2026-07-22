/**
 * Spec 133 — Create Discovery Experience Redesign certification (entrance wiring).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CREATE_ESTATE_EXPLORE_IDEAS_HEADING,
  CREATE_ESTATE_MORE_WAYS_HEADING,
  CREATE_ESTATE_CONTINUE_SOMETHING_HEADING,
  CREATE_ESTATE_INSPIRATION_HEADING,
  CREATE_ESTATE_CATEGORIES_HEADING,
  CREATE_ESTATE_RECOMMENDED_HEADING,
} from "./copy";
import { SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS } from "@/lib/sparkCreateIntentConstitution/types";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Spec 133 — Create Explore Ideas discovery", () => {
  it("replaces More Ways to Start with Explore Ideas on entrance", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-explore-ideas");
    expect(panel).toContain("CreateExploreIdeasPanel");
    expect(panel).toContain("CREATE_ESTATE_EXPLORE_IDEAS_HEADING");
    expect(panel).not.toContain("create-estate-guided-frameworks");
    expect(panel).not.toContain("UniversalBlueprintInterface");
    expect(panel).not.toContain("CreateCatalogPicker");
    expect(panel).not.toContain("create-estate-blueprint-marketing");
    expect(panel).not.toMatch(/aria-pressed=\{blueprintWorkTypeId/);
    expect(CREATE_ESTATE_EXPLORE_IDEAS_HEADING).toBe("Explore Ideas");
    expect(CREATE_ESTATE_MORE_WAYS_HEADING).toBe("Explore Ideas");
  });

  it("Explore Ideas body has continue → search → recommended → categories", () => {
    const explore = read("components/companion/CreateExploreIdeasPanel.tsx");
    const continueAt = explore.indexOf(
      'data-testid="create-explore-continue-something"',
    );
    const searchAt = explore.indexOf('data-testid="create-explore-inspiration"');
    const recommendedAt = explore.indexOf(
      'data-testid="create-explore-recommended"',
    );
    const categoriesAt = explore.indexOf(
      'data-testid="create-explore-categories"',
    );
    expect(continueAt).toBeGreaterThan(-1);
    expect(searchAt).toBeGreaterThan(continueAt);
    expect(recommendedAt).toBeGreaterThan(searchAt);
    expect(categoriesAt).toBeGreaterThan(recommendedAt);
    expect(explore).toContain("create-estate-previous-work");
    expect(explore).toContain("create-explore-search");
    expect(explore).toContain("create-explore-category-cards");
    expect(explore).toContain("create-explore-idea-preview");
    expect(explore).toContain("onRequestCreate");
    expect(CREATE_ESTATE_CONTINUE_SOMETHING_HEADING).toBe("Continue Something");
    expect(CREATE_ESTATE_INSPIRATION_HEADING).toBe("I Need Inspiration");
    expect(CREATE_ESTATE_RECOMMENDED_HEADING).toBe("Recommended For Me");
    expect(CREATE_ESTATE_CATEGORIES_HEADING).toBe("Show Me Categories");
  });

  it("preserves 130/131 confirm gate from Explore Create", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    expect(panel).toContain("create-estate-intent-confirm");
    expect(panel).toContain("requestCatalogConfirm");
    expect(panel).toContain("onRequestCreate={requestCatalogConfirm}");
    expect(panel).toContain("resolveCatalogCreateConfirm");
    expect(panel).toContain("confirmCreateBeginToOpen");
    expect(panel).toContain("data-max-decision-layers=");
    expect(SPARK_CREATE_MORE_WAYS_MAX_DECISION_LAYERS).toBe(3);
  });

  it("explained source chips — not bare Spark / Company / Personal", () => {
    const explore = read("components/companion/CreateExploreIdeasPanel.tsx");
    const types = read("lib/createEstate/exploreIdeas/types.ts");
    expect(explore).toContain("EXPLORE_IDEA_SOURCE_CHIPS");
    expect(types).toContain("Spark Recommended");
    expect(types).toContain("Built by Spark Estate");
    expect(types).toContain("Created by your organization");
    expect(types).toContain("Created by you");
    expect(types).toContain("Used recently");
    expect(explore).not.toMatch(/aria-label="Structure source"/);
  });

  it("Previous Work stays near top of Continue Something (not buried)", () => {
    const explore = read("components/companion/CreateExploreIdeasPanel.tsx");
    const continueAt = explore.indexOf("create-explore-continue-something");
    const previousAt = explore.indexOf("create-estate-previous-work");
    const categoriesAt = explore.indexOf("create-explore-categories");
    expect(previousAt).toBeGreaterThan(continueAt);
    expect(previousAt).toBeLessThan(categoriesAt);
  });

  it("hierarchy on entrance: Continue → Start New → Explore Ideas", () => {
    const panel = read("components/companion/CreateEstateEntrancePanel.tsx");
    const continueAt = panel.indexOf('data-testid="create-estate-continue"');
    const startAt = panel.indexOf('data-testid="create-estate-composer"');
    const exploreAt = panel.indexOf('data-testid="create-estate-explore-ideas"');
    expect(continueAt).toBeGreaterThan(-1);
    expect(startAt).toBeGreaterThan(continueAt);
    expect(exploreAt).toBeGreaterThan(startAt);
  });
});

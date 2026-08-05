/**
 * Phase 1 (2026-08-05) — Version 1 priority builds added to the registry.
 * Proves: categories load correctly, category -> subcategory -> build
 * relationships work, and registry items resolve into the existing Create
 * confirm shape without changing that shape's contract.
 */
import { describe, expect, it } from "vitest";
import {
  CREATE_REGISTRY_CATEGORIES,
  CREATE_REGISTRY_CATEGORY_IDS,
} from "../categories";
import {
  CREATE_REGISTRY_SUBCATEGORIES,
  subcategoriesForCategory,
} from "../subcategories";
import {
  V1_PRIORITY_REGISTRY_IDS,
  V1_PRIORITY_REGISTRY_ITEMS,
} from "../items.v1Priority.seed";
import { CREATION_REGISTRY_SEED_ITEMS } from "../items.seed";
import { computeIsUserVisible } from "../visibility";
import { validateCreationRegistry } from "../validation";
import { itemsForCategory, itemsForSubcategory, buildTreeForCategory } from "../lookup";
import { registryItemToConfirmShape } from "../confirmAdapter";
import { listCreationRegistryItems, getCreationRegistryItem } from "../index";

describe("1. Registry categories load correctly", () => {
  it("still exactly the 9 approved categories, in approved order", () => {
    expect(CREATE_REGISTRY_CATEGORY_IDS).toEqual([
      "write_communicate",
      "market_grow",
      "sell_convert",
      "work_with_clients",
      "plan_an_experience",
      "build_run_the_business",
      "organize_knowledge",
      "develop_ideas",
      "personal_community",
    ]);
    const bySortOrder = [...CREATE_REGISTRY_CATEGORIES].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    expect(bySortOrder.map((c) => c.id)).toEqual(CREATE_REGISTRY_CATEGORY_IDS);
  });
});

describe("2. Category -> Subcategory relationships work", () => {
  it("every new subcategory belongs to the category it claims", () => {
    for (const sub of CREATE_REGISTRY_SUBCATEGORIES) {
      expect(CREATE_REGISTRY_CATEGORY_IDS).toContain(sub.categoryId);
    }
  });

  it("subcategoriesForCategory finds the new subcategories under the right categories", () => {
    expect(
      subcategoriesForCategory("write_communicate").map((s) => s.id),
    ).toContain("everyday_business_communication");
    expect(subcategoriesForCategory("sell_convert").map((s) => s.id)).toEqual(
      expect.arrayContaining(["offers_and_packaging", "sales_materials"]),
    );
    expect(
      subcategoriesForCategory("work_with_clients").map((s) => s.id),
    ).toContain("beginning_the_relationship");
    expect(
      subcategoriesForCategory("plan_an_experience").map((s) => s.id),
    ).toEqual(expect.arrayContaining(["events", "workshops_learning"]));
    expect(
      subcategoriesForCategory("build_run_the_business").map((s) => s.id),
    ).toEqual(
      expect.arrayContaining(["strategy_and_direction", "operations_and_systems"]),
    );
  });
});

describe("3. Subcategory -> Build relationships work", () => {
  it("itemsForSubcategory returns the right V1 priority build for each new subcategory", () => {
    const all = listCreationRegistryItems();
    expect(
      itemsForSubcategory("everyday_business_communication", all).map((i) => i.id),
    ).toContain("email");
    expect(
      itemsForSubcategory("operations_and_systems", all).map((i) => i.id),
    ).toEqual(expect.arrayContaining(["sop", "checklist"]));
    expect(
      itemsForSubcategory("offers_and_packaging", all).map((i) => i.id),
    ).toContain("offer");
    expect(
      itemsForSubcategory("sales_materials", all).map((i) => i.id),
    ).toContain("proposal");
    expect(
      itemsForSubcategory("beginning_the_relationship", all).map((i) => i.id),
    ).toContain("client_onboarding");
    expect(
      itemsForSubcategory("workshops_learning", all).map((i) => i.id),
    ).toContain("workshop");
  });

  it("itemsForCategory rolls up all builds under a category", () => {
    const all = listCreationRegistryItems();
    const sellConvertIds = itemsForCategory("sell_convert", all).map((i) => i.id);
    expect(sellConvertIds).toEqual(expect.arrayContaining(["offer", "proposal"]));
  });

  it("buildTreeForCategory produces the full Category -> Subcategory -> Build tree", () => {
    const all = listCreationRegistryItems();
    const tree = buildTreeForCategory("sell_convert", all);
    expect(tree.categoryId).toBe("sell_convert");
    const offersGroup = tree.subcategories.find(
      (s) => s.subcategory.id === "offers_and_packaging",
    );
    expect(offersGroup?.items.map((i) => i.id)).toContain("offer");
  });
});

describe("Version 1 priority items — structural integrity", () => {
  it("exactly the 7 new ids, unique, matching the exported id list", () => {
    const ids = V1_PRIORITY_REGISTRY_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...V1_PRIORITY_REGISTRY_IDS]);
    expect(ids).toEqual([
      "sop",
      "checklist",
      "email",
      "proposal",
      "offer",
      "client_onboarding",
      "workshop",
    ]);
  });

  it("all 7 pass structural validation when validated alongside the guided seeds", () => {
    // Workshop's parentCreationId/relatedCreationIds reference event_plan,
    // which lives in the OTHER seed array — validate the merged list so
    // that cross-reference resolves, matching how listCreationRegistryItems()
    // actually assembles the full registry.
    const merged = [...CREATION_REGISTRY_SEED_ITEMS, ...V1_PRIORITY_REGISTRY_ITEMS];
    const result = validateCreationRegistry(merged);
    expect(result).toEqual({ ok: true, issues: [] });
  });

  it("stay hidden — needs-audit, all verification flags false, computeIsUserVisible false", () => {
    for (const item of V1_PRIORITY_REGISTRY_ITEMS) {
      expect(item.lifecycleStatus).toBe("needs-audit");
      expect(item.lifecycleStatus).not.toBe("ready");
      expect(item.routeVerified).toBe(false);
      expect(item.saveVerified).toBe(false);
      expect(item.reopenVerified).toBe(false);
      expect(item.requiredActionsVerified).toBe(false);
      expect(computeIsUserVisible(item)).toBe(false);
    }
  });

  it("workshop shares event_plan's execution identity, not a competing work type", () => {
    const workshop = V1_PRIORITY_REGISTRY_ITEMS.find((i) => i.id === "workshop")!;
    expect(workshop.parentCreationId).toBe("event_plan");
    expect(workshop.builderType).toBe("multi-asset-workspace");
    expect(workshop.route).toBe("create/uwe/event_plan");
    // Deliberately does not claim the "Workshop" legacy catalog label —
    // event_plan already owns that dual-read mapping.
    expect(workshop.legacyCatalogLabels).toBeUndefined();
    expect(workshop.legacyParentTypeId).toBeUndefined();
  });

  it("4 existing guided seeds are untouched — still exactly 4, unchanged ids", () => {
    // Regression guard matching seedIntegrity.test.ts's own assertion, so a
    // future edit to items.seed.ts (not this Phase) trips both suites.
    expect(CREATION_REGISTRY_SEED_ITEMS).toHaveLength(4);
    expect(CREATION_REGISTRY_SEED_ITEMS.map((i) => i.id)).toEqual([
      "event_plan",
      "marketing_plan",
      "business_plan",
      "facebook_community",
    ]);
  });

  it("merged registry surface is 11 items (4 guided + 7 V1 priority)", () => {
    expect(listCreationRegistryItems()).toHaveLength(11);
  });

  it("getCreationRegistryItem finds items from either seed array", () => {
    expect(getCreationRegistryItem("event_plan")?.id).toBe("event_plan");
    expect(getCreationRegistryItem("sop")?.id).toBe("sop");
    expect(getCreationRegistryItem("does-not-exist")).toBeUndefined();
  });
});

describe("4. Registry items resolve into the existing Create confirm shape", () => {
  it("registryItemToConfirmShape produces the exact CreateCatalogItem contract", () => {
    const sop = V1_PRIORITY_REGISTRY_ITEMS.find((i) => i.id === "sop")!;
    const shape = registryItemToConfirmShape(sop);
    expect(shape).toEqual({
      label: "SOP",
      emoji: "📋",
      matchTerms: ["sop", "standard operating procedure", "procedure", "workflow doc"],
    });
    // route is intentionally absent — CreateCatalogItem.route is a distinct
    // AppSection concept, not the registry's descriptive execution path.
    expect(shape.route).toBeUndefined();
  });

  it("falls back to a default emoji for registry items that don't set one", () => {
    const eventPlan = CREATION_REGISTRY_SEED_ITEMS.find((i) => i.id === "event_plan")!;
    expect(eventPlan.emoji).toBeUndefined();
    const shape = registryItemToConfirmShape(eventPlan);
    expect(shape.emoji).toBeTruthy();
    expect(typeof shape.emoji).toBe("string");
  });

  it("every V1 priority item resolves to a valid, non-empty confirm shape", () => {
    for (const item of V1_PRIORITY_REGISTRY_ITEMS) {
      const shape = registryItemToConfirmShape(item);
      expect(shape.label.trim().length).toBeGreaterThan(0);
      expect(shape.emoji.trim().length).toBeGreaterThan(0);
      expect(shape.matchTerms?.length).toBeGreaterThan(0);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  CREATE_PARENT_TYPES,
  type CreateParentType,
} from "@/lib/createEstate/createParentTypes";
import type { CreateCatalogItem } from "@/lib/createCatalogData";
import {
  findRegistryItemByLegacyLabel,
  registryItemFromCatalogItem,
  registryItemFromParentType,
} from "../adapters";
import { CREATE_REGISTRY_CATEGORY_IDS } from "../categories";
import {
  CREATION_REGISTRY_SEED_ITEMS,
  GUIDED_CREATION_REGISTRY_IDS,
} from "../items.seed";
import { getCreateRegistrySubcategory } from "../subcategories";
import { computeIsUserVisible } from "../visibility";
import { validateCreationRegistry } from "../validation";

describe("creation registry seed integrity", () => {
  it("seed IDs are unique and match guided runtime ids", () => {
    const ids = CREATION_REGISTRY_SEED_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...GUIDED_CREATION_REGISTRY_IDS]);
  });

  it("all seed category and subcategory references are valid", () => {
    for (const item of CREATION_REGISTRY_SEED_ITEMS) {
      expect(CREATE_REGISTRY_CATEGORY_IDS).toContain(item.categoryId);
      const sub = getCreateRegistrySubcategory(item.subcategoryId);
      expect(sub).toBeDefined();
      expect(sub?.categoryId).toBe(item.categoryId);
    }
  });

  it("all seed records pass structural validation", () => {
    const result = validateCreationRegistry(CREATION_REGISTRY_SEED_ITEMS);
    expect(result).toEqual({ ok: true, issues: [] });
  });

  it("four seeds remain hidden under the current unverified state", () => {
    expect(CREATION_REGISTRY_SEED_ITEMS).toHaveLength(4);
    for (const item of CREATION_REGISTRY_SEED_ITEMS) {
      expect(item.lifecycleStatus).toBe("testing");
      expect(item.lifecycleStatus).not.toBe("ready");
      expect(item.routeVerified).toBe(false);
      expect(item.saveVerified).toBe(false);
      expect(item.reopenVerified).toBe(false);
      expect(item.requiredActionsVerified).toBe(false);
      expect(computeIsUserVisible(item)).toBe(false);
    }
  });

  it("legacy labels resolve to seeds without inventing readiness", () => {
    expect(findRegistryItemByLegacyLabel("Event Plan")?.id).toBe("event_plan");
    expect(findRegistryItemByLegacyLabel("Marketing Plan")?.id).toBe(
      "marketing_plan",
    );
    expect(findRegistryItemByLegacyLabel("Business Plan")?.id).toBe(
      "business_plan",
    );
    expect(findRegistryItemByLegacyLabel("Facebook Community")?.id).toBe(
      "facebook_community",
    );
  });

  it("adapters do not convert legacy launchability into readiness", () => {
    const parents = CREATE_PARENT_TYPES.filter((p) =>
      ["event", "marketing-plan", "business-plan", "facebook-community"].includes(
        p.id,
      ),
    );
    expect(parents.length).toBe(4);

    for (const parent of parents) {
      const item = registryItemFromParentType(parent);
      expect(item.lifecycleStatus).not.toBe("ready");
      expect(computeIsUserVisible(item)).toBe(false);
      expect(item.routeVerified).toBe(false);
      expect(item.saveVerified).toBe(false);
    }

    const launchableCatalog: CreateCatalogItem = {
      label: "Offer",
      emoji: "🎁",
      matchTerms: ["offer"],
    };
    const provisional = registryItemFromCatalogItem(launchableCatalog);
    expect(provisional.id.startsWith("legacy_catalog_")).toBe(true);
    expect(provisional.lifecycleStatus).toBe("needs-audit");
    expect(computeIsUserVisible(provisional)).toBe(false);

    const unknownParent: CreateParentType = {
      id: "made-up-launchable",
      label: "Made Up Launchable",
      emoji: "✨",
      categoryId: "market_sell",
      hint: "Appears launchable in legacy UI",
      catalogLabels: ["Made Up Launchable"],
    };
    const fromUnknown = registryItemFromParentType(unknownParent);
    expect(fromUnknown.lifecycleStatus).toBe("needs-audit");
    expect(computeIsUserVisible(fromUnknown)).toBe(false);
  });
});

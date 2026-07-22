/**
 * Create Simplification & Category Evaluation — Parts 4, 6, 7 consolidation.
 */

import { describe, expect, it } from "vitest";
import { findCatalogItem } from "@/lib/createCatalog";
import { CREATE_OPTION_AUDIT } from "./createOptionAudit";
import {
  browseCategoryById,
  catalogItemForSubtype,
  CREATE_BROWSE_CATEGORIES,
  CREATE_PARENT_TYPES,
  defaultCatalogItemForParentType,
  parentTypeForCatalogLabel,
  parentTypesForCategory,
} from "./createParentTypes";

describe("Part 4 — Browse More categories", () => {
  it("has exactly the seven recommended top-level categories in order", () => {
    expect(CREATE_BROWSE_CATEGORIES.map((c) => c.label)).toEqual([
      "Write & Communicate",
      "Market & Sell",
      "Work With Clients",
      "Plan Something",
      "Build the Business",
      "Organize Information",
      "Personal",
    ]);
  });

  it("every category has a short calm hint, not a long explanation", () => {
    for (const category of CREATE_BROWSE_CATEGORIES) {
      expect(category.hint.length).toBeLessThan(80);
    }
  });

  it("looks up a category by id", () => {
    expect(browseCategoryById("market_sell")?.label).toBe("Market & Sell");
  });
});

describe("Parts 6/7 — consolidated parent creation types", () => {
  it("every parent type belongs to one of the seven categories", () => {
    const ids = new Set(CREATE_BROWSE_CATEGORIES.map((c) => c.id));
    for (const parent of CREATE_PARENT_TYPES) {
      expect(ids.has(parent.categoryId)).toBe(true);
    }
  });

  it("every catalogLabels entry maps to a real catalog item (Part 14 preservation)", () => {
    for (const parent of CREATE_PARENT_TYPES) {
      for (const label of parent.catalogLabels) {
        expect(findCatalogItem(label)).toBeTruthy();
      }
    }
  });

  it("every subtype resolves to a real catalog item", () => {
    for (const parent of CREATE_PARENT_TYPES) {
      for (const subtype of parent.subtypes ?? []) {
        expect(findCatalogItem(subtype.catalogLabel)).toBeTruthy();
      }
    }
  });

  it("every audit row that keeps + names a newParentType has a matching parent type", () => {
    const byLabel = new Map(CREATE_PARENT_TYPES.map((p) => [p.label, p]));
    for (const row of CREATE_OPTION_AUDIT) {
      if (!row.keep || !row.newParentType) continue;
      const parent = byLabel.get(row.newParentType);
      expect(parent, `missing parent type for ${row.currentName}`).toBeTruthy();
      expect(
        parent!.catalogLabels.map((l) => l.toLowerCase()),
      ).toContain(row.currentName.toLowerCase());
    }
  });

  it("Email parent type asks one guided question with Part 6 example subtypes", () => {
    const email = CREATE_PARENT_TYPES.find((p) => p.id === "email")!;
    expect(email.subtypeQuestion).toMatch(/what kind of email/i);
    const labels = email.subtypes!.map((s) => s.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "Follow-up",
        "Introduction",
        "Request",
        "Thank-you",
        "Sales",
        "Reminder",
        "Difficult message",
        "Other",
      ]),
    );
  });

  it("Event parent type preserves Workshop's own guided flow as a subtype", () => {
    const event = CREATE_PARENT_TYPES.find((p) => p.id === "event")!;
    const workshop = event.subtypes!.find((s) => s.id === "workshop");
    expect(workshop?.catalogLabel).toBe("Workshop");
    expect(catalogItemForSubtype(event, "workshop")?.label).toBe("Workshop");
  });

  it("Social Content merges platform variants under one parent", () => {
    const social = parentTypeForCatalogLabel("Facebook Post");
    expect(social?.id).toBe("social-content");
    expect(social?.catalogLabels).toEqual(
      expect.arrayContaining(["Social Post", "Facebook Post", "LinkedIn Post"]),
    );
  });

  it("returns the curated parent-type list for a category (not the full catalog)", () => {
    const writeCommunicate = parentTypesForCategory("write_communicate");
    expect(writeCommunicate.length).toBeGreaterThan(0);
    expect(writeCommunicate.length).toBeLessThan(10);
    expect(writeCommunicate.every((p) => p.categoryId === "write_communicate")).toBe(
      true,
    );
  });

  it("Personal category is honestly empty today (no fabricated cards)", () => {
    expect(parentTypesForCategory("personal")).toEqual([]);
  });

  it("default catalog item resolves for every parent type", () => {
    for (const parent of CREATE_PARENT_TYPES) {
      expect(defaultCatalogItemForParentType(parent)).toBeTruthy();
    }
  });
});

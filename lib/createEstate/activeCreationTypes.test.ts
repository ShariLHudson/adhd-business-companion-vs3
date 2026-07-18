import { describe, expect, it } from "vitest";
import {
  isActiveCreationCatalogItem,
  listActiveCreationPickerCatalog,
  listActiveCreationTypes,
  resolveActiveCreationLabel,
} from "./activeCreationTypes";

describe("activeCreationTypes", () => {
  it("hides routed, Strategy Library, and DEFAULT-only items from Create picker", () => {
    expect(
      isActiveCreationCatalogItem({
        label: "People I Help",
        emoji: "👥",
        route: "client-avatars",
      }),
    ).toBe(false);
    expect(
      isActiveCreationCatalogItem({ label: "Email", emoji: "✉️" }),
    ).toBe(true);
    expect(
      isActiveCreationCatalogItem({
        label: "Business Strategy",
        emoji: "🏢",
      }),
    ).toBe(false);
    expect(
      isActiveCreationCatalogItem({ label: "Automation", emoji: "🔄" }),
    ).toBe(false);
  });

  it("sorts categories and items alphabetically", () => {
    const catalog = listActiveCreationPickerCatalog();
    const cats = catalog.map((c) => c.label);
    expect([...cats].sort((a, b) => a.localeCompare(b))).toEqual(cats);
    for (const cat of catalog) {
      const items = cat.items.map((i) => i.label);
      expect([...items].sort((a, b) => a.localeCompare(b))).toEqual(items);
    }
  });

  it("every visible type has workflow + save path", () => {
    const types = listActiveCreationTypes();
    expect(types.length).toBeGreaterThan(10);
    for (const t of types) {
      expect(t.workflowId).toMatch(/^create-workflow:/);
      expect(t.supportsSave).toBe(true);
      expect(t.status).toBe("active");
    }
  });

  it("resolves launcher labels to catalog types", () => {
    expect(resolveActiveCreationLabel("Social Media Post")).toBe("Social Post");
    expect(resolveActiveCreationLabel("Email")).toBe("Email");
  });
});

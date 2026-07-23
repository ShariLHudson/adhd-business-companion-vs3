import { describe, expect, it } from "vitest";
import { CREATION_REGISTRY_SEED_ITEMS } from "../items.seed";
import type { CreationRegistryItem } from "../types";
import {
  validateClaimedUserVisible,
  validateCreationRegistry,
} from "../validation";

function cloneSeed(overrides: Partial<CreationRegistryItem> = {}): CreationRegistryItem {
  return {
    ...CREATION_REGISTRY_SEED_ITEMS[0]!,
    ...overrides,
  };
}

describe("validateCreationRegistry", () => {
  it("all seed records pass structural validation", () => {
    const result = validateCreationRegistry(CREATION_REGISTRY_SEED_ITEMS);
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("detects duplicate registry IDs", () => {
    const result = validateCreationRegistry([
      cloneSeed({ id: "event_plan" }),
      cloneSeed({ id: "event_plan", name: "Dup" }),
    ]);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "duplicate_id")).toBe(true);
  });

  it("detects invalid category IDs", () => {
    const result = validateCreationRegistry([
      cloneSeed({ id: "x", categoryId: "not_a_category" }),
    ]);
    expect(result.issues.some((i) => i.code === "invalid_category")).toBe(true);
  });

  it("detects invalid subcategory IDs", () => {
    const result = validateCreationRegistry([
      cloneSeed({ id: "x", subcategoryId: "nope" }),
    ]);
    expect(result.issues.some((i) => i.code === "invalid_subcategory")).toBe(
      true,
    );
  });

  it("detects missing parent references", () => {
    const result = validateCreationRegistry([
      cloneSeed({ id: "child", parentCreationId: "missing_parent" }),
    ]);
    expect(result.issues.some((i) => i.code === "missing_parent")).toBe(true);
  });

  it("detects missing subtype references", () => {
    const result = validateCreationRegistry([
      cloneSeed({ id: "parent", subtypeIds: ["missing_subtype"] }),
    ]);
    expect(result.issues.some((i) => i.code === "missing_subtype")).toBe(true);
  });

  it("detects missing related creation references", () => {
    const result = validateCreationRegistry([
      cloneSeed({ id: "a", relatedCreationIds: ["ghost"] }),
    ]);
    expect(result.issues.some((i) => i.code === "missing_related")).toBe(true);
  });

  it("detects ready items lacking required verification", () => {
    const result = validateCreationRegistry([
      cloneSeed({
        id: "almost",
        lifecycleStatus: "ready",
        routeVerified: true,
        saveVerified: true,
        reopenVerified: true,
        requiredActionsVerified: false,
      }),
    ]);
    expect(
      result.issues.some((i) => i.code === "ready_missing_verification"),
    ).toBe(true);
  });

  it("detects audience-sensitive items missing audience rules", () => {
    const result = validateCreationRegistry([
      cloneSeed({
        id: "aud",
        audienceSensitivity: "required",
        helpfulBusinessProfileFields: [],
        minimumContextQuestions: [],
      }),
    ]);
    expect(result.issues.some((i) => i.code === "audience_rules_missing")).toBe(
      true,
    );
  });

  it("detects unknown project template references when set", () => {
    const result = validateCreationRegistry([
      cloneSeed({
        id: "tmpl",
        defaultProjectTemplateId: "does-not-exist",
      }),
    ]);
    expect(
      result.issues.some((i) => i.code === "unknown_project_template"),
    ).toBe(true);
  });

  it("detects claimed-visible items that fail readiness", () => {
    const result = validateClaimedUserVisible(CREATION_REGISTRY_SEED_ITEMS, [
      "event_plan",
    ]);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "visible_fails_readiness")).toBe(
      true,
    );
  });
});

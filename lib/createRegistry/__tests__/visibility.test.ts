import { describe, expect, it } from "vitest";
import { CREATION_REGISTRY_SEED_ITEMS } from "../items.seed";
import type { CreationLifecycleStatus, CreationRegistryItem } from "../types";
import { computeIsUserVisible } from "../visibility";

const LIFECYCLES: CreationLifecycleStatus[] = [
  "inventory-only",
  "defined",
  "builder-needed",
  "in-development",
  "needs-audit",
  "testing",
  "ready",
  "paused",
  "retired",
];

function baseItem(
  overrides: Partial<CreationRegistryItem> = {},
): Pick<
  CreationRegistryItem,
  | "lifecycleStatus"
  | "routeVerified"
  | "saveVerified"
  | "reopenVerified"
  | "requiredActionsVerified"
> {
  return {
    lifecycleStatus: "needs-audit",
    routeVerified: false,
    saveVerified: false,
    reopenVerified: false,
    requiredActionsVerified: false,
    ...overrides,
  };
}

describe("computeIsUserVisible", () => {
  it("is false for every lifecycle state except ready (even with all flags true)", () => {
    for (const lifecycleStatus of LIFECYCLES) {
      const visible = computeIsUserVisible(
        baseItem({
          lifecycleStatus,
          routeVerified: true,
          saveVerified: true,
          reopenVerified: true,
          requiredActionsVerified: true,
        }),
      );
      if (lifecycleStatus === "ready") {
        expect(visible).toBe(true);
      } else {
        expect(visible).toBe(false);
      }
    }
  });

  it("ready is still false when one required verification flag is false", () => {
    const requiredKeys = [
      "routeVerified",
      "saveVerified",
      "reopenVerified",
      "requiredActionsVerified",
    ] as const;

    for (const key of requiredKeys) {
      const item = baseItem({
        lifecycleStatus: "ready",
        routeVerified: true,
        saveVerified: true,
        reopenVerified: true,
        requiredActionsVerified: true,
        [key]: false,
      });
      expect(computeIsUserVisible(item)).toBe(false);
    }
  });

  it("ready plus all required flags is true", () => {
    expect(
      computeIsUserVisible(
        baseItem({
          lifecycleStatus: "ready",
          routeVerified: true,
          saveVerified: true,
          reopenVerified: true,
          requiredActionsVerified: true,
        }),
      ),
    ).toBe(true);
  });

  it("print/export/project handoff are not required for visibility", () => {
    expect(
      computeIsUserVisible({
        lifecycleStatus: "ready",
        routeVerified: true,
        saveVerified: true,
        reopenVerified: true,
        requiredActionsVerified: true,
      }),
    ).toBe(true);
  });

  it("four guided seeds remain hidden under current unverified state", () => {
    for (const item of CREATION_REGISTRY_SEED_ITEMS) {
      expect(computeIsUserVisible(item)).toBe(false);
    }
  });
});
